"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Claude Computer Use：视觉感知驱动的GUI自动化Agent</h1>
<blockquote>
<p><strong>模型定位</strong>：Anthropic 首个公开提供的计算机操控Agent(2024-10)，业界首个基于纯视觉感知操作GUI的前沿AI
<strong>家族归属</strong>：14.13-Claude｜编号 09-Claude-Computer-Use
<strong>核心论文/报告</strong>：<em>Developing a Computer Use Capability</em> (Anthropic, 2024-10)
🔙 <strong><a href="/llm-guide/14-models/14.13-claude/14.13-claude">返回 14.13-Claude 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbj-agent-jhdfsgm">一、发布背景：Agent交互的范式革命</h2>
<h3 id="1-1-c-quot-api-jc-quot-d-quot-xryycz-quot">1.1 从&quot;API集成&quot;到&quot;像人一样操作&quot;</h3>
<p>在Claude Computer Use发布之前，AI与计算机的交互方式是<strong>API驱动</strong>的：</p>
<pre><code>传统AI自动化：
用户指令 → AI理解 → 调用特定API → 获取结果
                    ↑
              每个软件需要专用API集成
</code></pre>
<p>这种方式的致命局限：</p>
<ul>
<li><strong>API覆盖不全</strong>：大多数软件(尤其是遗留系统)没有公开API</li>
<li><strong>集成成本高</strong>：每个新软件需要单独开发集成</li>
<li><strong>脆弱性强</strong>：UI变化可能导致API失效</li>
<li><strong>学习成本高</strong>：AI需要&quot;学习&quot;每个API的用法</li>
</ul>
<p>Anthropic提出了<strong>根本不同的思路</strong>：</p>
<blockquote>
<p><strong>不是让AI学习API，而是让AI像人一样看屏幕、点鼠标、敲键盘。</strong></p>
</blockquote>
<pre><code>Claude Computer Use：
用户指令 → AI看屏幕截图 → 理解界面 → 移动鼠标/点击/输入 → 观察结果 → 循环
                     ↑
              无需API，适用于任何有GUI的软件
