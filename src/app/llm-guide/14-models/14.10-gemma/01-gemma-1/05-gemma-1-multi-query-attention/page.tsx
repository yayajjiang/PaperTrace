"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma-1 Multi-Query Attention 深度解析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文定位: Gemma-1 技术报告第 2 节 &quot;Model Architecture&quot;
关联文档: <code>01-Gemma-1技术报告精译.md</code> 第 2 节; <code>04-Gemma-1-mineru-zh.md</code> 第 2 节译者注</p>
</blockquote>
<hr>
<h2 id="1-wtbj-kv-cache-dncpj">1 问题背景: KV Cache 的内存瓶颈</h2>
<p>Transformer 解码器在自回归生成过程中, 为了避免重复计算, 通常将历史 token 的 Key 和 Value 张量缓存起来, 称为 KV Cache. 对于标准的多头注意力(Multi-Head Attention, MHA), 设:</p>
<ul>
<li>批大小为 b</li>
<li>序列长度为 s</li>
<li>注意力头数为 h</li>
<li>每个头的维度为 d_h</li>
<li>层数为 L</li>
</ul>
<p>则每层 KV Cache 的显存占用为:</p>
<pre><code>Memory_KV = 2 * b * s * h * d_h * sizeof(dtype)
</code></pre>
<p>其中因子 2 对应 Key 和 Value 两个张量. 以 Gemma-1 7B 模型为例:</p>
<ul>
<li>h = 16, d_h = 256, L = 28</li>
<li>在 FP16 下, 每层 KV Cache = 2 * 1 * s * 16 * 256 * 2 = 16,384 * s bytes</li>
<li>28 层总计 = 458,752 * s bytes ≈ 0.44 * s MB</li>
</ul>
<p>对于 8192 的上下文长度, 7B 模型的 KV Cache 约为 3.6GB——这几乎与模型权重本身(7B * 2B = 14GB FP16)相当. 对于端侧部署(手机、嵌入式设备), 这一内存开销是不可接受的.</p>
<blockquote>
<p>思考节点: KV Cache 内存问题是端侧大模型部署的核心瓶颈, 而非计算量. 训练时的 FLOPs 与推理时的内存占用是两个独立的优化目标. Gemma-1 的 2B 模型专为&quot;CPU 和端侧应用&quot;设计, 这意味着推理内存比训练效率更重要. Google 因此选择了牺牲一定表达能力来换取内存效率的架构方案.</p>
</blockquote>
<hr>
<h2 id="2-yl-c-mha-d-mqa">2 原理: 从 MHA 到 MQA</h2>
<h3 id="2-1-bzdtzyl-mha">2.1 标准多头注意力 (MHA)</h3>
<p>标准 Transformer 中, 每个注意力头 i 独立计算其 Query、Key、Value:</p>
<pre><code>Q_i = X * W_Q_i    (shape: [b, s, d_h])
K_i = X * W_K_i    (shape: [b, s, d_h])
V_i = X * W_V_i    (shape: [b, s, d_h])

Attention_i = softmax(Q_i * K_i^T / sqrt(d_h)) * V_i
</code></pre>
<p>所有 h 个头的输出拼接后通过线性投影:</p>
<pre><code>Output = Concat(Attention_1, ..., Attention_h) * W_O
</code></pre>
<p>MHA 的优势是表达能力: 每个头可以独立关注不同的语义子空间. 但代价是 KV Cache 与头数 h 成正比.</p>
<h3 id="2-2-dcxzyl-mqa">2.2 多查询注意力 (MQA)</h3>
<p>MQA(Shazeer, 2019)的核心思想是: 让所有注意力头共享同一组 Key 和 Value, 仅保留独立的 Query 投影:</p>
<pre><code>Q_i = X * W_Q_i    (shape: [b, s, d_h])  -- 每个头独立
K   = X * W_K      (shape: [b, s, d_h])  -- 所有头共享
V   = X * W_V      (shape: [b, s, d_h])  -- 所有头共享

