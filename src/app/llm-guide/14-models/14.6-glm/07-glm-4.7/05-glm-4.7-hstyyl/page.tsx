"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4.7 深度解析：Agentic Coding 与多模式思考架构</h1>
<blockquote>
<p><strong>发布时间</strong>: 2025-12<br><strong>模型规模</strong>: 30B 级 Dense<br><strong>上下文窗口</strong>: 200K<br><strong>最大输出</strong>: 128K<br><strong>核心创新</strong>: 三种思考模式、流式工具调用、Agentic Coding 优化、混合层次上下文管理</p>
</blockquote>
<hr>
<h2 id="1-dw-xeqd-coding-agent">1. 定位：小而强的 Coding Agent</h2>
<p>GLM-4.7 是智谱面向 <strong>Agentic Coding</strong> 场景推出的 30B 级 SOTA 模型。它不是在追求参数规模的军备竞赛，而是在「单卡可部署」与「复杂工程能力」之间寻找最优平衡点。</p>
<p>关键数据：</p>
<ul>
<li><strong>SWE-bench Verified</strong>: 开源 SOTA(同尺寸)</li>
<li><strong>τ²-Bench</strong>: 开源 SOTA(同尺寸)</li>
<li><strong>上下文窗口</strong>: 200K(可处理大型代码库)</li>
<li><strong>最大输出</strong>: 128K(可生成长篇技术文档或完整项目代码)</li>
</ul>
<hr>
<h2 id="2-szskms-yslhzn">2. 三种思考模式：以算力换智能</h2>
<p>GLM-4.7 最核心的创新是引入了 <strong>三种可切换的思考模式</strong>，这在当时的大模型中是较为领先的设计：</p>
<h3 id="2-1-jcsk-interleaved-thinking">2.1 交错思考(Interleaved Thinking)</h3>
<p><strong>机制</strong>：模型在每次响应和工具调用前进行思考，输出推理过程后再执行动作。</p>
<p><strong>适用场景</strong>：通用对话、复杂推理、多步工具调用。</p>
<p><strong>价值</strong>：提升指令遵循精度和生成质量，避免&quot;急着回答而理解偏差&quot;的问题。</p>
<h3 id="2-2-blsk-reserved-thinking">2.2 保留思考(Reserved Thinking)</h3>
<p><strong>机制</strong>：在 Coding Agent 场景中，模型自动在多轮对话中保留所有思考块，复用已有推理而非重新推导。</p>
<p><strong>适用场景</strong>：长程复杂编程任务，如大型项目重构、跨文件依赖分析。</p>
<p><strong>价值</strong>：显著减少信息丢失和不一致性。传统模型在多轮对话中常因上下文压缩而&quot;遗忘&quot;之前的推理结论，保留思考通过显式维护思考状态解决了这一问题。</p>
<h3 id="2-3-ljsk-turn-level-thinking">2.3 轮级思考(Turn-level Thinking)</h3>
<p><strong>机制</strong>：支持在会话中对每轮推理进行精细控制——轻量级请求可禁用思考以降低延迟/成本，复杂任务可启用思考以提升精度。</p>
<p><strong>适用场景</strong>：混合负载的生产环境，同时服务简单问答和复杂分析请求。</p>
<p><strong>价值</strong>：实现「按需付费」的推理成本模型。对于&quot;今天天气如何&quot;这类简单问题，禁用思考可节省 50%+ 的 token 消耗; 对于&quot;分析这个 10万行代码库的架构问题&quot;，启用思考则确保质量。</p>
<hr>
<h2 id="3-agentic-coding-nlcj">3. Agentic Coding 能力拆解</h2>
<h3 id="3-1-bmnlqh">3.1 编码能力强化</h3>
<p>GLM-4.7 在编程维度的提升不是简单的&quot;更多代码数据训练&quot;，而是针对 Agent 场景的系统优化：</p>
<ul>
<li><strong>多语言编码</strong>：支持 Python、JavaScript、TypeScript、Go、Rust 等主流语言</li>
<li><strong>终端智能体效果</strong>：在 Claude Code、Kilo Code、TRAE、Cline、Roo Code 等编程框架中实现「先思考、再行动」机制</li>
<li><strong>前端审美</strong>：单独组建前端与网页开发团队进行审美训练，使用 VLM 参与数据筛选，强化布局、比例、动效、层级等「非语义能力」</li>
</ul>
<p><strong>为什么前端审美重要？</strong> 在 Agentic Coding 场景中，模型不仅需要&quot;写对代码&quot;，还需要&quot;生成好看的 UI&quot;。GLM-4.7 可以生成接近可交付水平的网页、PPT、海报，这背后是大量高质量 UI 案例的强化学习。</p>
<h3 id="3-2-gjtyyxtzh">3.2 工具调用与协同执行</h3>
<p>GLM-4.7 增强了复杂链路的任务拆解与流程编排能力：</p>
<ul>
<li><strong>多步执行中持续校验与纠偏</strong>：适合端到端交付类的智能体任务</li>
<li><strong>Artifacts 生成</strong>：支持生成完整的前端小游戏，并在多轮自然语言修改中保持逻辑一致</li>
<li><strong>流式工具调用(tool_stream)</strong>：工具调用参数以增量方式逐步返回，而非等待完整生成后一次性返回</li>
</ul>
<p><strong>tool_stream 的工程价值</strong>：在 Agent 场景下，用户可以实时看到模型正在调用什么工具、传了什么参数，大幅提升交互透明度和用户体验。</p>
<h3 id="3-3-hhccsxwgl">3.3 混合层次上下文管理</h3>
<p>这是 GLM-4.7 在长程 Agent 任务中最精巧的设计之一：</p>
<p><strong>问题背景</strong>：在极长上下文(超过 100K tokens)下，模型性能会显著下降。传统 Discard-all 策略通过删除整个工具调用历史来重置上下文，但会导致信息丢失。</p>
<p><strong>GLM-4.7 的解决方案</strong>：</p>
<ol>
<li><strong>Keep-recent-k 策略</strong>：当交互历史超过阈值 k 时，最近 k 轮之前的工具内容被折叠以控制上下文长度(k=5)</li>
<li><strong>混合层次策略</strong>：在 Keep-recent-k 基础上，如果总上下文长度超过阈值 T(32K)，则丢弃整个工具调用历史并以新上下文重新开始，同时继续应用 Keep-recent-k</li>
</ol>
<p><strong>效果</strong>：在 BrowseComp 基准上，GLM-4.7 从 55.3%(无上下文管理)提升至 75.9%(混合策略)，超越所有配备上下文管理的开源模型。</p>
<hr>
<h2 id="4-tljgyxs">4. 推理架构与效率</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>规格</th>
</tr>
</thead>
<tbody><tr>
<td>架构</td>
<td>Dense (非 MoE)</td>
</tr>
<tr>
<td>参数量</td>
<td>~30B</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>200K</td>
</tr>
<tr>
<td>最大输出</td>
<td>128K</td>
</tr>
<tr>
<td>思考模式</td>
<td>交错 / 保留 / 轮级</td>
</tr>
<tr>
<td>流式输出</td>
<td>支持</td>
</tr>
<tr>
<td>Function Call</td>
<td>支持</td>
</tr>
<tr>
<td>结构化输出</td>
<td>JSON / XML</td>
</tr>
<tr>
<td>MCP</td>
<td>支持</td>
</tr>
<tr>
<td>上下文缓存</td>
<td>智能缓存机制</td>
</tr>
</tbody></table>
<p><strong>为什么选择 Dense 而非 MoE？</strong> 在 30B 规模上，Dense 架构具有更稳定的推理延迟(无专家路由抖动)和更简单的部署流程(无需 MoE 基础设施)。对于 Agentic Coding 这类需要强状态跟踪的任务，Dense 架构的&quot;所有参数始终参与&quot;特性反而成为优势。</p>
<hr>
<h2 id="5-y-glm-5-djsxj">5. 与 GLM-5 的技术衔接</h2>
<p>GLM-4.7 的许多设计被直接继承到 GLM-5 中：</p>
<ul>
<li><strong>交错思考/保留思考/轮级思考</strong>：GLM-5 完整继承并扩展</li>
<li><strong>流式工具调用</strong>：GLM-5 新增 <code>tool_stream</code> 参数</li>
<li><strong>混合上下文管理</strong>：GLM-5 在 BrowseComp 上进一步优化至 75.9%</li>
<li><strong>Agent 环境扩展</strong>：GLM-5 的 Coding Agent、搜索 Agent、终端 Agent 均基于 GLM-4.7 的工程实践</li>
</ul>
<p>从这个角度看，GLM-4.7 可以被视为 GLM-5 的「技术预研平台」——在 30B 规模上验证 Agent 架构设计的可行性，再通过更大规模的训练将其放大。</p>
<hr>
<h2 id="6-bsycb">6. 部署与成本</h2>
<table>
<thead>
<tr>
<th>版本</th>
<th>定位</th>
<th>价格</th>
</tr>
</thead>
<tbody><tr>
<td>GLM-4.7-Flash</td>
<td>主力版本</td>
<td>输入 4 元/Mtokens，输出 16 元/Mtokens</td>
</tr>
</tbody></table>
<p><strong>硬件需求估算</strong>：</p>
<ul>
<li>FP16: ~60GB 显存</li>
<li>INT8: ~30GB 显存</li>
<li>推荐 GPU: A100 80GB (FP16) / A100 40GB (INT8)</li>
</ul>
<p><strong>与同类模型对比</strong>：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>上下文</th>
<th>SWE-bench</th>
<th>特色</th>
</tr>
</thead>
<tbody><tr>
<td>GLM-4.7</td>
<td>30B Dense</td>
<td>200K</td>
<td>开源 SOTA (同尺寸)</td>
<td>三种思考模式</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet</td>
<td>~175B</td>
<td>200K</td>
<td>高</td>
<td>工程能力强</td>
</tr>
<tr>
<td>Qwen2.5-Coder-32B</td>
<td>32B Dense</td>
<td>128K</td>
<td>高</td>
<td>代码专项</td>
</tr>
</tbody></table>
<p>GLM-4.7 的核心优势在于「思考模式的灵活性」和「Agent 原生设计」——它不是一款&quot;能写代码的通用模型&quot;，而是一款&quot;为 Agent 场景从零设计的工程模型&quot;。</p>
<hr>
<h2 id="7-zj">7. 总结</h2>
<p>GLM-4.7 代表了智谱在「Agentic AI」方向上的关键工程实践。其技术贡献可归纳为三点：</p>
<ol>
<li><strong>三种思考模式</strong>首次在大模型中实现了推理深度的精细控制，让「以算力换智能」从口号变为可配置选项</li>
<li><strong>混合层次上下文管理</strong>解决了长程 Agent 任务中的上下文膨胀问题，使 200K 窗口真正可用而非&quot;有但用不了&quot;</li>
<li><strong>Agent 原生训练</strong>(前端审美、终端智能体、工具调用协同)证明了大模型可以超越&quot;代码生成器&quot;角色，成为&quot;能配合的工程师&quot;</li>
</ol>
<p>对于希望在单卡/低成本环境下部署 Coding Agent 的开发者，GLM-4.7-Flash 是当前最值得关注的开源选项之一。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dw-xeqd-coding-agent","text":"1. 定位：小而强的 Coding Agent"},{"level":2,"id":"2-szskms-yslhzn","text":"2. 三种思考模式：以算力换智能"},{"level":3,"id":"2-1-jcsk-interleaved-thinking","text":"2.1 交错思考(Interleaved Thinking)"},{"level":3,"id":"2-2-blsk-reserved-thinking","text":"2.2 保留思考(Reserved Thinking)"},{"level":3,"id":"2-3-ljsk-turn-level-thinking","text":"2.3 轮级思考(Turn-level Thinking)"},{"level":2,"id":"3-agentic-coding-nlcj","text":"3. Agentic Coding 能力拆解"},{"level":3,"id":"3-1-bmnlqh","text":"3.1 编码能力强化"},{"level":3,"id":"3-2-gjtyyxtzh","text":"3.2 工具调用与协同执行"},{"level":3,"id":"3-3-hhccsxwgl","text":"3.3 混合层次上下文管理"},{"level":2,"id":"4-tljgyxs","text":"4. 推理架构与效率"},{"level":2,"id":"5-y-glm-5-djsxj","text":"5. 与 GLM-5 的技术衔接"},{"level":2,"id":"6-bsycb","text":"6. 部署与成本"},{"level":2,"id":"7-zj","text":"7. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/07-glm-4.7/05-glm-4.7-hstyyl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/07-glm-4.7/05-glm-4.7-hstyyl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4.7 深度解析：Agentic Coding 与多模式思考架构</h1>
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
