"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ERNIE 3.0：多范式统一预训练框架与知识图谱融合</h1>
<h2 id="y-mxglylsdw">一、模型概览与历史定位</h2>
<p>2021 年 7 月，百度发布 ERNIE 3.0，这是全球首个将<strong>自回归生成网络</strong>与<strong>自编码理解网络</strong>统一到一个预训练框架中的大模型，也是首次在千亿级参数规模下系统性地引入大规模知识图谱进行联合训练。ERNIE 3.0 的论文(arXiv:2107.02137)被学术界广泛引用，其提出的&quot;多范式统一&quot;思想影响了后续包括 GPT-4、Gemini 在内的众多大模型设计。</p>
<p>2021 年 12 月，百度联合鹏城实验室推出 <strong>ERNIE 3.0 Titan</strong>，参数规模跃升至 <strong>2600 亿</strong>，成为当时全球最大中文单体模型。该模型在鹏城云脑Ⅱ(搭载数千颗国产 AI 芯片)上完成训练，证明了国产算力基础设施支撑超大规模模型训练的可行性。</p>
<table>
<thead>
<tr>
<th>版本</th>
<th>发布时间</th>
<th>参数量</th>
<th>训练框架</th>
<th>关键特性</th>
</tr>
</thead>
<tbody><tr>
<td>ERNIE 3.0</td>
<td>2021.07</td>
<td>100亿</td>
<td>飞桨 + 384×V100</td>
<td>多范式统一预训练，知识图谱融合</td>
</tr>
<tr>
<td>ERNIE 3.0 Titan</td>
<td>2021.12</td>
<td>2600亿</td>
<td>飞桨 + 鹏城云脑Ⅱ</td>
<td>在线蒸馏，可控/可信学习</td>
</tr>
<tr>
<td>ERNIE 3.0 Zeus</td>
<td>2022.05</td>
<td>千亿级</td>
<td>飞桨</td>
<td>层次化 Prompt 学习，零样本增强</td>
</tr>
</tbody></table>
<p>ERNIE 3.0 的诞生背景值得回顾：2021 年，GPT-3 已经展示了超大规模自回归模型的惊人能力，但其局限也十分明显——<strong>擅长生成，弱于理解</strong>。BERT 及其变体在理解任务上表现优异，但生成能力有限。业界迫切需要一种能够同时驾驭理解与生成任务的统一架构。ERNIE 3.0 正是对这一需求的回应。</p>
<h2 id="e-hxjg-dfstyyxlkj">二、核心架构：多范式统一预训练框架</h2>
<h3 id="2-1-zhg-vs-zbm-fsfldgy">2.1 自回归 vs 自编码：范式分裂的根源</h3>
<p>在 ERNIE 3.0 之前，NLP 领域存在两条泾渭分明的技术路线：</p>
<p><strong>自编码(Auto-Encoding)路线</strong>：以 BERT 为代表，通过掩码语言建模(MLM)学习双向上下文表征。其优势在于理解任务(分类、抽取、推理)，但生成任务需要额外的解码器模块，且预训练与微调之间存在目标函数不匹配问题。</p>
<p><strong>自回归(Auto-Regressive)路线</strong>：以 GPT 系列为代表，通过因果语言建模(CLM)学习从左到右的生成能力。其优势在于流畅的文本生成，但双向信息获取受限，理解任务表现弱于同规模 BERT。</p>
<p>两条路线的本质差异在于<strong>信息流动方向</strong>：自编码允许 token 同时关注左右两侧上下文(双向注意力)，自回归只允许关注左侧上下文(因果掩码)。这种架构层面的分歧导致：一个模型无法同时在 GLUE(理解)和摘要/翻译(生成)基准上取得最优。</p>
<h3 id="2-2-ernie-3-0-dtykjsj">2.2 ERNIE 3.0 的统一框架设计</h3>
<p>ERNIE 3.0 的核心创新是将两种范式融合到一个共享 backbone 中，通过**任务特定的表示模块(Task-Specific Representation Module)**在统一语义空间上分叉：</p>
<pre><code>输入文本
    ↓
