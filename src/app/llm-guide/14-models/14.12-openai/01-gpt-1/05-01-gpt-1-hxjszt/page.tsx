"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>01-GPT-1 核心技术专题：生成式预训练范式的开创与 NLP 任务统一框架</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<h2 id="y-lsdwyfbbj">一、历史地位与发布背景</h2>
<p>2018 年 6 月，OpenAI 发表了论文《Improving Language Understanding by Generative Pre-Training》，正式提出了 <strong>GPT(Generative Pre-Training)</strong> 模型。这个仅有 <strong>1.17 亿参数</strong> 的模型，看似微不足道(对比今日动辄千亿参数的模型)，却彻底改变了自然语言处理(NLP)的发展方向。</p>
<h3 id="1-1-2018-nd-nlp-kj">1.1 2018 年的 NLP 困局</h3>
<p>在 GPT-1 之前，NLP 领域的主流范式是<strong>监督学习 + 任务特定架构</strong>：</p>
<table>
<thead>
<tr>
<th>任务</th>
<th>代表模型</th>
<th>架构特点</th>
</tr>
</thead>
<tbody><tr>
<td>文本分类</td>
<td>TextCNN</td>
<td>卷积神经网络</td>
</tr>
<tr>
<td>机器翻译</td>
<td>Seq2Seq + Attention</td>
<td>RNN 编码器-解码器</td>
</tr>
<tr>
<td>问答系统</td>
<td>BiDAF</td>
<td>双向注意力流</td>
</tr>
<tr>
<td>语义相似度</td>
<td>ESIM</td>
<td>双向 LSTM + 交互层</td>
</tr>
<tr>
<td>命名实体识别</td>
<td>BiLSTM-CRF</td>
<td>条件随机场</td>
</tr>
</tbody></table>
<p>每个任务都需要：</p>
<ol>
<li><strong>专门设计的架构</strong></li>
<li><strong>大量标注数据</strong></li>
<li><strong>独立训练的模型</strong></li>
</ol>
<p>这种&quot;<strong>一个任务一个模型</strong>&quot;的范式导致：</p>
<ul>
<li>标注成本极高</li>
<li>模型之间无法共享知识</li>
<li>新任务需要从零开始</li>
</ul>
<h3 id="1-2-gpt-1-dhxdc">1.2 GPT-1 的核心洞察</h3>
<p>GPT-1 的作者(Alec Radford 等)提出了一个革命性的假设：</p>
<blockquote>
<p><strong>&quot;如果先用无监督预训练学习语言的通用表示，再用少量标注数据微调特定任务，是否可以统一所有 NLP 任务？&quot;</strong></p>
</blockquote>
<p>这一假设后来被称为 <strong>GPT 范式</strong>或<strong>两阶段训练范式</strong>：</p>
<pre><code>阶段一：无监督预训练(Unsupervised Pre-training)
  海量无标注文本 → 学习语言的一般规律
  
阶段二：有监督微调(Supervised Fine-tuning)
  少量标注数据 → 适配特定下游任务
