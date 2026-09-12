"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.1 混合推理模式的设计与实现</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 DeepSeek-V3.1 官方博客、API 文档及 vLLM/SGLang 社区实践, 对 V3.1 最核心的产品级创新——混合推理模式(Hybrid Inference)——进行系统性技术剖析. 重点分析其设计动机、实现机制、与业界同类方案的对比, 以及工程落地中的已知问题与局限.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsmxyhhtl">1 设计动机: 为什么需要混合推理</h2>
<h3 id="1-1-ctfadlnkj">1.1 传统方案的两难困境</h3>
<p>在 DeepSeek-V3.1 之前, 业界为&quot;快速响应&quot;和&quot;深度推理&quot;两种需求提供的标准解决方案是<strong>部署两个独立模型</strong>:</p>
<ul>
<li><strong>快速响应模型</strong>: 如 GPT-4o、DeepSeek-V3, 面向日常对话和简单任务, 追求低延迟.</li>
<li><strong>深度推理模型</strong>: 如 o1、DeepSeek-R1, 面向数学、代码和复杂规划, 追求高准确率.</li>
</ul>
<p>这种&quot;双轨制&quot;带来了三个真实痛点:</p>
<ol>
<li><strong>基础设施复杂性</strong>: 需要维护两套独立的模型服务、监控、扩缩容策略和版本管理.</li>
<li><strong>切换摩擦</strong>: 用户在同一对话中从简单问答转向复杂推理时, 需要显式更换模型, 体验断裂.</li>
<li><strong>知识不一致</strong>: 两个模型的预训练数据截止日期、后训练对齐策略不同, 可能导致&quot;这个模型知道但那个模型不知道&quot;的困惑.</li>
</ol>
<h3 id="1-2-deep-seek-dhxdc">1.2 DeepSeek 的核心洞察</h3>
<p>V3.1 的设计团队提出一个反直觉的假设: <strong>推理能力不是模型的固有属性, 而是生成策略的可调参数</strong>.</p>
<p>这一假设的底层逻辑是: 同一个 671B MoE 模型, 在预训练阶段已经同时学习了&quot;快速直觉响应&quot;和&quot;逐步链式思考&quot;两种行为模式. 区别在于, 非思考模式下模型直接采样答案 token; 思考模式下模型先采样推理过程的 token(即 Chain-of-Thought, CoT), 再采样答案.</p>
<p>如果上述假设成立, 那么只需在<strong>生成策略层面</strong>切换行为, 无需更换模型权重. 这正是 V3.1 混合推理模式的理论基础.</p>
<blockquote>
<p>这里需要停下来想一下. 这个假设的成立有一个关键前提: 模型在预训练和后训练阶段必须同时暴露于&quot;直接回答&quot;和&quot;逐步推理&quot;两种类型的数据. V3.1 的 Base 模型继承自 V3(14.8T tokens 预训练), 其后训练数据(SFT + RLHF)明确包含了两种模式的对话样本. 这与专门为推理优化的 R1(使用冷启动数据和 GRPO 强化学习)不同——V3.1 是在通用对齐数据上&quot;顺带&quot;学会了推理, 而非像 R1 那样&quot;专门&quot;训练推理. 这意味着 V3.1 的思考模式在极端复杂任务上可能不如 R1, 但优势在于<strong>两种模式共享完全相同的知识库和世界模型</strong>.</p>
</blockquote>
<hr>
<h2 id="2-jsyl-chat-template-rhqdmsqh">2 技术原理: Chat Template 如何驱动模式切换</h2>
<h3 id="2-1-sxjzgl">2.1 实现机制概览</h3>
<p>V3.1 的混合推理模式通过 <strong>Chat Template 条件分支</strong> 实现, 而非加载不同权重或修改模型架构. 具体流程如下:</p>
<p>用户请求时, API 参数中的 <code>extra_body</code> 包含 <code>chat_template_kwargs</code>, 其中 <code>thinking</code> 字段决定模式:</p>
<ul>
<li><code>thinking: True</code> → Chat Template 选择&quot;思考模式&quot;分支 → 模型生成推理过程 + 最终答案</li>
<li><code>thinking: False</code> → Chat Template 选择&quot;非思考模式&quot;分支 → 模型直接输出最终答案</li>
</ul>
<p>两种模式下的<strong>模型权重、KV Cache 结构、注意力计算完全一致</strong>. 唯一差异在于 Chat Template 是否在 assistant 回复前缀中插入特殊引导 token.</p>
<h3 id="2-2-chat-template-djtsx">2.2 Chat Template 的具体实现</h3>
<p>根据 vLLM 社区对 DeepSeek-V3.1 Chat Template 的分析(jinja 模板), 模板逻辑的核心是条件判断:</p>
<ul>
<li><strong>思考模式</strong>: 模板在 assistant 角色的回复前缀中插入 think 引导 token, 模型基于预训练中学到的模式自然地继续生成推理内容.</li>
<li><strong>非思考模式</strong>: 模板抑制上述引导 token, 模型直接生成答案.</li>
</ul>
<p>关键点:</p>
<ul>
<li><code>thinking</code> 参数通过 <code>chat_template_kwargs</code> 传递给 jinja 模板引擎.</li>
<li>模板引擎根据 <code>thinking</code> 的值决定是否在 assistant 回复前缀插入引导 token.</li>
<li>这种实现方式的<strong>轻量性</strong>是其最大优势——不需要任何模型层面的修改.</li>
</ul>
<h3 id="2-3-api-cmdkzjk">2.3 API 层面的控制接口</h3>
<p>DeepSeek 官方 API 提供两种兼容格式来控制思考模式.</p>
<p><strong>OpenAI 兼容格式</strong>:</p>
<pre><code class="language-python">response = client.chat.completions.create(
    model=&quot;deepseek-v3.1&quot;,
    messages=messages,
    extra_body={&quot;chat_template_kwargs&quot;: {&quot;thinking&quot;: False}}
)
</code></pre>
<p><strong>Anthropic 兼容格式</strong>:</p>
<pre><code class="language-python">response = client.chat.completions.create(
    model=&quot;deepseek-v3.1&quot;,
    messages=messages,
    extra_body={&quot;thinking&quot;: {&quot;type&quot;: &quot;enabled&quot;}}  # 或 &quot;disabled&quot;
)
</code></pre>
<p>此外, 官方还支持 <strong>Reasoning Effort 控制</strong>(思考深度调节):</p>
<ul>
<li><code>reasoning_effort: &quot;high&quot;</code> — 标准思考深度</li>
<li><code>reasoning_effort: &quot;max&quot;</code> — 最大思考深度(用于复杂 Agent 任务)</li>
<li><code>low</code> 和 <code>medium</code> 被映射为 <code>high</code>, <code>xhigh</code> 被映射为 <code>max</code></li>
</ul>
<p>这意味着用户不仅可以开关思考模式, 还能在思考模式内部调节&quot;思考预算&quot;——这是比简单二分类更精细的控制.</p>
<hr>
<h2 id="3-gcsx-cmbdtllsx">3 工程实现: 从模板到推理流水线</h2>
<h3 id="3-1-vllm-bszdsj">3.1 vLLM 部署中的实践</h3>
<p>在 vLLM 中部署 DeepSeek-V3.1 时, 需要显式指定 Chat Template 和 Tool Call Parser:</p>
<pre><code class="language-bash">vllm serve deepseek-ai/DeepSeek-V3.1 \\
  --enable-expert-parallel \\
  --tensor-parallel-size 8 \\
  --tool-call-parser deepseek_v31 \\
  --chat-template examples/tool_chat_template_deepseekv31.jinja