</code></pre>
<h3 id="1-2-fblc">1.2 发布历程</h3>
<table>
<thead>
<tr>
<th>时间</th>
<th>里程碑</th>
</tr>
</thead>
<tbody><tr>
<td>2024-10</td>
<td>Claude 3.5 Sonnet (Oct) 发布，Computer Use公开beta</td>
</tr>
<tr>
<td>2024-10</td>
<td>OSWorld 14.9%(截图-only)，业界领先</td>
</tr>
<tr>
<td>2025</td>
<td>集成至Claude Code(IDE Agent)</td>
</tr>
<tr>
<td>2026-03</td>
<td>OSWorld 72.5%，接近人类水平(70-75%)</td>
</tr>
</tbody></table>
<hr>
<h2 id="e-hxjsjg">二、核心技术架构</h2>
<h3 id="2-1-gc-jc-zh-fkxh">2.1 观察-决策-执行-反馈循环</h3>
<p>Claude Computer Use的核心是一个<strong>持续的感知-行动循环</strong>：</p>
<pre><code>┌─────────────────────────────────────────┐
│         Claude Computer Use Loop         │
│                                          │
│  1. Screenshot ──→ Vision Analysis       │
│         ↓                                │
│  2. Reasoning ──→ Action Planning        │
│         ↓                                │
│  3. Execution ──→ Mouse/Keyboard/Command │
│         ↓                                │
│  4. Observation ──→ New Screenshot       │
│         ↓                                │
│  5. Verification ──→ Task Complete?      │
│         ↓ No                             │
│      Back to Step 1                      │
└─────────────────────────────────────────┘
</code></pre>
<p><strong>每个步骤的技术细节</strong>：</p>
<p><strong>Step 1：截图分析(Screenshot Analysis)</strong></p>
<ul>
<li>捕获当前屏幕的完整截图</li>
<li>Claude使用视觉能力识别界面元素：按钮、输入框、菜单、文本、图标</li>
<li>理解界面布局和元素间的空间关系</li>
</ul>
<p><strong>Step 2：像素坐标映射(Coordinate Mapping)</strong>
这是最关键的技术突破：</p>
<ul>
<li>传统LLM难以精确处理像素级坐标</li>
<li>Claude被专门训练来<strong>准确计数像素</strong>，计算精确的X/Y坐标</li>
<li>将识别的UI元素映射到具体像素位置：&quot;submit button at (320, 450)&quot;</li>
</ul>
<p><strong>Step 3：动作执行(Action Execution)</strong>
Claude支持的动作集：</p>
<table>
<thead>
<tr>
<th>动作类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><code>mouse_move</code></td>
<td>移动鼠标到指定坐标</td>
</tr>
<tr>
<td><code>mouse_click</code></td>
<td>左键点击</td>
</tr>
<tr>
<td><code>mouse_double_click</code></td>
<td>双击</td>
</tr>
<tr>
<td><code>mouse_right_click</code></td>
<td>右键点击</td>
</tr>
<tr>
<td><code>mouse_drag</code></td>
<td>从一个坐标拖动到另一个坐标</td>
</tr>
<tr>
<td><code>scroll</code></td>
<td>滚动指定方向和距离</td>
</tr>
<tr>
<td><code>type</code></td>
<td>键盘输入文本</td>
</tr>
<tr>
<td><code>key_press</code></td>
<td>按下特定按键或快捷键</td>
</tr>
<tr>
<td><code>screenshot</code></td>
<td>截取当前屏幕</td>
</tr>
</tbody></table>
<p><strong>Step 4：反馈验证(Feedback Verification)</strong></p>
<ul>
<li>执行动作后，Claude截取新截图</li>
<li>验证预期效果是否发生</li>
<li>如果失败，分析原因并调整策略</li>
</ul>
<h3 id="2-2-sdgjxt">2.2 三大工具系统</h3>
<p>Claude Computer Use通过三个核心工具与计算机交互：</p>
<p><strong>1. Computer Tool(计算机控制)</strong></p>
<ul>
<li>控制鼠标和键盘</li>
<li>截取屏幕截图</li>
<li>模拟人类的所有基本输入操作</li>
</ul>
<p><strong>2. Text Editor Tool(文本编辑器)</strong></p>
<ul>
<li>查看文件内容</li>
<li>创建、编辑、删除文件</li>
<li>搜索和替换文本</li>
<li>比直接用鼠标操作编辑器更可靠</li>
</ul>
<p><strong>3. Bash Tool(命令行)</strong></p>
<ul>
<li>执行shell命令</li>
<li>安装软件包</li>
<li>系统管理任务</li>
<li>文件系统操作</li>
</ul>
<h3 id="2-3-hhjg-yd-bd">2.3 混合架构：云端+本地</h3>
<p>Claude Computer Use采用<strong>混合拓扑架构</strong>：</p>
<pre><code>┌─────────────┐      网络       ┌─────────────┐
│  Anthropic  │ ←────────────→ │  用户本地    │
│   云端      │   API调用       │   计算机    │
│             │                 │             │
│ 高级语义规划 │                 │ 鼠标/键盘操控│
│ 推理和决策  │                 │ 截图捕获    │
│ 安全监控   │                 │ 命令执行    │
└─────────────┘                 └─────────────┘
</code></pre>
<p><strong>设计考量</strong>：</p>
<ul>
<li>云端处理：复杂的推理、规划、安全判断</li>
<li>本地执行：低延迟的鼠标键盘操作、截图</li>
<li>减少网络往返对交互式任务的影响</li>
</ul>
<hr>
<h2 id="s-benchmark-xnyyj">三、Benchmark性能与演进</h2>
<h3 id="3-1-os-world-jsjcznldjbz">3.1 OSWorld：计算机操作能力的金标准</h3>
<p>OSWorld(Xie et al., 2024)是评估AI操控计算机能力的权威基准，包含369个真实桌面任务：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>OSWorld得分</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>2024-10</td>
<td>Claude 3.5 Sonnet</td>
<td><strong>14.9%</strong></td>
<td>首次发布，业界领先</td>
</tr>
<tr>
<td>2024-10</td>
<td>GPT-4(次优)</td>
<td>7.7%</td>
<td>接近Claude的一半</td>
</tr>
<tr>
<td>2024-10</td>
<td>Claude(多步)</td>
<td>22.0%</td>
<td>允许重试后</td>
</tr>
<tr>
<td>2025</td>
<td>Claude 3.7/4系列</td>
<td>持续提升</td>
<td>—</td>
</tr>
<tr>
<td>2026-03</td>
<td>Claude最新</td>
<td><strong>72.5%</strong></td>
<td>接近人类水平</td>
</tr>
</tbody></table>
<p><strong>人类基准</strong>：70-75%</p>
<p><strong>关键洞察</strong>：从14.9%到72.5%，Claude Computer Use在约18个月内实现了<strong>近5倍的性能提升</strong>，从&quot; barely functional &quot;到&quot; near-human &quot;。</p>
<h3 id="3-2-web-arena-wyzdh">3.2 WebArena：网页自动化</h3>
<p>在网页自动化基准WebArena上，Claude Computer Use同样表现优异：</p>
<ul>
<li>不依赖网站的特定API或DOM结构</li>
<li>纯视觉理解网页内容</li>
<li>通过鼠标点击和键盘输入与网页交互</li>
</ul>
<h3 id="3-3-yjzdsddb">3.3 与竞争对手的对比</h3>
<table>
<thead>
<tr>
<th>能力</th>
<th>Claude Computer Use</th>
<th>OpenAI Operator</th>
<th>Google Project Mariner</th>
</tr>
</thead>
<tbody><tr>
<td>发布</td>
<td>2024-10</td>
<td>2025-01</td>
<td>2024-12</td>
</tr>
<tr>
<td>操控层级</td>
<td>OS级+Web</td>
<td>Web为主</td>
<td>Web为主</td>
</tr>
<tr>
<td>OSWorld</td>
<td>72.5%(2026)</td>
<td>38.1%</td>
<td>—</td>
</tr>
<tr>
<td>WebArena</td>
<td>领先</td>
<td>58.1%</td>
<td>—</td>
</tr>
<tr>
<td>WebVoyager</td>
<td>—</td>
<td>87%</td>
<td><strong>83.5%</strong></td>
</tr>
<tr>
<td>安全确认</td>
<td>最频繁</td>
<td>中等</td>
<td>中等</td>
</tr>
<tr>
<td>多任务并行</td>
<td>不支持</td>
<td>不支持</td>
<td><strong>10个并行</strong></td>
</tr>
</tbody></table>
<hr>
<h2 id="s-yycjyal">四、应用场景与案例</h2>
<h3 id="4-1-dxyycj">4.1 典型应用场景</h3>
<p><strong>1. 网页自动化</strong></p>
<ul>
<li>填写复杂表单</li>
<li>跨网站数据收集</li>
<li>在线预订(机票、酒店、餐厅)</li>
<li>电商操作(搜索、比较、购买)</li>
</ul>
<p><strong>2. 桌面软件操作</strong></p>
<ul>
<li>电子表格数据处理</li>
<li>文档编辑和格式化</li>
<li>演示文稿制作</li>
<li>图片编辑(基础操作)</li>
</ul>
<p><strong>3. 开发辅助</strong></p>
<ul>
<li>在IDE中编写和调试代码</li>
<li>运行测试套件</li>
<li>查看和分析日志</li>
<li>操作版本控制系统</li>
</ul>
<p><strong>4. 系统管理</strong></p>
<ul>
<li>文件组织和管理</li>
<li>软件安装和配置</li>
<li>系统监控和诊断</li>
</ul>
<h3 id="4-2-anthropic-d-demo-al">4.2 Anthropic的Demo案例</h3>
<p>Anthropic展示的典型用例：</p>
<ul>
<li>研究任务：打开浏览器 → 搜索信息 → 访问多个网页 → 综合信息 → 生成报告</li>
<li>数据处理：打开Excel → 导入CSV → 创建图表 → 格式化 → 保存</li>
<li>编程任务：打开IDE → 编写代码 → 运行测试 → 调试 → 提交Git</li>
</ul>
<p><strong>有趣的&quot;意外&quot;</strong>：</p>
<ul>
<li>Claude在演示中不小心停止了录屏软件</li>
<li>Claude在编码演示中&quot;休息&quot;，开始浏览黄石公园的照片</li>
<li>这些意外反而证明了Claude的&quot;自主性&quot;和&quot;好奇心&quot;</li>
</ul>
<hr>
<h2 id="w-aqsjytz">五、安全设计与挑战</h2>
<h3 id="5-1-anthropic-daqyxcl">5.1 Anthropic的安全优先策略</h3>
<p>Claude Computer Use采用<strong>最严格的安全策略</strong>之一：</p>
<table>
<thead>
<tr>
<th>安全措施</th>
<th>实现</th>
</tr>
</thead>
<tbody><tr>
<td>频繁确认</td>
<td>敏感操作(购买、删除、支付)暂停并请求用户确认</td>
</tr>
<tr>
<td>沙箱环境</td>
<td>推荐在虚拟机/容器中运行</td>
</tr>
<tr>
<td>权限最小化</td>
<td>以最低权限运行，限制系统访问</td>
</tr>
<tr>
<td>操作审计</td>
<td>记录所有操作，可追溯</td>
</tr>
<tr>
<td>超时保护</td>
<td>长时间任务自动暂停</td>
</tr>
</tbody></table>
<h3 id="5-2-yzjx">5.2 已知局限</h3>
<p><strong>1. 速度和延迟</strong></p>
<ul>
<li>每步需要截图-上传-推理-执行，速度较慢</li>
<li>复杂任务可能需要数十分钟</li>
</ul>
<p><strong>2. 精确操作</strong></p>
<ul>
<li>拖拽、缩放等精细操作仍有困难</li>
<li>小按钮或密集UI可能点错</li>
</ul>
<p><strong>3. 错误恢复</strong></p>
<ul>
<li>一次误操作可能导致任务失败</li>
<li>容错能力有限</li>
</ul>
<p><strong>4. 环境依赖</strong></p>
<ul>
<li>界面布局变化可能导致失败</li>
<li>对动态内容(动画、弹窗)处理不完美</li>
</ul>
<h3 id="5-3-jzgjdyj">5.3 竞争格局的演进</h3>
<table>
<thead>
<tr>
<th>厂商</th>
<th>产品</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>Anthropic</td>
<td>Computer Use</td>
<td>最严格安全，OS级操控</td>
</tr>
<tr>
<td>OpenAI</td>
<td>Operator/CUA</td>
<td>2025年1月发布，网页为主</td>
</tr>
<tr>
<td>Google</td>
<td>Project Mariner</td>
<td>10任务并行，Chrome集成</td>
</tr>
<tr>
<td>开源</td>
<td>UI-TARS</td>
<td>基于Qwen2.5-VL，数据高效</td>
</tr>
</tbody></table>
<hr>
<h2 id="l-gcsxy-api">六、工程实现与API</h2>
<h3 id="6-1-api-sj">6.1 API设计</h3>
<pre><code class="language-python">from anthropic import Anthropic

