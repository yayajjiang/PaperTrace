"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.2-Speciale 极限推理剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 <code>01-DeepSeek-V3.2技术报告精译.md</code> 中关于 Speciale 变体的内容, 对其极限推理能力做深度拆解. Speciale 是 DeepSeek-V3.2 的高算力实验变体, 通过放宽长度约束和聚焦推理数据, 在数学与编程竞赛中达到金牌级表现.</p>
</blockquote>
<hr>
<h2 id="1-speciale-dxlffcy">1 Speciale 的训练方法差异</h2>
<p>DeepSeek-V3.2-Speciale 与标准版 V3.2 在训练方法上有三个关键差异:</p>
<p><strong>数据聚焦</strong>. Speciale 仅在推理数据上训练, 排除了智能体任务和人类对齐数据. 这种「单一目标」训练策略使模型的全部优化预算集中在推理能力上, 避免了多任务之间的干扰.</p>
<p><strong>长度惩罚弱化</strong>. 在 RL 训练中, Speciale 减少了长度惩罚的强度. 标准版 V3.2 施加了严格的长度约束以控制推理成本, 而 Speciale 的目标是探索「扩展思考」的极限——允许模型生成更长的思维链, 即使这意味着更高的 Token 消耗.</p>
<p><strong>数学证明增强</strong>. Speciale 纳入了 DeepSeekMath-V2(Shao et al., 2025) 的数据集和奖励方法, 专门增强形式化数学证明能力. 这是其在 IMO 和 CMO 中表现突出的关键.</p>
<blockquote>
<p>译者注(设计动机): 这三个差异揭示了一个重要的训练哲学——「通用性 vs 极限性能」的权衡. 标准版 V3.2 通过混合 RL 同时优化推理、智能体和人类对齐, 追求「全能型」产品; Speciale 则通过「去混合化」追求单一能力的极限. 这种策略与体育界的「专项训练」类似: 全能运动员在多个项目上都优秀, 但世界纪录通常由专项运动员创造. 从工程角度看, 这种「一个基座 + 多个特化变体」的策略非常实用——用同一个预训练Checkpoint, 通过不同的后训练配方产出不同定位的产品.</p>
</blockquote>
<hr>
<h2 id="2-jxtlxncj">2 极限推理性能拆解</h2>
<h3 id="2-1-sxtljz">2.1 数学推理基准</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GPT-5-High</th>
<th align="center">Gemini-3.0-Pro</th>
<th align="center">Kimi-K2-Thinking</th>
<th align="center">V3.2-Thinking</th>
<th align="center">V3.2-Speciale</th>
<th align="center">提升幅度</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AIME 2025</td>
<td align="center">94.6%</td>
<td align="center">95.0%</td>
<td align="center">94.5%</td>
<td align="center">93.1%</td>
<td align="center"><strong>96.0%</strong></td>
<td align="center">+2.9%</td>
</tr>
<tr>
<td align="left">HMMT Feb</td>
<td align="center">88.3%</td>
<td align="center"><strong>97.5%</strong></td>
<td align="center">89.4%</td>
<td align="center">92.5%</td>
<td align="center"><strong>99.2%</strong></td>
<td align="center">+6.7%</td>
</tr>
<tr>
<td align="left">HMMT Nov</td>
<td align="center">89.2%</td>
<td align="center"><strong>93.3%</strong></td>
<td align="center">89.2%</td>
<td align="center">90.2%</td>
<td align="center"><strong>94.4%</strong></td>
<td align="center">+4.2%</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">76.0%</td>
<td align="center"><strong>83.3%</strong></td>
<td align="center">78.6%</td>
<td align="center">78.3%</td>
<td align="center"><strong>84.5%</strong></td>
<td align="center">+6.2%</td>
</tr>
<tr>
<td align="left">GPQA Diamond</td>
<td align="center">85.7%</td>
<td align="center"><strong>91.9%</strong></td>
<td align="center">84.5%</td>
<td align="center">82.4%</td>
<td align="center">85.7%</td>
<td align="center">+3.3%</td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">26.3%</td>
<td align="center"><strong>37.7%</strong></td>
<td align="center">23.9%</td>
<td align="center">25.1%</td>
<td align="center">30.6%</td>
<td align="center">+5.5%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Speciale 与主流模型的数学推理基准对比. 粗体为每行最高值.</p>
</blockquote>
<p>Speciale 在 6 项数学基准中的 4 项上超越了所有对比模型(包括 Gemini-3.0-Pro). 尤其值得注意的是 HMMT Feb 2025 的 99.2%——这一分数意味着模型在 12 道高难度数学竞赛题中仅错 1 道, 已接近人类顶级竞赛选手的水平.</p>
<blockquote>
<p>译者注(数据实验): 99.2% 的 HMMT Feb 分数需要谨慎解读. HMMT(Harvard-MIT Math Tournament)的题目虽然难度高, 但题型相对固定, 主要涵盖代数、几何、组合和数论. 模型可能在训练数据中见过大量同类题型, 存在「题型过拟合」的风险. 更可靠的指标是 IMOAnswerBench(84.5%)——这个基准直接基于 IMO 真题, 题目风格和难度与训练数据差异更大. 即便如此, 84.5% 已超越 Gemini-3.0-Pro 的 83.3%, 这是开源模型首次在形式化数学证明上超越顶级闭源模型.</p>
</blockquote>
<h3 id="2-2-bctljz">2.2 编程推理基准</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GPT-5-High</th>
<th align="center">Gemini-3.0-Pro</th>
<th align="center">V3.2-Thinking</th>
<th align="center">V3.2-Speciale</th>
<th align="center">提升幅度</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LiveCodeBench</td>
<td align="center">84.5%</td>
<td align="center"><strong>90.7%</strong></td>
<td align="center">83.3%</td>
<td align="center">88.7%</td>
<td align="center">+5.4%</td>
</tr>
<tr>
<td align="left">Codeforces Rating</td>
<td align="center">2537</td>
<td align="center"><strong>2708</strong></td>
<td align="center">2386</td>
<td align="center">2701</td>
<td align="center">+315</td>
</tr>
</tbody></table>
<p>Speciale 在 Codeforces 上的 Rating 达到 2701, 与 Gemini-3.0-Pro 的 2708 几乎持平. Codeforces 是一个动态变化的竞赛平台, 题目每周更新, 训练数据污染的可能性远低于静态基准.</p>
<h3 id="2-3-token-xsfx">2.3 Token 效率分析</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Gemini-3.0-Pro (Token)</th>
<th align="center">V3.2-Thinking (Token)</th>
<th align="center">V3.2-Speciale (Token)</th>
<th align="center">Speciale/ Gemini 效率比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AIME 2025</td>
<td align="center">15k</td>
<td align="center">16k</td>
<td align="center">23k</td>
<td align="center">0.65</td>
</tr>
<tr>
<td align="left">HMMT Feb</td>
<td align="center">16k</td>
<td align="center">19k</td>
<td align="center">27k</td>
<td align="center">0.59</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">18k</td>
<td align="center">27k</td>
<td align="center">45k</td>
<td align="center">0.40</td>
</tr>
<tr>
<td align="left">Codeforces</td>
<td align="center">22k</td>
<td align="center">42k</td>
<td align="center">77k</td>
<td align="center">0.29</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 各模型在不同基准上的输出 Token 数对比.</p>
</blockquote>
<blockquote>
<p>译者注(架构细节): 表 2 的数据揭示了一个严峻的现实: Speciale 的 Token 效率显著劣于 Gemini-3.0-Pro. 在 Codeforces 上, Speciale 消耗 77k Token 达到 2701 Rating, 而 Gemini-3.0-Pro 仅用 22k Token 就达到 2708——效率差距约 3.5 倍. 这意味着 Speciale 的「极限性能」很大程度上是通过「暴力扩展思考长度」实现的, 而非更高效的推理策略. 这种「长度换精度」的策略在实际部署中面临严峻挑战: 77k Token 的推理成本(按 DeepSeek API 定价约 0.5 美元/百万 token 计算)约为 0.04 美元/题, 而 Gemini-3.0-Pro 的 22k Token 成本约为 0.55 美元/百万 token × 0.022 = 0.012 美元/题. 尽管 Speciale 的单题成本仍低于 Gemini, 但如果需要处理数百万题的规模, 累计成本差异将非常可观.</p>
</blockquote>
<hr>
<h2 id="3-djjsbxsdfx">3 顶级竞赛表现深度分析</h2>
<h3 id="3-1-gjsxalpk-imo-2025">3.1 国际数学奥林匹克(IMO 2025)</h3>
<table>
<thead>
<tr>
<th align="center">题目</th>
<th align="center">P1</th>
<th align="center">P2</th>
<th align="center">P3</th>
<th align="center">P4</th>
<th align="center">P5</th>
<th align="center">P6</th>
<th align="center">总分</th>
</tr>
</thead>
<tbody><tr>
<td align="center">满分</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">42</td>
</tr>
<tr>
<td align="center">Speciale</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">7</td>
<td align="center">0</td>
<td align="center">35</td>
</tr>
</tbody></table>
<p>Speciale 在 IMO 2025 中拿到 35/42 分, 获得金牌(金牌线通常为 28-32 分). 唯一未解出的 P6 是一道极具挑战性的几何/组合综合题, 这在人类选手中也是区分金牌与满分选手的关键题.</p>
<blockquote>
<p>译者注(数据实验): IMO 的评分标准极其严格, 每道题的 7 分需要完整、严谨的形式化证明, 部分证明或直觉性答案只能得到 0-2 分. Speciale 在前 5 题全对, 说明其形式化证明能力已达到人类金牌选手水平. P6 的 0 分值得关注——这是否意味着模型在「创造性构造」类问题上仍有明显短板? IMO P6 通常需要非标准的辅助线构造或巧妙的引理发现, 这些能力可能难以通过 RL 从现有数据中提取.</p>
</blockquote>
<h3 id="3-2-gjxxxalpk-ioi-2025">3.2 国际信息学奥林匹克(IOI 2025)</h3>
<table>
<thead>
<tr>
<th align="center">题目</th>
<th align="center">P1</th>
<th align="center">P2</th>
<th align="center">P3</th>
<th align="center">P4</th>
<th align="center">P5</th>
<th align="center">P6</th>
<th align="center">总分</th>
</tr>
</thead>
<tbody><tr>
<td align="center">满分</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">600</td>
</tr>
<tr>
<td align="center">Speciale</td>
<td align="center">100</td>
<td align="center">82</td>
<td align="center">72</td>
<td align="center">100</td>
<td align="center">55</td>
<td align="center">83</td>
<td align="center">492</td>
</tr>
</tbody></table>
<p>IOI 2025 第 10 名/金牌. 值得注意的是 P2(82 分)和 P3(72 分)的失分——这两题通常涉及复杂的算法设计和边界情况处理, 需要选手在有限时间内完成代码编写、调试和优化.</p>
<h3 id="3-3-icpc-sjzjs-icpc-wf-2025">3.3 ICPC 世界总决赛(ICPC WF 2025)</h3>
<table>
<thead>
<tr>
<th align="center">题目</th>
<th align="center">A</th>
<th align="center">B</th>
<th align="center">C</th>
<th align="center">D</th>
<th align="center">E</th>
<th align="center">F</th>
<th align="center">G</th>
<th align="center">H</th>
<th align="center">I</th>
<th align="center">J</th>
<th align="center">K</th>
<th align="center">L</th>
<th align="center">总分</th>
</tr>
</thead>
<tbody><tr>
<td align="center">Speciale</td>
<td align="center">3</td>
<td align="center">-</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">2</td>
<td align="center">2</td>
<td align="center">-</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">10/12</td>
</tr>
</tbody></table>
<p>ICPC WF 2025 第 2 名/金牌. 在 12 题中解出 10 题, 仅 B 和 G 未解出. 每道题后的数字表示成功解题所需的提交次数——例如 P1 需要 3 次提交才通过, 说明模型在首次提交时存在边界情况错误或算法缺陷, 需要通过多次尝试修正.</p>
<blockquote>
<p>译者注(局限风险): 提交次数数据揭示了 Speciale 的一个工程弱点——「调试效率」. P1 需要 3 次提交、P5 需要 2 次提交, 这意味着模型在首次编码后无法准确预判所有边界情况. 与人类选手相比, 顶级 ICPC 选手通常在 1-2 次提交内通过简单题. 这种「试错式」解题策略在真实竞赛中风险很高: ICPC 的罚时规则是「每次错误提交增加 20 分钟罚时」, 如果模型在难题上反复提交错误答案, 罚时累积可能导致排名大幅下降. 此外, B 和 G 的未解出说明 Speciale 在特定算法类型(如高级图论、复杂动态规划)上仍有知识盲区.</p>
</blockquote>
<h3 id="3-4-zgsxalpk-cmo-2025">3.4 中国数学奥林匹克(CMO 2025)</h3>
<table>
<thead>
<tr>
<th align="center">题目</th>
<th align="center">P1</th>
<th align="center">P2</th>
<th align="center">P3</th>
<th align="center">P4</th>
<th align="center">P5</th>
<th align="center">P6</th>
<th align="center">总分</th>
</tr>
</thead>
<tbody><tr>
<td align="center">满分</td>
<td align="center">21</td>
<td align="center">21</td>
<td align="center">21</td>
<td align="center">21</td>
<td align="center">21</td>
<td align="center">21</td>
<td align="center">126</td>
</tr>
<tr>
<td align="center">Speciale</td>
<td align="center">18</td>
<td align="center">18</td>
<td align="center">9</td>
<td align="center">21</td>
<td align="center">18</td>
<td align="center">18</td>
<td align="center">102</td>
</tr>
</tbody></table>
<p>CMO 2025 金牌(102/126). P3 仅得 9/21 分, 这是最大的失分点. CMO P3 通常是一道高难度的组合或数论题, 需要极其巧妙的构造或深刻的数学洞察.</p>
<hr>
<h2 id="4-jspxyxlpffx">4 技术谱系与训练配方分析</h2>
<h3 id="4-1-c-r1-d-speciale-dyj">4.1 从 R1 到 Speciale 的演进</h3>
<pre><code>DeepSeek-R1 (2025-01)
  |
  +--&gt; 纯 RL 激发推理能力, R1-Zero 自发涌现长 CoT
       |
       +--&gt; DeepSeek-V3.2 (2025-12)
            |     混合 RL: 推理 + 智能体 + 对齐
            |     长度惩罚: 严格(控制成本)
            |     目标: 产品级通用模型
            |
            +--&gt; DeepSeek-V3.2-Speciale (2025-12)
                  单一 RL: 仅推理数据
                  长度惩罚: 宽松(允许扩展思考)
                  目标: 极限推理能力
