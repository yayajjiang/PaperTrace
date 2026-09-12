"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GPT-3：上下文学习的规模化涌现与算力美学</h1>
<blockquote>
<p><strong>模型定位</strong>：OpenAI 第三代生成式预训练模型(2020-05)，首个展示上下文学习(In-Context Learning)能力的千亿参数级语言模型
<strong>家族归属</strong>：14.12-OpenAI｜编号 03-GPT-3
<strong>核心论文</strong>：<em>Language Models are Few-Shot Learners</em> (Brown et al., NeurIPS 2020)
🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjylsyy">一、发布背景与历史意义</h2>
<h3 id="1-1-c-gpt-2-d-gpt-3-dky">1.1 从GPT-2到GPT-3的跨越</h3>
<p>2019年GPT-2(1.5B参数)的发布已经展示了大规模语言模型的潜力，但OpenAI以&quot;安全性&quot;为由限制了完整模型的发布。2020年GPT-3的发布则将这一讨论推向了新的高度：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-2</th>
<th>GPT-3</th>
<th>倍数</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td>1.5B</td>
<td><strong>175B</strong></td>
<td><strong>117x</strong></td>
</tr>
<tr>
<td>训练数据</td>
<td>40GB WebText</td>
<td><strong>~300B tokens</strong></td>
<td><strong>~60x</strong></td>
</tr>
<tr>
<td>上下文窗口</td>
<td>1024</td>
<td><strong>2048</strong></td>
<td>2x</td>
</tr>
<tr>
<td>层数</td>
<td>48</td>
<td><strong>96</strong></td>
<td>2x</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>1600</td>
<td><strong>12288</strong></td>
<td>7.7x</td>
</tr>
<tr>
<td>注意力头数</td>
<td>25</td>
<td><strong>96</strong></td>
<td>3.8x</td>
</tr>
</tbody></table>
<p>GPT-3不仅是GPT-2的放大版，它揭示了一个<strong>全新的学习范式</strong>——<strong>上下文学习(In-Context Learning)</strong>。</p>
<h3 id="1-2-sxwxx-wxcsgxdrwsy">1.2 上下文学习：无需参数更新的任务适应</h3>
<p>传统机器学习范式：</p>
<pre><code>预训练 → 微调(更新模型参数)→ 推理
</code></pre>
<p>GPT-3的上下文学习范式：</p>
<pre><code>预训练 → 推理时提供(prompt + examples) → 直接生成答案
                ↑
           不更新任何参数！
