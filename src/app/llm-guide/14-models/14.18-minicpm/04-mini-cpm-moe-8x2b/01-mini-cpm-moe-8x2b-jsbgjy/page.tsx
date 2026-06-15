"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-MoE-8x2B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文来源: MiniCPM 主论文(arXiv:2404.06395)Section 6.3 + GitHub README + 官方技术博客
原文链接: <a href="https://arxiv.org/abs/2404.06395">https://arxiv.org/abs/2404.06395</a> / <a href="https://github.com/OpenBMB/MiniCPM">https://github.com/OpenBMB/MiniCPM</a>
发布日期: 2024 年 4 月
发布机构: Modelbest Inc. (面壁智能) &amp; TsinghuaNLP
模型规模: 13.6B 非嵌入总参数, 4B 非嵌入激活参数
开源协议: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="1-mxdw-dcmxd-moe-sjlj">1 模型定位: 端侧模型的 MoE 升级路径</h2>
<p>MiniCPM-MoE-8x2B 是面壁智能于 2024 年 4 月发布的混合专家(MoE, Mixture of Experts)架构模型, 与 MiniCPM-1.2B、MiniCPM-2B-128K 和 MiniCPM-V-2.0 共同构成 MiniCPM 2.0 家族. 该模型在保持与 MiniCPM-2B 相近的推理成本(4B 激活参数)的同时, 将总参数量提升至 13.6B, 实现了显著的性能跃升.</p>
<p>MoE 架构的核心理念是&quot;稀疏激活&quot;: 模型拥有大量参数(13.6B), 但每个输入 token 只激活其中一小部分(4B). 这使得模型在不增加推理 FLOPs 的前提下, 获得了更大的参数容量和更强的表达能力.</p>
<blockquote>
<p>面壁智能选择为端侧模型引入 MoE 架构, 这是一个值得关注的技术决策. 在 2024 年初, MoE 主要应用于大模型领域(如 Mixtral-8x7B、DeepSeek-MoE), 端侧 SLM 采用 MoE 尚属少见. 面壁智能的洞察在于: 端侧部署的瓶颈是激活参数决定的实时计算量, 而非总参数量决定的静态存储. 如果模型可以在 4B 激活参数下达到 7B+ dense 模型的性能, 那么即使总参数达到 13.6B, 其端侧部署仍然是可行的——因为推理时只加载激活的专家, 内存和计算开销与 4B  dense 模型相当. 这一思路打破了&quot;端侧只能用小 dense 模型&quot;的固有认知.</p>
</blockquote>
<hr>
<h2 id="2-jgsj-8-zj-top-2-ly">2 架构设计: 8 专家 Top-2 路由</h2>
<h3 id="2-1-mxpz">2.1 模型配置</h3>
<p>MiniCPM-MoE-8x2B 采用标准的 Sparse Mixture of Experts 架构, 核心配置如下:</p>
<table>
<thead>
<tr>
<th>配置项</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>专家总数</td>
<td>8</td>
</tr>
<tr>
<td>每 token 激活专家数</td>
<td>2</td>
</tr>
<tr>
<td>非嵌入总参数</td>
<td>13.6B</td>
</tr>
<tr>
<td>非嵌入激活参数</td>
<td>4B</td>
</tr>
<tr>
<td>基座模型</td>
<td>MiniCPM-2B</td>
</tr>
<tr>
<td>训练方式</td>
<td>基于 2B 基座的 MoE 扩展 + 继续训练</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiniCPM-MoE-8x2B 核心架构配置.</p>
</blockquote>
<p>8 个专家、Top-2 路由的设计意味着每个 token 有 8 选 2 的组合空间, 共 28 种可能的专家组合. 路由器网络(router/gating network)为每个 token 输出 8 维的 logits, 经过 softmax 后选取概率最高的 2 个专家进行计算.</p>
<h3 id="2-2-jy-dense-mxd-moe-kzcl">2.2 基于 Dense 模型的 MoE 扩展策略</h3>
<p>与从头训练一个 MoE 模型不同, MiniCPM-MoE-8x2B 采用了<strong>基于 MiniCPM-2B 的扩展策略</strong>:</p>
<ol>
<li>将 MiniCPM-2B 的每个 FFN(Feed-Forward Network)层复制 8 份, 形成 8 个专家.</li>
<li>在每个 FFN 层前添加一个路由器网络, 学习将 token 路由到最合适的 2 个专家.</li>
<li>在扩展后的架构上进行继续训练, 让路由器网络和专家参数共同优化.</li>
</ol>
<blockquote>
<p>这一策略的设计动机非常清晰: 从头训练 13.6B 参数的 MoE 模型需要巨大的计算资源, 而基于已收敛的 2B dense 模型进行扩展, 可以复用基座模型已学习到的语言知识和表征能力. 将 FFN 复制 8 份作为初始专家, 相当于给每个专家一个&quot;好的起点&quot;, 而不是从零随机初始化. 这种做法在 Mixtral-8x7B 的训练中也有类似体现——Mixtral 的每个专家初始化为 Llama-2-7B 的 FFN 参数. 但 MiniCPM-MoE 的独特之处在于, 它不是简单地复制, 而是在复制后进行了针对性的继续训练, 使不同专家逐渐分化、各司其职. 代价是: 如果扩展后的训练数据不够多样化, 专家可能无法充分分化, 导致所有专家趋于同质化——这是 MoE 训练中常见但难以检测的问题.</p>
</blockquote>
<h3 id="2-3-fzjhyxlwdx">2.3 负载均衡与训练稳定性</h3>
<p>MoE 训练面临的一个核心挑战是<strong>负载不均衡</strong>(load imbalance): 如果路由器总是将大部分 token 发送到少数几个&quot;受欢迎&quot;的专家, 这些专家会过载, 而其他专家则处于闲置状态. 这不仅浪费了参数, 还会导致训练不稳定.</p>
<p>常见的解决方案包括:</p>
<ul>
<li><strong>辅助损失(auxiliary loss)</strong>: 在训练目标中添加一个负载均衡损失, 鼓励路由器将 token 均匀分配到所有专家.</li>
<li><strong>容量因子(capacity factor)</strong>: 限制每个专家在每轮前向传播中最多处理的 token 数, 超出的 token 被丢弃或重新路由.</li>
<li><strong>专家选择(Expert Choice)</strong>: 让专家主动选择 token, 而非 token 选择专家, 从根本上避免负载不均.</li>
</ul>
<p>虽然 MiniCPM-MoE-8x2B 未在公开资料中详细披露其负载均衡策略, 但从其在多项基准上的稳定表现推断, 模型很可能采用了辅助损失 + 容量因子的组合策略.</p>
<blockquote>
<p>负载均衡是 MoE 工程实现中最棘手的部分之一. 辅助损失虽然简单有效, 但它引入了额外的超参(损失权重), 如果权重过大, 路由器会过度追求均匀分配而忽略 token 与专家的语义匹配; 如果权重过小, 负载不均衡问题会卷土重来. 容量因子则是一个更&quot;硬性&quot;的约束——直接限制每个专家的吞吐量, 但这可能导致部分 token 被丢弃, 影响模型质量. MiniCPM-MoE-8x2B 作为端侧模型, 其 batch size 通常较小(单用户推理时 batch_size=1), 这使得负载不均衡问题更加突出: 在 batch_size=1 时, 每个 token 的路由决策完全独立, 没有 batch 内的统计平均效应来缓解不均衡. 因此, 端侧 MoE 的负载均衡比云端大 batch MoE 更具挑战性.</p>
</blockquote>
<hr>
<h2 id="3-xnpc-yxbddxgd">3 性能评测: 以小博大的新高度</h2>
<h3 id="3-1-jzmxpc">3.1 基座模型评测</h3>
<p>MiniCPM-MoE-8x2B 在多个学术基准上进行了评估, 结果如表 2 所示.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>BBH</th>
<th>MMLU</th>
<th>C-Eval</th>
<th>CMMLU</th>
<th>HumanEval</th>
<th>MBPP</th>
<th>GSM8K</th>
<th>MATH</th>
</tr>
</thead>
<tbody><tr>
<td>Llama2-34B*</td>
<td>44.1</td>
<td>62.6</td>
<td>-</td>
<td>-</td>
<td>22.6</td>
<td>33.0</td>
<td>42.2</td>
<td>6.24</td>
</tr>
<tr>
<td>Mistral-7B-Instruct-v0.2</td>
<td>39.81</td>
<td>60.51</td>
<td>42.55</td>
<td>41.92</td>
<td>36.59</td>
<td>39.63</td>
<td>40.49</td>
<td>4.95</td>
</tr>
<tr>
<td>Gemma-7B*</td>
<td>55.1</td>
<td>64.3</td>
<td>-</td>
<td>-</td>
<td>32.3</td>
<td>44.4</td>
<td>46.4</td>
<td>24.3</td>
</tr>
<tr>
<td>Qwen1.5-7B*</td>
<td>40.2</td>
<td>61</td>
<td>74.1</td>
<td>73.1</td>
<td>36</td>
<td>37.4</td>
<td>62.5</td>
<td>20.3</td>
</tr>
<tr>
<td>Deepseek-MoE(16B)*</td>
<td>-</td>
<td>45.0</td>
<td>40.6</td>
<td>42.5</td>
<td>26.8</td>
<td>39.2</td>
<td>18.8</td>
<td>4.3</td>
</tr>
<tr>
<td>MiniCPM-2.4B</td>
<td>36.87</td>
<td>53.46</td>
<td>51.13</td>
<td>51.07</td>
<td>50.00</td>
<td>35.93</td>
<td>53.83</td>
<td>10.24</td>
</tr>
<tr>
<td><strong>MiniCPM-MoE-8x2B</strong></td>
<td><strong>39.22</strong></td>
<td><strong>58.90</strong></td>
<td><strong>58.11</strong></td>
<td><strong>58.80</strong></td>
<td><strong>55.49</strong></td>
<td><strong>41.68</strong></td>
<td><strong>61.56</strong></td>
<td><strong>10.52</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: MiniCPM-MoE-8x2B 与同等规模及更大规模模型的性能对比. * 表示结果取自技术报告. † 表示评测集为 MBPP 全集. 数据取自 MiniCPM GitHub README.</p>
</blockquote>
<p>从表 2 可以观察到以下关键结论:</p>
<p><strong>第一, 相比基座 2B 全面提升</strong>. MiniCPM-MoE-8x2B 在 7 项评测中全面超越 MiniCPM-2.4B, 平均提升约 4.5 个百分点. 其中 GSM8K 从 53.83% 提升到 61.56%, 增幅达 7.73%, 是提升最显著的维度.</p>
<p><strong>第二, 超越 Llama2-34B</strong>. 在 BBH(39.22% vs 44.1% 略低)、HumanEval(55.49% vs 22.6%)、MBPP(41.68% vs 33.0%)和 GSM8K(61.56% vs 42.2%)上, 4B 激活参数的 MiniCPM-MoE-8x2B 显著超越了 34B 参数的 Llama2-34B. 这一对比极具冲击力: 用不到 1/8 的激活参数, 在多个关键任务上击败了参数量大 8 倍的 dense 模型.</p>
<p><strong>第三, 与 7B 级模型的竞争</strong>. 在 MMLU(58.90% vs Gemma-7B 64.3% 略低)、C-Eval(58.11% vs Qwen1.5-7B 74.1% 差距明显)等知识密集型任务上, MiniCPM-MoE 与 7B 级模型仍有差距. 但在代码(HumanEval 55.49% 超越所有 7B 模型)和数学(GSM8K 61.56% 接近 Qwen1.5-7B 62.5%)上已具备竞争力.</p>
<blockquote>
<p>对这些数据需要多维度审视. 首先, Llama2-34B 是一个相对&quot;老旧&quot;的基准(2023 年中发布), 其训练数据和方法论与 2024 年的模型存在代差, 直接用 Llama2-34B 作为对比对象可能不够公平. 其次, HumanEval 55.49% 是一个非常亮眼的成绩, 甚至超越了 Qwen1.5-7B(36%)和 Gemma-7B(32.3%), 这与 MoE 架构在代码任务上的优势有关: 代码具有高度的结构化模式, 不同专家可以分别专注于语法解析、API 调用、算法逻辑等不同子任务, 实现更高效的专业化分工. 第三, C-Eval 和 CMMLU 与 Qwen1.5-7B 的差距(约 15 个百分点)说明, 在中文知识密集型任务上, 4B 激活参数仍存在明显的能力边界——这与训练数据中的中文比例和知识密度直接相关, 而非架构本身的缺陷.</p>
</blockquote>
<h3 id="3-2-tlcbfx">3.2 推理成本分析</h3>
<p>MiniCPM-MoE-8x2B 的核心卖点之一是&quot;性能激增但推理成本可控&quot;. 官方数据显示, 其推理成本仅为 Gemma-7B 的 69.7%.</p>
<blockquote>
<p>69.7% 这个数字的对比基准是 Gemma-7B——一个 7B 的 dense 模型. 由于 MiniCPM-MoE 的激活参数为 4B, 其单 token 的 FLOPs 约为 4B 级别 dense 模型的水平, 确实低于 7B dense 模型. 但需要注意,&quot;推理成本&quot;的定义在不同场景下差异巨大: 如果按&quot;每 token 的 FLOPs&quot;计算, 4B 激活确实低于 7B dense; 但如果按&quot;端到端延迟&quot;计算, MoE 的 All-to-All 通信开销(路由器决策 + 专家间数据交换)可能抵消部分计算优势; 如果按&quot;内存占用&quot;计算, 13.6B 的总参数意味着模型权重存储是 7B 模型的近两倍, 即使只加载激活专家, 也需要更复杂的内存管理策略. 因此, 69.7% 是一个&quot;理想条件下&quot;的理论值, 实际部署中的成本优势会因硬件、batch size 和序列长度而波动.</p>
</blockquote>
<hr>
<h2 id="4-xlclygcsx">4 训练策略与工程实现</h2>
<h3 id="4-1-c-dense-d-moe-dzhxl">4.1 从 Dense 到 MoE 的转换训练</h3>
<p>MiniCPM-MoE-8x2B 的训练分为两个阶段:</p>
<p><strong>阶段一: 专家初始化</strong>. 将 MiniCPM-2B 的每个 FFN 层复制 8 份, 初始化 8 个专家. 路由器网络随机初始化.</p>
<p><strong>阶段二: 继续训练</strong>. 在长文本、代码、数学等多样化数据上继续训练, 让路由器学习将不同类型的 token 路由到最合适的专家, 同时让各专家在各自擅长的领域进一步特化.</p>
<blockquote>
<p>这种&quot;dense-to-sparse&quot;的转换策略相比从头训练有显著的成本优势. 假设从头训练 13.6B MoE 需要 1M GPU hours, 基于 2B dense 的扩展可能只需要 100K-200K GPU hours(仅为 1/5 到 1/10). 但转换策略也有其风险: 初始复制的专家具有高度同质性, 如果继续训练的数据分布不够丰富, 专家可能无法充分分化. 从评测结果看, HumanEval 和 GSM8K 的大幅提升表明代码和数学专家确实形成了有效的特化, 但 MMLU 和 C-Eval 的提升幅度相对较小(5-7 个百分点), 暗示知识型任务的专家分化可能不够彻底.</p>
</blockquote>
<h3 id="4-2-zjbhdgcsx">4.2 专家并行的工程实现</h3>
<p>在训练 13.6B 参数的 MoE 模型时, 专家并行(Expert Parallelism, EP)是必不可少的分布式策略. EP 将不同的专家放置在不同的 GPU 上, token 根据路由决策被发送到持有目标专家的 GPU 上进行计算.</p>
<blockquote>
<p>EP 的核心矛盾是通信与计算的权衡. 在标准数据并行下, 每个 GPU 持有完整的模型副本, 但 13.6B 参数超出了单卡显存容量. EP 通过让每个 GPU 只持有部分专家(如 2 个专家/GPU, 共 4 个 GPU), 解决了显存问题. 但代价是 All-to-All 通信: 每个 token 需要根据路由结果被发送到正确的 GPU, 计算完成后再聚合结果. 当专家数量较少(如 8 个)且 batch size 较小时, All-to-All 的通信延迟可能占主导地位, 导致 GPU 计算单元大量空闲. MiniCPM-MoE-8x2B 只有 8 个专家, 这在 MoE 模型中属于&quot;小规模&quot;(Mixtral-8x7B 有 8 个专家, DeepSeek-MoE 有 64+ 个专家), 小规模专家的好处是通信开销可控, 坏处是专家特化的粒度较粗——每个专家需要覆盖更广泛的任务类型.</p>
</blockquote>
<hr>
<h2 id="5-jxxynlbj">5 局限性与能力边界</h2>
<h3 id="5-1-zjslxz">5.1 专家数量限制</h3>
<p>8 个专家、Top-2 激活的配置意味着每个专家需要处理多样化的任务类型, 专家特化的粒度有限. 相比之下, DeepSeek-V2 的 64+ 个专家可以实现更细粒度的专业化(如某些专家专门处理数学符号, 某些专家专门处理代码语法).</p>
<h3 id="5-2-dcbsdnctz">5.2 端侧部署的内存挑战</h3>
<p>虽然激活参数仅为 4B, 但 13.6B 的总参数需要在存储中维护. 端侧部署时, 即使只加载当前所需的专家, 也需要动态加载/卸载机制, 这增加了推理引擎的复杂度. 在内存受限的设备上, 可能需要预先将模型切分为多个&quot;专家组&quot;, 根据输入类型动态切换.</p>
<h3 id="5-3-fzjhdyxfx">5.3 负载均衡的隐性风险</h3>
<p>公开资料未披露负载均衡的具体实现和监控数据. 如果实际部署中出现负载不均衡, 可能导致部分专家过热(计算过载)而其他专家闲置, 实际推理成本会高于理论值.</p>
<h3 id="5-4-y-7b-dense-mxdzscj">5.4 与 7B  dense 模型的知识差距</h3>
<p>在 MMLU、C-Eval 等知识密集型评测上, MiniCPM-MoE 与 7B  dense 模型仍有 5-15 个百分点的差距. 这说明 4B 激活参数的知识容量仍有上限, MoE 架构并不能无限制地弥补参数量的差距.</p>
<hr>
<h2 id="fl-a-syb">附录 A 术语表</h2>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>MoE</td>
<td>混合专家模型</td>
<td>第 1 节</td>
<td>稀疏激活架构, 每个 token 只路由到部分专家计算</td>
</tr>
<tr>
<td>FFN</td>
<td>前馈网络</td>
<td>第 2.2 节</td>
<td>Transformer 中位于注意力层之后的全连接网络</td>
</tr>
<tr>
<td>Router/Gating</td>
<td>路由器/门控网络</td>
<td>第 2.1 节</td>
<td>为每个 token 决定发送到哪些专家的轻量网络</td>
</tr>
<tr>
<td>Top-K</td>
<td>Top-K 选择</td>
<td>第 2.1 节</td>
<td>从所有专家中选取概率最高的 K 个进行激活</td>
</tr>
<tr>
<td>EP</td>
<td>专家并行</td>
<td>第 4.2 节</td>
<td>将不同专家放置在不同设备上的分布式策略</td>
</tr>
<tr>
<td>All-to-All</td>
<td>全对全通信</td>
<td>第 4.2 节</td>
<td>分布式训练中所有设备间相互交换数据的操作</td>
</tr>
<tr>
<td>Auxiliary Loss</td>
<td>辅助损失</td>
<td>第 2.3 节</td>
<td>用于鼓励负载均衡的额外训练目标</td>
</tr>
<tr>
<td>Dense Model</td>
<td>稠密模型</td>
<td>第 2.2 节</td>
<td>所有参数在每次前向传播中都被激活的标准模型</td>
</tr>
</tbody></table>
<h2 id="fl-b-hxsysjhz">附录 B 核心实验数据汇总</h2>
<table>
<thead>
<tr>
<th>评测维度</th>
<th>基准测试</th>
<th>MiniCPM-MoE-8x2B</th>
<th>MiniCPM-2.4B</th>
<th>提升幅度</th>
<th>Llama2-34B</th>
<th>Gemma-7B</th>
</tr>
</thead>
<tbody><tr>
<td>综合推理</td>
<td>BBH</td>
<td>39.22</td>
<td>36.87</td>
<td>+2.35</td>
<td>44.1</td>
<td>55.1</td>
</tr>
<tr>
<td>英文知识</td>
<td>MMLU</td>
<td>58.90</td>
<td>53.46</td>
<td>+5.44</td>
<td>62.6</td>
<td>64.3</td>
</tr>
<tr>
<td>中文知识</td>
<td>C-Eval</td>
<td>58.11</td>
<td>51.13</td>
<td>+6.98</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>中文知识</td>
<td>CMMLU</td>
<td>58.80</td>
<td>51.07</td>
<td>+7.73</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>代码生成</td>
<td>HumanEval</td>
<td>55.49</td>
<td>50.00</td>
<td>+5.49</td>
<td>22.6</td>
<td>32.3</td>
</tr>
<tr>
<td>代码生成</td>
<td>MBPP</td>
<td>41.68</td>
<td>35.93</td>
<td>+5.75</td>
<td>33.0</td>
<td>44.4</td>
</tr>
<tr>
<td>数学推理</td>
<td>GSM8K</td>
<td>61.56</td>
<td>53.83</td>
<td>+7.73</td>
<td>42.2</td>
<td>46.4</td>
</tr>
<tr>
<td>数学推理</td>
<td>MATH</td>
<td>10.52</td>
<td>10.24</td>
<td>+0.28</td>
<td>6.24</td>
<td>24.3</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: MiniCPM-MoE-8x2B 核心评测数据横向对比汇总.</p>
</blockquote>
<h2 id="fl-c-mxpxdw">附录 C 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-2B 基座模型(dense-to-sparse 扩展)</li>
<li><strong>核心创新</strong>: 端侧 SLM 的 MoE 化尝试, 8 专家 Top-2 路由, 4B 激活参数击败 Llama2-34B</li>
<li><strong>被后续工作引用/影响</strong>: 后续 MoE 端侧模型的参考案例(如 MiniMax-M2 系列也探索了端侧 MoE)</li>
<li><strong>同期竞品</strong>: Mixtral-8x7B(8 专家 Top-2, 47B 总参数, 云端定位)、DeepSeek-MoE(64+ 专家, 更细粒度特化)</li>
<li><strong>技术谱系</strong>: Shazeer et al.(2017)的 Top-K MoE → Mixtral-8x7B(2023)的开源 MoE 标杆 → MiniCPM-MoE-8x2B(2024)的端侧 MoE 探索</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdw-dcmxd-moe-sjlj","text":"1 模型定位: 端侧模型的 MoE 升级路径"},{"level":2,"id":"2-jgsj-8-zj-top-2-ly","text":"2 架构设计: 8 专家 Top-2 路由"},{"level":3,"id":"2-1-mxpz","text":"2.1 模型配置"},{"level":3,"id":"2-2-jy-dense-mxd-moe-kzcl","text":"2.2 基于 Dense 模型的 MoE 扩展策略"},{"level":3,"id":"2-3-fzjhyxlwdx","text":"2.3 负载均衡与训练稳定性"},{"level":2,"id":"3-xnpc-yxbddxgd","text":"3 性能评测: 以小博大的新高度"},{"level":3,"id":"3-1-jzmxpc","text":"3.1 基座模型评测"},{"level":3,"id":"3-2-tlcbfx","text":"3.2 推理成本分析"},{"level":2,"id":"4-xlclygcsx","text":"4 训练策略与工程实现"},{"level":3,"id":"4-1-c-dense-d-moe-dzhxl","text":"4.1 从 Dense 到 MoE 的转换训练"},{"level":3,"id":"4-2-zjbhdgcsx","text":"4.2 专家并行的工程实现"},{"level":2,"id":"5-jxxynlbj","text":"5 局限性与能力边界"},{"level":3,"id":"5-1-zjslxz","text":"5.1 专家数量限制"},{"level":3,"id":"5-2-dcbsdnctz","text":"5.2 端侧部署的内存挑战"},{"level":3,"id":"5-3-fzjhdyxfx","text":"5.3 负载均衡的隐性风险"},{"level":3,"id":"5-4-y-7b-dense-mxdzscj","text":"5.4 与 7B dense 模型的知识差距"},{"level":2,"id":"fl-a-syb","text":"附录 A 术语表"},{"level":2,"id":"fl-b-hxsysjhz","text":"附录 B 核心实验数据汇总"},{"level":2,"id":"fl-c-mxpxdw","text":"附录 C 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/04-mini-cpm-moe-8x2b/01-mini-cpm-moe-8x2b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/04-mini-cpm-moe-8x2b/01-mini-cpm-moe-8x2b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-MoE-8x2B 技术报告精译</h1>
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
