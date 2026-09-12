"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemini 2.5 Pro：思考模式与多模态推理的工程化实现</h1>
<blockquote>
<p><strong>模型定位</strong>：Google DeepMind 首个引入显式思考模式(Thinking Mode)的旗舰模型(2025-03)，Gemini系列推理能力的突破者
<strong>家族归属</strong>：14.11-Gemini｜编号 08-Gemini-2.5-Pro
🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjyzldw">一、发布背景与战略定位</h2>
<h3 id="1-1-google-d-quot-tlfj-quot">1.1 Google的&quot;推理反击&quot;</h3>
<p>2024年底至2025年初，OpenAI的o系列(o1、o3)和DeepSeek-R1在推理模型领域占据主导地位。Google虽然拥有Gemini 1.5 Pro的长上下文优势和Gemini 2.0的多模态输出能力，但在**显式推理(Explicit Reasoning)**赛道缺乏有力产品。</p>
<p>Gemini 2.5 Pro的发布标志着Google的&quot;推理反击&quot;：</p>
<blockquote>
<p><strong>不是简单地追赶，而是将推理能力与Google的多模态、长上下文传统优势结合。</strong></p>
</blockquote>
<h3 id="1-2-cpdw">1.2 产品定位</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 2.5 Pro</th>
<th>Gemini 2.0 Pro</th>
<th>Gemini 1.5 Pro</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>发布</td>
<td>2025-03</td>
<td>2024-12</td>
<td>2024-02</td>
<td>—</td>
</tr>
<tr>
<td>推理</td>
<td><strong>Thinking Mode</strong></td>
<td>标准</td>
<td>标准</td>
<td>核心差异</td>
</tr>
<tr>
<td>上下文</td>
<td>1M (计划2M)</td>
<td>2M</td>
<td>1M-2M</td>
<td>保持领先</td>
</tr>
<tr>
<td>多模态</td>
<td>输入+输出</td>
<td><strong>原生输出</strong></td>
<td>仅输入</td>
<td>继承2.0能力</td>
</tr>
<tr>
<td>定价</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.25</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">1.25/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.25/</span></span></span></span>10</td>
<td>—</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.5</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3.5/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.5/</span></span></span></span>10.5</td>
<td>更具竞争力</td>
</tr>
</tbody></table>
<p><strong>战略意图</strong>：以<strong>更低价格</strong>提供<strong>推理+多模态+长上下文</strong>的组合，与OpenAI的o系列形成差异化竞争。</p>
<hr>
<h2 id="e-skms-thinking-mode-djssx">二、思考模式(Thinking Mode)的技术实现</h2>
<h3 id="2-1-quot-deep-think-quot-gemini-dlssw">2.1 &quot;Deep Think&quot;：Gemini的链式思维</h3>
<p>Gemini 2.5 Pro的核心创新是<strong>Thinking Mode</strong>(又称&quot;Deep Think&quot;)，允许模型在生成最终答案前进行显式的多步推理：</p>
<pre><code>用户输入
    ↓
[思考阶段] ──→ 模型生成内部推理链(CoT)
    ↓
[回答阶段] ──→ 基于推理链生成最终答案
    ↓
