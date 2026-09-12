"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>隐式思维链推理综述: 超越语言形式的认知表征</h1>
<blockquote>
<p>本文基于《Reasoning Beyond Language: A Comprehensive Survey on Latent Chain-of-Thought Reasoning》(arXiv:2505.16782)梳理隐式思维链(Latent CoT)的技术谱系,分析从逐标记横向策略到逐层纵向策略的演进,探讨隐式推理在超越语言形式的抽象认知任务中的潜力与挑战. </p>
</blockquote>
<hr>
<h2 id="1-cxs-cot-dys-cot">1. 从显式 CoT 到隐式 CoT</h2>
<h3 id="1-1-xs-cot-dbj">1.1 显式 CoT 的边界</h3>
<p>Chain-of-Thought(CoT) prompting 通过促使 LLM 以自然语言逐步阐述推理过程,显著提升了复杂任务的可解释性与性能. 然而,显式 CoT 存在一个根本约束: <strong>推理过程被限制在语言形式的符号空间中</strong>. </p>
<p>这一约束带来三个问题: </p>
<ol>
<li><strong>信息损失</strong>: 许多认知过程(如空间推理、直觉判断、模式识别)难以用自然语言精确表达. 将这类过程强制转化为语言序列,必然伴随信息压缩和扭曲. </li>
<li><strong>效率瓶颈</strong>: 生成中间推理 token 消耗大量计算资源和上下文窗口容量. 对于需要数百步推理的复杂任务,显式 CoT 的 token 开销可能超过实际答案的十倍. </li>
<li><strong>模态壁垒</strong>: 显式 CoT 天然绑定文本模态,难以直接扩展到图像、视频、音频等非语言模态的推理任务.</li>
</ol>
<h3 id="1-2-ys-cot-dhxsx">1.2 隐式 CoT 的核心思想</h3>
<p>隐式思维链(Latent CoT)将推理过程从<strong>显式语言空间</strong>迁移到<strong>隐式潜在空间</strong>,实现推理与语言生成的解耦: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{隐式推理: } \\mathbf{z}_1 \\rightarrow \\mathbf{z}_2 \\rightarrow \\dots \\rightarrow \\mathbf{z}_T \\quad \\text{(潜在空间中的状态转移)} \\tag{1} \\tag{1}</span>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{语言生成: } \\mathbf{z}_T \\rightarrow \\text{token}_1, \\text{token}_2, \\dots \\quad \\text{(最终状态到输出的解码)} \\tag{2} \\tag{2}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">z</mi><mi>t</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mi>d</mi></msup></mrow><annotation encoding="application/x-tex">\\mathbf{z}_t \\in \\mathbb{R}^d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span> 为潜在空间中的推理状态,不再受限于离散的词汇表,可以承载更丰富的认知表征. </p>
<hr>
<h2 id="2-jspx-chxdzx">2. 技术谱系: 从横向到纵向</h2>
<h3 id="2-1-zbjhxcl-token-level-horizontal">2.1 逐标记横向策略(Token-level Horizontal)</h3>
<p>早期隐式 CoT 方法在 token 生成的时间轴上插入隐式推理步骤: </p>
<ul>
<li><strong>Quiet-STaR</strong>: 在标准自回归生成的每个 token 之前,先执行一次&quot;内部思考&quot;(由模型自身生成的一段隐式文本),然后用思考结果辅助下一个 token 的预测. 思考过程对用户不可见,但参与梯度更新. </li>
<li><strong>Coconut(Chain of Continuous Thought)</strong> : 完全抛弃离散 token,让推理状态以连续向量形式在层间传递. 每一层的隐藏状态 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">h_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 不仅携带当前 token 的表征,还累积了此前所有推理步骤的信息.</li>
</ul>
<p><strong>优势</strong>: 与现有 Transformer 架构兼容,无需修改模型结构. 
<strong>局限</strong>: 隐式状态与显式 token 交错,推理深度受限于序列长度. </p>
<h3 id="2-2-zczxcl-layer-level-vertical">2.2 逐层纵向策略(Layer-level Vertical)</h3>
<p>纵向策略将推理过程从&quot;时间轴&quot;转移到&quot;深度轴&quot;,利用 Transformer 的多层结构实现隐式推理: </p>
<ul>
<li><strong>隐式中间层</strong>: 在标准 Transformer 层之间插入专门的&quot;推理层&quot;,这些层不生成 token,只在潜在空间中执行推理变换. 输入层接收原始问题,经过若干推理层后,最终输出层将累积的推理状态解码为答案. </li>
<li><strong>深度思考网络(Deep Thinking Networks)</strong> : 让模型在回答前&quot;思考&quot;固定层数——前 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>think</mtext></msub></mrow><annotation encoding="application/x-tex">L_{\\text{think}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">think</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 层专门用于隐式推理,后 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>out</mtext></msub></mrow><annotation encoding="application/x-tex">L_{\\text{out}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 层用于生成输出. 推理层和输出层可以共享参数,也可以独立训练.</li>
</ul>
<p><strong>优势</strong>: 推理深度与序列长度解耦,可以用更深的网络实现更复杂的推理链. 
<strong>局限</strong>: 需要修改模型架构,训练成本更高. </p>
<h3 id="2-3-hhcl">2.3 混合策略</h3>
<p>最新方法尝试结合横向和纵向优势: </p>
<ul>
<li><strong>分层隐式推理</strong>: 浅层使用横向策略(快速生成初步推理),深层使用纵向策略(精细化推理状态)</li>
<li><strong>自适应深度</strong>: 模型根据问题复杂度动态决定推理深度——简单问题用少量隐式步骤,复杂问题增加推理层数</li>
</ul>
<hr>
<h2 id="3-yycjyszjg">3. 应用场景与实证结果</h2>
<h3 id="3-1-sxyljtl">3.1 数学与逻辑推理</h3>
<p>隐式 CoT 在数学推理任务上展现出独特优势. 显式 CoT 要求模型将每一步数学运算转化为自然语言(&quot;首先,我们计算 3+5=8,然后...&quot;),这不仅冗长,还可能引入语言描述错误. 隐式 CoT 允许模型在潜在空间中直接执行符号运算,仅将最终结果解码为文本. </p>
<p>实验表明,在 GSM8K 和 MATH-500 等基准上,隐式 CoT 方法在保持相当准确率的同时,将推理 token 数量减少了 30-50%. </p>
<h3 id="3-2-dmttl">3.2 多模态推理</h3>
<p>隐式 CoT 为跨模态推理提供了天然桥梁. 在视觉问答(VQA)任务中: </p>
<ul>
<li>显式 CoT: 模型必须用语言描述图像内容(&quot;图中有一只红色的猫坐在蓝色的椅子上...&quot;),然后再基于描述推理答案</li>
<li>隐式 CoT: 图像Encoder 和文本Encoder 将各自模态的信息投影到共享潜在空间,推理过程直接在多模态潜在空间中进行,无需经过语言中介</li>
</ul>
<h3 id="3-3-ccghy-agent-rw">3.3 长程规划与 Agent 任务</h3>
<p>在需要多步规划的 Agent 任务中,隐式 CoT 可以维护一个连续的&quot;计划状态向量&quot;,在潜在空间中追踪当前进度、剩余目标、可用资源. 这比显式地写出每一步计划更紧凑,且不易因语言生成错误而导致计划中断. </p>
<hr>
<h2 id="4-tzywlfx">4. 挑战与未来方向</h2>
<h3 id="4-1-kjsxwj">4.1 可解释性危机</h3>
<p>隐式 CoT 的最大代价是<strong>可解释性的丧失</strong>. 显式 CoT 的每一步推理都可以被人类阅读和检查,而隐式 CoT 的推理过程是一串高维向量,对人类完全不透明. 这在对安全性和可审计性要求高的场景(如医疗诊断、法律分析)中可能是致命缺陷. </p>
<p><strong>潜在解决方案</strong>: </p>
<ul>
<li><strong>可解码的隐式状态</strong>: 训练一个辅助Decoder  ,将隐式推理状态映射为人类可理解的文本摘要</li>
<li><strong>概念级可解释性</strong>: 通过对比学习,让隐式状态中的某些维度对应于可解释的概念(如&quot;当前子目标&quot;、&quot;置信度&quot;、&quot;未解决问题&quot;)</li>
</ul>
<h3 id="4-2-xlwdx">4.2 训练稳定性</h3>
<p>隐式推理状态的梯度传播比显式 token 更不稳定. 在潜在空间中,微小的扰动可能导致推理轨迹的剧烈偏离(蝴蝶效应). 这使得隐式 CoT 的训练对超参数极为敏感. </p>
<h3 id="4-3-yxs-cot-drh">4.3 与显式 CoT 的融合</h3>
<p>未来的最佳方案可能不是&quot;非隐即显&quot;,而是<strong>分层混合</strong>: </p>
<ul>
<li>底层推理(感知、模式匹配)在隐式空间中进行</li>
<li>高层推理(策略选择、目标分解)以显式 CoT 呈现</li>
<li>关键决策点由显式推理标注,中间过程由隐式推理加速</li>
</ul>
<hr>
<h2 id="5-ckwx">5. 参考文献</h2>
<ol>
<li><p><strong>Reasoning Beyond Language: A Comprehensive Survey on Latent Chain-of-Thought Reasoning</strong></p>
<ul>
<li>香港理工大学 &amp; 宁波数字孪生研究院, arXiv:2505.16782, 2025.</li>
</ul>
</li>
<li><p><strong>Quiet-STaR: Language Models Can Teach Themselves to Think Before Speaking</strong></p>
<ul>
<li>Harvard &amp; Stanford, 2024.</li>
</ul>
</li>
<li><p><strong>Chain of Continuous Thought: Progressive Generation of CoT via Latent Space Dynamics</strong></p>
<ul>
<li><ol start="2025">
<li></li>
</ol>
</li>
</ul>
</li>
<li><p><strong>Coconut: Continuous Chain of Thought via Latent Space Dynamics</strong></p>
<ul>
<li><ol start="2025">
<li></li>
</ol>
</li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/1998807709114454856">大模型综述: 超越语言的推理——隐式思维链推理</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-cxs-cot-dys-cot","text":"1. 从显式 CoT 到隐式 CoT"},{"level":3,"id":"1-1-xs-cot-dbj","text":"1.1 显式 CoT 的边界"},{"level":3,"id":"1-2-ys-cot-dhxsx","text":"1.2 隐式 CoT 的核心思想"},{"level":2,"id":"2-jspx-chxdzx","text":"2. 技术谱系: 从横向到纵向"},{"level":3,"id":"2-1-zbjhxcl-token-level-horizontal","text":"2.1 逐标记横向策略(Token-level Horizontal)"},{"level":3,"id":"2-2-zczxcl-layer-level-vertical","text":"2.2 逐层纵向策略(Layer-level Vertical)"},{"level":3,"id":"2-3-hhcl","text":"2.3 混合策略"},{"level":2,"id":"3-yycjyszjg","text":"3. 应用场景与实证结果"},{"level":3,"id":"3-1-sxyljtl","text":"3.1 数学与逻辑推理"},{"level":3,"id":"3-2-dmttl","text":"3.2 多模态推理"},{"level":3,"id":"3-3-ccghy-agent-rw","text":"3.3 长程规划与 Agent 任务"},{"level":2,"id":"4-tzywlfx","text":"4. 挑战与未来方向"},{"level":3,"id":"4-1-kjsxwj","text":"4.1 可解释性危机"},{"level":3,"id":"4-2-xlwdx","text":"4.2 训练稳定性"},{"level":3,"id":"4-3-yxs-cot-drh","text":"4.3 与显式 CoT 的融合"},{"level":2,"id":"5-ckwx","text":"5. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/implicit-cot" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/implicit-cot" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">隐式思维链推理综述: 超越语言形式的认知表征</h1>
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
