"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo 科学白盒架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>对应精译: <a href="/llm-guide/14-models/14.4-olmo/01-olmo/01-olmo-jsbgjy">01-OLMo技术报告精译</a>
原文: Groeneveld et al., &quot;OLMo: Accelerating the Science of Language Models&quot;, arXiv:2402.00838 (2024)
分析范围: OLMo-1B 与 OLMo-7B (2024.02 发布)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-kysnq-efxnjsxs">1 设计动机: 科研使能器, 而非性能竞赛选手</h2>
<p>OLMo 的底层设计哲学与同期几乎所有开源模型都不同. 2024 年初, Llama 2,Mistral,Falcon 等模型在开放程度上各有侧重, 但有一个共同点: 它们的核心目标是发布一个「可用的好模型」. OLMo 则选择了一条截然不同的路——它要回答的问题不是「我能做出性能最好的模型吗?」, 而是「我能做出一个让研究社区完全理解其内部运作的模型吗?&quot;</p>
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
<p>译者注: 这种极端开放的代价是明确的. AI2 作为非营利机构, 没有商业竞争压力, 可以承受「竞争对手直接复制训练方案」的风险. 但对于绝大多数商业实验室来说, 这种级别的开放在经济上是不理性的——训练数据,中间Checkpoint和训练日志构成了模型竞争力的核心壁垒. OLMo 的开放策略因此具有不可复制的独特性: 它不是「商业开源」(open-washing), 而是「科学开源」.</p>
</blockquote>
<p>这一理念直接体现在 OLMo 的两大支柱设计上. 第一是<strong>数据开放</strong>: Dolma 数据集不仅公开了 2.7T token 的完整语料, 还公开了数据整理的完整流水线代码, 并且在发布中保持各数据来源的物理分离. 第二是<strong>过程开放</strong>: 超过 500 个中间Checkpoint(每 1000 步保存一个)和完整的训练日志(WandB metrics,loss curves,learning rate schedule)被一并发布.</p>
<blockquote>
<p>译者注: 中间Checkpoint的科研价值常被低估. 对于黑盒模型, 研究者只能看到「训练前」和「训练后」两个快照; 而 OLMo 提供了数百个中间状态, 使得以下研究成为可能: (1) 模型在什么时候「学会」某种能力? (2) 不同能力(如常识推理 vs 代码生成)的习得曲线是否同步? (3) 训练后期的 loss spike 是否与特定能力的退化相关?</p>
</blockquote>
<hr>
<h2 id="2-hxjg-wsgszjsj">2 核心架构: 务实跟随最佳实践</h2>
<p>OLMo 采用标准的 decoder-only Transformer 架构, 提供 1B 和 7B 两种规模. 其架构选择的核心原则是「跟随经过验证的最佳实践」, 而非追求原创创新.</p>
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
<td align="left">每头维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="center">128</td>
<td align="center">128</td>
</tr>
<tr>
<td align="left">FFN 中间维度</td>
<td align="center">~5504</td>
<td align="center">~11008</td>
</tr>
<tr>
<td align="left">词表大小 V</td>
<td align="center">50,304(实际 50,280 + 填充)</td>
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
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">4.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td align="left">权重共享</td>
<td align="center">是(embedding ↔ LM head)</td>
<td align="center">否</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: OLMo 模型架构与训练配置.</p>
</blockquote>
<h3 id="2-1-wpzjg">2.1 无偏置架构</h3>
<p>OLMo 从架构中移除了所有偏置项(bias), 包括线性层,Layer Norm 和注意力层中的偏置. 这一设计直接继承自 PaLM 和 LLaMA 家族. 移除偏置项的理论依据来自 PaLM 的观察: 在大规模训练中, 偏置项容易成为数值不稳定性的来源, 尤其是在使用混合精度(bfloat16)训练时, 偏置的梯度更新可能因为数值范围过小而下溢为零.</p>
<h3 id="2-2-fcsh-layer-norm-ygsjdxz">2.2 非参数化 Layer Norm: 一个少见的选择</h3>
<p>OLMo 使用 Layer Norm 的非参数化形式(non-parametric Layer Norm), 即不引入可学习的增益(gain)和偏置(bias)参数, 仅执行标准化操作:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>x</mi><mo>−</mo><mi>μ</mi></mrow><msqrt><mrow><msup><mi>σ</mi><mn>2</mn></msup><mo>+</mo><mi>ϵ</mi></mrow></msqrt></mfrac></mrow><annotation encoding="application/x-tex">y = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1903em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2603em;"><span style="top:-2.1966em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9134em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7401em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span></span></span><span style="top:-2.8734em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1266em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">μ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><blockquote>
<p>译者注: 这是一个在 2024 年相当少见的选择. 同期主流模型几乎全部使用 RMSNorm(LLaMA 2/3,Qwen2/3,DeepSeek-V3)或参数化 Layer Norm(GPT-3,PaLM). OLMo 选择非参数化 Layer Norm 有两个原因. 第一, 速度: 作者明确提到这是「考虑过的变体中最快的」. 第二, 保守性: 作者称其为「最安全的选择」. 在训练稳定性方面, 移除可学习参数意味着少了一层可能出错的变量.</p>
</blockquote>
<h3 id="2-3-swi-glu-yttlyh">2.3 SwiGLU 与吞吐量优化</h3>
<p>OLMo 使用 SwiGLU 激活函数替代 ReLU, 并遵循 LLaMA 的设计将 FFN 中间维度设为约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{8}{3}d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal">d</span></span></span></span>. 但 OLMo 在此基础上增加了一个细节优化: 将中间维度向上取整到最接近的 128 的倍数. 对于 7B 模型, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mo>×</mo><mn>4096</mn><mo>≈</mo><mn>10922</mn></mrow><annotation encoding="application/x-tex">\\frac{8}{3} \\times 4096 \\approx 10922</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10922</span></span></span></span>, 取整后为 11008.</p>
<blockquote>
<p>译者注: 这个取整操作看似微不足道, 实则是一个重要的 GPU 效率优化. NVIDIA GPU 的 Tensor Core 在处理矩阵乘法时, 对维度为 128 的倍数的张量有最优的内存访问模式和计算效率. 代价是增加了约 0.8% 的参数量, 但对于 7B 模型来说这个开销完全可以接受.</p>
</blockquote>
<h3 id="2-4-xzwzbm-rope">2.4 旋转位置编码(RoPE)</h3>
<p>OLMo 采用旋转位置编码(Rotary Position Embedding, RoPE)替代绝对位置编码. RoPE 的数学表达为: 对于位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 的向量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>, 其旋转后的表示为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>R</mi><mrow><mi mathvariant="normal">Θ</mi><mo separator="true">,</mo><mi>m</mi></mrow><mi>d</mi></msubsup><mi>x</mi><mo>=</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>1</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>2</mn></msub></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>⊗</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>+</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><msub><mi>x</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>1</mn></msub></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>⊗</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">R_{\\Theta, m}^d x = \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} \\otimes \\begin{pmatrix} \\cos m\\theta_1 \\\\ \\cos m\\theta_1 \\end{pmatrix} + \\begin{pmatrix} -x_2 \\\\ x_1 \\end{pmatrix} \\otimes \\begin{pmatrix} \\sin m\\theta_1 \\\\ \\sin m\\theta_1 \\end{pmatrix}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">Θ</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">m</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">−</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>10000</mn><mrow><mo>−</mo><mn>2</mn><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = 10000^{-2(i-1)/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.888em;"></span><span class="mord">1000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span><span class="mclose mtight">)</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> 为旋转角频率. OLMo-1/7B 的上下文长度为 2048, 在这个尺度下 RoPE 的基频 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10000</mn></mrow><annotation encoding="application/x-tex">10000</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10000</span></span></span></span> 不需要像后来的 LLaMA 3 那样扩展到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>500000</mn></mrow><annotation encoding="application/x-tex">500000</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">500000</span></span></span></span>.</p>
<hr>
<h2 id="3-gjcx-qkfstdsdzz">3 关键创新: 全开放生态的三大支柱</h2>
<h3 id="3-1-dolma-ksjdyxlsj">3.1 Dolma: 可审计的预训练数据</h3>
<p>Dolma 是 OLMo 的预训练数据集, 总规模为 3 万亿 token, 由 7 个来源组成:</p>
<table>
<thead>
<tr>
<th align="left">来源</th>
<th align="left">类型</th>
<th align="right">Token 数(十亿)</th>
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
<p>表 3: Dolma 数据集构成.</p>
</blockquote>
<blockquote>
<p>译者注: Common Crawl 占比高达 81.7%, 这与 LLaMA 1(约 67%)和 LLaMA 2(约 80%)类似. 但更重要的是, Dolma 在发布中保持了各来源的物理分离——研究者可以精确控制训练数据中各来源的比例, 从而系统性地研究「如果我将 CC 占比从 80% 降到 50%,同时增加代码和书籍的占比, 模型在代码生成和知识密集型任务上的表现会如何变化?&quot;. 这种「数据消融」能力在黑盒模型上完全不可能实现.</p>
</blockquote>
<h3 id="3-2-paloma-585-lydkhdpg">3.2 Paloma: 585 领域的困惑度评估</h3>
<p>OLMo 采用两个互补的评估工具: Catwalk(下游任务评估)和 Paloma(内在语言建模评估). Paloma 包含 585 个不同的文本领域, 以分层样本抽取, 避免被网页主导的语料库偏见所主导.</p>
<blockquote>
<p>译者注: 传统困惑度评估通常报告一个 aggregate 数字(如在 C4 上的 perplexity), 但这个数字会被数据量最大的领域(网页)主导, 掩盖模型在稀有领域(如学术论文,诗歌)上的表现. Paloma 将 585 个领域平等呈现, 每个领域独立计算 bits per byte.</p>
</blockquote>
<h3 id="3-3-zxpgqdjgjc">3.3 在线评估驱动架构决策</h3>
<p>在整个训练过程中, OLMo 每 1000 步骤(约 4B tokens)执行一次循环内评估(in-loop evaluation), 在 8 个核心下游任务上评估当前Checkpoint的性能. 这些评估结果直接用于指导架构,初始化,优化器,学习率调度和数据混合的决策.</p>
<hr>
<h2 id="4-xlgc-kyjyzyjdcl">4 训练工程: 跨硬件验证与精度策略</h2>
<h3 id="4-1-fbsxlkj">4.1 分布式训练框架</h3>
<p>OLMo 使用 PyTorch 的 FSDP(Fully Sharded Data Parallel)框架, 结合 ZeRO 优化器状态分片策略. 全局 batch size 恒定为约 4M tokens(2048 个实例, 每个序列长度 2048).</p>
<h3 id="4-2-hhjdxldwdxcs">4.2 混合精度训练的稳定性措施</h3>
<p>OLMo 采用 bfloat16 混合精度训练, 但有两个关键的稳定性措施:</p>
<ol>
<li><strong>权重在 optimizer step 期间保持 FP32</strong>: 每个 Transformer 块内的权重仅在 forward 和 backward pass 期间临时转换为 bfloat16, 优化器状态始终在全精度下维护.</li>
<li><strong>梯度 all-reduce 使用 FP32</strong>: 梯度在 GPU 间聚合时使用全精度, 避免 bfloat16 的数值误差在跨设备通信中累积.</li>
</ol>
<h3 id="4-3-kyjptxlyz">4.3 跨硬件平台训练验证</h3>
<p>OLMo 在两个不同的计算集群上训练模型:</p>
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
<td align="left">4 GPU/节点(8 逻辑设备)</td>
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
<p>表 4: OLMo 跨硬件训练集群配置.</p>
</blockquote>
<blockquote>
<p>译者注: 跨硬件平台验证是 OLMo 的一个标志性工程决策. 在 2024 年, 大规模语言模型训练几乎被 NVIDIA GPU 垄断, AMD 的软件栈(ROCm)在 PyTorch 生态中的成熟度明显落后. AI2 选择同时在 LUMI(AMD)和 MosaicML(NVIDIA)上训练, 并验证两个运行的评估结果「几乎相同」. 当然, 这里有一个重要的 caveat: 7B 规模相对较小, 通信开销在总训练时间中的占比不高. 在更大规模(如 70B+)上, AMD 和 NVIDIA 之间在通信库效率上的差距可能会放大.</p>
</blockquote>
<hr>
<h2 id="5-hxdb-wqkfmxdxndw">5 横向对比: 完全开放模型的性能定位</h2>
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
<p>表 5: OLMo-7B 与同期 7B 规模模型的 zero-shot 性能对比.</p>
</blockquote>
<p>OLMo-7B 的平均分 69.3 略低于 Llama 2 7B(70.5)和 Falcon-7B(70.3), 但高于 LLaMA 7B(69.6). 这一定位是「competitive 但非领先」. 作者坦诚地指出了相对弱点: arc_easy(65.4 vs Llama 2 的 69.5)和 boolq(73.4 vs 80.2)上的差距明显.</p>
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
<p>表 6: OLMo-7B 适配前后的性能变化.</p>
</blockquote>
<p>适配后, OLMo 在 MMLU 上从 28.3% 提升至 44.0%, ToxiGen 毒性率从 81.4% 降至 12.0%, 说明基础模型具有良好的适配潜力. 但与在相同后训练数据(Tulu mix)上训练的 Tulu 2(基于 Llama 2)相比, 仍有差距.</p>
<hr>
<h2 id="6-jxxybj">6 局限性与边界</h2>
<h3 id="6-1-xnthb">6.1 性能天花板</h3>
<p>OLMo-7B 在核心基准上落后于同期的 Llama 2 7B 和 Falcon-7B, 且差距在更大规模上可能扩大. 这反映了「完全开放」与「性能领先」之间的 trade-off: 当竞争对手使用专有数据,专有优化器和专有评估策略时, 完全开放的模型很难在相同计算预算下超越它们.</p>
<h3 id="6-2-yyzd">6.2 英语主导</h3>
<p>Dolma 数据集的构成以英语网页为主, 多语言能力不足. 这与 LLaMA 2 和后来的 Llama 3 形成了对比, 后者在多语言数据上做了显著投入.</p>
<h3 id="6-3-gmxz">6.3 规模限制</h3>
<p>OLMo 1 仅发布了 1B 和 7B 两个规模, 缺乏更大规模(如 13B/70B)的模型. 这使得研究者无法利用 OLMo 进行规模缩放(scaling)研究——而缩放定律正是语言模型科学的核心课题之一.</p>
<blockquote>
<p>译者注: 第三个局限在 OLMo 2 中得到了部分解决(发布了 13B), 但 OLMo 家族至今没有 70B 规模的模型. 这可能有几个原因: 计算资源限制(AI2 是非营利机构, 训练预算有限),工程复杂度(更大规模的训练需要更复杂的并行策略)以及战略目标(OLMo 的定位是「科研基线」, 而非「最强模型」).</p>
</blockquote>
<hr>
<h2 id="7-zj">7 总结</h2>
<p>OLMo-1 不是一个追求 SOTA 的模型, 而是一个追求「可被完全理解」的模型. 它的架构选择(无偏置,非参数化 Layer Norm,SwiGLU,RoPE)全部跟随经过验证的最佳实践, 不追求原创但追求稳健. 它的真正创新在于<strong>开放策略</strong>: 权重,代码,数据,Checkpoint,日志全部 Apache 2.0 发布, 使得语言模型从一个黑盒产品转变为一个可研究,可审计,可复现的科学对象.</p>
<p>OLMo-7B 的性能(69.3 平均分)证明了完全开放不需要以大幅牺牲性能为代价——它足够 competitive, 可以作为基线模型进行进一步研究, 同时又足够透明, 使得研究结果的因果解释成为可能. 这种「透明竞争力」的组合, 使 OLMo 成为 2024 年开源语言模型领域最具影响力的发布之一, 其影响不仅限于模型本身, 更在于它为开放 AI 研究设定了一个新的标准.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-kysnq-efxnjsxs","text":"1 设计动机: 科研使能器, 而非性能竞赛选手"},{"level":2,"id":"2-hxjg-wsgszjsj","text":"2 核心架构: 务实跟随最佳实践"},{"level":3,"id":"2-1-wpzjg","text":"2.1 无偏置架构"},{"level":3,"id":"2-2-fcsh-layer-norm-ygsjdxz","text":"2.2 非参数化 Layer Norm: 一个少见的选择"},{"level":3,"id":"2-3-swi-glu-yttlyh","text":"2.3 SwiGLU 与吞吐量优化"},{"level":3,"id":"2-4-xzwzbm-rope","text":"2.4 旋转位置编码(RoPE)"},{"level":2,"id":"3-gjcx-qkfstdsdzz","text":"3 关键创新: 全开放生态的三大支柱"},{"level":3,"id":"3-1-dolma-ksjdyxlsj","text":"3.1 Dolma: 可审计的预训练数据"},{"level":3,"id":"3-2-paloma-585-lydkhdpg","text":"3.2 Paloma: 585 领域的困惑度评估"},{"level":3,"id":"3-3-zxpgqdjgjc","text":"3.3 在线评估驱动架构决策"},{"level":2,"id":"4-xlgc-kyjyzyjdcl","text":"4 训练工程: 跨硬件验证与精度策略"},{"level":3,"id":"4-1-fbsxlkj","text":"4.1 分布式训练框架"},{"level":3,"id":"4-2-hhjdxldwdxcs","text":"4.2 混合精度训练的稳定性措施"},{"level":3,"id":"4-3-kyjptxlyz","text":"4.3 跨硬件平台训练验证"},{"level":2,"id":"5-hxdb-wqkfmxdxndw","text":"5 横向对比: 完全开放模型的性能定位"},{"level":2,"id":"6-jxxybj","text":"6 局限性与边界"},{"level":3,"id":"6-1-xnthb","text":"6.1 性能天花板"},{"level":3,"id":"6-2-yyzd","text":"6.2 英语主导"},{"level":3,"id":"6-3-gmxz","text":"6.3 规模限制"},{"level":2,"id":"7-zj","text":"7 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/01-olmo/02-olmo-kxbhjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/01-olmo/02-olmo-kxbhjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo 科学白盒架构剖析</h1>
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
