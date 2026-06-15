"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V2</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>DeepSeek-V2 是 DeepSeek 的架构创世纪模型，首次提出 MLA 和 DeepSeekMoE 架构。</p>
</blockquote>
<p>DeepSeek-V2 是 DeepSeek 从 Dense 模型路线正式切入大规模 MoE 路线的关键拐点。它不是单纯把参数做大，而是在同一篇技术报告里同时给出两条工程主线：一条用 <code>MLA</code> 解决超长上下文和大批量推理时的 <code>KV Cache</code> 瓶颈，另一条用 <code>DeepSeekMoE</code> 解决大模型训练成本、专家专业化与分布式通信压力之间的平衡问题。后续的 <code>DeepSeek-V3</code>、<code>DeepSeek-R1</code> 乃至多个国产开源家族，都直接站在这篇报告提出的结构之上继续扩展。</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/03-deep-seek-v2/01-deep-seek-v2-jsbgjy">01-DeepSeek-V2 技术报告精读</a></td>
<td align="left">技术报告全文精译</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/03-deep-seek-v2/02-deep-seek-v2-hxjgpx">02-DeepSeek-V2 核心架构剖析</a></td>
<td align="left">核心架构深度剖析</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-V2 MinerU-EN</a></td>
<td align="left">原始英文 Markdown(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-V2 MinerU-ZH</a></td>
<td align="left">中英对照+译者注(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/03-deep-seek-v2/05-deep-seek-v2-mla">05-DeepSeek-V2 MLA 深度解析</a></td>
<td align="left">MLA 架构深度解读</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/03-deep-seek-v2/05-deep-seek-v2-deep-seek-mo-e">05-DeepSeek-V2 DeepSeekMoE 深度解析</a></td>
<td align="left">DeepSeekMoE 架构深度解读</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>这篇报告围绕三个彼此耦合的工程问题展开：</p>
<ol>
<li>标准 <code>MHA</code> 在长上下文推理中需要缓存全部历史 <code>K/V</code>，导致显存和吞吐量成为上限。</li>
<li>传统 <code>MoE</code> 虽然能用稀疏激活降低计算量，但容易出现专家不够专业、共享知识重复学习以及跨卡通信爆炸的问题。</li>
<li>开源双语大模型需要在有限训练预算下同时兼顾英文、中文、代码、数学和对话能力，不能只在单项 benchmark 上堆料。</li>
</ol>
<p>DeepSeek-V2 的回答不是引入某个局部技巧，而是把 <code>注意力压缩</code>、<code>专家路由</code>、<code>负载均衡</code>、<code>长上下文扩展</code> 和 <code>后训练对齐</code> 组织成一条完整的系统链路。</p>
<h2 id="ffcj">方法拆解</h2>
<p><code>MLA</code> 的核心是把高维 key/value 先压缩进低维潜在向量，再在需要时通过投影恢复，从而把 <code>KV Cache</code> 从 <code>2 n_h d_h l</code> 压到与 <code>d_c</code> 成正比的级别。为了不破坏 <code>RoPE</code> 的位置编码能力，DeepSeek-V2 额外引入了解耦的 <code>RoPE</code> 分支，让压缩缓存与位置信息分开建模。这样既保住了缓存压缩收益，也避免了推理阶段重新展开全部历史 key 的代价。</p>
<p><code>DeepSeekMoE</code> 的核心是“细粒度路由专家 + 共享专家隔离”。共享专家承接所有 token 都会用到的通用知识，路由专家承接更窄、更深的领域能力。再配合 <code>Top-K</code> 路由、设备受限路由、专家级/设备级/通信级均衡损失，以及训练时的 token-dropping，模型才能在参数总量大幅扩容时仍维持真实可训练、可部署的状态。</p>
<p>预训练和后训练阶段也服务于这两条主线：预训练在 <code>8.1T</code> 高质量双语语料上完成，随后通过 <code>YaRN</code> 把上下文从 <code>4K</code> 扩到 <code>128K</code>，再通过 <code>SFT + GRPO</code> 做两阶段对齐，先强化推理任务，再对齐通用偏好。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程视角看，DeepSeek-V2 的真正价值不只是提出了 <code>MLA</code> 和 <code>DeepSeekMoE</code>，而是证明了这些设计在真实集群上能闭环：</p>
<ul>
<li>训练侧：在 H800 集群上通过流水线并行、专家并行、通信与共享专家计算重叠、定制 CUDA kernel，把 MoE 的理论省算力收益变成真实 GPU 小时节省。</li>
<li>推理侧：通过 <code>MLA + FP8 + KV Cache 量化</code> 把显存占用与吞吐量一起压到可服务范围内，使单节点生成吞吐量显著超过前一代 Dense 模型。</li>
<li>路由侧：设备受限路由把专家选择从“全局最优”收缩成“局部近优”，这是一个非常典型的工程取舍，用少量理论最优性换取通信可控性。</li>
<li>对齐侧：<code>GRPO</code> 不再依赖与策略模型同规模的 value model，降低了超大模型做 RL 的显存压力，也为后续 <code>R1</code> 的纯 RL 演进提供了过渡路径。</li>
</ul>
<p>所以 DeepSeek-V2 不是单篇论文里拼接多个技巧，而是一套兼顾训练经济性、推理效率和能力上限的系统设计。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>如果要理解 DeepSeek 家族为何能从 <code>67B Dense</code> 走到后来的 <code>V3</code>、<code>R1</code>，DeepSeek-V2 是必须补的一环。它奠定了两件事：</p>
<ol>
<li><code>MLA</code> 证明了注意力压缩可以不以明显掉点为代价，反而可能带来更强性能和更高吞吐。</li>
<li><code>DeepSeekMoE</code> 证明了大规模开源 <code>MoE</code> 可以通过更细的专家设计与更强的分布式控制策略进入工程实用区间。</li>
</ol>
<p>它的边界也很清楚：英文常识能力仍受训练数据规模限制; 辅助损失式负载均衡在后续被证明还有优化空间; 长上下文扩展更多说明“能撑住 128K”，不等于已经解决所有长文档推理问题。换句话说，DeepSeek-V2 是架构基线和工程里程碑，不是最终答案，但后续答案基本都从这里长出来。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/03-deep-seek-v2/05-deep-seek-v2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/03-deep-seek-v2/05-deep-seek-v2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V2</h1>
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
