"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>基于 Qwen3 Technical Report (arXiv:2505.09388) 的技术报告精译, 本文从工程实现角度剖析 Qwen3 的架构设计决策, 训练流水线与部署权衡. 目标读者为具备 Transformer 基础知识的算法工程师与系统架构师.</p>
</blockquote>
<hr>
<h2 id="1-smsty-c-lgmx-d-ygmx-dfszy">1. 双模式统一: 从「两个模型」到「一个模型」的范式转移</h2>
<p>Qwen3 最具辨识度的架构特征, 是将「思考模式」(thinking mode)与「非思考模式」(non-thinking mode)整合进单一模型权重. 用户通过对话模板中的 <code>/think</code> 与 <code>/no_think</code> 标志切换行为, 无需更换模型端点或重新加载权重.</p>
<h3 id="1-1-gctdyhxdc">1.1 工程痛点与核心洞察</h3>
<p>在 Qwen3 之前, 开源社区的主流做法是分离部署: Qwen2.5 承担通用对话, QwQ-32B 承担深度推理. 这种分离带来三重工程代价: 基础设施翻倍, 路由复杂度高(判断「查询是否需要推理」本身即困难), 上下文易断裂. Qwen3 的核心洞察在于: <strong>推理能力与快速响应能力并非互斥的「两种模型能力」, 而是同一模型在不同计算预算下的行为表达</strong>. 技术报告中的四阶段后训练流程(长 CoT 冷启动 → 推理 RL → 思考模式融合 → 通用 RL)本质上是在训练模型学习「何时展开推理链, 何时直接生成答案」的元策略. 这要求模型内部同时具备两种能力表征, 并通过模板标志触发相应的生成分布.</p>
<blockquote>
<p>译者注: 这里值得停一下. 双模式统一的代价是什么? 单一模型必须同时承载两种行为的参数 footprint, 这意味着非思考模式的性能可能因思考模式的参数「挤占」而受到轻微影响. 技术报告未明确披露两种模式在同尺寸独立模型下的性能 gap, 但从 Qwen3-32B 的非思考模式仍能 outperform Qwen2.5-72B-Instruct 来看, 这种参数共享的代价似乎被数据 scaling 与训练优化所抵消. 然而, 在边缘端(0.6B ~ 4B)是否存在更显著的 interference, 仍是一个开放问题.</p>
</blockquote>
<h3 id="1-2-y-deep-seek-r1-faddz">1.2 与 DeepSeek-R1 方案的对照</h3>
<p>DeepSeek-R1 采用了截然不同的路径: 先训练一个高性能推理教师模型(R1), 再通过蒸馏(distillation)将推理能力注入轻量级学生模型. 这一方案的优势在于<strong>解耦</strong>——R1 与 V3 可以独立迭代, 互不干扰. 但代价同样明显:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>DeepSeek-R1 方案</th>
<th>Qwen3 统一方案</th>
</tr>
</thead>
<tbody><tr>
<td>部署单元</td>
<td>2 个独立模型(R1 + V3)</td>
<td>1 个统一模型</td>
</tr>
<tr>
<td>模式切换开销</td>
<td>模型切换, 上下文需重新编码</td>
<td>模板标志切换, 零开销</td>
</tr>
<tr>
<td>推理深度控制</td>
<td>固定(由模型自身决定)</td>
<td>可编程(思考预算机制)</td>
</tr>
<tr>
<td>小模型获得推理能力的方式</td>
<td>蒸馏教师 logits</td>
<td>双模式 SFT + 蒸馏</td>
</tr>
<tr>
<td>迭代风险</td>
<td>低(解耦)</td>
<td>中(两种行为互相干扰)</td>
</tr>
</tbody></table>
<p>DeepSeek-R1 的蒸馏策略在效率上非常出色, 但其学生模型(如 R1-Distill-Qwen-32B)本质上是「单模式」的——它们始终输出推理链, 无法根据任务动态关闭思考. Qwen3 的统一模型则提供了连续谱的行为控制, 这是架构层面的本质差异.</p>
<hr>
<h2 id="2-moe-jg-qgxzjdjjsy">2. MoE 架构: 去共享专家的激进实验</h2>
<p>Qwen3 的旗舰模型 Qwen3-235B-A22B 采用 MoE 架构, 总计 235B 参数, 每 token 激活 22B 参数(128 个专家中激活 8 个). 与 Qwen2.5-MoE 和 DeepSeek-MoE 相比, Qwen3 在专家设计上做出了一项引人注目的减法: <strong>完全移除共享专家(shared experts)</strong>.</p>
<h3 id="2-1-gxzjdxsyycdj">2.1 共享专家的兴衰与移除动机</h3>
<p>DeepSeek-V2/V3 的 MoE 架构引入共享专家: 部分专家始终激活以捕获通用知识, 其余通过路由选择负责特化知识, 初衷是防止路由崩溃. 但共享专家带来工程负担: 超参数膨胀(数量, 容量因子需调优), 计算刚性(长序列下固定 FLOPs 开销), 专业化模糊(强制划分限制路由自主学习). Qwen3 的激进选择是将全部 128 个专家交由路由自由竞争, 以<strong>全局批次负载均衡损失</strong>替代共享专家的「保底」机制.</p>
<h3 id="2-2-qjfzjhdgcsx">2.2 全局负载均衡的工程实现</h3>
<p>负载均衡损失的基本形式是对每个专家在一个批次内接收的 token 数量施加均匀性约束. 设 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 为批次大小, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 为序列长度, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">E=128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 为专家总数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">f_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>e</mi></mrow><annotation encoding="application/x-tex">e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">e</span></span></span></span> 在一个全局批次中接收的 token 比例. 经典的辅助损失函数定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>aux</mtext></msub><mo>=</mo><mi>α</mi><mo>⋅</mo><mi>E</mi><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>e</mi><mo>=</mo><mn>1</mn></mrow><mi>E</mi></munderover><msub><mover accent="true"><mi>f</mi><mo>ˉ</mo></mover><mi>e</mi></msub><mo>⋅</mo><msub><mover accent="true"><mi>P</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{aux}} = \\alpha \\cdot E \\cdot \\sum_{e=1}^{E} \\bar{f}_e \\cdot \\bar{P}_e \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aux</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8312em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span></span><span style="top:-3.2634em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.0833em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9701em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8201em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>f</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\bar{f}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0257em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8312em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span></span><span style="top:-3.2634em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.0833em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>e</mi></mrow><annotation encoding="application/x-tex">e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">e</span></span></span></span> 在全局批次中的平均负载比例, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>P</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\bar{P}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9701em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8201em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是该专家在全局批次上的平均路由概率, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 为超参数.</p>
<blockquote>
<p>译者注: Qwen3 强调「全局批次」而非「单个序列」的负载均衡, 这一细节在工程上意义重大. 在数据并行训练中, 全局批次横跨多个 GPU, 统计更稳定, 对专家崩溃的抑制更强. 但这也意味着负载均衡损失的计算需要跨设备 all-reduce 通信, 增加了训练同步开销. 在小规模实验集群上, 这种全局统计可能引入不可忽视的延迟; 只有在大规模集群(如 Qwen3 训练使用的千卡级 A100/H100)上, 通信开销才能被计算密度所摊平. 这也是 Qwen3 的技术报告中未明确提及但隐含的一个硬件依赖条件.</p>
</blockquote>
<h3 id="2-3-ytq-moe-fadhxdb">2.3 与同期 MoE 方案的横向对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>总参数</th>
<th>激活参数</th>
<th>专家数 / 激活数</th>
<th>共享专家</th>
<th>负载均衡策略</th>
</tr>
</thead>
<tbody><tr>
<td>DeepSeek-V3</td>
<td>671B</td>
<td>37B</td>
<td>256 / 8</td>
<td>有</td>
<td>序列级辅助损失 + 无 token 丢弃</td>
</tr>
<tr>
<td>Qwen2.5-MoE</td>
<td>57B</td>
<td>14B</td>
<td>128 / 8</td>
<td>有</td>
<td>序列级辅助损失</td>
</tr>
<tr>
<td>Qwen3-235B-A22B</td>
<td>235B</td>
<td>22B</td>
<td>128 / 8</td>
<td><strong>无</strong></td>
<td><strong>全局批次辅助损失</strong></td>
</tr>
<tr>
<td>Llama-4-Maverick</td>
<td>400B</td>
<td>17B</td>
<td>128 / 1</td>
<td>有</td>
<td>未公开</td>
</tr>
</tbody></table>
<p>Qwen3-235B-A22B 以仅 22B 激活参数, 235B 总参数的规模, 在 15 个基座基准中的 14 个上 outperform 671B 总参数的 DeepSeek-V3-Base. 这一结果表明, 移除共享专家并未损害模型性能, 反而可能因路由自由度提升而实现了更高效的参数利用. 但需要注意, 这一结论成立的前提是<strong>训练数据量足够大</strong>(36T tokens)且<strong>负载均衡机制足够强</strong>——在小数据或弱约束条件下, 无共享专家的设计很可能导致严重的专家崩溃.</p>
<hr>
<h2 id="3-qk-norm-yxlwdx-wgjgdsstz">3. QK-Norm 与训练稳定性: 微观架构的审慎调整</h2>
<p>Qwen3 在稠密模型和 MoE 模型中均引入了两项看似细微但影响深远的架构变更: <strong>移除 QKV-bias</strong> 与 <strong>引入 QK-Norm</strong>.</p>
<h3 id="3-1-zyl-logits-bzwt">3.1 注意力 logits 爆炸问题</h3>
<p>标准 Transformer 的缩放点积注意力计算公式为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span class="tag"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>在大规模训练中(尤其是长序列或深层网络), Query 与 Key 的点积可能产生极端值. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup><mi mathvariant="normal">/</mi><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">QK^T/\\sqrt{d_k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1072em;vertical-align:-0.25em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord">/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span> 的某些元素远大于零时, softmax 输出趋近于 one-hot 分布, 梯度通过 softmax 反向传播时趋于消失, 导致注意力头「失效」或训练发散. 这一问题在 100B+ 参数的模型中尤为常见.</p>
<p>QK-Norm 的解决方案是在点积之前对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 分别应用 LayerNorm:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mtext>LayerNorm</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>⋅</mo><mtext>LayerNorm</mtext><mo stretchy="false">(</mo><mi>K</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{\\text{LayerNorm}(Q) \\cdot \\text{LayerNorm}(K)^T}{\\sqrt{d_k}}\\right)V \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">LayerNorm</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">LayerNorm</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span class="tag"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>归一化操作将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 的范数约束在接近单位球的范围内, 使得点积的数值范围从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mi>k</mi></msub><mo>⋅</mo><mi mathvariant="normal">∥</mi><mi>Q</mi><mi mathvariant="normal">∥</mi><mo>⋅</mo><mi mathvariant="normal">∥</mi><mi>K</mi><mi mathvariant="normal">∥</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d_k \\cdot \\|Q\\| \\cdot \\|K\\|)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord mathnormal">Q</span><span class="mord">∥</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">∥</span><span class="mclose">)</span></span></span></span> 收缩到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d_k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 从根本上抑制了 logits 爆炸.</p>
<h3 id="3-2-qkv-bias-dycyzhxy">3.2 QKV-bias 的移除与组合效应</h3>
<p>Qwen3 移除了 Qwen2 中使用的 QKV-bias. 这一决策遵循了现代大模型设计的趋势: 在预训练阶段, bias 项对表达能力的增益有限, 却增加了参数量和计算量. 更重要的是, <strong>移除 bias 与引入 QK-Norm 之间存在协同效应</strong>——</p>
<p>在没有 QK-Norm 的情况下, 移除 QKV-bias 可能加剧注意力 logits 的均值偏移问题, 因为 bias 原本承担了部分「居中」功能. 但配合 QK-Norm 后, 注意力计算完全依赖于归一化后的方向相似度, 而非绝对数值. 此时 bias 的存在与否不再影响稳定性, 移除 bias 反而简化了参数量化(quantization)和剪枝(pruning)的后续处理.</p>
<blockquote>
<p>译者注: 这里需要理解的是, QK-Norm 并非 Qwen3 的首创. 该思想最早出现在 GPT-3 的后续研究和 PaLM 的训练稳定化实践中, 并在 CogVLM, Chameleon 等模型中得到验证. Qwen3 的贡献在于将其系统性引入到 Qwen 家族的全系列模型(从 0.6B 到 235B)中, 并验证了它与 GQA, RoPE ABF, YARN 等已有组件的兼容性. 值得注意的是, QK-Norm 会引入额外的 LayerNorm 计算开销. 在推理阶段, 由于 Q 和 K 的投影矩阵输出需要经过归一化后再进入注意力计算, 这增加了内存带宽压力. 对于边缘端模型(0.6B ~ 4B), 这种额外开销在延迟敏感场景中是否可接受, 取决于具体的部署优化水平.</p>
</blockquote>
<hr>
<h2 id="4-36t-token-yxl-sjgcdstzx">4. 36T Token 预训练: 数据工程的三条主线</h2>
<p>Qwen3 全系列模型在 <strong>36 万亿 token</strong> 上完成预训练, 覆盖 <strong>119 种语言和方言</strong>. 与 Qwen2.5 的 18T tokens / 29 种语言相比, 数据规模翻倍, 语言覆盖扩展四倍. 这一扩展背后有三条技术主线: PDF 文本提取, 合成数据生成, 实例级数据混合优化.</p>
<h3 id="4-1-pdf-tqdlblsx">4.1 PDF 提取的两步流水线</h3>
<p>技术报告披露, Qwen3 使用 Qwen2.5-VL 对大量 PDF 文档进行文本识别, 随后用 Qwen2.5 对识别结果进行精炼. 这一两步流程产出了「数万亿额外的高质量文本 token」.</p>
<blockquote>
<p>译者注: PDF 文本提取听起来是数据工程中的「脏活」, 但其技术难度被严重低估. 学术论文 PDF 中的公式, 表格, 多栏排版, 字体嵌入异常等问题, 使得传统工具(如 pdfplumber, PyMuPDF)的提取准确率远不能满足大模型预训练的要求. Qwen2.5-VL 作为多模态模型, 能够「看懂」版面布局, 这是其相比纯 OCR 工具的核心优势. 但这里存在一个未被充分讨论的风险: <strong>模型自举偏差</strong>(model bootstrapping bias). 使用 Qwen2.5-VL 和 Qwen2.5 提取并精炼的数据, 其分布必然带有这两个模型的偏见——它们识别错误的文本, 理解偏差的术语, 会以噪声形式注入 Qwen3 的预训练数据. 如果提取的 PDF 内容与 Qwen2.5 的训练数据存在重叠, 这种自举效应还可能放大特定知识领域的分布偏移.</p>
</blockquote>
<h3 id="4-2-hcsjd-scaling-bj">4.2 合成数据的 scaling 边界</h3>
<p>Qwen3 使用 Qwen2.5, Qwen2.5-Math 和 Qwen2.5-Coder 生成了「数万亿」合成 token, 涵盖教科书, 问答, 指令和代码片段. 合成数据的优势在于<strong>可控性</strong>——可以精确调节领域分布, 难度曲线和格式一致性. 但其边际收益并非单调递增:</p>
<ul>
<li>当合成数据比例较低时(&lt; 10%), 模型主要学习真实数据的分布, 合成数据起到「补充稀有模式」的作用.</li>
<li>当合成数据比例中等时(10% ~ 30%), 模型开始内化合成数据中的生成模式, 这在数学推理和代码任务中通常是正向的.</li>
<li>当合成数据比例过高时(&gt; 50%), 模型可能过度拟合合成分布中的统计假象(如固定的句式模板, 有限的错误模式多样性), 导致在真实场景中的泛化能力下降.</li>
</ul>
<p>技术报告未披露 36T tokens 中合成数据的确切比例, 但从 Qwen3 在 LiveBench 和 Arena-Hard 等对抗性基准上的强劲表现推断, 其数据混合策略应该找到了一个相对健康的平衡点.</p>
<h3 id="4-3-sljsjhh-clyjdybjdyh">4.3 实例级数据混合: 从领域级到样本级的优化</h3>
<p>传统数据混合策略通常在「领域」或「数据源」粒度上调节比例(如 30% 网页, 20% 代码, 10% 书籍). Qwen3 开发了一个多语言数据标注系统, 在超过 30T tokens 上标注了教育价值, 领域, 学科和安全性等多维标签, 并通过**实例级(instance-level)**消融实验优化混合比例.</p>
<blockquote>
<p>译者注: 实例级混合的粒度提升带来了优化空间的指数级膨胀. 假设有 10 个数据源类别和 5 个质量等级, 领域级混合只需要优化约 50 个比例参数; 而实例级混合则相当于在数十亿个样本上进行加权采样, 直接优化的计算代价不可接受. Qwen3 的解决方案是在「小型代理模型」上进行消融实验——这隐含了一个强假设: 代理模型的最优数据混合比例与目标大模型的最优比例一致. 这一假设在经验上大致成立(因为数据质量对模型尺寸并不高度敏感), 但在极端 scaling 场景下(如 1T+ 参数的模型)是否仍然有效, 尚无定论. 此外, 119 种语言的数据混合面临「高资源语言主导」的天然倾向——英语和中文的高质量语料远多于斯瓦希里语或冰岛语, 即使实例级优化也无法凭空创造不存在的语料.</p>
</blockquote>
<hr>
<h2 id="5-hxllsx-sjdddqby">5. 后训练流水线: 四阶段的对齐博弈</h2>
<p>Qwen3 的后训练围绕两个核心目标展开: <strong>思考控制</strong>与<strong>强到弱蒸馏</strong>. 旗舰模型的后训练包含四个阶段, 小模型则通过蒸馏从旗舰模型获取能力.</p>
<h3 id="5-1-sjdlsxdnblj">5.1 四阶段流水线的内部逻辑</h3>
<table>
<thead>
<tr>
<th>阶段</th>
<th>目标</th>
<th>数据/方法</th>
<th>关键输出</th>
</tr>
</thead>
<tbody><tr>
<td>阶段 1: 长 CoT 冷启动</td>
<td>建立基础推理行为</td>
<td>过滤后的数学/代码/逻辑数据集, SFT</td>
<td>具备基础 CoT 能力的模型</td>
</tr>
<tr>
<td>阶段 2: 推理 RL</td>
<td>提升推理深度</td>
<td>3,995 个查询-验证器对, GRPO</td>
<td>AIME&#39;24 从 70.1 → 85.1</td>
</tr>
<tr>
<td>阶段 3: 思考模式融合</td>
<td>引入非思考能力</td>
<td>阶段 2 模型自采样 + 非思考 SFT 数据, 对话模板 <code>/think</code> <code>/no_think</code></td>
<td>双模式统一模型</td>
</tr>
<tr>
<td>阶段 4: 通用 RL</td>
<td>全面增强稳定性</td>
<td>20+ 任务的奖励系统(规则/模型混合)</td>
<td>最终指令模型</td>
</tr>
</tbody></table>
<p>这一流水线的关键设计在于<strong>阶段顺序不可颠倒</strong>. 若先进行通用 RL(阶段 4)再进行推理 RL(阶段 2), 针对「有用性」的优化可能削弱推理严谨性. 先建立推理内核(阶段 1~2), 再融合非思考行为(阶段 3), 最后打磨交互体验(阶段 4), 确保了推理能力的优先级.</p>
<h3 id="5-2-dhmb-msqhdyfjk">5.2 对话模板: 模式切换的语法接口</h3>
<p>Qwen3 在对话模板层面实现了模式切换: 用户消息或系统消息中包含 <code>/think</code> 时, 模型进入思考模式; 包含 <code>/no_think</code> 时, 模型直接生成答案. 对于非思考模式, 助手的响应中保留一个<strong>空的思考块</strong>, 以保证内部格式一致性.</p>
<blockquote>
<p>译者注: 这一设计看似简单, 实则隐藏了深刻的工程考量. 空思考块的存在意味着模型的 tokenizer 输出序列在两种模式下保持相同的结构模式 <code>&lt;think&gt;...&lt;/think&gt;&lt;response&gt;...&lt;/response&gt;</code>, 只是思考块的内容为空. 这种结构一致性对 vLLM, TensorRT-LLM 等推理引擎的 CUDA kernel 优化极为友好——解码逻辑无需根据模式分支处理不同的输出格式. 在多轮对话中, 模型遵循「最后遇到的标志」原则, 这意味着对话历史中的标志切换可以被动态解析, 无需重新编码整个上下文. 但与 DeepSeek-R1 的 <code>&lt;think&gt;</code> 标签不同, Qwen3 的标志 <code>/think</code> 和 <code>/no_think</code> 是<strong>用户可控的指令</strong>, 而非模型自发的行为标记. 这一差异决定了 Qwen3 的模式切换是「显式编程接口」, 而 R1 的思考行为是「涌现特性」——后者无法被用户精确关闭.</p>
</blockquote>
<h3 id="5-3-skys-xlyxhsysjz">5.3 思考预算: 训练涌现还是隐式机制?</h3>
<p>技术报告明确指出, 思考预算能力「并非经过显式训练, 而是应用思考模式融合后自然涌现的结果」. 具体实现是: 当思考长度达到用户阈值时, 系统强制插入停止指令 <code>Considering the limited time by the user, I have to give the solution based on the thinking directly now.\\n&lt;/think&gt;.\\n\\n</code>, 模型随后基于不完整的推理链生成最终答案.</p>
<blockquote>
<p>译者注: 「涌现」一词在这里需要谨慎理解. 从工程角度看, 这并非神秘的自发行为, 而是阶段 3 SFT 中「非思考数据包含空思考块」与「思考数据包含完整推理链」共同塑造的插值能力. 当模型在训练中看到「思考块长度从零到数千 token 的连续谱」时, 它学会了在任意思考长度下生成合理的后续内容. 思考预算的本质是<strong>在推理时人为截断思考链, 利用模型已学会的「从不完整上下文续写」的能力</strong>. 这与 OpenAI o3 的 test-time compute 有根本区别: o3 在推理时动态决定是否继续思考, 而 Qwen3 的思考预算是外部硬截断. 前者的计算投入由模型自主决定, 后者由用户显式控制. 两种设计各有适用场景: 自主决策适合追求极限性能的封闭系统, 显式控制适合需要 SLA 保障的生产环境.</p>
</blockquote>
<hr>
<h2 id="6-qdrzl-csgdzdgchsc">6. 强到弱蒸馏: 从手工打造到工厂化生产</h2>
<p>Qwen3 的小模型(0.6B ~ 14B 稠密 + 30B-A3B MoE)并非独立执行完整的四阶段后训练, 而是通过<strong>强到弱蒸馏</strong>从旗舰模型(Qwen3-32B 或 Qwen3-235B-A22B)获取能力. 这一流程分为离线蒸馏与在线蒸馏两个阶段.</p>
<h3 id="6-1-lxzl-ksjlsmsjx">6.1 离线蒸馏: 快速建立双模式基线</h3>
<p>离线蒸馏使用教师模型预生成的 <code>/think</code> 和 <code>/no_think</code> 响应对作为静态数据集, 学生模型通过标准 SFT 学习. 这一步的目标是在最小计算开销下赋予学生模型两种模式的基本行为.</p>
<h3 id="6-2-zxzl-fbdqytskz">6.2 在线蒸馏: 分布对齐与探索扩展</h3>
<p>在线蒸馏中, 学生模型自主生成响应, 然后通过最小化与教师模型 logits 的 KL 散度进行微调:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>distill</mtext></msub><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>x</mi><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><msub><mi>D</mi><mtext>KL</mtext></msub><mrow><mo fence="true">(</mo><msub><mi>P</mi><mtext>student</mtext></msub><mo stretchy="false">(</mo><mo>⋅</mo><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo><mtext> </mtext><mi mathvariant="normal">∥</mi><mtext> </mtext><msub><mi>P</mi><mtext>teacher</mtext></msub><mo stretchy="false">(</mo><mo>⋅</mo><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{distill}} = \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ D_{\\text{KL}}\\left( P_{\\text{student}}(\\cdot | x) \\,\\|\\, P_{\\text{teacher}}(\\cdot | x) \\right) \\right] \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">distill</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">student</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord">⋅</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∥</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord">⋅</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="mclose delimcenter" style="top:0em;">]</span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>技术报告的关键发现是: 在线蒸馏不仅提升了 Pass@1(即时准确率), 还显著提升了 Pass@64(探索能力, 从 90.0 提升到 93.3), 而独立 RL 训练未能带来 Pass@64 的任何改善. 这说明 KL 散度对齐迫使学生模型<strong>扩展其输出分布</strong>, 覆盖了更广泛的解题路径, 而非仅仅复制教师的「标准答案」.</p>
<blockquote>
<p>译者注: 蒸馏的成本效益令人瞩目——仅需完整 RL 流程 1/10 的 GPU 小时即可达到更优性能. 但这一结论的适用范围需要被限定. 技术报告的对比实验「仅关注数学和代码相关查询」, 这意味着在非推理任务(如创意写作, 多轮对话, 角色扮演)上, 蒸馏模型与独立 RL 模型的相对优劣尚未被充分验证. 此外, 在线蒸馏假设教师模型的 logits 分布是「最优」的, 但在教师模型自身存在偏见或盲点的领域(如特定低资源语言, 新兴编程语言), 学生模型会系统性地继承这些缺陷, 无法通过 RL 的自我探索来纠正. 蒸馏工厂化生产的效率优势, 某种程度上是以牺牲「独立进化能力」为代价的.</p>
</blockquote>
<hr>
<h2 id="7-djpxyjzgj">7. 代际谱系与竞争格局</h2>
<h3 id="7-1-qwen2-5-qwen3-dgjyq">7.1 Qwen2.5 → Qwen3 的关键跃迁</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Qwen2.5</th>
<th>Qwen3</th>
<th>工程含义</th>
</tr>
</thead>
<tbody><tr>
<td>预训练数据</td>
<td>18T tokens, 29 语言</td>
<td>36T tokens, 119 语言</td>
<td>数据 scaling 的边际收益仍为正, 但语言扩展的公平性存疑</td>
</tr>
<tr>
<td>推理能力</td>
<td>基础 CoT, 独立模型(QwQ)</td>
<td>双模式统一, 思考预算</td>
<td>从「能力堆砌」到「行为控制」的范式转移</td>
</tr>
<tr>
<td>MoE 设计</td>
<td>共享专家 + 序列级均衡</td>
<td>无共享专家 + 全局批次均衡</td>
<td>架构简化, 依赖更强训练基础设施</td>
</tr>
<tr>
<td>后训练</td>
<td>Offline RL + GRPO</td>
<td>四阶段流水线 + 蒸馏</td>
<td>从「单模型精调」到「工厂化模型族生产」</td>
</tr>
<tr>
<td>架构微观调整</td>
<td>QKV-bias</td>
<td>QK-Norm, 移除 QKV-bias</td>
<td>训练稳定性与量化友好性的权衡</td>
</tr>
<tr>
<td>上下文长度</td>
<td>32K ~ 128K(部分模型)</td>
<td>32K 训练, 128K 推理(全系列)</td>
<td>长上下文成为标配而非旗舰专属</td>
</tr>
</tbody></table>
<h3 id="7-2-ytqjpdhxdb">7.2 与同期竞品的横向对比</h3>
<p>在 2025 年上半年的开源模型生态中, Qwen3 面临多线竞争.</p>
<p><strong>与 DeepSeek-V3/R1 的对比</strong>: DeepSeek-V3(671B 总参数, 37B 激活)在绝对规模上远超 Qwen3-235B-A22B, 但 Qwen3 在 14/15 个基座基准上胜出, 激活参数仅为 V3 的 60%, 印证 MoE 中参数效率重于绝对规模. DeepSeek-R1 的蒸馏生态(32B/14B/7B)已建立先发优势, Qwen3 的强到弱蒸馏需面对社区既成标准竞争.</p>
<p><strong>与 Llama-4 的对比</strong>: Llama-4-Maverick(400B 总参数, 17B 激活)每 token 仅激活 1 个专家(128 选 1), 路由的 winner-take-all 性质更强. Qwen3 的 128 选 8 提供更平滑的专家组合空间, 代价是更高 all-to-all 通信开销.</p>
<p><strong>与 Kimi-K2.5 的对比</strong>: Kimi-K2.5 的长上下文(200K+)和多模态理解是主要卖点. Qwen3 在推理控制(思考预算)和开源可用性上差异化明显, 但在超长文档理解上, YARN + DCA 外推能否匹敌 Kimi 的原生长上下文训练, 仍缺乏直接对比.</p>
<blockquote>
<p>译者注: Qwen3 的技术报告在基准选择上有一定的策略性. 基座模型评估使用了 15 个基准, 指令模型评估使用了 23 个基准, 这些基准覆盖了通用知识, 数学, 代码, 对齐和多语言, 但<strong>未包含 MMMU, MMMU-Pro 等多模态基准</strong>——这并不意外, 因为 Qwen3 是纯粹的语言模型. 然而, 在 2025 年的模型竞争中, 纯语言模型的天花板正在逼近, 多模态能力(图像理解, 视频推理, 跨模态 Agent)已成为下一代旗舰模型的标配. Qwen3 技术报告在结论部分明确提到未来将关注「基于 Agent 的 RL 系统」, 这暗示 Qwen3 的架构设计已经预留了向多模态和工具使用扩展的接口.</p>
</blockquote>
<hr>
<h2 id="8-wjzw-jgsjzdkffx">8. 未竟之问: 架构设计中的开放风险</h2>
<h3 id="8-1-skmsxdcsxwth">8.1 思考模式下的长上下文退化</h3>
<p>RULER 基准显示, 思考模式下 Qwen3 的长上下文性能(235B-A22B 平均 92.2)显著低于非思考模式(95.0). 技术报告将这一现象归因于「思考内容对检索任务没有显著益处, 反而可能干扰检索过程」.</p>
<blockquote>
<p>译者注: 这一解释是现象层面的, 而非机制层面的. 更深层的工程原因可能是: 思考模式下模型会生成大量中间 token, 这些 token 占用了 KV Cache 的容量预算. 在 128K 上下文窗口中, 如果输入文本占 100K token, 思考过程又占 20K token, 那么模型实际可用于关注原文的注意力预算被压缩. 此外, 推理链中的「假设-验证」循环可能改变注意力权重的分布, 使模型对远距离上下文的关注度下降. 这对实际部署的启示是: 对于 RAG(检索增强生成)和文档问答任务, 应默认关闭思考模式, 仅在需要进行跨文档综合分析时才启用. 未来的架构改进可能需要引入「检索阶段禁用思考」的自动切换机制.</p>
</blockquote>
<h3 id="8-2-119-zyydzsxjy">8.2 119 种语言的真实性检验</h3>
<p>INCLUDE 和 Belebele 等多语言基准的结果显示, Qwen3 在高资源语言上表现强劲, 但部分低资源语言的性能仍有明显差距. 119 种语言的支持更多是<strong>数量宣言</strong>而非<strong>质量承诺</strong>.</p>
<blockquote>
<p>译者注: 多语言公平性是开源社区长期面临的结构性难题, 并非 Qwen3 独有. 但 Qwen3 的数据策略——使用 Qwen2.5 系列模型生成合成数据——可能在低资源语言上产生「回声室效应」: 生成模型对低资源语言的理解本就有限, 以其为源生成的合成数据质量参差不齐, 进一步训练出的模型在这些语言上的天花板被隐性压低. 真正的突破可能需要与本土语言社区合作, 采集原始口语和书面语料, 而非依赖高资源语言模型的「翻译-生成」流水线.</p>
</blockquote>
<h3 id="8-3-sjdxldkfxxmj">8.3 四阶段训练的可复现性门槛</h3>
<p>Qwen3 的后训练流程涉及长 CoT 冷启动数据构建, GRPO 推理 RL, 双模式 SFT 融合, 20+ 任务的通用 RL 四个阶段, 每个阶段都有复杂的超参数和奖励设计. 对于学术研究者或中小团队而言, 完整复现这一流水线的计算成本(数百到数千 GPU 小时)和数据工程门槛(查询过滤, 响应验证, 奖励模型训练)极高.</p>
<blockquote>
<p>译者注: 强到弱蒸馏部分缓解了这一门槛, 但蒸馏本身仍然需要旗舰模型的 logits 输出作为监督信号, 而获取这些信号需要访问 Qwen3-235B-A22B 的推理 API 或本地部署权重的计算资源. 从开源生态的健康度来看, Qwen3 的权重开放是正向贡献, 但训练流程的「黑箱化」(技术报告未披露全部超参数, 数据过滤阈值, 奖励函数的具体形式)意味着社区难以在 Qwen3 基础上进行根本性的架构实验——更多的是微调(fine-tuning)和适配(adaptation). 这与 Llama 系列发布时附带的详细训练日志和部分超参数相比, 透明度仍有提升空间.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>附注</strong>: 本文档所有架构分析基于 Qwen3 Technical Report (arXiv:2505.09388) 的公开信息, 部分工程推断(如通信开销, KV Cache 预算分配, 量化影响)为作者基于同类模型公开实践的技术推演, 未经阿里通义团队确认. 如需引用具体性能数字, 建议同时查阅原始技术报告中的完整实验表格.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-smsty-c-lgmx-d-ygmx-dfszy","text":"1. 双模式统一: 从「两个模型」到「一个模型」的范式转移"},{"level":3,"id":"1-1-gctdyhxdc","text":"1.1 工程痛点与核心洞察"},{"level":3,"id":"1-2-y-deep-seek-r1-faddz","text":"1.2 与 DeepSeek-R1 方案的对照"},{"level":2,"id":"2-moe-jg-qgxzjdjjsy","text":"2. MoE 架构: 去共享专家的激进实验"},{"level":3,"id":"2-1-gxzjdxsyycdj","text":"2.1 共享专家的兴衰与移除动机"},{"level":3,"id":"2-2-qjfzjhdgcsx","text":"2.2 全局负载均衡的工程实现"},{"level":3,"id":"2-3-ytq-moe-fadhxdb","text":"2.3 与同期 MoE 方案的横向对比"},{"level":2,"id":"3-qk-norm-yxlwdx-wgjgdsstz","text":"3. QK-Norm 与训练稳定性: 微观架构的审慎调整"},{"level":3,"id":"3-1-zyl-logits-bzwt","text":"3.1 注意力 logits 爆炸问题"},{"level":3,"id":"3-2-qkv-bias-dycyzhxy","text":"3.2 QKV-bias 的移除与组合效应"},{"level":2,"id":"4-36t-token-yxl-sjgcdstzx","text":"4. 36T Token 预训练: 数据工程的三条主线"},{"level":3,"id":"4-1-pdf-tqdlblsx","text":"4.1 PDF 提取的两步流水线"},{"level":3,"id":"4-2-hcsjd-scaling-bj","text":"4.2 合成数据的 scaling 边界"},{"level":3,"id":"4-3-sljsjhh-clyjdybjdyh","text":"4.3 实例级数据混合: 从领域级到样本级的优化"},{"level":2,"id":"5-hxllsx-sjdddqby","text":"5. 后训练流水线: 四阶段的对齐博弈"},{"level":3,"id":"5-1-sjdlsxdnblj","text":"5.1 四阶段流水线的内部逻辑"},{"level":3,"id":"5-2-dhmb-msqhdyfjk","text":"5.2 对话模板: 模式切换的语法接口"},{"level":3,"id":"5-3-skys-xlyxhsysjz","text":"5.3 思考预算: 训练涌现还是隐式机制?"},{"level":2,"id":"6-qdrzl-csgdzdgchsc","text":"6. 强到弱蒸馏: 从手工打造到工厂化生产"},{"level":3,"id":"6-1-lxzl-ksjlsmsjx","text":"6.1 离线蒸馏: 快速建立双模式基线"},{"level":3,"id":"6-2-zxzl-fbdqytskz","text":"6.2 在线蒸馏: 分布对齐与探索扩展"},{"level":2,"id":"7-djpxyjzgj","text":"7. 代际谱系与竞争格局"},{"level":3,"id":"7-1-qwen2-5-qwen3-dgjyq","text":"7.1 Qwen2.5 → Qwen3 的关键跃迁"},{"level":3,"id":"7-2-ytqjpdhxdb","text":"7.2 与同期竞品的横向对比"},{"level":2,"id":"8-wjzw-jgsjzdkffx","text":"8. 未竟之问: 架构设计中的开放风险"},{"level":3,"id":"8-1-skmsxdcsxwth","text":"8.1 思考模式下的长上下文退化"},{"level":3,"id":"8-2-119-zyydzsxjy","text":"8.2 119 种语言的真实性检验"},{"level":3,"id":"8-3-sjdxldkfxxmj","text":"8.3 四阶段训练的可复现性门槛"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/09-qwen3/05-qwen3-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/09-qwen3/05-qwen3-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3 核心架构剖析</h1>
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
