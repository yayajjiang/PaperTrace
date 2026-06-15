"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>11-Gemini-3.0-Pro 核心技术专题：原生多模态生成与动态推理的次世代架构</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<h2 id="y-mxdwyfbbj">一、模型定位与发布背景</h2>
<p>2025 年，Google DeepMind 正式推出 <strong>Gemini 3.0 系列</strong>，标志着 Gemini 家族进入第三代。作为 2.5 系列的继任者，Gemini 3.0 Pro 并非简单的参数扩展，而是在<strong>原生多模态生成、动态推理控制和 Agent 自主性</strong>三个维度上实现了架构级的革新。</p>
<h3 id="1-1-z-gemini-jzzdwz">1.1 在 Gemini 家族中的位置</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 2.5 Pro</th>
<th>Gemini 3.0 Pro</th>
<th>Gemini 3.1 Pro</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2025.04</td>
<td>2025 年中</td>
<td>2025 年末</td>
<td>迭代</td>
</tr>
<tr>
<td>核心优势</td>
<td>Thinking Mode</td>
<td><strong>原生多模态生成</strong></td>
<td>动态测试时计算</td>
<td>渐进升级</td>
</tr>
<tr>
<td>上下文</td>
<td>1M</td>
<td><strong>2M</strong></td>
<td>2M</td>
<td>翻倍</td>
</tr>
<tr>
<td>多模态输出</td>
<td>文本</td>
<td><strong>图像+音频+文本</strong></td>
<td>图像+音频+文本</td>
<td>质变</td>
</tr>
<tr>
<td>Agent 能力</td>
<td>强</td>
<td><strong>极强</strong></td>
<td>极强</td>
<td>升级</td>
</tr>
<tr>
<td>推理控制</td>
<td>三档调节</td>
<td><strong>动态自适应</strong></td>
<td>动态自适应</td>
<td>进化</td>
</tr>
</tbody></table>
<p>Gemini 3.0 Pro 的核心突破是**从&quot;理解多模态&quot;到&quot;生成多模态&quot;**的完整闭环——它不仅能看懂图片和视频，还能直接生成图像、音频和视频片段。</p>
<h2 id="e-ysdmtscdjsjg">二、原生多模态生成的技术架构</h2>
<h3 id="2-1-tysc-ljjg">2.1 统一生成-理解架构</h3>
<p>Gemini 2.0 Flash 已经实现了原生多模态输出(图像+音频+文本)，Gemini 3.0 Pro 将这一能力扩展到了 Pro 级别，并增加了<strong>视频生成</strong>：</p>
<pre><code>输入: 文本 / 图像 / 音频 / 视频
       ↓
[统一编码器] 所有模态编码为统一 Token 空间
       ↓
[共享 Transformer] 跨模态推理和理解
       ↓
[多模态解码器]
  ├── 文本解码器 → 文本输出
  ├── 图像解码器(扩散)→ 图像输出
  ├── 音频解码器 → 音频输出
  └── 视频解码器(新增)→ 短视频输出