Attention_i = softmax(Q_i * K^T / sqrt(d_h)) * V
</code></pre>
<p>KV Cache 内存从 <code>2 * b * s * h * d_h</code> 降低到 <code>2 * b * s * d_h</code>, 即减少了 h 倍.</p>
<p>以 Gemma-1 2B 模型为例:</p>
<ul>
<li>h = 8, d_h = 256, L = 18</li>
<li>MQA 每层 KV Cache = 2 * 1 * s * 1 * 256 * 2 = 1,024 * s bytes</li>
<li>18 层总计 = 18,432 * s bytes ≈ 0.018 * s MB</li>
</ul>
<p>对于 8192 上下文, 2B 模型的 KV Cache 仅为约 150MB——相比同等参数规模的 MHA 方案(约 1.2GB)减少了 8 倍.</p>
<h3 id="2-3-sxdjxfx">2.3 数学等价性分析</h3>
<p>MQA 可以视为 MHA 的一种结构化约束: 强制所有头的 K 和 V 投影矩阵相同. 从信息论角度, MHA 的 KV 总参数量为 <code>2 * h * d_model * d_h</code>, 而 MQA 为 <code>2 * d_model * d_h</code>, 即减少了 h 倍.</p>
<p>这种约束的直观解释是: 单个共享的 KV 表示需要编码所有注意力头所需的信息. 如果不同头关注的信息子空间高度正交, 这种共享会造成信息瓶颈; 但如果子空间之间存在冗余(经验上通常如此), 共享带来的损失有限.</p>
<hr>
<h2 id="3-gemma-1-dsjdj">3 Gemma-1 的设计动机</h2>
<h3 id="3-1-gmyldjgxz">3.1 规模依赖的架构选择</h3>
<p>Gemma-1 采用了<strong>规模依赖的注意力策略</strong>:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>注意力类型</th>
<th>num_kv_heads</th>
<th>设计理由</th>
</tr>
</thead>
<tbody><tr>
<td>2B</td>
<td>MQA</td>
<td>1</td>
<td>端侧内存约束优先</td>
</tr>
<tr>
<td>7B</td>
<td>MHA</td>
<td>16</td>
<td>表达能力优先</td>
</tr>
</tbody></table>
<p>Google 明确说明这一选择&quot;基于消融实验表明多查询注意力在小规模上表现良好&quot;. 这暗示了一个关键的规模阈值效应: 当模型容量足够大时(7B), MHA 的表达能力优势超过了 MQA 的内存优势; 但当模型需要极度压缩时(2B), MQA 的质量损失在可接受范围内.</p>
<blockquote>
<p>思考节点: 这一&quot;规模阈值&quot;的存在说明架构选择不是绝对的, 而是与部署约束和模型容量共同决定. 后续 Gemma-2 统一采用 GQA(分组查询注意力, num_kv_heads = num_heads / 2), 表明 Google 认为 GQA 是在 2B-27B 范围内更优的通用解. GQA 可以视为 MHA 和 MQA 之间的连续谱, 通过调整 num_kv_heads 来平衡内存和表达能力.</p>
</blockquote>
<h3 id="3-2-dcbsdgcys">3.2 端侧部署的工程约束</h3>
<p>Gemma-1 2B 模型的目标场景明确为&quot;CPU 和端侧应用&quot;. 在这一场景下:</p>
<ol>
<li><strong>内存是首要约束</strong>: 手机通常只有 4-12GB RAM, 需要为操作系统和其他应用保留空间</li>
<li><strong>延迟敏感度</strong>: 端侧用户期望近乎即时的响应, KV Cache 的内存带宽成为瓶颈</li>
<li><strong>功耗限制</strong>: 移动设备的散热和电池限制了持续高负载计算</li>
</ol>
<p>MQA 同时缓解了这三个约束: 更小的 KV Cache 减少内存占用和带宽压力, 更低参数量的注意力层也减少了计算量.</p>
<hr>
<h2 id="4-tldb-mha-vs-mqa-vs-gqa">4 同类对比: MHA vs. MQA vs. GQA</h2>
<table>
<thead>
<tr>
<th>维度</th>
<th>MHA</th>
<th>MQA</th>
<th>GQA</th>
</tr>
</thead>
<tbody><tr>
<td>KV Cache 内存</td>
<td>O(h)</td>
<td>O(1)</td>
<td>O(g)</td>
</tr>
<tr>
<td>表达能力</td>
<td>最强</td>
<td>最弱</td>
<td>中等</td>
</tr>
<tr>
<td>训练稳定性</td>
<td>标准</td>
<td>需调整</td>
<td>中等</td>
</tr>
<tr>
<td>推理吞吐量</td>
<td>低</td>
<td>高</td>
<td>中-高</td>
</tr>
<tr>
<td>代表模型</td>
<td>Gemma-1 7B, LLaMA-2</td>
<td>Gemma-1 2B, PaLM</td>
<td>Gemma-2, LLaMA-3, Mistral</td>
</tr>
</tbody></table>
<p>其中 g 为 KV 组数, GQA 中 <code>1 &lt; g &lt; h</code>. GQA(Ainslie et al., 2023)将 h 个查询头分为 g 组, 每组共享一组 KV, 是 MHA 和 MQA 的连续插值.</p>
<h3 id="4-1-y-palm-ddb">4.1 与 PaLM 的对比</h3>
<p>PaLM(Chowdhery et al., 2022)是 MQA 的早期采用者之一, 在 540B 规模上使用了 MQA. 这一选择在当时引发讨论: 为什么最大的模型反而使用最&quot;压缩&quot;的注意力? 答案是 PaLM 的训练目标是最大化训练吞吐量(TPU pod 上的 FLOPs 利用率), 而非推理效率. MQA 减少了参数通信量, 在大规模分布式训练中提升了效率.</p>
<p>Gemma-1 2B 使用 MQA 的动机则完全不同: 推理内存约束而非训练效率. 同一架构选择, 不同优化目标.</p>
<h3 id="4-2-y-l-la-ma-2-3-ddb">4.2 与 LLaMA-2/3 的对比</h3>
<p>LLaMA-2(Touvron et al., 2023b)在所有规模上坚持使用 MHA, 未采用 MQA 或 GQA. LLaMA-3(Dubey et al., 2024)则全面转向 GQA. 这一演进表明 Meta 的立场变化: 从&quot;表达能力优先&quot;到&quot;推理效率优先&quot;.</p>
<p>Gemma-1 的 2B-MQA/7B-MHA 混合策略可以视为这一演进的中间态——Google 在 2024 年初已经意识到推理效率的重要性, 但尚未找到统一方案(GQA), 因此采用了规模依赖的折中.</p>
<h3 id="4-3-y-mistral-ddb">4.3 与 Mistral 的对比</h3>
<p>Mistral-7B(Jiang et al., 2023)使用 GQA(8 KV heads, 32 query heads), 是 GQA 的早期推广者之一. Mistral 的 GQA 配置(g=8)与 Gemma-2 的 GQA 类似, 表明 1/4 到 1/2 的 KV 压缩率在 7B 规模上是经验最优的.</p>
<hr>
<h2 id="5-gcsxxj">5 工程实现细节</h2>
<h3 id="5-1-hcbjyh">5.1 缓存布局优化</h3>
<p>MQA 的 KV Cache 布局与 MHA 不同. 在 MHA 中, K 和 V 通常按 <code>[batch, heads, seq, head_dim]</code> 布局; 在 MQA 中, 可以简化为 <code>[batch, seq, head_dim]</code>, 省略 heads 维度.</p>
<p>这种简化带来的额外好处:</p>
<ul>
<li><strong>内存连续性</strong>: 更紧凑的布局提高了缓存命中率</li>
<li><strong>注意力计算简化</strong>: 无需在每个头间重复加载共享的 K/V</li>
<li><strong>批处理效率</strong>: 小 batch 时内存碎片更少</li>
</ul>
<h3 id="5-2-y-flash-attention-djrx">5.2 与 FlashAttention 的兼容性</h3>
<p>FlashAttention(Dao et al., 2022)通过分块计算和 SRAM 优化减少 HBM 访问. MQA 与 FlashAttention 天然兼容: 共享的 K/V 可以在分块计算中只加载一次, 进一步减少内存带宽.</p>
<p>在 Gemma-1 2B 的推理中, MQA + FlashAttention 的组合可以实现:</p>
<ul>
<li>序列长度线性扩展(而非二次方)</li>
<li>接近计算瓶颈的理论最大吞吐量</li>
<li>端侧设备上的实时交互体验</li>
</ul>
<hr>
<h2 id="6-jxyfx">6 局限与风险</h2>
<h3 id="6-1-bdnlss">6.1 表达能力损失</h3>
<p>MQA 的结构性约束限制了注意力机制的表达能力. 在需要多头协作的复杂任务(如多步推理、跨文档信息整合)上, MQA 模型的性能可能显著低于同等规模的 MHA 模型.</p>
<p>Gemma-1 2B 在 MATH 基准上仅 11.8%, 而 7B(MHA)达到 24.3%——这一差距(超过 2 倍)不能完全用参数规模解释(7B 是 2B 的 3.5 倍, 但 MATH 提升超过 2 倍), 暗示 MQA 可能限制了数学推理能力.</p>
<h3 id="6-2-csxwth">6.2 长上下文退化</h3>
<p>虽然 MQA 减少了 KV Cache 内存, 但长上下文下的注意力质量仍可能退化. 共享的 K/V 需要编码整个长序列的信息, 当序列长度超过训练时的分布时, 注意力权重可能变得扁平化, 导致&quot;注意力消散&quot;.</p>
<h3 id="6-3-yhxjgdbjr">6.3 与后续架构的不兼容</h3>
<p>Gemma-1 的 MQA 是一个过渡性方案. 从 Gemma-2 开始, Google 全面采用 GQA, 这意味着:</p>
<ul>
<li>Gemma-1 2B 的 MQA 权重无法直接迁移到 GQA 架构</li>
<li>针对 MQA 优化的推理代码需要为 GQA 重写</li>
<li>社区基于 Gemma-1 2B 的微调和适配工作需要考虑这一架构特殊性</li>
</ul>
<hr>
<h2 id="7-jspxyyx">7 技术谱系与影响</h2>
<p>MQA 的思想起源于 Shazeer(2019), 最初是为了加速 Transformer 解码器的推理. 其发展路径如下:</p>
<pre><code>2019: MQA 提出 (Shazeer)
  |
