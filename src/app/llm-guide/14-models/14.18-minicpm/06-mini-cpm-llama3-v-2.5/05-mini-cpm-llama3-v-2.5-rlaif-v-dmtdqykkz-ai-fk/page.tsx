"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-Llama3-V 2.5 核心技术专题：RLAIF-V 多模态对齐与可扩展 AI 反馈</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本专题基于 MiniCPM-V 系列技术报告(arXiv:2408.01800)及 RLAIF-V 相关论文深度解析.
聚焦 Llama3-V 2.5 引入的 RLAIF-V 技术, 不涉及 V 2.0 的 RLHF-V 和后续版本的改进.</p>
</blockquote>
<hr>
<h2 id="1-wtbj-dmthjdzlkj">1. 问题背景：多模态幻觉的治理困境</h2>
<h3 id="1-1-hjddmttsx">1.1 幻觉的多模态特殊性</h3>
<p>多模态大语言模型(MLLM)的幻觉( hallucination )指模型生成与输入图像不事实相符的响应. 与纯文本 LLM 的幻觉相比, 多模态幻觉有两个特殊之处:</p>
<p><strong>可验证性更强</strong>: 文本幻觉(如&quot;牛顿发现了相对论&quot;)需要专业知识才能识别, 但多模态幻觉(如&quot;图中有一只黑猫&quot;而实际没有)用户可以直接看图验证. 这使得多模态幻觉对用户体验的伤害更直接.</p>
<p><strong>来源更复杂</strong>: 文本幻觉通常源于训练数据中的错误或模型知识的局限. 多模态幻觉则可能来自:</p>
<ul>
<li>视觉编码器对图像的错误理解(如将阴影误认为物体)</li>
<li>压缩层的信息损失(关键视觉细节在压缩中丢失)</li>
<li>LLM 的过度推理(从图像中&quot;脑补&quot;不存在的内容)</li>
<li>训练数据中图文不匹配的对(如图片是狗但 caption 写的是猫)</li>
</ul>
<h3 id="1-2-ctdqffdjx">1.2 传统对齐方法的局限</h3>
<p><strong>RLHF(Reinforcement Learning from Human Feedback)</strong> 是减少文本幻觉的标准方法, 但在多模态场景面临三个问题:</p>
<ol>
<li><strong>粒度太粗</strong>: 人类标注者对整个响应打&quot;好/坏&quot;分数, 无法定位响应中具体哪个声明是错误的.</li>
<li><strong>成本太高</strong>: 多模态响应通常包含对图像中多个对象的描述, 人工检查每个对象是否真实存在极其耗时.</li>
<li><strong>规模受限</strong>: 高质量的细粒度人工标注难以规模化, 限制了偏好数据的规模.</li>
</ol>
<p><strong>RLHF-V(V 2.0 使用)</strong> 改进了粒度问题: 将响应分解为原子声明(atomic claims), 人工验证每个声明. 但成本问题依然存在——每个响应可能需要验证 10-50 个原子声明.</p>
<p><strong>RLAIF-V(V 2.5 引入)</strong> 进一步将反馈来源从人类替换为 AI, 实现了成本、粒度和可扩展性的统一.</p>
<hr>
<h2 id="2-rlaif-v-dhxjg">2. RLAIF-V 的核心架构</h2>
<h3 id="2-1-sblcgl">2.1 三步流程概览</h3>
<p>RLAIF-V 包含三个连续阶段:</p>
<pre><code>响应生成 → 反馈收集(原子声明分解 + AI 验证) → DPO 优化
</code></pre>
<h3 id="2-2-jdy-xysc">2.2 阶段一：响应生成</h3>
<p>给定一个等待对齐的策略模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 和一张图像 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>, 首先用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 对给定指令采样 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个响应:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>Y</mi><mo>=</mo><mo stretchy="false">{</mo><msub><mi>y</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>y</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>y</mi><mi>n</mi></msub><mo stretchy="false">}</mo><mo separator="true">,</mo><mspace width="1em"/><msub><mi>y</mi><mi>i</mi></msub><mo>∼</mo><mi>M</mi><mo stretchy="false">(</mo><mo>⋅</mo><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><mtext>prompt</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">Y = \\{y_1, y_2, \\cdots, y_n\\}, \\quad y_i \\sim M(\\cdot | x, \\text{prompt})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∼</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mopen">(</span><span class="mord">⋅</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">prompt</span></span><span class="mclose">)</span></span></span></span></span><p>论文中使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>=</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">n = 10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10</span></span></span></span>, 采样时采用高 temperature 以增加响应多样性.</p>
<p><strong>为什么用策略模型自身生成响应?</strong></p>
<p>而不是用多个不同的 MLLM 生成响应:</p>
<ol>
<li><strong>风格一致性</strong>: 避免不同模型的文本风格差异干扰反馈学习</li>
<li><strong>分布匹配</strong>: 偏好数据直接来自策略模型的输出分布, DPO 学习效率更高</li>
<li><strong>聚焦可信性</strong>: 反馈专注于&quot;这个模型自身在什么情况下会说谎&quot;, 而非&quot;不同模型谁说得更好&quot;</li>
</ol>
<h3 id="2-3-jde-fksj-yzsmfj">2.3 阶段二：反馈收集——原子声明分解</h3>
<p>这是 RLAIF-V 的核心创新. 每个响应 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">y_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 被分解为一组原子声明:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>C</mi><mi>i</mi></msub><mo>=</mo><mo stretchy="false">{</mo><msub><mi>c</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>c</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>c</mi><mi>m</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">C_i = \\{c_1, c_2, \\cdots, c_m\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span></span><p><strong>原子声明的定义</strong>: 不可再分的最小事实单元. 例如:</p>
<ul>
<li>响应: &quot;图中有一只黑猫坐在椅子上, 旁边有一盆绿色的植物.&quot;</li>
<li>原子声明: [&quot;图中有一只猫&quot;, &quot;猫是黑色的&quot;, &quot;猫坐在椅子上&quot;, &quot;旁边有一盆植物&quot;, &quot;植物是绿色的&quot;]</li>
</ul>
<p><strong>分解工具</strong>: 使用 Llama-3 8B 作为声明分解器. 输入响应, 输出原子声明列表.</p>
<blockquote>
<p>这里需要 Llama-3 8B 而非更小的模型, 因为声明分解需要理解响应的语义结构, 识别隐含的关系和属性. 小模型可能在复杂句子的分解上出错, 导致后续验证失效.</p>
</blockquote>
<h3 id="2-4-jde-fksj-ai-yz">2.4 阶段二：反馈收集——AI 验证</h3>
<p>对每个原子声明 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>c</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">c_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>, 将其转化为一个 yes/no 问题:</p>
<ul>
<li>声明: &quot;图中有一只猫&quot;</li>
<li>转化后: &quot;图中是否有一只猫?&quot;</li>
</ul>
<p>然后用一个开源 MLLM(验证器)回答这个问题. 论文中使用 <strong>LLaVA-NeXT-Yi 34B</strong> 作为验证器.</p>
<p>验证结果:</p>
<ul>
<li>&quot;yes&quot; → 声明正确</li>
<li>&quot;no&quot; → 声明错误(幻觉)</li>
<li>其他/拒绝回答 → 视为不确定(通常计入错误)</li>
</ul>
<p><strong>响应得分</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub><mo>=</mo><mo>−</mo><msub><mi>n</mi><mrow><mi>r</mi><mi>e</mi><mi>j</mi></mrow></msub></mrow><annotation encoding="application/x-tex">s_i = -n_{rej}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>r</mi><mi>e</mi><mi>j</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{rej}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是被拒绝(验证为错误)的原子声明数量. 得分越高(拒绝越少), 响应越可信.</p>
<blockquote>
<p>译者注: 验证器选择 LLaVA-NeXT-Yi 34B 是经过深思熟虑的. 34B 的规模确保其视觉理解能力显著强于 8.5B 的策略模型, 从而保证&quot;验证器强于被验证者&quot;的前提. 但这也带来了成本问题: 验证一个响应可能需要对 20-30 个原子声明分别进行推理, 每个声明的推理需要 34B 模型的一次 forward pass. 总计算量可能达到策略模型训练本身的 10-20%. 不过这是一次性成本——偏好数据生成后可以重复使用.</p>
</blockquote>
<h3 id="2-5-jds-dpo-yh">2.5 阶段三：DPO 优化</h3>
<p>基于响应得分构建偏好对. 从每个响应集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Y</mi></mrow><annotation encoding="application/x-tex">Y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span></span></span></span> 中随机采样两个响应 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>y</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">y_i, y_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>, 如果 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub><mo>&gt;</mo><msub><mi>s</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">s_i &gt; s_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>, 则构建偏好对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>y</mi><mi>w</mi></msub><mo>=</mo><msub><mi>y</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>y</mi><mi>l</mi></msub><mo>=</mo><msub><mi>y</mi><mi>j</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(y_w = y_i, y_l = y_j)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>.</p>
<p>最终构建约 6K 偏好对(来自 3K 张不同图像).</p>
<p>DPO 优化目标:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>D</mi><mi>P</mi><mi>O</mi></mrow></msub><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>w</mi></msub><mo separator="true">,</mo><msub><mi>y</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mi>σ</mi><mrow><mo fence="true">(</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>w</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>w</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>−</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>l</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>l</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{DPO} = -\\mathbb{E}_{(x, y_w, y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w | x)}{\\pi_{ref}(y_w | x)} - \\beta \\log \\frac{\\pi_\\theta(y_l | x)}{\\pi_{ref}(y_l | x)} \\right) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span></span></span></span><p>其中:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>: 图像 + 问题</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>w</mi></msub></mrow><annotation encoding="application/x-tex">y_w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 高分响应(更少幻觉)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">y_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 低分响应(更多幻觉)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 当前策略模型</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\pi_{ref}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>: 参考模型(SFT 后的模型)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span>: 温度系数(控制偏离参考模型的程度)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span>: sigmoid 函数</li>
</ul>
<p><strong>DPO 的直觉</strong>: 无需训练单独的奖励模型, 直接从偏好数据学习. 损失函数鼓励策略模型给&quot;好响应&quot;分配比参考模型更高的概率, 给&quot;坏响应&quot;分配更低的概率.</p>
<hr>
<h2 id="3-xrsysdjd">3. 消融实验深度解读</h2>
<h3 id="3-1-rlaif-v-dxg">3.1 RLAIF-V 的效果</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>w/o RLAIF-V</th>
<th>w/ RLAIF-V</th>
<th>变化</th>
</tr>
</thead>
<tbody><tr>
<td>OpenCompass</td>
<td>64.5</td>
<td>65.1</td>
<td>+0.6</td>
</tr>
<tr>
<td>MME</td>
<td>2019.8</td>
<td>2024.6</td>
<td>+4.8</td>
</tr>
<tr>
<td>MMB dev</td>
<td>77.7</td>
<td>77.2</td>
<td>-0.5</td>
</tr>
<tr>
<td>MMB test</td>
<td>73.5</td>
<td>74.2</td>
<td>+0.7</td>
</tr>
<tr>
<td>MMMU</td>
<td>46.2</td>
<td>45.8</td>
<td>-0.4</td>
</tr>
<tr>
<td>MathVista</td>
<td>54.1</td>
<td>54.3</td>
<td>+0.2</td>
</tr>
<tr>
<td>LLaVA Bench</td>
<td>85.4</td>
<td>86.7</td>
<td>+1.3</td>
</tr>
<tr>
<td>Object HalBench 响应级</td>
<td>86.9</td>
<td>89.7</td>
<td>+2.8</td>
</tr>
<tr>
<td>Object HalBench 提及级</td>
<td>93.6</td>
<td>95.0</td>
<td>+1.4</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>:</p>
<ol>
<li><p><strong>通用能力变化温和</strong>: OpenCompass 仅 +0.6, MMMU 甚至 -0.4. 这说明 RLAIF-V 不是&quot;让模型更聪明&quot;, 而是&quot;让模型更诚实&quot;.</p>
</li>
<li><p><strong>幻觉改善显著</strong>: Object HalBench 响应级准确率 +2.8, 提及级 +1.4. 这是 RLAIF-V 的核心价值所在.</p>
</li>
<li><p><strong>LLaVA Bench +1.3</strong>: 说明在开放式视觉问答中, 减少幻觉直接提升了回答质量.</p>
</li>
<li><p><strong>MMB dev -0.5</strong>: 微小的负面变化可能是因为 RLAIF-V 的保守性——模型为了避免幻觉而减少了&quot;大胆猜测&quot;, 在某些需要推理的基准上略有下降.</p>
</li>
</ol>
<h3 id="3-2-dyy-sft-dxg">3.2 多语言 SFT 的效果</h3>
<table>
<thead>
<tr>
<th>语言</th>
<th>w/o ML SFT</th>
<th>w/ ML SFT</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>French</td>
<td>46.4</td>
<td>72.7</td>
<td>+26.3</td>
</tr>
<tr>
<td>German</td>
<td>22.8</td>
<td>76.5</td>
<td>+53.7</td>
</tr>
<tr>
<td>Portuguese</td>
<td>53.0</td>
<td>83.8</td>
<td>+30.8</td>
</tr>
<tr>
<td>Spanish</td>
<td>29.0</td>
<td>73.9</td>
<td>+44.9</td>
</tr>
<tr>
<td>Japanese</td>
<td>13.8</td>
<td>88.0</td>
<td>+74.2</td>
</tr>
<tr>
<td>Korean</td>
<td>13.7</td>
<td>67.9</td>
<td>+54.2</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>:</p>
<ul>
<li>日语提升最大(+74.2), 这与 Llama-3-8B 在日语上的强能力有关</li>
<li>德语从无 SFT 的 22.8 跃升到 76.5, 说明多模态能力的跨语言迁移效果非常显著</li>
<li>所有语言均提升 25+ 分, 验证了 VisCPM 方法论的普适性</li>
</ul>
<hr>
<h2 id="4-jssxxj">4. 技术实现细节</h2>
<h3 id="4-1-yzsmfjd-prompt-gc">4.1 原子声明分解的 prompt 工程</h3>
<p>声明分解的质量直接影响后续验证的准确性. 一个有效的分解 prompt 需要:</p>
<ol>
<li><strong>明确原子性要求</strong>: 每个声明必须是&quot;最小不可分单元&quot;</li>
<li><strong>覆盖完整性</strong>: 不能遗漏响应中的任何信息</li>
<li><strong>语义准确性</strong>: 不能改变原意</li>
</ol>
<p>示例 prompt 结构:</p>
<pre><code>将以下描述分解为原子声明. 每个声明应该是一个独立的事实,
可以用 yes/no 问题验证. 确保覆盖描述中的所有对象、属性和关系.

描述: [模型响应]

原子声明列表:
1. ...
2. ...
</code></pre>
<h3 id="4-2-yzqd-prompt-sj">4.2 验证器的 prompt 设计</h3>
<p>验证器需要回答&quot;图中是否有 X?&quot;类型的问题. 关键设计:</p>
<ol>
<li><strong>图像-问题配对</strong>: 将原始图像和 yes/no 问题一起输入验证器 MLLM</li>
<li><strong>回答格式约束</strong>: 要求验证器只回答&quot;yes&quot;或&quot;no&quot;, 减少模糊回答</li>
<li><strong>阈值处理</strong>: 对于不确定的回答, 可以设置置信度阈值, 低于阈值视为&quot;no&quot;</li>
</ol>
<h3 id="4-3-dpo-xldgckl">4.3 DPO 训练的工程考量</h3>
<p><strong>超参数选择</strong>:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 通常设为 0.1-0.5. 较小的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 允许策略模型更自由地偏离参考模型; 较大的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 限制偏离程度, 保持稳定性.</li>
<li>学习率: 通常比 SFT 低 1-2 个数量级(如 1e-6)</li>
<li>训练步数: 6K 偏好对通常只需 1-3 个 epoch</li>
</ul>
<p><strong>参考模型的选择</strong>:</p>
<ul>
<li>使用 SFT 后的模型作为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\pi_{ref}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></li>
<li>参考模型在训练过程中保持冻结</li>
<li>如果参考模型本身幻觉严重, DPO 的效果会受限</li>
</ul>
<hr>
<h2 id="5-rlaif-v-djxyfx">5. RLAIF-V 的局限与风险</h2>
<h3 id="5-1-yzqdzlpj">5.1 验证器的质量瓶颈</h3>
<p>RLAIF-V 的上限受限于验证器 MLLM 的能力:</p>
<ul>
<li><strong>验证器幻觉</strong>: 如果验证器错误地将正确声明标记为错误, 会生成错误的偏好信号</li>
<li><strong>偏见传递</strong>: 验证器的偏见(如对特定物体类型的识别偏好)会被编码进偏好数据</li>
<li><strong>能力边界</strong>: 对于验证器自身也无法判断的复杂声明(如&quot;这幅画是印象派风格&quot;), 验证结果不可靠</li>
</ul>
<p><strong>缓解策略</strong>:</p>
<ul>
<li>使用比策略模型大 2-4 倍的验证器(如 34B 验证 8B)</li>
<li>多验证器投票: 用多个不同的 MLLM 验证同一个声明, 取多数结果</li>
<li>置信度过滤: 只使用高置信度的验证结果构建偏好对</li>
</ul>
<h3 id="5-2-smfjdwclj">5.2 声明分解的误差累积</h3>
<p>声明分解是一个有损过程:</p>
<ul>
<li>分解器可能遗漏响应中的某些信息</li>
<li>分解器可能将复合声明错误地拆分为不完整的子声明</li>
<li>分解器可能引入原响应中没有的隐含假设</li>
</ul>
<p>这些误差会传递到验证阶段, 导致错误的偏好信号.</p>
<h3 id="5-3-phsjdfgd">5.3 偏好数据的覆盖度</h3>
<p>6K 偏好对来自 3K 张图像, 覆盖的场景有限:</p>
<ul>
<li>如果训练数据中缺少某类图像(如医学影像、卫星图像), 模型在该类图像上的幻觉行为可能未被纠正</li>
<li>偏好数据的规模(6K)相对较小, 可能不足以覆盖所有常见的幻觉模式</li>
</ul>
<h3 id="5-4-y-rlhf-v-dqh">5.4 与 RLHF-V 的权衡</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>RLHF-V</th>
<th>RLAIF-V</th>
</tr>
</thead>
<tbody><tr>
<td>反馈质量</td>
<td>高(人类理解深度)</td>
<td>中(依赖验证器)</td>
</tr>
<tr>
<td>成本</td>
<td>高</td>
<td>低</td>
</tr>
<tr>
<td>可扩展性</td>
<td>低</td>
<td>高</td>
</tr>
<tr>
<td>适用场景</td>
<td>高风险、需要高可信性的场景</td>
<td>大规模、快速迭代的场景</td>
</tr>
<tr>
<td>最佳实践</td>
<td>两者结合: RLAIF-V 生成大规模初步偏好数据, RLHF-V 对关键子集进行精修</td>
<td></td>
</tr>
</tbody></table>
<hr>
<h2 id="6-yjpddqjsdb">6. 与竞品的对齐技术对比</h2>
<table>
<thead>
<tr>
<th>模型</th>
<th>对齐方法</th>
<th>反馈来源</th>
<th>粒度</th>
<th>可扩展性</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.0</td>
<td>RLHF-V</td>
<td>人类</td>
<td>原子声明</td>
<td>低</td>
</tr>
<tr>
<td>MiniCPM-Llama3-V 2.5</td>
<td>RLAIF-V</td>
<td>AI(LLaVA-NeXT-Yi 34B)</td>
<td>原子声明</td>
<td>高</td>
</tr>
<tr>
<td>LLaVA-1.5</td>
<td>RLHF</td>
<td>人类</td>
<td>响应级</td>
<td>低</td>
</tr>
<tr>
<td>InstructBLIP</td>
<td>RLHF</td>
<td>人类</td>
<td>响应级</td>
<td>低</td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>RLHF</td>
<td>人类</td>
<td>响应级</td>
<td>低</td>
</tr>
<tr>
<td>CogVLM</td>
<td>SFT only</td>
<td>无</td>
<td>-</td>
<td>-</td>
</tr>
</tbody></table>
<p><strong>关键差异</strong>:</p>
<ul>
<li><strong>粒度</strong>: MiniCPM-V 系列使用原子声明级反馈, 其他模型主要使用响应级反馈</li>
<li><strong>来源</strong>: 2.5 率先在端侧 MLLM 中使用 AI 反馈, 其他模型仍依赖人工</li>
<li><strong>效果</strong>: 原子声明级反馈在 HalBench 上的表现显著优于响应级反馈</li>
</ul>
<hr>
<h2 id="7-kkzxfxywlfx">7. 可扩展性分析与未来方向</h2>
<h3 id="7-1-rlaif-v-dkzlj">7.1 RLAIF-V 的扩展路径</h3>
<ol>
<li><strong>验证器升级</strong>: 随着更强的开源 MLLM 出现(如 70B 级模型), 验证质量会进一步提升</li>
<li><strong>多轮迭代</strong>: 将对齐后的模型作为新的验证器, 进行多轮 RLAIF-V 迭代</li>
<li><strong>跨模态扩展</strong>: 将原子声明分解和 AI 验证扩展到视频、音频等多模态场景</li>
<li><strong>领域特化</strong>: 针对特定领域(医疗、自动驾驶)训练领域特化的验证器</li>
</ol>
<h3 id="7-2-y-test-time-compute-scaling-djh">7.2 与 Test-time Compute Scaling 的结合</h3>
<p>RLAIF-V 对齐的是&quot;模型说什么&quot;, 而 Test-time Compute Scaling(如 DeepSeek-R1 的长思维链)优化的是&quot;模型怎么想&quot;. 两者的结合方向:</p>
<ul>
<li>在思维链中插入原子声明验证步骤</li>
<li>让模型在生成过程中自我检查每个中间结论</li>
<li>结合 RLAIF-V 的偏好学习和推理时扩展, 实现&quot;既会思考又会诚实&quot;的 MLLM</li>
</ul>
<hr>
<h2 id="8-zj">8. 总结</h2>
<p>RLAIF-V 是 MiniCPM-Llama3-V 2.5 最具原创性的技术贡献. 其核心创新在于:</p>
<ol>
<li><strong>原子声明分解</strong>: 将粗粒度的响应级反馈细化为细粒度的事实级反馈, 精确定位幻觉来源</li>
<li><strong>AI 反馈替代人工</strong>: 用开源 MLLM 自动化验证流程, 实现偏好数据的规模化生成</li>
<li><strong>DPO 高效优化</strong>: 无需奖励模型, 直接从偏好数据优化策略, 实现轻量级对齐</li>
</ol>
<p>实验结果表明, RLAIF-V 在保持通用能力的同时, 将 Object HalBench 响应级准确率从 86.9 提升到 89.7, 使 MiniCPM-Llama3-V 2.5 成为首个在幻觉率上低于 GPT-4V 的端侧 MLLM.</p>
<p>RLAIF-V 的意义不仅限于 MiniCPM-V 系列——它为整个 MLLM 领域的对齐技术提供了一条可扩展、低成本的新路径, 有望推动端侧多模态 AI 的可信行为从&quot;实验室理想&quot;走向&quot;大规模落地&quot;.</p>
<hr>
<blockquote>
<p>本文档已同步至知识库: <a href="#broken-link">docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM-Llama3-V-2.5-RLAIF-V多模态对齐与可扩展AI反馈.md</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj-dmthjdzlkj","text":"1. 问题背景：多模态幻觉的治理困境"},{"level":3,"id":"1-1-hjddmttsx","text":"1.1 幻觉的多模态特殊性"},{"level":3,"id":"1-2-ctdqffdjx","text":"1.2 传统对齐方法的局限"},{"level":2,"id":"2-rlaif-v-dhxjg","text":"2. RLAIF-V 的核心架构"},{"level":3,"id":"2-1-sblcgl","text":"2.1 三步流程概览"},{"level":3,"id":"2-2-jdy-xysc","text":"2.2 阶段一：响应生成"},{"level":3,"id":"2-3-jde-fksj-yzsmfj","text":"2.3 阶段二：反馈收集——原子声明分解"},{"level":3,"id":"2-4-jde-fksj-ai-yz","text":"2.4 阶段二：反馈收集——AI 验证"},{"level":3,"id":"2-5-jds-dpo-yh","text":"2.5 阶段三：DPO 优化"},{"level":2,"id":"3-xrsysdjd","text":"3. 消融实验深度解读"},{"level":3,"id":"3-1-rlaif-v-dxg","text":"3.1 RLAIF-V 的效果"},{"level":3,"id":"3-2-dyy-sft-dxg","text":"3.2 多语言 SFT 的效果"},{"level":2,"id":"4-jssxxj","text":"4. 技术实现细节"},{"level":3,"id":"4-1-yzsmfjd-prompt-gc","text":"4.1 原子声明分解的 prompt 工程"},{"level":3,"id":"4-2-yzqd-prompt-sj","text":"4.2 验证器的 prompt 设计"},{"level":3,"id":"4-3-dpo-xldgckl","text":"4.3 DPO 训练的工程考量"},{"level":2,"id":"5-rlaif-v-djxyfx","text":"5. RLAIF-V 的局限与风险"},{"level":3,"id":"5-1-yzqdzlpj","text":"5.1 验证器的质量瓶颈"},{"level":3,"id":"5-2-smfjdwclj","text":"5.2 声明分解的误差累积"},{"level":3,"id":"5-3-phsjdfgd","text":"5.3 偏好数据的覆盖度"},{"level":3,"id":"5-4-y-rlhf-v-dqh","text":"5.4 与 RLHF-V 的权衡"},{"level":2,"id":"6-yjpddqjsdb","text":"6. 与竞品的对齐技术对比"},{"level":2,"id":"7-kkzxfxywlfx","text":"7. 可扩展性分析与未来方向"},{"level":3,"id":"7-1-rlaif-v-dkzlj","text":"7.1 RLAIF-V 的扩展路径"},{"level":3,"id":"7-2-y-test-time-compute-scaling-djh","text":"7.2 与 Test-time Compute Scaling 的结合"},{"level":2,"id":"8-zj","text":"8. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/06-mini-cpm-llama3-v-2.5/05-mini-cpm-llama3-v-2.5-rlaif-v-dmtdqykkz-ai-fk" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/06-mini-cpm-llama3-v-2.5/05-mini-cpm-llama3-v-2.5-rlaif-v-dmtdqykkz-ai-fk" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-Llama3-V 2.5 核心技术专题：RLAIF-V 多模态对齐与可扩展 AI 反馈</h1>
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
