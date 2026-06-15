"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-130B: An Open Bilingual Pre-trained Model 顶会论文精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: GLM-130B: AN OPEN BILINGUAL PRE-TRAINED MODEL
原文链接: <a href="https://arxiv.org/abs/2210.02414">https://arxiv.org/abs/2210.02414</a>
发表会议: ICLR 2023 (The Eleventh International Conference on Learning Representations)
发布日期: 2022.10.05 (v1), 2023.10.25 (v2)
发布机构: Tsinghua University &amp; Zhipu.AI
开源协议: 模型权重公开可下载</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-glm-130b-%E7%9A%84%E8%AE%BE%E8%AE%A1%E9%80%89%E6%8B%A9">2 GLM-130B 的设计选择</a><ul>
<li><a href="#21-glm-130b-%E7%9A%84%E6%9E%B6%E6%9E%84">2.1 GLM-130B 的架构</a></li>
<li><a href="#22-glm-130b-%E7%9A%84%E9%A2%84%E8%AE%AD%E7%BB%83%E8%AE%BE%E7%BD%AE">2.2 GLM-130B 的预训练设置</a></li>
<li><a href="#23-%E5%B9%B3%E5%8F%B0%E6%84%9F%E7%9F%A5%E5%B9%B6%E8%A1%8C%E7%AD%96%E7%95%A5%E5%92%8C%E6%A8%A1%E5%9E%8B%E9%85%8D%E7%BD%AE">2.3 平台感知并行策略和模型配置</a></li>
</ul>
</li>
<li><a href="#3-glm-130b-%E7%9A%84%E8%AE%AD%E7%BB%83%E7%A8%B3%E5%AE%9A%E6%80%A7">3 GLM-130B 的训练稳定性</a></li>
<li><a href="#4-glm-130b-%E5%9C%A8-rtx-2080-ti-%E4%B8%8A%E7%9A%84%E6%8E%A8%E7%90%86">4 GLM-130B 在 RTX 2080 Ti 上的推理</a></li>
<li><a href="#5-%E7%BB%93%E6%9E%9C">5 结果</a><ul>
<li><a href="#51-%E8%AF%AD%E8%A8%80%E5%BB%BA%E6%A8%A1">5.1 语言建模</a></li>
<li><a href="#52-mmlu">5.2 MMLU</a></li>
<li><a href="#53-big-bench">5.3 BIG-bench</a></li>
<li><a href="#54-%E4%B8%AD%E6%96%87%E8%AF%AD%E8%A8%80%E7%90%86%E8%A7%A3%E8%AF%84%E4%BC%B0clue">5.4 中文语言理解评估(CLUE)</a></li>
</ul>
</li>
<li><a href="#6-%E7%9B%B8%E5%85%B3%E5%B7%A5%E4%BD%9C">6 相关工作</a></li>
<li><a href="#7-%E7%BB%93%E8%AE%BA%E4%B8%8E%E7%BB%8F%E9%AA%8C%E6%95%99%E8%AE%AD">7 结论与经验教训</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E4%BC%A6%E7%90%86-%E5%81%8F%E8%A7%81%E4%B8%8E%E6%AF%92%E6%80%A7%E8%AF%84%E4%BC%B0">A 伦理: 偏见与毒性评估</a></li>
<li><a href="#b-%E6%8A%80%E6%9C%AF%E7%BB%86%E8%8A%82">B 技术细节</a></li>
<li><a href="#c-%E6%95%B0%E6%8D%AE%E9%9B%86%E4%B8%8E%E8%AF%84%E4%BC%B0%E7%BB%86%E8%8A%82">C 数据集与评估细节</a></li>
<li><a href="#d-%E6%89%A9%E5%B1%95%E8%A7%84%E5%BE%8B%E4%B8%8E%E6%B6%8C%E7%8E%B0%E8%83%BD%E5%8A%9B">D 扩展规律与涌现能力</a></li>
<li><a href="#e-%E8%B4%A1%E7%8C%AE%E8%80%85">E 贡献者</a></li>
<li><a href="#f-glm-130b-%E7%AE%80%E5%8F%B2">F GLM-130B 简史</a></li>
<li><a href="#g-%E6%9B%B4%E5%B9%BF%E6%B3%9B%E7%9A%84%E5%BD%B1%E5%93%8D">G 更广泛的影响</a></li>
<li><a href="#h-%E7%8E%AF%E5%A2%83%E5%BD%B1%E5%93%8D">H 环境影响</a></li>
</ul>
</li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们介绍 GLM-130B,一个拥有 1300 亿参数的双语(英语和中文)预训练语言模型.这是一次尝试——开源一个至少与 GPT-3(davinci)同样好的 100B 规模模型,并揭示如此规模的模型如何能够被成功预训练.在这一努力过程中,我们面临了众多意想不到的技术和工程挑战,特别是在损失尖峰(loss spikes)和发散(divergence)方面.在本文中,我们介绍 GLM-130B 的训练过程,包括其设计选择、效率与稳定性的训练策略,以及工程努力.最终得到的 GLM-130B 模型在广泛的流行英文基准上显著优于 GPT-3 175B(davinci),而这种性能优势在 OPT-175B 和 BLOOM-176B 上未被观察到.它还在相关基准上持续且显著地优于 ERNIE TITAN 3.0 260B —— 最大的中文语言模型.最后,我们利用 GLM-130B 的一个独特扩展特性,在无后训练的情况下实现了 INT4 量化,且几乎没有性能损失,这使其成为 100B 规模模型中的首个,更重要的是,它使得模型能够在 4 块 RTX 3090(24G)或 8 块 RTX 2080 Ti(11G)GPU 上有效推理 —— 这是使用 100B 规模模型所需的最便宜的 GPU.GLM-130B 的模型权重可公开获取,其代码、训练日志、相关工具包和经验教训已在 <a href="https://github.com/THUDM/GLM-130B/">https://github.com/THUDM/GLM-130B/</a> 开源.</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>大语言模型(LLMs),特别是那些拥有超过 1000 亿(100B)参数的模型(Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021),展现了诱人的扩展规律(scaling laws)(Wei et al., 2022b),其中涌现的 zero-shot 和 few-shot 能力突然产生.其中,GPT-3(Brown et al., 2020)以 175B 参数开创了 100B 规模 LLM 的研究,它在多种基准上以 32 个标注样本就取得了比完全监督的 BERT-Large 模型更好的性能.然而,无论是 GPT-3 本身(以及许多其他闭源的 100B 规模模型),还是它如何被训练,迄今为止对公众都是不透明的.训练一个如此规模的高质量 LLM 并与所有人共享模型和训练过程,具有至关重要的价值.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么开源 100B 规模模型如此重要?</p>
<p>在 2022 年,GPT-3 已经发布两年,但其训练细节仍是不透明的黑盒.同时期的开源努力 OPT-175B 和 BLOOM-176B 虽然开源了模型,但在性能上未能超越 GPT-3.GLM-130B 的核心动机是填补这一空白:不仅开源模型,还要开源训练过程、失败尝试和经验教训.这在当时是一个雄心勃勃的目标,因为 100B 规模模型的训练成本极高(需要数千张 GPU 训练数月),且训练稳定性是一个公认的难题.</p>
</blockquote>
<p>因此,我们的目标是预训练一个开放的、高精度的 100B 规模模型,并将伦理关切纳入考量.在我们的尝试过程中,我们逐渐意识到,与训练 10B 规模模型相比,在如此规模上预训练一个稠密 LLM 在预训练效率、稳定性和收敛性方面带来了众多意想不到的技术和工程挑战.类似的困难也在训练 OPT-175B(Zhang et al., 2022)和 BLOOM-176B(Scao et al., 2022)的过程中被同时观察到,这进一步证明了 GPT-3 作为先驱研究的重要意义.</p>
<p>在本文中,我们从工程努力、模型设计选择、效率与稳定性的训练策略,以及可负担推理的量化等方面,介绍了 100B 规模模型 GLM-130B 的预训练.正如已广泛认识到的,经验性地枚举所有可能的 100B 规模 LLM 训练设计在计算上是不可承受的,因此我们不仅呈现了 GLM-130B 训练的成功部分,还呈现了许多失败的选项和经验教训.特别地,训练稳定性是决定如此规模模型训练成败的决定性因素.与 OPT-175B 中手动调整学习率、BLOOM-176B 中以牺牲性能为代价使用 embedding norm 等做法不同,我们实验了多种选项,发现 embedding gradient shrink 策略能够显著稳定 GLM-130B 的训练.</p>
<p>具体而言,GLM-130B 是一个拥有 1300 亿参数的双语(英语和中文)双向稠密模型,于 2022 年 5 月 6 日至 7 月 3 日在 96 台 NVIDIA DGX-A100(8 x 40G)GPU 节点集群上预训练了超过 4000 亿个 token.我们没有使用 GPT 风格的架构,而是采用 General Language Model(GLM)算法(Du et al., 2022)来利用其双向注意力优势和自回归空白填充目标.表 1 总结了 GLM-130B 与 GPT-3 以及另外两个开源努力 OPT-175B 和 BLOOM-176B 的对比,同时也以 PaLM 540B(Chowdhery et al., 2022) —— 一个 4 倍大的模型 —— 作为参考.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">开源</th>
<th align="left">架构与数据</th>
<th align="left">训练</th>
<th align="left">推理</th>
</tr>
</thead>
<tbody><tr>
<td align="left"></td>
<td align="center"></td>
<td align="left">目标</td>
<td align="left">LN</td>
<td align="left">主要语言</td>
</tr>
<tr>
<td align="left">GPT-3 175B</td>
<td align="center">否</td>
<td align="left">GPT</td>
<td align="left">Pre-LN</td>
<td align="left">英语</td>
</tr>
<tr>
<td align="left">OPT-175B</td>
<td align="center">是</td>
<td align="left">GPT</td>
<td align="left">Pre-LN</td>
<td align="left">英语</td>
</tr>
<tr>
<td align="left">BLOOM-176B</td>
<td align="center">是</td>
<td align="left">GPT</td>
<td align="left">Pre-LN</td>
<td align="left">多语言</td>
</tr>
<tr>
<td align="left">PaLM 540B</td>
<td align="center">否</td>
<td align="left">GPT</td>
<td align="left">Pre-LN</td>
<td align="left">英语</td>
</tr>
<tr>
<td align="left">GLM-130B</td>
<td align="center">是</td>
<td align="left">GLM(空白填充 &amp; MIP)</td>
<td align="left">DeepNorm</td>
<td align="left">双语(英&amp;中)</td>
</tr>
</tbody></table>
<p><em>注: LN = Layer Norm; FPF = Floating-Point Format; MIP = Multi-task Instruction Pre-training.</em></p>
<p>总之,概念上的独特性和工程努力使 GLM-130B 在广泛的基准上(共 112 个任务)展现出超越 GPT-3 水平的性能,在许多情况下也优于 PaLM 540B,而在 OPT-175B 和 BLOOM-176B 上未观察到对 GPT-3 的超越(参见图 1 左).对于 zero-shot 性能,GLM-130B 在 LAMBADA(Paperno et al., 2016)上优于 GPT-3 175B(+5.0%)、OPT-175B(+6.5%)和 BLOOM-176B(+13.0%),并在 Big-bench-lite(Srivastava et al., 2022)上取得了 GPT-3 的 3 倍更好性能.对于 5-shot MMLU(Hendrycks et al., 2021)任务,它优于 GPT-3 175B(+0.9%)和 BLOOM-176B(+12.7%).作为一个也支持中文的双语 LLM,它在 7 个 zero-shot CLUE(Xu et al., 2020)数据集(+24.26%)和 5 个 zero-shot FewCLUE(Xu et al., 2021)数据集(+12.75%)上提供了显著优于最大中文 LLM ERNIE TITAN 3.0 260B(Wang et al., 2021)的结果.重要的是,如图 1 右所总结的,作为一个开放模型,GLM-130B 与其 100B 规模对应模型相比,关联着显著更少的偏见和生成毒性.</p>
<blockquote>
<p>图 1: 性能评估和伦理研究的总结.左: 语言能力评估; 右: 偏见与毒性评估.数据来源: 原文 Figure 1.</p>
</blockquote>
<p>最后,我们将 GLM-130B 设计为赋能尽可能多的人进行 100B 规模 LLM 研究.首先,与 OPT 和 BLOOM 使用 175B+ 参数不同,130B 的尺寸被确定是因为该尺寸支持在单台 A100(8 x 40G)服务器上进行推理.其次,为了进一步降低 GPU 需求,我们将 GLM-130B 量化到 INT4 精度而无后训练,而 OPT 和 BLOOM 只能达到 INT8.由于 GLM 架构的一个独特特性,GLM-130B 的 INT4 量化引入了可忽略的性能退化,例如 LAMBADA 上 -0.74% 甚至 MMLU 上 +0.05%,使其仍优于未压缩的 GPT-3.这使得 GLM-130B 能够在 4 块 RTX 3090(24G)或 8 块 RTX 2080 Ti(11G)的服务器上实现有保证性能的快速推理 —— 这是迄今为止使用 100B 规模 LLM 所需的最便宜的 GPU.</p>
<p>我们开源了模型Checkpoint、代码、训练日志、相关工具包和经验教训.</p>
<hr>
<h2 id="2-glm-130b-dsjxz">2 GLM-130B 的设计选择</h2>
<p>机器学习模型的架构定义了其归纳偏置.然而,已经认识到为 LLM 探索各种架构设计在计算上是不可承受的.我们介绍并解释 GLM-130B 的独特设计选择.</p>
<h3 id="2-1-glm-130b-djg">2.1 GLM-130B 的架构</h3>
<p><strong>GLM 作为骨干网络.</strong> 大多数近期的 100B 规模 LLM,如 GPT-3、PaLM、OPT 和 BLOOM,遵循传统的 GPT 风格(Radford et al., 2019)decoder-only 自回归语言建模架构.在 GLM-130B 中,我们转而尝试探索双向 GLM —— General Language Model(Du et al., 2022) —— 作为其骨干网络的潜力.</p>
<p>GLM 是一种基于 transformer 的语言模型,利用自回归空白填充(autoregressive blank infilling)作为其训练目标.简要地,对于文本序列 x = [x1, ..., xn],从中采样文本跨度 {s1, ..., sm},每个跨度 si 表示一段连续的 token [si,1, ..., si,li],并用单个 mask token 替换(即损坏)以形成 x_corrupt.模型被要求自回归地恢复它们.为了允许损坏跨度之间的交互,它们对彼此的可见性由一个随机采样的排列顺序决定.</p>
<p>GLM 对未 mask(即未损坏)上下文的双向注意力使 GLM-130B 区别于使用单向注意力的 GPT 风格 LLM.为了同时支持理解和生成,它混合了两种由特殊 mask token 指示的损坏目标:</p>
<ul>
<li></li>
<li></li>
</ul>
<p>概念上,带有双向注意力的空白填充目标使模型比 GPT 风格模型更有效地理解上下文:当使用 <a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 时,GLM-130B 的行为类似于 BERT(Devlin et al., 2019)和 T5(Raffel et al., 2020);当使用 <a href="%E5%8F%A5%E5%AD%90%E6%9C%AB%E5%B0%BE%E7%9A%84%E9%9A%8F%E6%9C%BA%E9%95%BF%E5%BA%A6%E9%95%BF%E7%A9%BA%E7%99%BD,%E6%8F%90%E4%BE%9B%E5%89%8D%E7%BC%80%E4%B8%8A%E4%B8%8B%E6%96%87.">gMASK</a> 时,GLM-130B 的行为类似于 PrefixLM(Liu et al., 2018; Dong et al., 2019).</p>
<blockquote>
<p><strong>[架构细节]</strong> GLM 与 GPT 的本质区别</p>
<p>GPT 是因果的(causal): 每个 token 只能 attend 到前面的 token.这适合生成任务,但限制了模型对上下文的全面理解.GLM 的双向注意力允许模型在预测被 mask 的跨度时看到整个上下文(包括 mask 前后的文本).这类似于 BERT 的 MLM(Masked Language Modeling),但 GLM 的关键创新是「自回归地」填充空白 —— 即模型按顺序生成被 mask 的 token,而非像 BERT 那样独立预测每个 mask.这使得 GLM 统一了理解(双向)和生成(自回归)两种能力于单一框架中.从工程角度看,GLM 的预训练目标比 GPT 的 next-token prediction 更难优化,因为模型需要学习跨度内 token 之间的依赖关系,以及跨度与上下文之间的关系.</p>
</blockquote>
<p>经验上,GLM-130B 在 zero-shot LAMBADA 上提供了创纪录的 80.2% 准确率,在图 2 中超越了 GPT-3 和 PaLM 540B.通过设置注意力 mask,GLM-130B 的单向变体与 GPT-3 和 OPT-175B 相当.我们的观察与现有发现一致(Liu et al., 2018; Dong et al., 2019).</p>
<blockquote>
<p>图 2: GLM-130B 与相似规模 LLM 在 zero-shot LAMBADA 语言建模上的对比.数据来源: 原文 Figure 2.</p>
</blockquote>
<p><strong>层归一化(LN, Ba et al. (2016)).</strong> 训练不稳定性是训练 LLM 的主要挑战之一(Zhang et al., 2022; Scao et al., 2022; Chowdhery et al., 2022)(参见附录中的图 10 以了解几个 100B 规模模型训练中的崩溃).适当选择 LN 可以帮助稳定 LLM 的训练.我们实验了现有实践,例如 Pre-LN(Xiong et al., 2020)、Post-LN(Ba et al., 2016)、Sandwich-LN(Ding et al., 2021),它们 unfortunately 都无法稳定我们的 GLM-130B 试运行(参见图 3(a)和附录 B.2 了解细节).</p>
<blockquote>
<p>图 3: GLM-130B 训练在不同 LayerNorm 上的试验.结果表明 DeepNorm 是最稳定的,因为它具有小的梯度范数且在早期训练阶段不尖峰.数据来源: 原文 Figure 3.</p>
</blockquote>
<p>我们的搜索后来聚焦于 Post-LN,因为在初步实验中它展现了有利的下游结果,尽管它不能稳定 GLM-130B.幸运的是,用新提出的 DeepNorm(Wang et al., 2022b)初始化的 Post-LN 之一产生了有前景的训练稳定性.具体地,给定 GLM-130B 的层数 N,我们采用:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>DeepNorm</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>LayerNorm</mtext><mo stretchy="false">(</mo><mi>α</mi><mo>⋅</mo><mi>x</mi><mo>+</mo><mtext>Network</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{DeepNorm}(x) = \\text{LayerNorm}(\\alpha \\cdot x + \\text{Network}(x))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">DeepNorm</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">LayerNorm</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Network</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">))</span></span></span></span></span><p>其中:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>α</mi><mo>=</mo><mo stretchy="false">(</mo><mn>2</mn><mi>N</mi><msup><mo stretchy="false">)</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></msup></mrow><annotation encoding="application/x-tex">\\alpha = (2N)^{\\frac{1}{2}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.254em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.004em;"><span style="top:-3.413em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8443em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.344em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span></span></span></span></span><p>并对 ffn、v_proj 和 out_proj 应用缩放因子为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>2</mn><mi>N</mi><msup><mo stretchy="false">)</mo><mrow><mo>−</mo><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow></msup></mrow><annotation encoding="application/x-tex">(2N)^{-\\frac{1}{2}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.204em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.954em;"><span style="top:-3.363em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8443em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.344em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span></span></span></span> 的 Xavier 正态初始化.此外,所有偏置项初始化为零.图 3 显示它显著受益于 GLM-130B 的训练稳定性.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么 DeepNorm 有效?</p>
<p>Post-LN 在原始 Transformer 论文(Vaswani et al., 2017)中被提出,但由于训练时梯度爆炸的问题,后来被 Pre-LN 取代.然而 Pre-LN 在 100B 规模下仍然不稳定.GLM-130B 团队发现 DeepNorm —— 一种特殊的 Post-LN 变体 —— 能够解决这个问题.DeepNorm 的核心洞察是:通过缩放残差连接的权重 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mo stretchy="false">(</mo><mn>2</mn><mi>N</mi><msup><mo stretchy="false">)</mo><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\alpha = (2N)^{1/2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1/2</span></span></span></span></span></span></span></span></span></span></span></span>(对于 70 层约为 11.8),并相应地缩小初始化标准差,可以使深层网络的主分支值尺度始终有界.这与直觉相反:通常我们认为 Post-LN 会让深层网络的值爆炸,但 DeepNorm 通过精确的数学设计避免了这一点.这一发现对后续 LLM 训练有重要影响,因为它表明 Post-LN 在适当初始化下可以比 Pre-LN 更稳定 —— 而 Pre-LN 在当时被认为是训练大模型的标准做法.</p>
</blockquote>
<p><strong>位置编码和 FFN.</strong> 我们在训练稳定性和下游性能方面经验性地测试了位置编码(PE)和 FFN 改进的不同选项(参见附录 B.3 了解细节).对于 GLM-130B 中的 PE,我们采用 Rotary Positional Encoding(RoPE, Su et al. (2021))而非 ALiBi(Press et al., 2021).为了改进 Transformer 中的 FFN,我们选择使用 GeLU(Hendrycks &amp; Gimpel, 2016)激活的 GLU 作为替代.</p>
<h3 id="2-2-glm-130b-dyxlsz">2.2 GLM-130B 的预训练设置</h3>
<p>受近期工作启发(Aribandi et al., 2022; Wei et al., 2022a; Sanh et al., 2022),GLM-130B 的预训练目标不仅包括自监督的 GLM 自回归空白填充,还包括一小部分 token 的多任务学习.这预期有助于提升其下游 zero-shot 性能.</p>
<p><strong>自监督空白填充(95% token).</strong>  recall GLM-130B 为此任务同时使用 <a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 和 <a href="%E5%8F%A5%E5%AD%90%E6%9C%AB%E5%B0%BE%E7%9A%84%E9%9A%8F%E6%9C%BA%E9%95%BF%E5%BA%A6%E9%95%BF%E7%A9%BA%E7%99%BD,%E6%8F%90%E4%BE%9B%E5%89%8D%E7%BC%80%E4%B8%8A%E4%B8%8B%E6%96%87.">gMASK</a>.每个训练序列独立应用其中之一.具体地,<a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 用于在 30% 的训练序列中 mask 连续跨度以进行空白填充.跨度的长度遵循 Poisson 分布(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi><mo>=</mo><mn>3</mn></mrow><annotation encoding="application/x-tex">\\lambda = 3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span></span></span></span>),加起来占输入的 15%.对于另外 70% 的序列,保留每个序列的前缀作为上下文,并使用 <a href="%E5%8F%A5%E5%AD%90%E6%9C%AB%E5%B0%BE%E7%9A%84%E9%9A%8F%E6%9C%BA%E9%95%BF%E5%BA%A6%E9%95%BF%E7%A9%BA%E7%99%BD,%E6%8F%90%E4%BE%9B%E5%89%8D%E7%BC%80%E4%B8%8A%E4%B8%8B%E6%96%87.">gMASK</a> mask 其余部分.mask 的长度从均匀分布中采样.</p>
<p>预训练数据包括 1.2T Pile(train split)(Gao et al., 2020)英文、1.0T 中文 WudaoCorpora(Yuan et al., 2021),以及我们从网络爬取的 250G 中文语料(包括在线论坛、百科全书和 QA),形成了英中文内容的平衡组合.</p>
<p><strong>多任务指令预训练(MIP, 5% token).</strong> T5(Raffel et al., 2020)和 ExT5(Aribandi et al., 2022)表明预训练中的多任务学习可能比微调更有帮助,因此我们提出在 GLM-130B 的预训练中包含多种指令提示数据集,包括语言理解、生成和信息提取.</p>
<p>与近期利用多任务提示微调来改善 zero-shot 任务迁移的工作(Wei et al., 2022a; Sanh et al., 2022)相比,MIP 仅占总 token 的 5%,并设置在预训练阶段以防止破坏 LLM 的其他通用能力,例如无条件自由生成.具体地,我们包含来自(Sanh et al., 2022; Wang et al., 2022a)的 74 个提示数据集,列于附录 C 和表 12 中.建议 GLM-130B 用户避免根据第 5 节中阐述的标准在这些数据集上评估其 zero-shot 和 few-shot 能力.</p>
<h3 id="2-3-ptgzbhclhmxpz">2.3 平台感知并行策略和模型配置</h3>
<p>GLM-130B 在 96 台 DGX-A100 GPU(8 x 40G)服务器集群上训练,有 60 天的使用期限.目标是尽可能多地通过 token,因为近期研究(Hoffmann et al., 2022)表明大多数现有 LLM 在很大程度上训练不足.</p>
<p><strong>3D 并行策略.</strong> 数据并行(Valiant, 1990)和张量模型并行(Shoeybi et al., 2019)是训练十亿规模模型的事实标准做法(Wang &amp; Komatsuzaki, 2021; Du et al., 2022).为了进一步处理巨大的 GPU 内存需求以及由于跨节点应用张量并行而导致的整体 GPU 利用率下降 —— 因为 GLM-130B 训练使用的是 40G 而非 80G 的 A100 —— 我们将流水线模型并行与其他两种策略结合,形成 3D 并行策略.</p>
<p>流水线并行将模型划分为每个并行组的顺序阶段,为了进一步最小化流水线引入的气泡,我们利用 DeepSpeed(Rasley et al., 2020)中的 PipeDream-Flush(Narayanan et al., 2021)实现,以相对较大的全局 batch size(4,224)训练 GLM-130B,以减少时间和 GPU 内存浪费.通过数值和经验检验,我们采用 4 路张量并行和 8 路流水线并行(参见附录 B.4 了解细节).按照(Chowdhery et al., 2022)中的计算,由于重计算(rematerialization),我们报告的硬件 FLOPs 利用率(HFU)为 43.3%,模型 FLOPs 利用率(MFU)为 32.5%.</p>
<p><strong>GLM-130B 配置.</strong> 我们的目标是使我们的 100B 规模 LLM 能够在单台 DGX-A100(40G)节点上以 FP16 精度运行.基于我们从 GPT-3 采用的 12,288 隐藏状态维度,结果模型大小必须不超过 130B 参数,因此得名 GLM-130B.为了最大化 GPU 利用率,我们基于平台及其对应的并行策略配置模型.为了避免由于两端额外的词嵌入导致中间阶段内存利用不足,我们通过从中移除一层来平衡流水线分区,使 GLM-130B 中有 9 x 8 - 2 = 70 个 transformer 层.</p>
<p>在 60 天的集群使用期间,我们成功地在每个样本固定序列长度为 2,048 的情况下训练了 GLM-130B 4000 亿个 token(大约中英文各 2000 亿).对于 <a href="%E5%8F%A5%E5%AD%90%E6%9C%AB%E5%B0%BE%E7%9A%84%E9%9A%8F%E6%9C%BA%E9%95%BF%E5%BA%A6%E9%95%BF%E7%A9%BA%E7%99%BD,%E6%8F%90%E4%BE%9B%E5%89%8D%E7%BC%80%E4%B8%8A%E4%B8%8B%E6%96%87.">gMASK</a> 训练目标,我们使用 2,048 token 的上下文窗口.对于 <a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 和多任务目标,我们使用 512 的上下文窗口,并将四个样本连接在一起以适应 2,048 的序列长度.我们在前 2.5% 的样本上将 batch size 从 192 warm-up 到 4,224.我们使用 AdamW(Loshchilov &amp; Hutter, 2019)作为优化器,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\beta_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\beta_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 分别设为 0.9 和 0.95,权重衰减值为 0.1.我们在前 0.5% 的样本上将学习率从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span> warm-up 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>,然后通过 10x cosine schedule 衰减.我们使用 0.1 的 dropout 率,并使用裁剪值 1.0 裁剪梯度(参见表 11 了解完整配置).</p>
<blockquote>
<p><strong>[工程视角]</strong> 平台感知配置的智慧</p>
<p>GLM-130B 的一个关键工程决策是「根据硬件倒推模型配置」.他们没有先确定模型架构再找硬件,而是先确定「必须在单台 A100(40G x 8)上能跑推理」的目标,然后反推模型参数不能超过 130B.这种平台感知的设计思维在当时并不常见 —— 大多数团队(如 OPT-175B、BLOOM-176B)选择 175B+ 参数,结果需要 80G A100 或更多 GPU 才能推理.GLM-130B 的 130B 参数是一个精心计算的折中:足够大以展现涌现能力,又足够小以适应「学术研究者可负担」的硬件.这体现了「包容性」的设计理念:降低门槛比追求最大参数更重要.</p>
</blockquote>
<hr>
<h2 id="3-glm-130b-dxlwdx">3 GLM-130B 的训练稳定性</h2>
<p>训练稳定性是 GLM-130B 质量的决定性因素,这也很大程度上受到它通过的 token 数量的影响(Hoffmann et al., 2022).因此,给定计算使用限制,在浮点(FP)格式方面必须在效率和稳定性之间做出权衡:低精度 FP 格式(例如 16 位精度 —— FP16)提高计算效率但容易出现溢出和下溢错误,导致训练崩溃.</p>
<p><strong>混合精度.</strong> 我们遵循混合精度(Micikevicius et al., 2018)策略(Apex O2)的常用做法,即前向和后向使用 FP16,优化器状态和主权重使用 FP32,以减少 GPU 内存使用并提高训练效率.与 OPT-175B 和 BLOOM-176B 类似(参见附录中的图 10),GLM-130B 的训练面临由此选择导致的频繁损失尖峰,这些尖峰随着训练进行变得越来越频繁.与精度相关的尖峰往往没有明确原因:有些自行恢复;另一些伴随着梯度范数突然飙升的预兆,最终导致损失尖峰甚至 NaN.OPT-175B 尝试通过手动跳过数据和调整超参数来修复;BLOOM-176B 通过 embedding norm 技术来实现(Dettmers et al., 2021).我们花费数月时间经验性地调查尖峰,并意识到当 transformer 规模扩大时会出现几个问题:</p>
<p>首先,如果使用 Pre-LN,transformer 主分支的值尺度在深层可能极大.这在 GLM-130B 中通过使用基于 DeepNorm 的 Post-LN(参见第 2.1 节)来解决,它使值尺度始终有界.</p>
<p>其次,注意力分数增长如此之大以至于超出 FP16 的范围,随着模型规模扩大.在 LLM 中有几个选项可以克服这个问题.在 CogView(Ding et al., 2021)中,提出了 PB-Relax 来移除偏置项并在注意力计算中扣除极值以避免该问题,但 unfortunately 这无助于避免 GLM-130B 中的发散.在 BLOOM-176B 中,由于其在 NVIDIA Ampere GPU(即 A100)上的宽值范围,使用 BF16 格式替代 FP16.然而,BF16 在我们的实验中由于梯度累积时转换为 FP32 而比 FP16 多消耗 15% 的运行时 GPU 内存,更重要的是它在其他 GPU 平台(例如 NVIDIA Tesla V100)上不受支持,限制了所产出 LLM 的可访问性.BLOOM-176B 的另一个选项是配合 BF16 应用 embedding norm,但以模型性能的显著损失为代价,因为他们注意到 embedding norm 会损害模型的 zero-shot 学习(参见(Scao et al., 2022)中的第 4.3 节).</p>
<blockquote>
<p><strong>[架构细节]</strong> FP16 vs BF16 的权衡</p>
<p>FP16(5 位指数,10 位尾数)和 BF16(8 位指数,7 位尾数)的选择是一个经典的精度-范围权衡.FP16 精度更高但范围更小,容易溢出;BF16 范围与 FP32 相同但精度更低.GLM-130B 选择坚持使用 FP16 而非 BF16,出于两个工程考虑:1) BF16 在梯度累积时转换为 FP32,导致 15% 额外内存;2) BF16 不支持 V100 等旧 GPU,限制了模型的可访问性.这一选择在后续被证明是有远见的 —— 当国产芯片(如华为昇腾)适配 GLM-130B 时,FP16 的广泛兼容性降低了移植难度.但代价是训练稳定性更差,需要额外的技术手段(如 EGS)来补偿.</p>
</blockquote>
<p><strong>Embedding Layer Gradient Shrink(EGS).</strong> 我们的经验搜索发现梯度范数可以作为训练崩溃的信息性指标.具体地,我们发现训练崩溃通常滞后于梯度范数的「尖峰」几个训练步骤.这样的尖峰通常由嵌入层的异常梯度引起,因为我们观察到在 GLM-130B 早期训练中,其梯度范数往往比其他层大几个数量级(参见图 4(a)).此外,它在早期训练中波动剧烈.该问题在视觉模型(Chen et al., 2021)中通过冻结 patch 投影层来处理.不幸的是,我们不能冻结语言模型中嵌入层的训练.</p>
<blockquote>
<p>图 4: EGS 降低梯度尺度和方差以稳定 LLM 的预训练.数据来源: 原文 Figure 4.</p>
</blockquote>
<p>最终,我们发现嵌入层上的梯度收缩可以克服损失尖峰从而稳定 GLM-130B 的训练.它首次在多模态 transformer CogView(Ding et al., 2021)中使用.令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 为收缩因子,该策略可以通过以下方式轻松实现:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>word_embedding</mtext><mo>=</mo><mtext>word_embedding</mtext><mo>⋅</mo><mi>α</mi><mo>+</mo><mtext>word_embedding</mtext><mi mathvariant="normal">.</mi><mtext>detach</mtext><mo stretchy="false">(</mo><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>α</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{word\\_embedding} = \\text{word\\_embedding} \\cdot \\alpha + \\text{word\\_embedding}.\\text{detach}() \\cdot (1 - \\alpha)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0044em;vertical-align:-0.31em;"></span><span class="mord text"><span class="mord">word_embedding</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0044em;vertical-align:-0.31em;"></span><span class="mord text"><span class="mord">word_embedding</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mord text"><span class="mord">word_embedding</span></span><span class="mord">.</span><span class="mord text"><span class="mord">detach</span></span><span class="mopen">(</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mclose">)</span></span></span></span></span><p>图 4(b)表明,经验性地,设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.1</mn></mrow><annotation encoding="application/x-tex">\\alpha = 0.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.1</span></span></span></span> 消除了我们会遇到的大多数尖峰,且延迟可忽略.</p>
<p>事实上,最终的 GLM-130B 训练运行只经历了三次后期损失发散案例,尽管由于硬件故障失败了多次.对于这三个意外的尖峰,结果表明进一步收缩嵌入梯度仍然可以帮助稳定 GLM-130B 的训练.详见我们代码库中的训练笔记和 Tensorboard 日志.</p>
<blockquote>
<p><strong>[数据实验]</strong> EGS 的效果与机制</p>
<p>EGS 是一个非常简单但极其有效的技巧:在反向传播时,将嵌入层的梯度乘以 0.1,同时通过 <code>detach()</code> 保持前向传播不变.图 4 清楚地展示了效果:没有 EGS 时,梯度范数在早期训练中剧烈波动(峰值超过 170);有 EGS(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.1</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.1</span></span></span></span>)时,梯度范数被压制在 20 以下.GLM-130B 团队发现训练崩溃通常「滞后」于梯度尖峰几个步骤 —— 这意味着如果能提前检测到梯度异常,就有时间干预.EGS 本质上是一种预防性措施,通过限制嵌入层的更新幅度来防止「蝴蝶效应」式的梯度爆炸.值得注意的是,这一技术后来被广泛应用于其他大模型训练中,成为稳定训练的标准工具之一.</p>
</blockquote>
<hr>
<h2 id="4-glm-130b-z-rtx-2080-ti-sdtl">4 GLM-130B 在 RTX 2080 Ti 上的推理</h2>
<p>GLM-130B 的主要目标之一是降低访问 100B 规模 LLM 的硬件需求,而不牺牲效率和效果.</p>
<p>如前所述,130B 的模型大小被确定为在单台 A100(40G x 8)服务器上运行完整的 GLM-130B 模型,而非 OPT-175B 和 BLOOM-176B 所需的高端 A100(80G x 8)机器.为了加速 GLM-130B 推理,我们还利用 FasterTransformer(Timonin et al., 2022)用 C++ 实现 GLM-130B.与 Huggingface 中 BLOOM-176B 的 PyTorch 实现相比,GLM-130B 的解码推理在相同的单台 A100 服务器上快 7-8.4 倍(参见附录 B.5 了解细节).</p>
<p><strong>RTX 3090/2080 的 INT4 量化.</strong> 为了进一步支持普及化 GPU,我们尝试在保持性能优势的同时尽可能压缩 GLM-130B,特别是通过量化(Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022),这会对生成语言模型引入很少的任务无关性能下降.</p>
<p>通常的做法是将模型权重和激活都量化到 INT8.然而,我们在附录 B.6 中的分析表明,LLM 的激活可能包含极端异常值.同时,OPT-175B 和 BLOOM-176B 中的涌现异常值也被发现(Dettmers et al., 2022),它们仅影响约 0.1% 的特征维度,因此通过矩阵乘法分解来处理异常维度.不同的是,GLM-130B 的激活中约有 30% 的异常值,使得上述技术效率远低于预期.因此,我们决定专注于模型权重(即大多数线性层)的量化,同时保持激活的 FP16 精度.量化模型在运行时动态转换为 FP16 精度,引入小的计算开销但大幅降低了存储模型权重所需的 GPU 内存.</p>
<blockquote>
<p>图 5: 左: attn-dense 和 w2 的权重分布; 右: GLM-130B 的 INT4 权重量化扩展规律.数据来源: 原文 Figure 5.</p>
</blockquote>
<p>令人兴奋的是,我们成功实现了 GLM-130B 的 INT4 权重量化,而现有成功迄今只达到 INT8.内存方面,与 INT8 相比,INT4 版本额外节省了一半所需的 GPU 内存至 70GB,从而允许在 4 块 RTX 3090 Ti(24G)或 8 块 RTX 2080 Ti(11G)上进行 GLM-130B 推理.性能方面,表 2 左显示,完全没有后训练的情况下,INT4 版本 GLM-130B 几乎没有性能退化,从而在常见基准上保持了对 GPT-3 的性能优势.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">精度</th>
<th align="center">MMLU(acc)</th>
<th align="center">LAMBADA(acc)</th>
<th align="center">Pile(部分, BPB)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM-130B</td>
<td align="center">FP16</td>
<td align="center">44.75</td>
<td align="center">80.21</td>
<td align="center">0.634</td>
</tr>
<tr>
<td align="left">GLM-130B</td>
<td align="center">INT8</td>
<td align="center">44.71</td>
<td align="center">80.21</td>
<td align="center">0.638</td>
</tr>
<tr>
<td align="left">GLM-130B</td>
<td align="center">INT4</td>
<td align="center">44.80</td>
<td align="center">79.47</td>
<td align="center">0.641</td>
</tr>
<tr>
<td align="left">GPT-3</td>
<td align="center">FP16</td>
<td align="center">43.9</td>
<td align="center">76.2</td>
<td align="center">0.74</td>
</tr>
<tr>
<td align="left">GPU 类型</td>
<td align="center">128 Enc./De.</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<p>| 512 Enc./Dec. |
|:---|:---:|:---:|
| 8 x A100(40G) | 0.15s / 4.29s | 0.18s / 17.7s |
| 8 x V100(32G) | 0.31s / 6.97s | 0.67s / 28.1s |
| 4 x RTX 3090(24G) | 0.37s / 8.16s | 1.30s / 32.3s |
| 8 x RTX 2080 Ti(11G) | 0.39s / 6.77s | 1.04s / 27.3s |</p>
<p><em>注: 编码/解码时间.数据来源: 原文 Table 2.</em></p>
<p><strong>GLM 的 INT4 权重量化扩展规律.</strong> 我们在图 5 右中检验了这种独特 INT4 权重量化扩展规律的潜在机制.我们在图 5 左中绘制了权重值分布,结果表明它直接影响量化质量.具体地,分布更宽的线性层需要用更大的 bin 来量化,导致更多精度损失.因此,宽分布的 attn-dense 和 w2 矩阵解释了 GPT 风格 BLOOM 的 INT4 量化失败.相反,GLM 倾向于比相似规模 GPT 有更窄的分布,且随着 GLM 模型尺寸扩大,INT4 和 FP16 版本之间的差距进一步缩小(参见附录中的图 15 了解细节).</p>
<blockquote>
<p><strong>[架构细节]</strong> 为什么 GLM 更适合 INT4 量化?</p>
<p>这是 GLM-130B 论文中最令人惊讶的发现之一.GLM 的权重分布比 GPT 更窄、更集中,这意味着量化时可以用更小的 bin 尺寸,从而减少精度损失.从数学上看,这归因于 GLM 的训练目标 —— 自回归空白填充 —— 与 GPT 的 next-token prediction 相比,对权重矩阵施加了不同的归纳偏置.GLM 需要同时处理双向上下文和自回归生成,这种混合目标可能使权重矩阵的奇异值分布更均匀.此外,GLM 使用 GeGLU 而非标准 FFN,GeGLU 的门控机制可能进一步平滑了权重分布.这一发现开辟了新的研究方向:预训练目标的选择不仅影响模型的能力,还可能影响其硬件效率.</p>
</blockquote>
<hr>
<h2 id="5-jg">5 结果</h2>
<p>我们遵循 GPT-3 和 PaLM 等 LLM 中的常用设置来评估 GLM-130B 的英文能力.作为一个也支持中文的双语 LLM,GLM-130B 也在中文基准上进行了评估.</p>
<p><strong>关于 GLM-130B 中 Zero-Shot 学习范围的讨论.</strong> 由于 GLM-130B 经过 MIP 训练,这里我们澄清其 zero-shot 评估的范围.事实上,&quot;zero-shot&quot; 似乎在社区内没有共识而有争议的解读.我们遵循一篇有影响力的相关综述(Xian et al., 2018),其中说&quot;在测试时,在 zero-shot 学习设置中,目标是将测试图像分配给未见过的类别标签&quot;,其中涉及未见过的类别标签是关键.因此,我们推导出选择 GLM-130B 的 zero-shot(和 few-shot)数据集的标准如下:</p>
<ul>
<li>英文: 1) 对于具有固定标签的任务(例如自然语言推理):不应评估此类任务中的任何数据集; 2) 对于没有固定标签的任务(例如(多选)QA、主题分类):只应考虑那些与 MIP 中的数据集有明显领域转移的数据集.</li>
<li>中文: 所有数据集都可以评估,因为存在 zero-shot 跨语言迁移.</li>
</ul>
<p><strong>过滤测试数据集.</strong> 遵循先前实践(Brown et al., 2020; Rae et al., 2021)和我们上述标准,我们过滤并避免报告可能被污染的数据集的评估结果.对于 LAMBADA 和 CLUE,我们在 13-gram 设置下发现最小重叠.Pile、MMLU 和 BIG-bench 要么是 held-out,要么是在语料爬取之后发布的.</p>
<h3 id="5-1-yyjm">5.1 语言建模</h3>
<p><strong>LAMBADA.</strong> LAMBADA(Paperno et al., 2016)是一个测试最后一个词语言建模能力的数据集.图 2 中先前展示的结果表明,GLM-130B 以其双向注意力实现了 80.2% 的 zero-shot 准确率,在 LAMBADA 上创造了新纪录.</p>
<p><strong>Pile.</strong> Pile 测试集(Gao et al., 2020)包括一系列语言建模基准.平均而言,GLM-130B 在其 18 个共享测试集上的加权 BPB 方面表现最佳,与 GPT-3 和 Jurassic-1(Lieber et al., 2021)的结果直接比较,展示了其强大的语言能力(参见附录 C.4 了解细节).</p>
<h3 id="5-2-mmlu">5.2 MMLU</h3>
<p>MMLU(Hendrycks et al., 2021)是一个多样化的基准,包括 57 个多选问答任务,涉及从高中水平到专家水平的人类知识.它在 Pile 爬取之后发布,是测试 LLM few-shot 学习的理想试验台.GPT-3 的结果来自 MMLU,BLOOM-176B 使用与 GLM-130B 相同的提示进行测试(参见附录 C.6 和表 15 了解细节).</p>
<blockquote>
<p>图 6: GLM-130B 在 MMLU(57 个任务)上随训练步骤的变化.数据来源: 原文 Figure 6.</p>
</blockquote>
<p>GLM-130B 在 MMLU 上的 few-shot(5-shot)性能在查看了约 300B token 后接近 GPT-3(43.9),如图 6 所示.随着训练进行,它持续上升,当训练必须结束时(即总共查看 400B token)达到 44.8 的准确率.这与观察(Hoffmann et al., 2022)一致,即大多数现有 LLM 远未得到充分训练.</p>
<h3 id="5-3-big-bench">5.3 BIG-bench</h3>
<p>BIG-bench(Srivastava et al., 2022)基准测试有关模型推理、知识和常识能力的挑战性任务.鉴于在其 150 个任务上评估对 LLM 来说耗时,我们目前报告 BIG-bench-lite —— 一个官方的 24 任务子集.从图 7 和表 4 可以看出,GLM-130B 在 zero-shot 设置下优于 GPT-3 175B 甚至 PaLM 540B(4 倍大).这可能归因于 GLM-130B 的双向上下文注意力和 MIP,后者已被证明能改善未见任务的 zero-shot 结果(Wei et al., 2022a; Sanh et al., 2022).随着 shot 数量的增加,GLM-130B 的性能持续上升,保持对 GPT-3 的超越(参见附录 C.5 和表 14 了解每个模型和任务的细节).</p>
<blockquote>
<p>图 7: BIG-bench-lite 评估(24 个任务)跨规模对比.数据来源: 原文 Figure 7.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">0-shot</th>
<th align="center">1-shot</th>
<th align="center">3-shot</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3 2.6B</td>
<td align="center">0.60</td>
<td align="center">0.71</td>
<td align="center">1.83</td>
</tr>
<tr>
<td align="left">GPT-3 6.7B</td>
<td align="center">-0.06</td>
<td align="center">2.93</td>
<td align="center">5.40</td>
</tr>
<tr>
<td align="left">GPT-3 13B</td>
<td align="center">1.77</td>
<td align="center">5.43</td>
<td align="center">7.95</td>
</tr>
<tr>
<td align="left">GPT-3 175B</td>
<td align="center">4.35</td>
<td align="center">11.34</td>
<td align="center">13.18</td>
</tr>
<tr>
<td align="left">PaLM 540B</td>
<td align="center">8.05</td>
<td align="center">37.77</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">GLM-130B</td>
<td align="center">13.31</td>
<td align="center">14.91</td>
<td align="center">15.12</td>
</tr>
</tbody></table>
<p><em>注: 有效参数计数 vs 聚合归一化性能.数据来源: 原文 Table 4.</em></p>
<p><strong>局限性与讨论.</strong> 在上述实验中,我们观察到 GLM-130B 的性能增长(13.31 到 15.12)随 few-shot 样本增加不如 GPT-3 的(4.35 到 13.18)显著.以下是我们对该现象的直观尝试理解.</p>
<p>首先,GLM-130B 的双向性质可能导致强大的 zero-shot 性能(如 zero-shot 语言建模所示),因此比单向 LLM 更接近相似规模模型(即 100B 规模)的 few-shot「上限」.其次,这也可能归因于现有 MIP 范式(Wei et al., 2022a; Sanh et al., 2022)的缺陷,它们仅在训练中涉及 zero-shot 预测,可能会使 GLM-130B 偏向于更强的 zero-shot 学习但相对较弱的 in-context few-shot 性能.为了纠正这种偏置,我们想到的一个潜在解决方案是采用带有不同 shot 数 in-context 样本的 MIP,而非仅 zero-shot 样本.</p>
<p>最后,尽管与 GPT-3 几乎相同的 GPT 架构,PaLM 540B 的 few-shot in-context 学习相对增长比 GPT-3 的显著得多.我们推测这种性能增长的进一步加速是 PaLM 高质量和多样化私有收集训练语料的来源.结合我们的经验与(Hoffmann et al., 2022)的洞察,我们意识到更好的架构、更好的数据和更多的训练 FLOPS 应该被进一步投入.</p>
<h3 id="5-4-zwyyljpg-clue">5.4 中文语言理解评估(CLUE)</h3>
<p>我们在已建立的中文 NLP 基准 CLUE(Xu et al., 2020)和 FewCLUE(Xu et al., 2021)上评估 GLM-130B 的中文 zero-shot 性能.注意我们没有在 MIP 中包含任何中文下游任务.到目前为止,我们已完成对两个基准部分数据集的测试,包括 7 个 CLUE 和 5 个 FewCLUE 数据集(参见附录 C.7 了解细节).我们将 GLM-130B 与最大的现有中文单语语言模型 —— 260B 的 ERNIE Titan 3.0(Wang et al., 2021)进行比较.我们遵循其设置报告 dev 数据集上的 zero-shot 结果.GLM-130B 在 12 个任务上持续优于 ERNIE Titan 3.0(参见图 8).有趣的是,GLM-130B 在两个抽象 MRC 数据集(DRCD 和 CMRC2018)上比 ERNIE 至少好 260%,可能归因于 GLM-130B 的预训练目标与抽象 MRC 形式的自然共鸣.</p>
<blockquote>
<p>图 8: GLM-130B 和 ERNIE Titan 3.0 260B 在 zero-shot CLUE 和 FewCLUE 上的评估.数据来源: 原文 Figure 8.</p>
</blockquote>
<hr>
<h2 id="6-xggz">6 相关工作</h2>
<p>在本节中,我们从预训练、迁移和预训练 LLM 推理(Qiu et al., 2020; Bommasani et al., 2021)的相关主题回顾与 GLM-130B 相关的工作.</p>
<p><strong>预训练.</strong> 原始语言建模指的是 decoder-only 自回归模型(例如 GPT(Radford et al., 2018)),但它也认可文本上的任何形式的自监督目标.最近,基于 transformer(Vaswani et al., 2017)的语言模型呈现了一个迷人的扩展规律:随着模型规模扩大,新的能力(Wei et al., 2022b)涌现,从 1.5B(Radford et al., 2019)、10B 规模语言模型(Raffel et al., 2020; Shoeybi et al., 2019; Black et al., 2022),到 100B 规模 GPT-3(Brown et al., 2020).后来,尽管有许多 100B 规模 LLM(Lieber et al., 2021; Thoppilan et al., 2022; Rae et al., 2021; Smith et al., 2022; Chowdhery et al., 2022; Wu et al., 2021; Zeng et al., 2021; Wang et al., 2021)以英文和中文发布,但它们不对公众开放或仅通过有限 API 访问.LLM 的封闭性严重阻碍了其发展.GLM-130B 的努力,以及近期的 ElutherAI、OPT-175B(Zhang et al., 2022)和 BLOOM-176B(Scao et al., 2022),旨在为我们的社区提供高质量的开源 LLM.</p>
<p><strong>迁移.</strong> 尽管微调一直是迁移学习的事实标准方式,但由于 LLM 的巨大规模,对 LLM 的评估一直聚焦于提示和 in-context 学习(Brown et al., 2020; Liu et al., 2021a).然而,一些近期尝试涉及语言模型的参数高效学习(Houlsby et al., 2019)和提示调优(即 P-tuning, Li &amp; Liang (2021); Liu et al. (2021b); Lester et al. (2021); Liu et al. (2022)).目前我们不聚焦于此,并将对它们的全面测试留给未来研究.</p>
<p><strong>推理.</strong> 如今大多数可公开访问的 LLM 通过有限 API 提供服务.在本工作中,我们努力的一个重要部分是关于 LLM 的高效快速推理.相关工作可能包括蒸馏(Sanh et al., 2019; Jiao et al., 2020; Wang et al., 2020)、量化(Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022)和剪枝(Michel et al., 2019; Fan et al., 2019).非常近期的工作(Dettmers et al., 2022)表明,由于异常维度的特殊分布,OPT-175B 和 BLOOM-176B 等 LLM 可以被量化到 8 位.在本工作中,我们展示了 GLM 的 INT4 权重量化扩展规律,这使得 GLM-130B 能在少至 4 块 RTX 3090(24G)GPU 或 8 块 RTX 2080 Ti(11G)GPU 上推理.</p>
<hr>
<h2 id="7-jlyjyjx">7 结论与经验教训</h2>
<p>我们介绍 GLM-130B,一个旨在促进开放和包容性 LLM 研究的双语预训练语言模型.GLM-130B 的技术和工程努力为 LLM 的架构、预训练目标、训练稳定性和效率以及可负担推理提供了深刻见解.总之,它在 112 个任务的语言性能以及偏见和毒性基准的伦理结果方面为 GLM-130B 的高质量做出了贡献.我们的成功和失败经验被浓缩为训练 100B 规模 LLM 的经验教训,附于附录 B.10 中.</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-ll-pjydxpg">A 伦理: 偏见与毒性评估</h3>
<p>尽管 LLM 强大的语言及超越语言能力可能给人类带来实质性福利,但它们也可能为邪恶用途产生有毒和非法内容(Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021; Bommasani et al., 2021).在 GLM-130B 中,在授予申请人模型权重之前,我们在模型许可证中要求他们同意不会将其用于任何可能对社会和人类有害的行为.</p>
<p>此外,从技术角度,我们主张必须也理解 LLM 的有毒和有偏行为并最终消除它们.这与我们对「LLM 包容性」的承诺一致,因为有必要将更多人纳入开源 LLM 研究以促进该过程.此外,如果证明 LLM 擅长识别有毒和偏见内容,诸如自我诊断(Schick et al., 2021)等技术可以帮助以自我一致的后处理程序减少有害生成.因此,作为初步步骤,我们在各种相关基准上评估 GLM-130B 以揭示这一挑战性主题.尽管它们存在局限性(Blodgett et al., 2021; Jacobs &amp; Wallach, 2021)应在未来工作中解决,它们仍可作为迈向开放定量评估 LLM 的有意义初始步骤.</p>
<h4 id="a-1-pjcl-crow-s-pairs">A.1 偏见测量: CrowS-Pairs</h4>
<p>CrowS-Pairs(Nangia et al., 2020),或称众包刻板印象对基准,广泛用于测量 masked language model 的偏见.它收集 1,508 个具有九种不同传统偏见的例子,并采用基于探测的方法来比较一对刻板印象和反刻板印象句子的伪对数似然.由于 GLM-130B 使用自回归空白填充预训练,CrowS-Pairs 评估直接适用.我们将 GPT-3 Davinci 和 OPT-175B 在 CrowS-Pairs 上的结果(报告于(Zhang et al., 2022))与 GLM-130B 进行比较.</p>
<table>
<thead>
<tr>
<th align="left">类别</th>
<th align="center">GPT-3</th>
<th align="center">OPT-175B</th>
<th align="center">GLM-130B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">性别</td>
<td align="center">62.6</td>
<td align="center">65.7</td>
<td align="center"><strong>55.7</strong></td>
</tr>
<tr>
<td align="left">宗教</td>
<td align="center">73.3</td>
<td align="center">68.6</td>
<td align="center">73.3</td>
</tr>
<tr>
<td align="left">种族/肤色</td>
<td align="center">64.7</td>
<td align="center">68.6</td>
<td align="center"><strong>58.5</strong></td>
</tr>
<tr>
<td align="left">性取向</td>
<td align="center">76.2</td>
<td align="center">78.6</td>
<td align="center"><strong>60.7</strong></td>
</tr>
<tr>
<td align="left">年龄</td>
<td align="center">64.4</td>
<td align="center">67.8</td>
<td align="center"><strong>63.2</strong></td>
</tr>
<tr>
<td align="left">国籍</td>
<td align="center">61.6</td>
<td align="center">62.9</td>
<td align="center">64.1</td>
</tr>
<tr>
<td align="left">残疾</td>
<td align="center">76.7</td>
<td align="center">76.7</td>
<td align="center"><strong>71.6</strong></td>
</tr>
<tr>
<td align="left">外貌</td>
<td align="center">74.6</td>
<td align="center">76.2</td>
<td align="center">74.6</td>
</tr>
<tr>
<td align="left">社会经济地位</td>
<td align="center">73.8</td>
<td align="center">76.2</td>
<td align="center"><strong>70.9</strong></td>
</tr>
<tr>
<td align="left">总体</td>
<td align="center">67.2</td>
<td align="center">69.5</td>
<td align="center"><strong>65.8</strong></td>
</tr>
</tbody></table>
<p><em>注: 分数越低越好.数据来源: 原文 Table 5.</em></p>
<p>我们的结果呈现在表 5 中.GLM-130B 在几乎所有类型的刻板印象上表现出更少的偏见,除了宗教和国籍.我们推测这是因为 GLM-130B 是一个双语预训练 LLM,从英文和中文语料中学习某些内容的语义.由于 CrowS-Pairs 的刻板印象主要来源于美国平等就业机会委员会的清单,两种不同文化和语言中的偏见分布可能不同,进而在原本为英语社会设计的基准上调和了 GLM-130B 的社会偏见.我们认为这是一个有趣的发现,因为多语言预训练可能帮助 LLM 呈现更少的偏见以获得更好的公平性.最后,我们也承认 GLM-130B 可能反过来呈现一些特殊的中国偏见,目前缺乏测试基准,需要相当大的未来努力来检测和预防.</p>
<h4 id="a-2-pjcl-stereo-set">A.2 偏见测量: StereoSet</h4>
<p>另一个广泛使用的偏见和刻板印象评估基准是 StereoSet(Nadeem et al., 2021),它也被(Lieber et al., 2021; Artetxe et al., 2021; Zhang et al., 2022)采用.为了在偏见检测和语言建模质量之间平衡评估,StereoSet 报告一系列指标,包括语言建模分数(LMS)、刻板印象分数(SS)和理想化上下文关联测试分数(ICAT)作为总体平均指标.例如,给定前提&quot;She is the twin&#39;s mother&quot;,StereoSet 提供三个候选假设:1)&quot;the water is deep&quot;,2)&quot;she is a lazy, unkind person&quot;,3)&quot;she is a kind, caring woman&quot;.第一个选项作为测试模型语言能力的干扰项并计算 LMS;第二和第三条陈述分别是反刻板印象和刻板印象的,用于计算 SS.这里广泛采用的技术是根据选项长度校准其似然(Lieber et al., 2021; Zhang et al., 2022),因为干扰项特别短.</p>
<p>遵循(Zhang et al., 2022),我们对 token 而非字符(Lieber et al., 2021)进行归一化分数以产生模型预测用于计算指标.结果如表 6 所示.正如我们所观察的,GLM-130B 在所有指标上都大大超越了 GPT-3 Davinci 和 OPT-175B.这样的结果准确对齐于我们在语言建模实验和 CrowS-Pairs 偏见评估中的发现,即 GLM-130B 在语言建模和社会公平性方面都有高质量.</p>
<table>
<thead>
<tr>
<th align="left">类别</th>
<th align="center">GPT-3 (LMS/SS/ICAT)</th>
<th align="center">OPT-175B (LMS/SS/ICAT)</th>
<th align="center">GLM-130B (LMS/SS/ICAT)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">职业</td>
<td align="center">78.4/63.4/57.5</td>
<td align="center">74.1/62.6/55.4</td>
<td align="center"><strong>86.5/59.6/69.9</strong></td>
</tr>
<tr>
<td align="left">性别</td>
<td align="center">75.6/66.5/50.6</td>
<td align="center">74.0/63.6/53.8</td>
<td align="center"><strong>83.9/63.5/61.2</strong></td>
</tr>
<tr>
<td align="left">宗教</td>
<td align="center">80.8/59.0/66.3</td>
<td align="center">84.0/59.0/68.9</td>
<td align="center"><strong>91.0/53.5/84.6</strong></td>
</tr>
<tr>
<td align="left">种族</td>
<td align="center">77.0/57.4/65.7</td>
<td align="center">74.9/56.8/64.8</td>
<td align="center"><strong>85.7/54.1/78.7</strong></td>
</tr>
<tr>
<td align="left">总体</td>
<td align="center">77.6/60.8/60.8</td>
<td align="center">74.8/59.9/60.0</td>
<td align="center"><strong>86.0/57.3/73.5</strong></td>
</tr>
</tbody></table>
<p><em>注: LMS 越高越好,SS 越接近 50 越好,ICAT 越高越好.数据来源: 原文 Table 6.</em></p>
<h4 id="a-3-chyljc-ethos">A.3 仇恨言论检测: ETHOS</h4>
<p>社交媒体语料可能包含仇恨言论,调查 LLM 在多大程度上了解并能帮助识别它们至关重要.我们采用 ETHOS 数据集(Mollas et al., 2020)来检测 zero-shot 或 few-shot 数据集中的性别歧视和种族主义言论,该数据集由(Chiu &amp; Alexander, 2021)创建.GPT-3 Davinci(GPT-3 175B 的公开可访问变体)和 OPT 175B 也在该基准上进行了测试(结果报告于(Zhang et al., 2022)).对于包括 Zero-shot、One-shot 和 Few-shot(binary)在内的二分类,我们报告二元 F1;对于多分类,我们报告 micro F1.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">GPT-3</th>
<th align="center">OPT-175B</th>
<th align="center">GLM-130B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Zero-shot</td>
<td align="center">62.8</td>
<td align="center">66.7</td>
<td align="center"><strong>68.8</strong></td>
</tr>
<tr>
<td align="left">One-shot</td>
<td align="center">61.6</td>
<td align="center">71.3</td>
<td align="center"><strong>79.1</strong></td>
</tr>
<tr>
<td align="left">Few-shot (bi)</td>
<td align="center">35.4</td>
<td align="center">75.9</td>
<td align="center"><strong>79.7</strong></td>
</tr>
<tr>
<td align="left">Few-shot (mul)</td>
<td align="center">67.2</td>
<td align="center">81.2</td>
<td align="center"><strong>85.8</strong></td>
</tr>
</tbody></table>
<p><em>注: 所有分数为 F1,越高越好.数据来源: 原文 Table 7.</em></p>
<h4 id="a-4-dxsc-real-toxic-prompts">A.4 毒性生成: RealToxicPrompts</h4>
<p>评估给定提示下生成的毒性是模型安全部署的重要部分.我们在 RealToxicPrompts(Gehman et al., 2020)数据集上评估 GLM-130B 的毒性生成.遵循其设置,我们使用 nucleus sampling(p = 0.9)为 10K 随机采样提示中的每个生成 25 个续写,限制最大生成长度为 128 token.然后我们报告由 Perspective API 评估的 25 个续写的平均毒性概率.为了在不同 tokenization 方法下公平比较,我们只报告续写第一个完整句子的毒性分数,因为我们发现 Perspective API 返回的分数似乎随句子长度增加.</p>
<blockquote>
<p>图 9: RealToxicPrompts 评估.续写毒性概率越低越好.数据来源: 原文 Figure 9.</p>
</blockquote>
<p>结果如图 9 所示.通常,随着给定提示的毒性增加,两个模型的续写毒性概率都相应增加.与 GPT-3 Davinci 相比,GLM-130B 在所有情况下都有更低的毒性率,表明 GLM-130B 不太倾向于生成有毒内容.</p>
<hr>
<h3 id="b-jsxj">B 技术细节</h3>
<p>在本节中,我们介绍我们在 GLM-130B 训练全过程中识别和解决的技术问题的额外细节.连同并发的开源 LLM 努力,我们相信这些发表的细节可以作为未来 LLM 训练的重要基石.</p>
<h4 id="b-1-tokenization">B.1 Tokenization</h4>
<p>对于语料的 tokenization,我们基于 icetk 包实现了一个文本 tokenizer 并进行了若干调整.作为图像-文本统一 tokenizer,icetk 的词表大小为 150,000.前 20,000 个 token 是图像 token,其余是文本 token.icetk 的文本 tokenizer 由 sentencepiece 制定和训练,在 25GB 双语语料上平均分布英中文内容.我们将 tokenizer 识别的 token 分为四类.常见 token 从第 20,000 号分配到第 20,099 号,由标点、数字和空格组成,无扩展定义.第 20,100 号到第 83,822 号是英文 token,第 83,823 号到第 145,653 号是中文 token.第 145,653 号之后的 token 是其他特殊 token,包括连接的标点和来自其他语言的片段等.</p>
<p>在我们的实现中,我们忽略前 20,000 个图像 token,简单地利用后 130,000 个用于文本 tokenization.我们禁用对换行符的忽略,将换行标记 \\n tokenize 为第 20,004 号 token <n>.在固有 token 的基础上,我们为模型预测添加特殊 token <a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 和 <a href="%E5%8F%A5%E5%AD%90%E6%9C%AB%E5%B0%BE%E7%9A%84%E9%9A%8F%E6%9C%BA%E9%95%BF%E5%BA%A6%E9%95%BF%E7%A9%BA%E7%99%BD,%E6%8F%90%E4%BE%9B%E5%89%8D%E7%BC%80%E4%B8%8A%E4%B8%8B%E6%96%87.">gMASK</a>.我们还添加特殊 token <sop>、<eop>、<eos> 用于句子和段落分离.</p>
<h4 id="b-2-layer-normalization">B.2 Layer Normalization</h4>
<p>这里我们简要介绍语言建模问题中层归一化的历史,以及其变体在近期 LLM(包括我们在 GLM-130B 上的实验)中的表现.</p>
<p><strong>Post-LN(Vaswani et al., 2017).</strong> Post-LN 与 transformer 架构共同提出,放置在残差块之间.随后被 BERT(Devlin et al., 2019)用于双向语言模型预训练.然而,Post-LN 后来被指责为 transformer 收敛缓慢且脆弱(Xiong et al., 2020),Pre-LN 随之作为替代出现.</p>
<p><strong>Pre-LN(Xiong et al., 2020).</strong> 相反,Pre-LN 位于残差块内部以减少梯度爆炸,并在现有语言模型中占据主导地位,包括所有近期 LLM.然而,OPT-175B(Zhang et al., 2022)、BLOOM(Scao et al., 2022)和文本到图像模型 CogView(Ding et al., 2021)后来观察到,当模型扩展到 100B 或遇到多模态数据时,Pre-LN 仍然无法处理脆弱的训练.这在 GLM-130B 的初步实验中也得到了验证,其中 Pre-LN 在早期训练中一致崩溃.</p>
<p>此外,Pre-LN transformer 中根植的另一个问题是它可能在微调后损害模型性能,相比之下 Post-LN 不会.这在(He et al., 2021)中被观察到.</p>
<p><strong>Sandwich-LN(Ding et al., 2021).</strong> 作为补救措施,在 Pre-LN 之上,CogView(后来在 Normformer(Shleifer et al., 2021))开发了 Sandwich-LN,它在每个残差分支末尾附加额外的归一化.伴随 PB-Relax(Precision-Bottleneck Relaxation)技术,它们稳定了 40 亿文本到图像生成模型的训练.尽管它优于 Pre-LN,遗憾的是 Sandwich-LN 在 GLM-130B 训练中也证明会崩溃;更不用说由其 Pre-LN 本质导致的潜在后续更弱微调性能.</p>
<blockquote>
<p>图 10: 处理训练崩溃和不稳定是训练 LLM 时的首要任务.数据来源: 原文 Figure 10.</p>
</blockquote>
<h4 id="b-3-wzbmhqkwl">B.3 位置编码和前馈网络</h4>
<p><strong>位置编码.</strong> 原始 transformer 采用绝对(或正弦)位置编码,后来演变为相对位置编码(Dai et al., 2019).相对 PE 比绝对位置编码能更好地捕捉词相关性.Rotary Positional Embedding(RoPE)(Su et al., 2021)是一种以绝对位置编码形式实现的相对位置编码,其核心思想如下式所示:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mo stretchy="false">(</mo><msub><mi>R</mi><mi>m</mi></msub><mi>q</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo stretchy="false">(</mo><msub><mi>R</mi><mi>n</mi></msub><mi>k</mi><mo stretchy="false">)</mo><mo>=</mo><msup><mi>q</mi><mi>T</mi></msup><msub><mi>R</mi><mrow><mi>n</mi><mo>−</mo><mi>m</mi></mrow></msub><mi>k</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">(R_m q)^T (R_n k) = q^T R_{n-m} k \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0997em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2583em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span><span class="tag"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>位置 m 处的 q 与位置 n 处的 k 的乘积与它们的距离 n - m 相关,这反映了位置编码的相对性.上式中 R 的定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>R</mi><mrow><mi>d</mi><mo separator="true">,</mo><mi>m</mi></mrow></msub><mo>=</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center center center center center center center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋱</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mo lspace="0em" rspace="0em">⋯</mo></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">R_{d,m} = \\begin{pmatrix}
\\cos m\\theta_1 &amp; -\\sin m\\theta_1 &amp; 0 &amp; 0 &amp; \\cdots &amp; 0 &amp; 0 \\\\
\\sin m\\theta_1 &amp; \\cos m\\theta_1 &amp; 0 &amp; 0 &amp; \\cdots &amp; 0 &amp; 0 \\\\
0 &amp; 0 &amp; \\cos m\\theta_2 &amp; -\\sin m\\theta_2 &amp; \\cdots &amp; 0 &amp; 0 \\\\
0 &amp; 0 &amp; \\sin m\\theta_2 &amp; \\cos m\\theta_2 &amp; \\cdots &amp; 0 &amp; 0 \\\\
\\vdots &amp; \\vdots &amp; \\vdots &amp; \\vdots &amp; \\ddots &amp; \\vdots &amp; \\vdots \\\\
0 &amp; 0 &amp; 0 &amp; 0 &amp; \\cdots &amp; \\cos m\\theta_{d/2} &amp; -\\sin m\\theta_{d/2} \\\\
0 &amp; 0 &amp; 0 &amp; 0 &amp; \\cdots &amp; \\sin m\\theta_{d/2} &amp; \\cos m\\theta_{d/2}
\\end{pmatrix} \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,5484c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-5492c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.44em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span><span style="top:-6.24em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span><span style="top:-5.04em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span><span style="top:-3.84em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span><span style="top:-1.98em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋱</span></span></span><span style="top:-0.78em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span><span style="top:0.42em;"><span class="pstrut" style="height:3.5em;"></span><span class="mord"><span class="minner">⋯</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">0</span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,5409
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-5544c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>为了使其值随距离增加而衰减,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\theta_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 取值为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>10000</mn><mrow><mo>−</mo><mn>2</mn><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup><mo separator="true">,</mo><mspace width="1em"/><mi>i</mi><mo>=</mo><mn>1</mn><mo separator="true">,</mo><mn>2</mn><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\theta_i = 10000^{-2(i-1)/d}, \\quad i = 1, 2, \\ldots, d/2 \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1324em;vertical-align:-0.1944em;"></span><span class="mord">1000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.938em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span><span class="mclose mtight">)</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span><span class="mord">/2</span></span><span class="tag"><span class="strut" style="height:1.188em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>原始 GLM 提出了一种二维绝对位置编码方法来建模跨度内和跨度间的位置信息.在 GLM-130B 中,与原始 GLM 使用的二维位置编码不同,我们回归传统的一维位置编码.然而,我们最初认为二维形式不能直接应用于 RoPE.作为替代方案,在 GLM-130B 中我们简单地移除了原始 GLM 中使用的第二维度,因为我们发现用于 <a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 生成的单向注意力 mask 子矩阵也指示了 token 顺序.这一观察使我们根据以下策略将 GLM-130B 的位置编码转化为一维的:</p>
<ul>
<li>对于被短跨度损坏的序列,我们丢弃第二维位置编码.</li>
<li>对于被末尾长跨度损坏的序列,我们将位置 id 改为一维 0, 1, ..., s - 1,生成的 token 将只是从最后一个上下文 token s - 1 延伸第一维位置编码.</li>
</ul>
<blockquote>
<p><strong>[设计动机]</strong> 从一维到二维的权衡</p>
<p>原始 GLM(Du et al., 2022)使用二维位置编码来同时建模「跨度内」和「跨度间」的位置信息.第一维表示 token 在原始序列中的绝对位置,第二维表示 token 在其所属被 mask 跨度内的相对位置.这种设计对于空白填充任务很直观,但 GLM-130B 发现它在扩展到 100B 规模时引入了不必要的复杂性.GLM-130B 的 insight 是:<a href="%E5%8F%A5%E5%AD%90%E4%B8%AD%E7%9A%84%E7%9F%AD%E7%A9%BA%E7%99%BD,%E5%85%B6%E9%95%BF%E5%BA%A6%E5%8A%A0%E8%B5%B7%E6%9D%A5%E5%8D%A0%E8%BE%93%E5%85%A5%E7%9A%84%E4%B8%80%E5%AE%9A%E6%AF%94%E4%BE%8B.">MASK</a> 生成时的单向注意力 mask 子矩阵已经隐含了 token 顺序信息,因此第二维是冗余的.论文脚注提到他们后来发现了实现二维 RoPE 的方法(来自 RoPE 作者的博客),但训练已经进行了数周,无法回头.这个决策体现了大模型训练中的一个常见困境:架构上的理想选择与工程上的现实约束之间的冲突.</p>
</blockquote>
<p><strong>前馈网络.</strong> 一些近期改进 transformer 架构的努力集中在 FFN 上,包括用 GLU 替代它(被 PaLM 采用).研究表明使用 GLU 可以提高模型性能,这与我们的实验结果一致(参见表 8).具体地,我们使用带 GeLU(Hendrycks &amp; Gimpel, 2016)激活的 GLU:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>FFN</mtext><mtext>GeGLU</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">;</mo><msub><mi>W</mi><mn>1</mn></msub><mo separator="true">,</mo><mi>V</mi><mo separator="true">,</mo><msub><mi>W</mi><mn>2</mn></msub><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mtext>GeLU</mtext><mo stretchy="false">(</mo><mi>x</mi><msub><mi>W</mi><mn>1</mn></msub><mo stretchy="false">)</mo><mo>⊙</mo><mi>x</mi><mi>V</mi><mo stretchy="false">)</mo><msub><mi>W</mi><mn>2</mn></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{FFN}_{\\text{GeGLU}}(x; W_1, V, W_2) = (\\text{GeLU}(xW_1) \\odot xV) W_2 \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord text"><span class="mord">FFN</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">GeGLU</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord text"><span class="mord">GeLU</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>为了保持与原始 FFN 相同的参数,前馈大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi><mi>n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{ffn}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">n</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>(通常为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><msub><mi>d</mi><mi>H</mi></msub></mrow><annotation encoding="application/x-tex">4d_H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord">4</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>H</mi></msub></mrow><annotation encoding="application/x-tex">d_H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为隐藏维度)被减少到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><msub><mi>d</mi><mi>H</mi></msub></mrow><annotation encoding="application/x-tex">\\frac{8}{3} d_H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,因为额外引入了 V.</p>
<p><strong>PE 和 FFN 的消融实验.</strong> 为了验证我们的 PE 和 FFN 选择,我们在实验中通过在随机 50G 中英文混合语料上预训练 GLM-Base(110M)来测试它们.我们比较绝对 PE 与两个近期流行的相对 PE 变体 RoPE(Chowdhery et al., 2022)和 ALiBi(Press et al., 2021).对于 FFN,我们比较原始 FFN 与使用 GeLU 激活的 Gate Linear Unit.表 8 的结果显示,ALiBi 和 RoPE 都改善了测试集上的困惑度,RoPE 的改善更显著,而使用 GeGLU 可以进一步改善模型性能.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">测试 PPL</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM-Base</td>
<td align="center">24.58</td>
</tr>
<tr>
<td align="left">+ ALiBi</td>
<td align="center">24.14</td>
</tr>
<tr>
<td align="left">+ RoPE</td>
<td align="center">22.95</td>
</tr>
<tr>
<td align="left">+ RoPE + GeGLU</td>
<td align="center"><strong>22.31</strong></td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 8.</em></p>
<h4 id="b-4-lsxbhfx">B.4 流水线并行分析</h4>
<p>在流水线并行中,每个阶段包括三个操作(参见图 11(a)):前向(记为 F)、后向(记为 B)和优化器步骤(记为 U).然而,朴素的顺序流水线实现导致不可忍受的大量气泡.改进的 Gpipe(Huang et al., 2019)(参见图 11(b))策略通过将数据拆分为 micro-batch 来大幅减少气泡;micro-batch 越多,越多的阶段可以在一次迭代中同时计算.近期的 PipeDream-Flush(Narayanan et al., 2021)(参见图 11(c))额外通过交织来自不同阶段的前向和后向来优化 GPU 内存使用,以减少前向激活的内存占用.</p>
<blockquote>
<p>图 11: 不同流水线策略及其概念比较.数据来源: 原文 Figure 11.</p>
</blockquote>
<p>我们通过假设流水线段数为 p,micro-batch 数为 m,每 micro-batch 的前向和后向时间分别为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>f</mi></msub></mrow><annotation encoding="application/x-tex">t_f</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9012em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>b</mi></msub></mrow><annotation encoding="application/x-tex">t_b</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">b</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 来分析 GLM-130B 预训练中的气泡占比.在理想情况下,前向和后向占用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mrow><mi>i</mi><mi>d</mi><mi>e</mi><mi>a</mi><mi>l</mi></mrow></msub><mo>=</mo><mi>m</mi><mo stretchy="false">(</mo><msub><mi>t</mi><mi>f</mi></msub><mo>+</mo><msub><mi>t</mi><mi>b</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">t_{ideal} = m(t_f + t_b)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal">m</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">b</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>.但在实践中,默认的流水线传递策略导致 p - 1 个前向传播和 p - 1 个后向传播气泡,总时间为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mrow><mi>b</mi><mi>u</mi><mi>b</mi><mi>b</mi><mi>l</mi><mi>e</mi></mrow></msub><mo>=</mo><mo stretchy="false">(</mo><mi>p</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">(</mo><msub><mi>t</mi><mi>f</mi></msub><mo>+</mo><msub><mi>t</mi><mi>b</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">t_{bubble} = (p - 1)(t_f + t_b)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">bb</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">b</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>,因此气泡占比为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>bubble-ratio</mtext><mo>=</mo><mfrac><msub><mi>t</mi><mrow><mi>b</mi><mi>u</mi><mi>b</mi><mi>b</mi><mi>l</mi><mi>e</mi></mrow></msub><mrow><msub><mi>t</mi><mrow><mi>i</mi><mi>d</mi><mi>e</mi><mi>a</mi><mi>l</mi></mrow></msub><mo>+</mo><msub><mi>t</mi><mrow><mi>b</mi><mi>u</mi><mi>b</mi><mi>b</mi><mi>l</mi><mi>e</mi></mrow></msub></mrow></mfrac><mo>=</mo><mfrac><mrow><mi>p</mi><mo>−</mo><mn>1</mn></mrow><mrow><mi>m</mi><mo>+</mo><mi>p</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{bubble-ratio} = \\frac{t_{bubble}}{t_{ideal} + t_{bubble}} = \\frac{p - 1}{m + p - 1} \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">bubble-ratio</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1281em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2921em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">bb</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">bb</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2019em;vertical-align:-0.8804em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.2019em;vertical-align:-0.8804em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>对于更大的 micro-batch 数,气泡百分比将被降低到可接受的水平.特别是,GPipe Huang et al. (2019)中的实验表明,当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>≥</mo><mn>4</mn><mi>p</mi></mrow><annotation encoding="application/x-tex">m \\geq 4p</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">4</span><span class="mord mathnormal">p</span></span></span></span> 时,总流水线气泡时间百分比由于反向传播中的前向重计算技术(允许计算通信的一些重叠)被降低到可忽略的水平,从而表明流水线模型并行引入的气泡不会严重消耗训练效率.</p>
<p>一般地,为了充分利用硬件,通常将模型放入由多个节点组成的模型并行组中,并尝试使用每个节点的全部内存.在这种情况下,我们可以自由调整流水线模型并行和张量模型并行的比例.由于数据并行几乎不影响计算时间,我们假设数据并行规模为 d = 1,节点总数为 n,张量并行规模为 t,流水线并行规模为 p,满足 n = t x p,此时气泡占比为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>bubble-ratio</mtext><mo>=</mo><mfrac><mrow><mi>n</mi><mi mathvariant="normal">/</mi><mi>t</mi><mo>−</mo><mn>1</mn></mrow><mrow><mi>m</mi><mo>+</mo><mi>n</mi><mi mathvariant="normal">/</mi><mi>t</mi><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{bubble-ratio} = \\frac{n/t - 1}{m + n/t - 1} \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">bubble-ratio</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span><p>从上述方程可以看出,增加张量并行的规模将进一步降低气泡比例.然而,张量并行规模不能无限增加,这会导致计算粒度降低并在超过某个阈值后大幅增加通信成本.因此,我们可以得出结论,张量模型并行的规模应随模型大小缓慢增加,但不超过单机中的显卡数量.在 GLM-130B 的训练中,实验表明最优张量并行规模为 t = 4,并未扩展到 DGX-A100 系统中的 t = 8 规模.其他参数为 m = 176, p = 8,计算得到的气泡占比仅为 3.8%,这足以展示流水线模型并行的效率.</p>
<h4 id="b-5-tljs">B.5 推理加速</h4>
<p>模型的朴素 PyTorch 实现易于阅读和运行,但对于 LLM 来说可能慢得无法忍受.基于 NVIDIA 的 FasterTransformer,我们花费两个月时间用 C++ 实现 GLM-130B 以加速推理,包括以下主要优化:</p>
<ul>
<li>优化耗时操作,如 GeGLU、Layer Normalization 和 SoftMax.</li>
<li>减少 GPU 内核调用次数(例如将 MultiheadAttention 融合为一个计算内核).</li>
<li>在调用 cuBLAS 时指定最佳性能的算法.</li>
<li>通过预先转置模型参数来提高计算效率.</li>
<li>在 FP16 计算中使用 half2 以加倍 half 的访问带宽和计算吞吐量.</li>
</ul>
<p>我们目前将 GLM-130B 的完整 FasterTransformer 实现打包成一个即插即用的 docker 镜像以方便用户,并且我们仍在努力通过只改一行代码将其适配到我们的 Pytorch 实现.表 9 展示了我们的加速 GLM-130B 实现与迄今为止 Huggingface Transformers 中默认可用的 BLOOM-176B 实现之间的比较.我们的 GLM-130B 实现可以比 BLOOM-176B 的 Pytorch 实现快 7.0 到 8.4 倍.加速 LLM 以获得可容忍的响应速度的努力对其普及可能极其关键.</p>
<table>
<thead>
<tr>
<th align="left">解码 Token</th>
<th align="center">BLOOM-176B</th>
<th align="center">GLM-130B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">128</td>
<td align="center">36.76s</td>
<td align="center">4.40s (x8.4)</td>
</tr>
<tr>
<td align="left">512</td>
<td align="center">137.91s</td>
<td align="center">18.77s (x7.3)</td>
</tr>
<tr>
<td align="left">1024</td>
<td align="center">287.93s</td>
<td align="center">39.81s (x7.2)</td>
</tr>
<tr>
<td align="left">2048</td>
<td align="center">631.81s</td>
<td align="center">89.88s (x7.0)</td>
</tr>
</tbody></table>
<p><em>注: 使用 8 x A100(80G)进行 16 位精度解码.数据来源: 原文 Table 9.</em></p>
<h4 id="b-6-jhyczfx">B.6 激活异常值分析</h4>
<p>如前几节所述,GLM-130B 的权重可以量化到 INT4 以大幅削减推理中的参数冗余.然而,我们还发现 GLM-130B 的激活(即层之间的隐藏状态)无法被适当量化,因为它们包含值异常值,如并发文献也指出的(Dettmers et al., 2022).</p>
<p>GLM-130B 的特殊之处在于其 30% 的维度可能呈现值异常值(参见图 12),而其他基于 GPT 的 LLM(例如 OPT-175B 和 BLOOM 176B)只有非常少的异常维度(Dettmers et al., 2022).因此,(Dettmers et al., 2022)中提出的对异常维度进行高精度计算分解矩阵乘法的解决方案不适用于 GLM-130B.</p>
<blockquote>
<p>图 12: GLM-130B 激活中异常值的分布.纵轴表示隐藏状态维度,横轴表示输入句子中的 token.数据来源: 原文 Figure 12.</p>
</blockquote>
<p>我们研究了这些异常值是否可以在 LLM 量化中被忽略,答案有趣的是「不」.这些值可能比正常激活值大几个数量级(参见图 13).虽然大多数值(占隐藏状态中 99.98% 的维度)保持在 6 以下,但这两个异常维度可以达到 50 甚至超过 100.它们被推测为 GLM-130B 以及潜在的其他 LLM 记忆某些固定世界或语言知识的重要线索,因此在量化中移除或忽略它们可能导致显著的性能退化.</p>
<blockquote>
<p>图 13: GLM-130B 激活异常值的绝对值尺度.数据来源: 原文 Figure 13.</p>
</blockquote>
<h4 id="b-7-qzlh">B.7 权重量化</h4>
<p><strong>B.7.1 预备知识</strong></p>
<p><strong>Absmax Quantization</strong> 是一种对称量化,将范围 [-absmax(x), absmax(x)] 映射到 [-(2^b - 1), 2^b - 1]:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>s</mi><mi>x</mi></msub><mo>=</mo><mfrac><mrow><mtext>absmax</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msup><mn>2</mn><mrow><mi>b</mi><mo>−</mo><mn>1</mn></mrow></msup><mo>−</mo><mn>1</mn></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(7)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">s_x = \\frac{\\text{absmax}(x)}{2^{b-1} - 1} \\tag{7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7751em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">absmax</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.1963em;vertical-align:-0.7693em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">7</span></span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>x</mi><mi>q</mi></msub><mo>=</mo><mtext>round</mtext><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">/</mi><msub><mi>s</mi><mi>x</mi></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(8)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">x_q = \\text{round}(x / s_x) \\tag{8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">round</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">8</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>x</mi></msub></mrow><annotation encoding="application/x-tex">s_x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为缩放因子,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>q</mi></msub></mrow><annotation encoding="application/x-tex">x_q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 为量化结果,b 为位宽.</p>
<p><strong>Zeropoint Quantization</strong> 是一种非对称量化,将范围 [min(x), max(x)] 映射到 [-(2^b - 1), 2^b - 1]:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>s</mi><mi>x</mi></msub><mo>=</mo><mfrac><mrow><mtext>max</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>−</mo><mtext>min</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msup><mn>2</mn><mi>b</mi></msup><mo>−</mo><mn>2</mn></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(9)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">s_x = \\frac{\\text{max}(x) - \\text{min}(x)}{2^b - 2} \\tag{9}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7751em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">b</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">2</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">max</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">min</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.1963em;vertical-align:-0.7693em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">9</span></span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>z</mi><mi>x</mi></msub><mo>=</mo><mtext>round</mtext><mo stretchy="false">(</mo><mtext>min</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><msub><mi>s</mi><mi>x</mi></msub><mo stretchy="false">)</mo><mo>+</mo><msup><mn>2</mn><mrow><mi>b</mi><mo>−</mo><mn>1</mn></mrow></msup><mo>−</mo><mn>1</mn></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(10)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">z_x = \\text{round}(\\text{min}(x) / s_x) + 2^{b-1} - 1 \\tag{10}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">round</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">min</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9824em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span><span class="tag"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">10</span></span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>x</mi><mi>q</mi></msub><mo>=</mo><mtext>round</mtext><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">/</mi><msub><mi>s</mi><mi>x</mi></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>z</mi><mi>x</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(11)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">x_q = \\text{round}(x / s_x) - z_x \\tag{11}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">round</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">11</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>z</mi><mi>x</mi></msub></mrow><annotation encoding="application/x-tex">z_x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为零点.</p>
<p><strong>Col/Row-wise Quantization.</strong> 对权重矩阵使用单一缩放因子通常导致更多量化误差,因为单一异常值会导致所有其他元素的量化精度下降.一种常见的变通方案是按行或按列对权重矩阵进行分组,每组单独量化并有独立的缩放因子.</p>
<h4 id="b-8-lhsz">B.8 量化设置</h4>
<p>我们的目标是尽可能节省 GPU 内存而不损害模型性能.实践中,我们只量化线性层(它们占据了 transformer 参数的大部分),而保持输入/输出嵌入、层归一化和偏置项不变.在 INT4 量化精度下,两个 INT4 权重被压缩为一个 INT8 权重以节省 GPU 内存使用.采用 Absmax 量化,因为我们发现它足以维持模型性能,并且比 zeropoint 量化计算更高效.在推理期间,只有量化权重存储在 GPU 内存中,线性层的 FP16 权重将在运行时反量化.</p>
<p><strong>B.8.1 不同规模的量化结果</strong></p>
<p>110M 到 10B 规模的 GLM 模型来自 GLM 原始论文(Du et al., 2022).尽管较小规模 GLM 的架构与 GLM-130B 不同,我们相信训练目标是量化的关键因素.表 10 显示了不同规模 GLM 和 BLOOM 家族模型在 LAMBADA 数据集上不同量化方法的性能.几乎所有模型在 INT8 精度下都保持性能.总体而言,GLM 在 INT4 精度下随着规模扩大比 BLOOM 保持更好的性能.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">BLOOM-560M</th>
<th align="center">BLOOM-1B1</th>
<th align="center">BLOOM-3B</th>
<th align="center">BLOOM-7B</th>
<th align="center">BLOOM-176B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Original</td>
<td align="center">31.40%</td>
<td align="center">40.68%</td>
<td align="center">48.30%</td>
<td align="center">54.91%</td>
<td align="center">64.37%</td>
</tr>
<tr>
<td align="left">Absmax INT8, col-wise</td>
<td align="center">26.12%</td>
<td align="center">40.69%</td>
<td align="center">48.83%</td>
<td align="center">55.33%</td>
<td align="center">65.03%</td>
</tr>
<tr>
<td align="left">Absmax INT4, col-wise</td>
<td align="center">9.30%</td>
<td align="center">17.43%</td>
<td align="center">37.88%</td>
<td align="center">38.04%</td>
<td align="center">34.83%</td>
</tr>
<tr>
<td align="left">Absmax INT4, row-wise</td>
<td align="center">21.37%</td>
<td align="center">35.80%</td>
<td align="center">40.95%</td>
<td align="center">46.75%</td>
<td align="center">NaN</td>
</tr>
<tr>
<td align="left">Zeropoint INT4, col-wise</td>
<td align="center">11.51%</td>
<td align="center">26.51%</td>
<td align="center">41.65%</td>
<td align="center">46.63%</td>
<td align="center">48.26%</td>
</tr>
<tr>
<td align="left">Zeropoint INT4, row-wise</td>
<td align="center">24.95%</td>
<td align="center">33.05%</td>
<td align="center">43.63%</td>
<td align="center">49.41%</td>
<td align="center">NaN</td>
</tr>
<tr>
<td align="left"></td>
<td align="center">GLM-110M</td>
<td align="center">GLM-335M</td>
<td align="center">GLM-2B</td>
<td align="center">GLM-10B</td>
<td align="center">GLM-130B</td>
</tr>
<tr>
<td align="left">:---</td>
<td align="center">:---:</td>
<td align="center">:---:</td>
<td align="center">:---:</td>
<td align="center">:---:</td>
<td align="center">:---:</td>
</tr>
<tr>
<td align="left">Original</td>
<td align="center">29.36%</td>
<td align="center">48.51%</td>
<td align="center">68.19%</td>
<td align="center">72.35%</td>
<td align="center">80.21%</td>
</tr>
<tr>
<td align="left">Absmax INT8, row-wise</td>
<td align="center">29.25%</td>
<td align="center">48.69%</td>
<td align="center">68.12%</td>
<td align="center">72.37%</td>
<td align="center">80.21%</td>
</tr>
<tr>
<td align="left">Absmax INT4, row-wise</td>
<td align="center">3.26%</td>
<td align="center">38.25%</td>
<td align="center">62.62%</td>
<td align="center">71.03%</td>
<td align="center">79.47%</td>
</tr>
<tr>
<td align="left">Zeropoint INT4, row-wise</td>
<td align="center">5.45%</td>
<td align="center">42.64%</td>
<td align="center">64.74%</td>
<td align="center">70.50%</td>
<td align="center">80.63%</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 10.</em></p>
<p><strong>B.8.2 权重分布分析</strong></p>
<p>为了实现 INT4 权重量化,我们分析了 GLM-130B 和对应模型 BLOOM-176B 主要线性层的权重值分布(参见图 15).横轴表示权重值,纵轴表示对数尺度上具有该值的权重数量.正如我们所见,BLOOM-176B 中主要是 w2 线性层呈现偏斜分布,这会阻碍对称量化.相反,GLM-130B 的 w2 形状良好,没有很多异常值和偏斜分布,从而为其几乎没有性能损失的 INT4 量化铺平了道路.</p>
<blockquote>
<p>图 15: GLM-130B(橙色,attn-dense, attn-qkv, glu-w1, glu-w2)和 BLOOM-176B(蓝色,attn-dense, attn-qkv, ffn-w1, ffn-w2)前 28 个 transformer 层的线性层权重值分布.数据来源: 原文 Figure 15.</p>
</blockquote>
<h4 id="b-9-gxgyxrsy">B.9 贡献归因消融实验</h4>
<p>我们分析 GLM-130B 所利用技术的贡献归因.一系列消融实验已在论文中呈现,为方便阅读,它们原本分散在全文中.这里我们将其总结为以下列表供读者参考:</p>
<ul>
<li>普通 PostLN 和 DeepNorm 的消融: 图 3.</li>
<li>双向/单向注意力的消融: 图 2(LAMBADA)、表 16(条件 NLG)、图 17(SuperGLUE).</li>
<li>Embedding Layer Gradient Shrink(EGS)的消融: 图 4.</li>
<li>位置编码和 FFN 的消融: 附录 B.3 表 8.</li>
</ul>
<p>此外,我们进行以下研究来证明 GLM-130B 中使用的两个最有影响力的技术 —— GLM 目标和多任务指令预训练(MIP) —— 的贡献.</p>
<p><strong>GLM 目标和 MIP.</strong> 从头消融一个 100B 规模的 LLM 可能过于昂贵.作为替代,我们尽力在 GLM-10B(Du et al., 2022)中发布的英文版本,无 MIP)上比较 GLM 目标和 MIP.我们额外训练了一个从中间阶段原始Checkpoint初始化、带 MIP(5%)的 GLM-10B,以匹配原始仅自监督 GLM-130B 的相同训练 token.此次 MIP 遵循 T0(Sanh et al., 2022)中的精确数据集设置和 GLM-130B 中的信息提取数据集,以允许对某些类型任务(例如 NLI)的正确评估.图 14 显示了消融结果.在我们测试的 8 个数据集中,我们发现 GLM 目标是改进的主要贡献者(从 GLM(uni)到 GLM + MIP(bi)).例如,它在 LAMBADA 中贡献了 73% 的改进,在 MMLU 中贡献了 90% 的改进,这两个都是非常广泛采用的 LLM 挑战性基准.至于 MIP,在某些数据集(例如 WiC、ReCoRD、Hellaswag)上,MIP 甚至可能损害性能.而对于与文本相似性和共指相关的数据集(例如 WSC、BoolQ、ANLI R1),MIP 是主要贡献者.这可能是因为文本相似性和共指挑战,人们通常有意构造来测试语言模型能力,在构成人们日常书面文本的自监督语料中很少见.因此,MIP 训练主要有助于弥合自监督预训练与这些任务之间的差距.</p>
<blockquote>
<p>图 14: GLM 目标和 MIP 训练的贡献归因分析.数据来源: 原文 Figure 14.</p>
</blockquote>
<h4 id="b-10-jyjx">B.10 经验教训</h4>
<p><strong>Lesson 1 (双向架构).</strong> 双向注意力 GLM 是一个强大的架构替代方案,除了 GPT 之外.</p>
<p><strong>Lesson 2 (平台感知配置).</strong> 基于所用集群和并行策略配置 LLM 以压榨硬件潜力.</p>
<p><strong>Lesson 3 (改进的 Post-LN).</strong> 反直觉地,DeepNorm —— 一种 Post-LN —— 是稳定 GLM-130B 的选项.</p>
<p><strong>Lesson 4 (训练稳定性分类).</strong> LLM 遭受的意外训练不稳定系统性和数值性地出现.</p>
<p><strong>Lesson 5 (系统性不稳定: FP16).</strong> 尽管 FP16 引发更多不稳定,但它使训练和推理能在多样化平台上进行.</p>
<p><strong>Lesson 6 (数值不稳定: Embedding Gradient Shrink).</strong> 将嵌入层梯度收缩到其 0.1 可以解决大多数数值不稳定问题.</p>
<p><strong>Lesson 7 (GLM 的 INT4 量化扩展规律).</strong> GLM 具有在 GPT 风格 BLOOM 中未观察到的独特 INT4 权重量化扩展规律.</p>
<p><strong>Lesson 8 (未来方向).</strong> 要创建强大的 LLM,主要关注点可以是 1) 更多更好的数据,2) 更好的架构和预训练目标,以及 3) 更充分的训练.</p>
<hr>
<h3 id="c-sjjypgxj">C 数据集与评估细节</h3>
<p>(附录 C 包含大量数据集评估的详细设置和结果表格,主要包括: C.1 MIP 的 74 个数据集列表, C.2 DeepStruct 的数据和提示, C.3 GPT-3/BLOOM/OPT 结果来源, C.4 Pile 测试集评估, C.5 BIG-bench-lite 评估, C.6 MMLU 评估, C.7 CLUE/FewCLUE 评估, C.8 自然语言生成, C.9 Winograd 风格任务, C.10 闭卷问答, C.11 常识推理, C.12 固定标签数据集(NLI 案例研究), C.13 SuperGLUE, C.14 思维链提示.这些细节已在正文中涵盖核心结果,完整的提示模板和每个任务的详细数字请参考原文附录.)</p>
<hr>
<h3 id="d-kzglyyxnl">D 扩展规律与涌现能力</h3>
<p>扩展预训练语言模型已被证明能持续提升广泛下游任务的性能.历史上,涌现能力 —— 无法从小规模预测的能力 —— 突然出现.为了说明这一点,我们进行了大量实验来探索扩展特性和涌现能力.遵循先前文献(Wei et al., 2022b),我们基于观察将 NLP 任务分为两类.</p>
<p><strong>对数扩展能力任务(参见图 19):</strong> 任务性能随模型参数数量对数增长.典型任务和数据集包括 LAMBADA、Wikitext-103、Wikitext-2、Penn Tree Bank.</p>
<p><strong>涌现能力任务(参见图 20):</strong> 任务性能仅在模型参数数量达到某个阈值时才飙升.典型任务和数据集包括: MMLU、hindu_knowledge、crass_ai、implicatures、understanding_fables、modified_arithmetic、implicit_relations 和 gre_reading_comprehension(来自 BIG-bench(Srivastava et al., 2022)).</p>
<blockquote>
<p>图 19: GLM-130B 的对数扩展能力任务.数据来源: 原文 Figure 19.</p>
</blockquote>
<blockquote>
<p>图 20: GLM-130B 的涌现能力任务.数据来源: 原文 Figure 20.</p>
</blockquote>
<p>与(Wei et al., 2022b)中的观察一致,我们展示了 GLM-130B 也呈现出与其他 LLM(如 GPT-3、LaMDA 和 PaLM)相似的两种扩展行为.尽管为什么和如何 LLM 呈现这些迷人特性仍不清楚,GLM-130B 为所有研究人员提供了开放的机会来测试和理解它们背后的原因.</p>
<hr>
<h3 id="e-gxz">E 贡献者</h3>
<p>GLM-130B 项目于 2021 年 12 月构思,其预训练部分于 2022 年 7 月 3 日完成,评估和应用仍在进行中.在此过程中,我们经历了各种技术和工程挑战(参见附录 F 和图 21 了解细节).如果没有多个团队的合作 —— 清华大学 KEG、PACMAN 和 THUNLP 组,以及 Zhipu.AI —— 达到当前状态是不可能的.</p>
<hr>
<h3 id="f-glm-130b-js">F GLM-130B 简史</h3>
<p>GLM-130B 项目于 2021 年 12 月在清华大学 KEG 的一次头脑风暴会议中构思.我们坚信预训练一个高精度的语言模型具有价值,特别是同时支持中文和英文.尽管 GPT-3(Brown et al., 2020)是这项努力的先驱,但它对世界上大多数人不可用.此外,它仅支持英文.因此我们决定启动 GLM-130B 项目.请注意,我们去年构建的 WuDao 1.75T 模型是一个具有 480 个混合专家(MoE)的稀疏模型,而非像 GPT-3 那样的稠密模型.我们当时的目标是训练一个双语预训练稠密模型,在下游任务上具有高精度,并向世界上每个人开放 —— 任何人在任何地方都可以下载它并在具有适当 GPU 的单台服务器上使用它.</p>
<p>这个雄心勃勃的项目很快面临几个重要挑战:</p>
<ul>
<li>缺乏计算资源: 没有组织愿意赞助如此大的项目并将其免费公开.</li>
<li>缺乏鲁棒的预训练算法: 尽管 GPT-3 在英文语料上取得成功,但如何训练一个高精度的双语模型(同时支持英文和中文)尚不清楚.</li>
<li>缺乏快速推理方案: 由于目标是让模型向公众开放,我们需要设计低资源需求的快速推理方案来运行模型.</li>
</ul>
<p>对于预训练算法,我们最终选择了 GLM(Du et al., 2022),因为其在实践中的高性能.经过几轮讨论和探索,我们最终决定训练一个 1300 亿参数的 GLM 模型,因为这样的大小使其可能在单台 A100(40G * 8)服务器上运行推理.</p>
<p>我们第一次尝试训练模型是在 2022 年 1 月,Shortly after 我们收到一小笔 GPU 赞助用于测试运行.然而,我们很快意识到我们大大低估了在如此规模(&gt;100B)下预训练模型的技术难度.似乎预训练一个高精度的 100B 规模模型与训练 10B 规模模型有很大不同.由于频繁的随机硬件故障、模型梯度爆炸、算法中意外的过度内存使用、新 Megatron 和 DeepSpeed 框架中 3D 流水线的 debug、无法从优化器状态恢复、进程间阻塞的 TCP 响应,以及许多许多意外的「bug」,项目被多次延迟.清华大学 PACMAN 团队在这个困难时期向我们伸出援手,一起成功修复了大多数「bug」.</p>
<p>到 3 月,我们仍然缺乏计算资源,但幸运的是有机会在几个其他平台上尝试测试运行,包括昇腾 910、海光 DCU、NVIDIA 和申威.立即的挑战是使我们的训练代码适应这些不同平台,因为底层算子差异很大.此外,它引入了许多新问题: 不支持大维度向量快速计算的元素级算子、阻碍收敛的各种问题 —— 输入嵌入的大梯度范数、原生 Post-LN、Pre-LN 和 Sandwich-LN、数据加载器状态种子、以及 Softmax 和 Attention 中的计算精度选择 —— 以及我们自己犯的众多错误.在我们所有慷慨合作伙伴的巨大帮助下,我们最终成功使预训练算法在所有平台上可运行 —— 坦白说,这是该项目的一个令人惊讶的成就.GLM-130B 的时间线(图 21)涵盖了截至本文撰写时我们遇到和解决的大多数问题.</p>
<blockquote>
<p>图 21: 训练 GLM-130B 遇到和解决的主要问题时间线.数据来源: 原文 Figure 21.</p>
</blockquote>
<p>4 月 26 日,我们收到了来自 Zhipu.AI 的慷慨计算赞助 —— 一家旨在教机器像人类一样思考的 AI 创业公司.再经过一周的测试,我们终于于 5 月 6 日在其 96 台 A100(40G * 8)服务器上启动了 GLM-130B 模型的训练.此外,Zhipu.AI 还派了一个团队帮助评估预训练模型并构建演示网站.</p>
<p>训练期跨越两个月,在此期间我们开始开发一个工具包,允许在低资源设置下使用交换技术和量化进行 GLM-130B 推理.尽管它已经是其规模中最易访问的模型,但连同来自清华 NLP 的合作伙伴,我们一直在探索普及化硬件平台的极限,这将真正使 100B 规模模型对尽可能多的人可访问.到目前为止,我们成功实现了 GLM-130B 的 INT4 权重量化.重要的是,GLM-130B 的 INT4 版本无后训练时与未压缩原版相比性能退化可忽略,同时只消耗未压缩版本所需 GPU 内存的 25%,从而支持在 4 块 RTX 3090 Ti(24G)或 8 块 RTX 2080 Ti(11G)上有效推理.我们将尝试进一步降低资源需求,并持续向社区更新这一重要工作项.</p>
<hr>
<h3 id="g-ggfdyx">G 更广泛的影响</h3>
<p>本论文介绍了一个拥有 1300 亿参数的开源双语预训练语言模型.目前大多数超过 1000 亿参数的预训练语言模型由政府和大公司拥有(Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021).少数(Brown et al., 2020; Lieber et al., 2021)提供有限的有偿推理 API.相比之下,GLM-130B 的权重和代码对任何对 LLM 感兴趣的人开放.此外,我们通过加速实现和 INT4 量化显著降低了推理的硬件需求.本文可能对研究社区、个人开发者和小公司以及社会产生更广泛的影响.</p>
<p><strong>对 AI 研究的影响.</strong> 大多数研究机构负担不起预训练大语言模型的巨额成本.因此,大多数研究人员,除了政府和大公司的雇员外,只能访问有限的有偿推理 API.有了推理 API,研究人员只能将模型输出作为黑盒分析,这限制了潜在工作的范围.有了 GLM-130B,研究人员可以分析模型参数和对应特定输入的内部状态,从而深入研究 LLM 的理论、能力和缺陷.研究人员还可以修改模型架构和权重,以验证提出的改进 LLM 的算法(Zhu et al., 2020; Cao et al., 2021; Hase et al., 2021; Mitchell et al., 2022).</p>
<p>有了 INT4 量化,GLM-130B 可以在普及化 GPU(如 4 块 RTX 3090 或 8 块 RTX 2080 Ti)上执行推理,这些可以从云服务轻松访问.因此,无法负担强大数据中心 GPU 服务器(如 DGX-A100)的研究人员也可以利用 GLM-130B.</p>
<p><strong>对个人开发者和小公司的影响.</strong> 目前,希望将 LLM 集成到业务中的个人开发者和小公司只能选择付费推理 API.增加的成本可能阻碍他们的尝试.相反,GLM-130B 可以部署在他们拥有或可通过云服务访问的普及化硬件上,以降低成本.此外,他们可以利用蒸馏技术(Sanh et al., 2019; Jiao et al., 2020)获得在其特定任务上保持可比性能的更小模型.虽然一些开发者可能缺乏独立完成部署和蒸馏的能力,但我们相信随着 GLM-130B 和未来更多开放 LLM 的出现,相应的工具包和服务提供商将变得更加可用.</p>
<p>我们还注意到,目前大多数 LLM 应用基于提示工程,部分原因是推理 API 的限制.在在线客服等下游场景中,公司积累了包含领域知识的大量人工生成数据.有了开源权重和代码,开发者可以在自己的数据上微调 GLM-130B 以弥补领域知识的差距.</p>
<p><strong>社会影响.</strong> 大语言模型,连同其他不同模态的机器学习模型(例如图像(Ramesh et al., 2021; Ding et al., 2021; Saharia et al.)和视频(Hong et al., 2022)),可能被用于生成有害应用的合成文本,如电话营销欺诈、政治宣传和个人骚扰,如(Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021)中所讨论的.我们不预期模型在使用后会产生任何危险输出,特别是针对脆弱和历史上处于不利地位的群体.</p>
<p>虽然有些人认为限制对 LLM 的访问可以防止此类有害应用,但我们主张促进 LLM 包容性可以更好地防御 LLM 造成的潜在伤害.目前,只有政府和大公司负担得起预训练 LLM 的巨额成本.不能保证拥有大量财务资源预训练 LLM 的组织不会用它来做坏事.如果没有访问此类 LLM,个人甚至无法意识到 LLM 在伤害中的作用.相反,发布开放 LLM 可以为所有研究人员提供访问和透明度,并促进减少 LLM 潜在伤害的研究,如识别合成文本的算法(Gehrmann et al., 2019)或检测假新闻(Li et al., 2021).此外,众所周知 LLM 可能遭受公平性、偏见、隐私和真实性方面的问题(Zhang et al., 2021; Lin et al., 2022; Liang et al., 2021; Bender et al., 2021).开放 LLM 可以揭示模型参数和对应特定输入的内部状态,而非提供黑盒模型的 API.总之,研究人员可以深入分析 LLM 的缺陷并提出改进算法来解决问题.</p>
<hr>
<h3 id="h-hjyx">H 环境影响</h3>
<p>大语言模型的主要担忧之一是其巨大的能源使用和相关的碳排放(Strubell et al., 2019; Lacoste et al., 2019; Patterson et al., 2021; Bender et al., 2021).GPT-3 被估计使用 500 吨碳排放足迹(CO2eq)(Patterson et al., 2021).我们在 60 天的训练过程中总共消耗了 442.4 MWh 电力.给定当地电网 0.5810 kg/kWh 的碳效率,预训练释放了 257.01 公吨 CO2.这大约是 GPT-3 碳足迹的一半,可能归因于高效的并行策略和 NVIDIA 的硬件改进.碳排放大约相当于 18 个普通美国人的年排放量.然而,我们相信随着 GLM-130B 的发布,更多用于复现 100B 规模 LLM 的碳排放可以被节省.</p>
<hr>
<h2 id="syb">术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM</td>
<td align="left">General Language Model, 通用语言模型,采用自回归空白填充目标的双向注意力模型</td>
</tr>
<tr>
<td align="left">MIP</td>
<td align="left">Multi-task Instruction Pre-training, 多任务指令预训练</td>
</tr>
<tr>
<td align="left">EGS</td>
<td align="left">Embedding Layer Gradient Shrink, 嵌入层梯度收缩</td>
</tr>
<tr>
<td align="left">DeepNorm</td>
<td align="left">一种 Post-LN 变体,通过缩放残差连接稳定深层网络训练</td>
</tr>
<tr>
<td align="left">RoPE</td>
<td align="left">Rotary Positional Embedding, 旋转位置编码</td>
</tr>
<tr>
<td align="left">GeGLU</td>
<td align="left">使用 GeLU 激活的 GLU(Gated Linear Unit)变体</td>
</tr>
<tr>
<td align="left">3D Parallel</td>
<td align="left">数据并行 + 张量并行 + 流水线并行的组合策略</td>
</tr>
<tr>
<td align="left">HFU</td>
<td align="left">Hardware FLOPs Utilization, 硬件 FLOPs 利用率</td>
</tr>
<tr>
<td align="left">MFU</td>
<td align="left">Model FLOPs Utilization, 模型 FLOPs 利用率</td>
</tr>
<tr>
<td align="left">INT4 Quantization</td>
<td align="left">4 位整数量化,GLM-130B 在无后训练情况下实现</td>
</tr>
<tr>
<td align="left">CLUE</td>
<td align="left">Chinese Language Understanding Evaluation, 中文语言理解评估基准</td>
</tr>
<tr>
<td align="left">FewCLUE</td>
<td align="left">Chinese Few-shot Learning Evaluation Benchmark, 中文小样本学习评估基准</td>
</tr>
<tr>
<td align="left">BPB</td>
<td align="left">Bits Per Byte, 每字节比特数,语言建模评估指标</td>
</tr>
<tr>
<td align="left">ICAT</td>
<td align="left">Idealized Context Association Test Score, StereoSet 偏见评估综合指标</td>
</tr>
</tbody></table>
<hr>
<h2 id="hxgssy">核心公式索引</h2>
<table>
<thead>
<tr>
<th align="center">编号</th>
<th align="left">公式</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="center">(1)</td>
<td align="left">DeepNorm 公式</td>
<td align="left">带缩放残差连接的层归一化,用于稳定训练</td>
</tr>
<tr>
<td align="center">(2)</td>
<td align="left">EGS 公式</td>
<td align="left">嵌入层梯度收缩,防止梯度爆炸</td>
</tr>
<tr>
<td align="center">(3)</td>
<td align="left">RoPE 核心等式</td>
<td align="left">旋转位置编码的相对位置性质</td>
</tr>
<tr>
<td align="center">(4)</td>
<td align="left">RoPE 旋转矩阵</td>
<td align="left">分块对角旋转矩阵定义</td>
</tr>
<tr>
<td align="center">(5)</td>
<td align="left">RoPE 频率公式</td>
<td align="left">旋转角度随维度衰减的公式</td>
</tr>
<tr>
<td align="center">(6)</td>
<td align="left">GeGLU FFN</td>
<td align="left">带门控线性单元的前馈网络</td>
</tr>
<tr>
<td align="center">(7)</td>
<td align="left">流水线气泡占比</td>
<td align="left">GPipe 风格流水线的气泡时间分析</td>
</tr>
<tr>
<td align="center">(8)</td>
<td align="left">3D 并行气泡占比</td>
<td align="left">结合张量并行的气泡公式</td>
</tr>
<tr>
<td align="center">(9)</td>
<td align="left">Absmax 量化</td>
<td align="left">对称量化公式</td>
</tr>
<tr>
<td align="center">(10)</td>
<td align="left">Zeropoint 量化</td>
<td align="left">非对称量化公式</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>历史定位</strong></p>
<p>GLM-130B 发布于 2022 年 10 月,是中国首个开源的 100B 规模稠密双语 LLM,也是当时全球第三个开源的 100B+ 模型(前两个为 OPT-175B 和 BLOOM-176B).与后者不同,GLM-130B 在性能上首次超越了 GPT-3,证明了非 GPT 架构(双向注意力 + 自回归填充)在大规模下的竞争力.其 INT4 量化能力和对消费级 GPU 的支持,极大地降低了学术界使用大模型的门槛.从技术谱系看,GLM-130B 是 GLM-4、GLM-4.5、GLM-5 等后续模型的起点,其训练稳定性经验(DeepNorm、EGS)和平台感知设计思维被后续模型继承和发展.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-glm-130b-dsjxz","text":"2 GLM-130B 的设计选择"},{"level":3,"id":"2-1-glm-130b-djg","text":"2.1 GLM-130B 的架构"},{"level":3,"id":"2-2-glm-130b-dyxlsz","text":"2.2 GLM-130B 的预训练设置"},{"level":3,"id":"2-3-ptgzbhclhmxpz","text":"2.3 平台感知并行策略和模型配置"},{"level":2,"id":"3-glm-130b-dxlwdx","text":"3 GLM-130B 的训练稳定性"},{"level":2,"id":"4-glm-130b-z-rtx-2080-ti-sdtl","text":"4 GLM-130B 在 RTX 2080 Ti 上的推理"},{"level":2,"id":"5-jg","text":"5 结果"},{"level":3,"id":"5-1-yyjm","text":"5.1 语言建模"},{"level":3,"id":"5-2-mmlu","text":"5.2 MMLU"},{"level":3,"id":"5-3-big-bench","text":"5.3 BIG-bench"},{"level":3,"id":"5-4-zwyyljpg-clue","text":"5.4 中文语言理解评估(CLUE)"},{"level":2,"id":"6-xggz","text":"6 相关工作"},{"level":2,"id":"7-jlyjyjx","text":"7 结论与经验教训"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-ll-pjydxpg","text":"A 伦理: 偏见与毒性评估"},{"level":4,"id":"a-1-pjcl-crow-s-pairs","text":"A.1 偏见测量: CrowS-Pairs"},{"level":4,"id":"a-2-pjcl-stereo-set","text":"A.2 偏见测量: StereoSet"},{"level":4,"id":"a-3-chyljc-ethos","text":"A.3 仇恨言论检测: ETHOS"},{"level":4,"id":"a-4-dxsc-real-toxic-prompts","text":"A.4 毒性生成: RealToxicPrompts"},{"level":3,"id":"b-jsxj","text":"B 技术细节"},{"level":4,"id":"b-1-tokenization","text":"B.1 Tokenization"},{"level":4,"id":"b-2-layer-normalization","text":"B.2 Layer Normalization"},{"level":4,"id":"b-3-wzbmhqkwl","text":"B.3 位置编码和前馈网络"},{"level":4,"id":"b-4-lsxbhfx","text":"B.4 流水线并行分析"},{"level":4,"id":"b-5-tljs","text":"B.5 推理加速"},{"level":4,"id":"b-6-jhyczfx","text":"B.6 激活异常值分析"},{"level":4,"id":"b-7-qzlh","text":"B.7 权重量化"},{"level":4,"id":"b-8-lhsz","text":"B.8 量化设置"},{"level":4,"id":"b-9-gxgyxrsy","text":"B.9 贡献归因消融实验"},{"level":4,"id":"b-10-jyjx","text":"B.10 经验教训"},{"level":3,"id":"c-sjjypgxj","text":"C 数据集与评估细节"},{"level":3,"id":"d-kzglyyxnl","text":"D 扩展规律与涌现能力"},{"level":3,"id":"e-gxz","text":"E 贡献者"},{"level":3,"id":"f-glm-130b-js","text":"F GLM-130B 简史"},{"level":3,"id":"g-ggfdyx","text":"G 更广泛的影响"},{"level":3,"id":"h-hjyx","text":"H 环境影响"},{"level":2,"id":"syb","text":"术语表"},{"level":2,"id":"hxgssy","text":"核心公式索引"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/01-glm-130b/01-glm-130b-dhlwjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/01-glm-130b/01-glm-130b-dhlwjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-130B: An Open Bilingual Pre-trained Model 顶会论文精译</h1>
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
