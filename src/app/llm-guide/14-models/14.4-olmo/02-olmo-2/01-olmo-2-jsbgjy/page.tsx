"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo 2 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: 2 OLMo 2 Furious
原文链接: <a href="https://arxiv.org/abs/2501.00656">https://arxiv.org/abs/2501.00656</a>
发布日期: 2025.01
发布机构: Allen Institute for AI (AI2)</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>过去一年中, 开放语言模型生态系统发展迅速. 我们见证了来自成熟开发者和新贡献者的开放权重模型激增——Llama 3、DBRX、Yi 1.5、Qwen 2、Falcon、Mistral、Phi 等, 以及 Gemma、Grok、Command R 等新参与者——大幅缩小了公开可用系统与封闭系统之间的差距. 然而, 这些开放权重模型仅仅是复杂语言模型配方和复杂开发流水线的最终产物, 仅凭它们本身不足以支持对语言模型行为和用途的多样化研究.</p>
<p>作为回应, 包括我们的首个 OLMo、Pythia、Amber、DCLM、MAP Neo 和 SmolLM 在内的先前工作采取了完全开放的方法, 不仅发布模型权重, 还发布训练数据、训练代码和文档化的配方以支持复现. 完全开放语言建模工作的产物在研究语言模型的训练动态、概念获取和记忆化方面发挥了关键作用. 尽管有这些进展, 最佳报告性能的模型与开放模型之间仍然存在差距.</p>
<p>现代语言模型开发是一个迭代过程, 当前迭代的局限性 motivates 未来的发展. 我们的先前发布 (OLMo-0424) 专注于通过更好的预训练数据混合和课程来提高关键任务 (如 MMLU) 的性能. 在本技术报告中, 我们介绍 OLMo 2, 一个在多达 6T token 上训练的 7B、13B 和 32B 模型新家族. 在英语学术基准上, 这些模型与开放权重 Llama 3.1、Qwen 2.5 和 Gemma 2 家族具有竞争力. 我们通过应用 Tulu 3 配方进一步验证预训练模型作为下游后训练有效基座模型的能力. 由此产生的模型家族 OLMo 2 Instruct 与强大的开放权重模型甚至一些流行的专有模型 (如 GPT-3.5 Turbo 和 GPT 4o Mini) 具有竞争力.</p>
<p>本技术报告聚焦于 OLMo 2 开发期间的四个关键领域:</p>
<ol>
<li><strong>训练稳定性</strong>: 语言模型训练运行经常 plagued by 训练不稳定性和 loss spikes, 这些代价高昂且已知会对最终模型性能产生不利影响.</li>
<li><strong>退火</strong>: 我们将预训练分为两个阶段, 后者 mid-training 阶段用于注入新知识和修补能力缺陷.</li>
<li><strong>后训练</strong>: 基于 Tulu 3 配方构建 OLMo 2 Instruct, 展示基座模型改进如何转化为更好的聊天变体.</li>
<li><strong>基础设施</strong>: 高性能和可靠的基础设施对成功预训练至关重要.</li>
</ol>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: OLMo 2 的标题 &quot;2 OLMo 2 Furious&quot; 是一个有趣的 wordplay, 既暗示了这是第二代 OLMo, 又呼应了电影 &quot;Fast and Furious&quot; 系列——暗示速度、迭代和性能追求. 但从技术角度看, OLMo 2 的核心贡献不是单一突破, 而是系统性地缩小了 &quot;完全开放模型&quot; 与 &quot;开放权重 SOTA&quot; 之间的差距. 在 OLMo 1 时代, 完全开放模型 (如 Pythia、BLOOM、OLMo 1) 的性能明显落后于仅开放权重的模型 (如 Llama 2). OLMo 2 的目标是证明: 在不牺牲开放性的前提下, 也可以达到 competitive 的性能. 这是一个重要的信号, 因为它表明 &quot;开放性&quot; 和 &quot;性能&quot; 之间的 trade-off 并非不可逾越.</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>开放语言模型生态系统在过去一年中发展迅速. 我们见证了来自成熟开发者——Llama 3、DBRX、Yi 1.5、Qwen 2、Falcon、Mistral、Ministral、Phi——和新贡献者——Gemma、Grok、Command R——的开放权重模型激增, 大幅缩小了公开可用与封闭系统之间的差距. 然而, 这些开放权重模型仅仅是复杂语言模型配方和复杂开发流水线的最终产物, 仅凭它们本身不足以支持对语言模型行为和用途的多样化研究.</p>
<p>作为回应, 包括我们的首个 OLMo、Pythia、Amber、DCLM、MAP Neo 和 SmolLM 在内的先前工作采取了完全开放的方法, 不仅发布模型权重, 还发布训练数据、训练代码和文档化的配方以支持复现. 完全开放语言建模工作的产物在研究训练动态、概念获取和记忆化方面发挥了关键作用; 此外, 它们还催生了新技术和模型. 尽管有这些进展, 最佳报告性能的模型与开放模型之间仍然存在差距.</p>
<p>现代语言模型开发是一个迭代过程, 当前迭代的局限性 motivates 未来的发展. 我们的先前发布 (OLMo-0424) 专注于通过更好的预训练数据混合和课程来提高关键任务 (如 MMLU) 上的性能. 在本技术报告中, 我们介绍 OLMo 2, 一个在多达 6T token 上训练的 7B、13B 和 32B 模型新家族. 在英语学术基准上, 这些模型与开放权重 Llama 3.1、Qwen 2.5 和 Gemma 2 家族具有竞争力. 我们通过应用 Tulu 3 配方进一步验证预训练模型作为下游后训练有效基座模型的能力. 由此产生的模型家族 OLMo 2 Instruct 与强大的开放权重模型甚至一些流行的专有模型 (如 GPT-3.5 Turbo 和 GPT 4o Mini) 具有竞争力.</p>
<hr>
<h2 id="2-olmo-2-jz">2. OLMo 2 家族</h2>
<p>本节提供 OLMo 2 的概览, 并突出相比 OLMo-0424 和先前 OLMo 模型的改进. OLMo 2 家族拥有更多的 token、更多的参数和更好的下游任务结果. 我们解释在使 state-of-the-art 语言模型可访问的使命中实现 competitive 结果所需的关键细节. 因此, 我们在可能的情况下以 Apache 2.0 许可证开放发布所有训练代码、数据和配方.</p>
<h3 id="2-1-mxjg">2.1 模型架构</h3>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">OLMo 1 (0224)</th>
<th align="left">OLMo-0424</th>
<th align="left">OLMo 2</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Biases</strong></td>
<td align="left">None</td>
<td align="left">None</td>
<td align="left">None</td>
</tr>
<tr>
<td align="left"><strong>Activation</strong></td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
</tr>
<tr>
<td align="left"><strong>RoPE theta</strong></td>
<td align="left">1e4</td>
<td align="left">1e4</td>
<td align="left">5e5</td>
</tr>
<tr>
<td align="left"><strong>QKV Normalization</strong></td>
<td align="left">None</td>
<td align="left">Clip to 8</td>
<td align="left">QK-Norm</td>
</tr>
<tr>
<td align="left"><strong>Layer Norm</strong></td>
<td align="left">non-parametric</td>
<td align="left">non-parametric</td>
<td align="left">RMSNorm</td>
</tr>
<tr>
<td align="left"><strong>Layer Norm Applied to</strong></td>
<td align="left">Inputs</td>
<td align="left">Inputs</td>
<td align="left">Outputs</td>
</tr>
<tr>
<td align="left"><strong>Z-Loss Weight</strong></td>
<td align="left">0</td>
<td align="left">0</td>
<td align="left">1e-5</td>
</tr>
<tr>
<td align="left"><strong>Weight Decay on Embeddings</strong></td>
<td align="left">Yes</td>
<td align="left">Yes</td>
<td align="left">No</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: OLMo 家族模型架构随时间的演变. 最新 OLMo 2 的变化由显示改善训练稳定性的实验驱动.</p>
</blockquote>
<p>我们采用基于 vaswani2017attention 的 decoder-only Transformer 架构, 提供 7B、13B 和 32B 参数变体. 我们的架构与 OLMo 的第一代迭代非常相似, 有几处变化以提高训练稳定性和性能.</p>
<p>原始 OLMo 修改了 decoder-only Transformer 架构, 包含: 无偏置项; SwiGLU 激活函数; 旋转位置编码 (RoPE).</p>
<p>在构建 OLMo-0424 时, 我们做出了训练稳定性和下游性能的修改: QKV Clipping (用于训练稳定性); 上下文从 2048 增加到 4096.</p>
<p>本工作进一步引入 OLMo 2 的修改:</p>
<ul>
<li><strong>RMSNorm</strong>: 我们使用 RMSNorm 变体的 LayerNorm 来归一化激活, 替代非参数化 LayerNorm.</li>
<li><strong>重排 norm</strong>: 我们在每个 Transformer 块内归一化 attention 和 feedforward (MLP) 层的输出, 而非输入. 公式变为:<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mo>:</mo><mo>=</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\pmb{h} := \\pmb{x} + \\text{RMSNorm}(\\text{Attention}(\\pmb{x}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mclose">))</span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mtext>out</mtext></msub><mo>:</mo><mo>=</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>MLP</mtext><mo stretchy="false">(</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\pmb{h}_{\\text{out}} := \\pmb{h} + \\text{RMSNorm}(\\text{MLP}(\\pmb{x}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">MLP</span></span><span class="mopen">(</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mclose">))</span></span></span></span></span></li>
<li><strong>QK-norm</strong>: 在计算 attention 之前用 RMSNorm 归一化 key 和 query 投影. 这避免 attention logits 过大, 可能导致训练 loss 发散.</li>
<li><strong>Z-Loss</strong>: 采用 z-loss 正则化,  empirically 显示可改善运行稳定性.</li>
<li><strong>RoPE theta = 5e5</strong>: 将 RoPE theta 从 10,000 增加到 500,000, 增加位置编码的分辨率.</li>
</ul>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: OLMo 2 的架构演进非常有条理. 从 OLMo 1 到 OLMo-0424 到 OLMo 2, 每一次迭代都针对一个具体的稳定性问题. 非参数化 LayerNorm → RMSNorm 是因为 &quot;bugs were no longer an issue, the hardware was faster&quot;; QKV Clipping → QK-Norm 是因为 clipping 是一个 &quot;workaround&quot; 而 QK-Norm 是更 principled 的解决方案; 输入 norm → 输出 norm (Post-LN) 是一个重要的结构变化, 它改变了残差流的梯度传播路径. 最值得注意的是, OLMo 2 同时使用了 &quot;输出 RMSNorm + QK-Norm + Z-Loss&quot; 三项 stability-oriented 修改, 而论文后面的实验表明单独使用任何一项都不如组合使用有效. 这揭示了一个 engineering insight: 训练稳定性通常不是单一问题, 而是多个因素 (数据、初始化、归一化、优化器) 的耦合效应.</p>
</blockquote>
<h3 id="2-2-fcq">2.2 分词器</h3>
<p>OLMo 1 和 OLMo-0424 使用 GPT-NeoX-20B 分词器的修改版本, 包含用于遮蔽个人身份信息 (PII) 的特殊 token.</p>
<p>遵循 tao2024scaling 的建议, 我们为 OLMo 2 采用更大的分词器词表. 我们借用 GPT-3.5 和 GPT-4 开发的 cl100k 的 pre-tokenizer 和词表, 该分词器在 Apache 2.0 下许可. 为保持与早期 Dolma 数据源的向后兼容性, 我们添加了与先前 OLMo 模型相同的遮蔽 token.</p>
<table>
<thead>
<tr>
<th align="left">分词器</th>
<th align="right">OLMES (CF)</th>
<th align="right">OLMES Gen</th>
<th align="right">MMLU (CF)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo 1 tokenizer</td>
<td align="right">59.8</td>
<td align="right">42.4</td>
<td align="right">34.8</td>
</tr>
<tr>
<td align="left">OLMo 2 tokenizer</td>
<td align="right">60.6</td>
<td align="right">42.7</td>
<td align="right">35.2</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: OLMo 1 和 OLMo 2 分词器在 1B 模型上预训练 100B token 的比较. 更大的词表在此规模下略有劣势, 但预期在更大规模上会有更大改进.</p>
</blockquote>
<h3 id="2-3-jzmxxlfa">2.3 基座模型训练方案</h3>
<p>遵循先前的 OLMo 模型以及课程学习的最新进展, OLMo 2 基座模型分两个阶段训练, 每个阶段有对应的数据混合.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">OLMo 2 7B</th>
<th align="left">OLMo 2 13B</th>
<th align="left">OLMo 2 32B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Layers</strong></td>
<td align="left">32</td>
<td align="left">40</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left"><strong>Hidden Size</strong></td>
<td align="left">4096</td>
<td align="left">5120</td>
<td align="left">5120</td>
</tr>
<tr>
<td align="left"><strong>Attention Heads (Q/KV)</strong></td>
<td align="left">32/32 (MHA)</td>
<td align="left">40/40 (MHA)</td>
<td align="left">40/8 (GQA)</td>
</tr>
<tr>
<td align="left"><strong>Batch Size</strong></td>
<td align="left">1024</td>
<td align="left">2048</td>
<td align="left">2048</td>
</tr>
<tr>
<td align="left"><strong>Sequence Length</strong></td>
<td align="left">4096</td>
<td align="left">4096</td>
<td align="left">4096</td>
</tr>
<tr>
<td align="left"><strong>Gradient Clipping</strong></td>
<td align="left">1.0</td>
<td align="left">1.0</td>
<td align="left">1.0</td>
</tr>
<tr>
<td align="left"><strong>Peak LR</strong></td>
<td align="left">3.0e-4</td>
<td align="left">9.0e-4</td>
<td align="left">6.0e-4</td>
</tr>
<tr>
<td align="left"><strong>LR Warmup</strong></td>
<td align="left">2000 steps</td>
<td align="left">2000 steps</td>
<td align="left">2000 steps</td>
</tr>
<tr>
<td align="left"><strong>LR Schedule (Cosine)</strong></td>
<td align="left">5T tokens</td>
<td align="left">5T tokens</td>
<td align="left">6.5T tokens</td>
</tr>
<tr>
<td align="left"><strong>LR Schedule Truncation</strong></td>
<td align="left">after 4T</td>
<td align="left">n/a</td>
<td align="left">after 6T</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: OLMo 2 超参数.</p>
</blockquote>
<p><strong>第一阶段: 预训练</strong>是最长的阶段 (90-95% 训练 FLOPs), 主要使用网页来源数据. 我们报告关键架构和训练细节见表 3. 关键细节包括从 multi-head attention (MHA) 切换到 grouped query attention (GQA) 以扩展 32B 模型, 受 Qwen 3 并发工作的启发. OLMo 2 训练使用截断正态分布的随机初始化, 均值为 0, 标准差为 0.02.</p>
<p><strong>第二阶段: Mid-training</strong> (5-10% 训练 FLOPs), 我们线性衰减学习率至零. 我们策划了一个更小、更聚焦的混合——Dolmino——以向模型注入来自 STEM 参考文献和高质量文本的领域知识, 以及修补初始预训练阶段后仍然缺乏的能力 (如数学解题能力).</p>
<p><strong>模型融合或 &quot;Souping&quot;</strong>: 为了充分利用这些高质量数据并找到更好的局部最小值, 我们用不同的随机数据顺序多次执行此步骤, 然后平均结果模型. 对于 OLMo 2 7B, 我们退火三次, 每次 50B token, 使用不同的随机数据顺序; 平均结果模型以产生最终模型. 对于 13B 和 32B, 我们训练三次, 每次 100B token, 然后第四次 300B token. 最终模型是四个模型的平均值.</p>
<p>总计, OLMo 2 7B 在 4.05T token 上训练 (3.90T 预训练), 13B 在 5.6T token 上训练 (5T 预训练), 32B 在 6.6T token 上训练 (6.06T 预训练).</p>
<blockquote>
<p><strong>Thinking (Training Strategy)</strong>: OLMo 2 的两阶段训练策略 (预训练 + mid-training 退火) 已经成为 2024-2025 年的主流做法, 被 Llama 3、DBRX、Phi 等模型采用. 但 OLMo 2 的独特贡献在于对退火阶段的系统性研究: (1) 学习率 plateau 现象——更高学习率在预训练早期更好, 但最终被更低学习率超越; (2) micro-annealing 技术——用极小规模 (10B token) 的快速实验来筛选数据质量; (3) 模型融合 (souping)——多个退火Checkpoint的简单平均 consistently 优于单个Checkpoint. 这些方法论层面的贡献比具体的 benchmark 分数更有价值, 因为它们可以被其他团队直接复用.</p>
</blockquote>
<h3 id="2-4-jzmxsj">2.4 基座模型数据</h3>
<h4 id="2-4-1-yxlsj-olmo-mix">2.4.1 预训练数据: OLMo-Mix</h4>
<p>预训练阶段使用的混合数据约 3.9 万亿 token, 超过 95% 来自网页数据. 我们称之为 OLMo-Mix. 这与 OLMoE 使用的相同预训练数据: 我们结合来自 DCLM 和 Dolma 1.7 的数据. 从 DCLM, 我们使用 &quot;baseline 1.0&quot; 混合. 从 Dolma, 我们使用 arXiv、OpenWebMath、Algebraic Stack、peS2o 和 Wikipedia 子集. 最后, 我们包含来自 StarCoder 的代码. 为尝试包含更高质量的代码, 我们移除 GitHub 上少于 2 个 stars 的仓库中的任何文档. 此外, 我们通过手动检查发现此来源包含二进制格式编码的文档或主要包含数值内容; 为移除它们, 我们丢弃最频繁词占文档 30% 以上或前 2 个最频繁词占 50% 以上的文档. 为减轻可能的训练 loss spikes, 我们移除包含 32 个或更多重复 n-gram 序列的文档.</p>
<h4 id="2-4-2-mid-training-sj-dolmino">2.4.2 Mid-training 数据: Dolmino</h4>
<p>在初始预训练阶段后, 我们进一步用更严格过滤质量的网页数据和领域特定高质量数据 (其中大量是合成的) 混合训练. 此混合的目的是向模型注入以数学为中心的技能并提供对 STEM 参考文献和高质量文本的聚焦 exposure. 我们生成此混合的多个变体, 规模各异, 但通常将此混合称为 Dolmino.</p>
<h3 id="2-5-pgyjg">2.5 评估与结果</h3>
<h4 id="2-5-1-jzmxpg">2.5.1 基座模型评估</h4>
<p>我们使用 OLMES 评估套件评估 OLMo 2 和其他基线模型. 此外, 为避免 overfitting 配方到这些基准, 我们维护了一个未用于模型开发决策的 held-out 任务套件; 我们倡导模型开发者声明开发 vs held-out 评估任务的标准实践.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">Avg</th>
<th align="right">FLOP x1e23</th>
<th align="right">MMLU</th>
<th align="right">ARC-C</th>
<th align="right">HSwag</th>
<th align="right">WinoG</th>
<th align="right">NQ</th>
<th align="right">DROP</th>
<th align="right">AGIEval</th>
<th align="right">GSM8K</th>
<th align="right">MMLU-PRO</th>
<th align="right">TriviaQA</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>完全开放模型</strong></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
<td align="right"></td>
</tr>
<tr>
<td align="left">Amber 7B</td>
<td align="right">35.2</td>
<td align="right">0.5</td>
<td align="right">24.7</td>
<td align="right">44.9</td>
<td align="right">74.5</td>
<td align="right">65.5</td>
<td align="right">18.7</td>
<td align="right">26.1</td>
<td align="right">21.8</td>
<td align="right">4.8</td>
<td align="right">11.7</td>
<td align="right">59.3</td>
</tr>
<tr>
<td align="left">OLMo 7B</td>
<td align="right">38.3</td>
<td align="right">1.0</td>
<td align="right">28.3</td>
<td align="right">46.4</td>
<td align="right">78.1</td>
<td align="right">68.5</td>
<td align="right">24.8</td>
<td align="right">27.3</td>
<td align="right">23.7</td>
<td align="right">9.2</td>
<td align="right">12.1</td>
<td align="right">64.1</td>
</tr>
<tr>
<td align="left">MAP Neo 7B</td>
<td align="right">49.6</td>
<td align="right">2.1</td>
<td align="right">58.0</td>
<td align="right">78.4</td>
<td align="right">72.8</td>
<td align="right">69.2</td>
<td align="right">28.9</td>
<td align="right">39.4</td>
<td align="right">45.8</td>
<td align="right">12.5</td>
<td align="right">25.9</td>
<td align="right">65.1</td>
</tr>
<tr>
<td align="left">OLMo 7B 0424</td>
<td align="right">50.7</td>
<td align="right">1.0</td>
<td align="right">54.3</td>
<td align="right">66.9</td>
<td align="right">80.1</td>
<td align="right">73.6</td>
<td align="right">29.6</td>
<td align="right">50.0</td>
<td align="right">43.9</td>
<td align="right">27.7</td>
<td align="right">22.1</td>
<td align="right">58.8</td>
</tr>
<tr>
<td align="left">DCLM 7B</td>
<td align="right">56.9</td>
<td align="right">1.0</td>
<td align="right">64.4</td>
<td align="right">79.8</td>
<td align="right">82.3</td>
<td align="right">77.3</td>
<td align="right">28.8</td>
<td align="right">39.3</td>
<td align="right">47.5</td>
<td align="right">46.1</td>
<td align="right">31.3</td>
<td align="right">72.1</td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 7B</strong></td>
<td align="right"><strong>62.9</strong></td>
<td align="right"><strong>1.8</strong></td>
<td align="right"><strong>63.7</strong></td>
<td align="right"><strong>79.8</strong></td>
<td align="right"><strong>83.8</strong></td>
<td align="right"><strong>77.2</strong></td>
<td align="right"><strong>36.9</strong></td>
<td align="right"><strong>60.9</strong></td>
<td align="right"><strong>50.4</strong></td>
<td align="right"><strong>67.5</strong></td>
<td align="right"><strong>31.0</strong></td>
<td align="right"><strong>78.0</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 13B</strong></td>
<td align="right"><strong>68.3</strong></td>
<td align="right"><strong>4.6</strong></td>
<td align="right"><strong>67.5</strong></td>
<td align="right"><strong>83.5</strong></td>
<td align="right"><strong>86.4</strong></td>
<td align="right"><strong>81.5</strong></td>
<td align="right"><strong>46.7</strong></td>
<td align="right"><strong>70.7</strong></td>
<td align="right"><strong>54.2</strong></td>
<td align="right"><strong>75.1</strong></td>
<td align="right"><strong>35.1</strong></td>
<td align="right"><strong>81.9</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 32B</strong></td>
<td align="right"><strong>73.3</strong></td>
<td align="right"><strong>13.0</strong></td>
<td align="right"><strong>74.9</strong></td>
<td align="right"><strong>90.4</strong></td>
<td align="right"><strong>89.7</strong></td>
<td align="right"><strong>83.0</strong></td>
<td align="right"><strong>50.2</strong></td>
<td align="right"><strong>74.3</strong></td>
<td align="right"><strong>61.0</strong></td>
<td align="right"><strong>78.8</strong></td>
<td align="right"><strong>46.9</strong></td>
<td align="right"><strong>88.0</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: OLMo 2 与其他基座模型在 OLMES 套件子集上的评估比较. OLMo 2 在训练 FLOPs 远少于开放权重模型的情况下达到 competitive 性能.</p>
</blockquote>
<p>总体而言, 我们发现 OLMo 2 模型与类似规模的最佳开放权重模型具有竞争力, 尽管 OLMo 2 需要远少的训练 FLOPs 并保持完全开放性 (例如训练数据). 我们发现开发指标上观察到的增益 largely 转化到我们的未见评估套件, 表明训练配方具有 generalizability.</p>
<h4 id="2-5-2-hxlypg">2.5.2 后训练与评估</h4>
<p>对于后训练, 我们应用 Tulu 3 配方, 包括监督微调、on-policy 偏好调优和强化学习与可验证奖励 (RLVR). 结果模型——OLMo 2 Instruct——在通用和精确指令遵循、数学、知识推理和安全性任务上评估.</p>
<table>
<thead>
<tr>
<th align="left">Instruct 模型</th>
<th align="right">Avg</th>
<th align="right">AE2</th>
<th align="right">BBH</th>
<th align="right">DROP</th>
<th align="right">GSM8K</th>
<th align="right">IFE</th>
<th align="right">MATH</th>
<th align="right">MMLU</th>
<th align="right">Safety</th>
<th align="right">PQA</th>
<th align="right">TQA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3.5 Turbo 0125</td>
<td align="right">60.5</td>
<td align="right">38.7</td>
<td align="right">66.6</td>
<td align="right">70.2</td>
<td align="right">74.3</td>
<td align="right">66.9</td>
<td align="right">41.2</td>
<td align="right">70.2</td>
<td align="right">69.1</td>
<td align="right">45.0</td>
<td align="right">62.9</td>
</tr>
<tr>
<td align="left">GPT 4o Mini 0724</td>
<td align="right">65.7</td>
<td align="right">49.7</td>
<td align="right">65.9</td>
<td align="right">36.3</td>
<td align="right">83.0</td>
<td align="right">83.5</td>
<td align="right">67.9</td>
<td align="right">82.2</td>
<td align="right">84.9</td>
<td align="right">39.0</td>
<td align="right">64.8</td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 1B</strong></td>
<td align="right"><strong>42.7</strong></td>
<td align="right"><strong>9.1</strong></td>
<td align="right"><strong>35.0</strong></td>
<td align="right"><strong>34.6</strong></td>
<td align="right"><strong>68.3</strong></td>
<td align="right"><strong>70.1</strong></td>
<td align="right"><strong>20.7</strong></td>
<td align="right"><strong>40.0</strong></td>
<td align="right"><strong>87.6</strong></td>
<td align="right"><strong>12.9</strong></td>
<td align="right"><strong>48.7</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 7B</strong></td>
<td align="right"><strong>56.5</strong></td>
<td align="right"><strong>29.1</strong></td>
<td align="right"><strong>51.4</strong></td>
<td align="right"><strong>60.5</strong></td>
<td align="right"><strong>85.1</strong></td>
<td align="right"><strong>72.3</strong></td>
<td align="right"><strong>32.5</strong></td>
<td align="right"><strong>61.3</strong></td>
<td align="right"><strong>93.3</strong></td>
<td align="right"><strong>23.2</strong></td>
<td align="right"><strong>56.5</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 13B</strong></td>
<td align="right"><strong>63.5</strong></td>
<td align="right"><strong>39.5</strong></td>
<td align="right"><strong>63.0</strong></td>
<td align="right"><strong>71.5</strong></td>
<td align="right"><strong>87.4</strong></td>
<td align="right"><strong>82.6</strong></td>
<td align="right"><strong>39.2</strong></td>
<td align="right"><strong>68.5</strong></td>
<td align="right"><strong>89.7</strong></td>
<td align="right"><strong>28.8</strong></td>
<td align="right"><strong>64.3</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 32B</strong></td>
<td align="right"><strong>68.8</strong></td>
<td align="right"><strong>42.8</strong></td>
<td align="right"><strong>70.6</strong></td>
<td align="right"><strong>78.0</strong></td>
<td align="right"><strong>87.6</strong></td>
<td align="right"><strong>85.6</strong></td>
<td align="right"><strong>49.7</strong></td>
<td align="right"><strong>77.3</strong></td>
<td align="right"><strong>85.9</strong></td>
<td align="right"><strong>37.5</strong></td>
<td align="right"><strong>73.2</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: OLMo 2 Instruct 结果. 缩写: AE2=AlpacaEval 2, IFE=IFEval, PQA=PopQA, TQA=TruthfulQA.</p>
</blockquote>
<p>我们发现 OLMo 2 Instruct 模型与领先的开源权重模型具有可比性能. 具体而言, OLMo 2 13B Instruct 达到了接近 Qwen 2.5 14B Instruct 的结果, 同时超越 Tulu 8B 和 Llama 3.1 8B Instruct. RLVR 阶段在两个模型规模上都展示了 consistent 的有效性.</p>
<blockquote>
<p><strong>Thinking (Performance Analysis)</strong>: 表 4 和表 5 的数据非常有力地证明了 OLMo 2 的成功. 在基座模型上, OLMo 2 7B 的 62.9 平均分超越了 DCLM 7B (56.9) 和 OLMo-0424 (50.7), 且接近 Mistral 7B (58.9) 和 Llama 3.1 8B (61.8). 在 Instruct 模型上, OLMo 2 13B 的 63.5 平均分超越 Llama 3.1 8B (59.1) 和 Tulu 3 8B (60.7), 接近 Qwen 2.5 7B (61.6). 这意味着 OLMo 2 在 &quot;完全开放&quot; 的约束下, 首次在性能上达到了 &quot;开放权重&quot; 模型的主流水平. 论文中的一个诚实披露是: &quot;we could not estimate compute for any Mistral model because their total training token count is unknown&quot;——这恰恰突显了完全开放模型的独特价值: 你可以精确知道它的训练成本.</p>
</blockquote>
<hr>
<h2 id="3-sdjx-xlwdx">3. 深度解析: 训练稳定性</h2>
<p>虽然 OLMo-0424 在其计算预算范围内达到了预期范围内的性能, 但训练动态特征有几个问题:</p>
<ul>
<li>训练期间 loss 的 sudden spikes, 更频繁地, gradient norm 的 spikes. 增加模型尺寸会增加 spikes 的频率.</li>
<li>gradient norm 幅度在训练运行期间的 slow growth, 与 gradient norm spikes 频率增加相关.</li>
</ul>
<p>最终, 这些问题的组合会导致训练发散, 使更大规模的训练变得不可能. 这种情况促使我们调查这些问题的原因及其缓解措施.</p>
<blockquote>
<p>图 1: OLMo-0424 和 OLMo 2 的训练 loss 和 gradient norm 曲线. OLMo-0424 训练运行特征为频繁的 loss spikes, 通常由更频繁的 gradient norm spikes 先行, 且随时间增长.</p>
</blockquote>
<p>我们总结以下缓解措施:</p>
<h3 id="3-1-zf-n-gram">3.1 重复 n-gram</h3>
<p>数据可以是 gradient norm 和 loss spikes 的原因. 在调查 spikes 发生的训练 batch 时, 我们发现包含长重复 n-gram 序列的实例 prevalence 很高. 在一系列实验中, 我们发现这些序列通常与 spikes 相关, 尽管这种关系不是确定性的:</p>
<ul>
<li>相同的 n-gram 序列可能对更大的模型 spike, 但对相同数据的更小模型不 spike.</li>
<li>相同的 n-gram 序列可能对一个数据训练顺序 spike, 但数据 reshuffle 后不 spike.</li>
<li>与 spike 相关的相同 n-gram 序列也可以在未 spike 的训练 batch 中找到.</li>
</ul>
<p>尽管如此, 我们发现跨训练广泛移除此类序列的证据表明平均而言减少了 spikes 频率. 在数据整理时, 我们应用过滤移除所有包含 32 个或更多重复 n-gram 的文档, 其中 n-gram 是任何 1 到 13 token 的跨度. 我们还在训练器中实现了一个额外的 safeguard, 在数据加载期间检测这些序列并在计算 loss 时 mask 它们.</p>
<blockquote>
<p>图 2: 有/无 n-gram 过滤的 gradient norm 比较. 忽略长重复 n-gram 序列消除了许多 spikes.</p>
</blockquote>
<h3 id="3-2-mxcsh">3.2 模型初始化</h3>
<p>在 OLMo 2 中, 我们用均值为 0、标准差为 0.02 的正态分布初始化每个参数. 相比之下, OLMo-0424 的初始化按 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><msqrt><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></msqrt></mrow><annotation encoding="application/x-tex">1/\\sqrt{d_{model}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1072em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span> 缩放输入投影, 并按 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><msqrt><mrow><mn>2</mn><mo>⋅</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>⋅</mo><mtext>layer_idx</mtext></mrow></msqrt></mrow><annotation encoding="application/x-tex">1/\\sqrt{2 \\cdot d_{model} \\cdot \\text{layer\\_idx}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.24em;vertical-align:-0.3628em;"></span><span class="mord">1/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8772em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">layer_idx</span></span></span></span><span style="top:-2.8372em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3628em;"><span></span></span></span></span></span></span></span></span> 缩放输出投影——即后期层初始化为更小的值.</p>
<p>我们进行几项分析来研究初始化的影响. 我们的实证分析表明它更好地保留了跨层的激活和梯度 scale, 允许更稳定地训练深层模型, 并表现出与不同宽度模型超参数迁移相关的性质.</p>
<p><strong>梯度与激活增长</strong>: 我们评估不同候选初始化如何影响跨层激活和梯度的 2-norm. 我们计算 growth exponent:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>λ</mi><mo>=</mo><mfrac><mn>1</mn><msub><mi>n</mi><mtext>layers</mtext></msub></mfrac><mi>log</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><mi mathvariant="normal">∥</mi><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><msup><mi>v</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup></mstyle><mi mathvariant="normal">∥</mi></mrow><mrow><mi mathvariant="normal">∥</mi><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>v</mi></mstyle><mi mathvariant="normal">∥</mi></mrow></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\lambda = \\frac{1}{n_\\text{layers}} \\log \\left( \\frac{\\|\\pmb{v&#x27;}\\|}{\\|\\pmb{v}\\|} \\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord text mtight"><span class="mord mtight">layers</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4289em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∥</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span class="mord">∥</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∥</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span></span><span class="mord">∥</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span>
<p>理想情况下, 两个 lambda 都接近 0, 表示激活和梯度不会跨层爆炸或消失. OLMo 2 的 growth exponent 比 OLMo-0424 更接近 0.</p>
<p><strong>跨宽度超参数迁移</strong>: 新初始化的另一个吸引人特性是它按宽度缩放激活和梯度 norm, 这被认为对跨不同宽度的超参数迁移很重要. 梯度 norm 与 OLMo 2 相比 OLMo-0424 更 positively correlated with <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{d_{model}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.1828em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span>.</p>
<p><strong>Spike Score</strong>: 由于快速 spikes 难以用当代绘图工具理解, 我们计算 spike score 作为客观度量: 时间序列中至少偏离最近 1000 个值滚动平均值七个标准差的值的百分比. OLMo-0424 的 gradient L2 norm spike score 为 0.40, 新初始化降至 0.03.</p>
<h3 id="3-3-jggj">3.3 架构改进</h3>
<p><strong>非参数化 Layer Norm 和 RMSNorm</strong>: OLMo-0424 使用非参数化 layer norm 以提高性能并解决库中的 bug. 到我们开发 OLMo 2 时, bugs 已不再是问题, 硬件更快, 我们希望采用安全的方法. 消融显示两者之间没有差异, 因此我们切换回 RMSNorm.</p>
<p><strong>重排 norm 和 QK-norm</strong>: 将 layer normalization 应用于 MLP 和 attention 块的输出而非输入. 我们在 attention 块中对 queries 和 keys 应用另一个 RMSNorm.</p>
<table>
<thead>
<tr>
<th align="left">OLMo-0424</th>
<th align="left">OLMo 2</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mo>:</mo><mo>=</mo><mi>x</mi><mo>+</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h := x + \\text{Attention}(\\text{LN}(x))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">))</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mo>:</mo><mo>=</mo><mi>x</mi><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h := x + \\text{RMSNorm}(\\text{Attention}(x))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">))</span></span></span></span></td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>out</mtext></msub><mo>:</mo><mo>=</mo><mi>h</mi><mo>+</mo><mtext>MLP</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h_\\text{out} := h + \\text{MLP}(\\text{LN}(h))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">MLP</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">))</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>out</mtext></msub><mo>:</mo><mo>=</mo><mi>h</mi><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>MLP</mtext><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h_\\text{out} := h + \\text{RMSNorm}(\\text{MLP}(h))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">MLP</span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">))</span></span></span></span></td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: Layer Normalization 位置对比.</p>
</blockquote>
<p>单独应用任一变化都不会产生良好结果, 但一起应用时改善了 gradient L2 norm 的增长和 spikiness. gradient 的 spike score 从 0.108 降至 0.069.</p>
<p><strong>Z-Loss</strong>: 我们在 loss 函数中添加 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup><mo>⋅</mo><msup><mrow><mi>log</mi><mo>⁡</mo></mrow><mn>2</mn></msup><mi>Z</mi></mrow><annotation encoding="application/x-tex">10^{-4} \\cdot \\log^2 Z</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0929em;vertical-align:-0.1944em;"></span><span class="mop"><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8984em;"><span style="top:-3.1473em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Z</mi></mrow><annotation encoding="application/x-tex">Z</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span></span></span></span> 是 logits 上 softmax 的分母. 这阻止最终 softmax 中的激活增长过大. 我们注意到 Flash Attention 的 z-loss 实现与纯 PyTorch 实现在 backward pass 中行为不同, 因此出于谨慎我们放弃了 Flash Attention 的自定义 z-loss 实现.</p>
<h3 id="3-4-ccsgj">3.4 超参数改进</h3>
<p><strong>AdamW epsilon</strong>: 将 AdamW epsilon 从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span> 是 PyTorch 的默认值, 但一些流行的 LM 训练代码库默认使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>. 较低的值允许训练早期更大的更新, 并帮助模型在学习 typically seen 大量不稳定性的时期更快学习. gradient norm 更快地稳定并永久保持更低.</p>
<blockquote>
<p>图 3: 将 AdamW epsilon 设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span> 降低并稳定了训练早期的 gradient norm. 训练 loss 也更快地改善.</p>
</blockquote>
<p><strong>Embedding 上的 Weight Decay</strong>: OLMo 使用标准 weight decay 公式, 每一步将每个参数乘以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>−</mo><mo stretchy="false">(</mo><mn>0.1</mn><mo>⋅</mo><mi>l</mi><mi>r</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">1 - (0.1 \\cdot lr)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0.1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span></span>. 对于 token embeddings, 这 overshoots 了目标并导致非常小的 embeddings. 如 spikenomore 所讨论, 小 embeddings 可以在早期层产生大梯度, 因为 layer_norm(x) 对 x 的 Jacobian 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∥</mi><mi>x</mi><mi mathvariant="normal">∥</mi></mrow><annotation encoding="application/x-tex">\\|x\\|</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord mathnormal">x</span><span class="mord">∥</span></span></span></span> 成反比. 我们简单地关闭 embeddings 的 weight decay, 观察到 embedding norms 在训练过程中稳定在健康区域.</p>
<blockquote>
<p>图 4: 应用于 token embeddings 的 weight decay 导致 embedding norm 逐渐降低和相应 gradient norm 增加. 关闭 embedding weight decay 后 spike score 从 0.16 降至 0.092.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Stability Engineering)</strong>: OLMo 2 的稳定性章节是整个论文中最有价值的部分之一, 因为它提供了 8 项具体的、经过验证的稳定性措施, 每项都有消融实验支撑. 最值得注意的 insight 是: 训练不稳定通常是多个因素的耦合效应, 而非单一原因. 数据过滤 (重复 n-gram) 消除了 ~70% 的 spikes, 但未影响 gradient norm 的缓慢增长; 初始化改进将 spike score 从 0.40 降至 0.03; 输出 RMSNorm + QK-Norm 将 spike score 从 0.108 降至 0.069; Adam epsilon 调整加速了早期收敛; 关闭 embedding weight decay 消除了 embedding norm 的衰减趋势. 这些措施的组合使 OLMo 2 能够在 32B 规模上稳定训练——而 OLMo-0424 在此规模上根本无法训练. 这种 &quot;稳定性工程&quot; 的方法论对于任何试图训练大模型的团队都极具参考价值.</p>
</blockquote>
<hr>
<h2 id="4-sdjx-th">4. 深度解析: 退火</h2>
<p>近期工作表明多阶段基座模型训练方法可以带来可测量的能力改进. 在先前 OLMo 迭代中, 我们还发现学习率 schedule 和数据混合都扮演重要角色. 我们将模型开发此阶段的干预称为 mid-training.</p>
<h3 id="4-1-xxsth">4.1 学习率退火</h3>
<p>我们的起点是 Llama 3 的设置: 7B 变体在 2000 步骤内将学习率从 0 线性预热至峰值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, 然后在 5T token 上使用标准余弦衰减. 对于 7B 变体, 我们在 4T token 处停止 schedule 并切换到 mid-training. 13B 从更高的峰值学习率开始运行, 因此我们决定运行到 5T token 再进入 mid-training 阶段.</p>
<p>我们尝试了四种额外学习率值: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>9</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">9 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">9</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>12</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">12 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">12</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>30</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">30 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">30</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>30</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">30 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">30</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 在学习率预热期间就显示训练不稳定性, 因此很快被放弃. 其他值训练正常并显示出有趣的模式: 纯看训练 loss, 更高学习率在早期 universally 表现更好 (只要不遇到 loss spikes), 但最终更低学习率设置超越其他. 值得注意的是, 比较 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, cross-over 点远超 200B token——更短的超参数实验可能得出错误结论.</p>
<blockquote>
<p>图 5: 更高学习率最初表现更好但最终被更低学习率超越. 然而, 在 50B 或 100B token 上线性衰减学习率至零产生等效的训练 loss.</p>
</blockquote>
<p>一个动机是找出更高学习率是否会使退火步骤更有效. 假设是预训练期间更差的训练 loss 在学习率衰减至零时得到补偿. 我们从四个变体在 300B token 后的Checkpoint开始, 在 50B token 上将学习率衰减至零. 结果显示更高学习率确实使 mid-training 更有效, 但恰好补偿了预训练的劣势. 所有四个变体在过程结束时显示相同的训练 loss.</p>
<table>
<thead>
<tr>
<th align="left">学习率</th>
<th align="left">预训练阶段</th>
<th align="left">Mid-training 阶段</th>
<th align="right">OLMES (CF, valid)</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">300B tokens</td>
<td align="left">50B tokens</td>
<td align="right">62.5</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">300B tokens</td>
<td align="left">50B tokens</td>
<td align="right">63.9</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>9</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">9 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">9</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">300B tokens</td>
<td align="left">50B tokens</td>
<td align="right">64.1</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>12</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">12 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">12</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">300B tokens</td>
<td align="left">50B tokens</td>
<td align="right">63.6</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">300B tokens</td>
<td align="left">100B tokens</td>
<td align="right">64.6</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">2T tokens</td>
<td align="left">100B high quality</td>
<td align="right">73.8</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>⋅</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\cdot 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">2T tokens</td>
<td align="left">100B high quality</td>
<td align="right">73.9</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: 各种峰值学习率和 schedule 长度在 OLMES validation 子集上的结果. 平均分在所有变体之间变化不到 2 个百分点.</p>
</blockquote>
<p>这一发现 contradicts 机器学习民间智慧如 &quot;更高学习率总是更好&quot; 或 &quot;学习曲线下方面积重要&quot;. 它扩展了 mitch 的观察, 即较小模型的性能在学习率跨越几个数量级时 largely invariant.</p>
<h3 id="4-2-sjkc-dolmino">4.2 数据课程: Dolmino</h3>
<p>我们描述为 mid-training 策划数据集的实验过程. 我们将由此产生的数据集和为 mid-training 阶段创建的混合统称为 Dolmino.</p>
<p>我们的 mid-training 配方详细过程:</p>
<ul>
<li>确定改进整个开发基准套件性能的高质量来源混合.</li>
<li>对于修补特定能力 (特别是数学), 收集和评估领域特定数据集以在 mid-training 期间混合.</li>
<li>我们发现这些来源可以通过称为 micro-annealing 的技术独立评估; 它们的有效性在与其余来源混合时持续存在.</li>
</ul>
<h4 id="4-2-1-gzlly">4.2.1 高质量来源</h4>
<p>我们从策划预训练混合的更高质量子集开始, 并用更多学术和百科全书材料扩展. 具体来源包括:</p>
<p><strong>高质量网页</strong>: 我们实验两种现有质量分类器: DCLM 的 FastText 分类器和 FineWeb Edu 分类器. 我们使用 DCLM FastText 分类器, 阈值 0.03311014, 保留约 65.6% 网页子集. 我们结合 FineWeb Edu 分类器分数; 实验保留分数超过 3 (5.8% 保留) 和更宽松的阈值 2 (20.3% 保留).</p>
<p><strong>指令数据和 Q&amp;A 对</strong>: 我们利用 Dolma 1.7 中 FLAN 的相同子集. 我们通过提取评估套件中所有任务的训练、验证和测试实例来去污染此来源, 并移除与任何任务实例有 10% 或更多重叠 n-gram 的 FLAN 文档.</p>
<p>我们从 Stack Exchange 网络获取问答对, 使用 2024 年 9 月 30 日的最新数据库 dump. 我们过滤到有 accepted answer 的问题; 进一步移除问题少于 3 票或答案少于 5 票的 Q&amp;A 对.</p>
<p><strong>代码</strong>: 我们评估保留预训练期间使用的相同代码子集; 此外考虑更小、精选的代码来源.</p>
<p><strong>学术、百科全书和其他参考内容</strong>: 我们从 Dolma 1.7 获取高质量非网页数据集, 包括 peS2o、Wikipedia、Wikibooks、Gutenberg 书籍、arXiv 和 StackExchange.</p>
<p><strong>数学</strong>: 我们使用 OpenWebMath、GSM8K 训练集、MathPile 的商业许可子集和 AutoMathText.</p>
<table>
<thead>
<tr>
<th align="left">混合</th>
<th align="right">OLMES</th>
<th align="right">OLMES-Gen</th>
<th align="right">MMLU</th>
<th align="right">GSM*</th>
</tr>
</thead>
<tbody><tr>
<td align="left">基线 (仅退火)</td>
<td align="right">68.6</td>
<td align="right">49.0</td>
<td align="right">43.4</td>
<td align="right">30.1</td>
</tr>
<tr>
<td align="left">+FineWeb-Edu&gt;=2</td>
<td align="right">69.8</td>
<td align="right">48.6</td>
<td align="right">44.7</td>
<td align="right">29.8</td>
</tr>
<tr>
<td align="left">+FineWeb-Edu&gt;=2 +Math +Ins</td>
<td align="right"><strong>71.5</strong></td>
<td align="right"><strong>53.3</strong></td>
<td align="right"><strong>45.3</strong></td>
<td align="right"><strong>47.8</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: Mid-training 混合在 50B token 上的结果, 从 7B 模型 4T token 预训练Checkpoint初始化.</p>
</blockquote>
<h4 id="4-2-2-sxsj">4.2.2 数学数据</h4>
<p>早期 mid-training 混合显示模型在数学相关基准上 struggle. 因此我们集中关注改进这些数据集上的性能. 我们研究人工编写和合成生成/增强数据.</p>
<p><strong>TuluMath</strong>: 使用 PersonaHub 的 persona-driven 方法生成数学合成数据, 收集约 230M 合成数学 token.</p>
<p><strong>DolminoSynthMath</strong>: 28M 合成数学 token 的集合, 专门设计用于提高 GSM8K 性能和原始数学计算. 包含基本数学问答对 (11M tokens)、自定义 GSM8K 合成示例 (7,924 个) 和 MIND-rewriting 的 GSM8K 训练示例.</p>
<p><strong>TinyGSM-MIND</strong>: 从 Tiny-GSM 重写版本生成的约 6.5B token 合成数学数据.</p>
<p><strong>MathCoder2-Synthetic</strong>: 模拟 MathCoder2 的合成数据生成程序.</p>
<p><strong>ProofPile OWM-Filtered</strong>: 将 OpenWebMath 过滤器应用于 Metamath 和 CodeSearchNet.</p>
<p><strong>GSM8K-Train</strong>: GSM8K 的训练集.</p>
<h4 id="4-2-3-y-microanneals-pgsxsj">4.2.3 用 Microanneals 评估数学数据</h4>
<p>为选择最高质量的数学数据子集, 我们执行一系列 microanneals——专注于小数学子集的退火运行. 一般配方:</p>
<ol>
<li>确定要评估数据质量的来源或小集合;</li>
<li>从一般数据混合 (如 DCLM) 收集与数学来源大致相同数量的数据;</li>
<li>将此 50/50 混合作为退火运行训练, 确保为此较小数据集合以适当速率线性降低学习率.</li>
</ol>
<p>此程序促进以完整退火运行成本的一小部分评估单个数据质量. 我们运行 19 个单独的 microanneals, 总 token 数 130B, 相当于不到 3 个完整的 50B 退火运行.</p>
<p>关键发现:</p>
<ul>
<li><strong>领域特定数据即使在小比例下也有帮助</strong>: 35/65 数学/DCLM 混合产生 GSM* 63.5, 10/90 混合产生 61 (预退火 28.5).</li>
<li><strong>一些重复有益</strong>: 一倍数学数据 GSM* 61, 两倍 66, 四倍 65.</li>
<li><strong>重写可以大幅帮助</strong>: 将 Tiny-GSM 从代码格式重写为自然语言格式显著改善性能.</li>
</ul>
<h3 id="4-3-zz-mid-training-hhy-checkpoint-soups">4.3 最终 Mid-training 混合与Checkpoint Soups</h3>
<p>Dolmino 的最终组成包括: DCLM 基线过滤网页 (~50%), Stack Exchange Q&amp;A, FLAN, Wiki, 以及各种数学来源. 我们采样 50B、100B 和 300B token 的 3 个混合.</p>
<p><strong>Mid-training 模型融合或 &quot;soups&quot;</strong>: 对多个用不同数据顺序训练的Checkpoint进行朴素平均在 CV 和 LM 应用中被证明有效. 我们在六个不同 mid-training 混合上确认此方法的有效性. 对于所有实验, 我们发现融合 3 个在不同数据排列上退火的Checkpoint consistently 产生等于或优于任何单独训练运行的性能.</p>
<blockquote>
<p><strong>Thinking (Data Engineering)</strong>: OLMo 2 的退火研究是数据工程科学的典范. 几个关键方法论贡献值得强调: (1) Micro-annealing——用 &lt;10B token 的快速实验筛选数据源, 将实验成本降低 10 倍以上; (2) 学习率 plateau 的发现——挑战了 &quot;更高学习率更好&quot; 的民间智慧, 证明在中等规模上学习率选择对最终性能的影响比预期小; (3) 模型融合 (souping)——简单平均 multiple runs 的稳健性增益. 这些方法论对于资源有限的研究团队特别有价值, 因为它们允许在有限预算下进行系统性的数据工程优化.</p>
</blockquote>
<hr>
<h2 id="5-sdjx-hxl">5. 深度解析: 后训练</h2>
<p>为使 OLMo 2 适配下游生成任务, 我们遵循 Tulu 3 配方, 更加关注许可许可证和超参数调整. Tulu 方法涉及三阶段训练: 监督微调 (SFT)、使用 Direct Preference Optimization (DPO) 和 on-policy 偏好数据的偏好调优, 以及最终 Reinforcement Learning with Verifiable Rewards (RLVR).</p>
<h3 id="5-1-jdwt-sft">5.1 监督微调 (SFT)</h3>
<p>SFT 训练依赖选择最高质量的现有指令数据集, 并补充基于 PersonaHub 方法的缩放合成数据. 我们开发了两个 SFT 混合: tulu-3-sft-olmo-2-mixture (用于 7B 和 13B) 和 tulu-3-sft-olmo-2-mixture-0225 (用于 1B 和 32B).</p>
<p>给定 OLMo 2 未针对多语言任务训练, 我们实验从 SFT 阶段移除所有多语言数据. 移除整个 Aya split 和 Wildchat 的多语言样本后, 平均下降约 0.5 点, 表明 Tulu 数据集是平衡的, 不能通过移除不相关子集来轻松改进. 7B/13B 混合包含 939,104 prompts.</p>
<p>对于 1B 和 32B 混合, 我们进一步过滤掉包含日期截止提及的合成数据中的指令, 因为我们注意到这与不希望的行为 (如幻觉日期截止和以 &quot;As an AI language model...&quot; 开头回复) 相关. 我们还使用多数投票来提高合成数学问题答案的质量. 此混合包含 866,138 prompts.</p>
<h3 id="5-2-phwt-pre-ft-with-dpo">5.2 偏好微调 (PreFT) with DPO</h3>
<p>Tulu 管道的核心策略是基于 UltraFeedback 管道构建合成偏好数据. 我们包含 on-policy 数据, 通过从开发 OLMo 2 SFT 模型采样响应.</p>
<p>从 Tulu, 我们将模型池更新为仅包括许可许可证的模型. 我们对 DPO 的确切提示做了轻微调整——从多个来源获取提示, 7B 产生 366.7k 提示, 13B 产生 377.7k 提示. 给定这组提示, 我们从 20 个不同家族和规模的模型池生成响应.</p>
<p>为创建合成偏好数据, 我们使用 GPT-4o-2024-08-06 作为 LM judge, 基于 helpfulness、truthfulness、honesty 和 instruction-following 评分. 然后我们按照 Argilla 的方法二值化评分.</p>
<h3 id="5-3-qhxxykyzjl-rlvr">5.3 强化学习与可验证奖励 (RLVR)</h3>
<p>RLVR 是一种新颖的微调技术, 用于目标特定领域, 其中可以构建具有可验证答案的提示. 例如, 对于数学问题, PPO 仅在答案正确时接收奖励.</p>
<p>在偏好调优后, 我们使用 on-policy 7B 和 13B 偏好数据集训练奖励模型. 然后, 我们将 RLVR 应用于最高性能的 7B 和 13B DPO Checkpoint, 使用包含 GSM8K、MATH 训练集和约束提示的组合数据集. 对于 RLVR, 我们从相应的 RM 初始化 PPO 的价值函数.</p>
<p>在 13B 模型的初始 RLVR 训练通过后, 我们观察到其在 GSM8K 和 MATH 上的性能低于先前的开发 instruct 模型. 因此, 我们执行两个额外的 RLVR 训练迭代: 首先在 GSM8K 训练集上, 然后在 MATH 训练集上. 最终模型构成 OLMo 2 Instruct 的最终模型.</p>
<p>对于 1B 和 32B 模型, 我们使用 GRPO (Group Relative Policy Optimization) 执行 RLVR, 这不需要奖励模型.</p>
<blockquote>
<p>图 6: OLMo-2-1124-13B-Instruct 的 RLVR 训练曲线. 三轮 RLVR 迭代逐步提升 GSM8K 和 MATH 性能.</p>
</blockquote>
<h3 id="5-4-ccsxz">5.4 超参数选择</h3>
<p>OLMo 2 相比 Llama 3.1 训练配方需要显著更高的学习率. 关键发现:</p>
<ul>
<li><strong>SFT</strong>: 7B 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>, 13B 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>.</li>
<li><strong>DPO</strong>: 7B 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>, 13B 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>.</li>
<li><strong>RLVR</strong>: 7B beta 0.07, 13B beta 0.1.</li>
</ul>
<p>32B 模型的后训练独立进行: SFT 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">4 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>, DPO 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>, RLVR 学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>, KL beta 0.1, 16 samples per prompt.</p>
<blockquote>
<p><strong>Thinking (Post-training)</strong>: OLMo 2 的后训练有几个值得注意的点. 第一, 它完全基于 Tulu 3 配方, 但进行了针对 OLMo 2 基座模型的超参数调整. 关键发现是 OLMo 2 需要 &quot;显著更高的学习率&quot; 相比 Llama 3.1——这说明不同架构/初始化对后训练超参数有实质性影响, 不能简单复用其他模型的配方. 第二, RLVR 的多阶段迭代策略 (先在混合数据上, 再在 GSM8K 上, 最后在 MATH 上) 是一个重要的工程细节: 它解决了单一 RLVR 运行可能 overfit 到某些任务而牺牲其他任务的问题. 第三, 32B 模型使用 GRPO (而非 PPO+RM) 是一个有趣的扩展, 表明 verifiable reward 场景下 GRPO 的简洁性优势可以扩展到更大规模.</p>
</blockquote>
<hr>
<h2 id="6-sdjx-jcss">6. 深度解析: 基础设施</h2>
<p>LM 训练 famously 计算密集. 训练大型模型需要 state-of-the-art 硬件, 大量工作投入使其高效运行. 效率增益可以转化为更高的 token 数或更多参数, 直接影响最终模型质量.</p>
<h3 id="6-1-jq">6.1 集群</h3>
<p>OLMo 2 在两个 Ai2 集群上训练: Jupiter 和 Augusta.</p>
<p><strong>Jupiter</strong>: 128 节点 GPU 集群, 位于德克萨斯州奥斯汀. 1,024 个 NVIDIA H100 GPU (80GB HBM3, 700W). 服务器通过 800 Gbps 本地网络连接到 WEKA 高性能存储集群 (1 PB NVMe SSD + 5 PB HDD). 跨节点 GPU 通信通过 RDMA over InfiniBand, 2-Tier Rail Optimized 网络. 每台服务器有八个 400 Gbps InfiniBand 卡, 每主机最大总吞吐量 3200 Gbps. 服务器安装在 Dynamic Density Cabinets 中, PUE 1.2, GPU 峰值温度 75C.</p>
<p><strong>Augusta</strong>: 160 节点 GPU 集群, 由 Google Cloud 提供, 位于爱荷华州 Council Bluffs. 由 A3 Mega VM 组成, 每个有 8 个 NVIDIA H100 GPU. 使用 Google Cloud Storage, 通过 GPUDirect-TCPXO、gVNIC 和紧凑节点放置实现快速跨节点 GPU 通信. PUE 1.12.</p>
<h3 id="6-2-beaker">6.2 Beaker</h3>
<p>OLMo 2 工作负载使用 Beaker (Ai2 的自定义工作负载管理系统) 调度. Beaker 在两个方面有益于 OLMo 2:</p>
<p><strong>可移植性</strong>: Beaker 的架构可以利用跨越 3 个不同数据中心的 GPU, 代码变化最小. 工作负载可以通过更改单行代码从一个位置迁移到另一个位置.</p>
<p><strong>隔离</strong>: Beaker 工作负载是容器化的, 提供隔离保证. 这允许 OLMo 2 工作负载与其他作业在同一集群上同时运行, 冲突最小.</p>
<h3 id="6-3-wdxyyw">6.3 稳定性与运维</h3>
<p>两个集群都需要初始测试和 burn-in 期, 在此期间我们发现并修复了从 cable 松动到 NCCL 库中计算节点顺序不当等问题.</p>
<p><strong>GPU 健康检查</strong>: Beaker 在分配给工作负载的 GPU 上运行工作负载之前执行简单程序. 当故障发生时, Beaker cordons 相关主机并重新调度工作负载.</p>
<p><strong>Cordoning</strong>: Beaker 支持 cordoning 节点作为自动健康检查的覆盖. 被 cordoned 的节点从调度中移除并标记为需要修复.</p>
<p><strong>主动监控</strong>: Beaker 基于集群遥测执行行业标准监控和自动警报.</p>
<h3 id="6-4-zdhyjlys">6.4 最大化硬件利用率</h3>
<p><strong>利用编译</strong>: torch.compile() 将原生 PyTorch 模块和函数编译为优化内核, 显著提高吞吐量并节省 GPU 内存.</p>
<p><strong>最小化 host-device syncs</strong>: GPU 操作默认异步. 任何 host-device sync 都会阻碍性能. 常见 sync 来源: 同步 CPU→GPU 张量复制、GPU→CPU 数据传输、某些 PyTorch 操作如 masked_select().</p>
<p><strong>使用单独后端的异步 bookkeeping</strong>: 典型训练循环涉及定期 &quot;bookkeeping&quot; 操作如记录指标和保存Checkpoint. 我们通过在单独线程中执行大部分 bookkeeping 工作来最小化阻塞训练循环的时间, 使用不依赖 NCCL 的 GLOO 后端.</p>
<p><strong>显式 Python 垃圾回收</strong>: 默认 Python GC 定期运行 collection. 在分布式设置中, 这些 GC 不在每个进程同一时间发生, 导致 noticeable 的平均训练时间下降和变异性增加. OLMo 2 训练器禁用自动 GC, 在固定间隔显式运行.</p>
<blockquote>
<p>图 7: 自动垃圾收集 vs 手动垃圾收集的训练吞吐量对比. 自动 GC 导致更慢且更不稳定的吞吐量.</p>
</blockquote>
<h3 id="6-5-hjyx">6.5 环境影响</h3>
<p>我们估计训练最终模型的环境影响, 首先计算预训练期间消耗的总能量, 然后乘以本地电网的碳强度来估计碳释放量. 我们还扩展分析以估计水消耗.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="right">OLMo 2 7B</th>
<th align="right">OLMo 2 13B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPU 功耗 (MWh)</td>
<td align="right">217</td>
<td align="right">174</td>
</tr>
<tr>
<td align="left">PUE</td>
<td align="right">1.2</td>
<td align="right">1.12</td>
</tr>
<tr>
<td align="left">碳强度 (kg CO2/kWh)</td>
<td align="right">0.332</td>
<td align="right">0.352</td>
</tr>
<tr>
<td align="left">碳排放 (tCO2eq)</td>
<td align="right">87</td>
<td align="right">68</td>
</tr>
<tr>
<td align="left">水消耗 (千升)</td>
<td align="right">672</td>
<td align="right">460</td>
</tr>
</tbody></table>
<blockquote>
<p>表 9: OLMo 2 训练的环境影响. 总计约 391 MWh 能量, 154 tCO2eq, 1.1 百万升水.</p>
</blockquote>
<hr>
<h2 id="7-jl">7. 结论</h2>
<p>我们介绍 OLMo 2 和 OLMo 2 Instruct, 一个在多达 6T token 上训练的完全开放的 7B、13B 和 32B 参数语言模型家族. 基座和 instruct 模型在各自规模类别中与其他开放权重模型 (如 Qwen 2.5、Gemma 2 和 Llama 3.1) 具有竞争力. 我们详细阐述了构建 competitive 语言模型所需的大量贡献——其中许多与原始 OLMo 不同——包括稳定的基础设施、稳定性架构改进、后期训练数据创新、最新后训练技术和更多细节. 我们发布所有训练和评估代码、数据集、Checkpoint和日志以复现和扩展模型. OLMo 2 标志着开源语言模型的持续进步, 建立了一个新的研究生态系统.</p>
<hr>
<h2 id="fl-a-syb">附录 A. 术语表</h2>
<table>
<thead>
<tr>
<th align="left">英文术语</th>
<th align="left">中文译名</th>
<th align="left">首次出现</th>
<th align="left">简要解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo 2</td>
<td align="left">-</td>
<td align="left">标题</td>
<td align="left">AI2 第二代全开源语言模型</td>
</tr>
<tr>
<td align="left">Dolmino</td>
<td align="left">-</td>
<td align="left">第 2.3 节</td>
<td align="left">Mid-training 阶段使用的数据混合</td>
</tr>
<tr>
<td align="left">OLMo-Mix</td>
<td align="left">-</td>
<td align="left">第 2.4.1 节</td>
<td align="left">预训练阶段数据混合</td>
</tr>
<tr>
<td align="left">OLMES</td>
<td align="left">Open Language Model Evaluation Suite</td>
<td align="left">第 2.5 节</td>
<td align="left">AI2 开发的标准化评估框架</td>
</tr>
<tr>
<td align="left">Tulu 3</td>
<td align="left">-</td>
<td align="left">摘要</td>
<td align="left">AI2 的指令微调和后训练配方</td>
</tr>
<tr>
<td align="left">RLVR</td>
<td align="left">Reinforcement Learning with Verifiable Rewards</td>
<td align="left">摘要</td>
<td align="left">可验证奖励强化学习</td>
</tr>
<tr>
<td align="left">GRPO</td>
<td align="left">Group Relative Policy Optimization</td>
<td align="left">第 5.3 节</td>
<td align="left">组相对策略优化, 无需奖励模型</td>
</tr>
<tr>
<td align="left">Micro-annealing</td>
<td align="left">微退火</td>
<td align="left">第 4.2.3 节</td>
<td align="left">小规模快速数据质量评估技术</td>
</tr>
<tr>
<td align="left">Souping</td>
<td align="left">模型融合</td>
<td align="left">第 2.3 节</td>
<td align="left">多个Checkpoint的权重平均</td>
</tr>
<tr>
<td align="left">QK-Norm</td>
<td align="left">-</td>
<td align="left">第 2.1 节</td>
<td align="left">Attention 前对 Q/K 的 RMSNorm</td>
</tr>
<tr>
<td align="left">Z-Loss</td>
<td align="left">-</td>
<td align="left">第 2.1 节</td>
<td align="left">防止 softmax logits 过大的正则化</td>
</tr>
<tr>
<td align="left">PUE</td>
<td align="left">Power Usage Effectiveness</td>
<td align="left">第 6.5 节</td>
<td align="left">数据中心能耗效率指标</td>
</tr>
<tr>
<td align="left">WUE</td>
<td align="left">Water Usage Effectiveness</td>
<td align="left">第 6.5 节</td>
<td align="left">数据中心水耗效率指标</td>
</tr>
</tbody></table>
<hr>
<h2 id="ckly">参考来源</h2>
<ol>
<li>Ai2 OLMo Team, &quot;2 OLMo 2 Furious&quot;, arXiv:2501.00656 (2025)</li>
<li>Groeneveld et al., &quot;OLMo: Accelerating the Science of Language Models&quot;, arXiv:2402.00838 (2024)</li>
<li>Lambert et al., &quot;Tulu 3: Pushing Frontiers in Open Language Model Post-Training&quot;, arXiv:2411.15124 (2024)</li>
<li>Bhagia et al., &quot;Establishing Task Scaling Laws via Measure-Compute-Extrapolate&quot;, arXiv:2411.12738 (2024)</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":2,"id":"2-olmo-2-jz","text":"2. OLMo 2 家族"},{"level":3,"id":"2-1-mxjg","text":"2.1 模型架构"},{"level":3,"id":"2-2-fcq","text":"2.2 分词器"},{"level":3,"id":"2-3-jzmxxlfa","text":"2.3 基座模型训练方案"},{"level":3,"id":"2-4-jzmxsj","text":"2.4 基座模型数据"},{"level":4,"id":"2-4-1-yxlsj-olmo-mix","text":"2.4.1 预训练数据: OLMo-Mix"},{"level":4,"id":"2-4-2-mid-training-sj-dolmino","text":"2.4.2 Mid-training 数据: Dolmino"},{"level":3,"id":"2-5-pgyjg","text":"2.5 评估与结果"},{"level":4,"id":"2-5-1-jzmxpg","text":"2.5.1 基座模型评估"},{"level":4,"id":"2-5-2-hxlypg","text":"2.5.2 后训练与评估"},{"level":2,"id":"3-sdjx-xlwdx","text":"3. 深度解析: 训练稳定性"},{"level":3,"id":"3-1-zf-n-gram","text":"3.1 重复 n-gram"},{"level":3,"id":"3-2-mxcsh","text":"3.2 模型初始化"},{"level":3,"id":"3-3-jggj","text":"3.3 架构改进"},{"level":3,"id":"3-4-ccsgj","text":"3.4 超参数改进"},{"level":2,"id":"4-sdjx-th","text":"4. 深度解析: 退火"},{"level":3,"id":"4-1-xxsth","text":"4.1 学习率退火"},{"level":3,"id":"4-2-sjkc-dolmino","text":"4.2 数据课程: Dolmino"},{"level":4,"id":"4-2-1-gzlly","text":"4.2.1 高质量来源"},{"level":4,"id":"4-2-2-sxsj","text":"4.2.2 数学数据"},{"level":4,"id":"4-2-3-y-microanneals-pgsxsj","text":"4.2.3 用 Microanneals 评估数学数据"},{"level":3,"id":"4-3-zz-mid-training-hhy-checkpoint-soups","text":"4.3 最终 Mid-training 混合与Checkpoint Soups"},{"level":2,"id":"5-sdjx-hxl","text":"5. 深度解析: 后训练"},{"level":3,"id":"5-1-jdwt-sft","text":"5.1 监督微调 (SFT)"},{"level":3,"id":"5-2-phwt-pre-ft-with-dpo","text":"5.2 偏好微调 (PreFT) with DPO"},{"level":3,"id":"5-3-qhxxykyzjl-rlvr","text":"5.3 强化学习与可验证奖励 (RLVR)"},{"level":3,"id":"5-4-ccsxz","text":"5.4 超参数选择"},{"level":2,"id":"6-sdjx-jcss","text":"6. 深度解析: 基础设施"},{"level":3,"id":"6-1-jq","text":"6.1 集群"},{"level":3,"id":"6-2-beaker","text":"6.2 Beaker"},{"level":3,"id":"6-3-wdxyyw","text":"6.3 稳定性与运维"},{"level":3,"id":"6-4-zdhyjlys","text":"6.4 最大化硬件利用率"},{"level":3,"id":"6-5-hjyx","text":"6.5 环境影响"},{"level":2,"id":"7-jl","text":"7. 结论"},{"level":2,"id":"fl-a-syb","text":"附录 A. 术语表"},{"level":2,"id":"ckly","text":"参考来源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/02-olmo-2/01-olmo-2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/02-olmo-2/01-olmo-2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo 2 技术报告精译</h1>
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
