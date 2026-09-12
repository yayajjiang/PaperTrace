"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Claude 4：长程Agent能力与记忆机制的工程突破</h1>
<blockquote>
<p><strong>模型定位</strong>：Anthropic Claude 4 系列(2025-05)，包含 Opus 4(旗舰)与 Sonnet 4(平衡版)，首个支持数小时连续工作的长程Agent模型
<strong>家族归属</strong>：14.13-Claude｜编号 11-Claude-4
🔙 <strong><a href="/llm-guide/14-models/14.13-claude/14.13-claude">返回 14.13-Claude 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbj-c-quot-dh-quot-d-quot-xzz-quot">一、发布背景：从&quot;对话&quot;到&quot;协作者&quot;</h2>
<h3 id="1-1-quot-xnxzz-quot-yj">1.1 &quot;虚拟协作者&quot;愿景</h3>
<p>2025年5月22日，Anthropic发布Claude 4系列，Demis Hassabis和Dario Amodei共同将其定位为**&quot;虚拟协作者(Virtual Collaborator)&quot;**——不仅仅是回答问题，而是能够：</p>
<ul>
<li><strong>维持完整上下文</strong>：在数小时的任务中不丢失关键信息</li>
<li><strong>保持持续专注</strong>：在数千步的复杂工作流中不偏离目标</li>
<li><strong>驱动转型性影响</strong>：完成需要深度推理和长期规划的复杂项目</li>
</ul>
<h3 id="1-2-sxhcl">1.2 双型号策略</h3>
<table>
<thead>
<tr>
<th>型号</th>
<th>定位</th>
<th>SWE-bench</th>
<th>安全等级</th>
<th>价格(Input/Output)</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Opus 4</strong></td>
<td>旗舰智能</td>
<td>72.5%</td>
<td><strong>ASL-3</strong></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span></span></span></span>75 per M</td>
</tr>
<tr>
<td><strong>Sonnet 4</strong></td>
<td>平衡高效</td>
<td><strong>72.7%</strong></td>
<td>ASL-2</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15 per M</td>
</tr>
</tbody></table>
<p><strong>意外发现</strong>：Sonnet 4在SWE-bench上(72.7%)<strong>超越了</strong>Opus 4(72.5%)，延续了Claude 3.5 Sonnet&quot;中杯超越大杯&quot;的传统。</p>
<hr>
<h2 id="e-cc-agent-nldgctp">二、长程Agent能力的工程突破</h2>
<h3 id="2-1-sqbbjdgz">2.1 数千步不间断工作</h3>
<p>Claude 4最引人注目的能力是<strong>超长时程任务执行</strong>：</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>Claude 4之前</th>
<th>Claude 4</th>
</tr>
</thead>
<tbody><tr>
<td>典型任务长度</td>
<td>数十步</td>
<td><strong>数千步</strong></td>
</tr>
<tr>
<td>连续工作时间</td>
<td>数分钟</td>
<td><strong>数小时</strong></td>
</tr>
<tr>
<td>上下文保持</td>
<td>易遗忘早期信息</td>
<td><strong>主动维护记忆</strong></td>
</tr>
<tr>
<td>任务复杂度</td>
<td>单文件/短脚本</td>
<td><strong>大型代码库重构</strong></td>
</tr>
</tbody></table>
<p><strong>真实案例</strong>：</p>
<ul>
<li>Opus 4持续重构大型代码库<strong>超过7小时</strong></li>
<li>在玩Pokémon Red时，Opus 4创建导航指南文件来改进游戏策略</li>
<li>用户报告Opus 4可以持续30+小时的自主多步任务</li>
</ul>
<h3 id="2-2-jyjz-cbdsxwdzdjy">2.2 记忆机制：从被动上下文到主动记忆</h3>
<p>Claude 4引入了<strong>主动记忆管理</strong>机制：</p>
<pre><code>传统LLM的上下文管理：
所有信息存放在固定上下文窗口中
    ↓
窗口满了 → 早期信息被&quot;遗忘&quot;

Claude 4的记忆机制：
关键信息 ──→ 主动写入记忆文件
    ↓
需要时 ──→ 从记忆文件中检索
    ↓
