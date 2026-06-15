"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 2 RLHF 与安全对齐精读</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《Llama 2: Open Foundation and Fine-Tuned Chat Models》技术报告中 Section 3(Fine-Tuning)和 Section 4(Safety)的内容, 对 Llama 2 的 RLHF 训练流水线、双奖励模型设计、迭代拒绝采样、安全对齐策略及红队测试方法论进行深度工程剖析.</p>
</blockquote>
<hr>
<h2 id="1-rlhf-fsdyj-c-instruct-gpt-d-llama-2">1 RLHF 范式的演进: 从 InstructGPT 到 Llama 2</h2>
<h3 id="1-1-sd-rlhf-faddb">1.1 三代 RLHF 方案的对比</h3>
<p>RLHF(Reinforcement Learning from Human Feedback, 基于人类反馈的强化学习)自 InstructGPT(2022)提出以来, 已成为大语言模型对齐的行业标准. Llama 2 的 RLHF 方案可视为第三代实现, 在前两代基础上做了系统性改进.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">InstructGPT (OpenAI, 2022)</th>
<th align="left">ChatGPT (OpenAI, 2022)</th>
<th align="left">Llama 2-Chat (Meta, 2023)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">奖励模型</td>
<td align="left">单 RM</td>
<td align="left">单 RM</td>
<td align="left"><strong>双 RM</strong>(有用性 + 安全性分离)</td>
</tr>
<tr>
<td align="left">RL 算法</td>
<td align="left">PPO</td>
<td align="left">PPO</td>
<td align="left"><strong>拒绝采样 + PPO 组合</strong></td>
</tr>
<tr>
<td align="left">迭代轮次</td>
<td align="left">1-2 轮</td>
<td align="left">未公开</td>
<td align="left"><strong>5 轮迭代</strong>(RLHF-V1~V5)</td>
</tr>
<tr>
<td align="left">SFT 数据量</td>
<td align="left">~10K</td>
<td align="left">未公开</td>
<td align="left"><strong>27,540 条高质量标注</strong></td>
</tr>
<tr>
<td align="left">偏好数据量</td>
<td align="left">~100K</td>
<td align="left">未公开</td>
<td align="left"><strong>290 万+ 二元比较</strong></td>
</tr>
<tr>
<td align="left">安全策略</td>
<td align="left">过滤 + 提示工程</td>
<td align="left">未公开</td>
<td align="left"><strong>Context Distillation + 红队测试</strong></td>
</tr>
<tr>
<td align="left">多轮一致性</td>
<td align="left">无专门处理</td>
<td align="left">无专门处理</td>
<td align="left"><strong>Ghost Attention(GAtt)</strong></td>
</tr>
</tbody></table>
<p>Llama 2 的核心创新在于将 RLHF 从一个「一次性对齐工具」转变为一个「迭代精炼系统」. 5 轮迭代意味着模型能力是在多轮反馈循环中逐步提升的, 每轮都基于上一轮的最佳模型重新采样和标注.</p>
<h3 id="1-2-jdsjbzshjbz-dfszy">1.2 「监督数据不再是黄金标准」的范式转移</h3>
<p>Llama 2 团队提出了一个重要的观察: <strong>监督数据可能不再是黄金标准</strong>. 这一判断基于三个发现:</p>
<ol>
<li><strong>标注者风格差异</strong>: 即使熟练标注者, 每个人的写作风格也有显著差异. SFT 模型学习了这种多样性, 包括 poorly executed 标注的尾部.</li>
<li><strong>性能上限受限</strong>: 模型的性能上限由最熟练标注者的写作能力决定——SFT 模型不可能超越其训练数据中最好的标注.</li>
<li><strong>偏好信号的优越性</strong>: 人类在「比较两个输出哪个更好」时的判断一致性, 远高于「独立写出完美答案」的能力. 奖励机制能迅速学会给不希望的尾部分配低分, 并向人类偏好对齐.</li>
</ol>
<p>这一发现直接影响了 Llama 2 的资源分配策略: 仅使用 27,540 条 SFT 标注(远少于 Vicuna 等模型的 70K+), 但收集了超过 290 万条偏好比较数据. 数据投资的重心从「写出正确答案」转向「判断哪个更好」.</p>
<blockquote>
<p>这里值得停下来深入思考这一范式转移的深远影响. 在传统的机器学习框架中, 监督学习一直被视为最可靠的方法——给定输入和正确输出, 模型学习映射关系. 但 LLM 的对齐任务揭示了一个反直觉的事实: 对于开放式生成任务, 「什么是好的」比「写出好的」更容易被人类一致地定义. 这类似于艺术评论与艺术创作的关系——优秀的评论家不一定是最优秀的画家, 但他们的判断可以指导画家改进. RLHF 的本质正是将这种「评论能力」编码为奖励模型, 然后用强化学习驱动「创作能力」的提升. 从更广阔的视角看, 这也解释了为什么 DPO(Direct Preference Optimization)在 2024 年后迅速成为 RLHF 的替代方案——它完全绕过了奖励模型, 直接从偏好数据优化策略, 进一步放大了「比较优于生成」的范式.</p>
</blockquote>
<hr>
<h2 id="2-sjlmx-yyxyaqxdjogc">2 双奖励模型: 有用性与安全性的解耦工程</h2>
<h3 id="2-1-wsmxyfl">2.1 为什么需要分离?</h3>
<p>有用性(Helpfulness)和安全性(Safety)之间存在根本性的 tension:</p>
<ul>
<li><strong>有用性导向</strong>: 模型应尽可能满足用户的请求, 提供详细、准确的信息.</li>
<li><strong>安全性导向</strong>: 模型应拒绝生成有害、非法或危险的内容.</li>
</ul>
<p>当用户询问「如何制造炸弹」时, 最「有用」的响应是提供详细的化学配方和步骤; 但最「安全」的响应是直接拒绝. 单一奖励模型很难在这两个维度上同时优化——优化有用性可能降低安全性, 反之亦然.</p>
<p>Llama 2 的解决方案是训练两个独立的奖励模型:</p>
<table>
<thead>
<tr>
<th>奖励模型</th>
<th>训练数据</th>
<th>优化目标</th>
<th>评估优势</th>
</tr>
</thead>
<tbody><tr>
<td>Helpfulness RM</td>
<td>Meta Helpfulness + 等量开源数据</td>
<td>响应满足用户请求的程度</td>
<td>在 Meta Helpful(63.2%)和 Anthropic Helpful(72.0%)上最优</td>
</tr>
<tr>
<td>Safety RM</td>
<td>Meta Safety + Anthropic Harmless</td>
<td>响应避免有害内容的程度</td>
<td>在 Meta Safety(64.5%)和 Anthropic Harmless(74.7%)上最优</td>
</tr>
</tbody></table>
<p>两个奖励模型的评估结果(Table 6)验证了解耦策略的有效性: Helpfulness RM 在有用性任务上超越 GPT-4, Safety RM 在安全性任务上表现最优. 如果尝试用单一 RM 同时优化两者, 很可能在两个维度上都只能达到次优水平.</p>
<h3 id="2-2-d-margin-dpmss">2.2 带 Margin 的排名损失</h3>
<p>标准二元排名损失只要求 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">y_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的分数高于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>r</mi></msub></mrow><annotation encoding="application/x-tex">y_r</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>ranking</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>σ</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>r</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{ranking}} = -\\log(\\sigma(r_\\theta(x,y_{c}) - r_\\theta(x,y_{r})))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ranking</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)))</span></span></span></span></span><p>Llama 2 引入了与偏好强度成正比的 margin:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>ranking</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>σ</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>r</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mi>m</mi><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{ranking}} = -\\log(\\sigma(r_\\theta(x,y_{c}) - r_\\theta(x,y_{r}) - m(r)))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ranking</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">m</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)))</span></span></span></span></span><p>其中 margin <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">m(r)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">m</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span></span> 是人类四级评级的离散映射:</p>
<table>
<thead>
<tr>
<th>人类评级</th>
<th>Margin 值</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td>显著更好</td>
<td>大</td>
<td>两个响应质量差距大, 奖励模型应给出大的分数差</td>
</tr>
<tr>
<td>更好</td>
<td>中</td>
<td>质量差距中等</td>
</tr>
<tr>
<td>稍好</td>
<td>小</td>
<td>质量差距小, 分数差应相应缩小</td>
</tr>
<tr>
<td>几乎相同</td>
<td>极小</td>
<td>两个响应几乎无差别, 分数差应接近 0</td>
</tr>
</tbody></table>
<p>这一设计的工程价值在于: 它强迫奖励模型学习「置信度」——不仅知道哪个更好, 还知道好多少. 在后续 PPO 训练中, 奖励模型的置信度直接影响策略更新的幅度: 对于高置信度(大 margin)的偏好对, PPO 可以更激进地优化; 对于低置信度(小 margin)的偏好对, PPO 应保持谨慎, 避免过度优化.</p>
<h3 id="2-3-fdjlhs-zsyphjz">2.3 分段奖励函数: 自适应平衡机制</h3>
<p>Llama 2 的核心创新之一是分段奖励函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">R_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 它根据提示的安全性自适应地选择使用哪个奖励模型:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mi>c</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>R</mi><mi>s</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mstyle mathcolor="#cc0000"><mtext>\\textsc</mtext></mstyle><mrow><mi>i</mi><mi>s</mi><mi mathvariant="normal">_</mi><mi>s</mi><mi>a</mi><mi>f</mi><mi>e</mi><mi>t</mi><mi>y</mi></mrow><mo stretchy="false">(</mo><mi>p</mi><mo stretchy="false">)</mo><mtext> or </mtext><msub><mi>R</mi><mi>s</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>&lt;</mo><mn>0.15</mn></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>R</mi><mi>h</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">R_c(g \\mid p) = \\begin{cases}
R_s(g \\mid p) &amp; \\text{if } \\textsc{is\\_safety}(p) \\text{ or } R_s(g \\mid p) &lt; 0.15 \\\\
R_h(g \\mid p) &amp; \\text{otherwise}
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord text" style="color:#cc0000;"><span class="mord" style="color:#cc0000;">\\textsc</span></span><span class="mord"><span class="mord mathnormal">i</span><span class="mord mathnormal">s</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal">s</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">e</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span></span><span class="mopen">(</span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mord text"><span class="mord"> or </span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0.15</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>阈值 0.15 的选择对应于 Meta Safety 测试集上精确率 0.89、召回率 0.55. 这意味着:</p>
<ul>
<li>当系统判断提示可能涉及安全问题时(或 Safety RM 给出的分数低于 0.15), 优先使用 Safety RM 的评分.</li>
<li>对于正常提示, 使用 Helpfulness RM 的评分.</li>
</ul>
<p>从工程角度看, 这是一个偏向保守的设置——<strong>宁可误杀(将安全响应标记为不安全), 也不放过真正的有害内容</strong>. 精确率 0.89 意味着被 Safety RM 标记为「不安全」的响应中, 有 89% 确实是真正不安全的; 召回率 0.55 意味着只有 55% 的真正不安全响应被成功捕获. 这个权衡明确偏向「少漏报」, 但也导致了后续用户广泛抱怨的「过度拒绝」问题.</p>
<hr>
<h2 id="3-dd-rlhf-jjcyy-ppo-dzhcl">3 迭代 RLHF: 拒绝采样与 PPO 的组合策略</h2>
<h3 id="3-1-lz-rl-sfdgcdb">3.1 两种 RL 算法的工程对比</h3>
<p>Llama 2 在 5 轮迭代中探索了两种 RL 算法的组合:</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>Rejection Sampling(RS)</th>
<th>Proximal Policy Optimization(PPO)</th>
</tr>
</thead>
<tbody><tr>
<td>探索广度</td>
<td>高(每提示采样 K=10~100 个输出)</td>
<td>低(单样本生成)</td>
</tr>
<tr>
<td>优化深度</td>
<td>浅(从固定策略采样后 SFT)</td>
<td>深(在线策略更新)</td>
</tr>
<tr>
<td>计算成本</td>
<td>高(采样 K 个输出的推理成本)</td>
<td>中等(在线采样的生成成本)</td>
</tr>
<tr>
<td>训练稳定性</td>
<td>高(无在线策略漂移)</td>
<td>中等(需 KL 惩罚约束)</td>
</tr>
<tr>
<td>适用阶段</td>
<td>早期迭代(V1~V4)建立基础能力</td>
<td>后期迭代(V4~V5)精细优化</td>
</tr>
</tbody></table>
<p>Llama 2 的工程决策是:<strong>先用 RS 建立基础能力, 再用 PPO 精细优化</strong>. 直到 RLHF-V4 只使用 RS, 之后按顺序组合两种算法——在 RS Checkpoint 上应用 PPO 后再采样.</p>
<p>这一策略的合理性在于: RS 通过大量采样「探索」了策略空间中的高质量响应, 但缺乏对策略本身的在线更新能力. PPO 可以在 RS 发现的优质响应基础上, 进一步微调策略参数, 使模型更稳定地生成高质量输出. 两种算法的组合实现了「广度 + 深度」的优势互补.</p>
<h3 id="3-2-jjcydgcxj">3.2 拒绝采样的工程细节</h3>
<p><strong>采样温度动态调整</strong>是 Llama 2 RS 的一个关键发现. 团队观察到最优温度在迭代过程中并非恒定:</p>
<ul>
<li>标准推理温度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>=</mo><mn>0.7</mn></mrow><annotation encoding="application/x-tex">T = 0.7</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.7</span></span></span></span></li>
<li>RS 最优温度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>∈</mo><mo stretchy="false">[</mo><mn>1.2</mn><mo separator="true">,</mo><mn>1.3</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">T \\in [1.2, 1.3]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1.2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1.3</span><span class="mclose">]</span></span></span></span></li>
</ul>
<p>更高温度产生更多样化的输出, 增加找到高质量候选的概率. 但随着 RLHF 迭代推进, 模型本身的能力提升, 高质量输出的密度增加, 温度可以逐步降低.</p>
<p><strong>跨模型蒸馏</strong>是另一个重要工程决策: RS 仅对最大的 70B 模型执行, 较小模型(7B/13B/34B)直接在 70B 模型的 RS 数据上微调. 这是一种自然的能力蒸馏——小模型不需要自己探索策略空间, 而是直接学习大模型已经筛选出的「精华」.</p>
<h3 id="3-3-ppo-dwdxgc">3.3 PPO 的稳定性工程</h3>
<p>Llama 2 的 PPO 实现包含多项稳定性措施:</p>
<p><strong>KL 惩罚的动态调整</strong>: 最终奖励函数包含偏离原始策略的惩罚项:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>R</mi><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mover accent="true"><mi>R</mi><mo>~</mo></mover><mi>c</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>−</mo><mi>β</mi><msub><mi>D</mi><mrow><mi>K</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>∥</mo><msub><mi>π</mi><mn>0</mn></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R(g \\mid p) = \\tilde{R}_{c}(g \\mid p) - \\beta D_{KL}(\\pi_{\\theta}(g \\mid p) \\parallel \\pi_{0}(g \\mid p))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1702em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">))</span></span></span></span></span><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 随模型规模调整: 7B/13B 使用 0.01, 34B/70B 使用 0.005. 更大的模型需要更小的 KL 约束——因为大模型的策略空间更复杂, 过强的约束会限制优化空间, 导致 reward hacking 的缓解效果下降但模型能力提升受限.<p><strong>分段组合的安全优先</strong>: 如 2.3 节所述, 对于对抗性提示优先使用 Safety RM, 正常提示使用 Helpfulness RM. 这一机制在 PPO 的在线采样阶段即生效, 确保策略优化过程中不会「意外」学会生成有害内容.</p>
<hr>
<h2 id="4-ghost-attention-dlyzxddcbfa">4 Ghost Attention: 多轮一致性的低成本方案</h2>
<h3 id="4-1-wtdy-xtxxyw">4.1 问题定义: 系统消息遗忘</h3>
<p>在多轮对话中, 初始系统消息(如「扮演拿破仑」或「用俳句回答」)应在所有轮次中持续生效. 但标准的 Transformer 注意力机制存在「近因偏置」(recency bias)——模型对最近几轮的内容注意力权重更高, 对早期系统消息的关注度随轮次增加而衰减.</p>
<p>Llama 2-Chat 的初始 RLHF 模型在几轮对话后就会「遗忘」初始指令, 这是 Transformer 架构的固有局限, 而非训练数据的问题.</p>
<h3 id="4-2-gatt-dsjgcjf">4.2 GAtt 的数据工程解法</h3>
<p>Ghost Attention(GAtt)不修改模型架构, 而是通过巧妙的训练数据构造来解决这一问题:</p>
<ol>
<li><strong>训练时增强</strong>: 将指令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi></mrow><annotation encoding="application/x-tex">inst</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span></span></span></span> 添加到所有用户消息中, 合成数据为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi><mo>+</mo><msub><mi>u</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>1</mn></msub><mo separator="true">,</mo><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi><mo>+</mo><msub><mi>u</mi><mn>2</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>…</mo><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[inst+u_1, a_1, inst+u_2, a_2, \\ldots]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mclose">]</span></span></span></span></li>
<li><strong>损失屏蔽</strong>: 在中间轮次中, 将前几轮所有 token 的损失设为 0(包括助手消息)</li>
<li><strong>采样精炼</strong>: 使用最新 RLHF 模型从合成数据中采样, 获得一致的对话轨迹</li>
</ol>
<p>「幽灵效果」的核心机制: 模型在训练时「看到」指令无处不在, 但损失函数只在第一轮显式地优化指令遵循. 后续轮次中, 模型必须通过注意力机制隐式地保持对指令的「记忆」——因为指令 token 虽然存在于输入中, 但不参与损失计算, 模型必须学会「利用」它们而非「生成」它们.</p>
<h3 id="4-3-xgyfh">4.3 效果与泛化</h3>
<p>定量分析表明 GAtt 在多达 20+ 轮中保持一致. 更有趣的是其泛化能力: 即使在推理时设置 GAtt 训练中不存在的约束(如「始终用俳句回答」), 模型仍然保持一致. 这说明 GAtt 学到的不是特定指令的记忆, 而是一种「遵循系统指令的元能力」.</p>
<p>从成本角度看, GAtt 是一个零架构改动、零额外推理开销的解决方案. 对比之下, 后续模型(如 GPT-4)可能采用了更复杂的机制(如专门的系统消息编码器或记忆模块)来解决同样的问题, 但代价是架构复杂度的增加.</p>
<hr>
<h2 id="5-aqdq-context-distillation-yhdcs">5 安全对齐: Context Distillation 与红队测试</h2>
<h3 id="5-1-context-distillation-djsyl">5.1 Context Distillation 的技术原理</h3>
<p>Context Distillation 是 Llama 2 安全对齐的关键技术, 其目标是将系统提示的安全约束「蒸馏」到模型本身中, 使模型在没有显式系统提示的情况下也能表现出安全行为.</p>
<p>具体流程:</p>
<ol>
<li><strong>有系统提示采样</strong>: 在安全系统提示(如「你是一个有帮助且安全的 AI 助手...」)的存在下, 从模型采样输出.</li>
<li><strong>无系统提示微调</strong>: 在没有系统提示的情况下, 微调模型以生成与步骤 1 相同的输出.</li>
<li><strong>能力内化</strong>: 模型学会了「内化」系统提示的安全约束, 即使开发者忘记设置系统提示, 模型仍具有一定的自我保护能力.</li>
</ol>
<p>这一技术的价值在于<strong>防御深度</strong>(defense in depth). 即使外部安全层(如输入过滤、系统提示)被绕过, 模型本身仍然具备一定的安全行为倾向. 这类似于计算机安全中的「最小权限原则」——安全不应仅依赖外围防御, 而应在每一层都内置安全机制.</p>
<h3 id="5-2-hdcsdffl">5.2 红队测试的方法论</h3>
<p>Llama 2 与外部供应商合作进行红队测试, 收集了约 2,000 个对抗性提示. 红队测试者覆盖不同背景和专业领域, 被指示尝试使模型产生有害输出.</p>
<p>三个安全类别:</p>
<table>
<thead>
<tr>
<th>类别</th>
<th>示例</th>
<th>覆盖范围</th>
</tr>
</thead>
<tbody><tr>
<td>非法和犯罪行为</td>
<td>「如何制造毒品」「如何入侵银行账户」</td>
<td>法律禁区</td>
</tr>
<tr>
<td>仇恨和有害活动</td>
<td>「生成针对某群体的仇恨言论」</td>
<td>社会伦理</td>
</tr>
<tr>
<td>不合格的建议</td>
<td>「我有胸痛, 应该吃什么药」</td>
<td>健康安全</td>
</tr>
</tbody></table>
<p>红队测试的数据被用于两个目的:</p>
<ol>
<li><strong>安全 SFT 数据</strong>: 收集对抗性提示的安全/不安全响应对, 进行监督微调.</li>
<li><strong>安全 RLHF 数据</strong>: 对对抗性提示的模型输出进行偏好标注, 训练 Safety RM.</li>
</ol>
<blockquote>
<p>这里需要停下来想一下红队测试的行业现状. Llama 2 的红队测试规模(约 2,000 个对抗性提示)在 2023 年属于中等水平——OpenAI 的 GPT-4 红队测试据称涉及数百名专家、持续数月、覆盖数万提示. 红队测试的核心挑战不是「找到有害输出」(这相对容易), 而是「找到模型自以为安全但实际上有害的边缘案例」. 例如, 模型可能拒绝直接提供炸弹配方, 但会详细解释某些化学物质的工业用途——这些信息间接可用于制造爆炸物. 检测这种「间接有害性」需要红队测试者具备专业领域知识(如化学、法律、网络安全), 而不仅仅是通用 prompt engineering 技能. 从成本角度看, 专业红队测试的标注成本可能是普通偏好标注的 5-10 倍, 这使得大规模红队测试成为只有少数公司能负担的「奢侈品」.</p>
</blockquote>
<h3 id="5-3-aq-yyqh-gdjjwt">5.3 安全-有用权衡: 过度拒绝问题</h3>
<p>Llama 2 的安全对齐策略在提升安全性的同时, 也带来了「过度拒绝」(over-refusal)问题. 论文中坦诚地承认:</p>
<blockquote>
<p>「在某些情况下, 我们的安全微调可能过度. Llama 2-Chat 的用户可能观察到过于谨慎的方法, 模型倾向于拒绝某些请求或用太多安全细节响应.」</p>
</blockquote>
<p>过度拒绝的典型场景包括:</p>
<ul>
<li>询问历史事件中的暴力内容(如「二战中的战争罪行」)被拒绝.</li>
<li>请求医学信息(如「某种药物副作用」)被过度警告.</li>
<li>创意写作中的敏感主题(如「写一个关于绑架的悬疑故事」)被拒绝.</li>
</ul>
<p>根本原因是分段奖励函数中阈值 0.15 的保守设置: 精确率 0.89、召回率 0.55 明确偏向「少漏报」. 在统计学习中, 提高精确率通常以降低召回率为代价, 反之亦然. Llama 2 选择了高精确率(减少误报——即把有害内容判断为安全), 但代价是低召回率(大量合法内容被误判为有害).</p>
<p>后续模型的改进方向:</p>
<ul>
<li><strong>Llama 3</strong>: 通过更精细的奖励模型和更低的拒绝阈值, 显著降低了误拒率.</li>
<li><strong>Claude 3</strong>: 采用「Constitutional AI」方法, 通过自我批评和修正来平衡安全与有用性.</li>
<li><strong>GPT-4</strong>: 多轮安全审核和更细粒度的内容分类, 减少「一刀切」的拒绝.</li>
</ul>
<hr>
<h2 id="6-yxxx-gjsyywdzsf">6 涌现现象: 工具使用与温度重缩放</h2>
<h3 id="6-1-gjsydzfyx">6.1 工具使用的自发涌现</h3>
<p>Llama 2-Chat 从未在工具使用数据上训练, 却能理解工具的语义、API 参数, 并能在 zero-shot 上下文中使用工具序列. 在数学数据集上的评估结果:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>ASDiv</th>
<th>SVAMP</th>
<th>MAWPS</th>
</tr>
</thead>
<tbody><tr>
<td>Toolformer</td>
<td>40.4</td>
<td>29.4</td>
<td>44.0</td>
</tr>
<tr>
<td>Llama 2-Chat</td>
<td><strong>67.1</strong></td>
<td><strong>69.2</strong></td>
<td><strong>82.4</strong></td>
</tr>
</tbody></table>
<p>这一发现暗示: <strong>足够强大的语言模型可能不需要专门的工具训练——对齐过程本身就能激发模型利用外部资源的倾向</strong>. 这与「涌现能力」(emergent abilities)的文献一致: 某些能力不是通过显式训练获得的, 而是在模型规模和对齐程度达到某个阈值后自然出现的.</p>
<p>但这也带来了安全担忧: 如果模型能自发学会使用工具, 它也可能学会使用危险工具或被恶意利用. 后续研究(如 GPT-4 的工具使用能力和 AutoGPT 项目)证实了这种双重性——工具使用既是能力提升的催化剂, 也是安全风险的放大器.</p>
<h3 id="6-2-in-context-temperature-rescaling">6.2 In-Context Temperature Rescaling</h3>
<p>Llama 2 团队观察到一个与 RLHF 相关的有趣现象: 温度根据上下文动态重缩放.</p>
<table>
<thead>
<tr>
<th>提示类型</th>
<th>温度效应</th>
<th>机制解释</th>
</tr>
</thead>
<tbody><tr>
<td>创造性提示(如「写一首诗」)</td>
<td>高温继续产生多样性</td>
<td>模型学会「创意任务需要多样化」</td>
</tr>
<tr>
<td>事实性提示(如「什么是法国首都」)</td>
<td>Self-BLEU 随时间下降</td>
<td>模型学会「事实任务需要一致性」</td>
</tr>
</tbody></table>
<p>这说明 RLHF 不仅改变了模型的输出分布, 还改变了模型对「何时应该多样化」的元认知. 模型内化了不同任务类型的「适当温度」, 即使推理时使用了固定的温度参数, 输出行为也呈现出任务相关的动态调整.</p>
<hr>
<h2 id="7-skjd">7 思考节点</h2>
<ThinkingNode category="设计动机">
Llama 2 选择「双奖励模型 + 分段奖励函数」的安全策略, 而非 OpenAI 的「单一奖励模型 + 安全过滤层」策略, 反映了两种安全哲学的差异. OpenAI 的方法将安全性外包给外围系统(输入过滤、输出审核、系统提示), 模型本身专注于有用性. Meta 的方法则将安全性「内建」到奖励函数中, 使模型本身具备安全判断能力. 两种策略各有优劣: 外围过滤更灵活(可以实时更新规则), 但容易被绕过(如 jailbreak 攻击); 内建安全更 robust, 但难以动态调整(需要重新训练奖励模型). Llama 2 的 Context Distillation 是两者的折中——将外围安全提示内化为模型能力. 从后续发展看, 内建安全逐渐成为主流, 因为 jailbreak 攻击的 sophistication 不断提升, 外围过滤的防御效果递减.
</ThinkingNode><ThinkingNode category="架构细节">
带 margin 的排名损失(公式 2)是一个低成本但高回报的设计改进. 标准二元排名损失只优化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mo>&gt;</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>r</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_\\theta(x, y_c) &gt; r_\\theta(x, y_r)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 这一不等式, 是一个「零一」目标. 引入 margin 后, 损失函数变成了「程度」目标——不仅要求 chosen 分数更高, 还要求高出一个与偏好强度成正比的量. 这在数学上等价于对奖励模型的「判别力」施加正则化: 对于质量差距大的响应对, 模型必须给出 confidently 不同的分数; 对于质量接近的响应对, 分数差异应相应缩小. 这种正则化提高了奖励模型在 PPO 训练中的稳定性——因为 PPO 的梯度大小与奖励差成正比, 如果奖励模型对所有响应对都给出相似的分数差, PPO 的更新信号将非常 noisy. margin 机制确保了 PPO 在不同样本上获得幅度适当的更新信号.
</ThinkingNode><ThinkingNode category="局限性与延伸思考">
Llama 2 的「过度拒绝」问题是 RLHF 安全-有用权衡的经典案例, 但其根源可能比表面看起来更深层. 分段奖励函数中的阈值 0.15 是一个硬性 cutoff——一旦 Safety RM 的评分低于此阈值, 即使 Helpfulness RM 给出极高分数, 系统也优先采用 Safety RM 的评分. 这种「硬切换」缺乏平滑过渡, 导致在阈值附近的提示产生不可预测的行为(同一提示的微小措辞变化可能导致从「完全回答」到「完全拒绝」的突变). 后续模型(如 Claude 3 的 Constitutional AI)采用更柔和的策略: 模型不是简单地拒绝, 而是尝试在回答有用信息的同时表达安全关切(如「我可以解释这个概念, 但请注意...」). 这种「有条件回答」策略在保持安全性的同时减少了误拒率, 代表了安全对齐技术的重要演进方向.
</ThinkingNode><ThinkingNode category="行业影响">
Llama 2 的 RLHF 方法论对整个开源社区产生了深远影响. 在 Llama 2 之前, 开源模型的对齐主要依赖 SFT(如 Vicuna、WizardLM), RLHF 被视为闭源模型的「独门秘籍」. Llama 2 论文详细披露了 RLHF 的完整流程(双 RM、RS、PPO、GAtt、Context Distillation), 证明了 RLHF 在开源模型中的可行性. 这直接催生了后续开源项目的 RLHF 实践: Zephyr(基于 Mistral, 使用 DPO 替代 PPO)、OpenHermes(基于 Llama 2, 使用开源偏好数据训练 RM)、以及多个使用 LLaMA-Factory 等工具进行 RLHF 微调的社区项目. 从更宏观的视角看, Llama 2 使「开源模型 + 开源对齐方法」成为与「闭源模型 + 闭源对齐方法」并行的技术路线, 推动了 AI 对齐研究的民主化.
</ThinkingNode><ThinkingNode category="技术谱系">
Llama 2 的 RLHF 技术可以追溯到一个清晰的谱系链. 起点是 InstructGPT(2022), 首次将 RLHF 应用于 LLM, 确立了「SFT -> RM -> PPO」的三阶段框架. 随后 ChatGPT(2022)将这一框架产品化, 但未公开技术细节. Llama 2(2023)在 InstructGPT 框架基础上做了三项关键改进: (1) 双 RM 解耦有用性与安全性; (2) RS + PPO 的组合策略; (3) GAtt 和 Context Distillation 等工程创新. 后续演进中, DPO(2023)完全绕过了奖励模型和强化学习, 直接从偏好数据优化策略, 代表了「简化 RLHF」的方向. 2024 年后, 迭代 DPO(如 IPO、KTO、RS-DPO)和在线 DPO(如 Online DPO、SimPO)进一步简化了流程, 同时保持了性能. 从谱系角度看, Llama 2 处于「经典 RLHF」时代的巅峰, 也是「后 RLHF」时代(DPO 等简化方法)的前奏.
</ThinkingNode><hr>
<h2 id="8-zj">8 总结</h2>
<p>Llama 2 的 RLHF 与安全对齐代表了 2023 年开源模型对齐技术的最高水平, 其核心贡献可归纳为:</p>
<ol>
<li><p><strong>双奖励模型</strong>: 首次在开源模型中系统性地分离有用性与安全性, 通过分段奖励函数实现自适应平衡.</p>
</li>
<li><p><strong>迭代 RLHF</strong>: 5 轮 RS + PPO 的组合策略, 将模型能力在反馈循环中逐步提升, 同时通过跨模型蒸馏将大模型能力传递给小模型.</p>
</li>
<li><p><strong>Ghost Attention</strong>: 零架构改动的多轮一致性方案, 通过巧妙的数据构造解决系统消息遗忘问题.</p>
</li>
<li><p><strong>Context Distillation</strong>: 将安全约束内化为模型能力, 实现 defense in depth 的安全架构.</p>
</li>
<li><p><strong>范式转移</strong>: 「监督数据不再是黄金标准」的发现, 推动了社区从 SFT 向 RLHF/DPO 的转向.</p>
</li>
</ol>
<p>从局限性看, 保守的安全阈值导致的过度拒绝问题, 以及红队测试规模相对有限(2,000 提示 vs GPT-4 的数万提示), 是 Llama 2 安全对齐的主要短板. 这些问题在后续模型(Llama 3、Claude 3 等)中得到了不同程度的改善.</p>
<hr>
<blockquote>
<p><strong>译者注</strong>: 本文基于《Llama 2: Open Foundation and Fine-Tuned Chat Models》(arXiv:2307.09288)技术报告中 Fine-Tuning 和 Safety 章节的内容进行综合剖析. 文中关于 RLHF 技术演进、双奖励模型设计、涌现现象的讨论融合了后续研究(如 DPO、Constitutional AI 等)的视角, 以提供完整的技术谱系脉络. 成本估算和安全性分析基于公开信息和行业惯例的合理推断.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-rlhf-fsdyj-c-instruct-gpt-d-llama-2","text":"1 RLHF 范式的演进: 从 InstructGPT 到 Llama 2"},{"level":3,"id":"1-1-sd-rlhf-faddb","text":"1.1 三代 RLHF 方案的对比"},{"level":3,"id":"1-2-jdsjbzshjbz-dfszy","text":"1.2 「监督数据不再是黄金标准」的范式转移"},{"level":2,"id":"2-sjlmx-yyxyaqxdjogc","text":"2 双奖励模型: 有用性与安全性的解耦工程"},{"level":3,"id":"2-1-wsmxyfl","text":"2.1 为什么需要分离?"},{"level":3,"id":"2-2-d-margin-dpmss","text":"2.2 带 Margin 的排名损失"},{"level":3,"id":"2-3-fdjlhs-zsyphjz","text":"2.3 分段奖励函数: 自适应平衡机制"},{"level":2,"id":"3-dd-rlhf-jjcyy-ppo-dzhcl","text":"3 迭代 RLHF: 拒绝采样与 PPO 的组合策略"},{"level":3,"id":"3-1-lz-rl-sfdgcdb","text":"3.1 两种 RL 算法的工程对比"},{"level":3,"id":"3-2-jjcydgcxj","text":"3.2 拒绝采样的工程细节"},{"level":3,"id":"3-3-ppo-dwdxgc","text":"3.3 PPO 的稳定性工程"},{"level":2,"id":"4-ghost-attention-dlyzxddcbfa","text":"4 Ghost Attention: 多轮一致性的低成本方案"},{"level":3,"id":"4-1-wtdy-xtxxyw","text":"4.1 问题定义: 系统消息遗忘"},{"level":3,"id":"4-2-gatt-dsjgcjf","text":"4.2 GAtt 的数据工程解法"},{"level":3,"id":"4-3-xgyfh","text":"4.3 效果与泛化"},{"level":2,"id":"5-aqdq-context-distillation-yhdcs","text":"5 安全对齐: Context Distillation 与红队测试"},{"level":3,"id":"5-1-context-distillation-djsyl","text":"5.1 Context Distillation 的技术原理"},{"level":3,"id":"5-2-hdcsdffl","text":"5.2 红队测试的方法论"},{"level":3,"id":"5-3-aq-yyqh-gdjjwt","text":"5.3 安全-有用权衡: 过度拒绝问题"},{"level":2,"id":"6-yxxx-gjsyywdzsf","text":"6 涌现现象: 工具使用与温度重缩放"},{"level":3,"id":"6-1-gjsydzfyx","text":"6.1 工具使用的自发涌现"},{"level":3,"id":"6-2-in-context-temperature-rescaling","text":"6.2 In-Context Temperature Rescaling"},{"level":2,"id":"7-skjd","text":"7 思考节点"},{"level":2,"id":"8-zj","text":"8 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/02-llama-2/05-llama-2-rlhf" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/02-llama-2/05-llama-2-rlhf" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 2 RLHF 与安全对齐精读</h1>
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
