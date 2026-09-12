"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Claude 3 Opus：长上下文推理与多模态理解的双重突破</h1>
<blockquote>
<p><strong>模型定位</strong>：Anthropic Claude 3 系列旗舰模型(2024-03)，首个在多项基准上全面超越GPT-4的Claude模型
<strong>家族归属</strong>：14.13-Claude｜编号 06-Claude-3-Opus
🔙 <strong><a href="/llm-guide/14-models/14.13-claude/14.13-claude">返回 14.13-Claude 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjyzlyy">一、发布背景与战略意义</h2>
<h3 id="1-1-claude-3-jzdscjg">1.1 Claude 3 家族的三层架构</h3>
<p>2024年3月4日，Anthropic发布Claude 3家族，首次采用<strong>三 tier 产品线</strong>：</p>
<table>
<thead>
<tr>
<th>型号</th>
<th>定位</th>
<th>速度</th>
<th>成本(Input/Output)</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Haiku</strong></td>
<td>轻量高效</td>
<td>最快</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.25</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.25/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.25/</span></span></span></span>1.25 per M</td>
<td>高吞吐量、实时响应</td>
</tr>
<tr>
<td><strong>Sonnet</strong></td>
<td>平衡之选</td>
<td>快</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15 per M</td>
<td>日常生产、企业应用</td>
</tr>
<tr>
<td><strong>Opus</strong></td>
<td>旗舰智能</td>
<td>中等</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span></span></span></span>75 per M</td>
<td>复杂推理、深度分析</td>
</tr>
</tbody></table>
<p>这一产品架构借鉴了汽车行业的 tier 策略(经济型/标准型/豪华型)，让用户根据任务复杂度选择最合适的模型，避免为简单任务支付旗舰模型的溢价。</p>
<h3 id="1-2-quot-cy-gpt-4-quot-dlcb">1.2 &quot;超越GPT-4&quot;的里程碑</h3>
<p>Claude 3 Opus发布时，Anthropic宣称其在多项基准上<strong>首次超越GPT-4</strong>(当时OpenAI的最强模型)。这一声明具有标志性意义：</p>
<ul>
<li>这是<strong>非OpenAI模型首次在综合基准上超越GPT-4</strong></li>
<li>证明了Anthropic的Constitutional AI方法论可以与OpenAI的RLHF方法论竞争</li>
<li>打破了&quot;OpenAI=最先进&quot;的市场认知</li>
</ul>
<hr>
<h2 id="e-csxwnl-200k-djssx">二、长上下文能力：200K的技术实现</h2>
<h3 id="2-1-sxwcddjzgj">2.1 上下文长度的竞争格局</h3>
<p>Claude 3 Opus发布时的上下文窗口竞争：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>上下文窗口</th>
<th>发布时间</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>8K / 32K</td>
<td>2023-03</td>
</tr>
<tr>
<td>Claude 2</td>
<td>100K</td>
<td>2023-07</td>
</tr>
<tr>
<td>Claude 2.1</td>
<td>200K</td>
<td>2023-11</td>
</tr>
<tr>
<td>GPT-4 Turbo</td>
<td>128K</td>
<td>2023-11</td>
</tr>
<tr>
<td><strong>Claude 3 Opus</strong></td>
<td><strong>200K</strong></td>
<td><strong>2024-03</strong></td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td>1M</td>
<td>2024-02</td>
</tr>
</tbody></table>
<p>Claude 3家族全系支持200K上下文，这意味着：</p>
<ul>
<li>可一次性处理约<strong>300页</strong>标准文档</li>
<li>可分析<strong>完整的中型代码库</strong></li>
<li>可进行<strong>多轮深度对话</strong>而不丢失早期上下文</li>
</ul>
<h3 id="2-2-quot-dhlz-quot-cs-csxwdzl">2.2 &quot;大海捞针&quot;测试：长上下文的质量</h3>
<p>上下文长度不仅看数字，更看<strong>质量</strong>——模型能否在长上下文中准确检索信息。</p>
<p>Anthropic的<strong>Needle In A Haystack</strong>测试：</p>
<ul>
<li>在极长文本(200K tokens)中随机插入一个关键信息(&quot;针&quot;)</li>
<li>测试模型能否在回答问题准确检索到这个信息</li>
<li>Claude 3 Opus在200K上下文中达到<strong>99%+的准确率</strong></li>
</ul>
<p><strong>技术意义</strong>：</p>
<ul>
<li>许多模型声称支持长上下文，但实际在长距离检索上表现不佳</li>
<li>Claude 3 Opus的99%+准确率证明了其长上下文不是&quot;虚标&quot;，而是<strong>真正可用</strong></li>
<li>这得益于Anthropic在位置编码和注意力机制上的优化</li>
</ul>
<h3 id="2-3-csxwdjssxtc">2.3 长上下文的技术实现推测</h3>
<p>Claude 3 Opus的长上下文能力推测基于以下技术：</p>
<p><strong>1. 改进的位置编码</strong></p>
<ul>
<li>可能采用RoPE(Rotary Position Embedding)或其变体</li>
<li>RoPE的外推能力使模型能处理训练时未见过的长序列</li>
</ul>
<p><strong>2. 稀疏注意力机制</strong></p>
<ul>
<li>全局注意力 + 局部注意力的混合</li>
<li>降低长序列的二次计算复杂度</li>
</ul>
<p><strong>3. KV Cache优化</strong></p>
<ul>
<li>高效的记忆管理，避免长序列的内存爆炸</li>
<li>可能采用分页(paging)或压缩技术</li>
</ul>
<p><strong>4. 训练时的课程学习</strong></p>
<ul>
<li>从短序列逐步扩展到长序列</li>
<li>让模型逐步适应长距离依赖</li>
</ul>
<hr>
<h2 id="s-dmtlj-sjnldtp">三、多模态理解：视觉能力的突破</h2>
<h3 id="3-1-claude-3-jzddmtsj">3.1 Claude 3 家族的多模态设计</h3>
<p>Claude 3是Anthropic<strong>首次引入视觉理解能力</strong>的模型系列。与GPT-4V的级联架构不同，Claude 3推测采用了更统一的多模态设计：</p>
<pre><code>┌─────────────────────────────────────────┐
│         Claude 3 Multimodal Input        │
│                                          │
│   Text ──┐                               │
│   Image ─┼──→ Unified Encoder ──→ LLM   │
│   PDF  ──┘                               │
│                                          │
└─────────────────────────────────────────┘
</code></pre>
<p><strong>支持的多模态输入</strong>：</p>
<ul>
<li>图像(照片、图表、截图、文档扫描件)</li>
<li>PDF文档(文本+图像混合)</li>
<li>图表和可视化数据</li>
</ul>
<p><strong>当前不支持</strong>：</p>
<ul>
<li>视频输入</li>
<li>音频输入</li>
<li>图像生成输出</li>
</ul>
<h3 id="3-2-sj-benchmark-xn">3.2 视觉Benchmark性能</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Claude 3 Opus</th>
<th>GPT-4V</th>
<th>Gemini Ultra</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU</td>
<td><strong>59.4%</strong></td>
<td>56.8%</td>
<td>62.4%</td>
<td>大学级多模态</td>
</tr>
<tr>
<td>AI2D</td>
<td>88.1%</td>
<td>—</td>
<td>—</td>
<td>科学图表理解</td>
</tr>
<tr>
<td>ChartQA</td>
<td>81.7%</td>
<td>78.5%</td>
<td>—</td>
<td>图表问答</td>
</tr>
<tr>
<td>DocVQA</td>
<td>89.3%</td>
<td>88.4%</td>
<td>—</td>
<td>文档视觉问答</td>
</tr>
<tr>
<td>MathVista</td>
<td>53.6%</td>
<td>56.8%</td>
<td>—</td>
<td>数学+视觉</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：</p>
<ul>
<li>Claude 3 Opus在MMMU(大学级多模态推理)上领先GPT-4V</li>
<li>在文档理解(DocVQA)和图表(ChartQA)上表现优异</li>
<li>在数学+视觉(MathVista)上略逊于GPT-4V</li>
</ul>
<h3 id="3-3-sjljdyycj">3.3 视觉理解的应用场景</h3>
<p><strong>1. 文档分析</strong></p>
<ul>
<li>提取扫描PDF中的文本和表格</li>
<li>理解法律文档、合同、发票的结构</li>
<li>跨页信息整合</li>
</ul>
<p><strong>2. 图表解读</strong></p>
<ul>
<li>从数据可视化中提取趋势和异常</li>
<li>将图表转换为结构化数据</li>
<li>生成基于图表的分析报告</li>
</ul>
<p><strong>3. 代码截图理解</strong></p>
<ul>
<li>从IDE截图中识别代码结构和错误</li>
<li>理解UI设计稿并生成对应代码</li>
<li>分析系统架构图</li>
</ul>
<hr>
<h2 id="s-hx-benchmark-xn">四、核心Benchmark性能</h2>
<h3 id="4-1-zhxndb">4.1 综合性能对比</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Claude 3 Opus</th>
<th>GPT-4</th>
<th>Gemini Ultra</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>86.8%</td>
<td>86.4%</td>
<td>83.7%</td>
<td>通用知识</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>68.5%</td>
<td>—</td>
<td>—</td>
<td>高难度知识</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>50.4%</strong></td>
<td>35.7%</td>
<td>—</td>
<td>研究生科学</td>
</tr>
<tr>
<td>GSM8K</td>
<td><strong>95.0%</strong></td>
<td>92.0%</td>
<td>94.4%</td>
<td>小学数学</td>
</tr>
<tr>
<td>MATH</td>
<td><strong>60.1%</strong></td>
<td>52.9%</td>
<td>53.2%</td>
<td>竞赛数学</td>
</tr>
<tr>
<td>HumanEval</td>
<td><strong>84.9%</strong></td>
<td>67.0%</td>
<td>74.4%</td>
<td>编程</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>95.4%</td>
<td>95.3%</td>
<td>93.3%</td>
<td>常识推理</td>
</tr>
<tr>
<td>BIG-Bench Hard</td>
<td>86.8%</td>
<td>83.1%</td>
<td>—</td>
<td>复杂推理</td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：</p>
<ul>
<li>Claude 3 Opus在**科学推理(GPQA)<strong>和</strong>编程(HumanEval)**上大幅领先GPT-4</li>
<li>在**通用知识(MMLU)**上两者接近</li>
<li>在**数学(GSM8K/MATH)**上显著优于GPT-4</li>
</ul>
<h3 id="4-2-dyynl">4.2 多语言能力</h3>
<p>Claude 3 Opus支持<strong>95+种语言</strong>，在多语言基准上表现：</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Claude 3 Opus</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MGSM</td>
<td>90.7%</td>
<td>多语言小学数学</td>
</tr>
<tr>
<td>MMLU (多语言)</td>
<td>86.8%</td>
<td>多语言通用知识</td>
</tr>
</tbody></table>
<p><strong>多语言训练策略推测</strong>：</p>
<ul>
<li>训练数据中包含大量多语言内容</li>
<li>使用语言无关的表示学习</li>
<li>英语能力的提升自动迁移到其他语言</li>
</ul>
<hr>
<h2 id="w-constitutional-ai-yaqxl">五、Constitutional AI与安全训练</h2>
<h3 id="5-1-claude-3-opus-daqjg">5.1 Claude 3 Opus的安全架构</h3>
<p>Claude 3 Opus继承了并发展了Anthropic的Constitutional AI框架：</p>
<p><strong>训练计算规模</strong>：</p>
<ul>
<li>比Claude 2多<strong>10倍训练计算</strong></li>
<li>使用了&quot;大规模未公开数据集&quot;</li>
<li>Constitutional AI + RLHF 联合训练</li>
</ul>
<p><strong>安全性能指标</strong>：</p>
<table>
<thead>
<tr>
<th>安全维度</th>
<th>Claude 3 Opus</th>
<th>GPT-4</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>有害请求拒绝率</td>
<td><strong>2x GPT-4</strong></td>
<td>基准</td>
<td>化学武器等</td>
</tr>
<tr>
<td>化学武器相关</td>
<td><strong>99%</strong></td>
<td>—</td>
<td>极端安全场景</td>
</tr>
<tr>
<td>对抗性输入抵抗</td>
<td><strong>80%</strong></td>
<td>—</td>
<td>越狱攻击</td>
</tr>
<tr>
<td>安全对齐率</td>
<td><strong>95%</strong></td>
<td>—</td>
<td>综合安全指标</td>
</tr>
</tbody></table>
<h3 id="5-2-yyxyaqxdph">5.2 有用性与安全性的平衡</h3>
<p>Claude 3 Opus面临的核心张力：<strong>有用性(Helpfulness)vs 安全性(Harmlessness)</strong></p>
<p><strong>过度安全的问题</strong>：</p>
<ul>
<li>模型可能过度拒绝无害请求(Over-refusal)</li>
<li>影响用户体验和实用性</li>
<li>边缘案例(edge cases)的处理困难</li>
</ul>
<p><strong>Claude 3 Opus的改进</strong>：</p>
<ul>
<li>相比Claude 2，减少了<strong>不必要的拒绝</strong></li>
<li>更好地理解用户意图的细微差别</li>
<li>在拒绝时提供更清晰的解释</li>
</ul>
<hr>
<h2 id="l-nlbjyjx">六、能力边界与局限</h2>
<h3 id="6-1-ysly">6.1 优势领域</h3>
<ul>
<li><strong>深度推理</strong>：GPQA、MATH等需要多步推理的任务</li>
<li><strong>长文档分析</strong>：200K上下文支持完整书籍、法律文档分析</li>
<li><strong>编程</strong>：HumanEval和SWE-bench上的强劲表现</li>
<li><strong>科学问答</strong>：研究生级别的科学问题(GPQA Diamond)</li>
<li><strong>多语言</strong>：95+语言的支持</li>
</ul>
<h3 id="6-2-jxly">6.2 局限领域</h3>
<ul>
<li><strong>实时信息</strong>：知识截止2023-08，无法获取最新信息</li>
<li><strong>多模态生成</strong>：仅支持图像输入，不支持图像/音频生成</li>
<li><strong>成本</strong>：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span></span></span></span>75 per M的价格限制了大规模应用</li>
<li><strong>速度</strong>：相比Haiku和Sonnet较慢，不适合实时应用</li>
<li><strong>数学极限</strong>：虽然优于GPT-4，但在竞赛级数学上仍有提升空间</li>
</ul>
<h3 id="6-3-yhxmxddb">6.3 与后续模型的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Claude 3 Opus</th>
<th>Claude 3.5 Sonnet</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>通用推理</td>
<td><strong>更强</strong></td>
<td>强</td>
<td>Opus在复杂推理上仍有优势</td>
</tr>
<tr>
<td>编码</td>
<td>强</td>
<td><strong>更强</strong></td>
<td>3.5 Sonnet编码突破</td>
</tr>
<tr>
<td>速度</td>
<td>慢</td>
<td><strong>2x更快</strong></td>
<td>Sonnet效率更高</td>
</tr>
<tr>
<td>成本</td>
<td><strong>5x更高</strong></td>
<td>低</td>
<td>Sonnet性价比更高</td>
</tr>
<tr>
<td>视觉</td>
<td>支持</td>
<td><strong>支持+Artifacts</strong></td>
<td>3.5有交互创新</td>
</tr>
</tbody></table>
<hr>
<h2 id="q-gcbsyst">七、工程部署与生态</h2>
<h3 id="7-1-api-ycpjc">7.1 API与产品集成</h3>
<p>Claude 3 Opus通过多个渠道提供服务：</p>
<table>
<thead>
<tr>
<th>渠道</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>Anthropic API</td>
<td>官方API，完整功能</td>
</tr>
<tr>
<td>Amazon Bedrock</td>
<td>AWS企业级集成</td>
</tr>
<tr>
<td>Google Cloud Vertex AI</td>
<td>GCP生态集成</td>
</tr>
<tr>
<td>Claude.ai Pro</td>
<td>消费者产品(\$20/月)</td>
</tr>
</tbody></table>
<h3 id="7-2-sxwckdyxly">7.2 上下文窗口的有效利用</h3>
<p>200K上下文的实际容量：</p>
<ul>
<li><strong>小说</strong>：约1部中篇小说的完整文本</li>
<li><strong>代码库</strong>：约5-10万行代码(取决于语言)</li>
<li><strong>法律文档</strong>：约50-100页的合同或诉状</li>
<li><strong>研究论文</strong>：约10-20篇学术论文的PDF</li>
</ul>
<p><strong>使用最佳实践</strong>：</p>
<ul>
<li>将最关键信息放在prompt的开头和结尾(中间信息易被&quot;遗忘&quot;)</li>
<li>使用结构化格式(XML、Markdown)提高信息检索效率</li>
<li>对于超长文档，先让模型生成摘要再深入分析</li>
</ul>
<hr>
<h2 id="b-xj-claude-3-opus-dlsdw">八、小结：Claude 3 Opus的历史定位</h2>
<p>Claude 3 Opus是Anthropic的<strong>技术实力宣言</strong>，它证明了：</p>
<blockquote>
<p><strong>Constitutional AI方法论可以训练出与RLHF方法论同等甚至更强的模型。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>打破垄断</strong>：首次非OpenAI模型在综合基准上超越GPT-4</li>
<li><strong>长上下文标杆</strong>：200K高质量上下文成为行业标准</li>
<li><strong>多模态入场</strong>：Anthropic正式进入多模态大模型竞争</li>
<li><strong>安全-能力并重</strong>：在提升能力的同时保持行业领先的安全标准</li>
</ol>
<p>Claude 3 Opus后来被Claude 3.5 Sonnet在编码和部分推理任务上超越，但其作为Anthropic技术巅峰的地位，以及它在长上下文和多模态理解上的突破，奠定了Claude家族后续发展的基础。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.13-claude/14.13-claude">14.13-Claude 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-bmnltpy-agent-hjhsj">07-Claude-3.5-Sonnet 编码能力突破与Agent化交互设计</a></li>
<li><a href="#broken-link">17-Claude-Opus-4.7 混合稀疏注意力与Agent编码</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyzlyy","text":"一、发布背景与战略意义"},{"level":3,"id":"1-1-claude-3-jzdscjg","text":"1.1 Claude 3 家族的三层架构"},{"level":3,"id":"1-2-quot-cy-gpt-4-quot-dlcb","text":"1.2 &quot;超越GPT-4&quot;的里程碑"},{"level":2,"id":"e-csxwnl-200k-djssx","text":"二、长上下文能力：200K的技术实现"},{"level":3,"id":"2-1-sxwcddjzgj","text":"2.1 上下文长度的竞争格局"},{"level":3,"id":"2-2-quot-dhlz-quot-cs-csxwdzl","text":"2.2 &quot;大海捞针&quot;测试：长上下文的质量"},{"level":3,"id":"2-3-csxwdjssxtc","text":"2.3 长上下文的技术实现推测"},{"level":2,"id":"s-dmtlj-sjnldtp","text":"三、多模态理解：视觉能力的突破"},{"level":3,"id":"3-1-claude-3-jzddmtsj","text":"3.1 Claude 3 家族的多模态设计"},{"level":3,"id":"3-2-sj-benchmark-xn","text":"3.2 视觉Benchmark性能"},{"level":3,"id":"3-3-sjljdyycj","text":"3.3 视觉理解的应用场景"},{"level":2,"id":"s-hx-benchmark-xn","text":"四、核心Benchmark性能"},{"level":3,"id":"4-1-zhxndb","text":"4.1 综合性能对比"},{"level":3,"id":"4-2-dyynl","text":"4.2 多语言能力"},{"level":2,"id":"w-constitutional-ai-yaqxl","text":"五、Constitutional AI与安全训练"},{"level":3,"id":"5-1-claude-3-opus-daqjg","text":"5.1 Claude 3 Opus的安全架构"},{"level":3,"id":"5-2-yyxyaqxdph","text":"5.2 有用性与安全性的平衡"},{"level":2,"id":"l-nlbjyjx","text":"六、能力边界与局限"},{"level":3,"id":"6-1-ysly","text":"6.1 优势领域"},{"level":3,"id":"6-2-jxly","text":"6.2 局限领域"},{"level":3,"id":"6-3-yhxmxddb","text":"6.3 与后续模型的对比"},{"level":2,"id":"q-gcbsyst","text":"七、工程部署与生态"},{"level":3,"id":"7-1-api-ycpjc","text":"7.1 API与产品集成"},{"level":3,"id":"7-2-sxwckdyxly","text":"7.2 上下文窗口的有效利用"},{"level":2,"id":"b-xj-claude-3-opus-dlsdw","text":"八、小结：Claude 3 Opus的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/06-claude-3-opus/05-06-claude-3-opus-csxwtlydmtljdsztp" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/06-claude-3-opus/05-06-claude-3-opus-csxwtlydmtljdsztp" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Claude 3 Opus：长上下文推理与多模态理解的双重突破</h1>
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