</code></pre>
<h3 id="2-2-spscdjssx">2.2 视频生成的技术实现</h3>
<p>Gemini 3.0 Pro 的视频生成能力推测：</p>
<p><strong>技术路径</strong>：基于扩散模型的视频生成</p>
<pre><code>文本/图像条件 → 视频扩散模型 → 连续帧序列 → 视频输出
</code></pre>
<p><strong>关键挑战与解决方案</strong>：</p>
<ol>
<li><p><strong>时序一致性</strong>：</p>
<ul>
<li>挑战：生成视频中物体和场景需要保持帧间一致</li>
<li>解决：3D 注意力机制 + 时序一致性损失函数</li>
</ul>
</li>
<li><p><strong>长视频生成</strong>：</p>
<ul>
<li>挑战：长视频需要维持长时间的叙事连贯性</li>
<li>解决：分层生成(关键帧 → 插帧 → 细化)</li>
</ul>
</li>
<li><p><strong>与文本的同步</strong>：</p>
<ul>
<li>挑战：视频内容需要与文本描述精确对应</li>
<li>解决：交叉注意力强化 + 语义对齐损失</li>
</ul>
</li>
</ol>
<p><strong>生成能力推测</strong>：</p>
<ul>
<li>时长：数秒到数十秒</li>
<li>分辨率：720p 到 1080p</li>
<li>帧率：24-30 fps</li>
<li>控制精度：文本描述精确控制场景、动作、风格</li>
</ul>
<h3 id="2-3-yzyspscmxddb">2.3 与专用视频生成模型的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 3.0 Pro</th>
<th>Sora (OpenAI)</th>
<th>Veo (Google)</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>视频生成</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>均支持</td>
</tr>
<tr>
<td>文本理解</td>
<td><strong>极强</strong></td>
<td>强</td>
<td>中等</td>
<td>Gemini 优势</td>
</tr>
<tr>
<td>多模态输入</td>
<td><strong>全模态</strong></td>
<td>文本/图像</td>
<td>文本/图像</td>
<td>Gemini 优势</td>
</tr>
<tr>
<td>对话编辑</td>
<td><strong>支持</strong></td>
<td>有限</td>
<td>有限</td>
<td>Gemini 优势</td>
</tr>
<tr>
<td>生成质量</td>
<td>高</td>
<td><strong>极高</strong></td>
<td>高</td>
<td>Sora 略胜</td>
</tr>
<tr>
<td>实时性</td>
<td><strong>快</strong></td>
<td>慢</td>
<td>中等</td>
<td>Gemini 快</td>
</tr>
</tbody></table>
<p>Gemini 3.0 Pro 的差异化在于<strong>对话式视频生成</strong>——用户可以通过多轮对话逐步调整视频内容，而非一次性生成。</p>
<h2 id="s-dttlkz">三、动态推理控制</h2>
<h3 id="3-1-csddwjtj">3.1 从三档到无级调节</h3>
<p>Gemini 2.5 系列引入了 low/medium/high 三档推理强度，Gemini 3.0 Pro 进一步演进为<strong>动态自适应推理</strong>：</p>
<pre><code>2.5 系列: 用户手动选择 low / medium / high
3.0 系列: 模型自动判断需要的推理深度
</code></pre>
<p><strong>技术实现推测</strong>：</p>
<ol>
<li><p><strong>问题复杂度评估</strong>：
模型在接收到问题后，首先评估问题的复杂度：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Complexity</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>=</mo><mi>f</mi><mo stretchy="false">(</mo><mtext>领域</mtext><mo separator="true">,</mo><mtext>步数</mtext><mo separator="true">,</mo><mtext>不确定性</mtext><mo separator="true">,</mo><mtext>知识需求</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Complexity}(Q) = f(\\text{领域}, \\text{步数}, \\text{不确定性}, \\text{知识需求})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Complexity</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord text"><span class="mord cjk_fallback">领域</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord cjk_fallback">步数</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord cjk_fallback">不确定性</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord cjk_fallback">知识需求</span></span><span class="mclose">)</span></span></span></span></span>
</li>
<li><p><strong>动态计算预算分配</strong>：
根据复杂度自动分配推理资源：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Budget</mtext><mo>=</mo><mtext>Base</mtext><mo>+</mo><mi>α</mi><mo>×</mo><mtext>Complexity</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Budget} = \\text{Base} + \\alpha \\times \\text{Complexity}(Q)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Budget</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord">Base</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Complexity</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span></span></span></span></span>
</li>
<li><p><strong>早期停止机制</strong>：
当模型达到足够置信度时提前停止推理：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Stop if </mtext><mi>P</mi><mo stretchy="false">(</mo><mtext>answer</mtext><mo stretchy="false">)</mo><mo>&gt;</mo><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\text{Stop if } P(\\text{answer}) &gt; \\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Stop if </span></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord text"><span class="mord">answer</span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span></span></li>
</ol>
<h3 id="3-2-dmttldysfp">3.2 多模态推理的预算分配</h3>
<p>对于多模态输入，Gemini 3.0 Pro 可能采用<strong>模态自适应推理</strong>：</p>
<pre><code>输入: 文本问题 + 参考图像 + 背景音频
       ↓