</code></pre>
<h3 id="4-2-speciale-xlpfdkfxx">4.2 Speciale 训练配方的可复现性</h3>
<p>基于技术报告披露的信息, Speciale 的训练配方可以总结为:</p>
<ol>
<li><strong>基座Checkpoint</strong>: DeepSeek-V3.2 基座(已包含 DSA 稀疏注意力)</li>
<li><strong>数据</strong>: 仅推理数据(数学、编程、逻辑), 排除智能体和对齐数据</li>
<li><strong>RL 算法</strong>: GRPO, 长度惩罚减弱</li>
<li><strong>增强数据</strong>: DeepSeekMath-V2 数据集 + 奖励方法</li>
<li><strong>训练规模</strong>: 数千步持续 RL(与标准版相同量级)</li>
</ol>
<blockquote>
<p>译者注(局限风险): 技术报告对 Speciale 的训练细节披露非常有限. 我们不知道: (1) 长度惩罚的具体数值(标准版是多少, Speciale 减到了多少); (2) 推理数据的精确构成(多少数学、多少编程、多少逻辑); (3) DeepSeekMath-V2 数据集的规模和融入方式; (4) RL 训练的总计算量(FLOPs 或 GPU-hours). 这些信息的缺失使得独立复现 Speciale 变得困难. 尤其关键的是「长度惩罚的数值」——这是控制推理成本-质量权衡的核心超参数, 其最优值可能与具体任务强相关.</p>
</blockquote>
<hr>
<h2 id="5-sjbssj">5 实际部署视角</h2>
<h3 id="5-1-cb-xnqh">5.1 成本-性能权衡</h3>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐模型</th>
<th align="left">原因</th>
</tr>
</thead>
<tbody><tr>
<td align="left">日常对话/通用任务</td>
<td align="left">V3.2 (non-thinking)</td>
<td align="left">Token 效率高, 成本低</td>
</tr>
<tr>
<td align="left">复杂推理/数学/编程</td>
<td align="left">V3.2-Thinking</td>
<td align="left">平衡性能与成本</td>
</tr>
<tr>
<td align="left">竞赛级极限挑战</td>
<td align="left">V3.2-Speciale</td>
<td align="left">最高准确率, 但成本也高</td>
</tr>
<tr>
<td align="left">智能体/工具调用</td>
<td align="left">V3.2-Thinking</td>
<td align="left">Speciale 未训练智能体能力</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 不同场景下的模型选择建议.</p>
</blockquote>
<h3 id="5-2-y-gemini-3-0-pro-djzgj">5.2 与 Gemini-3.0-Pro 的竞争格局</h3>
<p>Speciale 在极限推理场景中与 Gemini-3.0-Pro 形成了直接竞争:</p>
<ul>
<li><strong>数学</strong>: Speciale 在 HMMT Feb(99.2%)和 IMOAnswerBench(84.5%)上超越 Gemini-3.0-Pro(97.5% / 83.3%).</li>
<li><strong>编程</strong>: Codeforces Rating 几乎持平(2701 vs 2708).</li>
<li><strong>效率</strong>: Gemini-3.0-Pro 的 Token 效率显著更高(约 3-4 倍).</li>
<li><strong>成本</strong>: 按公开 API 定价, Speciale 的推理成本约为 Gemini-3.0-Pro 的 1/5-1/10.</li>
</ul>
<p>这意味着 Speciale 提供了一个「低成本极限推理」的选择——虽然在效率上不如 Gemini, 但在总成本上具有显著优势, 且准确率已达到同等水平.</p>
<hr>
<h2 id="6-zj">6 总结</h2>
<p>DeepSeek-V3.2-Speciale 代表了开源模型在极限推理能力上的重要里程碑. 通过「去混合化」的后训练策略——仅聚焦推理数据、放宽长度约束、增强数学证明——Speciale 在多项顶级数学和编程竞赛中达到金牌级表现, 并在多个基准上首次超越顶级闭源模型 Gemini-3.0-Pro.</p>
<p>然而, 这种极限性能是以显著的 Token 效率为代价的. Speciale 的推理 Token 消耗是 Gemini-3.0-Pro 的 2-4 倍, 这意味着其「智能密度」(每 Token 的信息产出)仍有较大提升空间. 未来的关键方向包括: (1) 通过更好的推理策略压缩思维链长度; (2) 探索测试时计算的串行-并行最优组合; (3) 将 Speciale 的推理能力蒸馏到更小的模型中.</p>
<blockquote>
<p>译者注(技术谱系): Speciale 的出现标志着开源模型竞争进入了一个新阶段——不再仅仅是「追赶闭源」, 而是在特定维度上「超越闭源」. 这种「专项超越」策略的意义在于: 它证明了开源社区可以通过聚焦单一能力、集中优化资源, 在特定领域达到甚至超越商业巨头的水平. 这与 Linux 在服务器领域的胜利逻辑相似——不是全面超越 Windows, 而是在关键维度上做到最好. 对于研究社区而言, Speciale 的训练配方(虽然细节未完全公开)提供了一个重要的研究方向: 如何在保持通用能力的同时, 通过低成本的后训练特化产出领域专家模型.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-speciale-dxlffcy","text":"1 Speciale 的训练方法差异"},{"level":2,"id":"2-jxtlxncj","text":"2 极限推理性能拆解"},{"level":3,"id":"2-1-sxtljz","text":"2.1 数学推理基准"},{"level":3,"id":"2-2-bctljz","text":"2.2 编程推理基准"},{"level":3,"id":"2-3-token-xsfx","text":"2.3 Token 效率分析"},{"level":2,"id":"3-djjsbxsdfx","text":"3 顶级竞赛表现深度分析"},{"level":3,"id":"3-1-gjsxalpk-imo-2025","text":"3.1 国际数学奥林匹克(IMO 2025)"},{"level":3,"id":"3-2-gjxxxalpk-ioi-2025","text":"3.2 国际信息学奥林匹克(IOI 2025)"},{"level":3,"id":"3-3-icpc-sjzjs-icpc-wf-2025","text":"3.3 ICPC 世界总决赛(ICPC WF 2025)"},{"level":3,"id":"3-4-zgsxalpk-cmo-2025","text":"3.4 中国数学奥林匹克(CMO 2025)"},{"level":2,"id":"4-jspxyxlpffx","text":"4 技术谱系与训练配方分析"},{"level":3,"id":"4-1-c-r1-d-speciale-dyj","text":"4.1 从 R1 到 Speciale 的演进"},{"level":3,"id":"4-2-speciale-xlpfdkfxx","text":"4.2 Speciale 训练配方的可复现性"},{"level":2,"id":"5-sjbssj","text":"5 实际部署视角"},{"level":3,"id":"5-1-cb-xnqh","text":"5.1 成本-性能权衡"},{"level":3,"id":"5-2-y-gemini-3-0-pro-djzgj","text":"5.2 与 Gemini-3.0-Pro 的竞争格局"},{"level":2,"id":"6-zj","text":"6 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-speciale-jxtlpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-speciale-jxtlpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.2-Speciale 极限推理剖析</h1>
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
