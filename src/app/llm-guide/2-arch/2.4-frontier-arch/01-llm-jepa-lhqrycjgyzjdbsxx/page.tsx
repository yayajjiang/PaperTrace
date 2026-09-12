"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>LLM-JEPA：联合嵌入预测架构与自监督表示学习</h1>
<blockquote>
<p>来源: 知乎专栏 (<a href="https://zhuanlan.zhihu.com/p/32098458322">https://zhuanlan.zhihu.com/p/32098458322</a>)
标签: #JEPA #自监督学习 #表示学习 #EMA #SpanMasking</p>
</blockquote>
<h2 id="1-yjml-c-token-ycdbsyc">1. 演进脉络：从 Token 预测到表示预测</h2>
<h3 id="1-1-zjdxxdsdfs">1.1 自监督学习的三代范式</h3>
<table>
<thead>
<tr>
<th>代际</th>
<th>代表方法</th>
<th>预测目标</th>
<th>核心思想</th>
<th>局限</th>
</tr>
</thead>
<tbody><tr>
<td>第一代</td>
<td>BERT (MLM)</td>
<td>被遮蔽的 <strong>token</strong></td>
<td>从上下文推断缺失词</td>
<td>只在浅层学习, 高层表示质量有限</td>
</tr>
<tr>
<td>第二代</td>
<td>MAE (CV)</td>
<td>被遮蔽的 <strong>像素块</strong></td>
<td>从可见区域重建图像</td>
<td>像素级重建消耗计算, 且可能过拟合低频信息</td>
</tr>
<tr>
<td>第三代</td>
<td><strong>JEPA</strong></td>
<td>被遮蔽的 <strong>嵌入表示</strong></td>
<td>预测语义层面的表示, 而非具体 token</td>
<td>避免像素/token级重建的冗余计算</td>
</tr>
</tbody></table>
<p>JEPA(Joint Embedding Predictive Architecture)由 Yann LeCun 提出, 其核心洞察是：</p>
<blockquote>
<p><strong>&quot;模型的真正目标不是预测下一个词, 而是学习世界的内部表示. &quot;</strong></p>
</blockquote>
<p>传统语言模型(GPT、BERT)通过预测 token 学习, 相当于强迫模型记忆词汇的统计规律. JEPA 则让模型在<strong>表示空间</strong>中预测——学习&quot;这个被遮蔽的片段在语义上是什么意思&quot;, 而非&quot;这个被遮蔽的位置具体是哪个词&quot;. </p>
<h3 id="1-2-llm-jepa-y-bert-dbzqb">1.2 LLM-JEPA 与 BERT 的本质区别</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>BERT (MLM)</th>
<th>LLM-JEPA</th>
</tr>
</thead>
<tbody><tr>
<td><strong>输入</strong></td>
<td>单视图(部分 token 被 [MASK] 替换)</td>
<td>双视图：Context(遮蔽)+ Target(完整)</td>
</tr>
<tr>
<td>**Encoder **</td>
<td>单个可训练Encoder</td>
<td>Context Encoder (可训练)+ Target Encoder (EMA 冻结)</td>
</tr>
<tr>
<td><strong>预测目标</strong></td>
<td>Token ID(分类问题)</td>
<td>嵌入向量(回归问题)</td>
</tr>
<tr>
<td><strong>损失函数</strong></td>
<td>Cross-Entropy</td>
<td>余弦距离</td>
</tr>
<tr>
<td><strong>监督信号</strong></td>
<td>离散词汇表(有限信息)</td>
<td>连续表示空间(丰富语义信息)</td>
</tr>
<tr>
<td><strong>计算效率</strong></td>
<td>需在词汇表上计算 softmax</td>
<td>仅计算向量距离</td>
</tr>
</tbody></table>
<p><strong>关键优势</strong>：JEPA 避免了在大型词汇表上做 softmax 分类的计算开销, 同时学习到的表示更聚焦于语义而非词汇形式. </p>
<hr>
<h2 id="2-llm-jepa-djgsj">2. LLM-JEPA 的架构设计</h2>
<h3 id="2-1-s-encoder-ycqdsyjg">2.1 双Encoder  + 预测器的三元结构</h3>
<pre><code>Input Text
    ├─→ Context View(遮蔽部分 span)
    │   └─→ Context Encoder(可训练 Transformer)
    │       └─→ z_ctx = Enc_ctx(masked_input_ids)
    │           └─→ Predictor(可训练 MLP)
    │               └─→ pred = MLP(z_ctx)
    │
    └─→ Target View(完整文本)
        └─→ Target Encoder(EMA 副本, 冻结梯度)
            └─→ z_tgt = Enc_tgt(input_ids)
                └─→ [只在遮蔽位置比较 pred vs z_tgt]
</code></pre>
<p><strong>三个核心组件</strong>：</p>
<ol>
<li><strong>Context Encoder</strong> (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mtext>Enc</mtext><mtext>ctx</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Enc}_{\\text{ctx}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Enc</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ctx</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)：接收遮蔽后的文本, 生成上下文表示. <strong>可训练</strong>, 是模型学习的核心. </li>
<li><strong>Target Encoder</strong> (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mtext>Enc</mtext><mtext>tgt</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Enc}_{\\text{tgt}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Enc</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tgt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>)：接收完整文本, 生成目标表示. <strong>不参与梯度回传</strong>, 通过 EMA 缓慢更新. </li>
<li><strong>Predictor</strong> (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>MLP</mtext></mrow><annotation encoding="application/x-tex">\\text{MLP}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">MLP</span></span></span></span></span>)：将 Context 表示映射到 Target 表示空间, 缩小二者的语义差距.</li>
</ol>
<h3 id="2-2-wsm-target-encoder-xydj-ema">2.2 为什么 Target Encoder 需要冻结 + EMA？</h3>
<p><strong>问题</strong>：如果 Target Encoder 也是可训练的, 模型可以通过&quot;共谋&quot;来最小化损失——Context 和 Target Encoder 同时坍塌到同一个常数向量, 损失为 0, 但什么都没学到(表示坍塌). </p>
<p><strong>解决方案</strong>：</p>
<ul>
<li><strong>冻结梯度</strong>：Target Encoder 不参与反向传播, 其输出作为&quot; ground truth &quot;</li>
<li><strong>EMA 更新</strong>：Target Encoder 缓慢跟随 Context Encoder, 保持稳定性</li>
</ul>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>θ</mi><mtext>tgt</mtext><mrow><mo stretchy="false">(</mo><mi>t</mi><mo>+</mo><mn>1</mn><mo stretchy="false">)</mo></mrow></msubsup><mo>=</mo><mi>m</mi><mo>⋅</mo><msubsup><mi>θ</mi><mtext>tgt</mtext><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>+</mo><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>m</mi><mo stretchy="false">)</mo><mo>⋅</mo><msubsup><mi>θ</mi><mtext>ctx</mtext><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup></mrow><annotation encoding="application/x-tex">\\theta_{\\text{tgt}}^{(t+1)} = m \\cdot \\theta_{\\text{tgt}}^{(t)} + (1-m) \\cdot \\theta_{\\text{ctx}}^{(t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.4267em;vertical-align:-0.3819em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tgt</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mbin mtight">+</span><span class="mord mtight">1</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3819em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.4267em;vertical-align:-0.3819em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tgt</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3819em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">m</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.2906em;vertical-align:-0.2458em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ctx</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2458em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mn>0.99</mn></mrow><annotation encoding="application/x-tex">m = 0.99</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.99</span></span></span></span> 是动量系数. 这意味着 Target Encoder 的变化速度是 Context Encoder 的 1%. </p>
<p><strong>类比</strong>：Target Encoder 就像一个&quot;老师&quot;, Context Encoder 是&quot;学生&quot;. 学生每学一点新东西, 老师只更新 1%, 保持教学标准的稳定性. 如果老师更新太快(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 太小), 标准会跟着学生一起漂移; 如果老师完全不更新(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">m=1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>), 标准会过时. </p>
<h3 id="2-3-span-masking-zbcldgj">2.3 Span Masking：遮蔽策略的关键</h3>
<p>与 BERT 的随机 token 遮蔽不同, JEPA 采用 <strong>Span Masking</strong>——遮蔽连续的 token 片段：</p>
<pre><code class="language-python">def sample_span_mask(seq_len, mask_ratio=0.3, mean_span_len=3):
    &quot;&quot;&quot;采样连续 span 遮蔽位置
    
    Args:
        seq_len: 序列长度
        mask_ratio: 遮蔽比例(如 0.3 表示遮蔽 30% token)
        mean_span_len: 平均 span 长度
    
    Returns:
        mask: bool 张量, True 表示该位置被遮蔽
    &quot;&quot;&quot;
    mask = torch.zeros(seq_len, dtype=torch.bool)
    target_to_mask = max(1, int(round(seq_len * mask_ratio)))
    masked = 0
    
    while masked &lt; target_to_mask:
        # 从指数分布采样 span 长度：产出大量短 span + 少量长 span
        span_len = max(1, int(random.expovariate(1.0 / mean_span_len)))
        start = random.randint(0, seq_len - 1)
        
        # 过滤特殊 token 位置(CLS、SEP)
        valid_positions = [i for i in range(start, min(start + span_len, seq_len))
                          if i not in special_positions]
        
        for pos in valid_positions:
            if not mask[pos]:
                mask[pos] = True
                masked += 1
                if masked &gt;= target_to_mask:
                    break
    
    return mask
</code></pre>
<p><strong>为什么 Span Masking 更好？</strong></p>
<ul>
<li><strong>语义完整性</strong>：连续遮蔽迫使模型从更大范围的上下文推断语义, 而非记忆局部词汇共现</li>
<li><strong>难度适中</strong>：单个 token 遮蔽太简单, 整句遮蔽太难, span 长度提供了可调节的难度梯度</li>
<li><strong>指数分布</strong>：<code>expovariate(1.0 / mean_span_len)</code> 产生大量短 span 和少量长 span, 符合自然语言中语义单元的分布</li>
</ul>
<hr>
<h2 id="3-sshs-bskjzdyxjl">3. 损失函数：表示空间中的余弦距离</h2>
<h3 id="3-1-ssdy">3.1 损失定义</h3>
<p>JEPA 的损失在<strong>表示空间</strong>中计算, 而非词汇表空间：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>JEPA</mtext></msub><mo>=</mo><mn>1</mn><mo>−</mo><mfrac><mrow><mtext>pred</mtext><mo>⋅</mo><msub><mi>z</mi><mtext>tgt</mtext></msub></mrow><mrow><mi mathvariant="normal">∥</mi><mtext>pred</mtext><mi mathvariant="normal">∥</mi><mo>⋅</mo><mi mathvariant="normal">∥</mi><msub><mi>z</mi><mtext>tgt</mtext></msub><mi mathvariant="normal">∥</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{JEPA}} = 1 - \\frac{\\text{pred} \\cdot z_{\\text{tgt}}}{\\|\\text{pred}\\| \\cdot \\|z_{\\text{tgt}}\\|}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">JEPA</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.3435em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∥</span><span class="mord text"><span class="mord">pred</span></span><span class="mord">∥</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tgt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∥</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">pred</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tgt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>即 <strong>1 - 余弦相似度</strong>. 当预测表示与目标表示方向完全一致时, 损失为 0. </p>
<p><strong>归一化的必要性</strong>：</p>
<pre><code class="language-python">masked_pred = F.normalize(masked_pred, dim=-1)  # [N, D]
masked_tgt = F.normalize(masked_tgt, dim=-1)    # [N, D]

# 余弦距离 = 1 - 余弦相似度
loss = 1.0 - (masked_pred * masked_tgt).sum(dim=-1)
</code></pre>
<p>归一化确保损失只关注<strong>向量方向</strong>(语义方向), 忽略向量大小. 这避免了模型通过简单缩放嵌入维度来&quot;作弊&quot;最小化损失. </p>
<h3 id="3-2-wsmby-mse">3.2 为什么不用 MSE？</h3>
<p>MSE(均方误差)也可以衡量向量差异, 但余弦距离更适合表示学习：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>MSE</th>
<th>余弦距离</th>
</tr>
</thead>
<tbody><tr>
<td>关注</td>
<td>绝对数值差异</td>
<td>方向一致性</td>
</tr>
<tr>
<td>对缩放的敏感度</td>
<td>高(大向量惩罚重)</td>
<td>无(归一化后)</td>
</tr>
<tr>
<td>语义解释</td>
<td>&quot;这两个表示数值差多少&quot;</td>
<td>&quot;这两个表示指向同一语义方向吗&quot;</td>
</tr>
<tr>
<td>在高维空间</td>
<td>容易饱和</td>
<td>保持区分度</td>
</tr>
</tbody></table>
<p>在语义表示学习中, <strong>方向比绝对值更重要</strong>——两个嵌入即使长度不同, 只要方向相同, 就代表相同的语义. </p>
<hr>
<h2 id="4-wzxllc">4. 完整训练流程</h2>
<h3 id="4-1-sjl">4.1 数据流</h3>
<pre><code class="language-python">def collate_jepa(batch_texts, tokenizer, max_length, mask_ratio, mean_span_len):
    # 1. Tokenize
    toks = tokenizer(batch_texts, padding=True, truncation=True, 
                     max_length=max_length, return_tensors=&quot;pt&quot;)
    input_ids = toks[&quot;input_ids&quot;]          # [B, L]
    attention_mask = toks[&quot;attention_mask&quot;]  # [B, L]
    
    # 2. 对每个样本生成遮蔽版本
    masked_input_ids_list = []
    pred_mask_list = []
    
    for b in range(input_ids.size(0)):
        mi, pm = apply_mask_to_input_ids(
            input_ids[b], attention_mask[b], tokenizer,
            mask_ratio=mask_ratio, mean_span_len=mean_span_len
        )
        masked_input_ids_list.append(mi)
        pred_mask_list.append(pm)
    
    return Batch(
        input_ids=input_ids,
        attention_mask=attention_mask,
        masked_input_ids=torch.stack(masked_input_ids_list),
        pred_mask=torch.stack(pred_mask_list),
    )
</code></pre>
<h3 id="4-2-qxcb">4.2 前向传播</h3>
<pre><code class="language-python">class LLMJEPA(nn.Module):
    def __init__(self, context_encoder, target_encoder, dim, ema_m=0.99):
        super().__init__()
        self.context_encoder = context_encoder  # 可训练
        self.target_encoder = target_encoder    # 冻结梯度
        self.predictor = PredictorMLP(dim)      # 可训练
        self.ema_m = ema_m
        
        # Target encoder 初始化为 Context encoder 的深拷贝
        self.target_encoder.load_state_dict(context_encoder.state_dict())
        for p in self.target_encoder.parameters():
            p.requires_grad = False
    
    def ema_update(self):
        &quot;&quot;&quot;每次优化器 step 后调用&quot;&quot;&quot;
        with torch.no_grad():
            for p_tgt, p_ctx in zip(self.target_encoder.parameters(),
                                    self.context_encoder.parameters()):
                p_tgt.data.mul_(self.ema_m).add_(p_ctx.data, alpha=1 - self.ema_m)
    
    def forward(self, masked_input_ids, input_ids, attention_mask, pred_mask):
        # Context 路径：可训练
        out_ctx = self.context_encoder(
            input_ids=masked_input_ids, 
            attention_mask=attention_mask
        )
        z_ctx = out_ctx.last_hidden_state  # [B, L, D]
        
        # Target 路径：冻结梯度
        with torch.no_grad():
            out_tgt = self.target_encoder(
                input_ids=input_ids, 
                attention_mask=attention_mask
            )
            z_tgt = out_tgt.last_hidden_state  # [B, L, D]
        
        # Predictor：将 Context 表示映射到 Target 空间
        pred = self.predictor(z_ctx)  # [B, L, D]
        
        # 只在遮蔽位置计算损失
        masked_pred = pred[pred_mask]    # [N, D]
        masked_tgt = z_tgt[pred_mask]    # [N, D]
        
        # 归一化 + 余弦距离
        masked_pred = F.normalize(masked_pred, dim=-1)
        masked_tgt = F.normalize(masked_tgt, dim=-1)
        
        loss = 1.0 - (masked_pred * masked_tgt).sum(dim=-1)
        return loss.mean()
</code></pre>
<h3 id="4-3-xlxh">4.3 训练循环</h3>
<pre><code class="language-python"># 训练主循环
while step &lt; args.steps:
    batch = next(data_iter)
    
    # 前向传播
    loss = model(
        masked_input_ids=batch.masked_input_ids.to(device),
        input_ids=batch.input_ids.to(device),
        attention_mask=batch.attention_mask.to(device),
        pred_mask=batch.pred_mask.to(device),
    )
    
    # 反向传播
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()
    
    # EMA 更新(关键！必须在 optimizer.step() 之后)
    model.ema_update()
    
    step += 1
</code></pre>
<p><strong>EMA 更新时机</strong>：必须在 <code>optimizer.step()</code> 之后, 因为 EMA 需要基于更新后的 Context Encoder 参数来更新 Target Encoder. </p>
<hr>
<h2 id="5-jepa-ydbxxdqb">5. JEPA 与对比学习的区别</h2>
<h3 id="5-1-zjdxxdldlx">5.1 自监督学习的两大路线</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>对比学习(SimCLR, MoCo)</th>
<th>JEPA</th>
</tr>
</thead>
<tbody><tr>
<td><strong>核心思想</strong></td>
<td>&quot;正样本拉近, 负样本推远&quot;</td>
<td>&quot;从部分信息预测完整表示&quot;</td>
</tr>
<tr>
<td><strong>需要负样本</strong></td>
<td><strong>是</strong>(需要大量负样本)</td>
<td><strong>否</strong>(无需负样本)</td>
</tr>
<tr>
<td><strong>数据增强</strong></td>
<td>强依赖(裁剪、颜色抖动等)</td>
<td>轻依赖(仅 span masking)</td>
</tr>
<tr>
<td><strong>表示坍塌风险</strong></td>
<td>有(所有样本坍塌到同一点)</td>
<td>有(需 EMA 防止)</td>
</tr>
<tr>
<td><strong>损失函数</strong></td>
<td>InfoNCE(基于 softmax)</td>
<td>余弦距离(直接回归)</td>
</tr>
</tbody></table>
<h3 id="5-2-wsm-jepa-bxyfyb">5.2 为什么 JEPA 不需要负样本？</h3>
<p>对比学习需要负样本的原因是：如果没有&quot;推远&quot;的信号, 模型会把所有样本映射到同一个点(表示坍塌). </p>
<p>JEPA 通过以下机制避免了这一问题：</p>
<ol>
<li><strong>预测任务本身提供约束</strong>：模型必须从部分信息(遮蔽文本)预测完整表示, 这天然要求模型学习有意义的语义结构</li>
<li><strong>EMA Target Encoder 提供稳定目标</strong>：Target Encoder 的缓慢更新确保了预测目标不会随训练漂移, 防止&quot;共谋坍塌&quot;</li>
<li><strong>Predictor 的瓶颈设计</strong>：MLP 预测器作为一个&quot;适配器&quot;, 限制了表示空间的自由度</li>
</ol>
<hr>
<h2 id="6-bjtjysxms">6. 边界条件与失效模式</h2>
<table>
<thead>
<tr>
<th>场景</th>
<th>症状</th>
<th>根因</th>
<th>缓解</th>
</tr>
</thead>
<tbody><tr>
<td>EMA 动量过大 (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>→</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">m \\to 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>)</td>
<td>训练停滞, loss 不再下降</td>
<td>Target Encoder 更新过慢, 标准长期过时</td>
<td>降低 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 至 0.95-0.99</td>
</tr>
<tr>
<td>EMA 动量过小 (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>→</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">m \\to 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span>)</td>
<td>表示坍塌, loss 突降至 0</td>
<td>Target Encoder 紧跟 Context, 共谋坍塌</td>
<td>提高 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 至 0.999+</td>
</tr>
<tr>
<td>Span 过长</td>
<td>遮蔽信息过多, 预测困难</td>
<td>mask_ratio 或 mean_span_len 过大</td>
<td>降低 mask_ratio 至 0.15-0.3</td>
</tr>
<tr>
<td>Span 过短</td>
<td>任务太简单, 学不到深层表示</td>
<td>接近 token-level masking</td>
<td>提高 mean_span_len 至 5-10</td>
</tr>
<tr>
<td>Predictor 过深</td>
<td>训练不稳定, 梯度爆炸</td>
<td>MLP 层数过多引入非线性复杂度</td>
<td>保持 Predictor 为 2-3 层 MLP</td>
</tr>
<tr>
<td>无 Predictor</td>
<td>Context 和 Target 表示空间不对齐</td>
<td>直接比较Encoder 输出</td>
<td>始终保留 Predictor 作为适配器</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-jsqz">7. 技术前瞻</h2>
<ol>
<li><strong>多模态 JEPA</strong>：将 JEPA 从纯文本扩展到图像-文本-视频统一架构, 学习跨模态的共享表示空间</li>
<li><strong>JEPA + Next Token Prediction 混合目标</strong>：原始 LLM-JEPA 论文已将表示预测与 token 预测结合, 兼顾语义理解和生成能力</li>
<li><strong>世界模型(World Model)</strong>：JEPA 的本质是世界模型的一种实现——学习环境的内部动力学, 支持&quot;想象&quot;和规划</li>
<li><strong>与 MoE 的结合</strong>：JEPA 的表示学习可作为 MoE 路由器的预训练目标, 提升专家分配的语义一致性</li>
</ol>
<hr>
<h2 id="8-ckwx">8. 参考文献</h2>
<ol>
<li>LeCun, Y. (2022). A Path Towards Autonomous Machine Intelligence. Open Review.</li>
<li>Assran, M., et al. (2023). Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture. CVPR. (I-JEPA)</li>
<li>LLM-JEPA: Large Language Models Meet Joint Embedding Predictive Architectures. arXiv:2509.14252.</li>
<li>Devlin, J., et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers. NAACL.</li>
<li>He, K., et al. (2022). Masked Autoencoders Are Scalable Vision Learners. CVPR. (MAE)</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yjml-c-token-ycdbsyc","text":"1. 演进脉络：从 Token 预测到表示预测"},{"level":3,"id":"1-1-zjdxxdsdfs","text":"1.1 自监督学习的三代范式"},{"level":3,"id":"1-2-llm-jepa-y-bert-dbzqb","text":"1.2 LLM-JEPA 与 BERT 的本质区别"},{"level":2,"id":"2-llm-jepa-djgsj","text":"2. LLM-JEPA 的架构设计"},{"level":3,"id":"2-1-s-encoder-ycqdsyjg","text":"2.1 双Encoder + 预测器的三元结构"},{"level":3,"id":"2-2-wsm-target-encoder-xydj-ema","text":"2.2 为什么 Target Encoder 需要冻结 + EMA？"},{"level":3,"id":"2-3-span-masking-zbcldgj","text":"2.3 Span Masking：遮蔽策略的关键"},{"level":2,"id":"3-sshs-bskjzdyxjl","text":"3. 损失函数：表示空间中的余弦距离"},{"level":3,"id":"3-1-ssdy","text":"3.1 损失定义"},{"level":3,"id":"3-2-wsmby-mse","text":"3.2 为什么不用 MSE？"},{"level":2,"id":"4-wzxllc","text":"4. 完整训练流程"},{"level":3,"id":"4-1-sjl","text":"4.1 数据流"},{"level":3,"id":"4-2-qxcb","text":"4.2 前向传播"},{"level":3,"id":"4-3-xlxh","text":"4.3 训练循环"},{"level":2,"id":"5-jepa-ydbxxdqb","text":"5. JEPA 与对比学习的区别"},{"level":3,"id":"5-1-zjdxxdldlx","text":"5.1 自监督学习的两大路线"},{"level":3,"id":"5-2-wsm-jepa-bxyfyb","text":"5.2 为什么 JEPA 不需要负样本？"},{"level":2,"id":"6-bjtjysxms","text":"6. 边界条件与失效模式"},{"level":2,"id":"7-jsqz","text":"7. 技术前瞻"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/01-llm-jepa-lhqrycjgyzjdbsxx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/01-llm-jepa-lhqrycjgyzjdbsxx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">LLM-JEPA：联合嵌入预测架构与自监督表示学习</h1>
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