输出给用户
</code></pre>
<p><strong>与OpenAI o系列的对比</strong>：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 2.5 Pro Thinking</th>
<th>OpenAI o1/o3</th>
</tr>
</thead>
<tbody><tr>
<td>思考可见性</td>
<td><strong>用户可见</strong>(可选择)</td>
<td>隐藏(Hidden CoT)</td>
</tr>
<tr>
<td>思考控制</td>
<td>用户可开关</td>
<td>自动进行</td>
</tr>
<tr>
<td>思考深度</td>
<td>可调节</td>
<td>固定(模型决定)</td>
</tr>
<tr>
<td>多模态思考</td>
<td><strong>支持</strong>(视频/图像+文本推理)</td>
<td>仅文本(o1)/多模态(o3)</td>
</tr>
<tr>
<td>上下文长度</td>
<td><strong>1M tokens</strong></td>
<td>128K-200K</td>
</tr>
</tbody></table>
<p><strong>关键差异</strong>：Gemini 2.5 Pro的Thinking Mode是<strong>可见且可控的</strong>，用户可以选择：</p>
<ul>
<li>开启Thinking Mode进行深度推理</li>
<li>关闭Thinking Mode进行快速响应</li>
<li>查看模型的思考过程以验证推理逻辑</li>
</ul>
<h3 id="2-2-skmsdxlfftc">2.2 思考模式的训练方法推测</h3>
<p>Google未公开Thinking Mode的完整训练细节，但基于行业最佳实践推测：</p>
<p><strong>1. 推理数据构建</strong></p>
<ul>
<li>收集/生成包含详细推理过程的训练数据</li>
<li>数据类型：数学证明、代码调试、科学推理、逻辑谜题</li>
<li>推理过程标注：每一步的中间结果、验证、回溯</li>
</ul>
<p><strong>2. 多阶段训练</strong></p>
<ul>
<li><strong>阶段1：SFT with CoT</strong>：在包含CoT的数据上进行监督微调</li>
<li><strong>阶段2：RL优化</strong>：使用RL(可能是PPO或类似算法)优化推理质量</li>
<li><strong>阶段3：多模态推理</strong>：将推理能力扩展到视觉和音频模态</li>
</ul>
<p><strong>3. 测试时计算扩展</strong></p>
<ul>
<li>模型在推理时可以生成更长的思考链</li>
<li>思考链长度与问题复杂度自适应</li>
<li>可能采用best-of-N或beam search在推理时选择最优路径</li>
</ul>
<h3 id="2-3-kjskgcdgcjz">2.3 可见思考过程的工程价值</h3>
<p>Gemini 2.5 Pro的<strong>可见思考</strong>设计具有重要工程价值：</p>
<table>
<thead>
<tr>
<th>价值</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>可解释性</td>
<td>用户可以理解模型为什么给出某个答案</td>
</tr>
<tr>
<td>错误诊断</td>
<td>当答案错误时，可通过思考过程定位推理断点</td>
</tr>
<tr>
<td>教育价值</td>
<td>展示人类可理解的解题/推理步骤</td>
</tr>
<tr>
<td>信任建立</td>
<td>透明推理增强用户对模型输出的信任</td>
</tr>
<tr>
<td>调试辅助</td>
<td>开发者可通过思考过程优化prompt</td>
</tr>
</tbody></table>
<hr>
<h2 id="s-dmttl-kmtdlssw">三、多模态推理：跨模态的链式思维</h2>
<h3 id="3-1-sptlnl">3.1 视频推理能力</h3>
<p>Gemini 2.5 Pro在<strong>视频理解</strong>上达到业界领先：</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemini 2.5 Pro</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>VideoMME</td>
<td><strong>84.8%</strong></td>
<td>视频多模态理解</td>
</tr>
<tr>
<td>长视频分析</td>
<td>支持1小时+视频</td>
<td>结合1M上下文</td>
</tr>
</tbody></table>
<p><strong>视频推理的典型场景</strong>：</p>
<ol>
<li>输入：1小时教学视频</li>
<li>思考：模型分析视频内容、提取关键知识点、建立时间线</li>
<li>输出：结构化课程大纲、重点摘要、知识点关联图</li>
</ol>
<h3 id="3-2-yptlnl">3.2 音频推理能力</h3>
<p>Gemini 2.5 Pro支持<strong>原生音频输出</strong>，可生成24种语言的语音：</p>
<p><strong>音频推理场景</strong>：</p>
<ul>
<li>分析播客内容并生成摘要</li>
<li>识别多说话人对话中的关键信息</li>
<li>将音频内容与其他模态(文本、图像)关联推理</li>
</ul>
<h3 id="3-3-kmttljg">3.3 跨模态推理架构</h3>
<pre><code>┌─────────────────────────────────────────┐
│      Gemini 2.5 Pro Multimodal Reasoning │
│                                          │
│   文本输入 ──┐                           │
│   图像输入 ──┼──→ 统一编码 ──→ Thinking ──→ 输出
│   视频输入 ──┤      (多模态token)   (推理链)   (文本/音频/图像)
│   音频输入 ──┘                           │
│                                          │
│   思考过程：跨模态信息整合               │
│   &quot;根据图像中的图表和音频中的解释...&quot;     │
└─────────────────────────────────────────┘
</code></pre>
<hr>
<h2 id="s-benchmark-xnyhydw">四、Benchmark性能与行业地位</h2>
<h3 id="4-1-zhtljz">4.1 综合推理基准</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Gemini 2.5 Pro</th>
<th>o3</th>
<th>Claude Opus 4.5</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>Humanity&#39;s Last Exam</td>
<td><strong>18.8%</strong></td>
<td>—</td>
<td>—</td>
<td>极难综合考试</td>
</tr>
<tr>
<td>AIME 2025</td>
<td><strong>86.7%</strong></td>
<td>—</td>
<td>—</td>
<td>数学竞赛</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>84%</strong></td>
<td>87.7%</td>
<td>—</td>
<td>研究生科学</td>
</tr>
<tr>
<td>MMLU PRO</td>
<td>86.2%</td>
<td>—</td>
<td>88.9%</td>
<td>高难度知识</td>
</tr>
<tr>
<td>SWE-bench Verified</td>
<td>63.8%</td>
<td>71.7%</td>
<td>—</td>
<td>软件工程</td>
</tr>
<tr>
<td>WebDev Arena</td>
<td><strong>1415 ELO (#1)</strong></td>
<td>—</td>
<td>—</td>
<td>网页开发</td>
</tr>
<tr>
<td>Chatbot Arena</td>
<td>1398</td>
<td>1412</td>
<td>1466</td>
<td>人类偏好</td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：</p>
<ul>
<li>Gemini 2.5 Pro在<strong>WebDev Arena</strong>上排名第一，网页开发能力突出</li>
<li>在<strong>AIME数学竞赛</strong>和<strong>GPQA科学推理</strong>上表现优异</li>
<li>在<strong>SWE-bench</strong>上略逊于o3，但差距不大</li>
<li><strong>Humanity&#39;s Last Exam</strong>的18.8%是目前公开模型的最高水平之一</li>
</ul>
<h3 id="4-2-bcnl">4.2 编程能力</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemini 2.5 Pro</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>HumanEval</td>
<td><strong>93.1%</strong></td>
<td>Python函数合成</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>70.4%</td>
<td>实时编程</td>
</tr>
<tr>
<td>SWE-bench Verified</td>
<td>63.2-63.8%</td>
<td>真实软件工程</td>
</tr>
</tbody></table>
<p><strong>编程优势</strong>：</p>
<ul>
<li>结合1M上下文，可以理解大型代码库</li>
<li>Thinking Mode帮助模型在复杂bug修复时进行系统分析</li>
<li>WebDev Arena的#1排名证明了前端开发能力</li>
</ul>
<hr>
<h2 id="w-csxwytldjh">五、长上下文与推理的结合</h2>
<h3 id="5-1-quot-csxw-tl-quot-dxtxy">5.1 &quot;长上下文+推理&quot;的协同效应</h3>
<p>Gemini 2.5 Pro的独特优势是<strong>将百万级上下文与显式推理结合</strong>：</p>
<table>
<thead>
<tr>
<th>场景</th>
<th>传统模型</th>
<th>Gemini 2.5 Pro</th>
</tr>
</thead>
<tbody><tr>
<td>整本书分析</td>
<td>只能分段处理，丢失全局关联</td>
<td><strong>一次性放入1M上下文，全局推理</strong></td>
</tr>
<tr>
<td>长视频理解</td>
<td>仅能处理短视频片段</td>
<td><strong>1小时视频+推理分析</strong></td>
</tr>
<tr>
<td>大型代码库</td>
<td>只能分析单个文件</td>
<td><strong>整个代码库+跨文件推理</strong></td>
</tr>
<tr>
<td>多文档对比</td>
<td>需要多次API调用</td>
<td><strong>一次性放入所有文档+对比推理</strong></td>
</tr>
</tbody></table>
<h3 id="5-2-dhlz-tl">5.2 大海捞针+推理</h3>
<p>在1M上下文中，Gemini 2.5 Pro不仅能<strong>找到信息</strong>(Needle In A Haystack)，还能<strong>基于找到的信息进行推理</strong>：</p>
<p>示例：</p>
<ol>
<li>输入：一本50万字的技术手册</li>
<li>问题：&quot;根据第3章的参数设置和第7章的性能数据，分析为什么系统在高负载下会崩溃？&quot;</li>
<li>思考：模型定位第3章和第7章的相关内容 → 提取关键参数 → 建立因果关系 → 推导结论</li>
<li>输出：结构化的根因分析报告</li>
</ol>
<hr>
<h2 id="l-gcbsystjc">六、工程部署与生态集成</h2>
<h3 id="6-1-dptkyx">6.1 多平台可用性</h3>
<table>
<thead>
<tr>
<th>平台</th>
<th>功能</th>
</tr>
</thead>
<tbody><tr>
<td>Google AI Studio</td>
<td>免费试用、快速原型</td>
</tr>
<tr>
<td>Gemini API</td>
<td>生产级API访问</td>
</tr>
<tr>
<td>Vertex AI</td>
<td>企业级部署</td>
</tr>
<tr>
<td>Gemini App</td>
<td>消费者产品</td>
</tr>
</tbody></table>
<h3 id="6-2-djcl">6.2 定价策略</h3>
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
<td>Gemini 2.5 Pro</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.25</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">1.25/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.25/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>10/M</td>
<td>1M</td>
<td></td>
</tr>
<tr>
<td>Gemini 2.5 Flash</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>0.60/M</td>
<td>1M</td>
<td></td>
</tr>
<tr>
<td>o3</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">2/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>20/M</td>
<td>128K</td>
<td></td>
</tr>
<tr>
<td>Claude Opus 4.5</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5/M |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">∣</span></span></span></span>25/M</td>
<td>200K</td>
<td></td>
</tr>
</tbody></table>
<p><strong>定价洞察</strong>：Gemini 2.5 Pro的定价显著低于竞争对手，体现了Google&quot;以价换量&quot;的策略。</p>
<hr>
<h2 id="q-jxytz">七、局限与挑战</h2>
<h3 id="7-1-yzjx">7.1 已知局限</h3>
<ol>
<li><strong>思考过程冗长</strong>：复杂问题的思考链可能消耗大量token，增加成本</li>
<li><strong>速度权衡</strong>：Thinking Mode下的响应速度显著慢于标准模式</li>
<li><strong>创意任务</strong>：在创意写作、头脑风暴等任务上，思考模式可能过度分析</li>
<li><strong>多语言</strong>：虽然支持多语言，但非英语推理质量可能下降</li>
<li><strong>幻觉风险</strong>：即使在Thinking Mode下，模型仍可能产生幻觉</li>
</ol>
<h3 id="7-2-yjzmxdcj">7.2 与竞争模型的差距</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 2.5 Pro</th>
<th>领先者</th>
<th>差距</th>
</tr>
</thead>
<tbody><tr>
<td>SWE-bench</td>
<td>63.8%</td>
<td>o3 (71.7%)</td>
<td>-7.9pp</td>
</tr>
<tr>
<td>Chatbot Arena</td>
<td>1398</td>
<td>Claude Opus 4.5 (1466)</td>
<td>-68 ELO</td>
</tr>
<tr>
<td>MMLU PRO</td>
<td>86.2%</td>
<td>Claude Opus 4.5 (88.9%)</td>
<td>-2.7pp</td>
</tr>
</tbody></table>
<hr>
<h2 id="b-xj-gemini-2-5-pro-dlsdw">八、小结：Gemini 2.5 Pro的历史定位</h2>
<p>Gemini 2.5 Pro是Google DeepMind在<strong>推理时代</strong>的正式入场：</p>
<blockquote>
<p><strong>不是最早的推理模型，但是最早将推理与多模态、长上下文、低价格结合的模型。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>推理民主化</strong>：通过低定价让推理能力 accessible 给更广泛的开发者</li>
<li><strong>多模态推理标杆</strong>：证明了视频、音频推理的工程可行性</li>
<li><strong>可见思考的范式</strong>：为用户提供了理解和信任AI推理的窗口</li>
<li><strong>Google生态的AI化</strong>：为Workspace、Search、YouTube等产品提供推理引擎</li>
</ol>
<p>Gemini 2.5 Pro代表了Google在AI竞赛中的新策略：<strong>不追求单一维度的极致，而是在推理×多模态×长上下文×低价格四个维度上寻求最优平衡</strong>。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">14.11-Gemini 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.11-gemini/02-gemini-1.5-pro/05-02-gemini-1.5-pro-bwsxw-moe-ydmtcctl">02-Gemini-1.5-Pro 百万上下文MoE与多模态长程推理</a></li>
<li><a href="#broken-link">13-Gemini-3.1-Pro 原生多模态深度推理</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyzldw","text":"一、发布背景与战略定位"},{"level":3,"id":"1-1-google-d-quot-tlfj-quot","text":"1.1 Google的&quot;推理反击&quot;"},{"level":3,"id":"1-2-cpdw","text":"1.2 产品定位"},{"level":2,"id":"e-skms-thinking-mode-djssx","text":"二、思考模式(Thinking Mode)的技术实现"},{"level":3,"id":"2-1-quot-deep-think-quot-gemini-dlssw","text":"2.1 &quot;Deep Think&quot;：Gemini的链式思维"},{"level":3,"id":"2-2-skmsdxlfftc","text":"2.2 思考模式的训练方法推测"},{"level":3,"id":"2-3-kjskgcdgcjz","text":"2.3 可见思考过程的工程价值"},{"level":2,"id":"s-dmttl-kmtdlssw","text":"三、多模态推理：跨模态的链式思维"},{"level":3,"id":"3-1-sptlnl","text":"3.1 视频推理能力"},{"level":3,"id":"3-2-yptlnl","text":"3.2 音频推理能力"},{"level":3,"id":"3-3-kmttljg","text":"3.3 跨模态推理架构"},{"level":2,"id":"s-benchmark-xnyhydw","text":"四、Benchmark性能与行业地位"},{"level":3,"id":"4-1-zhtljz","text":"4.1 综合推理基准"},{"level":3,"id":"4-2-bcnl","text":"4.2 编程能力"},{"level":2,"id":"w-csxwytldjh","text":"五、长上下文与推理的结合"},{"level":3,"id":"5-1-quot-csxw-tl-quot-dxtxy","text":"5.1 &quot;长上下文+推理&quot;的协同效应"},{"level":3,"id":"5-2-dhlz-tl","text":"5.2 大海捞针+推理"},{"level":2,"id":"l-gcbsystjc","text":"六、工程部署与生态集成"},{"level":3,"id":"6-1-dptkyx","text":"6.1 多平台可用性"},{"level":3,"id":"6-2-djcl","text":"6.2 定价策略"},{"level":2,"id":"q-jxytz","text":"七、局限与挑战"},{"level":3,"id":"7-1-yzjx","text":"7.1 已知局限"},{"level":3,"id":"7-2-yjzmxdcj","text":"7.2 与竞争模型的差距"},{"level":2,"id":"b-xj-gemini-2-5-pro-dlsdw","text":"八、小结：Gemini 2.5 Pro的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/08-gemini-2.5-pro/05-08-gemini-2.5-pro-skmsydmttldgchsx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/08-gemini-2.5-pro/05-08-gemini-2.5-pro-skmsydmttldgchsx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemini 2.5 Pro：思考模式与多模态推理的工程化实现</h1>
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
