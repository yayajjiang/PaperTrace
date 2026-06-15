"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Credal Transformer: 从 Softmax 的确定性暴政到证据理论的不确定性建模</h1>
<blockquote>
<p>本文介绍 NeurIPS 2025 论文 Credal Transformer 的核心思想——从数学基因层面重新审视 Transformer 的幻觉问题，分析 Softmax 的&quot;确定性暴政&quot;如何系统性湮灭模型内在的不确定性，以及证据理论和狄利克雷分布如何为不确定性建模提供新的架构基础. </p>
</blockquote>
<hr>
<h2 id="1-wtdgy-softmax-dqdxbz">1. 问题的根源: Softmax 的确定性暴政</h2>
<h3 id="1-1-softmax-dxxymjz">1.1 Softmax 的信息湮灭机制</h3>
<p>现有 Transformer 架构的激活函数 Softmax，其数学本质是一个从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi mathvariant="double-struck">R</mi><mi>L</mi></msup></mrow><annotation encoding="application/x-tex">\\mathbb{R}^L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">L</span></span></span></span></span></span></span></span></span></span></span> 到概率单纯形 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi mathvariant="normal">Δ</mi><mrow><mi>L</mi><mo>−</mo><mn>1</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\Delta^{L-1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord">Δ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">L</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span></span></span></span></span></span></span></span> 的映射: </p>
<p>将上述约束转化为数学表达: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">a_{ij} = \\frac{\\exp(s_{ij})}{\\sum_k \\exp(s_{ik})} \\tag{1} \\tag{1}</span>
<p>此式给出了形式化的数学定义，建立了输入与输出之间的定量关系. </p>
<p>无论输入的 logits <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">s_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是多么平坦、多么接近均匀分布(代表着极度的不确定性)，Softmax 都会将其归一化，强行在所有选项上分配完 100% 的信念. 这个过程本身就是<strong>信息的湮灭</strong>——模型内在的犹豫、困惑、知识的边界感，在 Softmax 穿过的瞬间被彻底抹除. </p>
<p>每一层、每一个注意力头都在重复这个过程. 这就像一场席卷整个网络的遗忘风暴，最终导致输出端那个看似自信的 token，实际上建立在一片被夷平了的不确定性废墟之上. 这就是 <strong>Artificial Certainty</strong>——一个架构性的原罪. </p>
<h3 id="1-2-hjdjgxcy">1.2 幻觉的结构性成因</h3>
<p>传统上，幻觉(Hallucination)被归因于训练数据不足、对齐偏差或解码策略问题. 但 Credal Transformer 的洞察更为深层: <strong>幻觉不是训练不充分的结果，而是架构设计的选择</strong>. </p>
<p>当模型面对知识边界之外的问题时，其内部表征本应表现出高度的不确定性(平坦的 logit 分布). 但 Softmax 将这种不确定性强制转换为&quot;虚假的自信&quot;——某个 token 的概率被放大到 0.8 甚至 0.9，而模型实际上对这个答案毫无把握. 用户看到的是一个斩钉截铁的陈述，而模型内部是一片混乱. </p>
<hr>
<h2 id="2-credal-transformer-dhxsj">2. Credal Transformer 的核心设计</h2>
<h3 id="2-1-hxld-bqdxsxx-efzs">2.1 核心论点: 不确定性是信息，而非噪声</h3>
<p>Credal Transformer 拒绝接受&quot;不确定性必须被消除&quot;的传统假设. 其核心论点是: </p>
<blockquote>
<p>**不确定性不是需要被消除的噪声，而是一种必须被保留、被传递、被计算的关键信息. **</p>
</blockquote>
<p>为此，Credal Transformer 引入了<strong>证据理论(Dempster-Shafer Theory)</strong> 和<strong>狄利克雷分布(Dirichlet Distribution)</strong> ，将模型的输出从&quot;单一概率分布&quot;扩展为&quot;概率分布上的分布&quot;. </p>
<h3 id="2-2-dlklfb-flfbsdbqdx">2.2 狄利克雷分布: 分类分布上的不确定性</h3>
<p>狄利克雷分布是分类分布的共轭先验. 在 Credal Transformer 中，模型不再直接输出 logits，而是输出狄利克雷分布的参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold-italic">α</mi><mo>=</mo><mo stretchy="false">(</mo><msub><mi>α</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>α</mi><mi>L</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\boldsymbol{\\alpha} = (\\alpha_1, \\dots, \\alpha_L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">α</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>: </p>
<p>基于上述分析，建立如下数学关系: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\mathbf{p} \\sim \\text{Dir}(\\boldsymbol{\\alpha}), \\quad \\mathbf{p} \\in \\Delta^{L-1} \\tag{2} \\tag{2}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mi>i</mi></msub><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\alpha_i &gt; 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> 可以理解为对第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个类别的&quot;证据强度&quot;. 狄利克雷分布的均值和方差分别为: </p>
<p>推导过程如下: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\mathbb{E}[p_i] = \\frac{\\alpha_i}{\\alpha_0}, \\quad \\text{Var}[p_i] = \\frac{\\alpha_i (\\alpha_0 - \\alpha_i)}{\\alpha_0^2 (\\alpha_0 + 1)} \\tag{3} \\tag{3}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mn>0</mn></msub><mo>=</mo><msub><mo>∑</mo><mi>i</mi></msub><msub><mi>α</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\alpha_0 = \\sum_i \\alpha_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0497em;vertical-align:-0.2997em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为总证据量. <strong>关键洞察</strong>: </p>
<ul>
<li>当某个 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mi>i</mi></msub><mo>≫</mo><msub><mi>α</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">\\alpha_i \\gg \\alpha_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>j</mi><mo mathvariant="normal">≠</mo><mi>i</mi></mrow><annotation encoding="application/x-tex">j \\neq i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel"><span class="mrel"><span class="mord vbox"><span class="thinbox"><span class="rlap"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="inner"><span class="mord"><span class="mrel"></span></span></span><span class="fix"></span></span></span></span></span><span class="mspace nobreak"></span><span class="mrel">=</span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span>)时，狄利克雷分布集中在第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个类别附近——模型对该类别有高度确信</li>
<li>当所有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\alpha_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 相近且总证据量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">\\alpha_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 很小时，狄利克雷分布覆盖整个单纯形——模型表现出高度不确定性</li>
<li>当所有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\alpha_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 相近但 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">\\alpha_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 很大时，狄利克雷分布集中在单纯形中心——模型确信&quot;所有选项概率相近&quot;</li>
</ul>
<h3 id="2-3-cdgjdjhgj">2.3 从点估计到集合估计</h3>
<p>传统 Transformer 输出的是一个点估计(概率向量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">p</mi></mrow><annotation encoding="application/x-tex">\\mathbf{p}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord mathbf">p</span></span></span></span>)，而 Credal Transformer 输出的是一个<strong>概率集合(Credal Set)</strong> ——由狄利克雷分布支撑的所有可能概率分布的集合. </p>
<p>这意味着: </p>
<ul>
<li>当模型不确定时，它不再&quot;猜测&quot;一个最可能的 token，而是明确地表达&quot;我在这些选项之间不确定&quot;</li>
<li>这种不确定性可以被上层模块(如推理链、工具调用、人类审核)利用，做出更保守或更积极的决策</li>
<li>在多轮对话中，不确定性可以累积和传播，避免早期错误被后续步骤固化</li>
</ul>
<hr>
<h2 id="3-jgsxyxl">3. 架构实现与训练</h2>
<h3 id="3-1-th-softmax-wdlklt">3.1 替换 Softmax 为狄利克雷头</h3>
<p>Credal Transformer 将传统的 LM Head(线性层 + Softmax)替换为<strong>狄利克雷头(Dirichlet Head)</strong> : </p>
<ol>
<li>最后一层隐藏状态 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 经过线性层映射到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>L</mi></mrow><annotation encoding="application/x-tex">2L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">2</span><span class="mord mathnormal">L</span></span></span></span> 维输出(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 为词汇表大小)</li>
<li>前 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 维通过 softplus 激活得到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mi>i</mi></msub><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\alpha_i &gt; 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span></li>
<li>后 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 维可选地输出&quot;无知度&quot;参数，表示模型对整体分布的不确定程度</li>
</ol>
<h3 id="3-2-sshssj">3.2 损失函数设计</h3>
<p>训练目标从最大化对数似然(交叉熵)转变为<strong>证据学习(Evidential Learning)</strong> : </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\mathcal{L}(\\boldsymbol{\\alpha}, y) = \\log \\frac{\\alpha_0}{\\alpha_y} + \\psi(\\alpha_y + 1) - \\psi(\\alpha_0 + 1) \\tag{4} \\tag{4}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ψ</mi></mrow><annotation encoding="application/x-tex">\\psi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">ψ</span></span></span></span> 为 digamma 函数. 该损失同时优化预测的准确性(第一项)和不确定性估计的校准性(后两项). </p>
<h3 id="3-3-bqdxyddjm">3.3 不确定性引导的解码</h3>
<p>在推理阶段，Credal Transformer 支持多种不确定性敏感的解码策略: </p>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="left">机制</th>
<th align="left">适用场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>保守解码</strong></td>
<td align="left">当总证据量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mn>0</mn></msub><mo>&lt;</mo><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\alpha_0 &lt; \\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 时，拒绝回答或请求澄清</td>
<td align="left">高风险领域(医疗、法律)</td>
</tr>
<tr>
<td align="left"><strong>探索解码</strong></td>
<td align="left">从狄利克雷分布采样多个概率向量，生成多个候选答案</td>
<td align="left">创意生成、头脑风暴</td>
</tr>
<tr>
<td align="left"><strong>工具触发</strong></td>
<td align="left">当不确定性超过阈值时，自动触发搜索/计算工具</td>
<td align="left">Agent 任务、知识密集型查询</td>
</tr>
</tbody></table>
<hr>
<h2 id="4-syjgyyy">4. 实验结果与意义</h2>
<h3 id="4-1-hjsxzjd">4.1 幻觉率显著降低</h3>
<p>在多个幻觉检测基准上，Credal Transformer 将幻觉率降低了 30-50%. 更重要的是，它提供了一种<strong>可解释的幻觉预警机制</strong>——模型在生成高不确定性回答时会明确标注，让用户可以自行决定是否信任. </p>
<h3 id="4-2-xzxts">4.2 校准性提升</h3>
<p>传统 Transformer 的概率校准性极差: 模型说&quot;90% 确信&quot;时，实际正确率可能只有 60%. Credal Transformer 的狄利克雷输出经过校准后，概率估计与实际准确率高度一致(ECE 从 0.15 降至 0.03). </p>
<h3 id="4-3-jgjfsdyy">4.3 架构级反思的意义</h3>
<p>Credal Transformer 的价值不仅在于一个具体的技术方案，更在于它提出了一种<strong>架构级的设计哲学</strong>: </p>
<ul>
<li>当前 AI 的&quot;过度自信&quot;不是可修复的 bug，而是架构选择的必然结果</li>
<li>真正的可信 AI 需要在最底层(概率输出层)保留和表达不确定性</li>
<li>不确定性不应被消除，而应被计算、传递和利用</li>
</ul>
<hr>
<h2 id="5-tzywlfx">5. 挑战与未来方向</h2>
<h3 id="5-1-jskx">5.1 计算开销</h3>
<p>狄利克雷分布的采样和期望计算比 Softmax 更昂贵. 虽然可以通过解析近似加速，但在超大规模模型(100B+)上的效率仍需验证. </p>
<h3 id="5-2-stjrx">5.2 生态兼容性</h3>
<p>现有推理框架(vLLM、TensorRT-LLM)高度优化了 Softmax 的计算路径. 引入狄利克雷头需要重构这些优化，工程成本较高. </p>
<h3 id="5-3-rljhsj">5.3 人类交互设计</h3>
<p>当模型表达&quot;我不确定&quot;时，用户如何解读和应对？这需要新的人机交互范式——从&quot;AI 给答案&quot;转变为&quot;AI 给答案 + 置信度 + 替代选项&quot;. </p>
<hr>
<h2 id="6-ckwx">6. 参考文献</h2>
<ol>
<li><p><strong>Credal Transformer: Endowing Transformers with Uncertainty Awareness via Evidential Deep Learning</strong></p>
<ul>
<li>NeurIPS 2025. OpenReview: <a href="https://openreview.net/forum?id=XTM1BKeZa8">https://openreview.net/forum?id=XTM1BKeZa8</a></li>
</ul>
</li>
<li><p><strong>Evidential Deep Learning to Quantify Classification Uncertainty</strong></p>
<ul>
<li>Sensoy et al., NeurIPS 2018. (证据学习理论基础)</li>
</ul>
</li>
<li><p><strong>A Mathematical Theory of Evidence</strong></p>
<ul>
<li>Shafer, 1976. (Dempster-Shafer 证据理论经典著作)</li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源: <a href="https://www.zhihu.com/question/1958640342082515039/answer/1958644955556840445">如何评价 NeurIPS 2025 论文 Credal Transformer 对幻觉问题的解决思路？</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtdgy-softmax-dqdxbz","text":"1. 问题的根源: Softmax 的确定性暴政"},{"level":3,"id":"1-1-softmax-dxxymjz","text":"1.1 Softmax 的信息湮灭机制"},{"level":3,"id":"1-2-hjdjgxcy","text":"1.2 幻觉的结构性成因"},{"level":2,"id":"2-credal-transformer-dhxsj","text":"2. Credal Transformer 的核心设计"},{"level":3,"id":"2-1-hxld-bqdxsxx-efzs","text":"2.1 核心论点: 不确定性是信息，而非噪声"},{"level":3,"id":"2-2-dlklfb-flfbsdbqdx","text":"2.2 狄利克雷分布: 分类分布上的不确定性"},{"level":3,"id":"2-3-cdgjdjhgj","text":"2.3 从点估计到集合估计"},{"level":2,"id":"3-jgsxyxl","text":"3. 架构实现与训练"},{"level":3,"id":"3-1-th-softmax-wdlklt","text":"3.1 替换 Softmax 为狄利克雷头"},{"level":3,"id":"3-2-sshssj","text":"3.2 损失函数设计"},{"level":3,"id":"3-3-bqdxyddjm","text":"3.3 不确定性引导的解码"},{"level":2,"id":"4-syjgyyy","text":"4. 实验结果与意义"},{"level":3,"id":"4-1-hjsxzjd","text":"4.1 幻觉率显著降低"},{"level":3,"id":"4-2-xzxts","text":"4.2 校准性提升"},{"level":3,"id":"4-3-jgjfsdyy","text":"4.3 架构级反思的意义"},{"level":2,"id":"5-tzywlfx","text":"5. 挑战与未来方向"},{"level":3,"id":"5-1-jskx","text":"5.1 计算开销"},{"level":3,"id":"5-2-stjrx","text":"5.2 生态兼容性"},{"level":3,"id":"5-3-rljhsj","text":"5.3 人类交互设计"},{"level":2,"id":"6-ckwx","text":"6. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/credal-transformer-c-softmax-dqdxbzdzjlldbqdxjm" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/credal-transformer-c-softmax-dqdxbzdzjlldbqdxjm" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Credal Transformer: 从 Softmax 的确定性暴政到证据理论的不确定性建模</h1>
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