2022: PaLM 540B 采用 MQA (Chowdhery et al.)
  |
2023: GQA 提出, 作为 MHA-MQA 的连续插值 (Ainslie et al.)
  |
2024.02: Gemma-1 2B 采用 MQA, 7B 保留 MHA
  |
2024.06: Gemma-2 全面采用 GQA (2B-27B)
  |
2024+: MQA 逐渐被 GQA 取代, 但在极端压缩场景(如 1B 以下)仍有价值
</code></pre>
<p>MQA 的遗产在于它首次系统性地证明了&quot;注意力头的 KV 共享&quot;是可行的, 为 GQA 和后续的 KV Cache 压缩方法(如 KV Cache 量化、动态缓存驱逐)开辟了道路.</p>
<hr>
<h2 id="8-jl">8 结论</h2>
<p>Multi-Query Attention 是 Gemma-1 2B 模型的核心架构创新, 也是 Google 在端侧大模型部署上的首次系统尝试. 它通过让所有注意力头共享 K/V 投影, 将 KV Cache 内存降低到头数的倒数倍, 使 2B 模型能够在消费级 CPU 上高效运行.</p>
<p>然而, MQA 的表达能力损失在复杂推理任务上表现明显, 且与后续 GQA 方案相比, 其压缩效率-质量权衡并非最优. Gemma-1 的 MQA 可以视为大模型架构从&quot;训练优先&quot;向&quot;推理优先&quot;转变过程中的一个关键实验节点——它验证了端侧部署的可行性, 同时也揭示了需要更精细的折中方案(GQA), 从而直接影响了 Gemma-2 及整个行业的架构演进.</p>
<hr>
<blockquote>
<p><strong>知识库同步</strong></p>
<p>本文档同步至: <code>docs/guide/llm/attention/mqa-gemma1.md</code>
本文档来源: <code>docs/sections/llm-guide/14-主流开源模型全景解析与技术报告精读/14.10-Gemma/01-Gemma-1/05-Gemma-1-Multi-Query-Attention.md</code></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj-kv-cache-dncpj","text":"1 问题背景: KV Cache 的内存瓶颈"},{"level":2,"id":"2-yl-c-mha-d-mqa","text":"2 原理: 从 MHA 到 MQA"},{"level":3,"id":"2-1-bzdtzyl-mha","text":"2.1 标准多头注意力 (MHA)"},{"level":3,"id":"2-2-dcxzyl-mqa","text":"2.2 多查询注意力 (MQA)"},{"level":3,"id":"2-3-sxdjxfx","text":"2.3 数学等价性分析"},{"level":2,"id":"3-gemma-1-dsjdj","text":"3 Gemma-1 的设计动机"},{"level":3,"id":"3-1-gmyldjgxz","text":"3.1 规模依赖的架构选择"},{"level":3,"id":"3-2-dcbsdgcys","text":"3.2 端侧部署的工程约束"},{"level":2,"id":"4-tldb-mha-vs-mqa-vs-gqa","text":"4 同类对比: MHA vs. MQA vs. GQA"},{"level":3,"id":"4-1-y-palm-ddb","text":"4.1 与 PaLM 的对比"},{"level":3,"id":"4-2-y-l-la-ma-2-3-ddb","text":"4.2 与 LLaMA-2/3 的对比"},{"level":3,"id":"4-3-y-mistral-ddb","text":"4.3 与 Mistral 的对比"},{"level":2,"id":"5-gcsxxj","text":"5 工程实现细节"},{"level":3,"id":"5-1-hcbjyh","text":"5.1 缓存布局优化"},{"level":3,"id":"5-2-y-flash-attention-djrx","text":"5.2 与 FlashAttention 的兼容性"},{"level":2,"id":"6-jxyfx","text":"6 局限与风险"},{"level":3,"id":"6-1-bdnlss","text":"6.1 表达能力损失"},{"level":3,"id":"6-2-csxwth","text":"6.2 长上下文退化"},{"level":3,"id":"6-3-yhxjgdbjr","text":"6.3 与后续架构的不兼容"},{"level":2,"id":"7-jspxyyx","text":"7 技术谱系与影响"},{"level":2,"id":"8-jl","text":"8 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/01-gemma-1/05-gemma-1-multi-query-attention" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/01-gemma-1/05-gemma-1-multi-query-attention" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma-1 Multi-Query Attention 深度解析</h1>
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
