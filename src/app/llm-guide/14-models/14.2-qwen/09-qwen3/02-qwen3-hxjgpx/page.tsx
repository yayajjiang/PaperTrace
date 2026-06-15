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
<p>本文基于 Qwen3 Technical Report (arXiv:2505.09388) 的深度精读, 系统剖析 Qwen3 在双模式统一架构、MoE 专家设计、训练稳定性、预训练数据工程与后训练流水线方面的架构决策, 涵盖设计动机、数学原理、工程权衡与竞争格局定位.</p>
</blockquote>
<hr>
<h2 id="1-sjdjyztdw">1 设计动机与总体定位</h2>
<p>Qwen3 于 2025 年 4 月发布, 是 Qwen 家族从「能力堆砌」迈向「行为控制」的范式转移节点. 其总体设计动机可概括为三个维度:</p>
<p><strong>双模式统一: 从「两个模型」到「一个模型」</strong>. Qwen3 将「思考模式」(thinking mode)与「非思考模式」(non-thinking mode)整合进单一模型权重. 用户通过对话模板中的 <code>/think</code> 与 <code>/no_think</code> 标志切换行为, 无需更换模型端点或重新加载权重. 这一设计的核心动机在于部署效率与用户体验——分别维护 Qwen2.5 与 QwQ 两个模型意味着双倍的服务基础设施、路由逻辑和版本管理复杂度. 统一模型通过模板标志实现零开销模式切换, 同时思考预算机制允许在单一推理调用中动态调节计算投入.</p>
<p><strong>用户控制为中心: 思考预算机制</strong>. Qwen3 引入思考预算, 为用户提供细粒度的控制, 以调节模型在任务执行期间投入的推理努力程度. 传统推理时扩展(如 o3 的 test-time compute 或 DeepSeek-R1 的多轮推理)通常通过增加采样次数或推理步数来提升性能, 但用户无法精确控制「思考多少 token 后停止」. Qwen3 的思考预算允许用户设定硬阈值(如 8192 token), 当思考长度达到阈值时强制插入停止指令并要求模型基于不完整思考给出答案. 这种机制的创新之处在于: (1) 它是训练时涌现的能力; (2) 它提供了连续谱控制——从 0 token 到任意长度之间的任意点都可以作为终止条件; (3) 它实现了计算-质量权衡的可编程性.</p>
<p><strong>工厂化模型生产: 强到弱蒸馏</strong>. Qwen3 的小模型(0.6B ~ 14B 稠密 + 30B-A3B MoE)并非独立执行完整的四阶段后训练, 而是通过强到弱蒸馏从旗舰模型获取能力, 仅需完整 RL 流程 1/10 的 GPU 小时. 这标志着开源模型生态从「手工打造每个模型」向「规模化模型生产」的工业化转变.</p>
<blockquote>
<p><strong>译者注 | 技术思考</strong>: Qwen3 选择双模式统一的核心动机在于部署效率. 分别维护两个模型(Qwen2.5 + QwQ)意味着双倍的服务基础设施、路由逻辑和版本管理复杂度. 对于开发者而言, 在两种模式之间切换需要更换模型端点或重新加载权重, 这在实时应用中是不可接受的延迟. 统一模型通过 <code>/think</code> 和 <code>/no_think</code> 对话模板标志实现零开销模式切换, 同时思考预算机制允许在单一推理调用中动态调节计算投入. 这种设计哲学与 DeepSeek-R1 的「蒸馏版」策略不同——Qwen3 不是训练一个强推理教师再蒸馏出弱学生, 而是让单一模型内部同时掌握两种能力范式, 从根本上消除了模式切换的摩擦成本. 但代价是什么? 单一模型必须同时承载两种行为的参数 footprint, 非思考模式的性能可能因思考模式的参数「挤占」而受到轻微影响. 从 Qwen3-32B 的非思考模式仍能 outperform Qwen2.5-72B-Instruct 来看, 这种参数共享的代价似乎被数据 scaling 与训练优化所抵消.</p>
</blockquote>
<hr>
<h2 id="2-hxjgy-smstyyskys">2 核心架构一: 双模式统一与思考预算</h2>
<h3 id="2-1-sjdhxllsxdnblj">2.1 四阶段后训练流水线的内部逻辑</h3>
<p>Qwen3 旗舰模型的后训练包含四个严格顺序的阶段:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">目标</th>
<th align="left">数据/方法</th>
<th align="left">关键输出</th>
</tr>
</thead>
<tbody><tr>
<td align="left">阶段 1: 长 CoT 冷启动</td>
<td align="left">建立基础推理行为</td>
<td align="left">过滤后的数学/代码/逻辑数据集, SFT</td>
<td align="left">具备基础 CoT 能力的模型</td>
</tr>
<tr>
<td align="left">阶段 2: 推理 RL</td>
<td align="left">提升推理深度</td>
<td align="left">3,995 个查询-验证器对, GRPO</td>
<td align="left">AIME&#39;24 从 70.1 提升至 85.1</td>
</tr>
<tr>
<td align="left">阶段 3: 思考模式融合</td>
<td align="left">引入非思考能力</td>
<td align="left">阶段 2 模型自采样 + 非思考 SFT 数据, 对话模板</td>
<td align="left">双模式统一模型</td>
</tr>
<tr>
<td align="left">阶段 4: 通用 RL</td>
<td align="left">全面增强稳定性</td>
<td align="left">20+ 任务的奖励系统(规则/模型混合)</td>
<td align="left">最终指令模型</td>
</tr>
</tbody></table>
<p>这一流水线的关键设计在于<strong>阶段顺序不可颠倒</strong>. 若先进行通用 RL(阶段 4)再进行推理 RL(阶段 2), 针对「有用性」的优化可能削弱推理严谨性. 先建立推理内核(阶段 1~2), 再融合非思考行为(阶段 3), 最后打磨交互体验(阶段 4), 确保了推理能力的优先级.</p>
<h3 id="2-2-dhmb-msqhdyfjk">2.2 对话模板: 模式切换的语法接口</h3>
<p>Qwen3 在对话模板层面实现了模式切换: 用户消息或系统消息中包含 <code>/think</code> 时, 模型进入思考模式; 包含 <code>/no_think</code> 时, 模型直接生成答案. 对于非思考模式, 助手的响应中保留一个<strong>空的思考块</strong>, 以保证内部格式一致性. 空思考块的存在意味着模型的 tokenizer 输出序列在两种模式下保持相同的结构模式 <code>&lt;think&gt;...&lt;/think&gt;&lt;response&gt;...&lt;/response&gt;</code>, 只是思考块的内容为空. 这种结构一致性对 vLLM, TensorRT-LLM 等推理引擎的 CUDA kernel 优化极为友好.</p>
<h3 id="2-3-skys-xlyxdnl">2.3 思考预算: 训练涌现的能力</h3>
<p>技术报告明确指出, 思考预算能力「并非经过显式训练, 而是应用思考模式融合后自然涌现的结果」. 具体实现是: 当思考长度达到用户阈值时, 系统强制插入停止指令, 模型随后基于不完整的推理链生成最终答案. 从工程角度看, 这并非神秘的自发行为, 而是阶段 3 SFT 中「非思考数据包含空思考块」与「思考数据包含完整推理链」共同塑造的插值能力. 当模型在训练中看到「思考块长度从零到数千 token 的连续谱」时, 它学会了在任意思考长度下生成合理的后续内容.</p>
<blockquote>
<p><strong>译者注 | 技术思考</strong>: 思考预算的本质是「在推理时人为截断思考链, 利用模型已学会的『从不完整上下文续写』的能力」. 这与 OpenAI o3 的 test-time compute 有根本区别: o3 在推理时动态决定是否继续思考, 而 Qwen3 的思考预算是外部硬截断. 前者的计算投入由模型自主决定, 后者由用户显式控制. 两种设计各有适用场景: 自主决策适合追求极限性能的封闭系统, 显式控制适合需要 SLA 保障的生产环境. 对于 RAG 和文档问答等检索任务, 应默认关闭思考模式; 对于需要综合分析的任务, 思考模式的价值才能体现.</p>
</blockquote>
<hr>
<h2 id="3-hxjge-moe-qgxzjdjjsy">3 核心架构二: MoE 去共享专家的激进实验</h2>
<h3 id="3-1-gxzjdycdj">3.1 共享专家的移除动机</h3>
<p>Qwen3 的旗舰模型 Qwen3-235B-A22B 采用 MoE 架构, 总计 235B 参数, 每 token 激活 22B 参数(128 个专家中激活 8 个). 与 Qwen2.5-MoE 和 DeepSeek-MoE 相比, Qwen3 在专家设计上做出了一项引人注目的减法: <strong>完全移除共享专家(shared experts)</strong>.</p>
<p>DeepSeek-V2/V3 的 MoE 架构引入共享专家的初衷是防止路由崩溃: 部分专家始终激活以捕获通用知识, 其余通过路由选择负责特化知识. 但共享专家带来工程负担: 超参数膨胀(数量, 容量因子需调优), 计算刚性(长序列下固定 FLOPs 开销), 专业化模糊(强制划分限制路由自主学习). Qwen3 的激进选择是将全部 128 个专家交由路由自由竞争, 以<strong>全局批次负载均衡损失</strong>替代共享专家的「保底」机制.</p>
<h3 id="3-2-qjfzjhdsxsx">3.2 全局负载均衡的数学实现</h3>
<p>负载均衡损失的基本形式是对每个专家在一个批次内接收的 token 数量施加均匀性约束. 设 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 为批次大小, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 为序列长度, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">E = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 为专家总数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">f_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>e</mi></mrow><annotation encoding="application/x-tex">e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">e</span></span></span></span> 在全局批次中接收的 token 比例. 经典的辅助损失函数定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>aux</mtext></msub><mo>=</mo><mi>α</mi><mo>⋅</mo><mi>E</mi><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>e</mi><mo>=</mo><mn>1</mn></mrow><mi>E</mi></munderover><msub><mover accent="true"><mi>f</mi><mo>ˉ</mo></mover><mi>e</mi></msub><mo>⋅</mo><msub><mover accent="true"><mi>P</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{aux}} = \\alpha \\cdot E \\cdot \\sum_{e=1}^{E} \\bar{f}_e \\cdot \\bar{P}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aux</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8312em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span></span><span style="top:-3.2634em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.0833em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9701em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8201em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>f</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\bar{f}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0257em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8312em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span></span><span style="top:-3.2634em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.0833em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>e</mi></mrow><annotation encoding="application/x-tex">e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">e</span></span></span></span> 在全局批次中的平均负载比例, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>P</mi><mo>ˉ</mo></mover><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\bar{P}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9701em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8201em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是该专家在全局批次上的平均路由概率, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 为超参数.</p>
<blockquote>
<p><strong>译者注 | 技术思考</strong>: Qwen3 强调「全局批次」而非「单个序列」的负载均衡, 这一细节在工程上意义重大. 在数据并行训练中, 全局批次横跨多个 GPU, 统计更稳定, 对专家崩溃的抑制更强. 但这也意味着负载均衡损失的计算需要跨设备 all-reduce 通信, 增加了训练同步开销. 在小规模实验集群上, 这种全局统计可能引入不可忽视的延迟; 只有在大规模集群(如 Qwen3 训练使用的千卡级 A100/H100)上, 通信开销才能被计算密度所摊平.</p>
</blockquote>
<h3 id="3-3-ytq-moe-fadhxdb">3.3 与同期 MoE 方案的横向对比</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">总参数</th>
<th align="center">激活参数</th>
<th align="center">专家数 / 激活数</th>
<th align="center">共享专家</th>
<th align="left">负载均衡策略</th>
</tr>
</thead>
<tbody><tr>
<td align="left">DeepSeek-V3</td>
<td align="center">671B</td>
<td align="center">37B</td>
<td align="center">256 / 8</td>
<td align="center">有</td>
<td align="left">序列级辅助损失 + 无 token 丢弃</td>
</tr>
<tr>
<td align="left">Qwen2.5-MoE</td>
<td align="center">57B</td>
<td align="center">14B</td>
<td align="center">128 / 8</td>
<td align="center">有</td>
<td align="left">序列级辅助损失</td>
</tr>
<tr>
<td align="left">Qwen3-235B-A22B</td>
<td align="center">235B</td>
<td align="center">22B</td>
<td align="center">128 / 8</td>
<td align="center"><strong>无</strong></td>
<td align="left"><strong>全局批次辅助损失</strong></td>
</tr>
<tr>
<td align="left">Llama-4-Maverick</td>
<td align="center">400B</td>
<td align="center">17B</td>
<td align="center">128 / 1</td>
<td align="center">有</td>
<td align="left">未公开</td>
</tr>
</tbody></table>
<p>Qwen3-235B-A22B 以仅 22B 激活参数、235B 总参数的规模, 在 15 个基座基准中的 14 个上 outperform 671B 总参数的 DeepSeek-V3-Base. 这一结果表明, 移除共享专家并未损害模型性能, 反而可能因路由自由度提升而实现了更高效的参数利用. 但需注意, 这一结论成立的前提是<strong>训练数据量足够大</strong>(36T tokens)且<strong>负载均衡机制足够强</strong>——在小数据或弱约束条件下, 无共享专家的设计很可能导致严重的专家崩溃.</p>
<hr>
<h2 id="4-hxjgs-qk-norm-yxlwdx">4 核心架构三: QK-Norm 与训练稳定性</h2>
<h3 id="4-1-zyl-logits-bzwt">4.1 注意力 logits 爆炸问题</h3>
<p>标准 Transformer 的缩放点积注意力计算公式为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>在大规模训练中(尤其是长序列或深层网络), Query 与 Key 的点积可能产生极端值. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup><mi mathvariant="normal">/</mi><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">QK^T/\\sqrt{d_k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1072em;vertical-align:-0.25em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord">/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
<p>Qwen3 引入 <strong>QK-Norm</strong>, 在点积之前对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 分别应用 LayerNorm:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mtext>LayerNorm</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>⋅</mo><mtext>LayerNorm</mtext><mo stretchy="false">(</mo><mi>K</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{\\text{LayerNorm}(Q) \\cdot \\text{LayerNorm}(K)^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">LayerNorm</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">LayerNorm</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>归一化操作将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 的范数约束在接近单位球的范围内, 使得点积的数值范围从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mi>k</mi></msub><mo>⋅</mo><mi mathvariant="normal">∥</mi><mi>Q</mi><mi mathvariant="normal">∥</mi><mo>⋅</mo><mi mathvariant="normal">∥</mi><mi>K</mi><mi mathvariant="normal">∥</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d_k \\cdot \\|Q\\| \\cdot \\|K\\|)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord mathnormal">Q</span><span class="mord">∥</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∥</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">∥</span><span class="mclose">)</span></span></span></span> 收缩到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d_k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 从根本上抑制了 logits 爆炸.</p>
<h3 id="4-2-qkv-bias-dycyzhxy">4.2 QKV-bias 的移除与组合效应</h3>
<p>Qwen3 移除了 Qwen2 中使用的 QKV-bias. 这一决策遵循了现代大模型设计的趋势: 在预训练阶段, bias 项对表达能力的增益有限, 却增加了参数量和计算量. 更重要的是, <strong>移除 bias 与引入 QK-Norm 之间存在协同效应</strong>——在没有 QK-Norm 的情况下, 移除 QKV-bias 可能加剧注意力 logits 的均值偏移问题, 因为 bias 原本承担了部分「居中」功能. 但配合 QK-Norm 后, 注意力计算完全依赖于归一化后的方向相似度, 而非绝对数值. 此时 bias 的存在与否不再影响稳定性, 移除 bias 反而简化了参数量化(quantization)和剪枝(pruning)的后续处理.</p>
<blockquote>
<p><strong>译者注 | 技术思考</strong>: QK-Norm 并非 Qwen3 的首创, 该思想最早出现在 GPT-3 的后续研究和 PaLM 的训练稳定化实践中. Qwen3 的贡献在于将其系统性引入到 Qwen 家族的全系列模型(从 0.6B 到 235B)中, 并验证了它与 GQA, RoPE ABF, YARN 等已有组件的兼容性. 值得注意的是, QK-Norm 会引入额外的 LayerNorm 计算开销. 在推理阶段, 由于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 的投影矩阵输出需要经过归一化后再进入注意力计算, 这增加了内存带宽压力. 对于边缘端模型(0.6B ~ 4B), 这种额外开销在延迟敏感场景中是否可接受, 取决于具体的部署优化水平.</p>
</blockquote>
<hr>
<h2 id="5-hxjgs-36t-token-yxldstzx">5 核心架构四: 36T Token 预训练的三条主线</h2>
<p>Qwen3 全系列模型在 <strong>36 万亿 token</strong> 上完成预训练, 覆盖 <strong>119 种语言和方言</strong>. 与 Qwen2.5 的 18T tokens / 29 种语言相比, 数据规模翻倍, 语言覆盖扩展四倍. 这一扩展背后有三条技术主线.</p>
<h3 id="5-1-pdf-wbtqdlblsx">5.1 PDF 文本提取的两步流水线</h3>
<p>Qwen3 使用 Qwen2.5-VL 对大量 PDF 文档进行文本识别, 随后用 Qwen2.5 对识别结果进行精炼. 这一两步流程产出了「数万亿额外的高质量文本 token」. PDF 文本提取的技术难度被严重低估——学术论文 PDF 中的公式、表格、多栏排版、字体嵌入异常等问题, 使得传统工具的提取准确率远不能满足大模型预训练的要求. Qwen2.5-VL 作为多模态模型, 能够「看懂」版面布局, 这是其相比纯 OCR 工具的核心优势.</p>
<h3 id="5-2-hcsjd-scaling-bj">5.2 合成数据的 scaling 边界</h3>
<p>Qwen3 使用 Qwen2.5、Qwen2.5-Math 和 Qwen2.5-Coder 生成了「数万亿」合成 token, 涵盖教科书、问答、指令和代码片段. 合成数据的边际收益并非单调递增: 当比例较低时(&lt;10%), 合成数据起到「补充稀有模式」的作用; 当比例中等时(10%~30%), 模型开始内化合成数据中的生成模式; 当比例过高时(&gt;50%), 模型可能过度拟合合成分布中的统计假象. 从 Qwen3 在 LiveBench 和 Arena-Hard 等对抗性基准上的强劲表现推断, 其数据混合策略找到了一个相对健康的平衡点.</p>
<h3 id="5-3-sljsjhhyh">5.3 实例级数据混合优化</h3>
<p>传统数据混合策略通常在「领域」或「数据源」粒度上调节比例. Qwen3 开发了一个多语言数据标注系统, 在超过 30T tokens 上标注了教育价值、领域、学科和安全性等多维标签, 并通过**实例级(instance-level)**消融实验优化混合比例. 这一粒度提升的背后是在小型代理模型上进行快速实验——这隐含了一个强假设: 代理模型的最优数据混合比例与目标大模型的最优比例一致.</p>
<hr>
<h2 id="6-gjcxyhxdb">6 关键创新与横向对比</h2>
<h3 id="6-1-qwen2-5-qwen3-ddjyq">6.1 Qwen2.5 → Qwen3 的代际跃迁</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Qwen2.5</th>
<th align="left">Qwen3</th>
<th align="left">工程含义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">预训练数据</td>
<td align="left">18T tokens, 29 语言</td>
<td align="left">36T tokens, 119 语言</td>
<td align="left">数据 scaling 的边际收益仍为正, 但语言扩展的公平性存疑</td>
</tr>
<tr>
<td align="left">推理能力</td>
<td align="left">基础 CoT, 独立模型(QwQ)</td>
<td align="left">双模式统一, 思考预算</td>
<td align="left">从「能力堆砌」到「行为控制」的范式转移</td>
</tr>
<tr>
<td align="left">MoE 设计</td>
<td align="left">共享专家 + 序列级均衡</td>
<td align="left">无共享专家 + 全局批次均衡</td>
<td align="left">架构简化, 依赖更强训练基础设施</td>
</tr>
<tr>
<td align="left">后训练</td>
<td align="left">Offline RL + GRPO</td>
<td align="left">四阶段流水线 + 蒸馏</td>
<td align="left">从「单模型精调」到「工厂化模型族生产」</td>
</tr>
<tr>
<td align="left">架构微观调整</td>
<td align="left">QKV-bias</td>
<td align="left">QK-Norm, 移除 QKV-bias</td>
<td align="left">训练稳定性与量化友好性的权衡</td>
</tr>
<tr>
<td align="left">上下文长度</td>
<td align="left">32K~128K(部分模型)</td>
<td align="left">32K 训练, 128K 推理(全系列)</td>
<td align="left">长上下文成为标配而非旗舰专属</td>
</tr>
</tbody></table>
<h3 id="6-2-ytqjpdhxdb">6.2 与同期竞品的横向对比</h3>
<p><strong>与 DeepSeek-V3/R1 的对比</strong>: DeepSeek-V3(671B 总参数, 37B 激活)在绝对规模上远超 Qwen3-235B-A22B, 但 Qwen3 在 14/15 个基座基准上胜出, 激活参数仅为 V3 的 60%, 印证 MoE 中参数效率重于绝对规模. DeepSeek-R1 的蒸馏生态已建立先发优势, Qwen3 的强到弱蒸馏需面对社区既成标准竞争.</p>
<p><strong>与 Llama-4 的对比</strong>: Llama-4-Maverick(400B 总参数, 17B 激活)每 token 仅激活 1 个专家(128 选 1), 路由的 winner-take-all 性质更强. Qwen3 的 128 选 8 提供更平滑的专家组合空间, 代价是更高 all-to-all 通信开销.</p>
<hr>
<h2 id="7-jxxyfx">7 局限性与风险</h2>
<h3 id="7-1-skmsxdcsxwth">7.1 思考模式下的长上下文退化</h3>
<p>RULER 基准显示, 思考模式下 Qwen3 的长上下文性能(235B-A22B 平均 92.2)显著低于非思考模式(95.0). 根本原因在于<strong>任务性质与计算分配的不匹配</strong>. RULER 测试的是纯检索能力, 这类任务不需要多步推理——思考模式下的模型会生成大量中间推理步骤, 这些步骤不仅消耗了本应用于注意力计算的上下文窗口预算, 还可能引入与检索目标无关的语义干扰. 具体机制可能是: (1) 思考 token 占用了 KV 缓存空间; (2) 推理链中的假设和验证过程可能「覆盖」或「扭曲」对原文细节的记忆; (3) 注意力权重被重新分配到思考 token 上, 削弱了对远距离上下文的关注.</p>
<h3 id="7-2-119-zyydzlbjh">7.2 119 种语言的质量不均衡</h3>
<p>119 种语言的支持在数量上令人印象深刻, 但<strong>语言覆盖不等于语言公平性</strong>. INCLUDE 和 Belebele 基准的评估结果显示, Qwen3 在高资源语言(如英语、中文、西班牙语)上表现强劲, 但在部分低资源语言上仍有差距. Qwen3 的数据策略——使用 Qwen2.5 系列模型生成合成数据——可能在低资源语言上产生「回声室效应」: 生成模型对低资源语言的理解本就有限, 以其为源生成的合成数据质量参差不齐, 进一步训练出的模型在这些语言上的天花板被隐性压低.</p>
<h3 id="7-3-sjdxldkfxxmj">7.3 四阶段训练的可复现性门槛</h3>
<p>Qwen3 的后训练流程涉及长 CoT 冷启动数据构建、GRPO 推理 RL、双模式 SFT 融合、20+ 任务的通用 RL 四个阶段, 每个阶段都有复杂的超参数和奖励设计. 对于学术研究者或中小团队而言, 完整复现这一流水线的计算成本(数百到数千 GPU 小时)和数据工程门槛极高. 强到弱蒸馏部分缓解了这一门槛, 但蒸馏本身仍然需要旗舰模型的 logits 输出作为监督信号. 从开源生态的健康度来看, Qwen3 的权重开放是正向贡献, 但训练流程的「黑箱化」(技术报告未披露全部超参数、数据过滤阈值、奖励函数的具体形式)意味着社区难以在 Qwen3 基础上进行根本性的架构实验.</p>
<h3 id="7-4-zlddljhnlxz">7.4 蒸馏的独立进化能力限制</h3>
<p>在线蒸馏的关键发现是: 学生模型不仅提升了 Pass@1, 还显著提升了 Pass@64(探索能力), 而独立 RL 训练未能带来 Pass@64 的任何改善. 但这一结论的适用范围需要被限定——对比实验「仅关注数学和代码相关查询」. 此外, 在线蒸馏假设教师模型的 logits 分布是「最优」的, 但在教师模型自身存在偏见或盲点的领域(如特定低资源语言、新兴编程语言), 学生模型会系统性地继承这些缺陷, 无法通过 RL 的自我探索来纠正. 蒸馏工厂化生产的效率优势, 某种程度上是以牺牲「独立进化能力」为代价的.</p>
<blockquote>
<p><strong>译者注 | 技术思考</strong>: Qwen3 的技术遗产可概括为「数据密度 × 方法深度 × 用户控制」的三重提升. 数据端: 36T token + 119 种语言构成了当时开源社区最大规模的多语言预训练. 方法端: 四阶段后训练流水线(长 CoT 冷启动 → 推理 RL → 思考模式融合 → 通用 RL)将推理能力与通用能力在单一模型内有机整合. 用户控制端: 思考预算机制将「推理深度」从模型的黑箱行为转化为用户的可调参数, 这是从「模型为中心」到「用户控制为中心」的范式转变. Qwen3 的局限性(思考模式下长上下文退化、119 语言的质量不均衡、四阶段训练的可复现性门槛)则指向了下一代模型的明确优化方向: 更智能的模式自动切换、更深入的低资源语言数据工程、以及更透明的训练流程开放.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdjyztdw","text":"1 设计动机与总体定位"},{"level":2,"id":"2-hxjgy-smstyyskys","text":"2 核心架构一: 双模式统一与思考预算"},{"level":3,"id":"2-1-sjdhxllsxdnblj","text":"2.1 四阶段后训练流水线的内部逻辑"},{"level":3,"id":"2-2-dhmb-msqhdyfjk","text":"2.2 对话模板: 模式切换的语法接口"},{"level":3,"id":"2-3-skys-xlyxdnl","text":"2.3 思考预算: 训练涌现的能力"},{"level":2,"id":"3-hxjge-moe-qgxzjdjjsy","text":"3 核心架构二: MoE 去共享专家的激进实验"},{"level":3,"id":"3-1-gxzjdycdj","text":"3.1 共享专家的移除动机"},{"level":3,"id":"3-2-qjfzjhdsxsx","text":"3.2 全局负载均衡的数学实现"},{"level":3,"id":"3-3-ytq-moe-fadhxdb","text":"3.3 与同期 MoE 方案的横向对比"},{"level":2,"id":"4-hxjgs-qk-norm-yxlwdx","text":"4 核心架构三: QK-Norm 与训练稳定性"},{"level":3,"id":"4-1-zyl-logits-bzwt","text":"4.1 注意力 logits 爆炸问题"},{"level":3,"id":"4-2-qkv-bias-dycyzhxy","text":"4.2 QKV-bias 的移除与组合效应"},{"level":2,"id":"5-hxjgs-36t-token-yxldstzx","text":"5 核心架构四: 36T Token 预训练的三条主线"},{"level":3,"id":"5-1-pdf-wbtqdlblsx","text":"5.1 PDF 文本提取的两步流水线"},{"level":3,"id":"5-2-hcsjd-scaling-bj","text":"5.2 合成数据的 scaling 边界"},{"level":3,"id":"5-3-sljsjhhyh","text":"5.3 实例级数据混合优化"},{"level":2,"id":"6-gjcxyhxdb","text":"6 关键创新与横向对比"},{"level":3,"id":"6-1-qwen2-5-qwen3-ddjyq","text":"6.1 Qwen2.5 → Qwen3 的代际跃迁"},{"level":3,"id":"6-2-ytqjpdhxdb","text":"6.2 与同期竞品的横向对比"},{"level":2,"id":"7-jxxyfx","text":"7 局限性与风险"},{"level":3,"id":"7-1-skmsxdcsxwth","text":"7.1 思考模式下的长上下文退化"},{"level":3,"id":"7-2-119-zyydzlbjh","text":"7.2 119 种语言的质量不均衡"},{"level":3,"id":"7-3-sjdxldkfxxmj","text":"7.3 四阶段训练的可复现性门槛"},{"level":3,"id":"7-4-zlddljhnlxz","text":"7.4 蒸馏的独立进化能力限制"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/09-qwen3/02-qwen3-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/09-qwen3/02-qwen3-hxjgpx" />
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
