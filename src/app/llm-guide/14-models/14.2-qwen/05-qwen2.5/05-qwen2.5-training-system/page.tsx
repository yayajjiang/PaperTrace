"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5 工程落地精读</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 Qwen2.5 的工业化训练流水线 —— 18T 数据工程的四层提升、100 万+ SFT 样本的九维构建、离线/在线 RL 的协同机制、以及奖励模型评估的 Goodhart 困境 —— 的实现细节与可复用经验.</p>
</blockquote>
<hr>
<h2 id="1-18t-yxlsjdscgcts">1 18T 预训练数据的四层工程提升</h2>
<h3 id="1-1-zjszlgl">1.1 自举式质量过滤</h3>
<p>Qwen2.5 使用 Qwen2-Instruct 模型作为数据质量过滤器. 这是一个「自举」(bootstrapping)过程: 第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 代模型训练完成后, 被用于过滤第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">n+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 代模型的训练数据. 自举的核心假设是「模型能力单调提升」—— 若第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 代模型已能识别低质数据, 则第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">n+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 代模型在此基础上训练后将具备更强的识别能力, 形成正反馈.</p>
<p>工程实现上, 过滤流程可能为:</p>
<ol>
<li><strong>启发式预筛</strong>: 去重、格式检查、长度过滤(快速剔除明显垃圾)</li>
<li><strong>模型打分</strong>: Qwen2-Instruct 对每段文本从 fluency、coherence、informativeness、factuality 等维度评分</li>
<li><strong>阈值截断</strong>: 设定各维度阈值, 仅保留高分样本</li>
<li><strong>领域平衡</strong>: 根据 scaling law 指导的配比进行升/降采样</li>
</ol>
<p>风险在于: 若第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 代模型存在系统性偏见(如过度偏好某些写作风格), 第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">n+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 代将放大该偏见. Qwen2.5 通过「多维度评分 + 人工校验校准」来缓解这一风险.</p>
<h3 id="1-2-zyhsjd-xsqy">1.2 专业化数据的「向上迁移」</h3>
<p>Qwen2.5 预训练直接整合 Qwen2.5-Math 与 Qwen2.5-Coder 的训练数据. 这揭示了 Qwen 家族的「特化→通用」数据策略:</p>
<pre><code>Qwen2.5-Math/Coder 专业化训练
         |
         v
    高质量数学/代码数据
         |
         v
Qwen2.5 通用预训练(18T 的一部分)
         |
         v
    通用模型获得数学/代码能力
         |
         v
Qwen2.5-72B-Instruct 生成合成数据
         |
         v
    下一代模型的训练数据
