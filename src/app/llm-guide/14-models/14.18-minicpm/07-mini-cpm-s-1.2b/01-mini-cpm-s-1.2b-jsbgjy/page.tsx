"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-S-1.2B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: ProSparse: Introducing and Enhancing Intrinsic Activation Sparsity within Large Language Models
原文链接: <a href="https://arxiv.org/abs/2402.13516">https://arxiv.org/abs/2402.13516</a>
PDF 链接: <a href="https://arxiv.org/pdf/2402.13516.pdf">https://arxiv.org/pdf/2402.13516.pdf</a>
发布日期: 2024 年 2 月(arXiv), COLING 2025 接收
发布机构: 清华大学计算机系/人工智能研究院, 中科院计算所, 腾讯机器学习平台
对应模型: MiniCPM-S-1B(基于 MiniCPM-1B 经 ProSparse 技术改造的稀疏激活版本)</p>
</blockquote>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>近年来,大语言模型(Large Language Models, LLMs)在广泛的 NLP 任务上取得了突破性进展(Brown et al., 2020; Wei et al., 2021; Ouyang et al., 2022; OpenAI, 2023; Achiam et al., 2023)。然而,LLM 的部署与推理所需的巨大计算成本构成了严峻挑战(Aminabadi et al., 2022; Pope et al., 2023)。利用激活稀疏性(activation sparsity)是提升推理效率的最有前景的技术之一(Liu et al., 2023; Song et al., 2023),其原理是跳过那些对最终输出贡献微弱的激活输出元素所对应的冗余计算。</p>
<p>将 ReLU(Rectified Linear Unit,线性整流单元)作为激活函数是早期 LLM 中实现内在激活稀疏性(strinsic activation sparsity)的直接方法(Raffel et al., 2020; Zhang et al., 2022a)。然而,近期的 LLM 普遍采用非 ReLU 激活函数,如 GELU(Gaussian Error Linear Unit,高斯误差线性单元,一种平滑近似的 ReLU 变体)(Hendrycks &amp; Gimpel, 2016)和 Swish(Elfwing et al., 2018)。尽管这些非 ReLU LLM 也可能展现出激活稀疏性(Zhang et al., 2024),但这种稀疏性是人为施加的——通过搜索自适应激活阈值实现的(即非内在的),可能丢失微小的神经元输出并导致性能下降。</p>
<p>为了在追求稀疏性加速的同时避免性能退化,ReLUfication 任务被提出,旨在将基于 ReLU 的内在激活稀疏性引入非 ReLU LLM。初步方法(Zhang et al., 2022b, 2024)直接将激活函数替换为 ReLU。但由于这种替换无法克服原始密集激活分布所施加的固有局限,插入式和偏移式 ReLU 激活函数(Mirzadeh et al., 2023)被引入,通过激进地偏移激活分布来强制实现更高稀疏度。然而,现有方法未能同时达到令人满意的稀疏度和避免性能退化。</p>
<p>在本文中,我们提出了一种简单且有效的 ReLUfication 方法,名为 <strong>&quot;ProSparse&quot;</strong>,帮助非 ReLU LLM 在不牺牲性能的前提下获得高激活稀疏度。如图 1 所示,ProSparse 包含三个步骤:激活函数替换(activation function substitution)、渐进式稀疏正则化(progressive sparsity regularization)和激活阈值偏移(activation threshold shifting)。</p>
<p>第一步是将激活函数替换为 ReLU 并进行持续训练。如前所述,这本身难以达到满意的稀疏度。因此,在第二步中,我们对 LLM 中 FFN(Feed-Forward Network,前馈网络)的中间激活输出施加稀疏正则化(Ma et al., 2019)以追求更高稀疏度。考虑到固定正则化因子可能带来的性能风险(Georgiadis, 2019; Kurtz et al., 2020; Li et al., 2022),我们在多个阶段中渐进地增大正则化因子,包括一个平坦的预热阶段和多个沿平缓正弦曲线递增的阶段。这种渐进正则化为模型提供了更多时间适应不断增大的正则化,避免激活分布的激进偏移,从而缓解性能退化。最后一步采用 FATReLU(Fixed Activation Threshold ReLU,固定激活阈值 ReLU)(Kurtz et al., 2020),将 ReLU 的激活阈值偏移到正值,剪除影响较小的神经元以进一步提升稀疏度。</p>
<blockquote>
<p>译者注: 这里的设计动机值得细品。为什么偏偏是 ReLU？因为 ReLU 的输出天然带有零值——<code>max(x, 0)</code> 对所有负输入直接输出 0。这个看似简单的性质,恰好对应了&quot;某些神经元对当前输入毫无贡献&quot;的物理直觉。但现代 LLM 为什么弃用 ReLU 转向 Swish/GELU？因为这些平滑激活函数在训练初期提供了更好的梯度流。ProSparse 的洞察是: 训练完成后,模型的激活分布已经足够稳定,此时将 Swish &quot;还原&quot;为 ReLU 不会导致灾难性崩溃,反而能释放巨大的推理加速潜力。这是一种&quot;训练时用平滑函数,推理时用稀疏函数&quot;的分阶段策略。</p>
</blockquote>
<p>在实验中,我们将 ProSparse 应用于 LLaMA2(Touvron et al., 2023b)和端侧规模的 MiniCPM(Hu et al., 2024)的 ReLUfication。我们成功地为 LLaMA2-7B、LLaMA2-13B 和 MiniCPM-1B 分别获得了 <strong>89.32%</strong>、<strong>88.80%</strong> 和 <strong>87.89%</strong> 的激活稀疏度,且在各 LLM 基准测试上的性能与原始 Swish 激活版本相当。这些结果在所有开源 LLaMA 版本中达到了最稀疏的激活水平,在端侧规模模型中也极具竞争力。</p>
<p>进一步的推理加速实验证明了更高激活稀疏度的 LLM 具有显著的实用加速潜力。我们分别采用近似算法和精确算法对具有不同稀疏度的模型进行推理测试。对于近似算法,我们使用 PowerInfer(Song et al., 2023)——一种为稀疏激活 LLM 量身定制的前沿加速方案,但其可能因激活预测器的错误而导致推理不准确。对于精确算法,我们实现并开源了两个 GPU 算子,利用 ReLU 激活 FFN 计算中的输入侧和输出侧稀疏性。实验结果表明,更高稀疏度的模型在两种算法下都能实现更显著的推理加速(例如,使用 PowerInfer 最高可达 <strong>4.52×</strong> 加速)。</p>
<p>此外,我们还进行了全面的分析,以厘清激活稀疏度与正则化因子之间的定量关系,使 ProSparse 获得的激活稀疏度更加可控。我们还讨论了渐进式 L1 正则化的合理性、对稀疏激活模型进行 SFT(Supervised Fine-Tuning,监督微调)的经验方法,以及不同数据集或层之间的稀疏度分布差异。</p>
<blockquote>
<p>译者注: 论文在摘要中直接给出了 MiniCPM-1B 的 87.89% 稀疏度数字,这让我意识到这篇论文并不仅仅是一篇通用方法论文——MiniCPM-S(即 ProSparse 版 MiniCPM-1B)是作者们实际发布的模型。这种&quot;方法论文 + 模型发布&quot;的双重定位,使论文的实验部分既有方法层面的消融,也有端到端的产品级验证。对端侧部署场景而言,87.89% 的稀疏度意味着 FFN 层的计算量理论上可以削减近九成,这对手机等算力受限设备的意义不言而喻。</p>
</blockquote>
<hr>
<h2 id="2-ybzsyxggz">2 预备知识与相关工作</h2>
<p>本节讨论如何提升 LLM 的推理效率。关于 LLM 的更多综述工作请参阅 Zhao et al. (2023),关于 L1 正则化的相关工作请参阅附录 A。</p>
<h3 id="2-1-llm-tljs">2.1 LLM 推理加速</h3>
<p>效率一直是各类 AI 应用中的关键话题(Chen et al., 2023b)。LLM 规模的持续增长带来了推理计算的指数级增长,使得 LLM 的部署成为一项艰巨挑战(Kaplan et al., 2020; Liu et al., 2023)。为降低 LLM 推理所需的计算成本,各类模型压缩或解码加速方法被提出,例如量化(Jacob et al., 2018; Nagel et al., 2019; Zhao et al., 2019; Bai et al., 2022; Xiao et al., 2023; Yao et al., 2023)、剪枝(Hoefler et al., 2021; Ma et al., 2023; Sun et al., 2023; Frantar &amp; Alistarh, 2023; Xia et al., 2023)、蒸馏(Tang et al., 2019; Touvron et al., 2021; Gu et al., 2023; Hsieh et al., 2023)和高效采样方法(Leviathan et al., 2023; Wang et al., 2023; Chen et al., 2023a; Miao et al., 2023)。尽管这些方法在推理加速等场景中已被证明有效,但它们都没有利用 LLM 内在的机制。</p>
<h3 id="2-2-jhxsx">2.2 激活稀疏性</h3>
<p>近期工作(Li et al., 2022; Liu et al., 2023; Song et al., 2023)注意到某些 LLM 内在的激活稀疏性及其在推理加速中的潜力。激活稀疏性指的是: 在特定输入下,激活输出中存在大量零值或可忽略的元素,这些元素对应的模型参数(即神经元)对 LLM 输出的影响微弱。这些弱贡献参数被视为&quot;未激活&quot;的,在推理中可以被跳过以节省计算资源。值得注意的是,利用激活稀疏性与模型压缩和高效采样是正交的,可以轻易结合。另一个值得注意的事实是激活稀疏性与剪枝的根本区别,详见附录 A。</p>
<h3 id="2-3-re-l-ufication">2.3 ReLUfication</h3>
<p>激活稀疏性天然存在于 ReLU 激活架构中(Li et al., 2022),从 LLM(Raffel et al., 2020; Zhang et al., 2022a)到视觉模型(Dosovitskiy et al., 2020)。然而,近期的 LLM 如 Falcon(Almazrouei et al., 2023)和 LLaMA(Touvron et al., 2023b)普遍采用非 ReLU 激活函数如 GELU(Hendrycks &amp; Gimpel, 2016)和 Swish(Elfwing et al., 2018),不具备内在激活稀疏性。</p>
<p>因此,为了在不从头训练 ReLU 激活 LLM 的情况下利用激活稀疏性的优势,许多工作开展了 ReLUfication,将稀疏的基于 ReLU 的激活引入非 ReLU LLM。Zhang et al. (2022b) 通过激活函数替换和额外训练,将 GELU 激活的 BERT(Devlin et al., 2018)转换为 ReLU 激活版本。ReluLLaMA 和 ReluFalcon 对 Falcon 和 LLaMA 应用了类似的范式(Zhang et al., 2024)。由于激活替换本身无法达到满意的稀疏度——主要因为未处理的原始密集激活分布的固有限制——插入式和偏移式 ReLU 激活函数被引入(Mirzadeh et al., 2023),对激活分布进行激进偏移。尽管这些方法声称能达到接近 95% 的稀疏度,但我们在实验中无法复现这些结果(详见第 4.4 节第 3 段),稀疏度仍然有限。相比之下,ProSparse 是一种旨在同时实现高稀疏度和缓解性能退化的 ReLUfication 方法。</p>
<blockquote>
<p>译者注: 这里需要梳理一下 ReLUfication 的技术谱系。最早的尝试是直接替换(Zhang et al., 2022b)——把 GELU 换成 ReLU 再训一训,简单粗暴但效果有限。然后 Mirzadeh et al. (2023) 提出了偏移 ReLU(<code>max(x-b, 0)</code>),通过引入可学习的偏置 b 来强制更多神经元归零,声称能达到 95% 稀疏度。但作者们无法复现这个结果——这是一个很有意思的学术诚实声明。ProSparse 走的是第三条路: 不激进偏移分布,而是用渐进式正则化&quot;温和地&quot;把激活推向零。从工程角度看,渐进式方法通常更稳健,因为它给模型留出了适应空间,而不是一次性把分布拍扁。</p>
</blockquote>
<hr>
<h2 id="3-ff">3 方法</h2>
<h3 id="3-1-dyyfh">3.1 定义与符号</h3>
<p>为方便后续阐述,此处详细定义激活稀疏性。由于激活函数主要存在于 LLM 的 FFN 中,我们首先讨论 FFN 的计算过程。给定隐藏维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{model}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和中间维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{ff}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>,门控 FFN(gated FFN,近期 LLM 中最广泛采用的 FFN 架构(Dauphin et al., 2017; Shazeer, 2020))的计算过程可形式化为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi mathvariant="bold">s</mi><mo>=</mo><mi>σ</mi><mo stretchy="false">(</mo><mi mathvariant="bold">x</mi><msubsup><mi mathvariant="bold">W</mi><mi>s</mi><mi>T</mi></msubsup><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub><mo>=</mo><mi mathvariant="bold">s</mi><mo>⊙</mo><mo stretchy="false">(</mo><mi mathvariant="bold">x</mi><msubsup><mi mathvariant="bold">W</mi><mn>1</mn><mi>T</mi></msubsup><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><mtext>FFN</mtext><mo stretchy="false">(</mo><mi mathvariant="bold">x</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub><msubsup><mi mathvariant="bold">W</mi><mn>2</mn><mi>T</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{s} = \\sigma(\\mathbf{x}\\mathbf{W}_s^T), \\quad \\mathbf{x}_1 = \\mathbf{s} \\odot (\\mathbf{x}\\mathbf{W}_1^T), \\quad \\text{FFN}(\\mathbf{x}) = \\mathbf{x}_1\\mathbf{W}_2^T \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathbf">x</span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathbf">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathbf">x</span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord mathbf">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">x</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></msup></mrow><annotation encoding="application/x-tex">\\mathbf{x} \\in \\mathbb{R}^{d_{model}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathbf">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> 为输入隐藏状态,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi><mo separator="true">,</mo><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub></msup></mrow><annotation encoding="application/x-tex">\\mathbf{s}, \\mathbf{x}_1 \\in \\mathbb{R}^{d_{ff}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathbf">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> 分别为门控分数和中间输出,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span> 为激活函数,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⊙</mo></mrow><annotation encoding="application/x-tex">\\odot</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord">⊙</span></span></span></span> 表示逐元素乘法。<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">W</mi><mi>s</mi></msub><mo separator="true">,</mo><msub><mi mathvariant="bold">W</mi><mn>1</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow></msup></mrow><annotation encoding="application/x-tex">\\mathbf{W}_s, \\mathbf{W}_1 \\in \\mathbb{R}^{d_{ff} \\times d_{model}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8805em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span><span class="mbin mtight">×</span><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">W</mi><mn>2</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub></mrow></msup></mrow><annotation encoding="application/x-tex">\\mathbf{W}_2 \\in \\mathbb{R}^{d_{model} \\times d_{ff}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8361em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span><span class="mbin mtight">×</span><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> 为可学习权重。</p>
<p>我们将激活稀疏性(以下简称稀疏性)定义为: 对于特定输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">x</mi></mrow><annotation encoding="application/x-tex">\\mathbf{x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">x</span></span></span></span>,中间输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\mathbf{x}_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 中零元素(即未激活元素)的比例。LLM 的稀疏性通过平均稀疏性评估,定义为 LLM 所有层在大量输入数据上的稀疏性平均值。</p>
<p>本文聚焦于 ReLUfication 任务,即将使用非 ReLU 激活函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span>(如 GELU 或 Swish)的 LLM 转换为 ReLU 激活的 LLM,同时使平均稀疏性尽可能高并缓解性能退化。</p>
<blockquote>
<p>译者注: 公式 (1) 的门控 FFN 结构值得拆解一下。<code>s = σ(xWs^T)</code> 是门控分支,<code>x1 = s ⊙ (xW1^T)</code> 是主分支与门控的逐元素乘,最后 <code>FFN(x) = x1W2^T</code> 投影回隐藏维度。注意这里有两个权重矩阵 <code>Ws</code> 和 <code>W1</code>——SwiGLU 变体中 <code>σ</code> 通常是 Swish/GELU,而 <code>W1</code> 那一路没有激活函数(或说是线性激活)。ProSparse 的替换目标是 <code>σ</code>,也就是门控分支的激活函数。为什么只替换这个？因为稀疏性主要关注 <code>x1</code> 中的零值比例,而 <code>x1</code> 直接受门控 <code>s</code> 影响。将 <code>σ</code> 从 Swish 换为 ReLU 后,所有负门控值直接归零,对应的 <code>x1</code> 元素也自然为零。</p>
</blockquote>
<h3 id="3-2-pro-sparse">3.2 ProSparse</h3>
<p>我们提出 ProSparse 来实现上述目标。三个步骤经过精心设计,为非 ReLU LLM 引入和增强内在激活稀疏性: (1) 激活函数替换; (2) 渐进式稀疏正则化; (3) 激活阈值偏移。</p>
<h4 id="3-2-1-jhhsth">3.2.1 激活函数替换</h4>
<p>由于近期主流 LLM 对激活稀疏性缺乏关注,大多数采用非 ReLU 激活函数如 GELU 和 Swish,这些函数输出的零元素很少(即根据上述定义的激活稀疏性很低)。因此,ProSparse 的第一步是通过激活函数替换引入内在稀疏性: 将 FFN 的激活函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span> 替换为 ReLU,即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\sigma(x) = \\max(x, 0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span>,随后进行持续训练。这可以使零激活元素的比例显著增大,并让 LLM 初步适应新的 ReLU 激活。</p>
<h4 id="3-2-2-jjsxszzh">3.2.2 渐进式稀疏正则化</h4>
<p>然而,激活函数替换本质上不改变激活分布,这将潜在地把稀疏度限制在相对较低的水平。为了推动更高的稀疏度,一种典型方法是 L1 稀疏正则化(Li et al., 2022),它将 L1 正则化损失作为额外的训练目标引入。给定 LLM 中第 i 个 FFN 层的中间输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\mathbf{x}_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,正则化损失定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msubsup><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>e</mi><mi>g</mi></mrow><mi>i</mi></msubsup><mo stretchy="false">(</mo><mi>λ</mi><mo stretchy="false">)</mo><mo>=</mo><mi>λ</mi><mo>⋅</mo><mi mathvariant="normal">∥</mi><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub><msub><mi mathvariant="normal">∥</mi><mn>1</mn></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{reg}^i(\\lambda) = \\lambda \\cdot \\|\\mathbf{x}_1\\|_1 \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2578em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8747em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">λ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord">∥</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.2578em;vertical-align:-0.3831em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∥</mi><mo>⋅</mo><msub><mi mathvariant="normal">∥</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\|\\cdot\\|_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord">∥</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为 L1 范数算子,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 为正则化因子。对于具有 K 个 FFN 层的 LLM,总正则化损失为所有层损失之和,即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>e</mi><mi>g</mi></mrow></msub><mo stretchy="false">(</mo><mi>λ</mi><mo stretchy="false">)</mo><mo>=</mo><msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></msubsup><msubsup><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>e</mi><mi>g</mi></mrow><mi>i</mi></msubsup><mo stretchy="false">(</mo><mi>λ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{reg}(\\lambda) = \\sum_{i=1}^{K} \\mathcal{L}_{reg}^i(\\lambda)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">λ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3643em;vertical-align:-0.3831em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8247em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">λ</span><span class="mclose">)</span></span></span></span>。整体优化目标为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>l</mi><mi>m</mi></mrow></msub><mo>+</mo><msub><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>e</mi><mi>g</mi></mrow></msub><mo stretchy="false">(</mo><mi>λ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{lm} + \\mathcal{L}_{reg}(\\lambda)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">λ</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>l</mi><mi>m</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{lm}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为原始语言建模损失。</p>
<p>考虑到固定正则化因子可能导致的性能退化(Georgiadis, 2019; Kurtz et al., 2020; Li et al., 2022),我们提出<strong>渐进式稀疏正则化</strong>(progressive sparsity regularization),其中因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 被精心调度,在多个阶段中温和递增。更多细节请参阅附录 B。</p>
<p>具体而言,在预热阶段,我们将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 设为相对较小的常数,以防止激活分布的激进偏移并引入更高的初步稀疏度。接下来,在剩余的每个阶段(称为递增阶段)中,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 沿平滑正弦曲线从谷值递增至峰值。受余弦退火学习率调度器(Loshchilov &amp; Hutter, 2016)启发,我们选择正弦函数是因为其特殊趋势: 在谷值和峰值附近导数较小,使 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 在这两点附近不会激进增大。这为 LLM 提供了更多时间来适应激活分布以应对新增强的 L1 正则化。值得注意的是,每个阶段伴随一定数量的训练步数。步数和峰值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 值根据目标稀疏度和稳定性来选择。</p>
<blockquote>
<p>译者注: 渐进式正则化是 ProSparse 的核心创新点。让我用一个直观的比喻来理解: 固定的大正则化因子就像把模型一下子推下悬崖——稀疏度确实会飙升,但模型性能也会断崖式下跌。渐进式方法则是铺了一段阶梯,让模型一步步走下去,每走一步都有时间调整内部表示。正弦曲线的选择很精妙: 在阶段开始和结束时,λ 的变化率最慢(导数接近零),这给了模型&quot;适应期&quot;; 在阶段中间,λ 加速爬升,推动稀疏度继续增长。从优化理论的角度看,这类似于课程学习(curriculum learning)的思想——不要一次性给最难的任务,而是逐步增加难度。</p>
</blockquote>
<h4 id="3-2-3-jhyzpy">3.2.3 激活阈值偏移</h4>
<p>如近期工作所示,激活输出中存在大量非零但数值很小的元素,它们对最终结果影响甚微,可以被剪除以获得更高稀疏度(Zhang et al., 2024)。因此,我们通过将激活阈值偏移到正值,将 ReLU 转换为 FATReLU(Kurtz et al., 2020),即:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>σ</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>x</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>when </mtext><mi>x</mi><mo>≥</mo><mi>t</mi><mo separator="true">,</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>otherwise</mtext><mo separator="true">,</mo></mrow></mstyle></mtd></mtr></mtable></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\sigma(x) = \\begin{cases} x &amp; \\text{when } x \\geq t, \\\\ 0 &amp; \\text{otherwise}, \\end{cases} \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal">x</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">when </span></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">t</span><span class="mpunct">,</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">t &gt; 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6542em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> 为正阈值。只要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 被适当选择(详见附录 O),FATReLU 就能以可忽略的代价提升稀疏度(Zhang et al., 2024)。</p>
<blockquote>
<p>译者注: FATReLU 是最后一步&quot;微调&quot;。如果说渐进式正则化把 80% 的神经元推向了零,那么 FATReLU 就是把剩余 20% 中那些&quot;几乎为零&quot;的元素再筛掉一批。阈值 t 的选择是关键: t 太小,稀疏度提升有限; t 太大,可能剪掉有价值的信号。作者在附录 O 中给出了 t 的选择策略。从工程实现角度看,FATReLU 几乎是零成本的——它只是在 ReLU 的比较操作中把 0 换成了 t,没有额外的计算开销。但收益却是实实在在的: 表 1 显示带 FATReLU 的 ProSparse-7B 比不带(*)的版本稀疏度提升了约 1.5 个百分点。</p>
</blockquote>
<h3 id="3-3-sjtljs">3.3 实际推理加速</h3>
<p>为了超越基于 FLOPS(Floating Point Operations Per Second,每秒浮点运算次数)的理论分析(Mirzadeh et al., 2023),并确立 ProSparse 的实际价值,我们讨论如何在真实硬件上利用稀疏激活 LLM 实现推理加速,以及如何评估实际加速效果。我们考虑基于激活稀疏性的两类加速算法: 近似算法和精确算法。</p>
<h4 id="3-3-1-jsjssf">3.3.1 近似加速算法</h4>
<p>利用激活稀疏性,近期近似加速算法主要依赖<strong>激活预测器</strong>(activation predictors)——通常是小型神经网络——来预测给定特定输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">x</mi></mrow><annotation encoding="application/x-tex">\\mathbf{x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">x</span></span></span></span> 时稀疏中间输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\mathbf{x}_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 所指示的激活分布(Liu et al., 2023; Song et al., 2023)。这样,它们可以做出更明智的硬件分配或计算策略,避免在低贡献参数上浪费资源。然而,它们的效率和准确性很大程度上取决于预测器的性能,无效预测可能导致次优的硬件分配甚至推理不准确。因此,要从近似算法获得更多实际加速效果,高激活稀疏度和高可预测性两者缺一不可。</p>
<p>为此,我们关注加速分析的三个指标: <strong>激活召回率</strong>(activation recall)、<strong>预测稀疏度</strong>(predicted sparsity)和推理速度。前两个指标评估激活预测器的性能以及稀疏 LLM 的激活可预测性(Zhang et al., 2024)。对于推理速度,我们采用 PowerInfer(Song et al., 2023)——一种前沿的近似算法——来测量实际加速比。更多相关介绍和详细计算方法请参阅附录 C。</p>
<h4 id="3-3-2-jqjssf">3.3.2 精确加速算法</h4>
<p>针对不引入潜在推理不准确的加速需求,我们实现了两个硬件高效的稀疏 GPU 算子,并进行了系统级优化,如算子融合、合并内存访问和向量化,从而利用式 (1) 中 ReLU 激活 FFN 计算的输入侧和输出侧稀疏性。</p>
<p>具体而言,我们将 ReLU 激活的门控 FFN 重组为三个主要步骤,我们的两个算子分别负责步骤 (2) 和 (3):
(1) 密集矩阵-向量乘法算子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">x</mi><msubsup><mi mathvariant="bold">W</mi><mi>s</mi><mi>T</mi></msubsup></mrow><annotation encoding="application/x-tex">\\mathbf{x}\\mathbf{W}_s^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.247em;"></span><span class="mord mathbf">x</span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span>,直接由 cuBLAS 等供应商库支持;
(2) ReLU 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi><mo>⊙</mo><mo stretchy="false">(</mo><mi mathvariant="bold">x</mi><msubsup><mi mathvariant="bold">W</mi><mn>1</mn><mi>T</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathbf{s} \\odot (\\mathbf{x}\\mathbf{W}_1^T)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathbf">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0913em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathbf">x</span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4519em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2481em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的融合算子,利用<strong>输出侧稀疏性</strong>;
(3) 稀疏矩阵-向量乘法算子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">x</mi><mn>1</mn></msub><msubsup><mi mathvariant="bold">W</mi><mn>2</mn><mi>T</mi></msubsup></mrow><annotation encoding="application/x-tex">\\mathbf{x}_1\\mathbf{W}_2^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0894em;vertical-align:-0.2481em;"></span><span class="mord"><span class="mord mathbf">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4519em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2481em;"><span></span></span></span></span></span></span></span></span></span>,利用<strong>输入侧稀疏性</strong>。</p>
<p>我们分别采用这两个算子在步骤 (2) 和 (3) 中的单步加速比来反映稀疏 LLM 的实际精确加速潜力。实现细节请参阅附录 D。</p>
<blockquote>
<p>译者注: 这里作者们做了非常扎实的工程工作。近似算法(PowerInfer)虽然加速比更高(最高 4.52×),但依赖预测器的准确性——如果预测器猜错了哪些神经元会激活,就会漏算或错算,导致输出质量下降。精确算法(GPU 稀疏算子)虽然加速比稍低(2.44× 和 1.70×),但保证 100% 结果正确,因为它是真正跳过零元素的计算,而不是&quot;猜测&quot;哪些可以跳过。两个算子都开源了,这体现了 MiniCPM 团队的一贯风格: 不止发论文,还发代码。从端侧部署的角度看,精确算法可能更实用——手机用户不会接受偶尔的输出错误来换取速度。</p>
</blockquote>
<hr>
<h2 id="4-sy">4 实验</h2>
<h3 id="4-1-sysz">4.1 实验设置</h3>
<p>我们的训练数据包含语言建模数据集和指令微调数据集。对于评测,我们采用覆盖代码生成、常识推理、阅读理解等 7 类任务的全面基准测试。更多细节请参阅附录 E。</p>
<h3 id="4-2-ztjg">4.2 整体结果</h3>
<p>我们将 ProSparse 应用于 Swish 激活的 LLaMA2-7B、LLaMA2-13B(Touvron et al., 2023b)和 MiniCPM-1B(Hu et al., 2024)。获得的稀疏激活模型随后与其原始 Swish 激活版本进行比较。为全面起见,我们还考虑了 ReluLLaMA——唯一开源的基于 ReLU 的、从 LLaMA2 微调而来的 LLM。所有平均稀疏度值均在从训练数据集中采样的相同混合数据集上计算。更多超参数请参阅附录 L 和 O。</p>
<p>结果如表 1 所示(各独立基准测试的性能详见附录 G)。我们可以得出三个结论:</p>
<p><strong>(1) 有效性</strong>: ProSparse 同时对所有三个 Swish 激活模型实现了高稀疏度和可比的下游性能。ProSparse 获得的激活稀疏度显著高于 ReluLLaMA,在所有开源 LLaMA 版本中达到了最先进的水平,在端侧规模模型中也极具竞争力。</p>
<p><strong>(2) 规模泛化性</strong>: ProSparse 的有效性在三种模型规模下均保持一致。端侧规模模型(即 MiniCPM-1B)上的 promising 结果揭示了 ProSparse 以及激活稀疏性在端侧设备上的潜力,在这些设备上 LLM 的推理效率被极度强调。</p>
<p><strong>(3) 激活阈值偏移的效果</strong>: 基于不带激活阈值偏移的结果(即标有 &quot;*&quot; 的结果),我们可以证明该技术在提升稀疏度而不损害性能方面的有效性。值得注意的是,阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 必须被谨慎选择,详见附录 O。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>激活函数</th>
<th>稀疏度(%)</th>
<th>MMLU</th>
<th>BBH</th>
<th>HS</th>
<th>AGIEval</th>
<th>GaoKao</th>
<th>Avg</th>
</tr>
</thead>
<tbody><tr>
<td>LLaMA2-7B</td>
<td>Swish</td>
<td>0.00</td>
<td>45.90</td>
<td>36.01</td>
<td>59.17</td>
<td>30.39</td>
<td>27.93</td>
<td>39.80</td>
</tr>
<tr>
<td>ReluLLaMA-7B</td>
<td>ReLU</td>
<td>70.63</td>
<td>41.63</td>
<td>31.94</td>
<td>55.27</td>
<td>25.04</td>
<td>24.19</td>
<td>35.61</td>
</tr>
<tr>
<td>ProSparse-7B*</td>
<td>ReLU</td>
<td>87.86</td>
<td>44.88</td>
<td>34.22</td>
<td>57.50</td>
<td>28.75</td>
<td>27.13</td>
<td>38.50</td>
</tr>
<tr>
<td><strong>ProSparse-7B</strong></td>
<td><strong>ReLU</strong></td>
<td><strong>89.32</strong></td>
<td><strong>44.76</strong></td>
<td><strong>34.53</strong></td>
<td><strong>57.40</strong></td>
<td><strong>28.71</strong></td>
<td><strong>26.87</strong></td>
<td><strong>38.46</strong></td>
</tr>
<tr>
<td>LLaMA2-13B</td>
<td>Swish</td>
<td>0.00</td>
<td>54.66</td>
<td>41.57</td>
<td>64.91</td>
<td>34.71</td>
<td>32.88</td>
<td>45.75</td>
</tr>
<tr>
<td>ReluLLaMA-13B</td>
<td>ReLU</td>
<td>70.78</td>
<td>48.11</td>
<td>36.34</td>
<td>58.99</td>
<td>29.71</td>
<td>28.17</td>
<td>40.26</td>
</tr>
<tr>
<td>ProSparse-13B*</td>
<td>ReLU</td>
<td>87.32</td>
<td>54.08</td>
<td>39.59</td>
<td>63.18</td>
<td>33.59</td>
<td>31.33</td>
<td>44.35</td>
</tr>
<tr>
<td><strong>ProSparse-13B</strong></td>
<td><strong>ReLU</strong></td>
<td><strong>88.80</strong></td>
<td><strong>54.38</strong></td>
<td><strong>39.98</strong></td>
<td><strong>63.42</strong></td>
<td><strong>33.88</strong></td>
<td><strong>32.36</strong></td>
<td><strong>44.80</strong></td>
</tr>
<tr>
<td>MiniCPM-1B</td>
<td>Swish</td>
<td>0.00</td>
<td>53.42</td>
<td>35.85</td>
<td>55.50</td>
<td>29.29</td>
<td>27.36</td>
<td>40.28</td>
</tr>
<tr>
<td><strong>ProSparse-1B</strong></td>
<td><strong>ReLU</strong></td>
<td><strong>87.89</strong></td>
<td><strong>53.06</strong></td>
<td><strong>35.31</strong></td>
<td><strong>55.56</strong></td>
<td><strong>29.83</strong></td>
<td><strong>27.15</strong></td>
<td><strong>40.18</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 整体实验结果对比,包括激活稀疏度(%)和下游性能(%)。&quot;LLaMA2&quot; 和 &quot;MiniCPM&quot; 分别指原始 Swish 激活的 LLaMA2(Touvron et al., 2023b)和 MiniCPM(Hu et al., 2024)。&quot;ProSparse-7B*&quot;、&quot;ProSparse-13B*&quot; 和 &quot;ProSparse-1B*&quot; 表示不带激活阈值偏移的 ProSparse 版本。Avg 列为 5 项基准测试的平均值。数据取自原文 Table 1 及附录 G。</p>
</blockquote>
<blockquote>
<p>译者注: 表 1 的数据非常有力地证明了 ProSparse 的核心主张。看 ProSparse-7B: 89.32% 的稀疏度,但平均性能只比原始 Swish 版本低 0.34 个百分点(38.46 vs 39.80)。作为对比,ReluLLaMA-7B 只有 70.63% 稀疏度,性能却暴跌 4.19 个百分点。这说明 ProSparse 的渐进式正则化确实做到了&quot;鱼和熊掌兼得&quot;。更有趣的是 MiniCPM-1B 的结果: 87.89% 稀疏度下,平均性能 40.18,与原始版本的 40.28 几乎持平。对端侧模型来说,这意味着用户可以在不感知质量下降的情况下,获得近 90% 的 FFN 计算削减。</p>
</blockquote>
<h3 id="4-3-xsddjsxg">4.3 稀疏度的加速效果</h3>
<h4 id="jsjssf">近似加速算法</h4>
<p>在本节中,我们为每个稀疏 LLM 训练激活预测器,并在 PowerInfer(Song et al., 2023)上计算召回率、预测稀疏度和实际推理速度。由于每个 Transformer 层的 FFN 具有不同的激活分布以及不同的预测器,前两个指标从所有层的结果平均而来。注意,由于 PowerInfer 目前不支持 MiniCPM-1B 的架构,该模型未被测试。预测器训练细节请参阅附录 F。</p>
<p>如表 2 所示的结果表明,与 llama.cpp(一种不利用稀疏性的加速框架)相比,PowerInfer 最高实现了 <strong>4.52×</strong> 加速,揭示了基于稀疏性的加速的巨大潜力。此外,更高的激活稀疏度可以显著提升激活召回率、预测稀疏度和 PowerInfer 的推理速度。这证明了更稀疏激活的 LLM 在提升基于预测器的近似加速算法推理速度和缓解不准确推理问题方面的显著实用价值。ProSparse 在不牺牲性能的前提下达到高稀疏度,因此能从 PowerInfer 中获得最大的加速效果。</p>
<h4 id="jqjssf">精确加速算法</h4>
<p>进一步地,我们对具有不同稀疏度的 LLM 测量了两个稀疏 GPU 算子的平均单步 wall-clock 时间,这两个算子分别负责第 3.3 节中的步骤 (2) 和 (3)。如表 2 所示,更高的激活稀疏度能使基于 GPU 算子的精确算法更加高效。此外,我们的两个稀疏 GPU 算子也展示了令人满意的加速比,分别最高达 <strong>2.44×</strong> 和 <strong>1.70×</strong>,且对更大模型的加速效果更好。值得注意的是,尽管加速效果不如 PowerInfer 显著,但我们的 GPU 算子具有高可插拔性、无需预测器,且不受潜在推理不准确的影响。</p>
<table>
<thead>
<tr>
<th>设置</th>
<th>稀疏度(%)</th>
<th>召回率(%)</th>
<th>预测稀疏度(%)</th>
<th>推理速度(tok/s)</th>
<th>Step (2) 时间(us)</th>
<th>Step (3) 时间(us)</th>
</tr>
</thead>
<tbody><tr>
<td>Dense</td>
<td>0.00</td>
<td>—</td>
<td>—</td>
<td>13.29(llama.cpp)</td>
<td>56.80</td>
<td>85.16</td>
</tr>
<tr>
<td>ReluLLaMA-7B</td>
<td>70.63</td>
<td>94.51</td>
<td>72.73</td>
<td>33.82</td>
<td>43.89</td>
<td>73.51</td>
</tr>
<tr>
<td>ProSparse-7B*</td>
<td>87.86</td>
<td>97.70</td>
<td>87.33</td>
<td>48.45</td>
<td>32.31</td>
<td>58.78</td>
</tr>
<tr>
<td>ProSparse-7B</td>
<td>89.32</td>
<td>97.65</td>
<td>88.76</td>
<td><strong>60.08</strong></td>
<td><strong>23.25</strong></td>
<td><strong>50.05</strong></td>
</tr>
<tr>
<td>ProSparse-13B</td>
<td>88.80</td>
<td>97.64</td>
<td>88.26</td>
<td>38.90</td>
<td>38.17</td>
<td>72.01</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 不同稀疏度 LLM 的激活召回率(%)、预测稀疏度(%)、推理速度(tokens/秒, Dense 使用 llama.cpp,其余使用 PowerInfer),以及平均 wall-clock 时间(us, Dense 不使用稀疏 GPU 算子,其余使用)。&quot;Step (2)&quot; 和 &quot;Step (3)&quot; 对应第 3.3 节中的步骤。数据取自原文 Table 2。</p>
</blockquote>
<blockquote>
<p>译者注: 表 2 的数据让我对稀疏加速的实际落地有了更具体的认识。看 PowerInfer 一列: ProSparse-7B(89.32% 稀疏度)在 PowerInfer 上达到 60.08 tok/s,相比 llama.cpp 的 13.29 tok/s 是 4.52× 加速。但关键不只是加速比——看召回率: 89.32% 稀疏度对应的召回率是 97.65%,意味着预测器能以 97.65% 的准确率预测哪些神经元会被激活。这个召回率足够高,使得近似推理的输出质量与精确推理难以区分。再看 GPU 算子: Step (2) 从 56.80us 降到 23.25us(2.44×),Step (3) 从 85.16us 降到 50.05us(1.70×)。Step (3) 的加速比低于 Step (2),因为稀疏矩阵-向量乘法的稀疏度利用效率受内存访问模式影响更大——即使 89% 的元素为零,不规则的稀疏模式仍会导致 GPU 内存带宽利用率下降。</p>
</blockquote>
<h3 id="4-4-fxytl">4.4 分析与讨论</h3>
<h4 id="q1-l1-zzhdxgrh-qdzqsrh">Q1: L1 正则化的效果如何,其递增趋势如何?</h4>
<p>针对这个问题,我们考虑两个无正则化的 ReLUfication 基线: vanilla ReLU(Zhang et al., 2024)和 shifted ReLU(Mirzadeh et al., 2023)。两者仅分别包含将激活函数替换为 ReLU(即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\max(x, 0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span>)和偏移 ReLU(即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo>−</mo><mi>b</mi><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\max(x - b, 0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">b</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>b</mi></mrow><annotation encoding="application/x-tex">b</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">b</span></span></span></span> 为可学习偏置)。</p>
<p>如图 2 所示,我们首先考察上述两个基线和 ProSparse 的训练动态。&quot;Fixed L1&quot; 设置是一个固定正则化因子的参考设置。显然,训练阶段中稀疏度递增的部分仅包含施加正则化的阶段,即整个 &quot;Fixed L1&quot;、ProSparse 的预热阶段和递增阶段。因此,在所涉及的各种设置中,只有当施加非零 L1 正则化时,稀疏度趋势才是递增的。无论是 vanilla ReLU 还是 shifted ReLU,在没有正则化的情况下都无法推动更高的稀疏度。</p>
<p>然而,人们自然会担忧性能问题,因为额外的 L1 损失项不可避免地会影响语言建模目标的优化。针对这个问题,我们评估了上述方法在不同训练 token 数下的表现。通过实验(详见附录 H),虽然在有限的 34.60B token 下 ProSparse 与两个基线之间存在性能差距,但在充分的 89.13B token 下获得了可比性能,此时正则化可以更加平滑地递增,且最终稀疏度值接近有限 token 设置。因此,L1 正则化能够达到远高于无正则化方法的激活稀疏度,并在正则化因子以足够平滑的趋势递增时保持可比性能,代价只是可接受的训练 token 增加(即 54.53B,仅占 LLaMA2 预训练所用 2T token 的 2.73%)(Touvron et al., 2023b)。</p>
<blockquote>
<p>译者注: 这个发现非常关键。作者们诚实披露了&quot;有限 token&quot;和&quot;充分 token&quot;两种情况: 34.60B token 时 ProSparse 性能确实比基线差,但 89.13B token 时追平了。增量成本是 54.53B token,对于 LLaMA2-7B 的 2T 预训练总量来说只是 2.73% 的额外开销。这意味着 ProSparse 的实际部署成本是: 取一个已预训练好的 Swish 模型,额外用约 90B token 进行 ReLUfication 训练。这个成本对于开源社区来说完全可接受——不需要从头训练一个 ReLU 模型,而是在现有模型上做&quot;微调式&quot;的持续训练。</p>
</blockquote>
<h4 id="q2-rhddmbjhxsdz">Q2: 如何达到目标激活稀疏度值?</h4>
<p>考虑到达到更高稀疏度所需的额外训练成本,一个常见需求是: 如何在有限的计算预算下操纵 ProSparse 达到期望的稀疏度。关键挑战在于寻找合适的正则化因子。为此,我们设法找到最终激活稀疏度与正则化因子之间的定量关系,以避免经验性超参数搜索。</p>
<p>具体而言,我们在 ProSparse-7B 的不同训练阶段选择检查点(见表 6),施加恒定的正则化因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,然后恢复训练足够的步数(即不少于 4000 步)作为最后一个正则化阶段。在与 ProSparse-7B 相同的累计训练 token 数下,我们可以通过调节 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的值获得不同的激活稀疏度。图 3 的结果提供了两个观察: (1) 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 相对较大时(例如对于 ProSparse-7B,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub><mo>≥</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\lambda_S \\geq 10^{-2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span>),最终激活稀疏度主要取决于最后阶段的正则化因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>。(2) 激活稀疏度与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>λ</mi><mi>S</mi><mi>α</mi></msubsup></mrow><annotation encoding="application/x-tex">\\lambda_S^\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9698em;vertical-align:-0.2753em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6644em;"><span style="top:-2.4247em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2753em;"><span></span></span></span></span></span></span></span></span></span> 呈负指数关系。对于 ProSparse-7B,具体而言,稀疏度近似为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>100</mn><mo>−</mo><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>−</mo><mn>1.76</mn><mo>⋅</mo><msubsup><mi>λ</mi><mi>S</mi><mn>0.30</mn></msubsup><mo>+</mo><mn>3.49</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">100 - \\exp(-1.76 \\cdot \\lambda_S^{0.30} + 3.49)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">100</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord">−</span><span class="mord">1.76</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0894em;vertical-align:-0.2753em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-2.4247em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.30</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2753em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.49</span><span class="mclose">)</span></span></span></span>(即图 3 中的红色拟合曲线)。总之,要达到给定的相对较高稀疏度水平(例如稀疏度大于 80%,满足 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub><mo>≥</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\lambda_S \\geq 10^{-2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span>),唯一需要控制的是最后渐进正则化阶段的正则化因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>。因此,在固定模型规模下,ProSparse 在稀疏度调节方面是一种高度可控的 ReLUfication 方法。</p>
<blockquote>
<p>译者注: 图 3 的定量关系是 ProSparse 的又一大工程贡献。作者们发现稀疏度与正则化因子之间遵循一个负指数关系,并给出了拟合公式。这意味着开发者不需要反复试验来调参——给定目标稀疏度(比如 88%),可以直接反推出需要的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>。对于工业界来说,这种可控性比单纯的高稀疏度更有价值,因为它让稀疏化过程从&quot;炼丹&quot;变成了&quot;可预测的生产流程&quot;。</p>
</blockquote>
<h4 id="q3-jjsxszzhsfyx">Q3: 渐进式稀疏正则化是否有效?</h4>
<p>如果激活稀疏度主要取决于最终阶段的正则化因子,为什么我们需要渐进地增大因子? 答案在于性能考量。为了证实渐进式稀疏正则化(ProSparse 的第二步)的有效性,我们进行消融实验: 在激活函数替换后,使正则化因子在训练过程中保持恒定。将因子设为 0.1,我们获得了一个激活稀疏度为 88.62% 的模型,略低于 ProSparse-7B 的 89.32%。然而,在相同训练 token 数下,该模型的平均性能仅为 36.34%,显著低于 ProSparse-7B 的 38.46%。类似地,对于 13B 设置,我们获得了可比稀疏度 88.96% 但平均性能 42.85% 的模型,低于 ProSparse-13B(详见附录 I)。因此,渐进式稀疏正则化在缓解 ReLUfication 导致的性能退化方面是不可或缺的。</p>
<blockquote>
<p>译者注: 这个消融实验非常有力地证明了渐进式策略的价值。固定因子 0.1 达到了 88.62% 稀疏度(几乎和 ProSparse 的 89.32% 一样高),但性能暴跌 2.12 个百分点。这说明&quot;高稀疏度&quot;本身不是目标,&quot;高稀疏度 + 保性能&quot;才是。渐进式正则化通过让模型逐步适应,避免了激活分布的激进重构,从而保护了模型学到的语义表示。这再次印证了课程学习的直觉: 不要一次性给最难的任务。</p>
</blockquote>
<h4 id="q4-rhdxsjhmxjh-sft">Q4: 如何对稀疏激活模型进行 SFT?</h4>
<p>对 ProSparse 获得的稀疏激活模型进行 SFT 并非易事。我们训练 ProSparse-1B 的实践可以提供一些经验: SFT 可以应用于 ProSparse 获得的稀疏激活模型,但需要精心选择正则化因子,且该 SFT 正则化因子经验上小于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">\\lambda_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,以适应新注入的知识并避免性能退化。更多细节和观察请参阅附录 J。</p>
<blockquote>
<p>译者注: SFT 的正则化因子需要调小——这是一个很实用的经验。原因很直观: 预训练阶段模型主要学习通用语言表示,SFT 阶段注入的是任务特定的知识和格式。如果 SFT 时仍用大的正则化因子,会&quot;压制&quot;新知识的表达,导致微调效果打折。这个发现对实际部署很重要: 不能做简单的两阶段训练(先 ProSparse 再普通 SFT),而需要在 SFT 阶段继续施加适度正则化。</p>
</blockquote>
<h4 id="q5-xsdrhfb">Q5: 稀疏度如何分布?</h4>
<p>另一个有趣的观察是不同数据集和层之间稀疏度分布的不均衡。具体而言,ProSparse 模型的激活稀疏度在格式更规整的指令微调数据集上更高,在更靠近输出的高层(即更接近输出的层)也更高。附录 M 和 N 提供了更详细的分析。</p>
<blockquote>
<p>译者注: 这个发现很有意思。&quot;高层更稀疏&quot;可能与 LLM 的信息处理流程有关: 底层负责提取局部特征(词法、句法),需要保留更多信息; 高层负责语义整合和输出生成,大量中间表示可能是不相关的,因此更容易被稀疏化。&quot;指令数据更稀疏&quot;则说明模型的稀疏模式与输入的结构性相关——格式化的指令有更强的模式可预测性,模型可以更&quot;自信地&quot;关闭不相关的神经元。</p>
</blockquote>
<hr>
<h2 id="5-jl">5 结论</h2>
<p>在本工作中,我们提出了 ProSparse,一种有效的方法,用于在不牺牲性能的前提下将基于 ReLU 的内在激活稀疏性引入非 ReLU LLM。大量实验证明了 ProSparse 的有效性及其在多种算法推理加速中的实用价值。关于 ProSparse 技术、模型特性和 SFT 问题的深入分析进一步证实了 ProSparse 的实用性,并提供了有价值的见解。</p>
<hr>
<h2 id="jx">局限</h2>
<p>首先,鉴于充足的计算资源,未来应纳入对更大规模模型(例如 70B 或更大)的更全面研究。此外,我们仅关注 FFN 步骤 (2) 和 (3) 的基于稀疏性的加速,留下了相当比例的 LLM 计算未优化。事实上,已有关于注意力层稀疏化的初步工作(Shen et al., 2023; Wortsman et al., 2023)。剪枝和低秩分解等方法也可能有助于优化 FFN 步骤 (1)(Ji et al., 2024)。对于未来的工作,我们将继续探索如何在注意力层引入和增强稀疏性,以及 FFN 步骤 (1) 的加速问题。</p>
<blockquote>
<p>译者注: 作者们坦诚地指出了两个主要局限,这两个局限恰好勾勒了该领域的下一步方向。第一,70B+ 模型未验证——稀疏性在大模型上是否仍然有效？更大的模型可能有更冗余的表示,理论上稀疏度应该更高,但工程实现上的挑战(如预测器设计、内存带宽瓶颈)也会随之增大。第二,仅优化 FFN 的 2/3 步骤——步骤 (1) 的密集矩阵乘法 <code>xWs^T</code> 和整个注意力层都还没碰。注意力层的稀疏化是一个活跃的研究方向(如 H2O、StreamingLLM、SnapKV 等),但方法与 FFN 稀疏化完全不同。如果能同时优化 FFN 和注意力,推理加速的上限还会更高。</p>
</blockquote>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
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
<td>Activation Sparsity</td>
<td>激活稀疏性</td>
<td>第 1 节</td>
<td>激活输出中零元素或可忽略元素的比例</td>
</tr>
<tr>
<td>ReLUfication</td>
<td>ReLU 化</td>
<td>第 1 节</td>
<td>将非 ReLU LLM 转换为 ReLU 激活 LLM 的过程</td>
</tr>
<tr>
<td>ProSparse</td>
<td>渐进稀疏</td>
<td>第 1 节</td>
<td>本文提出的渐进式稀疏正则化方法</td>
</tr>
<tr>
<td>FATReLU</td>
<td>固定阈值 ReLU</td>
<td>第 1 节</td>
<td>将 ReLU 阈值偏移到正值的激活函数</td>
</tr>
<tr>
<td>Gated FFN</td>
<td>门控前馈网络</td>
<td>第 3.1 节</td>
<td>含门控分支的 FFN 变体,如 SwiGLU</td>
</tr>
<tr>
<td>L1 Regularization</td>
<td>L1 正则化</td>
<td>第 3.2.2 节</td>
<td>对激活输出 L1 范数施加的稀疏惩罚</td>
</tr>
<tr>
<td>PowerInfer</td>
<td>—</td>
<td>第 3.3.1 节</td>
<td>基于激活预测器的近似推理加速框架</td>
</tr>
<tr>
<td>Activation Predictor</td>
<td>激活预测器</td>
<td>第 3.3.1 节</td>
<td>预测哪些神经元将被激活的小型神经网络</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>第 4.4 节 Q4</td>
<td>在特定任务数据上的有监督训练</td>
</tr>
</tbody></table>
<h3 id="b-hxgssy">B. 核心公式索引</h3>
<table>
<thead>
<tr>
<th>编号</th>
<th>公式</th>
<th>所在章节</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>(1)</td>
<td>Gated FFN 计算流程</td>
<td>第 3.1 节</td>
<td>定义 FFN 中 s, x1, FFN(x) 的计算关系</td>
</tr>
<tr>
<td>(2)</td>
<td>L1 稀疏正则化损失</td>
<td>第 3.2.2 节</td>
<td>对中间输出 x1 施加的 L1 惩罚项</td>
</tr>
<tr>
<td>(3)</td>
<td>FATReLU 激活函数</td>
<td>第 3.2.3 节</td>
<td>带正阈值 t 的分段 ReLU 变体</td>
</tr>
</tbody></table>
<h3 id="c-gjsysjhz">C. 关键实验数据汇总</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>稀疏度</th>
<th>平均性能</th>
<th>PowerInfer 加速</th>
<th>GPU Op Step2</th>
<th>GPU Op Step3</th>
</tr>
</thead>
<tbody><tr>
<td>LLaMA2-7B</td>
<td>0.00%</td>
<td>39.80</td>
<td>1.00×(baseline)</td>
<td>1.00×</td>
<td>1.00×</td>
</tr>
<tr>
<td>ReluLLaMA-7B</td>
<td>70.63%</td>
<td>35.61</td>
<td>2.54×</td>
<td>1.29×</td>
<td>1.16×</td>
</tr>
<tr>
<td>ProSparse-7B</td>
<td>89.32%</td>
<td>38.46</td>
<td><strong>4.52×</strong></td>
<td><strong>2.44×</strong></td>
<td><strong>1.70×</strong></td>
</tr>
<tr>
<td>LLaMA2-13B</td>
<td>0.00%</td>
<td>45.75</td>
<td>—</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>ProSparse-13B</td>
<td>88.80%</td>
<td>44.80</td>
<td>2.93×</td>
<td>1.49×</td>
<td>1.18×</td>
</tr>
<tr>
<td>MiniCPM-1B</td>
<td>0.00%</td>
<td>40.28</td>
<td>—</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>ProSparse-1B</td>
<td>87.89%</td>
<td>40.18</td>
<td>—</td>
<td>—</td>
<td>—</td>
</tr>
</tbody></table>
<blockquote>
<p>注: ProSparse-1B 即 MiniCPM-S-1B。加速比以 llama.cpp Dense 为基准(1.00×)。</p>
</blockquote>
<h3 id="d-mxpxdw">D. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-1B(Hu et al., 2024)——清华大学面壁智能团队发布的端侧稠密 LLM; 激活稀疏性思想源自早期 ReLU 激活的 Transformer 工作(Raffel et al., 2020)</li>
<li><strong>核心创新</strong>: (1) 渐进式稀疏正则化——多阶段正弦曲线调度 L1 因子,避免激进分布偏移; (2) FATReLU 阈值偏移——在 ReLU 基础上进一步剪除低影响神经元; (3) 开源稀疏 GPU 算子——实现精确且无预测器误差的推理加速</li>
<li><strong>被后续工作引用/影响</strong>: ProSparse 的技术直接应用于 MiniCPM-S-1B 的发布; 激活稀疏性成为端侧 LLM 推理加速的重要方向之一,与量化、蒸馏等技术正交互补</li>
<li><strong>技术定位</strong>: 在 ReLUfication 方法谱系中,ProSparse 位于&quot;直接替换&quot;(ReluLLaMA)和&quot;激进偏移&quot;(Shifted ReLU)之间,以渐进式策略实现了稀疏度与性能的最优平衡</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-ybzsyxggz","text":"2 预备知识与相关工作"},{"level":3,"id":"2-1-llm-tljs","text":"2.1 LLM 推理加速"},{"level":3,"id":"2-2-jhxsx","text":"2.2 激活稀疏性"},{"level":3,"id":"2-3-re-l-ufication","text":"2.3 ReLUfication"},{"level":2,"id":"3-ff","text":"3 方法"},{"level":3,"id":"3-1-dyyfh","text":"3.1 定义与符号"},{"level":3,"id":"3-2-pro-sparse","text":"3.2 ProSparse"},{"level":4,"id":"3-2-1-jhhsth","text":"3.2.1 激活函数替换"},{"level":4,"id":"3-2-2-jjsxszzh","text":"3.2.2 渐进式稀疏正则化"},{"level":4,"id":"3-2-3-jhyzpy","text":"3.2.3 激活阈值偏移"},{"level":3,"id":"3-3-sjtljs","text":"3.3 实际推理加速"},{"level":4,"id":"3-3-1-jsjssf","text":"3.3.1 近似加速算法"},{"level":4,"id":"3-3-2-jqjssf","text":"3.3.2 精确加速算法"},{"level":2,"id":"4-sy","text":"4 实验"},{"level":3,"id":"4-1-sysz","text":"4.1 实验设置"},{"level":3,"id":"4-2-ztjg","text":"4.2 整体结果"},{"level":3,"id":"4-3-xsddjsxg","text":"4.3 稀疏度的加速效果"},{"level":4,"id":"jsjssf","text":"近似加速算法"},{"level":4,"id":"jqjssf","text":"精确加速算法"},{"level":3,"id":"4-4-fxytl","text":"4.4 分析与讨论"},{"level":4,"id":"q1-l1-zzhdxgrh-qdzqsrh","text":"Q1: L1 正则化的效果如何,其递增趋势如何?"},{"level":4,"id":"q2-rhddmbjhxsdz","text":"Q2: 如何达到目标激活稀疏度值?"},{"level":4,"id":"q3-jjsxszzhsfyx","text":"Q3: 渐进式稀疏正则化是否有效?"},{"level":4,"id":"q4-rhdxsjhmxjh-sft","text":"Q4: 如何对稀疏激活模型进行 SFT?"},{"level":4,"id":"q5-xsdrhfb","text":"Q5: 稀疏度如何分布?"},{"level":2,"id":"5-jl","text":"5 结论"},{"level":2,"id":"jx","text":"局限"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgssy","text":"B. 核心公式索引"},{"level":3,"id":"c-gjsysjhz","text":"C. 关键实验数据汇总"},{"level":3,"id":"d-mxpxdw","text":"D. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/07-mini-cpm-s-1.2b/01-mini-cpm-s-1.2b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/07-mini-cpm-s-1.2b/01-mini-cpm-s-1.2b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-S-1.2B 技术报告精译</h1>
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
