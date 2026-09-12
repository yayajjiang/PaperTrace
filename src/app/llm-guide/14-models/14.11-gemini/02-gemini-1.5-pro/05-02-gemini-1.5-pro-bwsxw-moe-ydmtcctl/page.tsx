"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemini 1.5 Pro：百万上下文MoE与多模态长程推理</h1>
<blockquote>
<p><strong>模型定位</strong>：Google DeepMind 首个百万级上下文多模态模型(2024-02)，长上下文能力的行业标杆
<strong>家族归属</strong>：14.11-Gemini｜编号 02-Gemini-1.5-Pro
<strong>核心论文</strong>：<em>Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context</em> (Reid et al., 2024)
🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjyfsyy">一、发布背景与范式意义</h2>
<h3 id="1-1-sxwcddsljyq">1.1 上下文长度的数量级跃迁</h3>
<p>在Gemini 1.5 Pro发布之前，大模型的上下文窗口竞争处于&quot;十万级&quot;：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>上下文窗口</th>
<th>里程碑</th>
</tr>
</thead>
<tbody><tr>
<td>2023-03</td>
<td>GPT-4</td>
<td>8K / 32K</td>
<td>基准</td>
</tr>
<tr>
<td>2023-07</td>
<td>Claude 2</td>
<td>100K</td>
<td>首个10万级</td>
</tr>
<tr>
<td>2023-11</td>
<td>Claude 2.1</td>
<td>200K</td>
<td>20万级</td>
</tr>
<tr>
<td>2023-11</td>
<td>GPT-4 Turbo</td>
<td>128K</td>
<td>12.8万级</td>
</tr>
<tr>
<td><strong>2024-02</strong></td>
<td><strong>Gemini 1.5 Pro</strong></td>
<td><strong>1M</strong></td>
<td><strong>首个百万级</strong></td>
</tr>
<tr>
<td>2024-05</td>
<td>Gemini 1.5 Pro</td>
<td><strong>2M</strong></td>
<td><strong>200万级</strong></td>
</tr>
</tbody></table>
<p>Gemini 1.5 Pro将上下文窗口从<strong>十万级直接提升到百万级</strong>，这不是渐进改进，而是<strong>数量级跃迁</strong>。</p>
<h3 id="1-2-ybw-token-ywzsm">1.2 一百万token意味着什么？</h3>
<table>
<thead>
<tr>
<th>内容类型</th>
<th>1M tokens ≈</th>
<th>应用场景</th>
</tr>
</thead>
<tbody><tr>
<td>文本</td>
<td>~70万汉字 / ~1500页</td>
<td>整本书、完整代码库</td>
</tr>
<tr>
<td>视频</td>
<td>~1小时(音频+字幕)</td>
<td>电影分析、课程理解</td>
</tr>
<tr>
<td>音频</td>
<td>~11小时</td>
<td>播客转录、会议记录</td>
</tr>
<tr>
<td>图像</td>
<td>~数千张高分辨率图</td>
<td>相册分析、文档批量处理</td>
</tr>
</tbody></table>
<p>这一能力从根本上改变了人机交互的粒度：从&quot;问答&quot;升级为&quot;分析&quot;。</p>
<hr>
<h2 id="e-moe-jg-xsynldph">二、MoE架构：效率与能力的平衡</h2>
<h3 id="2-1-gemini-1-5-pro-djgxz">2.1 Gemini 1.5 Pro的架构选择</h3>
<p>Gemini 1.5 Pro采用了**稀疏混合专家(Sparse Mixture-of-Experts, MoE)**架构，这是与Gemini 1.0 Ultra的关键区别：</p>
<pre><code>┌─────────────────────────────────────────┐
│         Gemini 1.5 Pro MoE架构          │
│                                          │
│  Input Tokens ──→ Router ──→ Top-K专家  │
│                    ↓                      │
│              [专家池：N个专家]            │
│                    ↓                      │
│              组合输出                     │
│                                          │
│  稀疏激活：每token只激活少数专家          │
│  总参数量大，计算量可控                    │
└─────────────────────────────────────────┘
</code></pre>
<p><strong>MoE架构的优势</strong>：</p>
<ol>
<li><strong>参数量扩展</strong>：总参数量可以达到密集模型的数倍，提升模型容量</li>
<li><strong>计算效率</strong>：每token只激活部分专家，推理计算量与密集模型相当</li>
<li><strong>专业化</strong>：不同专家可以学习不同领域/模态的知识</li>
</ol>
<p><strong>关键设计决策</strong>：</p>
<ul>
<li>Gemini 1.5 Pro的MoE架构具体参数未公开，但推测：<ul>
<li>总参数量：与Gemini 1.0 Ultra相当或更大</li>
<li>激活参数量：显著小于总参数量</li>
<li>专家数量：数十到数百个</li>
<li>Top-K：可能为1-2个专家 per token</li>
</ul>
</li>
</ul>
<h3 id="2-2-y-gemini-1-0-ultra-ddb">2.2 与Gemini 1.0 Ultra的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 1.0 Ultra</th>
<th>Gemini 1.5 Pro</th>
</tr>
</thead>
<tbody><tr>
<td>架构</td>
<td>密集Transformer</td>
<td><strong>稀疏MoE</strong></td>
</tr>
<tr>
<td>上下文窗口</td>
<td>32K</td>
<td><strong>1M-2M</strong></td>
</tr>
<tr>
<td>训练数据量</td>
<td>大</td>
<td><strong>更大</strong></td>
</tr>
<tr>
<td>多模态</td>
<td>文本+图像</td>
<td><strong>文本+图像+视频+音频</strong></td>
</tr>
<tr>
<td>效率</td>
<td>基准</td>
<td><strong>显著提升</strong></td>
</tr>
<tr>
<td>推理成本</td>
<td>高</td>
<td><strong>更低</strong></td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：Gemini 1.5 Pro用MoE架构实现了&quot;更大容量 + 更长上下文 + 更高效率&quot;的三重突破。</p>
<hr>
<h2 id="s-csxwdjssx">三、长上下文的技术实现</h2>
<h3 id="3-1-quot-dhlz-quot-cs-zlyz">3.1 &quot;大海捞针&quot;测试：质量验证</h3>
<p>Google设计了严格的Needle In A Haystack测试来验证1M上下文的质量：</p>
<p><strong>测试设计</strong>：</p>
<ol>
<li>生成1M tokens的长文本(如重复的小说段落)</li>
<li>在随机位置插入一个特定信息(&quot;针&quot;)，如&quot;The secret keyword is &#39;needle&#39;.&quot;</li>
<li>询问模型：&quot;What is the secret keyword?&quot;</li>
<li>测试不同插入位置(开头、中间、结尾、均匀分布)</li>
</ol>
<p><strong>测试结果</strong>：</p>
<ul>
<li>Gemini 1.5 Pro在1M上下文中达到<strong>99.7%的检索准确率</strong></li>
<li>即使在上下文的最深处，模型仍能准确定位信息</li>
<li>多模态版本(视频、音频)同样保持高准确率</li>
</ul>
<p><strong>技术意义</strong>：</p>
<ul>
<li>证明了1M上下文不是&quot;虚标&quot;，而是<strong>真正可用</strong></li>
<li>解决了长上下文模型的&quot;中间遗忘&quot;问题</li>
<li>为长文档分析、视频理解等应用提供了技术基础</li>
</ul>
<h3 id="3-2-csxwdjsjgtc">3.2 长上下文的技术架构推测</h3>
<p>Gemini 1.5 Pro如何在保持高效的同时支持1M+上下文？业界推测以下技术组合：</p>
<p><strong>1. 稀疏注意力机制</strong></p>
<ul>
<li>全局注意力(Global Attention)：关注整个序列的关键位置</li>
<li>局部注意力(Local Attention)：关注邻近token</li>
<li>滑动窗口(Sliding Window)：平衡全局和局部信息</li>
</ul>
<p><strong>2. 压缩与分层表示</strong></p>
<ul>
<li>早期层：细粒度token-level表示</li>
<li>深层：粗粒度chunk-level或sentence-level表示</li>
<li>通过分层压缩减少长序列的计算负担</li>
</ul>
<p><strong>3. 高效的KV Cache管理</strong></p>
<ul>
<li>分页式KV Cache(PagedAttention风格)</li>
<li>动态内存分配，按需加载</li>
<li>可能采用KV Cache压缩(如H2O、StreamingLLM)</li>
</ul>
<p><strong>4. 位置编码的外推</strong></p>
<ul>
<li>使用支持外推的位置编码(如ALiBi、RoPE with scaling)</li>
<li>使模型能处理训练时未见过的长序列</li>
</ul>
<h3 id="3-3-dmtcsxw">3.3 多模态长上下文</h3>
<p>Gemini 1.5 Pro的独特优势是<strong>多模态长上下文</strong>：</p>
<p><strong>视频理解</strong>：</p>
<ul>
<li>输入：1小时视频(约30K帧 @ 1fps采样)</li>
<li>处理：将视频帧编码为视觉token序列</li>
<li>能力：理解视频内容、回答关于视频的问题、定位特定事件</li>
</ul>
<p><strong>音频理解</strong>：</p>
<ul>
<li>输入：11小时音频</li>
<li>处理：将音频波形编码为音频token</li>
<li>能力：语音转录、说话人识别、内容摘要</li>
</ul>
<p><strong>跨模态长上下文</strong>：</p>
<ul>
<li>同时处理文本+视频+音频</li>
<li>例如：分析一个带字幕的教学视频</li>
</ul>
<hr>
<h2 id="s-sxwnxx-c-quot-syb-quot-d-quot-csxx-quot">四、上下文内学习：从&quot;少样本&quot;到&quot;从书学习&quot;</h2>
<h3 id="4-1-kalamang-yyxxsy">4.1 Kalamang语言学习实验</h3>
<p>Gemini 1.5 Pro论文中最引人注目的实验是<strong>Kalamang语言学习</strong>：</p>
<p><strong>实验设计</strong>：</p>
<ul>
<li>Kalamang是一种巴布亚新几内亚的稀有语言，使用者约200人</li>
<li>提供一本Kalamang-英语词典和语法书(约250页，放入上下文)</li>
<li>不提供任何预训练知识(Kalamang不在训练数据中)</li>
<li>测试模型是否能从上下文中学习这门新语言</li>
</ul>
<p><strong>实验结果</strong>：</p>
<ul>
<li>Gemini 1.5 Pro在Kalamang翻译任务上达到<strong>与人类学习者相当的水平</strong></li>
<li>模型能学会Kalamang的语法规则、词汇、句式结构</li>
<li>这一能力在 shorter context 的模型上无法复现</li>
</ul>
<p><strong>范式意义</strong>：</p>
<ul>
<li>证明了<strong>超长上下文可以实现真正的&quot;上下文内学习&quot;</strong></li>
<li>不是简单的pattern matching，而是deep understanding</li>
<li>为低资源语言处理、专业领域知识获取开辟了新路径</li>
</ul>
<h3 id="4-2-dmkj-in-context-learning">4.2 代码库级In-Context Learning</h3>
<p>Gemini 1.5 Pro可以在上下文中放入<strong>完整代码库</strong>(如一个中型项目)，然后：</p>
<ul>
<li>理解代码架构和模块关系</li>
<li>根据自然语言描述生成新功能</li>
<li>在代码库范围内进行重构</li>
<li>回答关于代码库的任何问题</li>
</ul>
<p>这与传统的代码AI(如GitHub Copilot)有本质区别：</p>
<ul>
<li>传统：基于文件名和当前文件局部上下文</li>
<li>Gemini 1.5 Pro：基于<strong>整个代码库</strong>的全局上下文</li>
</ul>
<hr>
<h2 id="w-benchmark-xnynlbj">五、Benchmark性能与能力边界</h2>
<h3 id="5-1-zhxn">5.1 综合性能</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Gemini 1.5 Pro</th>
<th>Gemini 1.0 Ultra</th>
<th>GPT-4</th>
<th>Claude 3 Opus</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>81.9%</td>
<td>83.7%</td>
<td>86.4%</td>
<td>86.8%</td>
<td>通用知识</td>
</tr>
<tr>
<td>MATH</td>
<td>67.7%</td>
<td>53.2%</td>
<td>52.9%</td>
<td>60.1%</td>
<td>竞赛数学</td>
</tr>
<tr>
<td>HumanEval</td>
<td>84.1%</td>
<td>74.4%</td>
<td>67.0%</td>
<td>84.9%</td>
<td>编程</td>
</tr>
<tr>
<td>MMMU</td>
<td>58.5%</td>
<td>62.4%</td>
<td>56.8%</td>
<td>59.4%</td>
<td>多模态大学级</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>93.3%</td>
<td>93.3%</td>
<td>95.3%</td>
<td>95.4%</td>
<td>常识推理</td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：</p>
<ul>
<li>Gemini 1.5 Pro在**数学(MATH)**上显著优于1.0 Ultra和GPT-4</li>
<li>在**编程(HumanEval)**上接近Claude 3 Opus</li>
<li>在**通用知识(MMLU)**上略逊于Claude 3 Opus和GPT-4</li>
</ul>
<h3 id="5-2-csxwzyjz">5.2 长上下文专用基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemini 1.5 Pro</th>
<th>竞争对手</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>Needle In A Haystack (1M)</td>
<td><strong>99.7%</strong></td>
<td>N/A</td>
<td>长上下文检索</td>
</tr>
<tr>
<td>Kalamang翻译</td>
<td><strong>人类水平</strong></td>
<td>N/A</td>
<td>上下文内语言学习</td>
</tr>
<tr>
<td>长文档QA</td>
<td>优异</td>
<td>一般</td>
<td>整书/报告理解</td>
</tr>
<tr>
<td>视频理解</td>
<td><strong>领先</strong></td>
<td>有限支持</td>
<td>1小时视频分析</td>
</tr>
</tbody></table>
<h3 id="5-3-nlbj">5.3 能力边界</h3>
<p><strong>优势领域</strong>：</p>
<ul>
<li>超长文档分析(整本书、法律卷宗)</li>
<li>视频内容理解和分析</li>
<li>代码库级推理</li>
<li>多模态长上下文(文本+图像+视频+音频)</li>
<li>上下文内语言学习</li>
</ul>
<p><strong>局限领域</strong>：</p>
<ul>
<li>通用知识(MMLU)略逊于Claude 3 Opus和GPT-4</li>
<li>实时信息(知识截止较早)</li>
<li>精确的事实检索(可能产生幻觉)</li>
<li>创意写作(相比专用模型)</li>
</ul>
<hr>
<h2 id="l-gcbsycph">六、工程部署与产品化</h2>
<h3 id="6-1-api-yj">6.1 API演进</h3>
<table>
<thead>
<tr>
<th>时间</th>
<th>里程碑</th>
</tr>
</thead>
<tbody><tr>
<td>2024-02</td>
<td>技术报告发布(1M上下文)</td>
</tr>
<tr>
<td>2024-05</td>
<td>API公开(1M上下文)</td>
</tr>
<tr>
<td>2024-06</td>
<td>上下文扩展至2M tokens</td>
</tr>
<tr>
<td>2024-09</td>
<td>集成至Google产品(Workspace等)</td>
</tr>
</tbody></table>
<h3 id="6-2-djcl">6.2 定价策略</h3>
<p>Gemini 1.5 Pro的定价体现了Google的&quot;长上下文普惠&quot;策略：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>Input</th>
<th>Output</th>
<th>上下文</th>
</tr>
</thead>
<tbody><tr>
<td>Gemini 1.5 Pro</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.5</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">3.5/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.5/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>10.5/M</td>
<td>128K</td>
<td></td>
</tr>
<tr>
<td>Gemini 1.5 Pro (128K+)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">7/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">7/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>21/M</td>
<td>1M+</td>
<td></td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">15/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>75/M</td>
<td>200K</td>
<td></td>
</tr>
<tr>
<td>GPT-4 Turbo</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">10/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>30/M</td>
<td>128K</td>
<td></td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：Gemini 1.5 Pro的定价显著低于竞争对手，尤其是长上下文场景。</p>
<h3 id="6-3-y-google-stdjc">6.3 与Google生态的集成</h3>
<p>Gemini 1.5 Pro深度集成至Google生态：</p>
<ul>
<li><strong>Google Workspace</strong>：Docs、Gmail、Slides的AI助手</li>
<li><strong>Vertex AI</strong>：企业级API平台</li>
<li><strong>Android</strong>：Pixel设备的端侧AI</li>
<li><strong>YouTube</strong>：视频内容分析</li>
<li><strong>Google Search</strong>：搜索增强(AI Overviews)</li>
</ul>
<hr>
<h2 id="q-xsyxyhybg">七、学术影响与行业变革</h2>
<h3 id="7-1-dcsxwyjdch">7.1 对长上下文研究的催化</h3>
<p>Gemini 1.5 Pro的发布直接推动了长上下文技术的研究热潮：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>进展</th>
</tr>
</thead>
<tbody><tr>
<td>2024-02</td>
<td>Gemini 1.5 Pro发布(1M)</td>
</tr>
<tr>
<td>2024-06</td>
<td>扩展至2M</td>
</tr>
<tr>
<td>2024-12</td>
<td>多家模型支持128K+上下文</td>
</tr>
<tr>
<td>2025</td>
<td>长上下文成为标准配置</td>
</tr>
</tbody></table>
<h3 id="7-2-gjxswt">7.2 关键学术问题</h3>
<ol>
<li><p><strong>上下文质量 vs 数量</strong>：更长的上下文是否意味着更好的理解？</p>
<ul>
<li>Gemini 1.5 Pro证明：在99.7%的检索准确率下，长度确实有价值</li>
</ul>
</li>
<li><p><strong>长上下文的训练成本</strong>：如何在有限的计算资源下训练长上下文模型？</p>
<ul>
<li>MoE架构 + 稀疏注意力是可行路径</li>
</ul>
</li>
<li><p><strong>多模态长上下文</strong>：不同模态的信息如何在长序列中交互？</p>
<ul>
<li>仍是开放问题，Gemini 1.5 Pro提供了初步答案</li>
</ul>
</li>
</ol>
<hr>
<h2 id="b-xj-gemini-1-5-pro-dlsdw">八、小结：Gemini 1.5 Pro的历史定位</h2>
<p>Gemini 1.5 Pro是大模型发展史上的<strong>长上下文里程碑</strong>。它证明了：</p>
<blockquote>
<p><strong>百万级上下文不仅是可能的，而且是实用的。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>重新定义上下文</strong>：从&quot;几页文档&quot;到&quot;整本书/整部电影&quot;的范式跃迁</li>
<li><strong>MoE架构验证</strong>：证明了稀疏MoE在超大规模模型中的工程可行性</li>
<li><strong>多模态统一</strong>：展示了文本+图像+视频+音频的统一处理能力</li>
<li><strong>上下文内学习</strong>：开创了&quot;从书学习&quot;的新范式</li>
</ol>
<p>Gemini 1.5 Pro后来在通用推理能力上被Claude 3 Opus和GPT-4超越，但它在长上下文和多模态长程推理上的突破，为整个行业设定了新的标准。理解Gemini 1.5 Pro，就是理解大模型如何从&quot;短文本处理器&quot;进化为&quot;长内容分析器&quot;。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">14.11-Gemini 家族总览</a></li>
<li><a href="#broken-link">13-Gemini-3.1-Pro 原生多模态深度推理</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/06-claude-3-opus/05-06-claude-3-opus-csxwtlydmtljdsztp">06-Claude-3-Opus 长上下文推理与多模态理解</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyfsyy","text":"一、发布背景与范式意义"},{"level":3,"id":"1-1-sxwcddsljyq","text":"1.1 上下文长度的数量级跃迁"},{"level":3,"id":"1-2-ybw-token-ywzsm","text":"1.2 一百万token意味着什么？"},{"level":2,"id":"e-moe-jg-xsynldph","text":"二、MoE架构：效率与能力的平衡"},{"level":3,"id":"2-1-gemini-1-5-pro-djgxz","text":"2.1 Gemini 1.5 Pro的架构选择"},{"level":3,"id":"2-2-y-gemini-1-0-ultra-ddb","text":"2.2 与Gemini 1.0 Ultra的对比"},{"level":2,"id":"s-csxwdjssx","text":"三、长上下文的技术实现"},{"level":3,"id":"3-1-quot-dhlz-quot-cs-zlyz","text":"3.1 &quot;大海捞针&quot;测试：质量验证"},{"level":3,"id":"3-2-csxwdjsjgtc","text":"3.2 长上下文的技术架构推测"},{"level":3,"id":"3-3-dmtcsxw","text":"3.3 多模态长上下文"},{"level":2,"id":"s-sxwnxx-c-quot-syb-quot-d-quot-csxx-quot","text":"四、上下文内学习：从&quot;少样本&quot;到&quot;从书学习&quot;"},{"level":3,"id":"4-1-kalamang-yyxxsy","text":"4.1 Kalamang语言学习实验"},{"level":3,"id":"4-2-dmkj-in-context-learning","text":"4.2 代码库级In-Context Learning"},{"level":2,"id":"w-benchmark-xnynlbj","text":"五、Benchmark性能与能力边界"},{"level":3,"id":"5-1-zhxn","text":"5.1 综合性能"},{"level":3,"id":"5-2-csxwzyjz","text":"5.2 长上下文专用基准"},{"level":3,"id":"5-3-nlbj","text":"5.3 能力边界"},{"level":2,"id":"l-gcbsycph","text":"六、工程部署与产品化"},{"level":3,"id":"6-1-api-yj","text":"6.1 API演进"},{"level":3,"id":"6-2-djcl","text":"6.2 定价策略"},{"level":3,"id":"6-3-y-google-stdjc","text":"6.3 与Google生态的集成"},{"level":2,"id":"q-xsyxyhybg","text":"七、学术影响与行业变革"},{"level":3,"id":"7-1-dcsxwyjdch","text":"7.1 对长上下文研究的催化"},{"level":3,"id":"7-2-gjxswt","text":"7.2 关键学术问题"},{"level":2,"id":"b-xj-gemini-1-5-pro-dlsdw","text":"八、小结：Gemini 1.5 Pro的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/02-gemini-1.5-pro/05-02-gemini-1.5-pro-bwsxw-moe-ydmtcctl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/02-gemini-1.5-pro/05-02-gemini-1.5-pro-bwsxw-moe-ydmtcctl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemini 1.5 Pro：百万上下文MoE与多模态长程推理</h1>
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
