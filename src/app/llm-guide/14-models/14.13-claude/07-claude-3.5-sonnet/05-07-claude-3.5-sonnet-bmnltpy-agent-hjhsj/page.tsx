"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Claude 3.5 Sonnet：编码能力突破与Agent化交互设计</h1>
<blockquote>
<p><strong>模型定位</strong>：Anthropic Claude 3.5 系列核心模型(2024-06首版 / 2024-10升级版)，编码能力业界领先，首个公开提供Computer Use能力的前沿AI
<strong>家族归属</strong>：14.13-Claude｜编号 07-Claude-3.5-Sonnet
🔙 <strong><a href="/llm-guide/14-models/14.13-claude/14.13-claude">返回 14.13-Claude 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjycpdw">一、发布背景与产品定位</h2>
<h3 id="1-1-quot-zbcydb-quot-dfcxx">1.1 &quot;中杯超越大杯&quot;的反常现象</h3>
<p>2024年6月20日，Anthropic发布Claude 3.5 Sonnet时，业界震惊的不仅是其性能，更是其<strong>定位悖论</strong>：</p>
<blockquote>
<p>一个&quot;中杯&quot;模型(Sonnet定位介于Haiku轻量版与Opus旗舰版之间)，在核心能力上全面超越了自家&quot;大杯&quot;(Claude 3 Opus)。</p>
</blockquote>
<p>这一现象打破了&quot;旗舰=最强&quot;的行业惯例，揭示了Anthropic新的产品哲学：<strong>效率-能力最优解</strong>比单纯的能力最大化更有价值。</p>
<h3 id="1-2-bbyj">1.2 版本演进</h3>
<table>
<thead>
<tr>
<th>版本</th>
<th>发布时间</th>
<th>核心改进</th>
</tr>
</thead>
<tbody><tr>
<td>Claude 3.5 Sonnet (Jun 2024)</td>
<td>2024-06-20</td>
<td>初始版本，编码能力突破</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet (Oct 2024)</td>
<td>2024-10-22</td>
<td>升级版，SWE-bench 49%，Computer Use公开beta</td>
</tr>
</tbody></table>
<p><strong>两个版本关系</strong>：Oct 2024版是Jun 2024版的直接升级，API模型名分别为<code>claude-3-5-sonnet-20240620</code>和<code>claude-3-5-sonnet-20241022</code>。</p>
<h3 id="1-3-cpdw">1.3 产品定位</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Claude 3.5 Sonnet</th>
<th>Claude 3 Opus</th>
<th>Claude 3 Haiku</th>
</tr>
</thead>
<tbody><tr>
<td>定位</td>
<td><strong>效率-能力最优</strong></td>
<td>极致能力</td>
<td>极致速度</td>
</tr>
<tr>
<td>速度</td>
<td>2x Opus</td>
<td>基准</td>
<td>5x Opus</td>
</tr>
<tr>
<td>成本</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15 per M</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span></span></span></span>75 per M</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.25</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.25/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.25/</span></span></span></span>1.25 per M</td>
</tr>
<tr>
<td>编码能力</td>
<td><strong>最强</strong></td>
<td>强</td>
<td>一般</td>
</tr>
<tr>
<td>通用推理</td>
<td>强</td>
<td><strong>最强</strong></td>
<td>一般</td>
</tr>
</tbody></table>
<hr>
<h2 id="e-bmnldtpxts">二、编码能力的突破性提升</h2>
<h3 id="2-1-benchmark-sj">2.1 Benchmark数据</h3>
<p>Claude 3.5 Sonnet在编码基准上的表现重新定义了业界标准：</p>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Claude 3.5 Sonnet (Oct)</th>
<th>Claude 3 Opus</th>
<th>GPT-4o</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>SWE-bench Verified</td>
<td><strong>49.0%</strong></td>
<td>33.4%</td>
<td>45.0%</td>
<td>真实软件工程</td>
</tr>
<tr>
<td>HumanEval</td>
<td><strong>92.0%</strong></td>
<td>84.9%</td>
<td>90.2%</td>
<td>Python函数合成</td>
</tr>
<tr>
<td>Agentic Coding (内部)</td>
<td><strong>64%</strong></td>
<td>38%</td>
<td>—</td>
<td>多步编码任务</td>
</tr>
<tr>
<td>BIG-Bench-Hard</td>
<td><strong>93.1%</strong></td>
<td>—</td>
<td>—</td>
<td>复杂推理</td>
</tr>
</tbody></table>
<p><strong>SWE-bench Verified的意义</strong>：</p>
<ul>
<li>SWE-bench(Jimenez et al., 2023)是测试LLM解决真实GitHub Issue的基准</li>
<li>&quot;Verified&quot;子集经过人工验证，确保问题描述准确、测试可靠</li>
<li>49%的解决率意味着：每2个真实GitHub Issue中，Claude 3.5 Sonnet能独立解决近1个</li>
<li>这一成绩在2024年10月时领先所有公开模型</li>
</ul>
<h3 id="2-2-bmnldgcys">2.2 编码能力的构成要素</h3>
<p>Claude 3.5 Sonnet的编码优势并非单一因素，而是<strong>多维度能力的协同</strong>：</p>
<p><strong>1. 代码理解与生成</strong></p>
<ul>
<li>准确理解自然语言描述的需求</li>
<li>生成符合语言惯例的idiomatic代码</li>
<li>正确处理边界条件和错误处理</li>
</ul>
<p><strong>2. 调试与修复</strong></p>
<ul>
<li>分析错误信息和stack trace</li>
<li>定位bug根因(而非表面症状)</li>
<li>生成修复方案并验证</li>
</ul>
<p><strong>3. 多文件上下文管理</strong></p>
<ul>
<li>在200K上下文窗口内理解大型代码库</li>
<li>追踪跨文件的函数调用和数据流</li>
<li>进行重构而不破坏现有功能</li>
</ul>
<p><strong>4. 工具使用(Tool Use)</strong></p>
<ul>
<li>调用外部工具(如代码解释器、搜索API)</li>
<li>解释执行结果并迭代改进</li>
<li>与开发环境(IDE、终端)集成</li>
</ul>
<h3 id="2-3-y-claude-3-opus-ddbfx">2.3 与 Claude 3 Opus 的对比分析</h3>
<p>为什么&quot;中杯&quot;Sonnet能在编码上超越&quot;大杯&quot;Opus？</p>
<p><strong>推测的技术原因</strong>：</p>
<ol>
<li><p><strong>训练数据配比差异</strong></p>
<ul>
<li>Sonnet可能在代码数据上进行了更高比例的训练</li>
<li>代码数据的结构化特性使其训练效率更高</li>
</ul>
</li>
<li><p><strong>架构优化</strong></p>
<ul>
<li>Sonnet可能采用了更适合代码生成的架构调整</li>
<li>如改进的注意力机制、更好的长距离依赖建模</li>
</ul>
</li>
<li><p><strong>后训练专注</strong></p>
<ul>
<li>Sonnet的RLHF/Constitutional AI可能更聚焦于编码场景</li>
<li>标注者可能包含更多专业开发者</li>
</ul>
</li>
<li><p><strong>推理效率的隐性优势</strong></p>
<ul>
<li>Sonnet的2x速度意味着在相同时间内可以生成更多候选方案</li>
<li>更快的响应改善了交互式编程体验</li>
</ul>
</li>
</ol>
<hr>
<h2 id="s-artifacts-jhfsdcx">三、Artifacts：交互范式的创新</h2>
<h3 id="3-1-c-quot-cwbdh-quot-d-quot-jghgzq-quot">3.1 从&quot;纯文本对话&quot;到&quot;结构化工作区&quot;</h3>
<p>Claude 3.5 Sonnet在Claude.ai产品中引入了<strong>Artifacts</strong>功能，这是对话AI交互范式的重大创新：</p>
<p><strong>传统对话模式</strong>：</p>
<pre><code>用户: 写一个React组件显示用户信息
AI: [生成代码块，用户需手动复制粘贴]
用户: 修改样式
AI: [生成新代码块，用户再次复制粘贴]
</code></pre>
<p><strong>Artifacts模式</strong>：</p>
<pre><code>用户: 写一个React组件显示用户信息
AI: [在侧边工作区生成可编辑的代码artifact]
用户: [直接在artifact中修改或继续对话]
AI: [实时更新artifact]
</code></pre>
<h3 id="3-2-artifact-dhxsj">3.2 Artifact的核心设计</h3>
<p>Artifacts将AI生成的内容从&quot;对话消息&quot;提升为&quot;可操作的工件&quot;：</p>
<table>
<thead>
<tr>
<th>Artifact类型</th>
<th>用途</th>
<th>交互方式</th>
</tr>
</thead>
<tbody><tr>
<td>代码</td>
<td>应用程序、脚本、函数</td>
<td>语法高亮、一键复制、版本历史</td>
</tr>
<tr>
<td>文档</td>
<td>报告、邮件、文章</td>
<td>富文本编辑、格式调整</td>
</tr>
<tr>
<td>网页</td>
<td>HTML/CSS/JS</td>
<td>实时预览、交互测试</td>
</tr>
<tr>
<td>图表</td>
<td>Mermaid、SVG</td>
<td>可视化渲染、编辑修改</td>
</tr>
</tbody></table>
<p><strong>技术意义</strong>：</p>
<ul>
<li>Artifacts打破了&quot;生成-复制-粘贴-编辑&quot;的繁琐流程</li>
<li>创建了<strong>人机协作的工作区</strong>(workspace)，而非单纯的问答界面</li>
<li>为后续的Computer Use功能奠定了基础</li>
</ul>
<h3 id="3-3-d-agent-sjdqf">3.3 对Agent设计的启发</h3>
<p>Artifacts的设计哲学深刻影响了后续AI Agent的交互设计：</p>
<ol>
<li><strong>状态可视化</strong>：Agent的中间产物应该对用户可见、可编辑</li>
<li><strong>版本控制</strong>：Artifact的修改历史应该被追踪</li>
<li><strong>工具集成</strong>：Artifact应该与外部工具(代码编辑器、浏览器)无缝衔接</li>
<li><strong>人机回环</strong>：用户可以在任何步骤介入、修改、纠正Agent的行为</li>
</ol>
<hr>
<h2 id="s-computer-use-cdhdhd">四、Computer Use：从对话到行动</h2>
<h3 id="4-1-nlgs">4.1 能力概述</h3>
<p>2024年10月，Claude 3.5 Sonnet成为<strong>首个公开提供Computer Use能力</strong>的前沿AI模型。这一功能允许AI：</p>
<ul>
<li><strong>查看屏幕</strong>：通过截图理解当前计算机界面状态</li>
<li><strong>移动鼠标</strong>：点击按钮、选择菜单、拖动滑块</li>
<li><strong>输入键盘</strong>：输入文本、快捷键操作</li>
<li><strong>等待观察</strong>：在执行操作后等待系统响应</li>
</ul>
<h3 id="4-2-jssxjg">4.2 技术实现架构</h3>
<pre><code>┌─────────────────────────────────────────┐
│           Computer Use Loop              │
│                                          │
│  1. 截图 → 视觉编码 → 模型推理           │
│         ↓                                │
│  2. 模型决定：点击/输入/等待/完成         │
│         ↓                                │
│  3. 执行操作(通过API或自动化工具)        │
│         ↓                                │
│  4. 等待系统响应                         │
│         ↓                                │
│  5. 回到步骤1                            │
└─────────────────────────────────────────┘
</code></pre>
<p><strong>关键技术挑战</strong>：</p>
<ol>
<li><p><strong>视觉理解的准确性</strong></p>
<ul>
<li>界面元素(按钮、输入框、菜单)的识别</li>
<li>动态内容(加载中、弹出窗口)的处理</li>
<li>不同分辨率、缩放比例的适配</li>
</ul>
</li>
<li><p><strong>动作决策的可靠性</strong></p>
<ul>
<li>避免误点击(如点击删除按钮)</li>
<li>处理操作失败后的恢复策略</li>
<li>在复杂界面中定位目标元素</li>
</ul>
</li>
<li><p><strong>安全边界</strong></p>
<ul>
<li>防止执行危险操作(删除文件、访问恶意网站)</li>
<li>用户授权机制(敏感操作需确认)</li>
<li>沙箱环境隔离</li>
</ul>
</li>
</ol>
<h3 id="4-3-yycjyjx">4.3 应用场景与局限</h3>
<p><strong>适用场景</strong>：</p>
<ul>
<li>网页自动化测试</li>
<li>数据录入和表格填写</li>
<li>跨应用的数据迁移</li>
<li>重复性GUI操作的自动化</li>
</ul>
<p><strong>当前局限</strong>：</p>
<ul>
<li>操作速度较慢(每步需要截图-推理-执行)</li>
<li>对复杂动态界面(如游戏、视频编辑)支持有限</li>
<li>容错能力有限，一次误操作可能导致任务失败</li>
<li>需要运行在受控环境(虚拟机/容器)中以保证安全</li>
</ul>
<hr>
<h2 id="w-constitutional-ai-yaqbz">五、Constitutional AI与安全保障</h2>
<h3 id="5-1-aqxlkj">5.1 安全训练框架</h3>
<p>Claude 3.5 Sonnet继承了Anthropic的<strong>Constitutional AI</strong>(Constitutional AI, Bai et al., 2022)安全训练框架：</p>
<p><strong>与RLHF的区别</strong>：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>RLHF(OpenAI)</th>
<th>Constitutional AI(Anthropic)</th>
</tr>
</thead>
<tbody><tr>
<td>反馈来源</td>
<td>人类标注者</td>
<td>模型自我批判 + 宪法原则</td>
</tr>
<tr>
<td>可扩展性</td>
<td>受限于人类标注规模</td>
<td>可自动扩展(模型自我改进)</td>
</tr>
<tr>
<td>透明度</td>
<td>黑盒(人类偏好)</td>
<td>原则驱动(可解释的宪法)</td>
</tr>
<tr>
<td>成本</td>
<td>高(需大量人类标注)</td>
<td>较低(主要依赖合成数据)</td>
</tr>
</tbody></table>
<p><strong>Constitutional AI的两阶段流程</strong>：</p>
<p><strong>Stage 1：Self-Critique and Revision</strong></p>
<ol>
<li>模型生成初始回答</li>
<li>模型根据&quot;宪法原则&quot;自我批判(critique)</li>
<li>模型根据批判意见修订(revision)回答</li>
<li>使用修订后的数据训练SFT模型</li>
</ol>
<p><strong>Stage 2：RL from AI Feedback (RLAIF)</strong></p>
<ol>
<li>使用AI生成的偏好数据训练RM</li>
<li>通过RL优化策略模型</li>
<li>宪法原则作为RM评估的依据</li>
</ol>
<h3 id="5-2-asl-aqfj">5.2 ASL安全分级</h3>
<p>Anthropic采用<strong>负责任扩展策略(Responsible Scaling Policy, RSP)</strong>，将模型按风险等级分为ASL(AI Safety Levels)：</p>
<table>
<thead>
<tr>
<th>等级</th>
<th>风险水平</th>
<th>要求</th>
<th>Claude 3.5 Sonnet</th>
</tr>
</thead>
<tbody><tr>
<td>ASL-1</td>
<td>最低</td>
<td>基本安全措施</td>
<td>—</td>
</tr>
<tr>
<td>ASL-2</td>
<td>中等</td>
<td>标准安全训练、红队测试</td>
<td><strong>✅ 当前等级</strong></td>
</tr>
<tr>
<td>ASL-3</td>
<td>高</td>
<td>严格的安全协议、防止滥用</td>
<td>—</td>
</tr>
<tr>
<td>ASL-4</td>
<td>极高</td>
<td>国家级安全措施</td>
<td>—</td>
</tr>
</tbody></table>
<p>Claude 3.5 Sonnet的ASL-2分类意味着：</p>
<ul>
<li>经过标准的红队测试(red teaming)</li>
<li>预部署安全评估</li>
<li>与UK AI Safety Institute合作进行独立安全验证</li>
</ul>
<h3 id="5-3-sjaqbx">5.3 实际安全表现</h3>
<table>
<thead>
<tr>
<th>安全维度</th>
<th>表现</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>越狱抵抗</td>
<td>良好</td>
<td>对常见越狱攻击有较强抵抗力</td>
</tr>
<tr>
<td>有害内容生成</td>
<td>低</td>
<td>有效拒绝危险请求</td>
</tr>
<tr>
<td>偏见</td>
<td>中等</td>
<td>仍存在一定社会偏见</td>
</tr>
<tr>
<td>幻觉</td>
<td>中等</td>
<td>知识截止2024-04，可能产生过时信息</td>
</tr>
</tbody></table>
<hr>
<h2 id="l-zhxnynlbj">六、综合性能与能力边界</h2>
<h3 id="6-1-qm-benchmark">6.1 全面Benchmark</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Claude 3.5 Sonnet</th>
<th>Claude 3 Opus</th>
<th>GPT-4o</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>90.4%</td>
<td>86.8%</td>
<td>88.7%</td>
<td>通用知识</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>—</td>
<td>—</td>
<td>—</td>
<td>高难度知识</td>
</tr>
<tr>
<td>GSM8K</td>
<td><strong>96.4%</strong></td>
<td>95.0%</td>
<td>—</td>
<td>小学数学</td>
</tr>
<tr>
<td>MATH</td>
<td>71.1%</td>
<td>—</td>
<td><strong>76.6%</strong></td>
<td>竞赛数学</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>59.4%</strong></td>
<td>50.4%</td>
<td>53.6%</td>
<td>研究生科学</td>
</tr>
<tr>
<td>HumanEval</td>
<td><strong>92.0%</strong></td>
<td>84.9%</td>
<td>90.2%</td>
<td>编程</td>
</tr>
<tr>
<td>SWE-bench Verified</td>
<td><strong>49.0%</strong></td>
<td>33.4%</td>
<td>45.0%</td>
<td>软件工程</td>
</tr>
<tr>
<td>MMMU</td>
<td>71.7%</td>
<td>59.4%</td>
<td>69.1%</td>
<td>多模态大学级</td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：</p>
<ul>
<li><strong>编码</strong>：Claude 3.5 Sonnet全面领先</li>
<li><strong>数学</strong>：GPT-4o在竞赛数学上略优</li>
<li><strong>科学推理</strong>：Claude 3.5 Sonnet在GPQA上领先</li>
<li><strong>通用知识</strong>：三者接近，Sonnet略优</li>
</ul>
<h3 id="6-2-nlbj">6.2 能力边界</h3>
<p><strong>优势领域</strong>：</p>
<ul>
<li>软件工程(编码、调试、代码审查)</li>
<li>长文档分析(200K上下文)</li>
<li>前端开发(HTML/CSS/JS生成)</li>
<li>工具使用和多步任务</li>
</ul>
<p><strong>局限领域</strong>：</p>
<ul>
<li>高级数学(MATH竞赛级)</li>
<li>实时信息(知识截止2024-04)</li>
<li>多模态生成(无图像/音频生成能力)</li>
<li>完全自主的Computer Use(仍需监督)</li>
</ul>
<hr>
<h2 id="q-gcbsystjc">七、工程部署与生态集成</h2>
<h3 id="7-1-dptbs">7.1 多平台部署</h3>
<p>Claude 3.5 Sonnet支持多个云平台：</p>
<table>
<thead>
<tr>
<th>平台</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>Anthropic API</td>
<td>官方API，最全功能</td>
</tr>
<tr>
<td>Amazon Bedrock</td>
<td>AWS集成，企业级安全</td>
</tr>
<tr>
<td>Google Cloud Vertex AI</td>
<td>GCP集成，与Google生态对接</td>
</tr>
</tbody></table>
<h3 id="7-2-sxwckdyxly">7.2 上下文窗口的有效利用</h3>
<p>200K上下文窗口的理论容量：</p>
<ul>
<li>约<strong>300页</strong>标准文本</li>
<li>约<strong>15万汉字</strong></li>
<li>大型代码库的完整源码(如中小型项目)</li>
</ul>
<p><strong>实际使用建议</strong>：</p>
<ul>
<li>使用结构化prompt(如XML标签)提高上下文利用效率</li>
<li>对长文档进行分段处理，避免关键信息被&quot;淹没&quot;</li>
<li>利用system message设定全局上下文</li>
</ul>
<hr>
<h2 id="b-xj-claude-3-5-sonnet-dhyyy">八、小结：Claude 3.5 Sonnet的行业意义</h2>
<p>Claude 3.5 Sonnet代表了大模型产品化的<strong>效率优先范式</strong>：</p>
<blockquote>
<p><strong>不是最大的模型，而是在正确的能力维度上做到最优的模型。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>编码能力的标杆</strong>：确立了AI辅助编程的新标准，直接影响GitHub Copilot、Cursor等产品的演进</li>
<li><strong>Agent交互的先锋</strong>：Artifacts和Computer Use为AI Agent的交互设计提供了范例</li>
<li><strong>效率-能力平衡</strong>：证明了&quot;中杯超越大杯&quot;的可能性，推动行业重新审视模型规模与能力的关系</li>
<li><strong>安全与能力并重</strong>：在保持ASL-2安全等级的同时实现能力突破，展示了安全与性能并非零和</li>
</ol>
<p>Claude 3.5 Sonnet的发布标志着大模型竞争从&quot;参数军备竞赛&quot;转向**&quot;场景深度优化&quot;**的新阶段。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.13-claude/14.13-claude">14.13-Claude 家族总览</a></li>
<li><a href="#broken-link">17-Claude-Opus-4.7 混合稀疏注意力与Agent编码</a></li>
<li><a href="/llm-guide/14-models/14.12-openai/09-gpt-4o/05-09-gpt-4o-ysdmtdddjgy-omni-tybs">09-GPT-4o 原生多模态端到端架构</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjycpdw","text":"一、发布背景与产品定位"},{"level":3,"id":"1-1-quot-zbcydb-quot-dfcxx","text":"1.1 &quot;中杯超越大杯&quot;的反常现象"},{"level":3,"id":"1-2-bbyj","text":"1.2 版本演进"},{"level":3,"id":"1-3-cpdw","text":"1.3 产品定位"},{"level":2,"id":"e-bmnldtpxts","text":"二、编码能力的突破性提升"},{"level":3,"id":"2-1-benchmark-sj","text":"2.1 Benchmark数据"},{"level":3,"id":"2-2-bmnldgcys","text":"2.2 编码能力的构成要素"},{"level":3,"id":"2-3-y-claude-3-opus-ddbfx","text":"2.3 与 Claude 3 Opus 的对比分析"},{"level":2,"id":"s-artifacts-jhfsdcx","text":"三、Artifacts：交互范式的创新"},{"level":3,"id":"3-1-c-quot-cwbdh-quot-d-quot-jghgzq-quot","text":"3.1 从&quot;纯文本对话&quot;到&quot;结构化工作区&quot;"},{"level":3,"id":"3-2-artifact-dhxsj","text":"3.2 Artifact的核心设计"},{"level":3,"id":"3-3-d-agent-sjdqf","text":"3.3 对Agent设计的启发"},{"level":2,"id":"s-computer-use-cdhdhd","text":"四、Computer Use：从对话到行动"},{"level":3,"id":"4-1-nlgs","text":"4.1 能力概述"},{"level":3,"id":"4-2-jssxjg","text":"4.2 技术实现架构"},{"level":3,"id":"4-3-yycjyjx","text":"4.3 应用场景与局限"},{"level":2,"id":"w-constitutional-ai-yaqbz","text":"五、Constitutional AI与安全保障"},{"level":3,"id":"5-1-aqxlkj","text":"5.1 安全训练框架"},{"level":3,"id":"5-2-asl-aqfj","text":"5.2 ASL安全分级"},{"level":3,"id":"5-3-sjaqbx","text":"5.3 实际安全表现"},{"level":2,"id":"l-zhxnynlbj","text":"六、综合性能与能力边界"},{"level":3,"id":"6-1-qm-benchmark","text":"6.1 全面Benchmark"},{"level":3,"id":"6-2-nlbj","text":"6.2 能力边界"},{"level":2,"id":"q-gcbsystjc","text":"七、工程部署与生态集成"},{"level":3,"id":"7-1-dptbs","text":"7.1 多平台部署"},{"level":3,"id":"7-2-sxwckdyxly","text":"7.2 上下文窗口的有效利用"},{"level":2,"id":"b-xj-claude-3-5-sonnet-dhyyy","text":"八、小结：Claude 3.5 Sonnet的行业意义"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-bmnltpy-agent-hjhsj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-bmnltpy-agent-hjhsj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Claude 3.5 Sonnet：编码能力突破与Agent化交互设计</h1>
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
