"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.1: 迈向 Agent 时代的第一步</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Introducing DeepSeek-V3.1: our first step toward the agent era!
作者: DeepSeek-AI
原文链接: <a href="https://api-docs.deepseek.com/news/news250821">https://api-docs.deepseek.com/news/news250821</a>
发布日期: 2025 年 8 月 21 日
精译日期: 2026 年 5 月 18 日</p>
</blockquote>
<hr>
<h2 id="1-hxsjgl">1 核心升级概览</h2>
<p>DeepSeek-V3.1 是 DeepSeek-V3 的重要迭代版本,定位为&quot;迈向 Agent 时代的第一步&quot;。与 V3 相比,V3.1 在保持相同架构(671B 总参数,37B 激活参数,MoE)的基础上,引入了以下关键升级:</p>
<p><strong>混合推理模式</strong>。V3.1 支持思考(Think)和非思考(Non-Think)两种模式,通过 chat template 切换而非部署两个独立模型。用户可通过&quot;DeepThink&quot;按钮在两种模式间切换。</p>
<p><strong>Agent 能力增强</strong>。通过后训练优化,显著提升工具使用和多步 Agent 任务的表现,在 SWE-Bench 和 Terminal-Bench 等 Agent 基准上取得更好结果。</p>
<p><strong>长上下文扩展</strong>。V3.1 Base 在 V3 基础上进行 840B tokens 的继续预训练,专门用于长上下文扩展,官方部署支持 128K token 上下文窗口。</p>
<p><strong>Tokenizer 与 Chat Template 更新</strong>。新的 tokenizer 配置和聊天模板,支持更 robust 的多轮对话行为和更清晰的推理/非推理模式切换。</p>
<hr>
<h2 id="2-mxjgyxl">2 模型架构与训练</h2>
<h3 id="2-1-jc-v3-djgjc">2.1 继承 V3 的架构基础</h3>
<p>DeepSeek-V3.1 的模型架构与 V3 完全一致:</p>
<ul>
<li><strong>总参数量</strong>: 671B</li>
<li><strong>激活参数</strong>: 37B per token</li>
<li><strong>架构</strong>: DeepSeekMoE + MLA(Multi-Head Latent Attention)</li>
<li><strong>上下文窗口</strong>: 128K(官方部署)</li>
<li><strong>许可证</strong>: MIT(开源权重)</li>
</ul>
<p>这种架构继承性意味着 V3.1 的部署和推理基础设施与 V3 完全兼容,现有用户可无缝迁移。</p>
<h3 id="2-2-840b-tokens-jxyxl">2.2 840B Tokens 继续预训练</h3>
<p>V3.1 Base 的核心训练工作是在 V3 基础上进行 840B tokens 的继续预训练,专门用于长上下文扩展。训练分为两个阶段:</p>
<p><strong>阶段 1: 32K 上下文扩展</strong></p>
<ul>
<li>训练数据: 630B tokens</li>
<li>上下文长度: 32K</li>
<li>学习率: 7.3 x 10^-6(与 V3 预训练最终学习率一致)</li>
<li>对比 V3: V3 的 32K 扩展阶段仅使用约 63B tokens,V3.1 将其增加 10 倍至 630B tokens</li>
</ul>
<p><strong>阶段 2: 128K 上下文扩展</strong></p>
<ul>
<li>训练数据: 209B tokens</li>
<li>上下文长度: 128K</li>
<li>对比 V3: V3 的 128K 扩展阶段约 63B tokens,V3.1 将其增加 3.3 倍至 209B tokens</li>
</ul>
<p><strong>总训练数据</strong>: 630B + 209B = 839B tokens(约 840B)</p>
<p>这种大幅增加的继续预训练数据量表明,DeepSeek 团队认为长上下文能力不仅需要架构支持,更需要大量数据来充分训练模型理解和利用长距离依赖。</p>
<blockquote>
<p><strong>译者思考：架构细节</strong></p>
<p>V3.1 的继续预训练策略揭示了一个重要洞察:&quot;上下文扩展不是一蹴而就的微调,而是需要与原始预训练同等重视的数据密集型任务&quot;。</p>
<p>840B tokens 的继续预训练量相当于 V3 总预训练量(14.8T)的 5.7%。虽然比例不大,但专注用于长上下文场景。关键在于数据分配:32K 阶段占了 630B(75%),128K 阶段占 209B(25%)。这说明团队认为 32K 是&quot;基础长上下文能力&quot;的关键阶段,需要大量数据建立稳定的注意力模式;128K 则是在此基础上的进一步扩展。</p>
<p>学习率 7.3 x 10^-6 与 V3 预训练最终学习率一致,这是一个保守的设置——避免在继续预训练中破坏已学到的知识。这种&quot;低学习率 + 大数据量&quot;的策略是继续预训练的标准做法。</p>
</blockquote>
<h3 id="2-3-ue8-m0-fp8-wsgs">2.3 UE8M0 FP8 微缩格式</h3>
<p>V3.1 采用 UE8M0 FP8 微缩格式进行权重和激活的存储。这种格式是针对即将发布的下一代国产芯片设计的,在保持 FP8 计算效率的同时优化了 scale 参数的精度。</p>
<hr>
<h2 id="3-hhtlms">3 混合推理模式</h2>
<h3 id="3-1-ymxsms">3.1 一模型双模式</h3>
<p>DeepSeek-V3.1 最大的产品级创新是混合推理模式:同一个模型通过 chat template 切换,实现两种截然不同的行为模式:</p>
<p><strong>非思考模式(Non-Think / deepseek-chat)</strong></p>
<ul>
<li>行为特征:快速、直接响应,不展示推理过程</li>
<li>适用场景:日常对话、简单问答、快速代码生成</li>
<li>输出特点:2-3 倍更快的响应速度,更低的 token 消耗</li>
<li>上下文:128K</li>
</ul>
<p><strong>思考模式(Think / deepseek-reasoner)</strong></p>
<ul>
<li>行为特征:逐步推理,展示完整的思考链</li>
<li>适用场景:复杂数学问题、调试、战略规划</li>
<li>输出特点:透明推理过程,更高准确性,可验证的逻辑</li>
<li>上下文:128K</li>
<li>性能:DeepSeek-V3.1-Think 在保持与 DeepSeek-R1-0528 相当答案质量的同时,响应速度更快</li>
</ul>
<h3 id="3-2-msqhjz">3.2 模式切换机制</h3>
<p>两种模式不是通过加载不同模型权重实现的,而是通过 chat template 和 API 参数控制:</p>
<ul>
<li>API 用户可通过 <code>extra_body</code> 参数中的 <code>chat_template_kwargs</code> 设置 <code>thinking: True/False</code></li>
<li>Web 用户可通过&quot;DeepThink&quot;按钮切换</li>
<li>底层模型权重完全相同,只有生成策略和模板不同</li>
</ul>
<blockquote>
<p><strong>译者思考：设计动机</strong></p>
<p>混合推理模式的设计是对 LLM 产品化的一次深刻反思。传统方案是为不同场景部署不同模型(如 GPT-4 和 GPT-4-o1),这带来了基础设施复杂性和切换摩擦。V3.1 的洞察是:&quot;推理能力不是模型的固有属性,而是生成策略的可调参数&quot;。</p>
<p>这种设计有多个优势:</p>
<ul>
<li><strong>基础设施简化</strong>:只需部署和维护一个模型,降低运维成本</li>
<li><strong>无缝切换</strong>:用户可在同一对话中切换模式,无需更换模型</li>
<li><strong>一致性保障</strong>:两种模式共享相同的知识库和语言能力,避免&quot;这个模型知道但那个模型不知道&quot;的问题</li>
</ul>
<p>但代价也存在:思考模式需要更长的生成时间,在非思考模式下模型的推理潜力被&quot;封印&quot;。这本质上是在&quot;延迟&quot;和&quot;质量&quot;之间提供一个用户可控的权衡。</p>
<p>值得注意的是,DeepSeek 不是第一个尝试混合模型的(阿里 Qwen 曾走过类似路线但后来放弃了),但 V3.1 的实现方式(通过 chat template 切换)比 Qwen 的方案更轻量。GPT-5 则采用了&quot;一个系统拖三个模型&quot;的架构,与 V3.1 的&quot;一个模型两种行为&quot;形成了有趣的对比。</p>
</blockquote>
<hr>
<h2 id="4-agent-nlts">4 Agent 能力提升</h2>
<h3 id="4-1-hxlyhfx">4.1 后训练优化方向</h3>
<p>V3.1 的后训练专门针对 Agent 场景进行了优化:</p>
<ul>
<li><strong>工具使用</strong>:更准确的函数调用和参数填充</li>
<li><strong>多步推理</strong>:在复杂搜索任务中更强的多步推理能力</li>
<li><strong>Agent 基准</strong>:在 SWE-Bench 和 Terminal-Bench 上取得显著提升</li>
<li><strong>严格函数调用</strong>:Beta API 支持 Strict Function Calling 模式</li>
</ul>
<h3 id="4-2-api-stzc">4.2 API 生态支持</h3>
<p>为支持 Agent 开发,V3.1 的 API 进行了多项升级:</p>
<ul>
<li><strong>Anthropic API 格式兼容</strong>:支持 Claude 风格的 API 调用</li>
<li><strong>严格函数调用</strong>:Beta 阶段支持 Strict Function Calling,确保工具调用的格式正确性</li>
<li><strong>128K 上下文</strong>:思考和非思考模式均支持 128K 上下文,满足长文档和代码库分析需求</li>
</ul>
<hr>
<h2 id="5-tokenizer-y-chat-template-gx">5 Tokenizer 与 Chat Template 更新</h2>
<p>V3.1 引入了新的 tokenizer 配置和聊天模板,主要改进包括:</p>
<ul>
<li>更 robust 的多轮对话行为</li>
<li>支持混合推理模式的模板切换</li>
<li>改进的系统消息处理</li>
</ul>
<p>新的 tokenizer 配置可在 Hugging Face 获取:<a href="https://huggingface.co/deepseek-ai/DeepSeek-V3.1/blob/main/tokenizer_config.json">https://huggingface.co/deepseek-ai/DeepSeek-V3.1/blob/main/tokenizer_config.json</a></p>
<hr>
<h2 id="6-kyybs">6 开源与部署</h2>
<h3 id="6-1-kyqz">6.1 开源权重</h3>
<p>DeepSeek-V3.1 完全开源,提供两个 checkpoint:</p>
<ul>
<li><strong>DeepSeek-V3.1-Base</strong>:基础模型,面向二次预训练或领域自适应</li>
<li><strong>DeepSeek-V3.1</strong>:指令对齐模型,支持思考/非思考双模式</li>
</ul>
<p>两者均在 Hugging Face 上以 MIT 许可证发布,支持商业使用。</p>
<h3 id="6-2-dj">6.2 定价</h3>
<p>V3.1 的 API 定价(2025 年 9 月 5 日后):</p>
<table>
<thead>
<tr>
<th>模式</th>
<th>输入(缓存命中)</th>
<th>输入(缓存未命中)</th>
<th>输出</th>
</tr>
</thead>
<tbody><tr>
<td>非思考</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.28</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mi mathvariant="normal">∣</mi><mtext>更高</mtext><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.28/M tokens | 更高 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.28/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mord">∣</span><span class="mord cjk_fallback">更高</span><span class="mord">∣</span></span></span></span>1.68/M tokens</td>
<td></td>
<td></td>
</tr>
<tr>
<td>思考</td>
<td>同上</td>
<td>同上</td>
<td>更高(因生成更多推理 token)</td>
</tr>
</tbody></table>
<h3 id="6-3-bsjrx">6.3 部署兼容性</h3>
<p>由于 V3.1 的模型架构与 V3 完全相同,现有 V3 的部署方案可直接复用:</p>
<ul>
<li><strong>vLLM</strong>:支持 FP8 和 BF16 推理</li>
<li><strong>SGLang</strong>:完全支持 BF16 和 FP8</li>
<li><strong>TensorRT-LLM</strong>:支持 BF16 和 INT4/8 量化</li>
<li><strong>LMDeploy</strong>:支持 FP8 和 BF16</li>
<li><strong>华为昇腾 NPU</strong>:支持 INT8 和 BF16</li>
</ul>
<hr>
<h2 id="7-xndw">7 性能定位</h2>
<h3 id="7-1-y-v3-ddb">7.1 与 V3 的对比</h3>
<p>V3.1 在以下方面相对 V3 有显著提升:</p>
<ul>
<li><strong>长上下文</strong>:128K 官方部署(vs V3 的 64K 官方限制)</li>
<li><strong>Agent 任务</strong>:SWE-Bench 和 Terminal-Bench 提升显著</li>
<li><strong>思考效率</strong>:V3.1-Think 比 R1-0528 更快达到相同答案质量</li>
<li><strong>工具调用</strong>:多步 Agent 任务表现更强</li>
</ul>
<h3 id="7-2-yjpdb">7.2 与竞品对比</h3>
<p>从第三方评测看,V3.1 在以下场景具有竞争力:</p>
<ul>
<li><strong>代码 Agent</strong>:在 SWE-Bench 等任务上接近或超越 Claude Sonnet 4.5</li>
<li><strong>成本效率</strong>:以约 Claude 4 Sonnet 11% 的成本达到可比性能</li>
<li><strong>长上下文</strong>:128K 原生支持,无需 RoPE 外推</li>
</ul>
<hr>
<h2 id="8-jxxyhxyj">8 局限性与后续演进</h2>
<h3 id="8-1-dqjx">8.1 当前局限</h3>
<ol>
<li><strong>无独立技术报告</strong>:V3.1 未发布独立技术报告,详细训练细节有限</li>
<li><strong>思考模式无工具使用</strong>:初始版本中思考模式不支持工具调用(后续 V3.2 解决)</li>
<li><strong>知识边界未扩展</strong>:840B 继续预训练主要聚焦长上下文,世界知识未显著增强</li>
</ol>
<h3 id="8-2-hxyj">8.2 后续演进</h3>
<p>V3.1 的迭代路径清晰:</p>
<ul>
<li><strong>V3.1-Terminus</strong>(2025 年 9 月):修复语言一致性(中英文混杂)和 Agent 稳定性问题</li>
<li><strong>V3.2-Exp</strong>(2025 年 9 月):基于 V3.1-Terminus,引入 DeepSeek Sparse Attention(DSA),进一步降低长上下文计算成本</li>
<li><strong>V3.2</strong>(2025 年 12 月):正式版,集成思考模式下的工具使用</li>
</ul>
<blockquote>
<p><strong>译者思考：技术谱系</strong></p>
<p>DeepSeek-V3.1 在 DeepSeek 技术谱系中扮演&quot;承上启下&quot;的角色:</p>
<ul>
<li><strong>承上</strong>:继承 V3 的架构和预训练成果,通过 840B 继续预训练扩展长上下文</li>
<li><strong>启下</strong>:为 V3.2 的 DSA 和长上下文优化奠定基础,V3.2 的基座 checkpoint 即从 V3.1-Terminus 开始</li>
</ul>
<p>从更宏观的视角看,V3.1 代表了 2025 年 LLM 产品化的一个重要趋势:&quot;混合推理&quot;。全球主要厂商都在探索如何在单一模型中同时提供快速响应和深度推理:GPT-5 用系统编排多个模型,Qwen 曾尝试但后来放弃,V3.1 则通过 chat template 实现了最轻量的方案。这种趋势反映了市场对&quot;一个模型满足多种需求&quot;的强烈诉求——用户不希望为简单问题和复杂问题分别选择不同模型。</p>
<p>V3.1 的 840B 继续预训练数据量虽然相比 V3 的 14.8T 不大,但其&quot;专注度&quot;是关键:所有额外数据都用于长上下文场景。这种&quot;定向增强&quot;策略比&quot;全面重新训练&quot;更高效,也为后续 V3.2 的 DSA 架构提供了充分训练的长上下文基础能力。</p>
</blockquote>
<hr>
<h2 id="fl-gjsjsc">附录:关键数据速查</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>V3.1</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2025-08-21</td>
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
<td>架构</td>
<td>DeepSeekMoE + MLA</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>128K</td>
</tr>
<tr>
<td>继续预训练数据</td>
<td>840B tokens</td>
</tr>
<tr>
<td>32K 扩展数据</td>
<td>630B tokens</td>
</tr>
<tr>
<td>128K 扩展数据</td>
<td>209B tokens</td>
</tr>
<tr>
<td>训练格式</td>
<td>UE8M0 FP8</td>
</tr>
<tr>
<td>许可证</td>
<td>MIT</td>
</tr>
<tr>
<td>输入定价</td>
<td>~\$0.28/M tokens</td>
</tr>
<tr>
<td>输出定价</td>
<td>~\$1.68/M tokens</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>译者注</strong>:DeepSeek-V3.1 没有发布独立技术报告,本文基于官方 API 文档公告、Hugging Face 模型卡、第三方技术解读和知乎专栏文章综合整理。核心训练细节(如 840B 继续预训练的具体数据构成、学习率调度细节)来自社区分析而非官方披露,读者应注意区分官方信息和技术推测。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxsjgl","text":"1 核心升级概览"},{"level":2,"id":"2-mxjgyxl","text":"2 模型架构与训练"},{"level":3,"id":"2-1-jc-v3-djgjc","text":"2.1 继承 V3 的架构基础"},{"level":3,"id":"2-2-840b-tokens-jxyxl","text":"2.2 840B Tokens 继续预训练"},{"level":3,"id":"2-3-ue8-m0-fp8-wsgs","text":"2.3 UE8M0 FP8 微缩格式"},{"level":2,"id":"3-hhtlms","text":"3 混合推理模式"},{"level":3,"id":"3-1-ymxsms","text":"3.1 一模型双模式"},{"level":3,"id":"3-2-msqhjz","text":"3.2 模式切换机制"},{"level":2,"id":"4-agent-nlts","text":"4 Agent 能力提升"},{"level":3,"id":"4-1-hxlyhfx","text":"4.1 后训练优化方向"},{"level":3,"id":"4-2-api-stzc","text":"4.2 API 生态支持"},{"level":2,"id":"5-tokenizer-y-chat-template-gx","text":"5 Tokenizer 与 Chat Template 更新"},{"level":2,"id":"6-kyybs","text":"6 开源与部署"},{"level":3,"id":"6-1-kyqz","text":"6.1 开源权重"},{"level":3,"id":"6-2-dj","text":"6.2 定价"},{"level":3,"id":"6-3-bsjrx","text":"6.3 部署兼容性"},{"level":2,"id":"7-xndw","text":"7 性能定位"},{"level":3,"id":"7-1-y-v3-ddb","text":"7.1 与 V3 的对比"},{"level":3,"id":"7-2-yjpdb","text":"7.2 与竞品对比"},{"level":2,"id":"8-jxxyhxyj","text":"8 局限性与后续演进"},{"level":3,"id":"8-1-dqjx","text":"8.1 当前局限"},{"level":3,"id":"8-2-hxyj","text":"8.2 后续演进"},{"level":2,"id":"fl-gjsjsc","text":"附录:关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/01-deep-seek-v3.1-yjxjjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/01-deep-seek-v3.1-yjxjjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.1: 迈向 Agent 时代的第一步</h1>
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