</code></pre>
<p>这种策略的优势在于: 专业化模型(Qwen2.5-Math)可以在特定领域上进行更深度的数据清洗与格式标准化, 其输出质量高于通用模型直接生成的数据. 将专业化数据「向上迁移」到通用模型, 相当于为通用模型注入「预精炼」的能力模块.</p>
<h3 id="1-3-hcsjd-sc-gl-bh">1.3 合成数据的「生成-过滤」闭环</h3>
<p>Qwen2.5 使用 Qwen2-72B-Instruct 与 Qwen2-Math-72B-Instruct 生成合成数据, 并通过两级奖励模型过滤:</p>
<ul>
<li><strong>通用奖励模型</strong>: 评估通用质量(连贯性、有用性、安全性)</li>
<li><strong>Qwen2-Math-RM-72B</strong>: 专项评估数学正确性</li>
</ul>
<p>这种「双塔过滤」架构确保合成数据在通用维度与专业维度均达到标准. 合成数据的规模未在论文中披露, 但从 7T→18T 的增量(11T)推测, 合成数据可能占新增数据的显著比例(20-40%).</p>
<blockquote>
<p><strong>技术思考 1.1 | 数据实验</strong>: Qwen2.5 的数据策略验证了 2024 年 LLM 训练的两大趋势: <strong>自举过滤</strong> 与 <strong>专业化数据迁移</strong>. 自举过滤的极限在于「过滤能力天花板」—— 当模型已能识别绝大多数低质数据后, 继续提升过滤器的边际收益递减. 专业化数据迁移则揭示了开源生态的「协同效应」: Qwen2.5-Math、Qwen2.5-Coder 与 Qwen2.5 通用模型并非独立产品, 而是相互喂养的技术体系. 这种「家族协同」是闭源模型(如 GPT-4)天然具备但开源模型需要刻意构建的优势.</p>
</blockquote>
<hr>
<h2 id="2-100-w-sft-ybdjwgjgc">2 100 万+ SFT 样本的九维构建工程</h2>
<h3 id="2-1-jwsjdxhlxyyzjz">2.1 九维数据的信号类型与验证机制</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">核心信号</th>
<th align="left">验证机制</th>
<th align="left">数据规模估计</th>
</tr>
</thead>
<tbody><tr>
<td align="left">长序列生成</td>
<td align="left">输出长度达标 + 质量不下降</td>
<td align="left">Qwen2 质量过滤</td>
<td align="left">~10 万</td>
</tr>
<tr>
<td align="left">数学</td>
<td align="left">答案正确 + 推理链完整</td>
<td align="left">拒绝采样 + RM 验证</td>
<td align="left">~20 万</td>
</tr>
<tr>
<td align="left">代码</td>
<td align="left">编译通过 + 单元测试通过</td>
<td align="left">多语言沙箱执行</td>
<td align="left">~20 万</td>
</tr>
<tr>
<td align="left">指令遵循</td>
<td align="left">约束满足率</td>
<td align="left">代码验证框架 + 执行反馈</td>
<td align="left">~15 万</td>
</tr>
<tr>
<td align="left">结构化数据</td>
<td align="left">推理链正确 + 答案准确</td>
<td align="left">自动判题</td>
<td align="left">~10 万</td>
</tr>
<tr>
<td align="left">逻辑推理</td>
<td align="left">答案正确 + 推理无谬误</td>
<td align="left">迭代过滤</td>
<td align="left">~7 万</td>
</tr>
<tr>
<td align="left">跨语言迁移</td>
<td align="left">语义对齐度</td>
<td align="left">翻译模型回译检验</td>
<td align="left">~10 万</td>
</tr>
<tr>
<td align="left">鲁棒系统指令</td>
<td align="left">不同系统提示下性能稳定</td>
<td align="left">多提示评估</td>
<td align="left">~5 万</td>
</tr>
<tr>
<td align="left">回复过滤</td>
<td align="left">零瑕疵(全评分系统通过)</td>
<td align="left">Critic 模型 + 多 Agent 评分</td>
<td align="left">贯穿全 pipeline</td>
</tr>
</tbody></table>
<h3 id="2-2-dmyzkjdgcxj">2.2 代码验证框架的工程细节</h3>
<p>指令遵循数据的质量控制是 Qwen2.5 的一个亮点. 其核心创新是「指令 → 验证代码 → 单元测试」的三元组设计:</p>
<pre><code class="language-python"># 示例: 指令 &quot;生成一段 Python 代码, 输出不超过 100 字&quot;
instruction = &quot;生成一段 Python 代码, 输出不超过 100 字&quot;
response = model.generate(instruction)

# 验证代码(由 LLM 自动生成)
verification_code = f&quot;&quot;&quot;
import ast
# 检查是否为 Python 代码
try:
    ast.parse(response)
except SyntaxError:
    return False
# 检查输出长度约束(通过静态分析或执行)
exec(response)
output = captured_output
return len(output) &lt;= 100
&quot;&quot;&quot;

