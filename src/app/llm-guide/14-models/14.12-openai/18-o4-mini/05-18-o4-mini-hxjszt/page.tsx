"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>18-o4-mini 核心技术专题：视觉推理能力与轻量推理模型的工程升级</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<h2 id="y-fbbjycpdw">一、发布背景与产品定位</h2>
<p>2025 年 4 月 14 日, 与 GPT-4.1 同时发布的还有 <strong>o4-mini</strong>——OpenAI 最新的轻量推理模型。o4-mini 不仅是 o3-mini 的直接继任者, 更是 OpenAI 推理模型系列的<strong>重大进化</strong>：它是首款在轻量推理模型中支持<strong>原生视觉推理</strong>的 o 系列模型。</p>
<h3 id="1-1-o-xldcpyj">1.1 o 系列的产品演进</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>参数规模</th>
<th>视觉</th>
<th>核心特性</th>
</tr>
</thead>
<tbody><tr>
<td>o1</td>
<td>2024.09</td>
<td>大</td>
<td>❌</td>
<td>首个推理模型</td>
</tr>
<tr>
<td>o1-mini</td>
<td>2024.09</td>
<td>小</td>
<td>❌</td>
<td>轻量推理</td>
</tr>
<tr>
<td>o3-mini</td>
<td>2025.01</td>
<td>小</td>
<td>❌</td>
<td>推理强度调节</td>
</tr>
<tr>
<td>o3</td>
<td>2024.12</td>
<td>大</td>
<td>❌</td>
<td>审议式对齐</td>
</tr>
<tr>
<td><strong>o4-mini</strong></td>
<td><strong>2025.04</strong></td>
<td><strong>小</strong></td>
<td><strong>✅</strong></td>
<td><strong>视觉+推理</strong></td>
</tr>
</tbody></table>
<p>o4-mini 的发布标志着 OpenAI 推理模型的<strong>多模态化</strong>——推理不再局限于纯文本, 而是可以基于视觉信息进行复杂推理。</p>
<h3 id="1-2-y-o3-mini-ddjdb">1.2 与 o3-mini 的代际对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>o3-mini</th>
<th>o4-mini</th>
<th>变化</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2024</td>
<td>86.5%</td>
<td><strong>92.8%</strong></td>
<td>↑ 6.3%</td>
</tr>
<tr>
<td>AIME 2025</td>
<td>低</td>
<td><strong>93.4%</strong></td>
<td>新增</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>77.0%</td>
<td><strong>86.5%</strong></td>
<td>↑ 9.5%</td>
</tr>
<tr>
<td>Codeforces Elo</td>
<td>2073</td>
<td><strong>2257</strong></td>
<td>↑ 184</td>
</tr>
<tr>
<td>视觉推理</td>
<td>❌</td>
<td><strong>✅</strong></td>
<td>质变</td>
</tr>
<tr>
<td>价格/1M 输入</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.10</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">1.10 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.10∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>1.10**</td>
<td>持平</td>
<td></td>
</tr>
</tbody></table>
<p>o4-mini 在<strong>保持相同价格</strong>的前提下, 实现了推理能力的显著提升, 并新增了视觉推理能力。</p>
<h2 id="e-sjtl-o-xldzb">二、视觉推理：o 系列的质变</h2>
<h3 id="2-1-smssjtl">2.1 什么是视觉推理？</h3>
<p>视觉推理(Visual Reasoning)是指模型能够：</p>
<ol>
<li><strong>理解图像内容</strong>：识别图像中的物体、文字、图表</li>
<li><strong>基于视觉信息进行推理</strong>：<ul>
<li>&quot;这个几何题的图形中, 三角形 ABC 的角度是多少？&quot;</li>
<li>&quot;根据这张实验数据图, 结论是什么？&quot;</li>
<li>&quot;这段代码截图中的 Bug 在哪里？&quot;</li>
</ul>
</li>
<li><strong>生成基于视觉的结论</strong>：综合图像和文本信息给出答案</li>
</ol>
<h3 id="2-2-o4-mini-sjtldjssx">2.2 o4-mini 视觉推理的技术实现</h3>
<p>o4-mini 的视觉推理架构推测：</p>
<pre><code>图像输入 → 视觉编码器 → 图像 Token
                              ↓
