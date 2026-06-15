"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.1-Terminus: V3.1 架构的终局版本</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: DeepSeek-V3.1 → DeepSeek-V3.1-Terminus
作者: DeepSeek-AI
原文链接: <a href="https://api-docs.deepseek.com/news/news250922">https://api-docs.deepseek.com/news/news250922</a>
发布日期: 2025 年 9 月 22 日
精译日期: 2026 年 5 月 18 日</p>
</blockquote>
<hr>
<h2 id="1-bbdw">1 版本定位</h2>
<p>DeepSeek-V3.1-Terminus 是 DeepSeek-V3.1 系列的终局版本(Terminus 意为&quot;终点&quot;或&quot;终局&quot;)。该版本在保持 V3.1 全部能力的基础上,针对用户反馈的两个核心问题进行了针对性修复和优化:</p>
<ol>
<li><strong>语言一致性</strong>:修复中英文混杂、偶发异常字符等问题</li>
<li><strong>Agent 稳定性</strong>:强化 Code Agent 和 Search Agent 的可靠性</li>
</ol>
<p>Terminus 版本标志着 V3.1 架构线的成熟和收官,后续 DeepSeek 的迭代重心转向 V3.2 系列(基于 Terminus 引入 DeepSeek Sparse Attention)。</p>
<hr>
<h2 id="2-hxgj">2 核心改进</h2>
<h3 id="2-1-yyyzxxf">2.1 语言一致性修复</h3>
<p><strong>问题描述</strong>。V3.1 早期版本存在以下语言输出问题:</p>
<ul>
<li>中英文混杂:在中文对话中突然插入英文词汇或短语</li>
<li>异常字符:偶发出现如&quot;极&quot;&quot;extreme&quot;等无意义字符</li>
<li>特殊字符异常显示:某些符号或格式标记渲染错误</li>
</ul>
<p>这些问题不仅影响用户体验,在代码生成场景中可能导致编译失败——一个混入异常字符的代码片段会完全无法运行。</p>
<p><strong>修复策略</strong>。Terminus 版本通过以下方式修复语言一致性问题:</p>
<ul>
<li>优化 tokenizer 的多语言分词策略,减少跨语言 token 的意外激活</li>
<li>调整后训练数据中的语言分布,增强单一语言输出的稳定性</li>
<li>修复 chat template 中的格式控制逻辑,避免特殊字符的异常渲染</li>
</ul>
<p><strong>效果验证</strong>。根据内部测试,Terminus 版本在各领域测评中输出稳定性显著优于前一版本,文本生成纯净度大幅提升。</p>
<blockquote>
<p><strong>译者思考：设计动机</strong></p>
<p>语言混杂问题是多语言 LLM 的常见顽疾,其根因往往不在模型本身,而在 tokenizer 和数据分布。DeepSeek 的 tokenizer 基于多语言语料训练,当模型在生成过程中对&quot;当前应该使用哪种语言&quot;的信心不足时,容易在不同语言的 token 之间&quot;摇摆&quot;,导致混杂输出。</p>
<p>&quot;极&quot;&quot;extreme&quot;这类异常字符的出现更为微妙——它们可能是 tokenizer 在处理某些罕见组合时的&quot;兜底&quot;输出,或者是后训练数据中低质量样本的&quot;污染&quot;。Terminus 的修复说明团队不仅关注宏观性能指标,也重视这些&quot;细节体验&quot;——因为一个混入异常字符的代码片段对开发者来说可能是灾难性的。</p>
<p>将这一版本命名为&quot;Terminus&quot;(终局)也很有意思。它暗示 V3.1 架构线已经达到成熟稳定状态,不会再有大的功能增量,只会做稳定性修复。这种&quot;版本终局&quot;的命名方式在软件工程中常见,但在 LLM 领域较为罕见——大多数厂商倾向于持续用数字版本号迭代,而不是明确宣告一条产品线的结束。</p>
</blockquote>
<h3 id="2-2-agent-nlqh">2.2 Agent 能力强化</h3>
<p><strong>Code Agent 优化</strong>。Terminus 版本的 Code Agent 能够:</p>
<ul>
<li>更精准地生成物理效果逼真的编程实现</li>
<li>减少因语言混杂导致的代码编译失败</li>
<li>在多步代码生成任务中保持上下文一致性</li>
</ul>
<p><strong>Search Agent 优化</strong>。Terminus 版本的 Search Agent 能够:</p>
<ul>
<li>更高效地整合多维度信息并交叉验证</li>
<li>在复杂搜索任务中减少&quot;幻觉&quot;和错误引用</li>
<li>提升网页浏览和信息提取的可靠性</li>
</ul>
<p><strong>基准提升</strong>。Terminus 在 HLE(Humanity&#39;s Last Exam)等权威测评中成绩大幅提升,表明修复语言一致性不仅改善了用户体验,也间接增强了模型的推理和知识调用能力。</p>
<hr>
<h2 id="3-mxggybs">3 模型规格与部署</h2>
<h3 id="3-1-smszc">3.1 双模式支持</h3>
<p>Terminus 包含思考模型和非思考模式两个版本,与 V3.1 保持一致:</p>
<table>
<thead>
<tr>
<th>模式</th>
<th>输出默认长度</th>
<th>输出最大长度</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td>非思考</td>
<td>4K tokens</td>
<td>8K tokens</td>
<td>日常对话、快速响应</td>
</tr>
<tr>
<td>思考</td>
<td>32K tokens</td>
<td>64K tokens</td>
<td>复杂推理、深度分析</td>
</tr>
</tbody></table>
<p>上下文窗口:128K tokens(163.8K tokens 实测)</p>
<h3 id="3-2-kyy-api">3.2 开源与 API</h3>
<p><strong>开源权重</strong>:</p>
<ul>
<li>Hugging Face: <a href="https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus">https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus</a></li>
<li>ModelScope: <a href="https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1-Terminus">https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1-Terminus</a></li>
<li>许可证: MIT</li>
</ul>
<p><strong>API 服务</strong>:</p>
<ul>
<li>已同步更新至 DeepSeek 官方 App、网页端、小程序和 API</li>
<li>deepseek-chat → Terminus 非思考模式</li>
<li>deepseek-reasoner → Terminus 思考模式</li>
</ul>
<p><strong>定价</strong>:</p>
<table>
<thead>
<tr>
<th>类型</th>
<th>价格(每百万 tokens)</th>
</tr>
</thead>
<tbody><tr>
<td>输入(缓存命中)</td>
<td>0.5 元</td>
</tr>
<tr>
<td>输入(缓存未命中)</td>
<td>4 元</td>
</tr>
<tr>
<td>输出</td>
<td>12 元</td>
</tr>
</tbody></table>
<h3 id="3-3-jgjc">3.3 架构继承</h3>
<p>Terminus 的模型架构与 V3.1 完全一致:</p>
<ul>
<li>总参数量: 671B</li>
<li>激活参数: 37B per token</li>
<li>架构: DeepSeekMoE + MLA</li>
<li>训练数据: V3 的 14.8T + V3.1 的 840B 继续预训练</li>
</ul>
<p>这意味着 Terminus 的部署和推理基础设施与 V3/V3.1 完全兼容。</p>
<hr>
<h2 id="4-z-deep-seek-jspxzdwz">4 在 DeepSeek 技术谱系中的位置</h2>
<h3 id="4-1-csqx">4.1 承上启下</h3>
<p>Terminus 在 DeepSeek 技术谱系中扮演关键角色:</p>
<ul>
<li><strong>承上</strong>:作为 V3.1 架构的成熟终局版本,汇集了 V3 → V3.1 的全部技术积累</li>
<li><strong>启下</strong>:作为 V3.2-Exp 和 V3.2 的基座 checkpoint,V3.2 系列从 Terminus 开始引入 DeepSeek Sparse Attention(DSA)</li>
</ul>
<h3 id="4-2-y-v3-1-ddb">4.2 与 V3.1 的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>V3.1</th>
<th>V3.1-Terminus</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2025-08-21</td>
<td>2025-09-22</td>
</tr>
<tr>
<td>语言一致性</td>
<td>存在中英文混杂</td>
<td>显著修复</td>
</tr>
<tr>
<td>Agent 稳定性</td>
<td>偶发不稳定</td>
<td>大幅增强</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>128K</td>
<td>128K(163.8K)</td>
</tr>
<tr>
<td>输出长度</td>
<td>非思考默认较短</td>
<td>非思考 4K/思考 32K</td>
</tr>
<tr>
<td>架构变化</td>
<td>无</td>
<td>无</td>
</tr>
</tbody></table>
<h3 id="4-3-y-v3-2-dgx">4.3 与 V3.2 的关系</h3>
<p>V3.2-Exp(2025-09-29)明确声明&quot;Built on V3.1-Terminus&quot;,在 Terminus 基础上:</p>
<ul>
<li>引入 DeepSeek Sparse Attention(DSA),降低长上下文计算成本</li>
<li>API 价格降低 50%+</li>
<li>保持与 Terminus 相当的输出质量</li>
</ul>
<blockquote>
<p><strong>译者思考：局限性与延伸思考</strong></p>
<p>Terminus 版本的发布揭示了一个常被忽视的产品真理:&quot;稳定性本身就是功能&quot;。在 LLM 领域,研究者往往关注新能力的添加(更长的上下文、更强的推理、更多的工具),但用户实际使用中最大的痛点往往是&quot;不稳定&quot;——今天能生成的代码明天就混入了异常字符,上周能完成的 Agent 任务这周就失败了。</p>
<p>DeepSeek 将 V3.1-Terminus 定位为&quot;终局版本&quot;,这是一种对产品质量的自信,也是一种对用户承诺的表达:&quot;这条产品线已经稳定,你可以放心使用。&quot;在快速迭代的 AI 领域,这种&quot;宣告成熟&quot;的做法反而是一种差异化策略。</p>
<p>但&quot;终局&quot;不等于&quot;终点&quot;。Terminus 作为 V3.2 的基座,其稳定性修复为后续架构创新(DSA)提供了可靠的起点。如果 V3.2 在不稳定的地基上建造,新引入的稀疏注意力可能会放大已有的问题。Terminus 的&quot;终局&quot;实际上是 V3.2 的&quot;起点&quot;——这是软件工程中&quot;稳定基线 + 架构演进&quot;的经典模式。</p>
</blockquote>
<hr>
<h2 id="fl-gjsjsc">附录:关键数据速查</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>V3.1-Terminus</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2025-09-22</td>
</tr>
<tr>
<td>基座模型</td>
<td>DeepSeek-V3.1</td>
</tr>
<tr>
<td>总参数量</td>
<td>671B</td>
</tr>
<tr>
<td>激活参数</td>
<td>37B</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>128K(163.8K)</td>
</tr>
<tr>
<td>非思考输出</td>
<td>默认 4K,最大 8K</td>
</tr>
<tr>
<td>思考输出</td>
<td>默认 32K,最大 64K</td>
</tr>
<tr>
<td>许可证</td>
<td>MIT</td>
</tr>
<tr>
<td>输入定价(缓存命中)</td>
<td>0.5 元/M tokens</td>
</tr>
<tr>
<td>输入定价(缓存未命中)</td>
<td>4 元/M tokens</td>
</tr>
<tr>
<td>输出定价</td>
<td>12 元/M tokens</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>译者注</strong>:DeepSeek-V3.1-Terminus 没有发布独立技术报告,本文基于官方 API 文档公告、第三方技术解读和产品评测综合整理。核心改进细节(如 tokenizer 的具体调整、后训练数据的具体修改)未公开披露,读者应注意区分官方确认信息和技术推测。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-bbdw","text":"1 版本定位"},{"level":2,"id":"2-hxgj","text":"2 核心改进"},{"level":3,"id":"2-1-yyyzxxf","text":"2.1 语言一致性修复"},{"level":3,"id":"2-2-agent-nlqh","text":"2.2 Agent 能力强化"},{"level":2,"id":"3-mxggybs","text":"3 模型规格与部署"},{"level":3,"id":"3-1-smszc","text":"3.1 双模式支持"},{"level":3,"id":"3-2-kyy-api","text":"3.2 开源与 API"},{"level":3,"id":"3-3-jgjc","text":"3.3 架构继承"},{"level":2,"id":"4-z-deep-seek-jspxzdwz","text":"4 在 DeepSeek 技术谱系中的位置"},{"level":3,"id":"4-1-csqx","text":"4.1 承上启下"},{"level":3,"id":"4-2-y-v3-1-ddb","text":"4.2 与 V3.1 的对比"},{"level":3,"id":"4-3-y-v3-2-dgx","text":"4.3 与 V3.2 的关系"},{"level":2,"id":"fl-gjsjsc","text":"附录:关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/09-deep-seek-v3.2-terminus/01-deep-seek-v3.2-terminus-yjxjjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/09-deep-seek-v3.2-terminus/01-deep-seek-v3.2-terminus-yjxjjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.1-Terminus: V3.1 架构的终局版本</h1>
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