client = Anthropic()

response = client.beta.messages.create(
    model=&quot;claude-3-5-sonnet-20241022&quot;,
    max_tokens=4096,
    tools=[
        {
            &quot;type&quot;: &quot;computer_use&quot;,
            &quot;display_width_px&quot;: 1280,
            &quot;display_height_px&quot;: 800,
        }
    ],
    messages=[{
        &quot;role&quot;: &quot;user&quot;,
        &quot;content&quot;: &quot;打开计算器并计算123*456&quot;
    }]
)
</code></pre>
<h3 id="6-2-y-claude-code-djc">6.2 与Claude Code的集成</h3>
<p>Claude Computer Use是<strong>Claude Code</strong>(Anthropic的编码Agent)的基础能力：</p>
<ul>
<li>在IDE中自动导航、编辑、运行代码</li>
<li>查看终端输出并做出响应</li>
<li>在文件系统中查找和修改文件</li>
</ul>
<hr>
<h2 id="q-xj-claude-computer-use-dlsdw">七、小结：Claude Computer Use的历史定位</h2>
<p>Claude Computer Use是AI Agent领域的<strong>里程碑式突破</strong>：</p>
<blockquote>
<p><strong>不需要API，不需要集成，AI可以直接像人一样使用任何软件。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>范式转移</strong>：从&quot;API优先&quot;转向&quot;GUI优先&quot;的Agent设计</li>
<li><strong>通用性</strong>：理论上可以操作任何有人类界面的软件</li>
<li><strong>可访问性</strong>：让AI能够使用没有API的遗留系统</li>
<li><strong>安全标杆</strong>：最严格的确认机制，为行业树立了安全基准</li>
</ol>
<p>从2024年10月的14.9%到2026年3月的72.5%，Claude Computer Use的进化速度惊人。当OSWorld得分突破人类基准时，我们将见证AI Agent从&quot;演示玩具&quot;进化为&quot;生产力工具&quot;的历史时刻。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.13-claude/14.13-claude">14.13-Claude 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-bmnltpy-agent-hjhsj">07-Claude-3.5-Sonnet 编码能力突破与Agent化交互设计</a></li>
<li><a href="/llm-guide/14-models/14.11-gemini/05-gemini-2.0-pro/05-05-gemini-2.0-pro-ysdmtscy-agentic-gjl">05-Gemini-2.0-Pro 原生多模态输出与Agentic工具链</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-agent-jhdfsgm","text":"一、发布背景：Agent交互的范式革命"},{"level":3,"id":"1-1-c-quot-api-jc-quot-d-quot-xryycz-quot","text":"1.1 从&quot;API集成&quot;到&quot;像人一样操作&quot;"},{"level":3,"id":"1-2-fblc","text":"1.2 发布历程"},{"level":2,"id":"e-hxjsjg","text":"二、核心技术架构"},{"level":3,"id":"2-1-gc-jc-zh-fkxh","text":"2.1 观察-决策-执行-反馈循环"},{"level":3,"id":"2-2-sdgjxt","text":"2.2 三大工具系统"},{"level":3,"id":"2-3-hhjg-yd-bd","text":"2.3 混合架构：云端+本地"},{"level":2,"id":"s-benchmark-xnyyj","text":"三、Benchmark性能与演进"},{"level":3,"id":"3-1-os-world-jsjcznldjbz","text":"3.1 OSWorld：计算机操作能力的金标准"},{"level":3,"id":"3-2-web-arena-wyzdh","text":"3.2 WebArena：网页自动化"},{"level":3,"id":"3-3-yjzdsddb","text":"3.3 与竞争对手的对比"},{"level":2,"id":"s-yycjyal","text":"四、应用场景与案例"},{"level":3,"id":"4-1-dxyycj","text":"4.1 典型应用场景"},{"level":3,"id":"4-2-anthropic-d-demo-al","text":"4.2 Anthropic的Demo案例"},{"level":2,"id":"w-aqsjytz","text":"五、安全设计与挑战"},{"level":3,"id":"5-1-anthropic-daqyxcl","text":"5.1 Anthropic的安全优先策略"},{"level":3,"id":"5-2-yzjx","text":"5.2 已知局限"},{"level":3,"id":"5-3-jzgjdyj","text":"5.3 竞争格局的演进"},{"level":2,"id":"l-gcsxy-api","text":"六、工程实现与API"},{"level":3,"id":"6-1-api-sj","text":"6.1 API设计"},{"level":3,"id":"6-2-y-claude-code-djc","text":"6.2 与Claude Code的集成"},{"level":2,"id":"q-xj-claude-computer-use-dlsdw","text":"七、小结：Claude Computer Use的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/09-claude-computer-use/05-09-claude-computer-use-sjgzqdd-gui-zdh-agent" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/09-claude-computer-use/05-09-claude-computer-use-sjgzqdd-gui-zdh-agent" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Claude Computer Use：视觉感知驱动的GUI自动化Agent</h1>
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