[模态重要性评估]
  文本: 高重要性(核心问题)
  图像: 高重要性(关键信息)
  音频: 低重要性(背景信息)
       ↓
[预算分配]
  文本推理: 40% 预算
  视觉推理: 40% 预算
  音频处理: 20% 预算
</code></pre>
<h2 id="s-2m-sxwckdgcsx">四、2M 上下文窗口的工程实现</h2>
<h3 id="4-1-c-1m-d-2m-dkz">4.1 从 1M 到 2M 的扩展</h3>
<p>Gemini 3.0 Pro 将上下文窗口从 2.5 Pro 的 1M 扩展到 <strong>2M tokens</strong>：</p>
<p><strong>技术挑战</strong>：</p>
<ul>
<li>KV-Cache 显存需求翻倍</li>
<li>注意力计算复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 导致 4x 计算量增加</li>
<li>位置编码外推需要支持 2M 长度</li>
</ul>
<p><strong>推测的解决方案</strong>：</p>
<ol>
<li><p><strong>稀疏注意力(Sparse Attention)</strong>：</p>
<ul>
<li>滑动窗口 + 全局 Token 的混合注意力</li>
<li>将复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo>×</mo><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N \\times W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span></li>
</ul>
</li>
<li><p><strong>层次化上下文</strong>：</p>
<ul>
<li>近距上下文：全精度处理</li>
<li>中距上下文：压缩摘要</li>
<li>远距上下文：关键信息提取</li>
</ul>
</li>
<li><p><strong>动态 Token 丢弃</strong>：</p>
<ul>
<li>根据注意力权重动态丢弃低重要性 Token</li>
<li>保持关键信息的同时减少序列长度</li>
</ul>
</li>
</ol>
<h3 id="4-2-2m-sxwdyycj">4.2 2M 上下文的应用场景</h3>
<p>2M 上下文(约 300 万汉字或 500 万英文单词)可以容纳：</p>
<ul>
<li><strong>整部长篇小说</strong>(如《红楼梦》全文约 100 万字)</li>
<li><strong>大型代码库</strong>(如 Chromium 浏览器源码)</li>
<li><strong>多部电影的字幕和分析</strong></li>
<li><strong>数百份法律文件的综合分析</strong></li>
</ul>
<h2 id="w-agent-zzxdzq">五、Agent 自主性的增强</h2>
<h3 id="5-1-cgjsydzzgh">5.1 从工具使用到自主规划</h3>
<p>Gemini 3.0 Pro 的 Agent 能力相比 2.5 系列有显著提升：</p>
<p><strong>2.5 系列 Agent</strong>：</p>
<ul>
<li>响应用户指令调用工具</li>
<li>单步或少数几步的工具调用</li>
</ul>
<p><strong>3.0 系列 Agent</strong>：</p>
<ul>
<li><strong>自主目标设定</strong>：根据用户模糊意图自主确定具体目标</li>
<li><strong>长期规划</strong>：制定数十步的执行计划</li>
<li><strong>自我监控</strong>：监控执行进度，发现偏差时自我修正</li>
<li><strong>结果验证</strong>：验证任务完成质量，必要时返工</li>
</ul>
<h3 id="5-2-dmt-agent-gzl">5.2 多模态 Agent 工作流</h3>
<p>Gemini 3.0 Pro 的 Agent 可以处理复杂的多模态任务：</p>
<p><strong>示例：制作产品宣传视频</strong></p>
<pre><code>用户: &quot;为我的新产品制作一个 30 秒的宣传视频&quot;

