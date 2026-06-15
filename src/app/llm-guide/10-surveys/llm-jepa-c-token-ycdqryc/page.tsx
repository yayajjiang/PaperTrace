"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>LLM-JEPA: 从 Token 预测到嵌入预测的实现</h1>
<blockquote>
<p>本文介绍 LLM-JEPA(Large Language Models Meet Joint Embedding Predictive Architectures)的核心思想与实现: 不预测 token,而是预测被遮蔽片段的嵌入表示. </p>
</blockquote>
<hr>
<h2 id="1-hxsx">1. 核心思想</h2>
<h3 id="1-1-cscsdycs">1.1 从生成式到预测式</h3>
<p>传统语言模型(如 GPT)采用<strong>生成式目标</strong>: </p>
<ul>
<li>预测下一个 token</li>
<li>自回归生成</li>
</ul>
<p>JEPA 采用<strong>预测式目标</strong>: </p>
<ul>
<li>预测被遮蔽片段的<strong>嵌入表示</strong></li>
<li>非生成式、非重建式</li>
</ul>
<h3 id="1-2-hxjz">1.2 核心机制</h3>
<p>对同一文本创建两个视图: </p>
<table>
<thead>
<tr>
<th align="left">视图</th>
<th align="left">处理</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Context 视图</strong></td>
<td align="left">将某些片段替换为 [MASK]</td>
<td align="left">输入Encoder</td>
</tr>
<tr>
<td align="left"><strong>Target 视图</strong></td>
<td align="left">保留原始文本</td>
<td align="left">提供监督信号</td>
</tr>
</tbody></table>
<p>**Context Encoder **: 可训练,负责预测 target Encoder 在遮蔽位置的表示. </p>
<p>**Target Encoder **: Context Encoder 的 EMA 副本,不参与梯度计算. </p>
<hr>
<h2 id="2-sshs">2. 损失函数</h2>
<p>使用<strong>表示对齐损失</strong>: 预测嵌入和目标嵌入之间的余弦距离. </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="script">L</mi><mo>=</mo><mn>1</mn><mo>−</mo><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><mover accent="true"><mi>z</mi><mo>^</mo></mover><mo separator="true">,</mo><mi>z</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L} = 1 - \\cos(\\hat{z}, z)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">cos</span><span class="mopen">(</span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.044em;">z</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">^</span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="mclose">)</span></span></span></span></span><p>其中: </p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>z</mi><mo>^</mo></mover></mrow><annotation encoding="application/x-tex">\\hat{z}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.044em;">z</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">^</span></span></span></span></span></span></span></span></span></span>: Context Encoder 预测的嵌入</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>z</mi></mrow><annotation encoding="application/x-tex">z</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.044em;">z</span></span></span></span>: Target Encoder 生成的目标嵌入</li>
</ul>
<hr>
<h2 id="3-yxgffddb">3. 与相关方法的对比</h2>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">预测目标</th>
<th align="left">训练方式</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>GPT</strong></td>
<td align="left">下一个 token</td>
<td align="left">自回归生成</td>
</tr>
<tr>
<td align="left"><strong>BERT</strong></td>
<td align="left">被遮蔽 token</td>
<td align="left">掩码语言建模</td>
</tr>
<tr>
<td align="left"><strong>JEPA</strong></td>
<td align="left">被遮蔽片段的嵌入</td>
<td align="left">表示对齐</td>
</tr>
</tbody></table>
<h3 id="3-1-ys">3.1 优势</h3>
<ol>
<li><strong>更高层级的表示学习</strong>: 不局限于 token 级别</li>
<li><strong>连续空间预测</strong>: 在嵌入空间中进行,信息更丰富</li>
<li><strong>非生成式</strong>: 不需要Decoder  ,训练更高效</li>
</ol>
<hr>
<h2 id="4-sxyd">4. 实现要点</h2>
<h3 id="4-1-sjgz">4.1 数据构造</h3>
<pre><code class="language-python"># 对同一文本创建两个视图
context_view = mask_segments(text, mask_ratio=0.3)
target_view = text  # 保持原始
</code></pre>
<h3 id="4-2-encoder-sj">4.2 Encoder 设计</h3>
<ul>
<li>**Context Encoder **: 标准 Transformer,可训练</li>
<li>**Target Encoder **: EMA 更新,不参与梯度</li>
</ul>
<pre><code class="language-python"># Target Encoder  EMA 更新
for param_t, param_c in zip(target_encoder.parameters(), 
                             context_encoder.parameters()):
    param_t.data = momentum * param_t.data + (1 - momentum) * param_c.data
