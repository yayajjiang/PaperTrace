"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5 DSA 动态稀疏注意力的集成与适配</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 GLM-5 技术报告(arXiv:2602.15763)及 DeepSeek DSA 相关文献, 对 GLM-5 系列最核心的架构改进——DeepSeek Sparse Attention(DSA)的集成与适配——进行系统性技术剖析. 重点分析 DSA 的核心机制、GLM-5 的继续预训练适配策略, 以及与其他稀疏注意力路线的对比.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsm-glm-5-xzyr-dsa">1 设计动机: 为什么 GLM-5 选择引入 DSA</h2>
<h3 id="1-1-csxwtldcbpj">1.1 长上下文推理的成本瓶颈</h3>
<p>GLM-5 的目标场景是&quot;复杂系统工程与长程 Agent 任务&quot;, 这要求模型能够处理长达 200K tokens 的上下文. 在传统的密集注意力(Dense Attention)机制下, 注意力计算的复杂度为 O(L^2), 其中 L 为序列长度. 这意味着当 L = 128K 时, 注意力计算的计算量约为 L = 4K 时的 1024 倍. KV Cache 的显存占用同样随序列长度线性增长, 128K 上下文下的 KV Cache 可能占据数百 GB 显存.</p>
<p>对于 GLM-5 这样的 744B MoE 模型, 如果不解决长上下文推理的效率问题, 200K 上下文的实际部署将极其昂贵, 甚至不可行.</p>
<h3 id="1-2-wsmxz-dsa-efzy">1.2 为什么选择 DSA 而非自研</h3>
<p>GLM-5 技术报告明确承认, DSA 是直接采用 DeepSeek-V3.2-Exp 提出的稀疏注意力机制. 这一决策反映了智谱 AI 的工程务实: DSA 已在 DeepSeek-V3.2-Exp 中得到验证, 其&quot;密集预热 + 稀疏适应&quot;训练策略已证明可以在不从头训练的情况下将密集注意力模型转换为稀疏注意力模型, 且与现有 Transformer 架构高度兼容.</p>
<blockquote>
<p>这里值得停下来想一下. 在 AI 领域, &quot;技术引进&quot;往往被视为缺乏创新能力, 但 GLM-5 的决策展示了另一种工程智慧: 在成熟技术基础上快速构建差异化能力, 而非在基础设施层面重复造轮子. 智谱 AI 的核心差异化不在于 DSA 本身, 而在于如何将 DSA 与自身的 MoE 架构、异步 RL 基础设施(slime)和 Agent 训练数据相结合.</p>
</blockquote>
<hr>
<h2 id="2-jsyl-dsa-dhxjz">2 技术原理: DSA 的核心机制</h2>
<h3 id="2-1-cmjzylddtxszyl">2.1 从密集注意力到动态稀疏注意力</h3>
<p>传统 Transformer 的 Self-Attention 计算复杂度为 O(L^2 * d). DSA 的核心洞察是: 在长上下文中, 90% 以上的注意力权重是冗余的. 每个 token 实际上只需要关注少数&quot;重要&quot;的 token, 而非全部 L 个 token.</p>
<p>DSA 通过 <strong>两阶段动态选择机制</strong> 实现稀疏化:</p>
<p><strong>阶段一: Lightning Indexer(闪电索引器)</strong></p>
<ul>
<li>对每个查询 token, 使用轻量级索引器快速扫描整个序列.</li>
<li>基于内容的语义相似性, 为每个查询 token 筛选出一组候选关键 token(从 L 压缩到 K, K 远小于 L).</li>
</ul>
<p><strong>阶段二: Token Selector(令牌选择器)</strong></p>
<ul>
<li>在候选集 K 上执行精确的注意力计算.</li>
<li>根据注意力权重进一步精修, 只保留最重要的 S 个 token(S 不大于 K).</li>
<li>最终注意力计算仅在 S 个 token 上进行.</li>
</ul>
<h3 id="2-2-dtefgddxsms">2.2 动态而非固定的稀疏模式</h3>
<p>DSA 与早期稀疏注意力方案(如 Sliding Window 的固定模式)的关键区别在于: <strong>稀疏模式是动态决定的, 而非预定义</strong>.</p>
<ul>
<li>固定模式: 无论输入内容如何, 每个 token 总是关注相同位置的 token. 可能遗漏远距离关键信息.</li>
<li>动态模式(DSA): 每个 token 关注的范围取决于输入内容本身. 对于代码中的函数调用, 模型可能关注函数定义的位置; 对于文档问答, 模型可能关注相关段落的位置.</li>
</ul>
<h3 id="2-3-y-moe-jgdxt">2.3 与 MoE 架构的协同</h3>
<p>GLM-5 的 DSA 与 MoE 架构形成了协同效应:</p>
<ul>
<li>MoE 在模型参数维度上稀疏: 每个 token 只激活 40B 参数(占总参数 744B 的 5.4%).</li>
<li>DSA 在注意力计算维度上稀疏: 每个 token 只关注少数关键 token.</li>
</ul>
<p>两者叠加, 使得 GLM-5 在 200K 上下文下仍能保持可接受的推理成本.</p>
<hr>
<h2 id="3-gcsx-glm-5-d-dsa-sp">3 工程实现: GLM-5 的 DSA 适配</h2>
<h3 id="3-1-jxyxldljdcl">3.1 继续预训练的两阶段策略</h3>
<p>GLM-5 不是从头训练 DSA, 而是基于已有的 MLA(Multi-Head Latent Attention)密集基础模型进行继续预训练. 这遵循了 DeepSeek-V3.2-Exp 提出的&quot;密集预热 + 稀疏适应&quot;策略:</p>
<p><strong>阶段一: 密集预热(Dense Warm-up)</strong></p>
<ul>
<li>步数: 1000 步</li>
<li>每步配置: 14 个序列, 每个序列 202,752 tokens</li>
<li>最大学习率: 5e-3</li>
<li>目标: 让模型初步适应稀疏注意力的计算模式, 同时避免剧烈的知识遗忘.</li>
</ul>
<p><strong>阶段二: 稀疏适应(Sparse Adaptation)</strong></p>
<ul>
<li>训练数据: 20B tokens</li>
<li>学习率: 恒定 1e-5</li>
<li>目标: 在保持长上下文能力的同时, 充分训练模型利用稀疏注意力进行高效推理.</li>
</ul>
<p>值得注意的是, GLM-5 的 DSA 训练预算(20B tokens)远小于 DeepSeek-V3.2-Exp 的 943.7B tokens. 这表明 GLM-5 的适配是&quot;轻量级&quot;的——不需要海量数据, 只需让模型学会在已有知识的基础上利用稀疏注意力即可.</p>
<h3 id="3-2-jgcsdtz">3.2 架构参数的调整</h3>
<p>GLM-5 在引入 DSA 的同时, 对架构参数进行了相应调整(相比 GLM-4.5):</p>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="left">GLM-4.5</th>
<th align="left">GLM-5</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数量</td>
<td align="left">355B</td>
<td align="left">744B</td>
</tr>
<tr>
<td align="left">激活参数量</td>
<td align="left">32B</td>
<td align="left">40B</td>
</tr>
<tr>
<td align="left">Dense Layers</td>
<td align="left">3</td>
<td align="left">3</td>
</tr>
<tr>
<td align="left">MoE Layers</td>
<td align="left">89</td>
<td align="left">75</td>
</tr>
<tr>
<td align="left">Hidden Dim</td>
<td align="left">5120</td>
<td align="left">6144</td>
</tr>
<tr>
<td align="left">Attention Heads</td>
<td align="left">96</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left">Indexer Attn Heads</td>
<td align="left">-</td>
<td align="left">32</td>
</tr>
<tr>
<td align="left">Indexer Head Dim</td>
<td align="left">-</td>
<td align="left">128</td>
</tr>
<tr>
<td align="left">专家总数</td>
<td align="left">160</td>
<td align="left">256</td>
</tr>
</tbody></table>
<p>关键变化:</p>
<ul>
<li><strong>Attention Heads 从 96 降至 64</strong>: 为 Indexer Attn Heads(32)留出空间, 总注意力头数保持 96.</li>
<li><strong>新增 Indexer Attn Heads 和 Indexer Head Dim</strong>: 专门用于 Lightning Indexer 的计算.</li>
<li><strong>MoE Layers 从 89 降至 75</strong>: 可能为了在总参数量增长的同时控制推理延迟.</li>
</ul>
<h3 id="3-3-xgyz">3.3 效果验证</h3>
<p>GLM-5 技术报告提供了 DSA 与 MLA 在长上下文基准上的对比:</p>
<table>
<thead>
<tr>
<th align="left">基准测试</th>
<th align="left">MLA</th>
<th align="left">DSA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MQ-NIAH-128k</td>
<td align="left">100.0</td>
<td align="left">100.0</td>
</tr>
<tr>
<td align="left">MV-NIAH-128k</td>
<td align="left">95.5</td>
<td align="left">97.0</td>
</tr>
<tr>
<td align="left">SQuAD-128k</td>
<td align="left">79.7</td>
<td align="left">86.0</td>
</tr>
<tr>
<td align="left">HotpotQA-128k</td>
<td align="left">66.3</td>
<td align="left">63.0</td>
</tr>
</tbody></table>
<p>关键发现:</p>
<ul>
<li>在 needle-in-a-haystack 测试(MQ-NIAH、MV-NIAH)上, DSA 与 MLA 持平或略优.</li>
<li>在文档问答(SQuAD)上, DSA 显著优于 MLA(86.0 vs 79.7).</li>
<li>在多跳推理(HotpotQA)上, DSA 略低于 MLA(63.0 vs 66.3).</li>
<li>SFT 损失曲线显示, DSA 模型与 MLA 模型在训练损失和评测基准上持平.</li>
<li>注意力计算减少约 1.5-2x.</li>
</ul>
<blockquote>
<p>这些数据揭示了一个重要洞察: DSA 的稀疏化并非&quot;免费的午餐&quot;. 虽然在大多数任务上性能持平甚至提升, 但在需要复杂多跳推理的任务(HotpotQA)上略有下降. 这是因为动态稀疏注意力可能遗漏某些远距离但关键的关联信息. 对于 GLM-5 的目标场景(代码生成、Agent 任务)而言, 这种 trade-off 是可接受的——代码中的关键信息通常是局部相关的(如函数定义与调用点), 而 Agent 任务的上下文更多是&quot;序列化&quot;的(步骤 1 -&gt; 步骤 2 -&gt; 步骤 3), 不需要频繁的多跳关联.</p>
</blockquote>
<hr>
<h2 id="4-tldb-xszyldstjslx">4 同类对比: 稀疏注意力的三条技术路线</h2>
<h3 id="4-1-dsa-deep-seek-sparse-attention-dtnrgz">4.1 DSA(DeepSeek Sparse Attention): 动态内容感知</h3>
<p><strong>核心机制</strong>: 基于内容语义相似性的动态 token 选择.
<strong>优势</strong>: 不遗漏远距离关键信息, 适应性强.
<strong>劣势</strong>: 需要额外的索引器计算, 实现复杂度较高.
<strong>代表模型</strong>: DeepSeek-V3.2, GLM-5.</p>
<h3 id="4-2-csa-hca-compressed-sparse-attention-hybrid-compressed-attention-fcys">4.2 CSA + HCA(Compressed Sparse Attention + Hybrid Compressed Attention): 分层压缩</h3>
<p><strong>核心机制</strong>: 将长序列分层压缩为短序列, 在压缩后的序列上进行注意力计算.
<strong>优势</strong>: 压缩比高, 极端长上下文(1M+)下效率显著.
<strong>劣势</strong>: 压缩过程可能丢失细粒度信息.
<strong>代表模型</strong>: DeepSeek-V4.</p>
<h3 id="4-3-lightning-attention-xxzyljs">4.3 Lightning Attention: 线性注意力近似</h3>
<p><strong>核心机制</strong>: 用核技巧将注意力计算近似为线性复杂度.
<strong>优势</strong>: 理论复杂度最低 O(L), 适合极长序列.
<strong>劣势</strong>: 近似误差可能导致质量下降, 对某些任务不适用.
<strong>代表模型</strong>: MiniMax-M2.1.</p>
<h3 id="4-4-szlxddbzj">4.4 三种路线的对比总结</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">DSA</th>
<th align="left">CSA+HCA</th>
<th align="left">Lightning Attention</th>
</tr>
</thead>
<tbody><tr>
<td align="left">复杂度</td>
<td align="left">O(L * K)</td>
<td align="left">O(L * log L)</td>
<td align="left">O(L)</td>
</tr>
<tr>
<td align="left">稀疏模式</td>
<td align="left">动态, 内容感知</td>
<td align="left">静态, 分层压缩</td>
<td align="left">静态, 核近似</td>
</tr>
<tr>
<td align="left">长距离能力</td>
<td align="left">强</td>
<td align="left">中</td>
<td align="left">弱</td>
</tr>
<tr>
<td align="left">实现复杂度</td>
<td align="left">高</td>
<td align="left">中</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left">适用场景</td>
<td align="left">通用长上下文</td>
<td align="left">极端长上下文</td>
<td align="left">超长序列生成</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-jxxygcfx">5 局限性与工程风险</h2>
<h3 id="5-1-jsyjdylfx">5.1 技术引进的依赖风险</h3>
<p>GLM-5 的 DSA 直接采用 DeepSeek 的技术, 这意味着:</p>
<ul>
<li>如果 DeepSeek 后续对 DSA 进行重大升级, GLM-5 需要跟进适配.</li>
<li>如果 DSA 在某些边缘场景下存在未发现的问题, GLM-5 也会继承这些问题.</li>
<li>智谱 AI 在稀疏注意力领域的自主创新能力可能受到质疑.</li>
</ul>
<h3 id="5-2-dttlrwdxnxj">5.2 多跳推理任务的性能下降</h3>
<p>HotpotQA-128k 的评测结果显示, DSA 在多跳推理任务上略低于 MLA(63.0 vs 66.3). 虽然差距不大, 但这揭示了动态稀疏注意力的一个固有限界: 当任务需要频繁跨越远距离进行多跳关联时, 稀疏化可能遗漏关键的中间节点.</p>
<p>对于 GLM-5-Turbo 的目标场景(高吞吐量 Agent 工作负载), 这一局限的影响相对有限——Agent 任务的上下文通常是顺序执行的, 不需要频繁的多跳关联. 但如果用户将 GLM-5-Turbo 用于需要复杂知识图谱遍历的任务, 这一局限可能成为瓶颈.</p>
<h3 id="5-3-gcxpspdtz">5.3 国产芯片适配的挑战</h3>
<p>GLM-5 声称在华为昇腾等国产芯片上完成了深度优化, 但 DSA 的动态稀疏计算模式对硬件的特殊要求(如不规则的内存访问模式)可能与国产芯片的架构特性不完全匹配. 从工程角度看, 在国产芯片上高效实现动态稀疏注意力是一个持续的优化挑战.</p>
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
<td align="left">DSA</td>
<td align="left">DeepSeek Sparse Attention, 动态稀疏注意力机制</td>
</tr>
<tr>
<td align="left">Lightning Indexer</td>
<td align="left">闪电索引器, DSA 的第一阶段快速筛选组件</td>
</tr>
<tr>
<td align="left">Token Selector</td>
<td align="left">令牌选择器, DSA 的第二阶段精确选择组件</td>
</tr>
<tr>
<td align="left">Dense Warm-up</td>
<td align="left">密集预热, DSA 训练的第一阶段</td>
</tr>
<tr>
<td align="left">Sparse Adaptation</td>
<td align="left">稀疏适应, DSA 训练的第二阶段</td>
</tr>
<tr>
<td align="left">MLA</td>
<td align="left">Multi-Head Latent Attention, 多头潜在注意力</td>
</tr>
<tr>
<td align="left">Indexer Attn Heads</td>
<td align="left">索引器注意力头, 专门用于 Lightning Indexer 计算的注意力头</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 GLM-5-Turbo 核心技术专题. 完整演进脉络见《01-GLM-5-Turbo技术报告精译.md》, 部署实践参考见《05-GLM-5-Turbo-Index.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsm-glm-5-xzyr-dsa","text":"1 设计动机: 为什么 GLM-5 选择引入 DSA"},{"level":3,"id":"1-1-csxwtldcbpj","text":"1.1 长上下文推理的成本瓶颈"},{"level":3,"id":"1-2-wsmxz-dsa-efzy","text":"1.2 为什么选择 DSA 而非自研"},{"level":2,"id":"2-jsyl-dsa-dhxjz","text":"2 技术原理: DSA 的核心机制"},{"level":3,"id":"2-1-cmjzylddtxszyl","text":"2.1 从密集注意力到动态稀疏注意力"},{"level":3,"id":"2-2-dtefgddxsms","text":"2.2 动态而非固定的稀疏模式"},{"level":3,"id":"2-3-y-moe-jgdxt","text":"2.3 与 MoE 架构的协同"},{"level":2,"id":"3-gcsx-glm-5-d-dsa-sp","text":"3 工程实现: GLM-5 的 DSA 适配"},{"level":3,"id":"3-1-jxyxldljdcl","text":"3.1 继续预训练的两阶段策略"},{"level":3,"id":"3-2-jgcsdtz","text":"3.2 架构参数的调整"},{"level":3,"id":"3-3-xgyz","text":"3.3 效果验证"},{"level":2,"id":"4-tldb-xszyldstjslx","text":"4 同类对比: 稀疏注意力的三条技术路线"},{"level":3,"id":"4-1-dsa-deep-seek-sparse-attention-dtnrgz","text":"4.1 DSA(DeepSeek Sparse Attention): 动态内容感知"},{"level":3,"id":"4-2-csa-hca-compressed-sparse-attention-hybrid-compressed-attention-fcys","text":"4.2 CSA + HCA(Compressed Sparse Attention + Hybrid Compressed Attention): 分层压缩"},{"level":3,"id":"4-3-lightning-attention-xxzyljs","text":"4.3 Lightning Attention: 线性注意力近似"},{"level":3,"id":"4-4-szlxddbzj","text":"4.4 三种路线的对比总结"},{"level":2,"id":"5-jxxygcfx","text":"5 局限性与工程风险"},{"level":3,"id":"5-1-jsyjdylfx","text":"5.1 技术引进的依赖风险"},{"level":3,"id":"5-2-dttlrwdxnxj","text":"5.2 多跳推理任务的性能下降"},{"level":3,"id":"5-3-gcxpspdtz","text":"5.3 国产芯片适配的挑战"},{"level":2,"id":"fl-gjsyb","text":"附录: 关键术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/09-glm-5-turbo/05-glm-5-turbo-dsa-dtxszyldjcysp" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/09-glm-5-turbo/05-glm-5-turbo-dsa-dtxszyldjcysp" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5 DSA 动态稀疏注意力的集成与适配</h1>
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