[共享通用表示模块] —— 48层，4096 hidden，64 heads(自编码风格双向注意力)
    ↓
    ├─→ [自然语言理解头] —— 12层，768 hidden，12 heads(自编码，MLM目标)
    │       ↓
    │   情感分析 / NER / MRC / 语义相似度...
    │
    └─→ [自然语言生成头] —— Transformer-XL 结构(自回归，CLM目标)
            ↓
        文本摘要 / 问题生成 / 机器翻译 / 对话...
</code></pre>
<p>**共享通用表示模块(Universal Representation Module)**采用标准的 Transformer Encoder 结构，使用双向注意力机制，负责提取语义级的通用表征。这一模块是整个模型的&quot;底座&quot;，参数量占比约 85%(100亿模型中约 85 亿参数)。</p>
<p><strong>任务特定模块</strong>则是轻量级的&quot;适配器&quot;：</p>
<ul>
<li><strong>理解头</strong>：继承 ERNIE 2.0 的多任务学习框架，在 MLM 基础上增加知识掩码(Knowledge Masking)、实体关系预测等任务; </li>
<li><strong>生成头</strong>：基于 Transformer-XL，引入片段级递归机制(Segment-Level Recurrence)，支持超长文本(&gt; 512 tokens)的建模。</li>
</ul>
<h3 id="2-3-tyyxlmbhs">2.3 统一预训练目标函数</h3>
<p>ERNIE 3.0 的预训练损失是三个目标的加权组合：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="script">L</mi><mo>=</mo><msub><mi>λ</mi><mn>1</mn></msub><mo>⋅</mo><munder><munder><msub><mi mathvariant="script">L</mi><mtext>MLM</mtext></msub><mo stretchy="true">⏟</mo></munder><mtext>掩码语言建模</mtext></munder><mo>+</mo><msub><mi>λ</mi><mn>2</mn></msub><mo>⋅</mo><munder><munder><msub><mi mathvariant="script">L</mi><mtext>CLM</mtext></msub><mo stretchy="true">⏟</mo></munder><mtext>因果语言建模</mtext></munder><mo>+</mo><msub><mi>λ</mi><mn>3</mn></msub><mo>⋅</mo><munder><munder><msub><mi mathvariant="script">L</mi><mtext>KG</mtext></msub><mo stretchy="true">⏟</mo></munder><mtext>知识图谱对齐</mtext></munder></mrow><annotation encoding="application/x-tex">\\mathcal{L} = \\lambda_1 \\cdot \\underbrace{\\mathcal{L}_{\\text{MLM}}}_{\\text{掩码语言建模}} + \\lambda_2 \\cdot \\underbrace{\\mathcal{L}_{\\text{CLM}}}_{\\text{因果语言建模}} + \\lambda_3 \\cdot \\underbrace{\\mathcal{L}_{\\text{KG}}}_{\\text{知识图谱对齐}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.1597em;vertical-align:-1.4763em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span style="top:-1.5237em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">掩码语言建模</span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span class="svg-align" style="top:-2.202em;"><span class="pstrut" style="height:3em;"></span><span class="stretchy" style="height:0.548em;min-width:1.6em;"><span class="brace-left" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMinYMin slice"><path d="M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z"/></svg></span><span class="brace-center" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMidYMin slice"><path d="M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z"/></svg></span><span class="brace-right" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMaxYMin slice"><path d="M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z"/></svg></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.798em;"><span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4763em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.1597em;vertical-align:-1.4763em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span style="top:-1.5237em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">因果语言建模</span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span class="svg-align" style="top:-2.202em;"><span class="pstrut" style="height:3em;"></span><span class="stretchy" style="height:0.548em;min-width:1.6em;"><span class="brace-left" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMinYMin slice"><path d="M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z"/></svg></span><span class="brace-center" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMidYMin slice"><path d="M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z"/></svg></span><span class="brace-right" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMaxYMin slice"><path d="M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z"/></svg></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">CLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.798em;"><span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4763em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.1597em;vertical-align:-1.4763em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span style="top:-1.5237em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">知识图谱对齐</span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span class="svg-align" style="top:-2.202em;"><span class="pstrut" style="height:3em;"></span><span class="stretchy" style="height:0.548em;min-width:1.6em;"><span class="brace-left" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMinYMin slice"><path d="M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z"/></svg></span><span class="brace-center" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMidYMin slice"><path d="M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z"/></svg></span><span class="brace-right" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMaxYMin slice"><path d="M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z"/></svg></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KG</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.798em;"><span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4763em;"><span></span></span></span></span></span></span></span></span></span><p>其中：</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>MLM</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{MLM}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 作用于理解头，掩码策略为实体级掩码(Entity-Level Masking)—— 掩码整个实体(如"李白"而非单个字"李"+"白")，迫使模型基于知识而非字符统计进行预测; </li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>CLM</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{CLM}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">CLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 作用于生成头，标准的自回归 next-token prediction; </li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>KG</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{KG}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KG</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为知识图谱对齐损失，下文详述。</li>
</ul>
<p>训练过程中，三个损失交替优化：每个 batch 中，约 50% 的样本用于 MLM，30% 用于 CLM，20% 用于 KG 对齐。这种交替策略避免了不同目标之间的梯度冲突。</p>
<h2 id="s-zszq-csjdjgdsdrh">三、知识增强：从数据到架构的深度融合</h2>
<h3 id="3-1-zstpsjdyclyzr">3.1 知识图谱数据的预处理与注入</h3>
<p>ERNIE 3.0 使用的知识图谱来源于百度百科、百度知心等平台，包含超过 <strong>5500 万实体</strong>和数亿条关系边。与后续 ERNIE 4.5 的&quot;知识适配器&quot;不同，ERNIE 3.0 采用更直接的<strong>知识-文本平行预训练</strong>策略：</p>
<p><strong>步骤一：知识图谱三元组文本化</strong></p>
<p>将三元组 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>h</mi><mo separator="true">,</mo><mi>r</mi><mo separator="true">,</mo><mi>t</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(h, r, t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mclose">)</span></span></span></span>(头实体、关系、尾实体)转换为自然语言描述。例如：</p>
<ul>
<li>三元组：(李白, 职业, 诗人)</li>
<li>文本化：&quot;李白的职业是诗人&quot;</li>
</ul>
<p>这种文本化使得知识图谱数据可以直接进入标准的语言模型预训练流程，无需设计复杂的图神经网络模块。</p>
<p><strong>步骤二：知识掩码采样</strong></p>
<p>在预训练时，ERNIE 3.0 以 20% 的概率将普通文本替换为知识图谱文本化的句子。对于知识句子，采用<strong>关系级掩码(Relation-Level Masking)</strong>：掩码整个关系或尾实体，要求模型基于头实体和关系类型推断缺失信息。例如：</p>
<blockquote>
<p>输入：&quot;李白的 [MASK] 是诗人&quot;
目标：模型需要识别出 [MASK] 对应的是&quot;职业&quot;这一关系类型</p>
</blockquote>
<p>这种设计迫使模型学习<strong>关系语义</strong>而非单纯的词汇共现。</p>
<p><strong>步骤三：知识-文本对齐损失</strong></p>
<p>ERNIE 3.0 引入了基于对比学习的知识对齐损失：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>KG</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mtext>sim</mtext><mo stretchy="false">(</mo><msub><mi>h</mi><mtext>text</mtext></msub><mo separator="true">,</mo><msub><mi>h</mi><mtext>kg</mtext></msub><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>τ</mi><mo stretchy="false">)</mo></mrow><mrow><munder><mo>∑</mo><mrow><msup><mi>h</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>∈</mo><mi mathvariant="script">N</mi></mrow></munder><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mtext>sim</mtext><mo stretchy="false">(</mo><msub><mi>h</mi><mtext>text</mtext></msub><mo separator="true">,</mo><msup><mi>h</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>τ</mi><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{KG}} = -\\log \\frac{\\exp(\\text{sim}(h_{\\text{text}}, h_{\\text{kg}}) / \\tau)}{\\sum_{h&#x27; \\in \\mathcal{N}} \\exp(\\text{sim}(h_{\\text{text}}, h&#x27;) / \\tau)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KG</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4401em;vertical-align:-1.0131em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1864em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6828em;"><span style="top:-2.786em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mrel mtight">∈</span><span class="mord mathcal mtight" style="margin-right:0.1474em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3271em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord text"><span class="mord">sim</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6779em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">exp</span><span class="mopen">(</span><span class="mord text"><span class="mord">sim</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kg</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.0131em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>text</mtext></msub></mrow><annotation encoding="application/x-tex">h_{\\text{text}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是文本中实体的隐藏状态，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>kg</mtext></msub></mrow><annotation encoding="application/x-tex">h_{\\text{kg}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kg</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是知识图谱中对应实体的嵌入，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">N</mi></mrow><annotation encoding="application/x-tex">\\mathcal{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.1474em;">N</span></span></span></span> 是负采样集合，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 为温度系数。这一损失函数确保模型在语义空间中将文本实体与知识图谱实体对齐。</p>
<h3 id="3-2-kkykxxxsf">3.2 可控与可信学习算法</h3>
<p>ERNIE 3.0 Titan 在基础版本之上增加了**可控学习(Controllable Learning)<strong>和</strong>可信学习(Trustworthy Learning)**两大机制：</p>
<p><strong>可控学习</strong>：通过引入控制码(Control Codes)指导生成风格。控制码是一组可学习的嵌入向量，在生成头的输入层与 token embedding 相加。不同的控制码对应不同的生成风格(如：新闻体、口语化、学术体、诗歌体)。训练时，模型学习将控制码映射到特定的生成分布：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>P</mi><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">∣</mi><mi>c</mi><mo stretchy="false">)</mo><mo>=</mo><munderover><mo>∏</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mi>T</mi></munderover><mi>P</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mi>c</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">P(x | c) = \\prod_{t=1}^{T} P(x_t | x_{&lt;t}, c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">∣</span><span class="mord mathnormal">c</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∏</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi></mrow><annotation encoding="application/x-tex">c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">c</span></span></span></span> 是控制码嵌入。ERNIE 3.0 Titan 预定义了 16 种控制码，覆盖文体、情感极性、长度约束等维度。</p>
<p><strong>可信学习</strong>：针对大模型的事实幻觉问题，ERNIE 3.0 Titan 在训练阶段引入<strong>事实一致性判别器(Factuality Discriminator)</strong>。判别器是一个二分类网络，输入为生成文本和对应的知识图谱子图，输出为事实一致性分数。生成头的训练目标修改为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi mathvariant="script">L</mi><mtext>gen</mtext><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msubsup><mo>=</mo><msub><mi mathvariant="script">L</mi><mtext>CLM</mtext></msub><mo>−</mo><mi>λ</mi><mo>⋅</mo><mi>log</mi><mo>⁡</mo><mi>D</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mtext>gen</mtext></msub><mo separator="true">,</mo><msub><mi>G</mi><mtext>kg</mtext></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{gen}}&#x27; = \\mathcal{L}_{\\text{CLM}} - \\lambda \\cdot \\log D(x_{\\text{gen}}, G_{\\text{kg}})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.185em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gen</span></span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">CLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gen</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kg</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span> 是判别器，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>G</mi><mtext>kg</mtext></msub></mrow><annotation encoding="application/x-tex">G_{\\text{kg}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">G</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kg</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是相关知识子图。通过最大化判别器的输出(即让生成文本被判别器判定为&quot;事实一致&quot;)，模型在生成过程中自动倾向于知识图谱支持的内容。</p>
<h2 id="s-ernie-3-0-titan-2600-ycsdgccssj">四、ERNIE 3.0 Titan：2600 亿参数的国产超算实践</h2>
<h3 id="4-1-mxggyxlpz">4.1 模型规格与训练配置</h3>
<p>ERNIE 3.0 Titan 的架构在 ERNIE 3.0 基础上进行了深度扩展：</p>
<table>
<thead>
<tr>
<th>组件</th>
<th>ERNIE 3.0</th>
<th>ERNIE 3.0 Titan</th>
</tr>
</thead>
<tbody><tr>
<td>通用表示层数</td>
<td>48</td>
<td>64</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>4096</td>
<td>8192</td>
</tr>
<tr>
<td>注意力头数</td>
<td>64</td>
<td>128</td>
</tr>
<tr>
<td>总参数量</td>
<td>100 亿</td>
<td>2600 亿</td>
</tr>
<tr>
<td>训练数据量</td>
<td>4TB</td>
<td>10TB+</td>
</tr>
<tr>
<td>训练硬件</td>
<td>384×V100</td>
<td>鹏城云脑Ⅱ(数千颗国产芯片)</td>
</tr>
<tr>
<td>训练框架</td>
<td>飞桨</td>
<td>飞桨自适应分布式</td>
</tr>
</tbody></table>
<h3 id="4-2-fjzsyfbsxljs">4.2 飞桨自适应分布式训练技术</h3>
<p>ERNIE 3.0 Titan 的训练依托百度飞桨的<strong>端到端自适应分布式架构</strong>，这一架构在业界具有开创性意义：</p>
<p><strong>资源感知分配(Resource-Aware Allocation)</strong></p>
<p>传统分布式训练通常采用固定的并行策略(如数据并行 + 张量并行 8 路)，但不同训练阶段的计算特征不同——前向传播是计算密集型，反向传播的梯度同步是通信密集型。飞桨的资源感知分配器动态调整并行策略：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Strategy</mtext><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mi>arg</mi><mo>⁡</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>s</mi><mo>∈</mo><mi mathvariant="script">S</mi></mrow></munder><mfrac><mrow><mtext>Throughput</mtext><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>t</mi><mo stretchy="false">)</mo></mrow><mrow><mtext>Communication_Cost</mtext><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>t</mi><mo stretchy="false">)</mo><mo>+</mo><mtext>Memory_Cost</mtext><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{Strategy}(t) = \\arg\\max_{s \\in \\mathcal{S}} \\frac{\\text{Throughput}(s, t)}{\\text{Communication\\_Cost}(s, t) + \\text{Memory\\_Cost}(s, t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Strategy</span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.423em;vertical-align:-0.996em;"></span><span class="mop">ar<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3557em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mrel mtight">∈</span><span class="mord mathcal mtight" style="margin-right:0.075em;">S</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7717em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Communication_Cost</span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Memory_Cost</span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Throughput</span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.996em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">S</mi></mrow><annotation encoding="application/x-tex">\\mathcal{S}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.075em;">S</span></span></span></span> 是候选策略集合(数据并行、张量并行、流水线并行及其组合)，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 是训练步数。实验表明，自适应分配使 ERNIE 3.0 Titan 的训练吞吐量提升了 <strong>2.1 倍</strong>。</p>
<p><strong>参数分片与重计算</strong></p>
<p>2600 亿参数远超单卡显存容量(即使是 80GB A100)。飞桨采用<strong>参数分片(Parameter Sharding)<strong>技术：将模型参数划分为多个分片，每个计算节点只存储一部分参数，需要时通过 all-gather 通信获取。结合</strong>激活值重计算(Activation Recomputation)</strong>—— 不保存中间激活值，反向传播时重新计算—— 将显存占用降低了 60%。</p>
<p><strong>混合精度与通信压缩</strong></p>
<p>训练使用 FP16/BF16 混合精度，并引入<strong>1-bit Adam 优化器</strong>：将梯度通信压缩至 1-bit(仅传输符号位)，在几乎不损失收敛性的前提下将通信带宽需求降低 32 倍。这对于基于国产芯片的鹏城云脑Ⅱ集群尤为重要，因为国产芯片间的互联带宽通常低于英伟达 NVLink。</p>
<h3 id="4-3-zxzl-dmxlddcbpj">4.3 在线蒸馏：大模型落地的成本破局</h3>
<p>ERNIE 3.0 Titan 的另一项工程创新是<strong>大模型在线蒸馏框架</strong>。传统知识蒸馏需要分别训练教师模型和学生模型，流程繁琐且教师模型在蒸馏阶段处于&quot;冻结&quot;状态，无法继续优化。ERNIE 3.0 的在线蒸馏允许教师模型和学生模型<strong>同时训练、相互促进</strong>：</p>
<pre><code>教师模型(2600亿参数) ←—— 监督信号 ——→ 学生模型(10亿/100亿参数)
       ↑                                        ↑
       └──────── 蒸馏损失共享梯度 ───────────────┘
</code></pre>
<p>具体实现上，每个训练 step 包含两个阶段：</p>
<ol>
<li><strong>教师前向</strong>：用当前 batch 计算教师模型的输出分布 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>T</mi></msub></mrow><annotation encoding="application/x-tex">P_T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>; </li>
<li><strong>联合反向</strong>：学生模型以 KL 散度最小化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>S</mi></msub></mrow><annotation encoding="application/x-tex">P_S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>T</mi></msub></mrow><annotation encoding="application/x-tex">P_T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的距离，同时教师模型也以学生模型的困难样本为负例进行强化学习。</li>
</ol>
<p>在线蒸馏使得 ERNIE 3.0 Titan 在训练过程中就能产出多个尺寸的学生模型，企业无需额外蒸馏即可直接部署 10 亿或 100 亿参数的&quot;轻量版&quot;，落地成本降低 <strong>80%</strong>。</p>
<h2 id="w-xnpgyhxdb">五、性能评估与横向对比</h2>
<h3 id="5-1-zw-nlp-jzcs">5.1 中文 NLP 基准测试</h3>
<p>ERNIE 3.0 在 54 个中文 NLP 任务上进行了全面评估，涵盖 14 种任务类型：</p>
<table>
<thead>
<tr>
<th>任务类型</th>
<th>数据集数量</th>
<th>ERNIE 3.0</th>
<th>GPT-3 (175B)</th>
<th>BERT-wwm-ext</th>
</tr>
</thead>
<tbody><tr>
<td>情感分析</td>
<td>5</td>
<td>95.8</td>
<td>89.2</td>
<td>93.1</td>
</tr>
<tr>
<td>命名实体识别</td>
<td>4</td>
<td>93.5</td>
<td>85.7</td>
<td>91.2</td>
</tr>
<tr>
<td>机器阅读理解</td>
<td>6</td>
<td>89.2</td>
<td>82.4</td>
<td>85.6</td>
</tr>
<tr>
<td>语义相似度</td>
<td>4</td>
<td>91.4</td>
<td>84.1</td>
<td>88.3</td>
</tr>
<tr>
<td>文本摘要</td>
<td>3</td>
<td>86.7</td>
<td>81.5</td>
<td>N/A</td>
</tr>
<tr>
<td>问答生成</td>
<td>2</td>
<td>88.3</td>
<td>79.6</td>
<td>N/A</td>
</tr>
<tr>
<td>零样本分类</td>
<td>8</td>
<td>78.5</td>
<td>72.3</td>
<td>45.2</td>
</tr>
</tbody></table>
<p>在理解任务上，ERNIE 3.0(100亿参数)超越了 175B 的 GPT-3，验证了<strong>知识增强 + 双向注意力</strong>路线在理解任务上的效率优势。在生成任务上，ERNIE 3.0 与 GPT-3 的差距缩小到 3-5 个百分点，而参数仅为 GPT-3 的 1/17。</p>
<h3 id="5-2-super-glue-ykyyjz">5.2 SuperGLUE 与跨语言基准</h3>
<p>在 SuperGLUE(国际权威语言理解评测)上，ERNIE 3.0 Titan 以超越人类水平 <strong>0.8 个百分点</strong>的成绩登顶全球榜首(截至 2022 年初)。在 XTREME 跨语言基准上，ERNIE-M(基于 ERNIE 3.0 扩展的多语言版本)在 96 种语言的 9 项任务中取得 SOTA。</p>
<h3 id="5-3-lybyxybnl">5.3 零样本与小样本能力</h3>
<p>ERNIE 3.0 在零样本(Zero-Shot)和小样本(Few-Shot)场景下表现尤为突出。在 18 个零样本数据集上，ERNIE 3.0 刷新了当时的 SOTA：</p>
<table>
<thead>
<tr>
<th>数据集</th>
<th>任务</th>
<th>ERNIE 3.0 Zero-Shot</th>
<th>GPT-3 Zero-Shot</th>
</tr>
</thead>
<tbody><tr>
<td>CMNLI</td>
<td>自然语言推理</td>
<td>71.2</td>
<td>64.8</td>
</tr>
<tr>
<td>C3</td>
<td>阅读理解</td>
<td>68.5</td>
<td>61.3</td>
</tr>
<tr>
<td>LCQMC</td>
<td>语义相似度</td>
<td>82.1</td>
<td>75.6</td>
</tr>
<tr>
<td>DRCD</td>
<td>文档级阅读</td>
<td>74.3</td>
<td>67.9</td>
</tr>
</tbody></table>
<p>零样本能力的优势源于知识图谱的注入：对于&quot;李白的职业是什么&quot;这类问题，即使没有见过相似的训练样本，模型也能通过内部化的知识图谱直接回答。</p>
<h2 id="l-ernie-3-0-dgcyxycyld">六、ERNIE 3.0 的工程影响与产业落地</h2>
<h3 id="6-1-dhxdmxsjdyx">6.1 对后续大模型设计的影响</h3>
<p>ERNIE 3.0 的&quot;多范式统一&quot;思想在 2021 年颇具前瞻性，其影响体现在：</p>
<ul>
<li><strong>GPT-4(2023)</strong>：OpenAI 未公开 GPT-4 的架构细节，但业界普遍认为 GPT-4 采用了类似的&quot;统一 backbone + 多任务头&quot;设计，以同时支持对话、代码、多模态等任务; </li>
<li><strong>T5 / UL2(Google)</strong>：2022 年发布的 UL2 框架明确借鉴了 ERNIE 3.0 的多范式思想，提出 Mixture-of-Denoisers(MoD)统一了多种预训练目标; </li>
<li><strong>文心一言(2023)</strong>：ERNIE 3.0 是文心一言(ERNIE Bot)的技术底座，其对话能力直接继承自 ERNIE 3.0 的生成头。</li>
</ul>
<h3 id="6-2-cyldal">6.2 产业落地案例</h3>
<p>截至 2024 年，ERNIE 3.0 及其衍生模型已在百度百余个产品中部署：</p>
<ul>
<li><strong>百度搜索</strong>：问题意图分类、网页相关性排序、答案摘要生成; </li>
<li><strong>百度 Feed 流</strong>：新闻内容推荐、去重、标题生成; </li>
<li><strong>小度智能屏</strong>：多轮对话意图理解、知识问答; </li>
<li><strong>百度地图</strong>：POI 检索意图解析、导航指令生成; </li>
<li><strong>千帆平台</strong>：为企业提供模型微调、API 调用服务，覆盖金融、医疗、政务等垂直领域。</li>
</ul>
<p>ERNIE 3.0 Titan 的在线蒸馏技术使得这些应用场景能够以可控的成本部署大模型能力。例如，百度搜索的在线问答模块使用的是 100 亿参数的学生模型，响应延迟 &lt; 100ms，而背后提供知识监督的则是 2600 亿的教师模型。</p>
<h2 id="q-jxyhxyj">七、局限与后续演进</h2>
<h3 id="7-1-jgcmdjx">7.1 架构层面的局限</h3>
<p>ERNIE 3.0 的多范式统一框架在理论上优雅，但工程实现存在挑战：</p>
<ol>
<li><strong>任务头之间的干扰</strong>：理解头和生成头共享通用表示模块，但两者的最优表征空间并不完全一致。实验表明，当生成任务比例过高时，理解任务性能会下降 2-3%; </li>
<li><strong>知识图谱覆盖不足</strong>：ERNIE 3.0 使用的知识图谱以百科类事实知识为主，对动态知识(如实时新闻、股价)和领域专业知识(如法律条文、医学指南)覆盖有限; </li>
<li><strong>上下文长度限制</strong>：基于 Transformer-XL 的生成头理论上支持长文本，但实际训练时序列长度限制在 512-1024 tokens，无法处理整篇文档级输入。</li>
</ol>
<h3 id="7-2-x-ernie-4-x-dyj">7.2 向 ERNIE 4.x 的演进</h3>
<p>ERNIE 3.0 的局限在后续版本中得到了针对性解决：</p>
<ul>
<li><strong>ERNIE 4.0(2023)</strong>：引入 MoE 架构和万亿级激活参数，通过稀疏化缓解任务头干扰; 增加插件机制，用外部工具补充知识图谱的动态知识缺口; </li>
<li><strong>ERNIE 4.5(2025)</strong>：彻底转向异构多模态 MoE，将统一框架从文本扩展到视觉-语言; 采用自适应分辨率视觉编码器，突破固定序列长度限制。</li>
</ul>
<h2 id="b-zj">八、总结</h2>
<p>ERNIE 3.0 是中文大模型发展史上的里程碑。其<strong>多范式统一预训练框架</strong>首次在架构层面打通了自然语言理解与生成两大任务，证明了&quot;一个 backbone、多个任务头&quot;的可行性; <strong>知识图谱融合</strong>则从数据层面为模型注入结构化知识，显著提升了事实准确性和零样本能力; <strong>在线蒸馏</strong>和<strong>可控/可信学习</strong>等工程创新，则为大模型的产业落地提供了成本可控的路径。</p>
<p>ERNIE 3.0 Titan 在鹏城云脑Ⅱ上的训练实践，也证明了国产算力基础设施支撑超大规模模型训练的能力。在 GPT-3 主导的国际大模型格局中，ERNIE 3.0 以&quot;知识增强&quot;为差异化卖点，走出了一条具有中国特色的技术路线。这一路线在后续的文心一言、ERNIE 4.5 中得到了延续和深化，成为国产大模型参与全球竞争的核心技术资产。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://arxiv.org/abs/2107.02137">ERNIE 3.0 论文：arXiv:2107.02137</a></li>
<li><a href="http://research.baidu.com/Blog/index-view?id=165">ERNIE 3.0 Titan 技术博客</a></li>
<li><a href="https://www.paddlepaddle.org.cn/docs">飞桨大模型分布式训练文档</a></li>
<li><a href="https://www.pcl.ac.cn/html/946/">鹏城云脑Ⅱ算力平台</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.2-国内大模型/百度文心-ERNIE/05-ERNIE-3.0-多范式统一预训练框架与知识图谱融合.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxglylsdw","text":"一、模型概览与历史定位"},{"level":2,"id":"e-hxjg-dfstyyxlkj","text":"二、核心架构：多范式统一预训练框架"},{"level":3,"id":"2-1-zhg-vs-zbm-fsfldgy","text":"2.1 自回归 vs 自编码：范式分裂的根源"},{"level":3,"id":"2-2-ernie-3-0-dtykjsj","text":"2.2 ERNIE 3.0 的统一框架设计"},{"level":3,"id":"2-3-tyyxlmbhs","text":"2.3 统一预训练目标函数"},{"level":2,"id":"s-zszq-csjdjgdsdrh","text":"三、知识增强：从数据到架构的深度融合"},{"level":3,"id":"3-1-zstpsjdyclyzr","text":"3.1 知识图谱数据的预处理与注入"},{"level":3,"id":"3-2-kkykxxxsf","text":"3.2 可控与可信学习算法"},{"level":2,"id":"s-ernie-3-0-titan-2600-ycsdgccssj","text":"四、ERNIE 3.0 Titan：2600 亿参数的国产超算实践"},{"level":3,"id":"4-1-mxggyxlpz","text":"4.1 模型规格与训练配置"},{"level":3,"id":"4-2-fjzsyfbsxljs","text":"4.2 飞桨自适应分布式训练技术"},{"level":3,"id":"4-3-zxzl-dmxlddcbpj","text":"4.3 在线蒸馏：大模型落地的成本破局"},{"level":2,"id":"w-xnpgyhxdb","text":"五、性能评估与横向对比"},{"level":3,"id":"5-1-zw-nlp-jzcs","text":"5.1 中文 NLP 基准测试"},{"level":3,"id":"5-2-super-glue-ykyyjz","text":"5.2 SuperGLUE 与跨语言基准"},{"level":3,"id":"5-3-lybyxybnl","text":"5.3 零样本与小样本能力"},{"level":2,"id":"l-ernie-3-0-dgcyxycyld","text":"六、ERNIE 3.0 的工程影响与产业落地"},{"level":3,"id":"6-1-dhxdmxsjdyx","text":"6.1 对后续大模型设计的影响"},{"level":3,"id":"6-2-cyldal","text":"6.2 产业落地案例"},{"level":2,"id":"q-jxyhxyj","text":"七、局限与后续演进"},{"level":3,"id":"7-1-jgcmdjx","text":"7.1 架构层面的局限"},{"level":3,"id":"7-2-x-ernie-4-x-dyj","text":"7.2 向 ERNIE 4.x 的演进"},{"level":2,"id":"b-zj","text":"八、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.21-erine/02-ernie-3.0/05-ernie-3.0-dfstyyxlkjyzstprh" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.21-erine/02-ernie-3.0/05-ernie-3.0-dfstyyxlkjyzstprh" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ERNIE 3.0：多范式统一预训练框架与知识图谱融合</h1>
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