</code></pre>
<h3 id="4-3-zbcl">4.3 遮蔽策略</h3>
<ul>
<li>随机遮蔽连续片段(span masking)</li>
<li>遮蔽比例通常 15%-30%</li>
<li>遮蔽位置用于计算损失</li>
</ul>
<hr>
<h2 id="5-xlxj">5. 训练细节</h2>
<h3 id="5-1-ccs">5.1 超参数</h3>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="left">推荐值</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Mask Ratio</td>
<td align="left">0.3</td>
</tr>
<tr>
<td align="left">EMA Momentum</td>
<td align="left">0.996</td>
</tr>
<tr>
<td align="left">Batch Size</td>
<td align="left">8-32</td>
</tr>
<tr>
<td align="left">Learning Rate</td>
<td align="left">1e-4</td>
</tr>
</tbody></table>
<h3 id="5-2-yhsl">5.2 运行示例</h3>
<pre><code class="language-bash"># 小型冒烟测试
python llm_jepa_train.py --smoke_test

# 使用 HF 模型骨干训练
python llm_jepa_train.py --model_name distilbert-base-uncased --steps 200
</code></pre>
<hr>
<h2 id="6-yycj">6. 应用场景</h2>
<ol>
<li><strong>表示学习</strong>: 学习高质量的文本嵌入</li>
<li><strong>下游任务微调</strong>: 在嵌入预测预训练基础上微调</li>
<li><strong>多模态扩展</strong>: 扩展到图像-文本联合嵌入预测</li>
</ol>
<hr>
<h2 id="7-zj">7. 总结</h2>
<p>LLM-JEPA 代表了一种新的自监督学习范式: </p>
<ul>
<li><strong>不预测离散 token</strong>,而是预测连续嵌入</li>
<li><strong>不重建输入</strong>,而是对齐表示</li>
<li><strong>非生成式</strong>,但学习效果优异</li>
</ul>
<p>这一方向为语言模型的预训练提供了新的思路,特别是在表示学习和多模态场景中有广阔应用前景. </p>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/2001043891273634657">用 PyTorch 实现 LLM-JEPA: 不预测 token,预测嵌入</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxsx","text":"1. 核心思想"},{"level":3,"id":"1-1-cscsdycs","text":"1.1 从生成式到预测式"},{"level":3,"id":"1-2-hxjz","text":"1.2 核心机制"},{"level":2,"id":"2-sshs","text":"2. 损失函数"},{"level":2,"id":"3-yxgffddb","text":"3. 与相关方法的对比"},{"level":3,"id":"3-1-ys","text":"3.1 优势"},{"level":2,"id":"4-sxyd","text":"4. 实现要点"},{"level":3,"id":"4-1-sjgz","text":"4.1 数据构造"},{"level":3,"id":"4-2-encoder-sj","text":"4.2 Encoder 设计"},{"level":3,"id":"4-3-zbcl","text":"4.3 遮蔽策略"},{"level":2,"id":"5-xlxj","text":"5. 训练细节"},{"level":3,"id":"5-1-ccs","text":"5.1 超参数"},{"level":3,"id":"5-2-yhsl","text":"5.2 运行示例"},{"level":2,"id":"6-yycj","text":"6. 应用场景"},{"level":2,"id":"7-zj","text":"7. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/llm-jepa-c-token-ycdqryc" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/llm-jepa-c-token-ycdqryc" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">LLM-JEPA: 从 Token 预测到嵌入预测的实现</h1>
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
