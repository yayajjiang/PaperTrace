"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>大语言模型强化学习问题综述</h1>
<blockquote>
<p>本文系统梳理大语言模型强化学习训练中的核心问题与前沿解决方案,涵盖策略梯度方法、熵崩溃、Pass@k 退化、KL 惩罚、训推不一致、工具集成推理(TIR)、On-Policy Distillation(OPD)以及 Rubrics as Rewards 等关键议题. </p>
</blockquote>
<hr>
<h2 id="1-zl-rl-sfpx">1. 主流 RL 算法谱系</h2>
<h3 id="1-1-cltd-pg-y-reinforce">1.1 策略梯度(PG)与 REINFORCE</h3>
<p>策略梯度是 RL 训练的理论基础. 对于策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,目标函数为: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}[R(\\tau)] \\tag{1} \\tag{1}</span>
<p>此式将上述约束形式化,各项分别对应输入变换、非线性激活与输出生成. 
此式给出了精确的数学定义,为算法实现提供了理论基础. </p>
<p>梯度估计: </p>
<p>为建立定量关系,定义如下表达式: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}\\left[\\sum_{t=0}^{T} \\nabla_\\theta \\log \\pi_\\theta(a_t|s_t) \\cdot R(\\tau)\\right] \\tag{2} \\tag{2}</span>
<p>该关系式明确了系统的数学约束,可直接用于后续优化推导. </p>
<p>REINFORCE 直接使用上述蒙特卡洛估计,但方差极大. 核心问题: 奖励 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>R</mi><mo stretchy="false">(</mo><mi>τ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R(\\tau)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">)</span></span></span></span> 与具体动作 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">a_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的相关性弱,导致信用分配困难. </p>
<h3 id="1-2-ppo-style-ysgjy-clip">1.2 PPO-style: 优势估计与 Clip</h3>
<p>PPO 通过引入优势函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi><mo stretchy="false">(</mo><msub><mi>s</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi>a</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">A(s_t, a_t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">A</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 和比率剪裁降低方差: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">L^{\\text{PPO}}(\\theta) = \\mathbb{E}_t\\left[\\min\\left(r_t(\\theta)A_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon)A_t\\right)\\right] \\tag{3} \\tag{3}</span>
<p>此式将上述约束形式化,各项分别对应输入变换、非线性激活与输出生成. </p>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">r_t(\\theta) = \\frac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t|s_t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.6357em;vertical-align:-0.6257em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.01em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0278em;margin-right:0.1em;"><span class="pstrut" style="height:2.6944em;"></span><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3496em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.401em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight">∣</span><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.485em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight">∣</span><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6257em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>. </p>
<p>在大模型场景中,PPO 的变体(GRPO、DAPO 等)将优势估计从 Critic 模型转移到组内统计,降低了显存开销. </p>
<h3 id="1-3-jyys-vs-jytd-qtcy">1.3 基于优势 vs 基于梯度: 求同存异</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">基于优势(Advantage-based)</th>
<th align="left">基于梯度(Gradient-based)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">代表</td>
<td align="left">PPO、GRPO、DAPO</td>
<td align="left">REINFORCE、IcePop</td>
</tr>
<tr>
<td align="left">核心思想</td>
<td align="left">好动作提升概率,坏动作降低概率</td>
<td align="left">直接优化策略梯度,无显式优势估计</td>
</tr>
<tr>
<td align="left">方差</td>
<td align="left">低(优势函数中心化)</td>
<td align="left">高(依赖原始奖励)</td>
</tr>
<tr>
<td align="left">稳定性</td>
<td align="left">高(clip 约束)</td>
<td align="left">中(需要 careful 的 baseline)</td>
</tr>
<tr>
<td align="left">适用场景</td>
<td align="left">奖励稀疏、长序列</td>
<td align="left">奖励密集、短序列</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-s-entropy-yts-lyqh">2. 熵(Entropy)与探索-利用权衡</h2>
<h3 id="2-1-sdwlyy">2.1 熵的物理意义</h3>
<p>策略熵衡量模型输出的不确定性: </p>
<p>基于前述物理直觉,给出数学形式: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">H(\\pi) = -\\sum_a \\pi(a|s) \\log \\pi(a|s) \\tag{4} \\tag{4}</span>
<p>此式将上述约束形式化,各项分别对应输入变换、非线性激活与输出生成. 
此式给出了精确的数学定义,为算法实现提供了理论基础. </p>
<p>高熵 = 探索(模型尝试多种动作); 低熵 = 利用(模型坚持最优动作). </p>
<h3 id="2-2-sbk-entropy-collapse">2.2 熵崩溃(Entropy Collapse)</h3>
<p>在 RL 训练中,一个常见的故障模式是<strong>熵崩溃</strong>: 模型迅速收敛到确定性策略,所有概率质量集中在少数几个 token 上,熵降至接近零. </p>
<p><strong>成因</strong>: </p>
<ul>
<li>奖励信号过强,模型被&quot;拉&quot;向高收益动作</li>
<li>温度系数过低,softmax 过于尖锐</li>
<li>缺乏探索奖励,模型没有动力尝试新策略</li>
</ul>
<p><strong>后果</strong>: </p>
<ul>
<li>模式崩溃(mode collapse): 模型反复生成相同的回答模板</li>
<li>泛化能力下降: 无法处理训练分布外的输入</li>
<li>对抗脆弱性: 对输入的微小扰动极度敏感</li>
</ul>
<h3 id="2-3-yzsjdcl">2.3 抑制熵减的策略</h3>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="left">机制</th>
<th align="left">效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>熵奖励</strong></td>
<td align="left">在目标函数中增加 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>−</mo><mi>β</mi><mi>H</mi><mo stretchy="false">(</mo><mi>π</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">-\\beta H(\\pi)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mclose">)</span></span></span></span></td>
<td align="left">直接鼓励探索,但需 careful 调参</td>
</tr>
<tr>
<td align="left"><strong>温度退火</strong></td>
<td align="left">训练初期高温度(探索),后期低温度(利用)</td>
<td align="left">自然的课程学习</td>
</tr>
<tr>
<td align="left"><strong>多样性奖励</strong></td>
<td align="left">奖励生成与历史不同的回答</td>
<td align="left">防止模式崩溃</td>
</tr>
<tr>
<td align="left"><strong>Dropout 策略</strong></td>
<td align="left">在策略网络中引入 dropout</td>
<td align="left">增加输出的随机性</td>
</tr>
</tbody></table>
<hr>
<h2 id="3-pass-k-thypgkj">3. Pass@k 退化与评估困境</h2>
<h3 id="3-1-pass-k-ddy">3.1 Pass@k 的定义</h3>
<p>Pass@k 衡量模型在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 次尝试中至少成功一次的概率: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{Pass@k} = 1 - \\binom{n-c}{k} / \\binom{n}{k} \\tag{5} \\tag{5}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 为总采样数,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi></mrow><annotation encoding="application/x-tex">c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">c</span></span></span></span> 为成功数. 这是代码生成和数学推理任务的标准评估指标. </p>
<h3 id="3-2-pass-k-thwt">3.2 Pass@k 退化问题</h3>
<p>RL 训练优化的是平均奖励,而非 Pass@k. 这导致一个反直觉现象: <strong>模型可能在平均奖励上提升,但 Pass@k 下降</strong>. </p>
<p>原因: 模型学会在&quot;安全区&quot;内生成高概率但低多样性的回答,虽然单次成功率提高,但多次采样的覆盖范围缩小. </p>
<h3 id="3-3-zjyh-pass-k">3.3 直接优化 Pass@k</h3>
<p>将 Pass@k 直接纳入 RL 目标面临两个挑战: </p>
<ol>
<li><strong>不可导</strong>: Pass@k 是离散指标,无法直接求梯度</li>
<li><strong>高方差</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 次采样中只有少数成功,梯度信号稀疏</li>
</ol>
<p>解决方案包括: </p>
<ul>
<li><strong>重要性采样估计</strong>: 用历史采样数据估计 Pass@k 的梯度</li>
<li><strong>辅助奖励</strong>: 为&quot;首次成功&quot;和&quot;多样成功&quot;提供额外奖励</li>
<li><strong>课程学习</strong>: 从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">k=1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 开始训练,逐步增大 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span></li>
</ul>
<hr>
<h2 id="4-kl-cfyclpy">4. KL 惩罚与策略漂移</h2>
<h3 id="4-1-kl-sddzy">4.1 KL 散度的作用</h3>
<p>KL 惩罚防止策略偏离参考模型(通常是 SFT 模型或基座模型)太远: </p>
<p>基于前述物理直觉,给出数学形式: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">L^{\\text{KL}} = -\\mathbb{E}_{x \\sim D, y \\sim \\pi_\\theta}[r(x,y)] + \\beta \\cdot \\text{KL}(\\pi_\\theta \\| \\pi_{\\text{ref}}) \\tag{6} \\tag{6}</span>
<p>此式给出了形式化的数学定义,建立了输入与输出之间的定量关系. 
此式给出了精确的数学定义,为算法实现提供了理论基础. </p>
<h3 id="4-2-kl-gjdszxs">4.2 KL 估计的三种形式</h3>
<table>
<thead>
<tr>
<th align="left">形式</th>
<th align="left">公式</th>
<th align="left">特性</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>KL-1(前向 KL)</strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="double-struck">E</mi><msub><mi>π</mi><mi>θ</mi></msub></msub><mo stretchy="false">[</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>π</mi><mi>θ</mi></msub><msub><mi>π</mi><mtext>ref</mtext></msub></mfrac><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\mathbb{E}_{\\pi_\\theta}[\\log \\frac{\\pi_\\theta}{\\pi_{\\text{ref}}}]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2009em;vertical-align:-0.4509em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">[</span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7173em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4159em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4509em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose">]</span></span></span></span></td>
<td align="left">惩罚 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 覆盖 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>ref</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{ref}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 不支持区域</td>
</tr>
<tr>
<td align="left"><strong>KL-2(反向 KL)</strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="double-struck">E</mi><msub><mi>π</mi><mtext>ref</mtext></msub></msub><mo stretchy="false">[</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>π</mi><mtext>ref</mtext></msub><msub><mi>π</mi><mi>θ</mi></msub></mfrac><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\mathbb{E}_{\\pi_{\\text{ref}}}[\\log \\frac{\\pi_{\\text{ref}}}{\\pi_\\theta}]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2009em;vertical-align:-0.4509em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">[</span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7173em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4159em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4509em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose">]</span></span></span></span></td>
<td align="left">惩罚 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 不覆盖 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>ref</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{ref}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 支持区域</td>
</tr>
<tr>
<td align="left"><strong>KL-3(对称 KL)</strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>KL</mtext><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mi mathvariant="normal">∥</mi><msub><mi>π</mi><mtext>ref</mtext></msub><mo stretchy="false">)</mo><mo>+</mo><mtext>KL</mtext><mo stretchy="false">(</mo><msub><mi>π</mi><mtext>ref</mtext></msub><mi mathvariant="normal">∥</mi><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{KL}(\\pi_\\theta \\| \\pi_{\\text{ref}}) + \\text{KL}(\\pi_{\\text{ref}} \\| \\pi_\\theta)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">KL</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">KL</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td align="left">双向约束,但计算成本高</td>
</tr>
</tbody></table>
<p>实验表明,前向 KL(KL-1)在防止遗忘方面效果最佳——这与 MIT 的 &quot;RL&#39;s Razor&quot; 发现一致. </p>
<hr>
<h2 id="5-xtbyz-train-inference-mismatch">5. 训推不一致(Train-Inference Mismatch)</h2>
<h3 id="5-1-wtdbz">5.1 问题的本质</h3>
<p>训推不一致指训练时的采样分布与推理时的解码策略不匹配. 典型场景: </p>
<ul>
<li><strong>训练</strong>: 从当前策略采样(temperature=1.0,可能包含随机性)</li>
<li><strong>推理</strong>: 贪婪解码或 beam search(temperature=0,确定性)</li>
</ul>
<p>这种不匹配导致: 模型在训练时学会应对&quot;有噪声&quot;的输入,但在推理时面对&quot;确定性&quot;的自身输出,行为发生偏移. </p>
<h3 id="5-2-gcjjfa">5.2 工程解决方案</h3>
<table>
<thead>
<tr>
<th align="left">方案</th>
<th align="left">机制</th>
<th align="left">局限</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>IcePop</strong></td>
<td align="left">在训练时混合使用策略采样和贪婪解码</td>
<td align="left">贪婪解码的样本质量低,可能污染训练</td>
</tr>
<tr>
<td align="left"><strong>Routing Replay</strong></td>
<td align="left">维护一个 replay buffer,存储历史策略的采样</td>
<td align="left">buffer 大小有限,旧样本可能过时</td>
</tr>
<tr>
<td align="left"><strong>DSA 一致性训练</strong></td>
<td align="left">让模型同时学习多种解码策略的响应</td>
<td align="left">增加训练复杂度</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-gjjctl-tir-d-rl-xl">6. 工具集成推理(TIR)的 RL 训练</h2>
<h3 id="6-1-tir-dxyfpnt">6.1 TIR 的信用分配难题</h3>
<p>当模型调用外部工具(搜索、计算器、代码解释器)时,奖励仅在任务完成时产生. 如何将此稀疏奖励分配到&quot;何时调用工具&quot;、&quot;调用哪个工具&quot;、&quot;如何构造参数&quot;等中间决策？</p>
<h3 id="6-2-dbxff">6.2 代表性方法</h3>
<ul>
<li><strong>TORL / ToolRL</strong>: 将工具调用视为特殊动作,用标准 RL 优化</li>
<li><strong>SimpleTIR</strong>: 证明端到端二元奖励足以训练多轮工具调用</li>
<li><strong>ReTool</strong>: 为工具调用设计专门的奖励函数,考虑信息增益</li>
<li><strong>ASPO</strong>: 分析工具集成推理的失败模式,提出适应性策略优化</li>
</ul>
<h3 id="6-3-yszghjxyfp">6.3 优势重估缓解信用分配</h3>
<p>当工具返回结果后,模型需要重新评估当前状态的价值. GIGPO、GDPO、ASPO 等方法通过动态调整优势估计,将工具反馈纳入信用分配: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\hat{A}_t^{\\text{tool}} = R_{\\text{tool}}(o_t) + \\gamma V(s_{t+1}) - V(s_t) \\tag{7} \\tag{7}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>tool</mtext></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R_{\\text{tool}}(o_t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tool</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 为工具观测的即时奖励. </p>
<hr>
<h2 id="7-on-policy-distillation-opd">7. On-Policy Distillation(OPD)</h2>
<h3 id="7-1-wsmxy-opd">7.1 为什么需要 OPD</h3>
<p>大模型的 RL 训练成本极高(千卡级 GPU 集群运行数周). OPD 的目标是将大模型(教师)通过 RL 获得的推理能力蒸馏到小模型(学生),而无需小模型也经历完整的 RL 训练. </p>
<h3 id="7-2-opd-dhxjz">7.2 OPD 的核心机制</h3>
<p>与传统知识蒸馏(用教师输出作为软标签)不同,OPD 蒸馏的是<strong>策略</strong>: </p>
<ol>
<li>教师模型通过 RL 训练获得高效推理策略</li>
<li>记录教师在 RL 环境中的完整轨迹(状态-动作-奖励序列)</li>
<li>学生模型通过行为克隆(BC)模仿教师的轨迹</li>
<li>关键: 只模仿&quot;成功轨迹&quot;,过滤失败和次优轨迹</li>
</ol>
<h3 id="7-3-self-distillation">7.3 Self-Distillation</h3>
<p>更进一步的思路是<strong>自蒸馏</strong>: 让模型与自身的历史版本对抗,新版本必须区分旧版本生成的回答和人类/更高质量回答. 这创造了一个自举循环: 更强的模型生成更强的训练数据. </p>
<hr>
<h2 id="8-rubrics-as-rewards-cpfbzdjlhs">8. Rubrics as Rewards: 从评分标准到奖励函数</h2>
<h3 id="8-1-hxsx">8.1 核心思想</h3>
<p>传统 RL 使用二元奖励(正确/错误)或标量奖励模型. Rubric-based 奖励将<strong>评分标准</strong>(rubric)直接转化为奖励函数: </p>
<ul>
<li>定义多维度评分标准(逻辑性、准确性、完整性、简洁性)</li>
<li>每个维度赋予权重和评分细则</li>
<li>模型生成的回答按 rubric 逐项评分,综合为最终奖励</li>
</ul>
<h3 id="8-2-dt-rubric">8.2 动态 Rubric</h3>
<p>静态 rubric 可能随时间过时(如新知识出现). 动态 rubric 系统同时训练: </p>
<ul>
<li><strong>Rubric Generator</strong>: 根据任务类型自动生成评分标准</li>
<li><strong>Judge Model</strong>: 根据 rubric 为回答打分</li>
<li><strong>Policy Model</strong>: 优化策略以最大化 judge 的评分</li>
</ul>
<p>三者形成对抗循环: policy 学会&quot;欺骗&quot;当前 judge,judge 学会识别 policy 的欺骗,rubric generator 学会设计更难欺骗的标准. </p>
<hr>
<h2 id="9-ckwx">9. 参考文献</h2>
<ol>
<li><p><strong>Proximal Policy Optimization Algorithms</strong></p>
<ul>
<li>Schulman et al., 2017.</li>
</ul>
</li>
<li><p><strong>Training language models to follow instructions with human feedback</strong></p>
<ul>
<li>Ouyang et al., NeurIPS 2022.</li>
</ul>
</li>
<li><p><strong>DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models</strong></p>
<ul>
<li>Shao et al., 2024. (GRPO)</li>
</ul>
</li>
<li><p><strong>IcePop: Instructing Language Models to Solve Optimization Problems</strong></p>
<ul>
<li><ol start="2024">
<li></li>
</ol>
</li>
</ul>
</li>
<li><p><strong>On-Policy Distillation for Training Small Language Models</strong></p>
<ul>
<li><ol start="2025">
<li></li>
</ol>
</li>
</ul>
</li>
<li><p><strong>Rubrics as Rewards: A Scalable Framework for LLM Alignment</strong></p>
<ul>
<li><ol start="2025">
<li></li>
</ol>
</li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/2020035059898426172">大语言模型中的强化学习问题综述</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zl-rl-sfpx","text":"1. 主流 RL 算法谱系"},{"level":3,"id":"1-1-cltd-pg-y-reinforce","text":"1.1 策略梯度(PG)与 REINFORCE"},{"level":3,"id":"1-2-ppo-style-ysgjy-clip","text":"1.2 PPO-style: 优势估计与 Clip"},{"level":3,"id":"1-3-jyys-vs-jytd-qtcy","text":"1.3 基于优势 vs 基于梯度: 求同存异"},{"level":2,"id":"2-s-entropy-yts-lyqh","text":"2. 熵(Entropy)与探索-利用权衡"},{"level":3,"id":"2-1-sdwlyy","text":"2.1 熵的物理意义"},{"level":3,"id":"2-2-sbk-entropy-collapse","text":"2.2 熵崩溃(Entropy Collapse)"},{"level":3,"id":"2-3-yzsjdcl","text":"2.3 抑制熵减的策略"},{"level":2,"id":"3-pass-k-thypgkj","text":"3. Pass@k 退化与评估困境"},{"level":3,"id":"3-1-pass-k-ddy","text":"3.1 Pass@k 的定义"},{"level":3,"id":"3-2-pass-k-thwt","text":"3.2 Pass@k 退化问题"},{"level":3,"id":"3-3-zjyh-pass-k","text":"3.3 直接优化 Pass@k"},{"level":2,"id":"4-kl-cfyclpy","text":"4. KL 惩罚与策略漂移"},{"level":3,"id":"4-1-kl-sddzy","text":"4.1 KL 散度的作用"},{"level":3,"id":"4-2-kl-gjdszxs","text":"4.2 KL 估计的三种形式"},{"level":2,"id":"5-xtbyz-train-inference-mismatch","text":"5. 训推不一致(Train-Inference Mismatch)"},{"level":3,"id":"5-1-wtdbz","text":"5.1 问题的本质"},{"level":3,"id":"5-2-gcjjfa","text":"5.2 工程解决方案"},{"level":2,"id":"6-gjjctl-tir-d-rl-xl","text":"6. 工具集成推理(TIR)的 RL 训练"},{"level":3,"id":"6-1-tir-dxyfpnt","text":"6.1 TIR 的信用分配难题"},{"level":3,"id":"6-2-dbxff","text":"6.2 代表性方法"},{"level":3,"id":"6-3-yszghjxyfp","text":"6.3 优势重估缓解信用分配"},{"level":2,"id":"7-on-policy-distillation-opd","text":"7. On-Policy Distillation(OPD)"},{"level":3,"id":"7-1-wsmxy-opd","text":"7.1 为什么需要 OPD"},{"level":3,"id":"7-2-opd-dhxjz","text":"7.2 OPD 的核心机制"},{"level":3,"id":"7-3-self-distillation","text":"7.3 Self-Distillation"},{"level":2,"id":"8-rubrics-as-rewards-cpfbzdjlhs","text":"8. Rubrics as Rewards: 从评分标准到奖励函数"},{"level":3,"id":"8-1-hxsx","text":"8.1 核心思想"},{"level":3,"id":"8-2-dt-rubric","text":"8.2 动态 Rubric"},{"level":2,"id":"9-ckwx","text":"9. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/dyymxqhxxwtzs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/dyymxqhxxwtzs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">大语言模型强化学习问题综述</h1>
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