</code></pre>
<p>这一发现颠覆了机器学习的基本假设：<strong>模型可以在不更新参数的情况下学习新任务</strong>，仅需在输入中提供任务描述和若干示例。</p>
<h3 id="1-3-lsyx">1.3 历史影响</h3>
<p>GPT-3的发布标志着大模型时代的真正开端：</p>
<ul>
<li>证明了<strong>Scaling Law</strong>的有效性：模型规模增长 → 能力涌现</li>
<li>催生了&quot;基础模型&quot;(Foundation Model)概念</li>
<li>直接催生了GPT-3 API和后续的商业化路径</li>
<li>引发了全球AI军备竞赛(Google推出PaLM，Meta推出OPT等)</li>
</ul>
<hr>
<h2 id="e-jgsjygmhgc">二、架构设计与规模化工程</h2>
<h3 id="2-1-transformer-jgdjzkz">2.1 Transformer架构的极致扩展</h3>
<p>GPT-3采用了与GPT-2相同的<strong>解码器-only Transformer</strong>架构，但在每个维度上都进行了最大化扩展：</p>
<pre><code>┌─────────────────────────────────────────┐
│              GPT-3 Architecture          │
│                                          │
│  Input Embeddings (d_model = 12288)     │
│         ↓                                │
│  ┌─────────────────────────────────┐    │
│  │  Layer 1                        │    │
│  │  ├─ Multi-Head Attention (96头) │    │
│  │  │   d_head = 128               │    │
│  │  ├─ Layer Norm                  │    │
│  │  ├─ FFN (d_ff = 49152)          │    │
│  │  │   GELU激活                   │    │
│  │  └─ Layer Norm                  │    │
│  └─────────────────────────────────┘    │
│         ↓                                │
│       ... (共96层)                        │
│         ↓                                │
│  Layer Norm + Linear + Softmax          │
│  Vocab Size = 50257                     │
└─────────────────────────────────────────┘
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
<td>n_layers</td>
<td>96</td>
<td>Transformer解码器层数</td>
</tr>
<tr>
<td>d_model</td>
<td>12,288</td>
<td>模型隐藏维度</td>
</tr>
<tr>
<td>n_heads</td>
<td>96</td>
<td>注意力头数</td>
</tr>
<tr>
<td>d_head</td>
<td>128</td>
<td>每个注意力头的维度</td>
</tr>
<tr>
<td>d_ff</td>
<td>49,152</td>
<td>前馈网络中间层维度 (4 × d_model)</td>
</tr>
<tr>
<td>n_positions</td>
<td>2,048</td>
<td>最大上下文长度</td>
</tr>
<tr>
<td>vocab_size</td>
<td>50,257</td>
<td>词表大小(BPE编码)</td>
</tr>
<tr>
<td>总参数量</td>
<td><strong>175B</strong></td>
<td>—</td>
</tr>
</tbody></table>
<p><strong>注意力机制的扩展</strong>：</p>
<ul>
<li>GPT-3使用了<strong>稀疏注意力</strong>的变体：在部分层中使用**局部带状(local banded)<strong>和</strong>全局(global)**注意力的组合</li>
<li>96个注意力头被分为8组，每组12个头</li>
<li>这一设计在不显著增加计算量的情况下扩展了模型的表达能力</li>
</ul>
<h3 id="2-2-xlsjdzcyqx">2.2 训练数据的组成与清洗</h3>
<p>GPT-3的训练数据来自多个来源，经过精心筛选和加权：</p>
<table>
<thead>
<tr>
<th>数据集</th>
<th>占比</th>
<th>量级</th>
<th>质量筛选</th>
</tr>
</thead>
<tbody><tr>
<td>Common Crawl</td>
<td>60%</td>
<td>~410B raw tokens</td>
<td>高质量过滤后60B</td>
</tr>
<tr>
<td>WebText2</td>
<td>22%</td>
<td>~19B tokens</td>
<td>OpenWebText扩展</td>
</tr>
<tr>
<td>Books1</td>
<td>8%</td>
<td>~12B tokens</td>
<td>已出版书籍</td>
</tr>
<tr>
<td>Books2</td>
<td>8%</td>
<td>~55B tokens</td>
<td>更大书籍语料</td>
</tr>
<tr>
<td>Wikipedia</td>
<td>3%</td>
<td>~3B tokens</td>
<td>英文维基百科</td>
</tr>
<tr>
<td><strong>总计</strong></td>
<td><strong>100%</strong></td>
<td><strong>~300B tokens</strong></td>
<td>—</td>
</tr>
</tbody></table>
<p><strong>Common Crawl的清洗策略</strong>：
GPT-3面临的核心挑战是如何从Common Crawl的海量低质量数据中筛选出高质量内容。OpenAI采用了一种<strong>基于相似度的过滤方法</strong>：</p>
<ol>
<li>使用WebText作为&quot;高质量&quot;参考集</li>
<li>训练一个<strong>轻量级分类器</strong>，判断Common Crawl文档与WebText的相似度</li>
<li>保留高相似度文档，过滤低质量内容(垃圾信息、重复内容、非自然语言等)</li>
<li>同时采用<strong>模糊去重</strong>(fuzzy deduplication)，移除与训练/验证集高度相似的文档</li>
</ol>
<p>这一策略使Common Crawl的有效利用率从原始的410B tokens降至约60B tokens(~15%的保留率)。</p>
<p><strong>数据加权策略</strong>：
GPT-3在训练时对不同数据集进行了<strong>重采样(upsampling/downsampling)</strong>：</p>
<ul>
<li>高质量数据集(WebText2、Books、Wikipedia)被<strong>上采样</strong></li>
<li>低质量但大规模的Common Crawl被<strong>下采样</strong></li>
<li>最终训练分布与原始数据分布不同，更加偏向高质量内容</li>
</ul>
<h3 id="2-3-xljcssyjscb">2.3 训练基础设施与计算成本</h3>
<p>GPT-3在<strong>V100 GPU集群</strong>上训练，具体配置推测：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>配置</th>
</tr>
</thead>
<tbody><tr>
<td>GPU类型</td>
<td>NVIDIA V100 (32GB)</td>
</tr>
<tr>
<td>GPU数量</td>
<td>~10,000</td>
</tr>
<tr>
<td>训练框架</td>
<td>自研分布式训练系统</td>
</tr>
<tr>
<td>并行策略</td>
<td>数据并行 + 模型并行 + 流水线并行</td>
</tr>
<tr>
<td>训练时间</td>
<td>数月</td>
</tr>
<tr>
<td>总计算量</td>
<td>~3.14 × 10²³ FLOPs</td>
</tr>
<tr>
<td>估计成本</td>
<td>~<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4.6</mn><mi>M</mi><mo>−</mo></mrow><annotation encoding="application/x-tex">4.6M -</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">4.6</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">−</span></span></span></span>12M(按当时云计算价格)</td>
</tr>
</tbody></table>
<p><strong>混合精度训练</strong>：</p>
<ul>
<li>GPT-3使用了<strong>FP16/FP32混合精度</strong>训练</li>
<li>权重和优化器状态保持FP32</li>
<li>前向/反向传播使用FP16加速</li>
<li>梯度缩放(Gradient Scaling)防止FP16下溢</li>
</ul>
<hr>
<h2 id="s-sxwxx-gpt-3-dhxfx">三、上下文学习：GPT-3的核心发现</h2>
<h3 id="3-1-szxxfs">3.1 三种学习范式</h3>
<p>GPT-3论文定义了三种利用预训练模型的范式：</p>
<pre><code>┌─────────────────────────────────────────────────────────────┐
│  Few-Shot(少样本)                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Translate English to French:                         │   │
│  │ chese =&gt; fromage                                     │   │
│  │ sea mer =&gt; mer                                       │   │
│  │ cardboard =&gt; carton                                  │   │
│  │ [待翻译词] =&gt; ?                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  提供10-100个示例，不更新模型参数                             │
├─────────────────────────────────────────────────────────────┤
│  One-Shot(单样本)                                          │
│  只提供1个示例                                               │
├─────────────────────────────────────────────────────────────┤
│  Zero-Shot(零样本)                                         │
│  不提供任何示例，仅任务描述                                   │
│  &quot;Translate the following English text to French: [text]&quot;   │
└─────────────────────────────────────────────────────────────┘
</code></pre>
<h3 id="3-2-gmqddyx">3.2 规模驱动的涌现</h3>
<p>GPT-3论文最震撼的发现是：<strong>上下文学习能力随模型规模涌现</strong>。</p>
<table>
<thead>
<tr>
<th>模型规模</th>
<th>参数量</th>
<th>Few-Shot性能</th>
<th>Zero-Shot性能</th>
</tr>
</thead>
<tbody><tr>
<td>Small</td>
<td>125M</td>
<td>弱</td>
<td>极弱</td>
</tr>
<tr>
<td>Medium</td>
<td>350M</td>
<td>较弱</td>
<td>弱</td>
</tr>
<tr>
<td>Large</td>
<td>760M</td>
<td>一般</td>
<td>较弱</td>
</tr>
<tr>
<td>XL</td>
<td>1.3B</td>
<td>较好</td>
<td>一般</td>
</tr>
<tr>
<td>2.7B</td>
<td>2.7B</td>
<td>好</td>
<td>较好</td>
</tr>
<tr>
<td>6.7B</td>
<td>6.7B</td>
<td>很好</td>
<td>好</td>
</tr>
<tr>
<td>13B</td>
<td>13B</td>
<td>非常好</td>
<td>很好</td>
</tr>
<tr>
<td><strong>175B</strong></td>
<td><strong>175B</strong></td>
<td><strong>接近SOTA</strong></td>
<td><strong>非常好</strong></td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：</p>
<ul>
<li>在13B以下，few-shot性能随规模近似线性增长</li>
<li>在13B到175B之间，出现<strong>超线性增长</strong>(super-linear scaling)</li>
<li>175B的GPT-3在部分任务上达到或超过当时的微调SOTA</li>
</ul>
<h3 id="3-3-yxnldrwfb">3.3 涌现能力的任务分布</h3>
<p>GPT-3的上下文学习并非在所有任务上表现一致：</p>
<p><strong>表现优异的任务类型</strong>：</p>
<ul>
<li>翻译(Translation)：英-法、英-德等</li>
<li>问答(QA)：TriviaQA、Natural Questions</li>
<li>完形填空(Cloze)：LAMBADA、HellaSwag</li>
<li>算术(Arithmetic)：加减乘除</li>
<li>单词操作(Word Scrambling)：字母重排、变位词</li>
</ul>
<p><strong>表现一般的任务类型</strong>：</p>
<ul>
<li>自然语言推理(NLI)：需要深层语义理解</li>
<li>阅读理解(Reading Comprehension)：需要长距离推理</li>
<li>常识推理(Commonsense Reasoning)：需要世界知识</li>
</ul>
<p><strong>表现较差任务类型</strong>：</p>
<ul>
<li>多步数学推理</li>
<li>需要精确事实检索的任务</li>
<li>对抗性示例</li>
</ul>
<hr>
<h2 id="s-benchmark-xnynlbj">四、Benchmark性能与能力边界</h2>
<h3 id="4-1-yyjmjz">4.1 语言建模基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>GPT-3 175B</th>
<th>当时SOTA</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>LAMBADA</td>
<td>76.2%</td>
<td>68.0%</td>
<td><strong>超越SOTA</strong></td>
</tr>
<tr>
<td>HellaSwag</td>
<td>78.9%</td>
<td>79.3%</td>
<td>接近SOTA</td>
</tr>
<tr>
<td>StoryCloze</td>
<td>83.2%</td>
<td>—</td>
<td>故事完形填空</td>
</tr>
<tr>
<td>PIQA</td>
<td>82.8%</td>
<td>79.4%</td>
<td><strong>超越SOTA</strong></td>
</tr>
</tbody></table>
<h3 id="4-2-bjwd">4.2 闭卷问答</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>GPT-3 Few-Shot</th>
<th>当时SOTA</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>Natural Questions</td>
<td>29.9%</td>
<td>44.5%</td>
<td>有差距</td>
</tr>
<tr>
<td>WebQuestions</td>
<td>41.5%</td>
<td>45.5%</td>
<td>有差距</td>
</tr>
<tr>
<td>TriviaQA</td>
<td>71.2%</td>
<td>68.0%</td>
<td><strong>超越SOTA</strong></td>
</tr>
</tbody></table>
<h3 id="4-3-fy">4.3 翻译</h3>
<table>
<thead>
<tr>
<th>语言对</th>
<th>GPT-3 Few-Shot</th>
<th>监督SOTA</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>En → Fr</td>
<td>39.2 BLEU</td>
<td>45.6</td>
<td>有差距</td>
</tr>
<tr>
<td>En → De</td>
<td>29.7 BLEU</td>
<td>50.1</td>
<td>有差距</td>
</tr>
<tr>
<td>Fr → En</td>
<td>39.2 BLEU</td>
<td>—</td>
<td>零样本最强</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>：GPT-3在<strong>资源稀缺语言对</strong>上的零样本翻译能力尤其突出，因为它不需要平行语料。</p>
<h3 id="4-4-ssnl-yxddxal">4.4 算术能力：涌现的典型案例</h3>
<p>GPT-3的算术能力展示了典型的<strong>涌现行为</strong>：</p>
<table>
<thead>
<tr>
<th>运算</th>
<th>2B模型</th>
<th>6.7B模型</th>
<th>175B模型</th>
</tr>
</thead>
<tbody><tr>
<td>2位数加法</td>
<td>~50%</td>
<td>~80%</td>
<td><strong>100%</strong></td>
</tr>
<tr>
<td>3位数加法</td>
<td>~10%</td>
<td>~30%</td>
<td><strong>98%</strong></td>
</tr>
<tr>
<td>4位数加法</td>
<td>~5%</td>
<td>~10%</td>
<td><strong>60%</strong></td>
</tr>
<tr>
<td>5位数加法</td>
<td>~0%</td>
<td>~5%</td>
<td><strong>30%</strong></td>
</tr>
<tr>
<td>2位数乘法</td>
<td>~5%</td>
<td>~20%</td>
<td><strong>50%</strong></td>
</tr>
</tbody></table>
<p><strong>涌现现象</strong>：算术能力在特定规模阈值(约13B)后突然出现，而非平滑增长。</p>
<hr>
<h2 id="w-jxxypp">五、局限性与批评</h2>
<h3 id="5-1-jgjx">5.1 结构局限</h3>
<ol>
<li><strong>单向注意力</strong>： decoder-only 架构只能 attend 到左侧上下文，限制了某些任务(如填充、改写)的表现</li>
<li><strong>固定上下文</strong>：2048 tokens的上下文限制了对长文档的理解</li>
<li><strong>无外部记忆</strong>：所有知识必须编码在参数中，无法访问实时信息</li>
</ol>
<h3 id="5-2-xnjx">5.2 性能局限</h3>
<ol>
<li><strong>常识推理薄弱</strong>：在需要深层世界知识的任务上表现不佳</li>
<li><strong>样本效率低</strong>：few-shot需要10-100个示例，人类通常只需1-2个</li>
<li><strong>分布外泛化差</strong>：在训练数据分布之外的领域性能急剧下降</li>
<li><strong>偏见与毒性</strong>：从训练数据中继承了社会偏见和有害内容</li>
</ol>
<h3 id="5-3-jsjx">5.3 计算局限</h3>
<ol>
<li><strong>推理成本高</strong>：175B模型需要大量GPU内存和计算资源</li>
<li><strong>API延迟</strong>：生成长文本时延迟显著</li>
<li><strong>无法边缘部署</strong>：模型体积过大，无法在消费级硬件上运行</li>
</ol>
<hr>
<h2 id="l-xsycyhxyj">六、学术遗产与后续演进</h2>
<h3 id="6-1-zjhy">6.1 直接后裔</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>时间</th>
<th>关系</th>
<th>改进</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-3 API</td>
<td>2020</td>
<td>商业产品化</td>
<td>公开API访问</td>
</tr>
<tr>
<td>Codex</td>
<td>2021</td>
<td>代码专用版</td>
<td>GitHub代码微调</td>
</tr>
<tr>
<td>InstructGPT</td>
<td>2022</td>
<td>+RLHF</td>
<td>指令遵循能力</td>
</tr>
<tr>
<td>ChatGPT</td>
<td>2022</td>
<td>消费级产品</td>
<td>对话优化</td>
</tr>
<tr>
<td>GPT-4</td>
<td>2023</td>
<td>下一代</td>
<td>多模态、更强推理</td>
</tr>
</tbody></table>
<h3 id="6-2-xsgj">6.2 学术跟进</h3>
<p>GPT-3发布后，全球主要AI实验室快速跟进：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>机构</th>
<th>规模</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>2021</td>
<td>Gopher</td>
<td>DeepMind</td>
<td>280B</td>
<td>更系统的Scaling研究</td>
</tr>
<tr>
<td>2022</td>
<td>PaLM</td>
<td>Google</td>
<td>540B</td>
<td>Pathways系统、更大规模</td>
</tr>
<tr>
<td>2022</td>
<td>OPT</td>
<td>Meta</td>
<td>175B</td>
<td>开源复现</td>
</tr>
<tr>
<td>2022</td>
<td>BLOOM</td>
<td>BigScience</td>
<td>176B</td>
<td>多语言、开源</td>
</tr>
<tr>
<td>2023</td>
<td>LLaMA</td>
<td>Meta</td>
<td>65B</td>
<td>更小更高效</td>
</tr>
</tbody></table>
<h3 id="6-3-gjxswt">6.3 关键学术问题</h3>
<ol>
<li><p><strong>上下文学习的机理</strong>：为什么模型能在不更新参数的情况下&quot;学习&quot;？这与梯度下降有何关系？</p>
<ul>
<li>后续研究(Xie et al., 2021; Min et al., 2022)发现ICL与隐式贝叶斯推断相关</li>
</ul>
</li>
<li><p><strong>涌现能力的本质</strong>：能力涌现是真实的还是评估指标的 artifacts？</p>
<ul>
<li>Schaeffer et al. (2023) 指出部分&quot;涌现&quot;是 metrics 非线性的结果</li>
</ul>
</li>
<li><p><strong>Scaling Law的极限</strong>：参数规模增长到何时会出现收益递减？</p>
<ul>
<li>后续研究证明Scaling Law在多个数量级上保持有效</li>
</ul>
</li>
</ol>
<hr>
<h2 id="q-xj-gpt-3-dlsdw">七、小结：GPT-3的历史定位</h2>
<p>GPT-3是大模型时代的<strong>奠基者</strong>。它证明了三个核心命题：</p>
<blockquote>
<ol>
<li><strong>规模就是力量</strong>：175B参数的Transformer可以实现前所未有的能力</li>
<li><strong>上下文学习是真实的能力</strong>：模型可以在推理时学习新任务，无需参数更新</li>
<li><strong>预训练 + 提示(Prompting)可以替代微调</strong>：对于许多任务，精心设计的prompt可以匹配甚至超越微调效果</li>
</ol>
</blockquote>
<p>GPT-3的发布不仅是一个技术里程碑，更是一个<strong>认知转折点</strong>：</p>
<ul>
<li>它让业界意识到&quot;大模型&quot;不是未来的概念，而是当下的现实</li>
<li>它催生了&quot;基础模型&quot;研究范式，改变了NLP甚至整个AI领域的研究方向</li>
<li>它为ChatGPT的爆发奠定了技术基础——没有GPT-3，就没有后来的对话AI革命</li>
</ul>
<p>GPT-3本身已被后续模型全面超越，但其揭示的Scaling Law和上下文学习范式，至今仍是现代大模型训练的基石。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.12-openai/14.12-openai">14.12-OpenAI 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.12-openai/04-instruct-gpt/05-04-instruct-gpt-rlhf-dqfsdgchkc">04-InstructGPT RLHF对齐范式的工程化开创</a></li>
<li><a href="#broken-link">06-GPT-4 MoE架构与规模训练的效率边界</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjylsyy","text":"一、发布背景与历史意义"},{"level":3,"id":"1-1-c-gpt-2-d-gpt-3-dky","text":"1.1 从GPT-2到GPT-3的跨越"},{"level":3,"id":"1-2-sxwxx-wxcsgxdrwsy","text":"1.2 上下文学习：无需参数更新的任务适应"},{"level":3,"id":"1-3-lsyx","text":"1.3 历史影响"},{"level":2,"id":"e-jgsjygmhgc","text":"二、架构设计与规模化工程"},{"level":3,"id":"2-1-transformer-jgdjzkz","text":"2.1 Transformer架构的极致扩展"},{"level":3,"id":"2-2-xlsjdzcyqx","text":"2.2 训练数据的组成与清洗"},{"level":3,"id":"2-3-xljcssyjscb","text":"2.3 训练基础设施与计算成本"},{"level":2,"id":"s-sxwxx-gpt-3-dhxfx","text":"三、上下文学习：GPT-3的核心发现"},{"level":3,"id":"3-1-szxxfs","text":"3.1 三种学习范式"},{"level":3,"id":"3-2-gmqddyx","text":"3.2 规模驱动的涌现"},{"level":3,"id":"3-3-yxnldrwfb","text":"3.3 涌现能力的任务分布"},{"level":2,"id":"s-benchmark-xnynlbj","text":"四、Benchmark性能与能力边界"},{"level":3,"id":"4-1-yyjmjz","text":"4.1 语言建模基准"},{"level":3,"id":"4-2-bjwd","text":"4.2 闭卷问答"},{"level":3,"id":"4-3-fy","text":"4.3 翻译"},{"level":3,"id":"4-4-ssnl-yxddxal","text":"4.4 算术能力：涌现的典型案例"},{"level":2,"id":"w-jxxypp","text":"五、局限性与批评"},{"level":3,"id":"5-1-jgjx","text":"5.1 结构局限"},{"level":3,"id":"5-2-xnjx","text":"5.2 性能局限"},{"level":3,"id":"5-3-jsjx","text":"5.3 计算局限"},{"level":2,"id":"l-xsycyhxyj","text":"六、学术遗产与后续演进"},{"level":3,"id":"6-1-zjhy","text":"6.1 直接后裔"},{"level":3,"id":"6-2-xsgj","text":"6.2 学术跟进"},{"level":3,"id":"6-3-gjxswt","text":"6.3 关键学术问题"},{"level":2,"id":"q-xj-gpt-3-dlsdw","text":"七、小结：GPT-3的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/03-gpt-3/05-03-gpt-3-sxwxxdgmhyxyslmx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/03-gpt-3/05-03-gpt-3-sxwxxdgmhyxyslmx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GPT-3：上下文学习的规模化涌现与算力美学</h1>
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