</code></pre>
<h2 id="e-jgsj-decoder-only-transformer">二、架构设计：Decoder-only Transformer</h2>
<h3 id="2-1-wsmxz-decoder-only">2.1 为什么选择 Decoder-only？</h3>
<p>GPT-1 采用了 Transformer 的 <strong>Decoder-only</strong> 架构，这与当时流行的 Encoder(如 BERT)形成了鲜明对比。</p>
<p><strong>BERT(Encoder)vs GPT(Decoder)对比</strong>：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>BERT(Encoder)</th>
<th>GPT(Decoder)</th>
</tr>
</thead>
<tbody><tr>
<td>注意力方向</td>
<td>双向(Bidirectional)</td>
<td><strong>单向(Left-to-Right)</strong></td>
</tr>
<tr>
<td>预训练任务</td>
<td>Masked Language Model</td>
<td><strong>Next Token Prediction</strong></td>
</tr>
<tr>
<td>生成能力</td>
<td>弱(需额外解码器)</td>
<td><strong>强(自回归生成)</strong></td>
</tr>
<tr>
<td>理解能力</td>
<td>强(双向上下文)</td>
<td>中等(单向上下文)</td>
</tr>
<tr>
<td>代表任务</td>
<td>分类、标注</td>
<td><strong>生成、续写</strong></td>
</tr>
</tbody></table>
<p>GPT-1 选择 Decoder-only 的核心原因：</p>
<ol>
<li><strong>生成能力</strong>：单向注意力天然适合自回归文本生成</li>
<li><strong>统一框架</strong>：所有任务都可以建模为&quot;给定前文，预测下文&quot;</li>
<li><strong>可扩展性</strong>：Decoder-only 架构更容易扩展到更大规模</li>
</ol>
<h3 id="2-2-gpt-1-djgxj">2.2 GPT-1 的架构细节</h3>
<pre><code>GPT-1 Architecture (117M parameters):
├── Token Embedding: V × d = 40,000 × 768
├── Position Embedding: 512 × 768
├── Transformer Decoder × 12:
│   ├── Multi-Head Self-Attention (12 heads, d=768)
│   ├── Feed-Forward Network (3072 hidden units)
│   ├── LayerNorm + Residual Connection
├── Output Projection: 768 × 40,000
</code></pre>
<p><strong>关键超参数</strong>：</p>
<table>
<thead>
<tr>
<th>参数</th>
<th>值</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>层数</td>
<td>12</td>
<td>标准 Transformer 深度</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>768</td>
<td>与 BERT-base 相同</td>
</tr>
<tr>
<td>注意力头</td>
<td>12</td>
<td>每头 64 维</td>
</tr>
<tr>
<td>FFN 维度</td>
<td>3072</td>
<td>4 × 隐藏维度</td>
</tr>
<tr>
<td>最大序列长度</td>
<td>512</td>
<td>受位置编码限制</td>
</tr>
<tr>
<td>词汇量</td>
<td>40,000</td>
<td>Byte Pair Encoding</td>
</tr>
<tr>
<td>总参数量</td>
<td>117M</td>
<td>约 1.17 亿</td>
</tr>
</tbody></table>
<h3 id="2-3-ytq-bert-ddb">2.3 与同期 BERT 的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-1</th>
<th>BERT-base</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2018.06</td>
<td>2018.10</td>
<td>GPT 稍早</td>
</tr>
<tr>
<td>参数量</td>
<td>117M</td>
<td>110M</td>
<td>接近</td>
</tr>
<tr>
<td>架构</td>
<td>Decoder-only</td>
<td>Encoder-only</td>
<td>方向不同</td>
</tr>
<tr>
<td>预训练数据</td>
<td>BooksCorpus (800M words)</td>
<td>BooksCorpus + Wikipedia (3.3B words)</td>
<td>BERT 更多</td>
</tr>
<tr>
<td>预训练任务</td>
<td>Next Token Prediction</td>
<td>Masked LM + NSP</td>
<td>任务不同</td>
</tr>
<tr>
<td>微调范式</td>
<td>Task-specific input transformation</td>
<td>[CLS] token + simple classification</td>
<td>GPT 更灵活</td>
</tr>
</tbody></table>
<p>虽然 BERT 在理解类任务上表现更好，但 GPT-1 的<strong>生成能力</strong>和<strong>任务统一框架</strong>为后续 GPT 系列的发展奠定了基础。</p>
<h2 id="s-ljdxlfs">三、两阶段训练范式</h2>
<h3 id="3-1-jdy-wjdyxl">3.1 阶段一：无监督预训练</h3>
<p><strong>目标函数</strong>：给定前 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个 Token，预测第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">k+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 个 Token</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mn>1</mn></msub><mo>=</mo><mo>−</mo><munder><mo>∑</mo><mi>i</mi></munder><mi>log</mi><mo>⁡</mo><mi>P</mi><mo stretchy="false">(</mo><msub><mi>u</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>u</mi><mrow><mi>i</mi><mo>−</mo><mn>1</mn></mrow></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>u</mi><mrow><mi>i</mi><mo>−</mo><mi>k</mi></mrow></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_1 = -\\sum_{i} \\log P(u_i | u_{i-1}, \\ldots, u_{i-k})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p><strong>预训练数据</strong>：BooksCorpus</p>
<ul>
<li>约 7,000 本未出版书籍</li>
<li>约 8 亿个单词</li>
<li>涵盖多种 genre(小说、非小说、冒险、浪漫等)</li>
</ul>
<p><strong>为什么选择书籍而非网页？</strong></p>
<ol>
<li><strong>长程依赖</strong>：书籍中的句子跨度长，有利于学习长距离依赖</li>
<li><strong>连贯性</strong>：同一本书的上下文连贯，有利于学习篇章级语义</li>
<li><strong>质量</strong>：相比网页，书籍的语言质量更高</li>
</ol>
<p><strong>训练细节</strong>：</p>
<ul>
<li>批次大小：64</li>
<li>学习率：2.5e-4，预热后线性衰减</li>
<li>优化器：Adam(β₁=0.9, β₂=0.999)</li>
<li>训练步数：100 epochs over BooksCorpus</li>
<li>硬件：8 块 P600 GPU，训练约 1 个月</li>
</ul>
<h3 id="3-2-jde-yjdwt">3.2 阶段二：有监督微调</h3>
<p><strong>核心思想</strong>：将预训练好的模型参数作为初始化，在下游任务的标注数据上微调。</p>
<p><strong>任务特定的输入转换(Task-specific Input Transformation)</strong>：</p>
<p>GPT-1 的创新之处在于：所有 NLP 任务都可以转换为统一的&quot;<strong>文本拼接</strong>&quot;格式。</p>
<p><strong>文本分类</strong>：</p>
<pre><code>输入: [Start] 这部电影太精彩了 [Extract]
输出: 正面
</code></pre>
<p><strong>文本蕴含(Entailment)</strong>：</p>
<pre><code>输入: [Start] 前提: 一个男人在弹吉他 [Delimiter] 假设: 一个音乐家在演奏乐器 [Extract]
输出: 蕴含
</code></pre>
<p><strong>语义相似度</strong>：</p>
<pre><code>输入: [Start] 句子1: 今天天气很好 [Delimiter] 句子2: 今天是个晴天 [Extract]
输出: 相似
</code></pre>
<p><strong>问答</strong>：</p>
<pre><code>输入: [Start] 上下文: ... [Delimiter] 问题: ... [Delimiter] 答案: [Extract]
输出: 答案文本
</code></pre>
<p><strong>关键创新</strong>：通过巧妙的输入拼接，GPT-1 用<strong>同一个模型架构</strong>处理所有任务，无需修改模型结构。</p>
<h3 id="3-3-fzmbhs-auxiliary-objective">3.3 辅助目标函数(Auxiliary Objective)</h3>
<p>在微调阶段，GPT-1 同时优化两个目标：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>t</mi><mi>o</mi><mi>t</mi><mi>a</mi><mi>l</mi></mrow></msub><mo>=</mo><msub><mi mathvariant="script">L</mi><mrow><mi>t</mi><mi>a</mi><mi>s</mi><mi>k</mi></mrow></msub><mo>+</mo><mi>λ</mi><mo>⋅</mo><msub><mi mathvariant="script">L</mi><mrow><mi>p</mi><mi>r</mi><mi>e</mi><mi>t</mi><mi>r</mi><mi>a</mi><mi>i</mi><mi>n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{total} = \\mathcal{L}_{task} + \\lambda \\cdot \\mathcal{L}_{pretrain}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">ain</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中：</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>t</mi><mi>a</mi><mi>s</mi><mi>k</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{task}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：下游任务的监督损失</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>p</mi><mi>r</mi><mi>e</mi><mi>t</mi><mi>r</mi><mi>a</mi><mi>i</mi><mi>n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{pretrain}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">ain</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：预训练阶段的语言模型损失</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span>：权重系数(通常 0.5)</li>
</ul>
<p><strong>为什么要保留预训练目标？</strong></p>
<ol>
<li><strong>正则化效果</strong>：防止模型在少量标注数据上过拟合</li>
<li><strong>知识保持</strong>：保持预训练阶段学到的通用语言能力</li>
<li><strong>泛化提升</strong>：实验表明辅助目标提升 2-3% 的准确率</li>
</ol>
<h2 id="s-xnbxylsyx">四、性能表现与历史影响</h2>
<h3 id="4-1-glue-jzcs">4.1 GLUE 基准测试</h3>
<p>GPT-1 在 GLUE(General Language Understanding Evaluation)基准上的表现：</p>
<table>
<thead>
<tr>
<th>任务</th>
<th>之前 SOTA</th>
<th>GPT-1</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>MNLI</td>
<td>80.6%</td>
<td><strong>82.1%</strong></td>
<td>↑ 1.5%</td>
</tr>
<tr>
<td>QNLI</td>
<td>87.4%</td>
<td><strong>88.1%</strong></td>
<td>↑ 0.7%</td>
</tr>
<tr>
<td>SST-2</td>
<td>93.2%</td>
<td><strong>91.3%</strong></td>
<td>↓ 1.9%</td>
</tr>
<tr>
<td>CoLA</td>
<td>58.9%</td>
<td><strong>45.4%</strong></td>
<td>↓ 13.5%</td>
</tr>
<tr>
<td>STS-B</td>
<td>87.2%</td>
<td><strong>86.0%</strong></td>
<td>↓ 1.2%</td>
</tr>
<tr>
<td>MRPC</td>
<td>78.7%</td>
<td><strong>82.3%</strong></td>
<td>↑ 3.6%</td>
</tr>
<tr>
<td>RTE</td>
<td>70.1%</td>
<td><strong>56.0%</strong></td>
<td>↓ 14.1%</td>
</tr>
</tbody></table>
<p>GPT-1 在 9 个 GLUE 任务中的 <strong>4 个</strong> 上取得了 SOTA。虽然并非全面领先，但考虑到这是<strong>同一个模型</strong>在不同任务上的表现(而非为每个任务专门设计的模型)，这一结果极具说服力。</p>
<h3 id="4-2-qtrwbx">4.2 其他任务表现</h3>
<table>
<thead>
<tr>
<th>任务</th>
<th>之前 SOTA</th>
<th>GPT-1</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>SQuAD (QA)</td>
<td>81.8 F1</td>
<td><strong>89.0 F1</strong></td>
<td>↑ 7.2%</td>
</tr>
<tr>
<td>RACE (阅读理解)</td>
<td>53.3%</td>
<td><strong>59.0%</strong></td>
<td>↑ 5.7%</td>
</tr>
</tbody></table>
<p>在问答和阅读理解任务上，GPT-1 的提升更为显著。</p>
<h3 id="4-3-lsyx-c-gpt-1-d-gpt-3-dyj">4.3 历史影响：从 GPT-1 到 GPT-3 的演进</h3>
<p>GPT-1 的成功验证了&quot;<strong>预训练 + 微调</strong>&quot;范式的有效性，直接启发了后续模型的发展：</p>
<pre><code>GPT-1 (2018.06, 117M)
  ├── 验证了两阶段训练范式的可行性
  └── 证明了 Decoder-only 架构的潜力
      ↓