# 执行验证
is_valid = execute(verification_code)
</code></pre>
<p>这种框架的通用性很强: 对于任何可形式化的约束(长度、格式、关键词、代码语法), 都可以生成对应的验证函数. 其局限在于: 对于开放性约束(如「写得有趣」), 自动验证仍具挑战, 需要依赖 critic 模型.</p>
<h3 id="2-3-critic-mxyd-agent-pfdzlkz">2.3 Critic 模型与多 Agent 评分的质量控制</h3>
<p>Qwen2.5 在回复过滤阶段引入双重评估:</p>
<ul>
<li><strong>Critic 模型</strong>: 专门训练用于发现回复中的错误、不一致或低质内容. 与通用奖励模型不同, critic 的输出是「问题列表」而非「分数」, 更具可解释性.</li>
<li><strong>多 Agent 协作评分</strong>: 多个独立评分的 Agent 对同一回复打分, 仅当所有 Agent 均判定为「无瑕疵」时才保留. 这降低了单一评分器的假阴性风险.</li>
</ul>
<p>这种「全票通过」机制的代价是召回率降低 —— 大量「勉强合格」的回复被剔除. 但考虑到 SFT 数据总量已达 100 万+, 即使过滤掉 30-40% 的 borderline 样本, 剩余数据仍足够训练.</p>
<blockquote>
<p><strong>技术思考 2.1 | 设计动机</strong>: Qwen2.5 的 SFT pipeline 体现了「验证信号分层」的工程智慧. 从强到弱, 验证信号依次为: 编译/执行(代码) &gt; 答案匹配(数学) &gt; 代码验证(指令遵循) &gt; 自动判题(结构化数据) &gt; Critic 评分(通用质量) &gt; 多 Agent 共识(最终过滤). 每一层都扮演「守门员」角色, 将不符合该层标准的数据拦截, 避免低质数据流入下一层. 这种分层架构使 100 万+ 样本的构建成为可能 —— 若无自动化验证, 人工审核 100 万条数据的成本将高到不可接受.</p>
</blockquote>
<hr>
<h2 id="3-lx-rl-yzx-rl-dxtjz">3 离线 RL 与在线 RL 的协同机制</h2>
<h3 id="3-1-nlfg-lxj-yjn-zxj-rph">3.1 能力分工: 离线教「硬技能」, 在线教「软偏好」</h3>
<p>Qwen2.5 的两阶段 RL 设计体现了明确的能力分工:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">优化目标</th>
<th align="left">数据特征</th>
<th align="left">训练方法</th>
<th align="left">适用能力</th>
</tr>
</thead>
<tbody><tr>
<td align="left">离线 RL</td>
<td align="left">标准答案匹配</td>
<td align="left">有明确正/负例</td>
<td align="left">DPO</td>
<td align="left">数学、代码、指令遵循、逻辑推理</td>
</tr>
<tr>
<td align="left">在线 RL</td>
<td align="left">人类偏好对齐</td>
<td align="left">无标准答案, 只有好坏之分</td>
<td align="left">GRPO</td>
<td align="left">真实性、有用性、简洁性、相关性、无害性、去偏</td>
</tr>
</tbody></table>
<p>离线 RL 的「可学习性」条件(offline RL signals are both learnable and reliable)是关键: 若正负例的差异过于细微(如两条代码都编译通过, 仅风格不同), DPO 的优化信号将不稳定. Qwen2.5 通过「执行反馈 + 答案匹配」确保正负例之间存在明确的能力差距.</p>
<p>在线 RL 的 6 维度奖励模型为 GRPO 提供了细粒度信号. 与单一标量奖励不同, 多维度奖励允许模型在不同维度上进行 trade-off. 例如, 一条回复可能在「有用性」上得分高但在「简洁性」上得分低, GRPO 可以学习在这两者之间找到平衡.</p>
<h3 id="3-2-cxyxj-fcqdcy">3.2 查询优先级: 方差驱动采样</h3>
<p>Qwen2.5 在线 RL 的一个独特设计是按奖励模型评分的方差排序查询:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>priority</mtext><mo stretchy="false">(</mo><mi>q</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Var</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>ϕ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{priority}(q) = \\text{Var}(\\{r_\\phi(o_i|q)\\}_{i=1}^{G})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">priority</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1774em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Var</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">ϕ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>方差高的查询意味着: 对该查询, 模型生成的回复质量差异大 —— 有些很好, 有些很差. 这类查询提供了更强的学习信号(因为正负例对比鲜明). 相反, 方差低的查询(所有回复质量相近)对学习贡献有限.</p>
<p>这种「方差驱动采样」类似于主动学习中的「不确定性采样」, 但应用于 RL 而非监督学习. 其工程实现需要在每轮训练前对所有候选查询进行奖励模型评分, 计算方差后排序 —— 这增加了预处理开销, 但提升了样本效率.</p>
<blockquote>
<p><strong>技术思考 3.1 | 局限性</strong>: 两阶段 RL 的分工虽然清晰, 但存在一个隐性假设: 离线 RL 习得的「硬技能」与在线 RL 习得的「软偏好」是正交的, 不会相互干扰. 实践中, 这种正交性并不严格成立. 例如, 在线 RL 优化「简洁性」时, 可能导致数学推理步骤被过度压缩, 损害「答案正确性」这一离线 RL 已习得的能力. Qwen2.5 使用 Online Merging Optimizer 来缓解这一问题, 但其本质是「软约束」而非「硬隔离」. DeepSeek-R1 的纯 RL 方案(单一规则奖励同时覆盖正确性与格式)避免了这种阶段间的干扰, 但代价是牺牲了多维度偏好的细粒度控制.</p>
</blockquote>
<hr>
<h2 id="4-jlmxdpgkjy-goodhart-dl">4 奖励模型的评估困境与 Goodhart 定律</h2>
<h3 id="4-1-djzpgdmdjg">4.1 多基准评估的矛盾结果</h3>
<p>Qwen2.5-RM-72B 在四个基准上的表现揭示了 RM 评估的复杂性:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">测试内容</th>
<th align="center">Qwen2.5-RM-72B 排名</th>
<th align="left">领先者</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Reward Bench</td>
<td align="left">通用对话/安全/推理偏好判别</td>
<td align="center">第 3</td>
<td align="left">Llama-3.1-Nemotron-70B-Reward</td>
</tr>
<tr>
<td align="left">RMB</td>
<td align="left">有用性/无害性 Best-of-N 与成对比较</td>
<td align="center">第 2</td>
<td align="left">Athene-RM-70B</td>
</tr>
<tr>
<td align="left">PPE</td>
<td align="left">人类偏好/指令遵循/GPQA/MATH/MBPP 等</td>
<td align="center"><strong>第 1</strong></td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Human-Preference-Chinese</td>
<td align="left">中文人类偏好</td>
<td align="center"><strong>第 1</strong></td>
<td align="left">-</td>
</tr>
</tbody></table>
<p>没有一个模型能在所有基准上统治. Llama-3.1-Nemotron-70B-Reward 在 Reward Bench 上最强, 但在中文偏好上仅 59.95(远低于 Qwen2.5-RM-72B 的 61.27); Athene-RM-70B 在 RMB 上领先, 但在 PPE 上落后.</p>
<h3 id="4-2-goodhart-dldxx">4.2 Goodhart 定律的显现</h3>
<p>论文指出: &quot;over-optimization on a specific benchmark may trigger Goodhart&#39;s law, resulting in degraded performance on other benchmarks&quot;. Goodhart 定律原文为: &quot;When a measure becomes a target, it ceases to be a good measure.&quot;(当一个指标成为目标时, 它就不再是一个好指标).</p>
<p>在 RM 训练中, 这意味着: 若团队以 Reward Bench 分数为优化目标, RM 可能学会「欺骗」Reward Bench 的评估模式(如过度偏好某些关键词或句式), 而在真实人类偏好上表现下降. 这与「考试技巧」类比: 学生针对特定考试题型训练, 分数提升但真实能力未必增长.</p>
<h3 id="4-3-rm-jzyxy-rl-dtj">4.3 RM 基准与下游 RL 的脱节</h3>
<p>更具洞察力的发现是: &quot;current reward model evaluation benchmarks do not accurately predict the performance of the RL models trained under their guidance&quot;. 即 RM 在基准上得分高 ≠ RL 模型表现好.</p>
<p>可能的原因包括:</p>
<ol>
<li><strong>分布偏移</strong>: RM 基准的查询分布与 RL 训练时的查询分布不同</li>
<li><strong>优化动态不匹配</strong>: RM 的静态评分与 RL 的动态策略更新之间存在复杂交互</li>
<li><strong>奖励黑客</strong>: RM 可能被策略模型「hack」(生成 RM 喜欢但人类不喜欢的回复)</li>
</ol>
<p>这一发现对 RLHF 社区具有警示意义: 当前 RM 评估体系可能无法可靠地指导 RM 开发, 需要设计更贴近下游 RL 任务的评估方法.</p>
<blockquote>
<p><strong>技术思考 4.1 | 工程落地</strong>: Qwen2.5 的奖励模型评估经验提供了三个可复用原则: (1) <strong>多基准评估</strong> —— 单一基准不可靠, 至少覆盖通用/有用性/无害性/专业性/跨语言等维度; (2) <strong>留一手验证</strong> —— 保留一部分数据不参与 RM 训练, 仅用于测试 RM 对「未见查询」的泛化; (3) <strong>端到端验证</strong> —— 定期用 RM 训练完整的 RL 模型, 在真实任务上评估, 而非仅看 RM 分数. 这些原则虽然增加了评估成本, 但避免了「RM 分数虚高、RL 模型实差」的陷阱.</p>
</blockquote>
<hr>
<h2 id="5-gcjyzj">5 工程经验总结</h2>
<table>
<thead>
<tr>
<th align="left">决策点</th>
<th align="left">Qwen2.5 选择</th>
<th align="left">可复用经验</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据规模</td>
<td align="left">7T → 18T</td>
<td align="left">合成数据 + 专业化子模型数据可有效突破质量天花板</td>
</tr>
<tr>
<td align="left">质量过滤</td>
<td align="left">自举式模型过滤</td>
<td align="left">第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 代模型过滤第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">n+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 代数据, 但需定期人工校准</td>
</tr>
<tr>
<td align="left">数据混合</td>
<td align="left">Scaling Law 指导配比</td>
<td align="left">用 proxy 模型(0.5B-1.5B)快速验证 domain 配比</td>
</tr>
<tr>
<td align="left">SFT 构建</td>
<td align="left">9 维专项增强</td>
<td align="left">按验证信号强度分层: 可编译/可执行 &gt; 可匹配 &gt; 可评分</td>
</tr>
<tr>
<td align="left">离线 RL</td>
<td align="left">DPO + 执行反馈</td>
<td align="left">仅用于有明确正/负例的「硬技能」任务</td>
</tr>
<tr>
<td align="left">在线 RL</td>
<td align="left">GRPO + 6 维奖励模型</td>
<td align="left">用于无标准答案的「软偏好」任务, 方差驱动采样提升效率</td>
</tr>
<tr>
<td align="left">长上下文</td>
<td align="left">渐进式扩展 + 稀疏注意力</td>
<td align="left">每阶段 40% 新长度 + 60% 旧长度, 避免能力遗忘</td>
</tr>
<tr>
<td align="left">RM 评估</td>
<td align="left">多基准 + 端到端验证</td>
<td align="left">单一基准受 Goodhart 定律影响, 必须结合下游 RL 性能</td>
</tr>
</tbody></table>
<p>Qwen2.5 的工程核心可概括为「<strong>系统化、工业化、可扩展</strong>」. 从数据到训练到评估, 每个环节都建立了明确的流水线、验证机制与优化目标. 这种「工程成熟度」是 Qwen2.5 能以 1/6 参数量匹敌 Llama-3-405B 的根本原因 —— 不是架构更先进, 而是每个 token、每个样本、每次更新都被更有效地利用.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-18t-yxlsjdscgcts","text":"1 18T 预训练数据的四层工程提升"},{"level":3,"id":"1-1-zjszlgl","text":"1.1 自举式质量过滤"},{"level":3,"id":"1-2-zyhsjd-xsqy","text":"1.2 专业化数据的「向上迁移」"},{"level":3,"id":"1-3-hcsjd-sc-gl-bh","text":"1.3 合成数据的「生成-过滤」闭环"},{"level":2,"id":"2-100-w-sft-ybdjwgjgc","text":"2 100 万+ SFT 样本的九维构建工程"},{"level":3,"id":"2-1-jwsjdxhlxyyzjz","text":"2.1 九维数据的信号类型与验证机制"},{"level":3,"id":"2-2-dmyzkjdgcxj","text":"2.2 代码验证框架的工程细节"},{"level":3,"id":"2-3-critic-mxyd-agent-pfdzlkz","text":"2.3 Critic 模型与多 Agent 评分的质量控制"},{"level":2,"id":"3-lx-rl-yzx-rl-dxtjz","text":"3 离线 RL 与在线 RL 的协同机制"},{"level":3,"id":"3-1-nlfg-lxj-yjn-zxj-rph","text":"3.1 能力分工: 离线教「硬技能」, 在线教「软偏好」"},{"level":3,"id":"3-2-cxyxj-fcqdcy","text":"3.2 查询优先级: 方差驱动采样"},{"level":2,"id":"4-jlmxdpgkjy-goodhart-dl","text":"4 奖励模型的评估困境与 Goodhart 定律"},{"level":3,"id":"4-1-djzpgdmdjg","text":"4.1 多基准评估的矛盾结果"},{"level":3,"id":"4-2-goodhart-dldxx","text":"4.2 Goodhart 定律的显现"},{"level":3,"id":"4-3-rm-jzyxy-rl-dtj","text":"4.3 RM 基准与下游 RL 的脱节"},{"level":2,"id":"5-gcjyzj","text":"5 工程经验总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-training-system" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-training-system" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5 工程落地精读</h1>
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