</code></pre>
<p>客户端请求时通过 <code>extra_body</code> 传递 <code>thinking</code> 参数:</p>
<pre><code class="language-python">extra_body = {&quot;chat_template_kwargs&quot;: {&quot;thinking&quot;: False}}
response = client.chat.completions.create(
    model=model, messages=messages, extra_body=extra_body
)
</code></pre>
<h3 id="3-2-tllsxdgjxj">3.2 推理流水线的关键细节</h3>
<p>在实际的推理流水线中, 混合推理模式的实现涉及以下技术细节:</p>
<p><strong>Tokenizer 层面</strong>:</p>
<ul>
<li>V3.1 使用了更新的 tokenizer, 其中包含专门的控制 token 用于标识思考内容的开始和结束.</li>
<li>思考内容在 API 响应中通过 <code>reasoning_content</code> 字段返回, 与最终答案的 <code>content</code> 字段分离.</li>
</ul>
<p><strong>KV Cache 管理</strong>:</p>
<ul>
<li>两种模式共享同一个 KV Cache, 因为底层模型权重相同.</li>
<li>但思考模式下的 KV Cache 长度显著更长(因为包含推理过程), 这直接影响了显存占用和吞吐量.</li>
</ul>
<p><strong>Streaming 输出</strong>:</p>
<ul>
<li>思考模式的 Streaming 输出通常先流式传输 <code>reasoning_content</code>(推理过程), 然后再传输 <code>content</code>(最终答案).</li>
<li>客户端可以实时展示模型的思考过程, 提升用户体验.</li>
</ul>
<hr>
<h2 id="4-tldb-yjhhtlfadszlx">4 同类对比: 业界混合推理方案的三种路线</h2>
<h3 id="4-1-lxy-chat-template-tjfz-deep-seek-v3-1">4.1 路线一: Chat Template 条件分支(DeepSeek-V3.1)</h3>
<p><strong>核心机制</strong>: 同一模型权重, 通过 Chat Template 的 <code>thinking</code> 参数切换生成策略.</p>
<p><strong>优势</strong>:</p>
<ul>
<li><strong>基础设施最简化</strong>: 只需部署和维护一个模型, 降低运维成本.</li>
<li><strong>无缝切换</strong>: 用户可在同一对话中切换模式, 无需更换模型.</li>
<li><strong>一致性保障</strong>: 两种模式共享相同的知识库和语言能力.</li>
</ul>
<p><strong>劣势</strong>:</p>
<ul>
<li>非思考模式下模型的推理潜力被&quot;封印&quot;, 无法利用预训练中学到的推理能力.</li>
<li>思考模式不支持工具调用(初始版本, V3.2 解决).</li>
</ul>
<h3 id="4-2-lxe-tschzkz-qwen3">4.2 路线二: 提示词后缀控制(Qwen3)</h3>
<p><strong>核心机制</strong>: 同一模型权重, 通过在用户输入末尾追加 <code>/think</code> 或 <code>/no_think</code> 后缀, 或在 assistant 回复前缀插入 <code>&lt;think&gt;&lt;/think&gt;</code> 标签来切换模式.</p>
<p><strong>优势</strong>:</p>
<ul>
<li>实现同样轻量, 不需要模型层面的修改.</li>
<li>支持&quot;思考预算&quot;机制(thinking budget), 用户可控制推理 token 的最大数量.</li>
</ul>
<p><strong>劣势</strong>:</p>
<ul>
<li>社区实践表明, Qwen3 的思考模式控制在某些部署环境(如 Ollama)中存在稳定性问题——模型可能忽略 <code>/no_think</code> 指令而始终进入思考模式.</li>
<li>注意力机制分析显示, no-think 模式下模型的注意力会转移到 no-think tag 上, 这可能影响生成质量.</li>
</ul>
<blockquote>
<p>值得注意的是, 阿里在 Qwen3 之后似乎对混合推理路线有所动摇. Qwen3.5 系列重新回归了&quot;专用推理模型&quot;(Qwen3.5-Think)和&quot;通用对话模型&quot;(Qwen3.5)分离的策略, 而非继续强化混合模式. 这可能反映了混合推理在实际产品化中遇到的挑战.</p>
</blockquote>
<h3 id="4-3-lxs-xtbpdmx-gpt-5">4.3 路线三: 系统编排多模型(GPT-5)</h3>
<p><strong>核心机制</strong>: 一个中央系统根据查询复杂度动态选择并调用不同的专用模型(快速响应模型、深度推理模型、多模态模型等).</p>
<p><strong>优势</strong>:</p>
<ul>
<li>每个模型可以针对特定任务进行专门优化, 理论上性能上限最高.</li>
<li>系统层面的调度可以实现更复杂的资源分配策略.</li>
</ul>
<p><strong>劣势</strong>:</p>
<ul>
<li>基础设施最复杂, 需要维护多个模型服务和调度系统.</li>
<li>模型间切换的延迟和一致性问题是持续的工程挑战.</li>
<li>成本最高, 因为需要为多个模型分配计算资源.</li>
</ul>
<h3 id="4-4-szlxddbzj">4.4 三种路线的对比总结</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">DeepSeek-V3.1 (Chat Template)</th>
<th align="left">Qwen3 (提示词后缀)</th>
<th align="left">GPT-5 (系统编排)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">模型数量</td>
<td align="left">1</td>
<td align="left">1</td>
<td align="left">多个</td>
</tr>
<tr>
<td align="left">切换机制</td>
<td align="left">Chat Template 参数</td>
<td align="left">提示词后缀/标签</td>
<td align="left">系统调度</td>
</tr>
<tr>
<td align="left">基础设施复杂度</td>
<td align="left">最低</td>
<td align="left">低</td>
<td align="left">最高</td>
</tr>
<tr>
<td align="left">一致性</td>
<td align="left">完全共享权重</td>
<td align="left">完全共享权重</td>
<td align="left">模型间可能存在差异</td>
</tr>
<tr>
<td align="left">思考深度控制</td>
<td align="left">reasoning_effort 参数</td>
<td align="left">thinking budget</td>
<td align="left">模型选择</td>
</tr>
<tr>
<td align="left">工具调用支持</td>
<td align="left">初始不支持(V3.2 解决)</td>
<td align="left">支持</td>
<td align="left">支持</td>
</tr>
<tr>
<td align="left">已知问题</td>
<td align="left">sglang 切换不稳定</td>
<td align="left">Ollama 控制失效</td>
<td align="left">调度延迟</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-jxxygcfx">5 局限性与工程风险</h2>
<h3 id="5-1-skmsbzcgjty-csbb">5.1 思考模式不支持工具调用(初始版本)</h3>
<p>V3.1 发布时, 思考模式(Think Mode)不支持工具调用(Function Calling), 这是一个显著的产品局限. 这意味着在需要深度推理的 Agent 场景中, 用户无法同时使用思考模式和工具调用——必须二选一.</p>
<p>这个问题在后续版本中得到解决:</p>
<ul>
<li><strong>V3.2-Exp (2025 年 9 月)</strong>: 引入 DeepSeek Sparse Attention(DSA)的同时, 开始支持思考模式下的工具调用.</li>
<li><strong>V3.2 正式版 (2025 年 12 月)</strong>: 完全集成思考模式下的工具使用.</li>
</ul>
<blockquote>
<p>从工程角度看, 思考模式不支持工具调用的根本原因在于: 工具调用需要模型生成结构化的函数调用 JSON, 而思考模式下的 CoT 生成是非结构化的自由文本. 两者的生成策略(token 采样参数、停止条件、格式约束)存在冲突. 解决这一冲突需要在后训练阶段专门构建&quot;思考 + 工具调用&quot;的混合数据集, 并设计能够同时处理自由文本推理和结构化工具调用的 Chat Template.</p>
</blockquote>
<h3 id="5-2-bshjzdmsqhbwd">5.2 部署环境中的模式切换不稳定</h3>
<p>社区实践(特别是 sglang 部署环境)揭示了 V3.1 混合推理模式的一个工程问题: <strong>模式切换不稳定</strong>.</p>
<p>具体表现:</p>
<ul>
<li>无论 <code>thinking</code> 参数设置为 True 还是 False, 模型可能随机返回思考或非思考结果.</li>
<li>在某些配置下, 思考模式始终无法生效.</li>
<li>启用 speculative decoding 和 constrained decoding 时, 混合推理模型可能出现异常行为.</li>
</ul>
<p>根因分析:</p>
<ul>
<li>sglang 的 reasoning parser 对 DeepSeek-V3.1 的 Chat Template 解析可能存在 bug.</li>
<li>混合推理模型对推理框架的兼容性要求较高, 需要框架正确识别和处理 <code>reasoning_content</code> 与 <code>content</code> 的分离.</li>
<li>DeepSeek-V3.2 在 sglang 中的实践表明, 默认 system prompt 可能影响 thinking 模式的性能(有测试显示, 移除默认 system prompt 后 GPQA-Diamond 从 79.3 提升至 85.4).</li>
</ul>
<h3 id="5-3-fskmsd-quot-nlfy-quot">5.3 非思考模式的&quot;能力封印&quot;</h3>
<p>混合推理模式的一个根本 trade-off 是: 非思考模式下, 模型的推理潜力被&quot;封印&quot;.</p>
<p>这意味着:</p>
<ul>
<li>用户选择快速响应时, 模型不会展示其完整的推理能力.</li>
<li>如果用户低估了问题的复杂度, 可能在非思考模式下得到次优答案.</li>
<li>与专用推理模型(如 R1)相比, V3.1 的思考模式在极端复杂任务上可能存在性能差距.</li>
</ul>
<blockquote>
<p>这个局限的本质是: 混合推理模式用&quot;推理能力的可调性&quot;换取了&quot;基础设施的简洁性&quot;, 但在某些场景下, 用户可能需要比 V3.1 思考模式更强的推理能力. 这也是 DeepSeek 继续维护 R1 系列的原因之一——R1 专注于推理能力的极致优化, 而 V3.1 追求通用性和易用性的平衡.</p>
</blockquote>
<hr>
<h2 id="6-dhydyxyzw">6 对行业的影响与展望</h2>
<h3 id="6-1-cphqs-quot-ygmxmzdzxq-quot">6.1 产品化趋势: &quot;一个模型满足多种需求&quot;</h3>
<p>V3.1 的混合推理模式代表了 2025 年 LLM 产品化的一个重要趋势: <strong>用单一模型覆盖多样化的用户需求</strong>.</p>
<p>全球主要厂商都在探索这一方向:</p>
<ul>
<li><strong>DeepSeek</strong>: &quot;一个模型两种行为&quot;(Chat Template 切换)</li>
<li><strong>OpenAI</strong>: &quot;一个系统拖三个模型&quot;(GPT-5 的系统编排)</li>
<li><strong>阿里 Qwen</strong>: 曾经尝试混合推理(Qwen3), 但后来回归分离策略(Qwen3.5)</li>
</ul>
<p>这种趋势反映了市场对简化用户体验的强烈诉求——普通用户不希望为简单问题和复杂问题分别选择不同模型.</p>
<h3 id="6-2-jsyjfx">6.2 技术演进方向</h3>
<p>从 V3.1 到 V3.2 的演进揭示了混合推理模式的两个发展方向:</p>
<ol>
<li><p><strong>思考模式的工具调用支持</strong>: V3.2 解决了 V3.1 的最大产品局限, 使思考模式真正成为 Agent 场景的可用选项.</p>
</li>
<li><p><strong>长上下文与推理的协同优化</strong>: V3.1 的 840B 继续预训练为长上下文能力奠定了基础, V3.2 在此基础上引入 DeepSeek Sparse Attention(DSA), 进一步降低长上下文推理的计算成本.</p>
</li>
</ol>
<h3 id="6-3-dkysqdqs">6.3 对开源社区的启示</h3>
<p>V3.1 的混合推理模式为开源社区提供了一个重要的参考架构:</p>
<ul>
<li><strong>Chat Template 作为产品化工具</strong>: 传统上 Chat Template 被视为&quot;格式化对话历史&quot;的工具, V3.1 展示了它也可以成为&quot;控制模型行为&quot;的产品化机制.</li>
<li><strong>后训练数据的多模式设计</strong>: 混合推理的实现依赖于后训练阶段同时包含&quot;直接回答&quot;和&quot;逐步推理&quot;两种样本, 这为其他开源模型的训练数据设计提供了参考.</li>
</ul>
<hr>
<h2 id="fl-gjsyb">附录: 关键术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Hybrid Inference</td>
<td align="left">混合推理, 指同一模型支持多种推理模式的架构</td>
</tr>
<tr>
<td align="left">Chat Template</td>
<td align="left">聊天模板, 用于格式化对话历史并控制模型生成行为的 jinja 模板</td>
</tr>
<tr>
<td align="left">Chat Template Kwargs</td>
<td align="left">传递给 Chat Template 的关键字参数, 用于动态控制模板行为</td>
</tr>
<tr>
<td align="left">Reasoning Effort</td>
<td align="left">推理努力程度, DeepSeek API 中控制思考深度的参数</td>
</tr>
<tr>
<td align="left">Thinking Budget</td>
<td align="left">思考预算, Qwen3 中控制推理 token 最大数量的机制</td>
</tr>
<tr>
<td align="left">CoT (Chain-of-Thought)</td>
<td align="left">思维链, 模型在给出最终答案前生成的逐步推理过程</td>
</tr>
<tr>
<td align="left">Reasoning Parser</td>
<td align="left">推理解析器, 推理框架中用于识别和分离推理内容与最终答案的组件</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 DeepSeek-V3.1 核心技术专题. 完整演进脉络见《01-DeepSeek-V3.1演进细节精译.md》, 部署实践参考见《05-DeepSeek-V3.1-Index.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsmxyhhtl","text":"1 设计动机: 为什么需要混合推理"},{"level":3,"id":"1-1-ctfadlnkj","text":"1.1 传统方案的两难困境"},{"level":3,"id":"1-2-deep-seek-dhxdc","text":"1.2 DeepSeek 的核心洞察"},{"level":2,"id":"2-jsyl-chat-template-rhqdmsqh","text":"2 技术原理: Chat Template 如何驱动模式切换"},{"level":3,"id":"2-1-sxjzgl","text":"2.1 实现机制概览"},{"level":3,"id":"2-2-chat-template-djtsx","text":"2.2 Chat Template 的具体实现"},{"level":3,"id":"2-3-api-cmdkzjk","text":"2.3 API 层面的控制接口"},{"level":2,"id":"3-gcsx-cmbdtllsx","text":"3 工程实现: 从模板到推理流水线"},{"level":3,"id":"3-1-vllm-bszdsj","text":"3.1 vLLM 部署中的实践"},{"level":3,"id":"3-2-tllsxdgjxj","text":"3.2 推理流水线的关键细节"},{"level":2,"id":"4-tldb-yjhhtlfadszlx","text":"4 同类对比: 业界混合推理方案的三种路线"},{"level":3,"id":"4-1-lxy-chat-template-tjfz-deep-seek-v3-1","text":"4.1 路线一: Chat Template 条件分支(DeepSeek-V3.1)"},{"level":3,"id":"4-2-lxe-tschzkz-qwen3","text":"4.2 路线二: 提示词后缀控制(Qwen3)"},{"level":3,"id":"4-3-lxs-xtbpdmx-gpt-5","text":"4.3 路线三: 系统编排多模型(GPT-5)"},{"level":3,"id":"4-4-szlxddbzj","text":"4.4 三种路线的对比总结"},{"level":2,"id":"5-jxxygcfx","text":"5 局限性与工程风险"},{"level":3,"id":"5-1-skmsbzcgjty-csbb","text":"5.1 思考模式不支持工具调用(初始版本)"},{"level":3,"id":"5-2-bshjzdmsqhbwd","text":"5.2 部署环境中的模式切换不稳定"},{"level":3,"id":"5-3-fskmsd-quot-nlfy-quot","text":"5.3 非思考模式的&quot;能力封印&quot;"},{"level":2,"id":"6-dhydyxyzw","text":"6 对行业的影响与展望"},{"level":3,"id":"6-1-cphqs-quot-ygmxmzdzxq-quot","text":"6.1 产品化趋势: &quot;一个模型满足多种需求&quot;"},{"level":3,"id":"6-2-jsyjfx","text":"6.2 技术演进方向"},{"level":3,"id":"6-3-dkysqdqs","text":"6.3 对开源社区的启示"},{"level":2,"id":"fl-gjsyb","text":"附录: 关键术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-hhtlmsdsjysx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-hhtlmsdsjysx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.1 混合推理模式的设计与实现</h1>
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