GPT-2 (2019.02, 1.5B)
  ├── 展示了 Scaling 的威力
  └── 发现了 Zero-shot 能力
      ↓
GPT-3 (2020.05, 175B)
  ├── 验证了 In-Context Learning
  └── 证明了 Few-shot 的通用性
      ↓
GPT-4 (2023.03, ~1T)
  ├── 多模态能力
  └── 通用人工智能的雏形
</code></pre>
<p>GPT-1 的论文被引用超过 <strong>20,000 次</strong>，是 NLP 领域最具影响力的论文之一。</p>
<h2 id="w-jsjxxyhxgj">五、技术局限性与后续改进</h2>
<h3 id="5-1-gpt-1-djx">5.1 GPT-1 的局限</h3>
<ol>
<li><strong>参数量小</strong>：117M 参数限制了模型的表达能力</li>
<li><strong>单向注意力</strong>：只能利用左侧上下文，无法理解双向语义</li>
<li><strong>预训练数据少</strong>：仅 800M 单词，远少于后续模型</li>
<li><strong>微调依赖</strong>：每个任务仍需要标注数据进行微调</li>
<li><strong>长文本处理差</strong>：512 的最大长度限制了长文档处理能力</li>
</ol>
<h3 id="5-2-c-gpt-1-d-gpt-2-dgjgj">5.2 从 GPT-1 到 GPT-2 的关键改进</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-1</th>
<th>GPT-2</th>
<th>改进</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td>117M</td>
<td><strong>1.5B</strong></td>
<td>↑ 13x</td>
</tr>
<tr>
<td>预训练数据</td>
<td>800M words</td>
<td><strong>40GB WebText</strong></td>
<td>↑ 50x</td>
</tr>
<tr>
<td>词汇量</td>
<td>40K</td>
<td><strong>50K</strong></td>
<td>↑ 25%</td>
</tr>
<tr>
<td>最大长度</td>
<td>512</td>
<td><strong>1024</strong></td>
<td>↑ 2x</td>
</tr>
<tr>
<td>层数</td>
<td>12</td>
<td><strong>48</strong></td>
<td>↑ 4x</td>
</tr>
<tr>
<td>微调需求</td>
<td>必需</td>
<td><strong>Zero-shot 可行</strong></td>
<td>质变</td>
</tr>
</tbody></table>
<p>GPT-2 通过在 GPT-1 的基础上<strong>大幅扩展规模</strong>，发现了涌现的 Zero-shot 能力——这是 GPT-1 时代未曾预料到的。</p>
<h2 id="l-zj">六、总结</h2>
<p>GPT-1 是大模型发展史上的<strong>开山之作</strong>。虽然其参数规模(117M)和性能在今天看来微不足道，但它确立的<strong>生成式预训练 + 任务微调</strong>范式，成为此后所有 GPT 系列模型(乃至大模型行业)的基石。</p>
<p>核心贡献：</p>
<ol>
<li><strong>Decoder-only 架构</strong>：证明了单向 Transformer 在 NLP 任务上的有效性，为后续 GPT 系列的发展指明了方向</li>
<li><strong>两阶段训练范式</strong>：无监督预训练 + 有监督微调，降低了 NLP 任务对标注数据的依赖</li>
<li><strong>任务统一框架</strong>：通过输入转换，用同一个模型处理多种任务，开创了 NLP 统一模型的先河</li>
<li><strong>预训练的价值</strong>：证明了在海量无标注文本上预训练可以学到通用的语言表示</li>
</ol>
<p>GPT-1 的论文标题《Improving Language Understanding by Generative Pre-Training》精准概括了其核心思想——<strong>通过生成式预训练提升语言理解能力</strong>。这一思想在 2018 年看似平常，但在今天已成为大模型行业的基本共识。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-lsdwyfbbj","text":"一、历史地位与发布背景"},{"level":3,"id":"1-1-2018-nd-nlp-kj","text":"1.1 2018 年的 NLP 困局"},{"level":3,"id":"1-2-gpt-1-dhxdc","text":"1.2 GPT-1 的核心洞察"},{"level":2,"id":"e-jgsj-decoder-only-transformer","text":"二、架构设计：Decoder-only Transformer"},{"level":3,"id":"2-1-wsmxz-decoder-only","text":"2.1 为什么选择 Decoder-only？"},{"level":3,"id":"2-2-gpt-1-djgxj","text":"2.2 GPT-1 的架构细节"},{"level":3,"id":"2-3-ytq-bert-ddb","text":"2.3 与同期 BERT 的对比"},{"level":2,"id":"s-ljdxlfs","text":"三、两阶段训练范式"},{"level":3,"id":"3-1-jdy-wjdyxl","text":"3.1 阶段一：无监督预训练"},{"level":3,"id":"3-2-jde-yjdwt","text":"3.2 阶段二：有监督微调"},{"level":3,"id":"3-3-fzmbhs-auxiliary-objective","text":"3.3 辅助目标函数(Auxiliary Objective)"},{"level":2,"id":"s-xnbxylsyx","text":"四、性能表现与历史影响"},{"level":3,"id":"4-1-glue-jzcs","text":"4.1 GLUE 基准测试"},{"level":3,"id":"4-2-qtrwbx","text":"4.2 其他任务表现"},{"level":3,"id":"4-3-lsyx-c-gpt-1-d-gpt-3-dyj","text":"4.3 历史影响：从 GPT-1 到 GPT-3 的演进"},{"level":2,"id":"w-jsjxxyhxgj","text":"五、技术局限性与后续改进"},{"level":3,"id":"5-1-gpt-1-djx","text":"5.1 GPT-1 的局限"},{"level":3,"id":"5-2-c-gpt-1-d-gpt-2-dgjgj","text":"5.2 从 GPT-1 到 GPT-2 的关键改进"},{"level":2,"id":"l-zj","text":"六、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/01-gpt-1/05-01-gpt-1-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/01-gpt-1/05-01-gpt-1-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">01-GPT-1 核心技术专题：生成式预训练范式的开创与 NLP 任务统一框架</h1>
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
