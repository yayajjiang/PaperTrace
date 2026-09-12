"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Mistral 7B 核心技术专题：GQA 与 SWA 的效率革命</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.14-mistral/14.14-mistral">返回 14.14-Mistral 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="1-mxdwyfbbj">1. 模型定位与发布背景</h2>
<table>
<thead>
<tr>
<th>维度</th>
<th>规格</th>
</tr>
</thead>
<tbody><tr>
<td><strong>发布时间</strong></td>
<td>2023 年 9 月 27 日</td>
</tr>
<tr>
<td><strong>发布机构</strong></td>
<td>Mistral AI(法国，成立于 2023 年 5 月)</td>
</tr>
<tr>
<td><strong>参数量</strong></td>
<td>70 亿(7B)</td>
</tr>
<tr>
<td><strong>架构</strong></td>
<td>Dense Transformer，Decoder-only</td>
</tr>
<tr>
<td><strong>上下文窗口</strong></td>
<td>8K(原生)/ 32K(通过 SWA 扩展)</td>
</tr>
<tr>
<td><strong>开源协议</strong></td>
<td>Apache 2.0</td>
</tr>
<tr>
<td><strong>训练成本</strong></td>
<td>未公开，但团队称「训练效率极高」</td>
</tr>
</tbody></table>
<p>Mistral 7B 是 Mistral AI 的「出道作」。在一个成立仅 4 个月的创业公司，用 7B 参数超越了 LLaMA-2 13B 并接近 LLaMA-1 34B，这本身就是一个震撼性的声明。但它的真正影响不在于绝对性能，而在于<strong>架构效率</strong>——通过两项关键创新(GQA 和 SWA)，证明了「小模型+好架构」可以打败「大模型+标准架构」。</p>
<hr>
<h2 id="2-fzcxzyl-gqa-kv-cache-dysys">2. 分组查询注意力(GQA)：KV Cache 的压缩艺术</h2>
<h3 id="2-1-c-mha-d-gqa-dyj">2.1 从 MHA 到 GQA 的演进</h3>
<table>
<thead>
<tr>
<th>注意力变体</th>
<th>Q 头数</th>
<th>K/V 头数</th>
<th>KV Cache 大小</th>
<th>质量损失</th>
</tr>
</thead>
<tbody><tr>
<td><strong>MHA</strong>(标准多头)</td>
<td>32</td>
<td>32</td>
<td>32 × d</td>
<td>无(基线)</td>
</tr>
<tr>
<td><strong>MQA</strong>(多查询)</td>
<td>32</td>
<td>1</td>
<td>1 × d</td>
<td>明显(~2%)</td>
</tr>
<tr>
<td><strong>GQA</strong>(分组查询)</td>
<td>32</td>
<td>8</td>
<td>8 × d</td>
<td>极小(&lt;0.5%)</td>
</tr>
</tbody></table>
<p>Mistral 7B 采用 GQA-8：32 个查询头分为 8 组，每组 4 个查询头共享 1 个 K/V 头。</p>
<h3 id="2-2-wsm-gqa-b-mqa-gh">2.2 为什么 GQA 比 MQA 更好？</h3>
<p>MQA 将所有查询头压缩到单个 K/V 头，虽然最大程度节省了 KV Cache，但信息损失严重。GQA 的折中方案：</p>
<ul>
<li><strong>组内共享</strong>：同一组的 4 个查询头共享 K/V，但不同组之间保持独立。</li>
<li><strong>信息保留</strong>：8 组 K/V 保留了足够的注意力多样性，避免了 MQA 的「注意力坍缩」。</li>
<li><strong>显存节省</strong>：KV Cache 从 32× 降到 8×，<strong>减少 75%</strong>。</li>
</ul>
<p>在 32K 上下文推理中，GQA 的显存节省意味着：</p>
<ul>
<li>标准 MHA 的 KV Cache：32 × 4096 × 32K × 2(K+V)× 2(FP16)≈ <strong>16.8 GB</strong></li>
<li>GQA-8 的 KV Cache：8 × 4096 × 32K × 2 × 2 ≈ <strong>4.2 GB</strong></li>
</ul>
<p>这使得单卡 A100 80GB 可以处理更长的序列或更大的 batch。</p>
<hr>
<h2 id="3-hdckzyl-swa-csxwd-zb-jq">3. 滑动窗口注意力(SWA)：长上下文的「作弊」技巧</h2>
<h3 id="3-1-hxjz">3.1 核心机制</h3>
<p>标准自注意力的计算：每个 token 可以 attend 到所有之前的 token。复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>。</p>
<p>SWA 的计算：每个 token 只能 attend 到其左侧固定窗口 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi></mrow><annotation encoding="application/x-tex">w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span></span></span></span> 内的 token。复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mclose">)</span></span></span></span>。</p>
<p>Mistral 7B 的配置：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">w = 4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>(即每个 token 只能看到最近的 4096 个 token)。</p>
<h3 id="3-2-rhsx-32k-sxw">3.2 如何实现 32K 上下文？</h3>
<p>单个窗口 4096 只能处理 4K 上下文，但 Mistral 7B 声称支持 32K。秘密在于<strong>层间信息传递</strong>：</p>
<pre><code>Layer 1: token_32000 可以看到 token_28001-32000 (window=4096)
Layer 2: token_32000 可以通过 Layer 1 的隐式传递看到 token_24001-28000
Layer 3: ...
Layer N: 经过 N 层堆叠，信息可以从任意位置「跳跃」传递到当前位置
</code></pre>
<p>这种「滚动注意力」的效果：对于需要局部连贯性的任务(如代码补全、段落生成)，SWA 几乎无损; 对于需要精确长距离依赖的任务(如跨文档推理)，效果弱于全注意力。</p>
<h3 id="3-3-gdhcqyh">3.3 滚动缓冲区优化</h3>
<p>SWA 的一个工程优势：<strong>KV Cache 可以循环复用</strong>。当序列长度超过窗口大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi></mrow><annotation encoding="application/x-tex">w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span></span></span></span> 时，最旧的 token 可以被丢弃，其 KV Cache 位置被新 token 复用。</p>
<p>这使得 Mistral 7B 在生成长文本时的 KV Cache 占用保持恒定(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi><mo>⋅</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">w \\cdot d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>)，而非随序列长度线性增长。</p>
<hr>
<h2 id="4-xndw-7b-db-13b-djgmm">4. 性能定位：7B 打败 13B 的架构密码</h2>
<h3 id="4-1-y-l-la-ma-xlddb">4.1 与 LLaMA 系列的对比</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Mistral 7B</th>
<th>LLaMA-2 13B</th>
<th>LLaMA-1 34B</th>
<th>解读</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>60.1%</td>
<td>54.8%</td>
<td>57.8%</td>
<td><strong>知识理解显著领先</strong></td>
</tr>
<tr>
<td>HellaSwag</td>
<td>81.3%</td>
<td>78.4%</td>
<td>81.3%</td>
<td>常识推理持平 34B</td>
</tr>
<tr>
<td>HumanEval</td>
<td>28.4%</td>
<td>22.6%</td>
<td>21.7%</td>
<td><strong>代码能力突出</strong></td>
</tr>
<tr>
<td>GSM8K</td>
<td>46.4%</td>
<td>34.9%</td>
<td>35.1%</td>
<td><strong>数学推理大幅领先</strong></td>
</tr>
<tr>
<td>TruthfulQA</td>
<td>42.2%</td>
<td>39.8%</td>
<td>37.0%</td>
<td><strong>真实性更高</strong></td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：Mistral 7B 在所有任务上都超越了参数几乎两倍的 LLaMA-2 13B，甚至在部分任务上持平 LLaMA-1 34B。这一「以小打大」的成功证明：架构创新(GQA + SWA)带来的效率提升，可以弥补参数规模的差距。</p>
<h3 id="4-2-xsdb">4.2 效率对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Mistral 7B</th>
<th>LLaMA-2 13B</th>
<th>效率比</th>
</tr>
</thead>
<tbody><tr>
<td><strong>参数</strong></td>
<td>7B</td>
<td>13B</td>
<td>0.54×</td>
</tr>
<tr>
<td><strong>KV Cache(32K 上下文)</strong></td>
<td>~4.2 GB</td>
<td>~16.8 GB</td>
<td><strong>0.25×</strong></td>
</tr>
<tr>
<td><strong>推理速度(相同硬件)</strong></td>
<td><strong>快 1.5-2×</strong></td>
<td>基线</td>
<td><strong>1.5-2×</strong></td>
</tr>
<tr>
<td><strong>训练成本(估算)</strong></td>
<td><strong>低 30-40%</strong></td>
<td>基线</td>
<td><strong>0.6-0.7×</strong></td>
</tr>
</tbody></table>
<hr>
<h2 id="5-jgxj-wsm-mistral-7b-dxlsjpbbt">5. 架构细节：为什么 Mistral 7B 的训练数据配比不同？</h2>
<p>Mistral 7B 的训练数据公开信息有限，但团队透露了几个关键选择：</p>
<ul>
<li><strong>代码数据占比高</strong>：HumanEval 和 GSM8K 的突出表现与高质量代码数据(GitHub、Stack Overflow、教科书级代码)直接相关。</li>
<li><strong>去重策略激进</strong>：使用了比 LLaMA-2 更严格的去重 pipeline，确保每个训练 token 的信息密度更高。</li>
<li><strong>没有刻意追求「万亿 token」</strong>：Mistral 7B 的训练数据量未公开，但性能曲线表明其「数据效率」(单位数据带来的性能提升)高于 LLaMA 系列。</li>
</ul>
<hr>
<h2 id="6-jxxyfx">6. 局限性与风险</h2>
<h3 id="6-1-hdckdbjxy">6.1 滑动窗口的边界效应</h3>
<p>SWA 的 4096 窗口意味着：对于需要跨窗口精确关联的任务，模型必须依赖多层堆叠的间接传递。这种「信息衰减」在以下场景明显：</p>
<ul>
<li><strong>长文档问答</strong>：问题涉及文档开头和结尾的对比。</li>
<li><strong>代码库级理解</strong>：需要同时理解相距数千行的两个函数。</li>
<li><strong>多轮对话中的早期上下文遗忘</strong>：虽然 32K 上下文可以「装下」很多内容，但超过 4K 距离的精确回忆能力受限。</li>
</ul>
<h3 id="6-2-gqa-dzyldyxss">6.2 GQA 的注意力多样性损失</h3>
<p>虽然 GQA 的质量损失很小(&lt;0.5%)，但在需要精细注意力对齐的任务上(如机器翻译中的词对齐、代码中的变量追踪)，8 组 K/V 可能不如 32 组精细。</p>
<h3 id="6-3-kystdyl">6.3 开源生态的依赖</h3>
<p>Mistral 7B 的成功在很大程度上依赖于其与 LLaMA 生态的兼容性(相同的 tokenizer、相似的结构)。这使得社区可以快速将其集成到 Hugging Face、vLLM、llama.cpp 等框架中，但也意味着 Mistral 的创新被限制在「LLaMA 兼容」的边界内。</p>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-gqa-swa-s-zyj-hs-jbzy">7.1 GQA + SWA 是「最优解」还是「局部最优」？</h3>
<p>Mistral 7B 的架构选择(GQA-8 + SWA-4096)是基于 2023 年的硬件条件和工程约束：</p>
<ul>
<li><strong>GQA-8</strong> 的折中是否最优？后续研究表明 GQA-4(4 组 K/V)在更大模型上也能保持质量，进一步节省显存。</li>
<li><strong>SWA-4096</strong> 的窗口是否最优？Mistral 自己后续的模型(如 Mixtral)将窗口扩展到更大的范围，说明 4096 是保守选择。</li>
</ul>
<p>这些问题的答案随着硬件(HBM 带宽提升)和算法(更高效的注意力近似)的演进而变化。</p>
<h3 id="7-2-wsm-xtd-nzc-dtp">7.2 为什么「小团队」能做出「大突破」？</h3>
<p>Mistral AI 成立时只有 6 人，却在 4 个月内训练出超越 LLaMA-2 13B 的模型。关键因素：</p>
<ul>
<li><strong>团队背景</strong>：核心成员来自 Meta(LLaMA 团队)、DeepMind、Google Brain，深谙大规模训练的工程细节。</li>
<li><strong>聚焦策略</strong>：不做最大的模型，做最高效的小模型——这需要对架构创新有更深的理解。</li>
<li><strong>开源生态借力</strong>：通过 Apache 2.0 和 LLaMA 兼容性，快速获得社区反馈和采用。</li>
</ul>
<h3 id="7-3-mistral-7b-d-yxdd-dhydqs">7.3 Mistral 7B 的「以小打大」对行业的启示</h3>
<p>Mistral 7B 的成功证明了一个重要原则：<strong>在固定算力预算下，架构创新的 ROI 高于单纯堆参数。</strong></p>
<p>这一原则直接影响了后续的行业走向：</p>
<ul>
<li><strong>DeepSeek</strong> 通过 MLA 和 MoE 在更小激活参数下达到 SOTA。</li>
<li><strong>MiniMax</strong> 通过 Lightning Attention 将上下文扩展到 400 万。</li>
<li><strong>Apple</strong> 的端侧模型(如 OpenELM)同样采用高效架构优先策略。</li>
</ul>
<hr>
<h2 id="8-mxpxdw">8. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: LLaMA-1/2 架构基础(Decoder-only Transformer)</li>
<li><strong>核心创新</strong>:<ul>
<li>GQA-8：KV Cache 压缩 75%，质量损失 &lt;0.5%</li>
<li>SWA-4096：注意力复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mclose">)</span></span></span></span></li>
<li>滚动缓冲区：恒定 KV Cache 占用</li>
<li>高代码数据配比 + 激进去重</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>Mixtral 8x7B(在 Mistral 7B 基础上叠加 MoE)</li>
<li>Mistral 8x22B(更大规模的 GQA + SWA + MoE)</li>
<li>整个「高效小模型」生态(Phi、Gemma、Qwen2.5 等受其启发)</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>LLaMA-2 13B(Meta，Dense)</li>
<li>Falcon 7B(TII，Dense)</li>
<li>MPT 7B(MosaicML，Dense)</li>
</ul>
</li>
<li><strong>技术定位</strong>: Mistral 7B 是 2023 年开源大模型领域最具影响力的发布之一。它没有创造新的算法，但通过 GQA 和 SWA 的两项工程优化，将 7B 参数的效率推到了前所未有的高度，直接启发了后续所有「高效小模型」的研究方向</li>
</ul>
<hr>
<blockquote>
<p>📚 <strong>关联阅读</strong></p>
<ul>
<li><a href="/llm-guide/14-models/14.14-mistral/14.14-mistral">返回 Mistral 家族总览</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.3-国外大模型/Mistral-AI/05-Mistral-7B-GQA与SWA的效率革命.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdwyfbbj","text":"1. 模型定位与发布背景"},{"level":2,"id":"2-fzcxzyl-gqa-kv-cache-dysys","text":"2. 分组查询注意力(GQA)：KV Cache 的压缩艺术"},{"level":3,"id":"2-1-c-mha-d-gqa-dyj","text":"2.1 从 MHA 到 GQA 的演进"},{"level":3,"id":"2-2-wsm-gqa-b-mqa-gh","text":"2.2 为什么 GQA 比 MQA 更好？"},{"level":2,"id":"3-hdckzyl-swa-csxwd-zb-jq","text":"3. 滑动窗口注意力(SWA)：长上下文的「作弊」技巧"},{"level":3,"id":"3-1-hxjz","text":"3.1 核心机制"},{"level":3,"id":"3-2-rhsx-32k-sxw","text":"3.2 如何实现 32K 上下文？"},{"level":3,"id":"3-3-gdhcqyh","text":"3.3 滚动缓冲区优化"},{"level":2,"id":"4-xndw-7b-db-13b-djgmm","text":"4. 性能定位：7B 打败 13B 的架构密码"},{"level":3,"id":"4-1-y-l-la-ma-xlddb","text":"4.1 与 LLaMA 系列的对比"},{"level":3,"id":"4-2-xsdb","text":"4.2 效率对比"},{"level":2,"id":"5-jgxj-wsm-mistral-7b-dxlsjpbbt","text":"5. 架构细节：为什么 Mistral 7B 的训练数据配比不同？"},{"level":2,"id":"6-jxxyfx","text":"6. 局限性与风险"},{"level":3,"id":"6-1-hdckdbjxy","text":"6.1 滑动窗口的边界效应"},{"level":3,"id":"6-2-gqa-dzyldyxss","text":"6.2 GQA 的注意力多样性损失"},{"level":3,"id":"6-3-kystdyl","text":"6.3 开源生态的依赖"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-gqa-swa-s-zyj-hs-jbzy","text":"7.1 GQA + SWA 是「最优解」还是「局部最优」？"},{"level":3,"id":"7-2-wsm-xtd-nzc-dtp","text":"7.2 为什么「小团队」能做出「大突破」？"},{"level":3,"id":"7-3-mistral-7b-d-yxdd-dhydqs","text":"7.3 Mistral 7B 的「以小打大」对行业的启示"},{"level":2,"id":"8-mxpxdw","text":"8. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.14-mistral/01-mistral-7b/05-mistral-7b-gqa-y-swa-dxsgm" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.14-mistral/01-mistral-7b/05-mistral-7b-gqa-y-swa-dxsgm" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mistral 7B 核心技术专题：GQA 与 SWA 的效率革命</h1>
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