文本输入 → 文本 Tokenizer → 文本 Token → 拼接 → 推理 Transformer
                              ↓
                    [Thinking Mode 激活]
                              ↓
                    生成内部推理链(含视觉分析)
                              ↓
                    输出最终答案
</code></pre>
<p><strong>关键技术点</strong>：</p>
<ol>
<li><p><strong>视觉-文本联合推理链</strong>：
传统的 Thinking Mode 只处理文本 Token, o4-mini 的推理链中<strong>穿插了视觉 Token</strong>：</p>
<pre><code>[思考] 用户上传了一张几何题图片
[思考] 图片显示：直角三角形, 直角边分别为 3 和 4
[思考] 需要求斜边长度
[思考] 应用勾股定理: c² = a² + b² = 9 + 16 = 25
[思考] c = 5
[答案] 斜边长度为 5
</code></pre>
</li>
<li><p><strong>视觉注意力机制</strong>：
在推理过程中, 模型可以&quot;回看&quot;图像的特定区域：</p>
<pre><code>[思考] 让我再仔细看看图形的标注...
[视觉注意力] 聚焦于角度标注区域
[思考] 标注显示这个角是 60°
</code></pre>
</li>
<li><p><strong>多图推理</strong>：
o4-mini 支持在多张图像之间进行关联推理：</p>
<ul>
<li>&quot;对比这两张图表, 趋势有何不同？&quot;</li>
<li>&quot;根据第一张图的实验设置和第二张图的结果, 结论是什么？&quot;</li>
</ul>
</li>
</ol>
<h3 id="2-3-sjtldjzbx">2.3 视觉推理的基准表现</h3>
<p>虽然 OpenAI 未公布详细的视觉推理基准, 但基于社区测试：</p>
<table>
<thead>
<tr>
<th>任务类型</th>
<th>o3-mini</th>
<th>o4-mini</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>几何题(含图)</td>
<td>N/A</td>
<td><strong>高准确率</strong></td>
<td>新增能力</td>
</tr>
<tr>
<td>图表数据分析</td>
<td>N/A</td>
<td><strong>强</strong></td>
<td>新增能力</td>
</tr>
<tr>
<td>代码截图调试</td>
<td>N/A</td>
<td><strong>强</strong></td>
<td>新增能力</td>
</tr>
<tr>
<td>科学实验图</td>
<td>N/A</td>
<td><strong>强</strong></td>
<td>新增能力</td>
</tr>
<tr>
<td>纯文本推理</td>
<td>86.5% AIME</td>
<td><strong>92.8% AIME</strong></td>
<td>持续提升</td>
</tr>
</tbody></table>
<h2 id="s-tlnldcxts">三、推理能力的持续提升</h2>
<h3 id="3-1-aime-92-8-dlcb">3.1 AIME 92.8% 的里程碑</h3>
<p>o4-mini 在 <strong>AIME 2024</strong> 上达到了 <strong>92.8%</strong> 的准确率, 在 <strong>AIME 2025</strong> 上达到 <strong>93.4%</strong>：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME 2024</th>
<th>AIME 2025</th>
<th>GPQA Diamond</th>
</tr>
</thead>
<tbody><tr>
<td>o1</td>
<td>74.3%</td>
<td>-</td>
<td>77.0%</td>
</tr>
<tr>
<td>o3-mini (high)</td>
<td>86.5%</td>
<td>-</td>
<td>77.0%</td>
</tr>
<tr>
<td>o3</td>
<td>~96%</td>
<td>-</td>
<td>~87%</td>
</tr>
<tr>
<td><strong>o4-mini</strong></td>
<td><strong>92.8%</strong></td>
<td><strong>93.4%</strong></td>
<td><strong>86.5%</strong></td>
</tr>
</tbody></table>
<p>o4-mini 的推理能力已经接近 o3 的水平, 但价格仅为 o3 的 <strong>~5%</strong>。</p>
<h3 id="3-2-codeforces-2257-elo">3.2 Codeforces 2257 Elo</h3>
<p>o4-mini 在 Codeforces 竞赛编程上达到了 <strong>2257 Elo</strong>：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>Codeforces Elo</th>
<th>百分位</th>
</tr>
</thead>
<tbody><tr>
<td>o3-mini (high)</td>
<td>2073</td>
<td>~99.5%</td>
</tr>
<tr>
<td>Claude 3.7 Sonnet</td>
<td>1650</td>
<td>~98%</td>
</tr>
<tr>
<td><strong>o4-mini</strong></td>
<td><strong>2257</strong></td>
<td><strong>~99.9%</strong></td>
</tr>
</tbody></table>
<p>2257 Elo 意味着 o4-mini 在竞赛编程上超越了 <strong>99.9%</strong> 的人类选手。</p>
<h3 id="3-3-tlnltsdjsly">3.3 推理能力提升的技术来源</h3>
<p>o4-mini 相比 o3-mini 的推理能力提升可能来自：</p>
<ol>
<li><p><strong>更大的推理模型蒸馏</strong>：
以 o3(或内部更大的推理模型)作为教师, 进行更彻底的知识蒸馏：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>d</mi><mi>i</mi><mi>s</mi><mi>t</mi><mi>i</mi><mi>l</mi><mi>l</mi></mrow></msub><mo>=</mo><mo>−</mo><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>P</mi><mrow><mi>t</mi><mi>e</mi><mi>a</mi><mi>c</mi><mi>h</mi><mi>e</mi><mi>r</mi></mrow></msub><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo><mi>log</mi><mo>⁡</mo><msub><mi>P</mi><mrow><mi>s</mi><mi>t</mi><mi>u</mi><mi>d</mi><mi>e</mi><mi>n</mi><mi>t</mi></mrow></msub><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{distill} = -\\sum_i P_{teacher}(i) \\log P_{student}(i)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mclose">)</span></span></span></span></span>
</li>
<li><p><strong>更优质的训练数据</strong>：</p>
<ul>
<li>更多高质量数学竞赛题(AIME、IMO、Putnam)</li>
<li>更多竞赛编程题解(Codeforces、AtCoder)</li>
<li>更多科学推理问题(GPQA、PhD-level QA)</li>
</ul>
</li>
<li><p><strong>视觉推理的协同效应</strong>：
视觉信息可能帮助模型更好地理解问题：</p>
<ul>
<li>几何题中的图形提供直观理解</li>
<li>科学题中的图表辅助数据分析</li>
<li>代码截图提供上下文信息</li>
</ul>
</li>
</ol>
<h2 id="s-low-medium-high-tlqdtj">四、low/medium/high 推理强度调节</h2>
<h3 id="4-1-sdtjdyxyyh">4.1 三档调节的延续与优化</h3>
<p>o4-mini 继承了 o3-mini 的 <strong>low/medium/high</strong> 三档推理强度调节：</p>
<table>
<thead>
<tr>
<th>档位</th>
<th>AIME 得分</th>
<th>思考 Token 预算</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td>low</td>
<td>~75%</td>
<td>~2K tokens</td>
<td>简单数学、日常推理</td>
</tr>
<tr>
<td>medium</td>
<td>~92%</td>
<td>~8K tokens</td>
<td>竞赛数学、编程</td>
</tr>
<tr>
<td>high</td>
<td>~95%+</td>
<td>~16K tokens</td>
<td>研究级问题、复杂证明</td>
</tr>
</tbody></table>
<h3 id="4-2-sjtldcbkz">4.2 视觉推理的成本控制</h3>
<p>视觉推理增加了额外的计算成本：</p>
<ul>
<li>图像编码：每张图像需要 ~256-1024 个视觉 Token</li>
<li>视觉-文本交叉注意力：增加了注意力计算的复杂度</li>
</ul>
<p>o4-mini 可能采用了以下成本优化：</p>
<ol>
<li><p><strong>视觉 Token 压缩</strong>：
对高分辨率图像进行降采样, 减少视觉 Token 数量</p>
</li>
<li><p><strong>选择性视觉处理</strong>：
根据问题类型决定是否进行深度视觉分析：</p>
<ul>
<li>纯文本问题：跳过视觉编码</li>
<li>图像相关问题：激活视觉处理</li>
</ul>
</li>
<li><p><strong>缓存优化</strong>：
在多轮对话中, 图像的 KV-Cache 可以复用</p>
</li>
</ol>
<h2 id="w-yycjygcsj">五、应用场景与工程实践</h2>
<h3 id="5-1-hjyycj">5.1 黄金应用场景</h3>
<p><strong>场景一：数学竞赛辅导</strong></p>
<ul>
<li>学生上传几何题图片</li>
<li>o4-mini 分析图形、识别已知条件、逐步推理求解</li>
<li>展示完整的思考过程, 教育价值高</li>
</ul>
<p><strong>场景二：科学研究辅助</strong></p>
<ul>
<li>上传实验数据图表</li>
<li>o4-mini 分析数据趋势、识别异常、提出假设</li>
<li>辅助科研人员快速理解实验结果</li>
</ul>
<p><strong>场景三：代码审查(截图版)</strong></p>
<ul>
<li>上传代码截图或 IDE 界面</li>
<li>o4-mini 识别代码结构、发现 Bug、建议修复</li>
<li>特别适用于移动端或无法直接复制代码的场景</li>
</ul>
<p><strong>场景四：多模态考试辅导</strong></p>
<ul>
<li>上传试卷图片(含文字、公式、图形)</li>
<li>o4-mini 综合理解所有信息并给出解答</li>
</ul>
<h3 id="5-2-kfzjr">5.2 开发者接入</h3>
<pre><code class="language-python">from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model=&quot;o4-mini&quot;,
    reasoning_effort=&quot;high&quot;,  # low / medium / high
    messages=[
        {
            &quot;role&quot;: &quot;user&quot;,
            &quot;content&quot;: [
                {&quot;type&quot;: &quot;image_url&quot;, &quot;image_url&quot;: {&quot;url&quot;: &quot;data:image/png;base64,...&quot;}},
                {&quot;type&quot;: &quot;text&quot;, &quot;text&quot;: &quot;求解这道几何题&quot;}
            ]
        }
    ]
)
</code></pre>
<h2 id="l-jxxywlzw">六、局限性与未来展望</h2>
<h3 id="6-1-yzjx">6.1 已知局限</h3>
<ol>
<li><strong>视觉推理精度</strong>：在复杂视觉场景(如模糊图像、手写公式)上仍可能出错</li>
<li><strong>推理深度上限</strong>：作为轻量模型, 极端复杂问题仍可能&quot;思考不足&quot;</li>
<li><strong>知识截止</strong>：训练数据截止较早, 对最新研究不了解</li>
<li><strong>创意任务</strong>：在非推理任务(如创意写作)上表现一般</li>
<li><strong>多语言</strong>：非英语推理任务表现可能有下降</li>
</ol>
<h3 id="6-2-y-o3-dcj">6.2 与 o3 的差距</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>o4-mini(high)</th>
<th>o3</th>
<th>差距</th>
</tr>
</thead>
<tbody><tr>
<td>AIME</td>
<td>95%+</td>
<td>~96%</td>
<td>接近</td>
</tr>
<tr>
<td>GPQA</td>
<td>86.5%</td>
<td>~87%</td>
<td>接近</td>
</tr>
<tr>
<td>ARC-AGI</td>
<td>低分段</td>
<td><strong>75.7%</strong></td>
<td>显著</td>
</tr>
</tbody></table>
<p>在<strong>ARC-AGI</strong>(抽象推理挑战)上, o3 完整版通过高计算配置达到了 75.7%, o4-mini 可能无法达到这一水平。这说明在需要极高抽象推理能力的任务上, 模型规模仍然重要。</p>
<h3 id="6-3-wlyjfx">6.3 未来演进方向</h3>
<ul>
<li><strong>o4(完整版)</strong>：更大规模的推理模型, 进一步提升推理深度</li>
<li><strong>多模态扩展</strong>：支持音频、视频输入的推理</li>
<li><strong>工具推理</strong>：在推理过程中调用代码执行、搜索等工具</li>
<li><strong>实时推理</strong>：更低的延迟, 支持实时交互场景</li>
</ul>
<h2 id="q-zj">七、总结</h2>
<p>o4-mini 代表了 OpenAI 推理模型系列的<strong>多模态进化</strong>——它证明了轻量模型不仅可以进行深度推理, 还可以基于视觉信息进行复杂推理。</p>
<p>核心技术创新：</p>
<ol>
<li><strong>视觉-文本联合推理</strong>：在 Thinking Mode 中引入视觉 Token, 实现真正的多模态推理</li>
<li><strong>推理能力的持续提升</strong>：AIME 92.8%、Codeforces 2257 Elo, 接近旗舰推理模型水平</li>
<li><strong>成本可控的推理强度</strong>：low/medium/high 三档调节, 适应不同复杂度任务</li>
<li><strong>极致性价比</strong>：\$1.10/1M 的价格, 提供接近 o3 的推理能力</li>
</ol>
<p>o4-mini 的启示在于：<strong>推理能力的民主化正在加速</strong>。从 o1 的高价到 o4-mini 的平价, 从纯文本到多模态, 推理模型正在从&quot;实验室工具&quot;变为&quot;日常基础设施&quot;。对于教育、科研、工程等领域, o4-mini 的出现意味着<strong>高质量的推理辅助</strong>不再昂贵——这可能会深刻改变这些领域的工作方式。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjycpdw","text":"一、发布背景与产品定位"},{"level":3,"id":"1-1-o-xldcpyj","text":"1.1 o 系列的产品演进"},{"level":3,"id":"1-2-y-o3-mini-ddjdb","text":"1.2 与 o3-mini 的代际对比"},{"level":2,"id":"e-sjtl-o-xldzb","text":"二、视觉推理：o 系列的质变"},{"level":3,"id":"2-1-smssjtl","text":"2.1 什么是视觉推理？"},{"level":3,"id":"2-2-o4-mini-sjtldjssx","text":"2.2 o4-mini 视觉推理的技术实现"},{"level":3,"id":"2-3-sjtldjzbx","text":"2.3 视觉推理的基准表现"},{"level":2,"id":"s-tlnldcxts","text":"三、推理能力的持续提升"},{"level":3,"id":"3-1-aime-92-8-dlcb","text":"3.1 AIME 92.8% 的里程碑"},{"level":3,"id":"3-2-codeforces-2257-elo","text":"3.2 Codeforces 2257 Elo"},{"level":3,"id":"3-3-tlnltsdjsly","text":"3.3 推理能力提升的技术来源"},{"level":2,"id":"s-low-medium-high-tlqdtj","text":"四、low/medium/high 推理强度调节"},{"level":3,"id":"4-1-sdtjdyxyyh","text":"4.1 三档调节的延续与优化"},{"level":3,"id":"4-2-sjtldcbkz","text":"4.2 视觉推理的成本控制"},{"level":2,"id":"w-yycjygcsj","text":"五、应用场景与工程实践"},{"level":3,"id":"5-1-hjyycj","text":"5.1 黄金应用场景"},{"level":3,"id":"5-2-kfzjr","text":"5.2 开发者接入"},{"level":2,"id":"l-jxxywlzw","text":"六、局限性与未来展望"},{"level":3,"id":"6-1-yzjx","text":"6.1 已知局限"},{"level":3,"id":"6-2-y-o3-dcj","text":"6.2 与 o3 的差距"},{"level":3,"id":"6-3-wlyjfx","text":"6.3 未来演进方向"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/18-o4-mini/05-18-o4-mini-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/18-o4-mini/05-18-o4-mini-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">18-o4-mini 核心技术专题：视觉推理能力与轻量推理模型的工程升级</h1>
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
