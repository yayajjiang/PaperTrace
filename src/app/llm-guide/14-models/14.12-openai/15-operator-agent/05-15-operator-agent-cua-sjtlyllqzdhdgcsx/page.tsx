"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OpenAI Operator (CUA)：视觉推理与浏览器自动化的工程实现</h1>
<blockquote>
<p><strong>模型定位</strong>：OpenAI 首个自主浏览器Agent(2025-01), 基于CUA(Computer-Using Agent)模型, 业界首个大规模商用的视觉驱动网页自动化系统
<strong>家族归属</strong>：14.12-OpenAI｜编号 15-Operator-Agent
🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbj-open-ai-d-agent-rc">一、发布背景：OpenAI的Agent入场</h2>
<h3 id="1-1-c-chat-gpt-d-operator-dky">1.1 从ChatGPT到Operator的跨越</h3>
<p>2025年1月23日, OpenAI发布Operator, 标志着其从&quot;对话AI&quot;向&quot;行动AI&quot;的战略转型：</p>
<table>
<thead>
<tr>
<th>产品阶段</th>
<th>时间</th>
<th>能力</th>
<th>范式</th>
</tr>
</thead>
<tbody><tr>
<td>ChatGPT</td>
<td>2022-11</td>
<td>文本对话</td>
<td>问答</td>
</tr>
<tr>
<td>GPT-4V</td>
<td>2023-09</td>
<td>视觉理解</td>
<td>感知</td>
</tr>
<tr>
<td>GPTs/Store</td>
<td>2023-11</td>
<td>自定义助手</td>
<td>扩展</td>
</tr>
<tr>
<td><strong>Operator</strong></td>
<td><strong>2025-01</strong></td>
<td><strong>自主浏览器操作</strong></td>
<td><strong>行动</strong></td>
</tr>
</tbody></table>
<p>Operator的核心洞察：<strong>大多数网页没有API, 但都有GUI</strong>。与其让每个网站开发API, 不如让AI直接像人一样使用网页。</p>
<h3 id="1-2-cua-computer-using-agent">1.2 CUA：Computer-Using Agent</h3>
<p>Operator的底层是<strong>CUA模型</strong>, 这是OpenAI专门为GUI交互训练的新模型：</p>
<pre><code>CUA = GPT-4o视觉能力 + 强化学习推理 + GUI动作执行
</code></pre>
<p><strong>关键设计选择</strong>：</p>
<ul>
<li>不依赖网站的DOM结构或API</li>
<li>不依赖无障碍树(accessibility tree)</li>
<li>纯视觉：通过<strong>截图像素</strong>理解界面</li>
<li>通用接口：鼠标+键盘, 适用于任何GUI</li>
</ul>
<hr>
<h2 id="e-jsjg-gz-tl-hdxh">二、技术架构：感知-推理-行动循环</h2>
<h3 id="2-1-sbxh">2.1 三步循环</h3>
<p>CUA的核心是一个迭代的<strong>感知-推理-行动</strong>循环：</p>
<pre><code>┌─────────────────────────────────────────┐
│           CUA Agent Loop                 │
│                                          │
│  1. Perception(感知)                   │
│     └── 截取屏幕截图                     │
│     └── 将截图加入模型上下文             │
│              ↓                           │
│  2. Reasoning(推理)                    │
│     └── Chain-of-Thought分析当前状态     │
│     └── 评估过去动作的效果               │
│     └── 规划下一步动作                   │
│              ↓                           │
│  3. Action(行动)                       │
│     └── 点击、输入、滚动、等待           │
│     └── 敏感操作 → 请求用户确认          │
│              ↓                           │
│     任务完成? ──Yes──→ 结束              │
│        No                                │
│        ↓                                 │
│     回到Step 1                           │
└─────────────────────────────────────────┘
</code></pre>
<h3 id="2-2-gz-xsjsjlj">2.2 感知：像素级视觉理解</h3>
<p>CUA的感知模块完全依赖<strong>原始像素数据</strong>：</p>
<ul>
<li><strong>输入</strong>：当前屏幕的PNG截图</li>
<li><strong>理解</strong>：通过GPT-4o的视觉编码器分析界面布局</li>
<li><strong>识别</strong>：定位按钮、输入框、链接、菜单等交互元素</li>
<li><strong>上下文</strong>：维护历史截图序列, 追踪界面变化</li>
</ul>
<p><strong>与Anthropic Computer Use的对比</strong>：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>OpenAI CUA</th>
<th>Anthropic Computer Use</th>
</tr>
</thead>
<tbody><tr>
<td>视觉输入</td>
<td>截图</td>
<td>截图</td>
</tr>
<tr>
<td>辅助输入</td>
<td>无</td>
<td>可选 accessibility tree</td>
</tr>
<tr>
<td>动作空间</td>
<td>浏览器内</td>
<td>OS级</td>
</tr>
<tr>
<td>推理方法</td>
<td>CoT + RL</td>
<td>CoT</td>
</tr>
</tbody></table>
<h3 id="2-3-tl-lsswyzwjz">2.3 推理：链式思维与自我纠正</h3>
<p>CUA的推理模块使用<strong>显式的链式思维(Chain-of-Thought)</strong>：</p>
<pre><code>[内部独白示例]
&quot;当前页面显示搜索框在顶部中央。
我需要搜索&#39;Yosemite campsites&#39;。
搜索框在坐标(500, 200)。
我应该点击搜索框, 然后输入查询...&quot;
</code></pre>
<p><strong>自我纠正能力</strong>：</p>
<ul>
<li>如果点击了错误按钮, 从截图中发现错误</li>
<li>分析失败原因, 调整策略</li>
<li>回溯到之前的状态重新尝试</li>
</ul>
<h3 id="2-4-hd-llqncz">2.4 行动：浏览器内操作</h3>
<p>CUA支持的动作集：</p>
<table>
<thead>
<tr>
<th>动作</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><code>click(x, y)</code></td>
<td>在指定坐标点击</td>
</tr>
<tr>
<td><code>type(text)</code></td>
<td>键盘输入文本</td>
</tr>
<tr>
<td><code>scroll(x, y, direction)</code></td>
<td>在指定区域滚动</td>
</tr>
<tr>
<td><code>wait()</code></td>
<td>等待页面加载</td>
</tr>
<tr>
<td><code>goto(url)</code></td>
<td>导航到URL</td>
</tr>
<tr>
<td><code>back()</code></td>
<td>浏览器返回</td>
</tr>
<tr>
<td><code>screenshot()</code></td>
<td>截取当前屏幕</td>
</tr>
</tbody></table>
<p><strong>敏感操作的确认机制</strong>：</p>
<ul>
<li>登录信息输入 → 请求用户接管</li>
<li>支付信息 → 请求用户接管</li>
<li>CAPTCHA → 请求用户接管</li>
<li>敏感网站操作 → 主动确认</li>
</ul>
<hr>
<h2 id="s-benchmark-xn">三、Benchmark性能</h2>
<h3 id="3-1-llqrw">3.1 浏览器任务</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>CUA</th>
<th>Previous SOTA</th>
<th>人类</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><strong>WebArena</strong></td>
<td><strong>58.1%</strong></td>
<td>36.2%</td>
<td>57.1%</td>
<td>网页自动化</td>
</tr>
<tr>
<td><strong>WebVoyager</strong></td>
<td><strong>87.0%</strong></td>
<td>56.0%</td>
<td>87.0%</td>
<td>真实网站任务</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：</p>
<ul>
<li>WebArena上58.1%接近人类水平(57.1%)</li>
<li>WebVoyager上87%追平人类水平</li>
</ul>
<h3 id="3-2-jsjrw">3.2 计算机任务</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>CUA</th>
<th>Previous SOTA</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><strong>OSWorld</strong></td>
<td><strong>38.1%</strong></td>
<td>22.0%</td>
<td>通用计算机操作</td>
</tr>
</tbody></table>
<p><strong>注意</strong>：CUA在OSWorld上的表现(38.1%)优于Anthropic Computer Use(22.0%), 但CUA主要设计用于浏览器, OSWorld测试的是通用计算机操作。</p>
<h3 id="3-3-yjz-agent-ddb">3.3 与竞争Agent的对比</h3>
<table>
<thead>
<tr>
<th>Agent</th>
<th>WebArena</th>
<th>WebVoyager</th>
<th>OSWorld</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>OpenAI CUA</strong></td>
<td><strong>58.1%</strong></td>
<td><strong>87.0%</strong></td>
<td>38.1%</td>
<td>浏览器为主</td>
</tr>
<tr>
<td>Google Mariner</td>
<td>—</td>
<td>83.5%</td>
<td>—</td>
<td>10任务并行</td>
</tr>
<tr>
<td>Anthropic Computer Use</td>
<td>—</td>
<td>56.0%</td>
<td>22.0%</td>
<td>OS级操控</td>
</tr>
<tr>
<td>人类</td>
<td>57.1%</td>
<td>87.0%</td>
<td>72.4%</td>
<td>基准</td>
</tr>
</tbody></table>
<hr>
<h2 id="s-cpsjyyhty">四、产品设计与用户体验</h2>
<h3 id="4-1-operator-djhms">4.1 Operator的交互模式</h3>
<p>Operator是一个<strong>独立的网页应用</strong>(operator.chatgpt.com)：</p>
<ul>
<li>用户在Operator中描述任务</li>
<li>Operator在<strong>远程浏览器</strong>中执行任务</li>
<li>用户可以<strong>实时观看</strong>执行过程</li>
<li>随时<strong>接管控制</strong></li>
<li>支持<strong>多任务并行</strong>(多对话窗口)</li>
</ul>
<h3 id="4-2-gxhykjcz">4.2 个性化与快捷操作</h3>
<p><strong>自定义指令</strong>：</p>
<ul>
<li>全局指令：适用于所有网站</li>
<li>网站特定指令：如&quot;在Booking.com上优先选择靠窗座位&quot;</li>
</ul>
<p><strong>保存的Prompt</strong>：</p>
<ul>
<li>常用任务可保存为快捷按钮</li>
<li>如&quot;在Instacart补货&quot;、&quot;在Etsy搜索定制礼物&quot;</li>
</ul>
<h3 id="4-3-bsykyx">4.3 部署与可用性</h3>
<table>
<thead>
<tr>
<th>时间</th>
<th>可用性</th>
</tr>
</thead>
<tbody><tr>
<td>2025-01-23</td>
<td>美国ChatGPT Pro用户</td>
</tr>
<tr>
<td>2025-03-11</td>
<td>CUA模型API发布(Research Preview, Tiers 3-5)</td>
</tr>
<tr>
<td>未来</td>
<td>计划集成到ChatGPT主界面</td>
</tr>
</tbody></table>
<hr>
<h2 id="w-aqjg">五、安全架构</h2>
<h3 id="5-1-dcaqsj">5.1 多层安全设计</h3>
<p>Operator采用<strong>多层安全架构</strong>：</p>
<p><strong>Layer 1：任务级拒绝</strong></p>
<ul>
<li>拒绝执行危险任务(如购买武器、预订非法服务)</li>
<li>拒绝执行高风险金融操作</li>
</ul>
<p><strong>Layer 2：敏感操作确认</strong></p>
<ul>
<li>登录 → 用户接管</li>
<li>支付 → 用户接管</li>
<li>CAPTCHA → 用户接管</li>
<li>个人信息输入 → 用户确认</li>
</ul>
<p><strong>Layer 3：提示注入防御</strong></p>
<ul>
<li>检测网页中的隐藏恶意指令</li>
<li>防止被网页内容操纵执行有害操作</li>
</ul>
<p><strong>Layer 4：红队测试</strong></p>
<ul>
<li>测试生物武器研究请求</li>
<li>测试越狱攻击</li>
<li>测试模型自我复制能力</li>
</ul>
<h3 id="5-2-api-aqxz">5.2 API安全限制</h3>
<p>CUA API发布时的安全措施：</p>
<ul>
<li>Research Preview, 限制开发者层级</li>
<li>建议人在回路(human-in-the-loop)监督</li>
<li>浏览器沙箱环境最安全</li>
<li>本地OS环境风险更高, 需谨慎</li>
</ul>
<hr>
<h2 id="l-jxyhyyy">六、局限与行业意义</h2>
<h3 id="6-1-yzjx">6.1 已知局限</h3>
<ol>
<li><strong>浏览器限制</strong>：目前只能操作浏览器, 不能操控本地桌面应用</li>
<li><strong>视觉错误</strong>：OCR识别错误(如API密钥、比特币地址)</li>
<li><strong>文本编辑困难</strong>：在nano、VS Code等编辑器中容易出错</li>
<li><strong>速度</strong>：每步需要截图-上传-推理, 速度较慢</li>
<li><strong>复杂任务</strong>：多步复杂任务仍可能失败</li>
</ol>
<h3 id="6-2-hyyy">6.2 行业意义</h3>
<p>Operator代表了AI Agent的<strong>消费者化里程碑</strong>：</p>
<blockquote>
<p><strong>从&quot;开发者工具&quot;到&quot;普通用户产品&quot;</strong></p>
</blockquote>
<ul>
<li>Anthropic的Computer Use主要面向开发者(API)</li>
<li>Google的Mariner面向Ultra订阅者(\$249/月)</li>
<li>OpenAI的Operator面向Pro用户(\$20/月), 更易普及</li>
</ul>
<hr>
<h2 id="q-xj-operator-dlsdw">七、小结：Operator的历史定位</h2>
<p>OpenAI Operator是大模型从&quot;理解&quot;到&quot;行动&quot;的<strong>消费级产品化标志</strong>：</p>
<blockquote>
<p><strong>不是每个人都能写API集成代码, 但每个人都能描述&quot;帮我订个餐厅&quot;。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>零集成自动化</strong>：无需API, 任何网页都可自动化</li>
<li><strong>视觉Agent范式</strong>：证明了纯视觉驱动Agent的工程可行性</li>
<li><strong>安全迭代部署</strong>：通过分层确认机制降低Agent风险</li>
<li><strong>消费者普及</strong>：将AI Agent带给普通用户, 而非仅开发者</li>
</ol>
<p>Operator后来被集成到ChatGPT的&quot;Agent Mode&quot;中, 成为OpenAI Agent战略的核心产品。理解Operator, 就是理解AI如何进入日常数字生活。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.12-openai/14.12-openai">14.12-OpenAI 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.12-openai/09-gpt-4o/05-09-gpt-4o-ysdmtdddjgy-omni-tybs">09-GPT-4o 原生多模态端到端架构</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/09-claude-computer-use/05-09-claude-computer-use-sjgzqdd-gui-zdh-agent">09-Claude-Computer-Use 视觉感知驱动的GUI自动化Agent</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-open-ai-d-agent-rc","text":"一、发布背景：OpenAI的Agent入场"},{"level":3,"id":"1-1-c-chat-gpt-d-operator-dky","text":"1.1 从ChatGPT到Operator的跨越"},{"level":3,"id":"1-2-cua-computer-using-agent","text":"1.2 CUA：Computer-Using Agent"},{"level":2,"id":"e-jsjg-gz-tl-hdxh","text":"二、技术架构：感知-推理-行动循环"},{"level":3,"id":"2-1-sbxh","text":"2.1 三步循环"},{"level":3,"id":"2-2-gz-xsjsjlj","text":"2.2 感知：像素级视觉理解"},{"level":3,"id":"2-3-tl-lsswyzwjz","text":"2.3 推理：链式思维与自我纠正"},{"level":3,"id":"2-4-hd-llqncz","text":"2.4 行动：浏览器内操作"},{"level":2,"id":"s-benchmark-xn","text":"三、Benchmark性能"},{"level":3,"id":"3-1-llqrw","text":"3.1 浏览器任务"},{"level":3,"id":"3-2-jsjrw","text":"3.2 计算机任务"},{"level":3,"id":"3-3-yjz-agent-ddb","text":"3.3 与竞争Agent的对比"},{"level":2,"id":"s-cpsjyyhty","text":"四、产品设计与用户体验"},{"level":3,"id":"4-1-operator-djhms","text":"4.1 Operator的交互模式"},{"level":3,"id":"4-2-gxhykjcz","text":"4.2 个性化与快捷操作"},{"level":3,"id":"4-3-bsykyx","text":"4.3 部署与可用性"},{"level":2,"id":"w-aqjg","text":"五、安全架构"},{"level":3,"id":"5-1-dcaqsj","text":"5.1 多层安全设计"},{"level":3,"id":"5-2-api-aqxz","text":"5.2 API安全限制"},{"level":2,"id":"l-jxyhyyy","text":"六、局限与行业意义"},{"level":3,"id":"6-1-yzjx","text":"6.1 已知局限"},{"level":3,"id":"6-2-hyyy","text":"6.2 行业意义"},{"level":2,"id":"q-xj-operator-dlsdw","text":"七、小结：Operator的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/15-operator-agent/05-15-operator-agent-cua-sjtlyllqzdhdgcsx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/15-operator-agent/05-15-operator-agent-cua-sjtlyllqzdhdgcsx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OpenAI Operator (CUA)：视觉推理与浏览器自动化的工程实现</h1>
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