Agent 工作流:
1. [搜索] 了解产品特点和目标受众
2. [规划] 制定视频脚本和分镜
3. [生成] 生成场景图像和人物
4. [生成] 生成背景音乐和旁白
5. [生成] 合成视频片段
6. [评估] 检查视频质量和品牌一致性
7. [迭代] 根据评估结果调整
8. [输出] 交付最终视频
</code></pre>
<p>所有步骤都在模型内部完成，无需调用外部工具(除初始信息搜索外)。</p>
<h2 id="l-yjpdcyh">六、与竞品的差异化</h2>
<h3 id="6-1-y-gpt-4o-gpt-5-ddb">6.1 与 GPT-4o / GPT-5 的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 3.0 Pro</th>
<th>GPT-4o</th>
<th>推测 GPT-5</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>视频生成</td>
<td><strong>原生支持</strong></td>
<td>❌</td>
<td>可能支持</td>
<td>Gemini 领先</td>
</tr>
<tr>
<td>上下文</td>
<td><strong>2M</strong></td>
<td>128K</td>
<td>可能 1M+</td>
<td>Gemini 领先</td>
</tr>
<tr>
<td>多模态输出</td>
<td>图像+音频+视频</td>
<td>图像+音频</td>
<td>可能全模态</td>
<td>接近</td>
</tr>
<tr>
<td>Agent 自主性</td>
<td><strong>强</strong></td>
<td>中等</td>
<td>可能强</td>
<td>Gemini 领先</td>
</tr>
<tr>
<td>生态集成</td>
<td>Google 全家桶</td>
<td>OpenAI 生态</td>
<td>OpenAI 生态</td>
<td>各有优势</td>
</tr>
</tbody></table>
<h3 id="6-2-y-claude-4-ddb">6.2 与 Claude 4 的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 3.0 Pro</th>
<th>Claude 4</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>多模态生成</td>
<td><strong>原生全模态</strong></td>
<td>文本为主</td>
<td>Gemini 领先</td>
</tr>
<tr>
<td>推理深度</td>
<td>强</td>
<td><strong>极强</strong></td>
<td>Claude 胜</td>
</tr>
<tr>
<td>安全性</td>
<td>中等</td>
<td><strong>高</strong></td>
<td>Claude 胜</td>
</tr>
<tr>
<td>编码能力</td>
<td>强</td>
<td><strong>强</strong></td>
<td>接近</td>
</tr>
<tr>
<td>价格</td>
<td>中等</td>
<td>高</td>
<td>Gemini 便宜</td>
</tr>
</tbody></table>
<h2 id="q-jxxywlzw">七、局限性与未来展望</h2>
<h3 id="7-1-yzjx">7.1 已知局限</h3>
<ol>
<li><strong>视频生成质量</strong>：可能不及专用视频生成模型(如 Sora、Veo)</li>
<li><strong>推理深度</strong>：在极端复杂推理上可能不如专用推理模型</li>
<li><strong>安全控制</strong>：多模态生成带来了新的安全风险(深度伪造)</li>
<li><strong>计算成本</strong>：2M 上下文和视频生成消耗大量算力</li>
<li><strong>生态锁定</strong>：最佳体验依赖 Google 云服务</li>
</ol>
<h3 id="7-2-yjfx">7.2 演进方向</h3>
<ul>
<li><strong>3.1 Pro</strong>：引入动态测试时计算，根据任务复杂度自动分配推理资源</li>
<li><strong>更长视频</strong>：从数秒扩展到数分钟的视频生成</li>
<li><strong>实时交互</strong>：更低的延迟，支持实时多模态对话</li>
<li><strong>个性化</strong>：学习用户偏好，生成个性化内容</li>
</ul>
<h2 id="b-zj">八、总结</h2>
<p>Gemini 3.0 Pro 代表了 Google DeepMind 在<strong>统一多模态 AI</strong>方向上的重要里程碑——它首次将原生图像、音频、视频生成能力整合到 Pro 级别模型中，实现了从&quot;理解世界&quot;到&quot;创造世界&quot;的跨越。</p>
<p>核心技术创新：</p>
<ol>
<li><strong>原生多模态生成</strong>：统一架构支持文本、图像、音频、视频的生成，打破了&quot;理解多模态&quot;和&quot;生成多模态&quot;之间的壁垒</li>
<li><strong>动态自适应推理</strong>：从固定档位到无级调节，模型自主判断需要的推理深度</li>
<li><strong>2M 上下文窗口</strong>：两倍于前代的上下文容量，解锁了整本书、大型代码库的分析场景</li>
<li><strong>多模态 Agent 自主性</strong>：可以自主规划并执行复杂的多模态创作任务</li>
</ol>
<p>Gemini 3.0 Pro 的启示在于：<strong>多模态的终极形态不是&quot;能看懂多种模态&quot;，而是&quot;能在多种模态间自由转换和创造&quot;</strong>。当 AI 可以像人类一样，用文字描述生成图像，用图像启发写出故事，用故事脚本生成视频，真正的&quot;通用人工智能&quot;就不再遥远。Gemini 3.0 Pro 正在将这一愿景变为现实——一次一个模态的跨越。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxdwyfbbj","text":"一、模型定位与发布背景"},{"level":3,"id":"1-1-z-gemini-jzzdwz","text":"1.1 在 Gemini 家族中的位置"},{"level":2,"id":"e-ysdmtscdjsjg","text":"二、原生多模态生成的技术架构"},{"level":3,"id":"2-1-tysc-ljjg","text":"2.1 统一生成-理解架构"},{"level":3,"id":"2-2-spscdjssx","text":"2.2 视频生成的技术实现"},{"level":3,"id":"2-3-yzyspscmxddb","text":"2.3 与专用视频生成模型的对比"},{"level":2,"id":"s-dttlkz","text":"三、动态推理控制"},{"level":3,"id":"3-1-csddwjtj","text":"3.1 从三档到无级调节"},{"level":3,"id":"3-2-dmttldysfp","text":"3.2 多模态推理的预算分配"},{"level":2,"id":"s-2m-sxwckdgcsx","text":"四、2M 上下文窗口的工程实现"},{"level":3,"id":"4-1-c-1m-d-2m-dkz","text":"4.1 从 1M 到 2M 的扩展"},{"level":3,"id":"4-2-2m-sxwdyycj","text":"4.2 2M 上下文的应用场景"},{"level":2,"id":"w-agent-zzxdzq","text":"五、Agent 自主性的增强"},{"level":3,"id":"5-1-cgjsydzzgh","text":"5.1 从工具使用到自主规划"},{"level":3,"id":"5-2-dmt-agent-gzl","text":"5.2 多模态 Agent 工作流"},{"level":2,"id":"l-yjpdcyh","text":"六、与竞品的差异化"},{"level":3,"id":"6-1-y-gpt-4o-gpt-5-ddb","text":"6.1 与 GPT-4o / GPT-5 的对比"},{"level":3,"id":"6-2-y-claude-4-ddb","text":"6.2 与 Claude 4 的对比"},{"level":2,"id":"q-jxxywlzw","text":"七、局限性与未来展望"},{"level":3,"id":"7-1-yzjx","text":"7.1 已知局限"},{"level":3,"id":"7-2-yjfx","text":"7.2 演进方向"},{"level":2,"id":"b-zj","text":"八、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/11-gemini-3.0-pro/05-11-gemini-3.0-pro-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/11-gemini-3.0-pro/05-11-gemini-3.0-pro-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">11-Gemini-3.0-Pro 核心技术专题：原生多模态生成与动态推理的次世代架构</h1>
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
