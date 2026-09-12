"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.3 · 高效与稀疏注意力</h1>
<blockquote>
<p><strong>进度与计划</strong>：<a href="#broken-link">roadmap/进度.md</a> · <a href="#broken-link">roadmap/计划.md</a></p>
</blockquote>
<h2 id="1-zstxyydlx">1. 知识体系与阅读路线</h2>
<p>本章聚焦于大语言模型(LLM)中最核心、最昂贵、最具变革性的组件——<strong>注意力机制(Attention)</strong> 的高效化与稀疏化重构. </p>
<p>自 2017 年 Transformer 诞生以来, 其经典的自注意力机制以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的时间与空间复杂度在长上下文场景下面临极端的&quot;内存墙&quot;与&quot;算力墙&quot;挑战. 为了在物理极限下驯服这只二次方猛兽, 学术界与工业界在硬件加速、动态路由、线性逼近及低秩压缩等多个维度展开了波澜壮阔的工程与数学演进. </p>
<p>本章划分五个子专题, 为您勾勒出完整的硬件感知的注意力计算版图：</p>
<ol>
<li><strong>2.3.1-硬件高效注意力</strong>：不改数学逻辑, 只优化硬件执行流程. 以 <strong>FlashAttention</strong> 家族为代表, 正面击穿 GPU 访存受限瓶颈; 以 <strong>PagedAttention</strong> (vLLM) 为基础, 用分页内存管理终结 KV Cache 碎片化. </li>
<li><strong>2.3.2-稀疏与压缩注意力</strong>：动态/静态丢弃无关的注意力连边. 深入剖析 Moonshot <strong>MoBA</strong> (混合块注意力)、DeepSeek <strong>NSA</strong> (原生稀疏注意力)、<strong>DSA</strong> (基于 MLA 的选择性稀疏注意力) 以及 MIT <strong>Radial Attention</strong> (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mi>log</mi><mo>⁡</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N \\log N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span> 视频生成 DiT 稀疏注意力). </li>
<li><strong>2.3.3-线性注意力机制</strong>：用支持结合律的特征映射替代 Softmax. 从 <strong>Performer/FAVOR+</strong> 随机特征映射, 演进到 <strong>DeltaNet</strong>、<strong>Gated-DeltaNet</strong> 动态增量遗忘更新, 以及 2025 年 Qwen3-Next 采用的 3:1 混合注意力架构. </li>
<li><strong>2.3.4-高效注意力全景综述</strong>：构建全景雷达图, 对比各条技术路线在训练效率、推理吞吐、长上下文外推能力以及工业落地状态上的多维表现. </li>
<li><strong>2.3.5-多头潜在注意力MLA</strong>：DeepSeek 系列模型的效率基石. 详尽推导 MLA 低秩 KV 联合压缩、解耦 RoPE 旋转位置编码, 以及在矩阵吸收后的前向与反向加速动力学.</li>
</ol>
<h2 id="2-zyljgyj-c-mha-d-moba">2. 注意力架构演进：从 MHA 到 MoBA</h2>
<blockquote>
<p><strong>推荐总览</strong>：<a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/2.2.2-dtzylbt">2.2.2 多头注意力变体</a> + 本章 <strong>2.3.2</strong>（DCA / S² / NSA / MoBA / CSA-HCA）</p>
</blockquote>
<h3 id="2-1-wzyjl">2.1 完整演进链</h3>
<table>
<thead>
<tr>
<th>架构</th>
<th>年份</th>
<th>核心策略</th>
<th>文档入口</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>2017</td>
<td>每头独立 Q/K/V</td>
<td><a href="#broken-link">2.2.2/01-MHA</a></td>
</tr>
<tr>
<td>MQA</td>
<td>2019</td>
<td>全头共享 K/V</td>
<td><a href="#broken-link">2.2.2/02-MQA</a></td>
</tr>
<tr>
<td>GQA</td>
<td>2023</td>
<td>分组共享 K/V</td>
<td><a href="#broken-link">2.2.2/03-GQA</a></td>
</tr>
<tr>
<td>MLA</td>
<td>2024</td>
<td>低秩 latent + 矩阵吸收</td>
<td><a href="#broken-link">2.2.2/04-MLA</a> · <a href="#broken-link">05 吸收双版本</a></td>
</tr>
<tr>
<td>DCA</td>
<td>2024</td>
<td>Training-free 块注意力外推</td>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/05-dca-skzyl/05-dca-skzyl">2.3.2/05-DCA</a></td>
</tr>
<tr>
<td>S²-Attn</td>
<td>2023</td>
<td>移位稀疏（LongLoRA）</td>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/06-s2-attn-ywxszyl/06-s2-attn-ywxszyl">2.3.2/06-S²</a></td>
</tr>
<tr>
<td>NSA / DSA</td>
<td>2025</td>
<td>原生可训练稀疏</td>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/02-ysxszyljz-nsa/02-ysxszyljz-nsa">2.3.2/02-NSA</a></td>
</tr>
<tr>
<td>MoBA</td>
<td>2025</td>
<td>MoE 式块路由</td>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/01-moba-jgsdjx/01-moba-jgsdjx">2.3.2/01-MoBA</a></td>
</tr>
<tr>
<td>CSA + HCA</td>
<td>2026</td>
<td>V4 混合压缩 1M 上下文</td>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/07-csa-hca-hhyszyl/07-csa-hca-hhyszyl">2.3.2/07-CSA-HCA</a></td>
</tr>
</tbody></table>
<blockquote>
<p>延伸阅读：<a href="https://github.com/Dao-AILab/flash-attention">FlashAttention 官方仓库</a>、<a href="https://docs.vllm.ai/en/latest/design/paged_attention.html">vLLM PagedAttention 文档</a>。</p>
</blockquote>
<p>2017年Transformer诞生时, MHA(Multi-Head Attention)的KV Cache开销并非设计考量——BERT序列长度512, GPT-2仅1024, 显存瓶颈在于模型参数而非中间激活. 2022年后, 长上下文竞赛将序列长度推至128K甚至1M, KV Cache从&quot;可忽略的辅助结构&quot;跃升为&quot;推理系统的头号内存消费者&quot;. Llama-2-7B在batch=1、seq=1024时KV Cache约500MB, batch=32时超16GB, 已接近单卡A100 80GB的物理上限. </p>
<p>社区对此的回应不是单一方案, 而是一条&quot;压缩-共享-稀疏&quot;的渐进演进链：</p>
<table>
<thead>
<tr>
<th>架构</th>
<th>年份</th>
<th>核心策略</th>
<th>KV Cache压缩比</th>
<th>表达力损失</th>
<th>工业采用</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>2017</td>
<td>每头独立Q/K/V</td>
<td>1x(基准)</td>
<td>无</td>
<td>所有早期模型</td>
</tr>
<tr>
<td>MQA</td>
<td>2019</td>
<td>所有头共享同一对K/V</td>
<td>1/h</td>
<td>中等</td>
<td>PaLM、StarCoder</td>
</tr>
<tr>
<td>GQA</td>
<td>2023</td>
<td>分组共享K/V</td>
<td>1/(h/g)</td>
<td>微小</td>
<td>Llama-2/3、Qwen、Mixtral</td>
</tr>
<tr>
<td>MLA</td>
<td>2024</td>
<td>低秩潜向量压缩+矩阵吸收</td>
<td>1/(h*d/r)</td>
<td>微小</td>
<td>DeepSeek-V2/V3</td>
</tr>
<tr>
<td>NSA</td>
<td>2025</td>
<td>硬件对齐的可训练稀疏注意力</td>
<td>O(n/t)</td>
<td>微小</td>
<td>DeepSeek实验性</td>
</tr>
<tr>
<td>CSA + HCA</td>
<td>2026</td>
<td>序列压缩 + 稀疏/稠密混合</td>
<td>O(n/m)+O(n/128)</td>
<td>微小</td>
<td>DeepSeek-V4</td>
</tr>
</tbody></table>
<p>这条演进链的物理本质是：注意力头的&quot;表达能力&quot;与&quot;存储开销&quot;之间的trade-off. MHA假设每个头需要独立的K/V表示以捕捉不同语义模式; MQA质疑这一假设的冗余性; GQA寻求折中; MLA通过低秩重构证明&quot;压缩后的表示仍可恢复全精度特征&quot;; NSA和MoBA则跳出&quot;共享 vs 独立&quot;的二元对立, 引入&quot;选择性计算&quot;——不为所有token存储或计算K/V, 只为&quot;重要的&quot;token做. </p>
<h3 id="2-2-gyjzyyycj">2.2 工业价值与应用场景</h3>
<table>
<thead>
<tr>
<th>架构</th>
<th>生产部署状态</th>
<th>关键指标改善</th>
<th>典型场景</th>
</tr>
</thead>
<tbody><tr>
<td>GQA</td>
<td>Llama-2/3、Qwen、Mixtral默认配置</td>
<td>KV Cache减少4-8倍, P99延迟降低15-25%</td>
<td>通用对话API、代码补全</td>
</tr>
<tr>
<td>MLA</td>
<td>DeepSeek-V2/V3核心组件</td>
<td>KV Cache减少至2.25x MQA水平, 推理速度提升5-10倍</td>
<td>长文档理解、多轮对话</td>
</tr>
<tr>
<td>NSA</td>
<td>DeepSeek实验性发布(2025.02)</td>
<td>64K上下文训练前向9x加速, 解码11.6x加速</td>
<td>超长上下文预训练</td>
</tr>
<tr>
<td>MoBA</td>
<td>Kimi长上下文生产环境</td>
<td>1000万token上下文计算时间减少16倍</td>
<td>极长文档分析、长思维链推理</td>
</tr>
</tbody></table>
<p>MLA的工业价值尤为突出. DeepSeek-V2在保持与Llama-3-70B相当性能的同时, 推理成本降至1/5——核心驱动力正是MLA对KV Cache的极致压缩. Kimi采用MoBA支撑200万token上下文窗口, 证明了稀疏注意力在高并发生产环境中的可行性. </p>
<h2 id="3-wlzj-kv-cache-wsmspj">3. 物理直觉：KV Cache为什么是瓶颈</h2>
<h3 id="3-1-tljddncylly">3.1 推理阶段的内存压力来源</h3>
<p>LLM推理分两个阶段：</p>
<ul>
<li><strong>Prefill</strong>：一次性并行处理全部prompt token, 计算首个输出token</li>
<li><strong>Decode</strong>：自回归生成, 每次只计算一个新token的Q, 但需与所有历史K/V做点积</li>
</ul>
<p>Decode阶段的核心矛盾：计算量小(O(1)个新token), 但访存量大(需读取全部历史KV). 以Llama-2-7B为例(L=32层, d=4096, h=32头, GQA后g=4组)：</p>
<p>单token KV Cache = 2 * L * h_kv * d_head * 2bytes(FP16) = 2 * 32 * 4 * 128 * 2 = 65,536 bytes ≈ 64KB</p>
<p>batch=32, seq=4096时：KV Cache = 64KB * 32 * 4096 = 8,388,608 KB ≈ 8GB</p>
<p>这已超过A100 40GB显存的20%, 加上模型参数(14GB FP16)和激活值, 总显存逼近物理上限. </p>
<h3 id="3-2-styslx">3.2 四条压缩路线</h3>
<table>
<thead>
<tr>
<th>路线</th>
<th>原理</th>
<th>代表方法</th>
<th>压缩极限</th>
</tr>
</thead>
<tbody><tr>
<td>共享KV</td>
<td>多Q头共享一对K/V</td>
<td>MQA、GQA</td>
<td>1/h</td>
</tr>
<tr>
<td>窗口KV</td>
<td>只缓存最近W个token的KV</td>
<td>Longformer、Sliding Window</td>
<td>W/S</td>
</tr>
<tr>
<td>量化压缩</td>
<td>用INT8/INT4替代FP16存储KV</td>
<td>INT8 KV Cache</td>
<td>2x-4x</td>
</tr>
<tr>
<td>计算优化</td>
<td>减少HBM访存, 提升片上计算比例</td>
<td>FlashAttention</td>
<td>常数因子</td>
</tr>
</tbody></table>
<p>共享KV是最主流的路线, 因为它不牺牲长距离依赖能力( unlike 窗口KV), 且实现简单(unlike 量化压缩的精度敏感). </p>
<h2 id="4-sxtdyjgdb">4. 数学推导与架构对比</h2>
<h3 id="4-1-mha-jzjg">4.1 MHA：基准架构</h3>
<p>对于序列中第t个token, 第i个注意力头的计算：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>q</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mi>i</mi><mi>Q</mi></msubsup><msub><mi>x</mi><mi>t</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>k</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mi>i</mi><mi>K</mi></msubsup><msub><mi>x</mi><mi>t</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>v</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mi>i</mi><mi>V</mi></msubsup><msub><mi>x</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">q_{t,i} = W_i^Q x_t, \\quad k_{t,i} = W_i^K x_t, \\quad v_{t,i} = W_i^V x_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2453em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4231em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">Q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1774em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>o</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub><mo>=</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>t</mi></munderover><mtext>Softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msubsup><mi>q</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow><mi>T</mi></msubsup><msub><mi>k</mi><mrow><mi>j</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>v</mi><mrow><mi>j</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub></mrow><annotation encoding="application/x-tex">o_{t,i} = \\sum_{j=1}^{t} \\text{Softmax}\\left(\\frac{q_{t,i}^T k_{j,i}}{\\sqrt{d_k}}\\right) v_{j,i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1943em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.7806em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6261em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>o</mi><mi>t</mi></msub><mo>=</mo><msup><mi>W</mi><mi>O</mi></msup><mo stretchy="false">[</mo><msub><mi>o</mi><mrow><mi>t</mi><mo separator="true">,</mo><mn>1</mn></mrow></msub><mo separator="true">;</mo><msub><mi>o</mi><mrow><mi>t</mi><mo separator="true">,</mo><mn>2</mn></mrow></msub><mo separator="true">;</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">;</mo><msub><mi>o</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>h</mi></mrow></msub><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">o_t = W^O [o_{t,1}; o_{t,2}; ...; o_{t,h}]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1774em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span></span></span></span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mtight">2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span></span></span></span><p><strong>KV Cache规模</strong>：每层h个头, 每个头存储一对(d_k维)K/V. 总Cache = 2 * h * d_k * L * S * batch. </p>
<p>以Qwen-72B为例(L=80, h=64, d_k=128, batch=1, S=2048)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>KV Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mn>80</mn><mo>×</mo><mn>64</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>2048</mn><mo>×</mo><mn>2</mn><mtext>(bytes)</mtext><mo>=</mo><mn>5.37</mn><mtext>GB</mtext></mrow><annotation encoding="application/x-tex">\\text{KV Cache} = 2 \\times 80 \\times 64 \\times 128 \\times 2048 \\times 2\\text{(bytes)} = 5.37\\text{GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">KV Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">80</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2048</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2</span><span class="mord text"><span class="mord">(bytes)</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">5.37</span><span class="mord text"><span class="mord">GB</span></span></span></span></span></span><h3 id="4-2-mqa-jzgx">4.2 MQA：极致共享</h3>
<p>MQA将所有Q头共享同一对K/V：</p>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 56: … \\text{(单头, 维度d_̲k)}" style="color:#cc0000">k_t = W^K x_t, \\quad v_t = W^V x_t \\quad \\text{(单头, 维度d_k)}</span><p>每个Q头i仍独立计算：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>o</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow></msub><mo>=</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>t</mi></munderover><mtext>Softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msubsup><mi>q</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>i</mi></mrow><mi>T</mi></msubsup><msub><mi>k</mi><mi>j</mi></msub></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>v</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">o_{t,i} = \\sum_{j=1}^{t} \\text{Softmax}\\left(\\frac{q_{t,i}^T k_j}{\\sqrt{d_k}}\\right) v_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1943em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.7806em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6261em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>KV Cache压缩</strong>：从h头降至1头, 压缩比1/h. </p>
<p>Llama-2-7B(h=32)：Cache从约500MB降至16MB(batch=1, S=1024). </p>
<p><strong>表达力损失</strong>：所有Q头被迫关注相同的K/V模式, 无法学习多样化的注意力模式. PaLM-540B实验表明, MQA在需要细粒度语义区分的任务(如指代消解)上弱于MHA约2-3%. </p>
<h3 id="4-3-gqa-fzzz">4.3 GQA：分组折中</h3>
<p>GQA将h个Q头分为g组, 每组共享一对K/V：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>k</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>j</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mi>j</mi><mi>K</mi></msubsup><msub><mi>x</mi><mi>t</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>v</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>j</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mi>j</mi><mi>V</mi></msubsup><msub><mi>x</mi><mi>t</mi></msub><mo separator="true">,</mo><mspace width="1em"/><mi>j</mi><mo>=</mo><mn>1</mn><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><mi>g</mi></mrow><annotation encoding="application/x-tex">k_{t,j} = W_j^K x_t, \\quad v_{t,j} = W_j^V x_t, \\quad j = 1, ..., g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2744em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2744em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span></span><p>第i个Q头属于组j = floor(i / (h/g)), 使用该组的K/V. </p>
<p><strong>KV Cache</strong>：g对头, 压缩比1/(h/g) = g/h. </p>
<p>Llama-2-7B(h=32, g=4)：Cache约64MB, 是MHA的1/8, 是MQA的4倍. </p>
<p><strong>表达力</strong>：组内Q头共享K/V, 但不同组仍有独立表示. Llama-2论文显示, GQA在多数任务上接近MHA, 在推理密集型任务上优于MQA 1-2%. </p>
<p><strong>关键洞察</strong>：GQA是MHA(g=h)和MQA(g=1)的连续插值. 通过调整g, 可以在Cache压缩和表达力之间做连续trade-off. </p>
<h3 id="4-4-mla-dzqxlys">4.4 MLA：低秩潜向量压缩</h3>
<p>MLA的核心思想是将K/V联合压缩到一个低维潜向量c_t^{KV}, 维度d_c远小于h*d_k. </p>
<p><strong>压缩投影</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>c</mi><mi>t</mi><mrow><mi>K</mi><mi>V</mi></mrow></msubsup><mo>=</mo><msup><mi>W</mi><mrow><mi>D</mi><mi>K</mi><mi>V</mi></mrow></msup><msub><mi>x</mi><mi>t</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msubsup><mi>c</mi><mi>t</mi><mrow><mi>K</mi><mi>V</mi></mrow></msubsup><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><msub><mi>d</mi><mi>c</mi></msub></msup></mrow><annotation encoding="application/x-tex">c_t^{KV} = W^{DKV} x_t, \\quad c_t^{KV} \\in \\mathbb{R}^{d_c}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8991em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span><p><strong>解压缩恢复</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>k</mi><mi>t</mi></msub><mo>=</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><msubsup><mi>c</mi><mi>t</mi><mrow><mi>K</mi><mi>V</mi></mrow></msubsup><mo separator="true">,</mo><mspace width="1em"/><msub><mi>v</mi><mi>t</mi></msub><mo>=</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>V</mi></mrow></msup><msubsup><mi>c</mi><mi>t</mi><mrow><mi>K</mi><mi>V</mi></mrow></msubsup></mrow><annotation encoding="application/x-tex">k_t = W^{UK} c_t^{KV}, \\quad v_t = W^{UV} c_t^{KV}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中W^{DKV} \\in \\mathbb{R}^{d_c \\times d}, W^{UK} \\in \\mathbb{R}^{h \\cdot d_k \\times d_c}, W^{UV} \\in \\mathbb{R}^{h \\cdot d_k \\times d_c}. </p>
<p><strong>KV Cache</strong>：只需存储d_c维的潜向量, 而非h*d_k维的全K/V. </p>
<p>DeepSeek-V2配置：d_c = 512, h<em>d_k = 64</em>128 = 8192. 压缩比 = 8192/512 = 16x. </p>
<p><strong>矩阵吸收优化(推理关键)</strong>：</p>
<p>Decode阶段计算q_t^T k_s时：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>q</mi><mi>t</mi><mi>T</mi></msubsup><msub><mi>k</mi><mi>s</mi></msub><mo>=</mo><mo stretchy="false">(</mo><msup><mi>W</mi><mi>Q</mi></msup><msub><mi>x</mi><mi>t</mi></msub><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo stretchy="false">(</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><msup><mi>W</mi><mrow><mi>D</mi><mi>K</mi><mi>V</mi></mrow></msup><msub><mi>x</mi><mi>s</mi></msub><mo stretchy="false">)</mo><mo>=</mo><msubsup><mi>x</mi><mi>t</mi><mi>T</mi></msubsup><mo stretchy="false">(</mo><msup><mi>W</mi><msup><mi>Q</mi><mi>T</mi></msup></msup><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><msup><mi>W</mi><mrow><mi>D</mi><mi>K</mi><mi>V</mi></mrow></msup><mo stretchy="false">)</mo><msub><mi>x</mi><mi>s</mi></msub></mrow><annotation encoding="application/x-tex">q_t^T k_s = (W^Q x_t)^T (W^{UK} W^{DKV} x_s) = x_t^T (W^{Q^T} W^{UK} W^{DKV}) x_s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3064em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.0564em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9191em;"><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>预计算W^{Q^T} W^{UK} W^{DKV}, 将两次矩阵乘法合并为一次, decode计算量从O(h*d_k)降至O(d_c). </p>
<p><strong>与LoRA的关联</strong>：MLA的低秩投影灵感来自LoRA. 区别在于LoRA用于微调时压缩参数更新, MLA用于推理时压缩KV表示. 两者都利用了&quot;高维特征的低秩结构&quot;这一经验观察. </p>
<h3 id="4-5-nsa-yjdqdkxlxszyl">4.5 NSA：硬件对齐的可训练稀疏注意力</h3>
<p>NSA提出&quot;原生可训练稀疏&quot;——在训练阶段就引入稀疏性, 而非仅在推理时应用. </p>
<p><strong>三种映射策略</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>o</mi><mi>t</mi><mo>∗</mo></msubsup><mo>=</mo><munder><mo>∑</mo><mrow><mi>c</mi><mo>∈</mo><mo stretchy="false">{</mo><mi>c</mi><mi>m</mi><mi>p</mi><mo separator="true">,</mo><mi>s</mi><mi>l</mi><mi>c</mi><mo separator="true">,</mo><mi>w</mi><mi>i</mi><mi>n</mi><mo stretchy="false">}</mo></mrow></munder><msubsup><mi>g</mi><mi>t</mi><mi>c</mi></msubsup><mo>⋅</mo><mtext>Attn</mtext><mo stretchy="false">(</mo><msub><mi>q</mi><mi>t</mi></msub><mo separator="true">,</mo><msubsup><mover accent="true"><mi>K</mi><mo>~</mo></mover><mi>t</mi><mi>c</mi></msubsup><mo separator="true">,</mo><msubsup><mover accent="true"><mi>V</mi><mo>~</mo></mover><mi>t</mi><mi>c</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">o_t^* = \\sum_{c \\in \\{cmp, slc, win\\}} g_t^c \\cdot \\text{Attn}(q_t, \\tilde{K}_t^c, \\tilde{V}_t^c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9857em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">∗</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.566em;vertical-align:-1.516em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span><span class="mrel mtight">∈</span><span class="mopen mtight">{</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">p</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">c</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span><span class="mord mathnormal mtight">in</span><span class="mclose mtight">}</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.516em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1702em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attn</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">~</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">~</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><ul>
<li><strong>压缩(cmp)</strong>：将连续token块聚合为块级表示, 捕获粗粒度语义</li>
<li><strong>选择(slc)</strong>：基于压缩token的注意力分数, 选择Top-n重要块</li>
<li><strong>滑动窗口(win)</strong>：保留最近w个token, 捕获局部模式</li>
</ul>
<p><strong>门控机制</strong>：g_t^c \\in [0,1]由输入特征经MLP+sigmoid得到, 动态平衡三种策略的贡献. </p>
<p><strong>关键创新——可训练性</strong>：
传统稀疏注意力(如H2O、Quest)仅在推理时应用, 导致训练-推理不一致. NSA在训练时就使用相同的稀疏模式, 通过特殊的梯度传播机制确保稳定性：</p>
<ul>
<li>三个分支提供独立的K/V对, 防止局部与长距离模式间的梯度干扰</li>
<li>块级选择操作保持可微(通过soft top-k近似)</li>
</ul>
<p><strong>工业指标</strong>：</p>
<ul>
<li>64K上下文训练：前向9x加速, 反向6x加速</li>
<li>64K上下文解码：11.6x加速</li>
<li>Needle-in-a-Haystack：64K下完美召回</li>
<li>AIME 24数学推理：8K/16K上下文分别提升0.075/0.054</li>
</ul>
<h3 id="4-6-moba-moe-ly-kjxs">4.6 MoBA：MoE路由+块级稀疏</h3>
<p>MoBA将MoE的top-k路由机制应用于注意力：将上下文划分为n个块, 每个查询只关注最相关的k个块. </p>
<p><strong>块分区</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>I</mi><mi>i</mi></msub><mo>=</mo><mo stretchy="false">[</mo><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>⋅</mo><mi>B</mi><mo>+</mo><mn>1</mn><mo separator="true">,</mo><mi>i</mi><mo>⋅</mo><mi>B</mi><mo stretchy="false">]</mo><mo separator="true">,</mo><mspace width="1em"/><mi>i</mi><mo>=</mo><mn>1</mn><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">I_i = [(i-1) \\cdot B + 1, i \\cdot B], \\quad i = 1, ..., n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[(</span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">]</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span></span></span></span></span><p>其中B为块大小, n = N/B为块数. </p>
<p><strong>门控选择</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub><mo>=</mo><mo stretchy="false">⟨</mo><mi>q</mi><mo separator="true">,</mo><mtext>mean_pool</mtext><mo stretchy="false">(</mo><mi>K</mi><mo stretchy="false">[</mo><msub><mi>I</mi><mi>i</mi></msub><mo stretchy="false">]</mo><mo stretchy="false">)</mo><mo stretchy="false">⟩</mo></mrow><annotation encoding="application/x-tex">s_i = \\langle q, \\text{mean\\_pool}(K[I_i]) \\rangle</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mopen">⟨</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">mean_pool</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">])⟩</span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>g</mi><mi>i</mi></msub><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>1</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>s</mi><mi>i</mi></msub><mo>∈</mo><mtext>Topk</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>s</mi><mi>j</mi></msub><mo stretchy="false">}</mo><mo separator="true">,</mo><mi>k</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mn>0</mn></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">g_i = \\begin{cases} 1 &amp; s_i \\in \\text{Topk}(\\{s_j\\}, k) \\\\ 0 &amp; \\text{otherwise} \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">1</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">Topk</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">}</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p><strong>注意力计算</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MoBA</mtext><mo stretchy="false">(</mo><mi>q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Softmax</mtext><mo stretchy="false">(</mo><mi>q</mi><mi>K</mi><mo stretchy="false">[</mo><mi>I</mi><msup><mo stretchy="false">]</mo><mi>T</mi></msup><mo stretchy="false">)</mo><mi>V</mi><mo stretchy="false">[</mo><mi>I</mi><mo stretchy="false">]</mo><mo separator="true">,</mo><mspace width="1em"/><mi>I</mi><mo>=</mo><munder><mo>⋃</mo><mrow><msub><mi>g</mi><mi>i</mi></msub><mo>&gt;</mo><mn>0</mn></mrow></munder><msub><mi>I</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\text{MoBA}(q, K, V) = \\text{Softmax}(q K[I]^T) V[I], \\quad I = \\bigcup_{g_i &gt; 0} I_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">MoBA</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mopen">[</span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mclose"><span class="mclose">]</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mopen">[</span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mclose">]</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4532em;vertical-align:-1.4032em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mrel mtight">&gt;</span><span class="mord mtight">0</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">⋃</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4032em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>因果性保持</strong>：</p>
<ol>
<li>查询不路由到未来块：pos(q) &lt; i*B时, s_i = -inf</li>
<li>强制路由到当前块：包含查询的块始终被选中</li>
<li>当前块内应用标准因果掩码</li>
</ol>
<p><strong>与MoE的类比</strong>：</p>
<table>
<thead>
<tr>
<th>MoE</th>
<th>MoBA</th>
</tr>
</thead>
<tbody><tr>
<td>专家 = FFN子网络</td>
<td>专家 = 上下文块</td>
</tr>
<tr>
<td>路由到top-k专家</td>
<td>路由到top-k块</td>
</tr>
<tr>
<td>负载均衡损失</td>
<td>块选择均匀性(隐式)</td>
</tr>
<tr>
<td>共享专家</td>
<td>当前块注意力(强制)</td>
</tr>
</tbody></table>
<p><strong>混合训练策略</strong>：
MoBA可与全注意力层混合——底层用MoBA捕获长距离依赖, 顶层用全注意力保证精细推理. 监督微调时, 将最后几层从MoBA切回全注意力, 可显著降低SFT损失. </p>
<p><strong>工业指标</strong>：</p>
<ul>
<li>1000万token上下文：计算时间减少16倍</li>
<li>32K序列：损失与全注意力接近, 差距随长度增加而缩小</li>
<li>Llama-3.1-8B：RULER和Needle in a Haystack上表现几乎与全注意力相同</li>
</ul>
<h2 id="5-slcbyszzc">5. 算力成本与数值走查</h2>
<h3 id="5-1-gjg-kv-cache-db-llama-2-7b-pz">5.1 各架构KV Cache对比(Llama-2-7B配置)</h3>
<table>
<thead>
<tr>
<th>架构</th>
<th>头配置</th>
<th>每token Cache</th>
<th>batch=32, S=4096</th>
<th>相对MHA</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>32头独立</td>
<td>64KB</td>
<td>8.0GB</td>
<td>1.0x</td>
</tr>
<tr>
<td>GQA(g=4)</td>
<td>4组共享</td>
<td>8KB</td>
<td>1.0GB</td>
<td>0.125x</td>
</tr>
<tr>
<td>MQA</td>
<td>1头共享</td>
<td>2KB</td>
<td>0.25GB</td>
<td>0.031x</td>
</tr>
<tr>
<td>MLA(d_c=512)</td>
<td>潜向量</td>
<td>1KB</td>
<td>0.125GB</td>
<td>0.016x</td>
</tr>
</tbody></table>
<h3 id="5-2-tlycdb-a100-80gb-fp16-batch-16-s-8192">5.2 推理延迟对比(A100 80GB, FP16, batch=16, S=8192)</h3>
<table>
<thead>
<tr>
<th>架构</th>
<th>Prefill时间</th>
<th>Decode时间(单token)</th>
<th>总KV Cache</th>
<th>最大batch</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>120ms</td>
<td>8.5ms</td>
<td>8.4GB</td>
<td>8</td>
</tr>
<tr>
<td>GQA</td>
<td>118ms</td>
<td>7.2ms</td>
<td>1.1GB</td>
<td>48</td>
</tr>
<tr>
<td>MQA</td>
<td>115ms</td>
<td>6.8ms</td>
<td>0.26GB</td>
<td>128</td>
</tr>
<tr>
<td>MLA</td>
<td>122ms</td>
<td>4.5ms</td>
<td>0.13GB</td>
<td>256</td>
</tr>
</tbody></table>
<p>注：MLA decode时间更短得益于矩阵吸收——避免了重复的Q投影计算. </p>
<h3 id="5-3-jdssdb-hella-swag-wino-grande-arc-easy">5.3 精度损失对比(HellaSwag, WinoGrande, ARC-easy)</h3>
<table>
<thead>
<tr>
<th>架构</th>
<th>HellaSwag</th>
<th>WinoGrande</th>
<th>ARC-easy</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>76.2</td>
<td>68.5</td>
<td>72.1</td>
<td>72.3</td>
</tr>
<tr>
<td>GQA</td>
<td>76.0</td>
<td>68.3</td>
<td>71.9</td>
<td>72.1 (-0.2%)</td>
</tr>
<tr>
<td>MQA</td>
<td>75.1</td>
<td>67.2</td>
<td>70.8</td>
<td>71.0 (-1.3%)</td>
</tr>
<tr>
<td>MLA</td>
<td>76.1</td>
<td>68.4</td>
<td>72.0</td>
<td>72.2 (-0.1%)</td>
</tr>
</tbody></table>
<p>MLA几乎无损压缩, MQA在长程依赖任务上损失明显. </p>
<h2 id="6-bjtjysxms">6. 边界条件与失效模式</h2>
<table>
<thead>
<tr>
<th>架构</th>
<th>失效场景</th>
<th>物理根源</th>
<th>症状</th>
<th>缓解</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td>超长序列(batch&gt;64, S&gt;32K)</td>
<td>KV Cache线性增长, 超出HBM容量</td>
<td>OOM、推理崩溃</td>
<td>切至GQA/MLA, 或分层分页</td>
</tr>
<tr>
<td>MQA</td>
<td>需细粒度多语义模式任务</td>
<td>单一K/V无法表达多样化注意力</td>
<td>指代消解、多义消歧下降2-3%</td>
<td>切至GQA恢复部分能力</td>
</tr>
<tr>
<td>GQA</td>
<td>极端比例(g=1接近MQA)</td>
<td>KV head过少, Tensor Core填充不足</td>
<td>小batch时GPU利用率&lt;60%</td>
<td>使用Split-KV或增大batch</td>
</tr>
<tr>
<td>MLA</td>
<td>低秩维度d_c过小</td>
<td>信息瓶颈, 潜向量容量不足</td>
<td>复杂推理任务性能下降</td>
<td>d_c &gt;= 512(DeepSeek经验值)</td>
</tr>
<tr>
<td>NSA</td>
<td>短序列(S&lt;4K)</td>
<td>稀疏选择开销&gt;计算节省</td>
<td>比全注意力慢5-10%</td>
<td>框架自动回退全注意力</td>
</tr>
<tr>
<td>MoBA</td>
<td>块粒度过粗(B&gt;256)</td>
<td>块内包含无关token, 选择精度下降</td>
<td>长程依赖召回率下降</td>
<td>B=32-64(论文推荐)</td>
</tr>
</tbody></table>
<h2 id="7-jsqz">7. 技术前瞻</h2>
<p><strong>短期(2025-2026)</strong>：</p>
<ul>
<li>MLA成为主流：Qwen3、Llama-4等下一代模型大概率采用MLA或变体</li>
<li>NSA/MoBA成熟：从实验性走向生产, 与FlashAttention联合使用(稀疏+硬件优化)</li>
<li>混合架构：底层用MoBA处理长上下文, 顶层用MLA保证精度</li>
</ul>
<p><strong>中期(2026-2028)</strong>：</p>
<ul>
<li>自适应稀疏：根据输入动态调整稀疏率, 非固定top-k</li>
<li>量化+压缩联合：INT4 MLA潜向量, KV Cache再压缩4倍</li>
<li>专用稀疏注意力芯片：将MoBA路由逻辑硬化为ASIC</li>
</ul>
<p><strong>长期(2028+)</strong>：</p>
<ul>
<li>上下文长度不再受限：1亿token上下文成为常态, 注意力从&quot;计算瓶颈&quot;变为&quot;检索瓶颈&quot;</li>
<li>注意力机制消亡：线性复杂度模块(Mamba、RWKV)在多数场景替代注意力, 仅保留顶层少量注意力层维持精度</li>
</ul>
<h2 id="8-ckwx">8. 参考文献</h2>
<ol>
<li>Vaswani, A., et al. (2017). Attention Is All You Need. NeurIPS.</li>
<li>Shazeer, N. (2019). Fast Transformer Decoding: One Write-Head is All You Need. arXiv:1911.02150.</li>
<li>Ainslie, J., et al. (2023). GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints. arXiv:2305.13245.</li>
<li>DeepSeek-AI. (2024). DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model. arXiv:2405.04434.</li>
<li>DeepSeek-AI. (2025). Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention. arXiv:2502.11089.</li>
<li>Moonshot AI. (2025). Mixture of Block Attention for Long-Context LLMs. <a href="https://github.com/MoonshotAI/MoBA">https://github.com/MoonshotAI/MoBA</a>.</li>
</ol>
<h2 id="3-ydlxjy">3. 阅读路线建议</h2>
<ul>
<li><strong>工程部署与系统优化导向</strong>：优先阅读 <code>2.3.1-硬件高效注意力</code> 中的 PagedAttention 与 vLLM 机制, 这是优化在线推理吞吐和降低 GPU 显存占用的工业必会技能. </li>
<li><strong>算法设计与架构创新导向</strong>：优先阅读 <code>2.3.3-线性注意力机制</code> 和 <code>2.3.5-多头潜在注意力MLA</code>, 理解混合注意力架构(DeltaNet + Attention)以及低秩矩阵压缩如何重新定义现代超大规模基础模型(如 DeepSeek-V3/V4 和 Qwen3-Next)的骨干网络. </li>
<li><strong>多模态与长视频生成导向</strong>：优先阅读 <code>2.3.2-稀疏与压缩注意力</code> 中的 Radial Attention, 掌握时空能量衰减规律如何帮助 DiT (Diffusion Transformer) 视频生成模型突破百万级序列复杂度的算力枷锁.</li>
</ul>
<hr>
<h2 id="4-zyzzzyjdbszyl-escbjg">4. 这一章真正研究的不是注意力, 而是成本结构</h2>
<p>表面上看, <code>2.3</code> 仍然在讨论注意力机制; 但从本质上说, 这一章真正研究的是 <strong>注意力成本结构如何被重写</strong>. </p>
<p>标准 Attention 的成功已经毋庸置疑, 因此后续工作并不是要证明“attention 有问题”, 而是要解决：当模型规模、上下文长度和并发规模都继续上涨时, 这种成功如何继续维持. </p>
<p>于是整个 <code>2.3</code> 可以看成围绕三类成本展开：</p>
<ol>
<li><p><strong>IO / 访存成本</strong><br>典型答案是 FlashAttention. </p>
</li>
<li><p><strong>KV Cache 存储与带宽成本</strong><br>典型答案是 MQA、GQA、MLA、PagedAttention. </p>
</li>
<li><p><strong>全连接注意力图本身的计算成本</strong><br>典型答案是稀疏注意力、线性注意力、块级路由.</p>
</li>
</ol>
<p>这三类成本并不互斥, 而是共同构成现代大模型注意力系统的真实账本. </p>
<h2 id="5-wsmsgxzyllxylyfh">5. 为什么说高效注意力路线越来越分化</h2>
<p>在早期阶段, 大家还在问“有没有更快的注意力”. 到了今天, 这个问题已经不够精确. 因为“更快”至少可能指三件完全不同的事：</p>
<ul>
<li>Prefill 更快</li>
<li>Decode 更快</li>
<li>长上下文更能撑</li>
</ul>
<p>而这三者的最优路线并不相同. </p>
<p>FlashAttention 对 Prefill 极其重要, 因为它本质上是在重写稠密 attention 的执行顺序.<br>PagedAttention 更偏 Decode, 因为它关注的是 KV Cache 如何被组织与复用.<br>稀疏与压缩注意力更偏“超长上下文下如何不做无意义计算”.<br>线性注意力则更激进, 它试图从公式层面把成本结构整体改写. </p>
<p>这意味着今天讲“高效注意力”, 已经不能再把所有方法放在同一维度上粗暴比较. 你必须先问：你优化的到底是哪个阶段、哪个瓶颈. </p>
<h2 id="6-zyzdtyydkj">6. 这一章的统一阅读框架</h2>
<p>为了避免后面章节变成“方法名词大全”, 建议你用一个统一框架来读 <code>2.3</code>：</p>
<h3 id="dyw-tgdsnyc">第一问：它改的是哪一层</h3>
<ul>
<li>算子执行层</li>
<li>结构层</li>
<li>存储层</li>
<li>路由层</li>
</ul>
<h3 id="dew-tyhdsngjd">第二问：它优化的是哪个阶段</h3>
<ul>
<li>训练前向</li>
<li>训练反向</li>
<li>Prefill</li>
<li>Decode</li>
</ul>
<h3 id="dsw-tfcddjssm">第三问：它付出的代价是什么</h3>
<ul>
<li>数学近似误差</li>
<li>表达能力下降</li>
<li>实现复杂度上升</li>
<li>对硬件架构更强依赖</li>
</ul>
<p>只要按这个框架看, <code>2.3.1</code> 到 <code>2.3.5</code> 就不会显得零散. </p>
<h2 id="7-flash-attention-xszyl-xxzylbstdgx">7. FlashAttention、稀疏注意力、线性注意力不是替代关系</h2>
<p>一个常见误解是把这几条路线理解成“胜者通吃”的竞争关系. 事实上, 它们在现实系统里更像互补关系. </p>
<ul>
<li>FlashAttention：对稠密注意力做极致 IO 优化</li>
<li>稀疏注意力：减少必须计算的连边</li>
<li>线性注意力：改变注意力公式, 使复杂度降为线性</li>
<li>MLA：压缩 KV 表示与缓存结构</li>
</ul>
<p>很多现代系统最后采用的不是其中某一个, 而是“多个优化叠加”：</p>
<ul>
<li>稠密路径上跑 FlashAttention</li>
<li>超长上下文层引入块级稀疏</li>
<li>解码阶段用 GQA / MLA 压缩缓存</li>
<li>服务系统用 PagedAttention 管理内存</li>
</ul>
<p>所以这一章最重要的不是背方法, 而是建立“注意力优化是组合技, 不是单招”的认识. </p>
<h2 id="8-wsmzyzdtlxtyqgj">8. 为什么这一章对推理系统尤其关键</h2>
<p>如果你做的是论文复现, 这一章当然重要; 但如果你做的是推理服务系统, 这一章会直接决定你到底能不能把模型上线. </p>
<p>原因很简单：在真实服务中, 用户不会关心你用的是不是最优公式, 他们只会感受到：</p>
<ul>
<li>首 token 慢不慢</li>
<li>生成吞吐高不高</li>
<li>长文档会不会爆显存</li>
<li>并发上来后会不会抖</li>
</ul>
<p>而这些问题本质上都落在 <code>2.3</code> 里. 很多所谓“大模型工程”的核心矛盾, 最终都不是语义问题, 而是注意力成本结构问题. </p>
<h2 id="9-zyzh-2-4-2-5-dgx">9. 这一章和 2.4 / 2.5 的关系</h2>
<p><code>2.3</code> 和 <code>2.4 / 2.5</code> 的边界要分清. </p>
<ul>
<li><code>2.3</code> 重点是：Transformer 注意力还在, 但我们怎么把它做得更快、更省、更适合部署</li>
<li><code>2.4</code> 重点是：如果注意力本身不再是唯一主干, 会发生什么</li>
<li><code>2.5</code> 重点是：当上下文越来越长, 位置编码与外推机制如何继续支撑它</li>
</ul>
<p>换句话说：</p>
<ul>
<li><code>2.3</code> 更偏系统优化</li>
<li><code>2.4</code> 更偏架构替代</li>
<li><code>2.5</code> 更偏长度扩展</li>
</ul>
<p>读懂这三章的边界, 你就能把“高效注意力”“后注意力架构”“长上下文技术”三条线真正分开. </p>
<h2 id="10-tpzwjy">10. 图片占位建议</h2>
<p>如果你要给 <code>2.3</code> 总览页配图, 建议做一张真正的路线图, 而不是单点结构图. </p>
<p>最理想的图应包含：</p>
<ol>
<li>稠密 attention 的标准成本构成  </li>
<li>五条优化路线对应解决的成本项  </li>
<li>Prefill / Decode / 长上下文 三个阶段的主要瓶颈</li>
</ol>
<p>可直接给生图模型的 prompt:</p>
<pre><code class="language-text">Create a chapter overview roadmap for efficient and sparse attention in large language models. Show:
1) standard dense attention cost breakdown (compute, IO, KV cache),
2) five optimization routes: FlashAttention, PagedAttention, sparse/block attention, linear attention, MLA,
3) mapping of these methods to Prefill, Decode, and long-context bottlenecks.
Style: white background, research-paper roadmap figure, blue/orange/teal highlights, clean labels, precise arrows, no decorative elements.
</code></pre>
<h2 id="11-bzzlxj">11. 本章总览小结</h2>
<p>高效与稀疏注意力这一章真正想建立的, 不是一组方法名, 而是一种成本分析能力. </p>
<p>你要能看出：</p>
<ul>
<li>哪些问题来自二次复杂度本身</li>
<li>哪些问题来自 IO 和中间矩阵 materialization</li>
<li>哪些问题来自 KV Cache 管理</li>
<li>哪些问题必须靠改公式, 哪些只需重写执行路径</li>
</ul>
<p>只有这样, 后续面对 FlashAttention、MoBA、NSA、MLA、PagedAttention、DeltaNet、Mamba 这些路线时, 你才不会把它们混成一团, 而会知道它们分别在替你优化哪一笔账. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zstxyydlx","text":"1. 知识体系与阅读路线"},{"level":2,"id":"2-zyljgyj-c-mha-d-moba","text":"2. 注意力架构演进：从 MHA 到 MoBA"},{"level":3,"id":"2-1-wzyjl","text":"2.1 完整演进链"},{"level":3,"id":"2-2-gyjzyyycj","text":"2.2 工业价值与应用场景"},{"level":2,"id":"3-wlzj-kv-cache-wsmspj","text":"3. 物理直觉：KV Cache为什么是瓶颈"},{"level":3,"id":"3-1-tljddncylly","text":"3.1 推理阶段的内存压力来源"},{"level":3,"id":"3-2-styslx","text":"3.2 四条压缩路线"},{"level":2,"id":"4-sxtdyjgdb","text":"4. 数学推导与架构对比"},{"level":3,"id":"4-1-mha-jzjg","text":"4.1 MHA：基准架构"},{"level":3,"id":"4-2-mqa-jzgx","text":"4.2 MQA：极致共享"},{"level":3,"id":"4-3-gqa-fzzz","text":"4.3 GQA：分组折中"},{"level":3,"id":"4-4-mla-dzqxlys","text":"4.4 MLA：低秩潜向量压缩"},{"level":3,"id":"4-5-nsa-yjdqdkxlxszyl","text":"4.5 NSA：硬件对齐的可训练稀疏注意力"},{"level":3,"id":"4-6-moba-moe-ly-kjxs","text":"4.6 MoBA：MoE路由+块级稀疏"},{"level":2,"id":"5-slcbyszzc","text":"5. 算力成本与数值走查"},{"level":3,"id":"5-1-gjg-kv-cache-db-llama-2-7b-pz","text":"5.1 各架构KV Cache对比(Llama-2-7B配置)"},{"level":3,"id":"5-2-tlycdb-a100-80gb-fp16-batch-16-s-8192","text":"5.2 推理延迟对比(A100 80GB, FP16, batch=16, S=8192)"},{"level":3,"id":"5-3-jdssdb-hella-swag-wino-grande-arc-easy","text":"5.3 精度损失对比(HellaSwag, WinoGrande, ARC-easy)"},{"level":2,"id":"6-bjtjysxms","text":"6. 边界条件与失效模式"},{"level":2,"id":"7-jsqz","text":"7. 技术前瞻"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"},{"level":2,"id":"3-ydlxjy","text":"3. 阅读路线建议"},{"level":2,"id":"4-zyzzzyjdbszyl-escbjg","text":"4. 这一章真正研究的不是注意力, 而是成本结构"},{"level":2,"id":"5-wsmsgxzyllxylyfh","text":"5. 为什么说高效注意力路线越来越分化"},{"level":2,"id":"6-zyzdtyydkj","text":"6. 这一章的统一阅读框架"},{"level":3,"id":"dyw-tgdsnyc","text":"第一问：它改的是哪一层"},{"level":3,"id":"dew-tyhdsngjd","text":"第二问：它优化的是哪个阶段"},{"level":3,"id":"dsw-tfcddjssm","text":"第三问：它付出的代价是什么"},{"level":2,"id":"7-flash-attention-xszyl-xxzylbstdgx","text":"7. FlashAttention、稀疏注意力、线性注意力不是替代关系"},{"level":2,"id":"8-wsmzyzdtlxtyqgj","text":"8. 为什么这一章对推理系统尤其关键"},{"level":2,"id":"9-zyzh-2-4-2-5-dgx","text":"9. 这一章和 2.4 / 2.5 的关系"},{"level":2,"id":"10-tpzwjy","text":"10. 图片占位建议"},{"level":2,"id":"11-bzzlxj","text":"11. 本章总览小结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.3-efficient-attention/2.3-efficient-attention" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.3-efficient-attention/2.3-efficient-attention" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.3-高效与稀疏注意力</h1>
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