记忆文件持续更新，不受上下文窗口限制
</code></pre>
<p><strong>记忆文件的技术实现推测</strong>：</p>
<ol>
<li><p><strong>本地文件系统交互</strong></p>
<ul>
<li>Claude 4可以读写本地文件</li>
<li>将关键信息持久化到磁盘</li>
<li>需要时从文件中加载</li>
</ul>
</li>
<li><p><strong>记忆内容的结构化</strong></p>
<ul>
<li>导航指南(如Pokémon游戏中的地图信息)</li>
<li>项目状态摘要(代码库结构、已完成的修改)</li>
<li>决策日志(为什么做出某个选择)</li>
</ul>
</li>
<li><p><strong>记忆的自动维护</strong></p>
<ul>
<li>模型自主决定什么信息值得记忆</li>
<li>定期更新记忆文件</li>
<li>在任务中断后可以从记忆恢复</li>
</ul>
</li>
</ol>
<h3 id="2-3-y-rag-dqb">2.3 与RAG的区别</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>RAG(检索增强生成)</th>
<th>Claude 4记忆机制</th>
</tr>
</thead>
<tbody><tr>
<td>信息来源</td>
<td>外部知识库</td>
<td><strong>任务执行过程中生成</strong></td>
</tr>
<tr>
<td>更新频率</td>
<td>手动/定期</td>
<td><strong>实时自动更新</strong></td>
</tr>
<tr>
<td>内容控制</td>
<td>开发者定义</td>
<td><strong>模型自主决定</strong></td>
</tr>
<tr>
<td>适用范围</td>
<td>通用知识</td>
<td><strong>特定任务的上下文</strong></td>
</tr>
</tbody></table>
<hr>
<h2 id="s-hhtldsj">三、混合推理的升级</h2>
<h3 id="3-1-extended-thinking-gjsy">3.1 Extended Thinking + 工具使用</h3>
<p>Claude 4继承了Claude 3.7 Sonnet的混合推理架构，并进行了关键升级：</p>
<p><strong>Extended Thinking with Tool Use</strong>：</p>
<ul>
<li>模型在思考过程中可以<strong>调用工具</strong>(bash、文件编辑器、搜索)</li>
<li>工具反馈可以<strong>引导</strong>推理方向</li>
<li>支持<strong>并行测试时计算</strong>(类似Gemini 2.5 Pro的Deep Think)</li>
</ul>
<p><strong>并行测试时计算的效果</strong>：</p>
<table>
<thead>
<tr>
<th>型号</th>
<th>SWE-bench(标准)</th>
<th>SWE-bench(并行计算)</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>Opus 4</td>
<td>72.5%</td>
<td><strong>79.4%</strong></td>
<td>+6.9pp</td>
</tr>
<tr>
<td>Sonnet 4</td>
<td>72.7%</td>
<td><strong>80.2%</strong></td>
<td>+7.5pp</td>
</tr>
</tbody></table>
<h3 id="3-2-tlgcdkjxykkx">3.2 推理过程的可见性与可控性</h3>
<p>Claude 4延续了Anthropic对<strong>推理透明度</strong>的承诺：</p>
<ul>
<li>Extended Thinking过程对用户可见</li>
<li>用户可以通过API参数控制思考预算</li>
<li>思考token计入输出计费</li>
</ul>
<hr>
<h2 id="s-benchmark-xn">四、Benchmark性能</h2>
<h3 id="4-1-bcnl">4.1 编程能力</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Opus 4</th>
<th>Sonnet 4</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>SWE-bench Verified</td>
<td>72.5%</td>
<td><strong>72.7%</strong></td>
<td>真实软件工程</td>
</tr>
<tr>
<td>Terminal-bench</td>
<td><strong>43.2%</strong></td>
<td>—</td>
<td>终端命令行</td>
</tr>
<tr>
<td>TAU-bench</td>
<td>领先</td>
<td>领先</td>
<td>复杂Agent任务</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：</p>
<ul>
<li>Sonnet 4在SWE-bench上再次超越旗舰Opus 4</li>
<li>说明Anthropic在&quot;中杯&quot;模型上的工程优化更加成熟</li>
</ul>
<h3 id="4-2-tlykx">4.2 推理与科学</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Opus 4(标准/扩展)</th>
<th>Sonnet 4(标准/扩展)</th>
</tr>
</thead>
<tbody><tr>
<td>GPQA Diamond</td>
<td>74.9% / <strong>更高</strong></td>
<td>70.0% / <strong>79.6%</strong></td>
</tr>
<tr>
<td>MMMLU</td>
<td>87.4% / <strong>更高</strong></td>
<td>85.4% / <strong>更高</strong></td>
</tr>
<tr>
<td>MMMU</td>
<td>73.7% / <strong>更高</strong></td>
<td>72.6% / <strong>更高</strong></td>
</tr>
<tr>
<td>AIME</td>
<td>33.9%</td>
<td>33.1%</td>
</tr>
<tr>
<td>MATH-500</td>
<td>—</td>
<td><strong>92%</strong></td>
</tr>
</tbody></table>
<h3 id="4-3-yjzmxddb">4.3 与竞争模型的对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>SWE-bench</th>
<th>GPQA</th>
<th>上下文</th>
<th>价格</th>
</tr>
</thead>
<tbody><tr>
<td>Claude Opus 4</td>
<td>72.5%</td>
<td>74.9%</td>
<td>200K</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15/</span></span></span></span>75</td>
</tr>
<tr>
<td>Claude Sonnet 4</td>
<td><strong>72.7%</strong></td>
<td>79.6%(扩展)</td>
<td>200K</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15</td>
</tr>
<tr>
<td>OpenAI Codex-1</td>
<td>72.1%</td>
<td>—</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>Gemini 2.5 Pro</td>
<td>63.8%</td>
<td>84%(扩展)</td>
<td>1M</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.25</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">1.25/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.25/</span></span></span></span>10</td>
</tr>
<tr>
<td>Claude 3.7 Sonnet</td>
<td>70.3%</td>
<td>84.8%(扩展)</td>
<td>200K</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15</td>
</tr>
</tbody></table>
<hr>
<h2 id="w-aqjg-asl-3-dscqy">五、安全架构：ASL-3的首次启用</h2>
<h3 id="5-1-ai-safety-level-3">5.1 AI Safety Level 3</h3>
<p>Claude Opus 4是Anthropic<strong>首个启用ASL-3</strong>的模型：</p>
<table>
<thead>
<tr>
<th>等级</th>
<th>风险</th>
<th>适用模型</th>
<th>关键要求</th>
</tr>
</thead>
<tbody><tr>
<td>ASL-1</td>
<td>最低</td>
<td>早期模型</td>
<td>基本安全</td>
</tr>
<tr>
<td>ASL-2</td>
<td>中等</td>
<td>Sonnet 4, 3.5 Sonnet</td>
<td>标准安全训练</td>
</tr>
<tr>
<td><strong>ASL-3</strong></td>
<td><strong>高</strong></td>
<td><strong>Opus 4</strong></td>
<td><strong>严格安全协议、防止滥用</strong></td>
</tr>
<tr>
<td>ASL-4</td>
<td>极高</td>
<td>—</td>
<td>国家级安全</td>
</tr>
</tbody></table>
<p><strong>ASL-3的具体措施</strong>：</p>
<ul>
<li>Constitutional Classifiers：防止越狱攻击</li>
<li>更严格的红队测试</li>
<li>增强的滥用检测</li>
<li>对化学、生物、放射性和核(CBRN)风险的专门评估</li>
</ul>
<h3 id="5-2-constitutional-classifiers">5.2 Constitutional Classifiers</h3>
<p>Anthropic为Claude 4引入了<strong>Constitutional Classifiers</strong>——一套基于宪法原则的自动分类和防御系统：</p>
<ul>
<li>在模型输出前进行多层安全检查</li>
<li>使用宪法原则自动识别潜在有害内容</li>
<li>比传统关键词过滤更 nuanced</li>
<li>减少误报的同时提高检测率</li>
</ul>
<hr>
<h2 id="l-claude-code-cphjc">六、Claude Code：产品化集成</h2>
<h3 id="6-1-ykfgzldsdjc">6.1 与开发工作流的深度集成</h3>
<p>Claude 4是<strong>Claude Code</strong>(Anthropic的编码Agent IDE)的核心引擎：</p>
<ul>
<li>在IDE中直接调用Opus 4或Sonnet 4</li>
<li>自动文件导航和编辑</li>
<li>终端命令执行</li>
<li>跨文件重构</li>
<li>长时间运行的编码任务</li>
</ul>
<h3 id="6-2-dptbs">6.2 多平台部署</h3>
<table>
<thead>
<tr>
<th>平台</th>
<th>可用模型</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>Claude.ai</td>
<td>Opus 4 / Sonnet 4</td>
<td>消费者产品</td>
</tr>
<tr>
<td>Claude Code</td>
<td>Opus 4 / Sonnet 4</td>
<td>编码Agent IDE</td>
</tr>
<tr>
<td>Anthropic API</td>
<td>全部</td>
<td>完整API访问</td>
</tr>
<tr>
<td>AWS Bedrock</td>
<td>全部</td>
<td>企业级安全</td>
</tr>
<tr>
<td>Google Vertex AI</td>
<td>全部</td>
<td>GCP集成</td>
</tr>
</tbody></table>
<hr>
<h2 id="q-hxyj">七、后续演进</h2>
<h3 id="7-1-claude-4-1-xl">7.1 Claude 4.1系列</h3>
<p>2025年8月-11月，Anthropic发布了Claude 4.1系列：</p>
<table>
<thead>
<tr>
<th>型号</th>
<th>发布时间</th>
<th>SWE-bench</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>Opus 4.1</td>
<td>2025-08</td>
<td>74.5%</td>
<td>编码精度提升</td>
</tr>
<tr>
<td>Sonnet 4.5</td>
<td>2025-09</td>
<td>77.2%</td>
<td><strong>编码能力突破</strong></td>
</tr>
<tr>
<td>Haiku 4.5</td>
<td>2025-10</td>
<td>73.3%</td>
<td>首个支持Extended Thinking的Haiku</td>
</tr>
<tr>
<td>Opus 4.5</td>
<td>2025-11</td>
<td>—</td>
<td>智能+效率平衡</td>
</tr>
</tbody></table>
<p><strong>Sonnet 4.5的里程碑</strong>：</p>
<ul>
<li>SWE-bench 77.2%(标准)，82%(高计算)</li>
<li>可持续30+小时自主任务</li>
<li>OSWorld 61.4%(人机交互)</li>
</ul>
<hr>
<h2 id="b-xj-claude-4-dlsdw">八、小结：Claude 4的历史定位</h2>
<p>Claude 4标志着Anthropic从&quot;对话AI&quot;向**&quot;长期协作者&quot;**的转型：</p>
<blockquote>
<p><strong>不是回答问题，而是完成项目。</strong></p>
</blockquote>
<p>其深远影响：</p>
<ol>
<li><strong>长程Agent标杆</strong>：证明了AI可以持续工作数小时而不偏离目标</li>
<li><strong>记忆机制创新</strong>：从被动上下文到主动文件记忆，突破了上下文窗口限制</li>
<li><strong>编码能力巅峰</strong>：Sonnet 4在SWE-bench上达到80.2%，逼近人类工程师水平</li>
<li><strong>安全分级实践</strong>：ASL-3的首次启用，为行业提供了高风险模型部署的参考</li>
</ol>
<p>Claude 4代表了Anthropic&quot;虚拟协作者&quot;愿景的成熟产品化。理解Claude 4，就是理解AI如何从&quot;工具&quot;进化为&quot;同事&quot;。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.13-claude/14.13-claude">14.13-Claude 家族总览</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/10-claude-3.7-sonnet/05-10-claude-3.7-sonnet-hhtljgykkskys">10-Claude-3.7-Sonnet 混合推理架构与可控思考预算</a></li>
<li><a href="/llm-guide/14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-bmnltpy-agent-hjhsj">07-Claude-3.5-Sonnet 编码能力突破与Agent化交互设计</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-c-quot-dh-quot-d-quot-xzz-quot","text":"一、发布背景：从&quot;对话&quot;到&quot;协作者&quot;"},{"level":3,"id":"1-1-quot-xnxzz-quot-yj","text":"1.1 &quot;虚拟协作者&quot;愿景"},{"level":3,"id":"1-2-sxhcl","text":"1.2 双型号策略"},{"level":2,"id":"e-cc-agent-nldgctp","text":"二、长程Agent能力的工程突破"},{"level":3,"id":"2-1-sqbbjdgz","text":"2.1 数千步不间断工作"},{"level":3,"id":"2-2-jyjz-cbdsxwdzdjy","text":"2.2 记忆机制：从被动上下文到主动记忆"},{"level":3,"id":"2-3-y-rag-dqb","text":"2.3 与RAG的区别"},{"level":2,"id":"s-hhtldsj","text":"三、混合推理的升级"},{"level":3,"id":"3-1-extended-thinking-gjsy","text":"3.1 Extended Thinking + 工具使用"},{"level":3,"id":"3-2-tlgcdkjxykkx","text":"3.2 推理过程的可见性与可控性"},{"level":2,"id":"s-benchmark-xn","text":"四、Benchmark性能"},{"level":3,"id":"4-1-bcnl","text":"4.1 编程能力"},{"level":3,"id":"4-2-tlykx","text":"4.2 推理与科学"},{"level":3,"id":"4-3-yjzmxddb","text":"4.3 与竞争模型的对比"},{"level":2,"id":"w-aqjg-asl-3-dscqy","text":"五、安全架构：ASL-3的首次启用"},{"level":3,"id":"5-1-ai-safety-level-3","text":"5.1 AI Safety Level 3"},{"level":3,"id":"5-2-constitutional-classifiers","text":"5.2 Constitutional Classifiers"},{"level":2,"id":"l-claude-code-cphjc","text":"六、Claude Code：产品化集成"},{"level":3,"id":"6-1-ykfgzldsdjc","text":"6.1 与开发工作流的深度集成"},{"level":3,"id":"6-2-dptbs","text":"6.2 多平台部署"},{"level":2,"id":"q-hxyj","text":"七、后续演进"},{"level":3,"id":"7-1-claude-4-1-xl","text":"7.1 Claude 4.1系列"},{"level":2,"id":"b-xj-claude-4-dlsdw","text":"八、小结：Claude 4的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/11-claude-4/05-11-claude-4-cc-agent-nlyjyjzdgctp" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/11-claude-4/05-11-claude-4-cc-agent-nlyjyjzdgctp" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Claude 4：长程Agent能力与记忆机制的工程突破</h1>
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
