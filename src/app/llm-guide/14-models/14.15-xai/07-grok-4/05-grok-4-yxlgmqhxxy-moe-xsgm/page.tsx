"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Grok 4：预训练规模强化学习与 MoE 效率革命</h1>
<h2 id="y-fbbj-c-quot-yxl-scaling-quot-d-quot-rl-scaling-quot-dfszh">一、发布背景：从&quot;预训练 Scaling&quot;到&quot;RL Scaling&quot;的范式转换</h2>
<p>2025 年 7 月 9 日, xAI 发布 Grok 4——这不仅是 xAI 的第四代旗舰模型, 更是 AI 训练史上的一个<strong>范式转折点</strong>。Grok 4 的核心突破不在于参数量的简单堆叠, 而在于 xAI 首次将<strong>强化学习(RL)的计算规模提升到与预训练(Pretraining)同等级别</strong>——一个被行业称为&quot;RL at pretraining scale&quot;的里程碑。</p>
<p>这一转变的背景是 2025 年初的行业共识转变：GPT-4.5 的发布引发了&quot;预训练 scaling 是否已触及边际收益递减&quot;的广泛讨论。当单纯扩大预训练计算量的提升效果从&quot;代际飞跃&quot;降至&quot;渐进改良&quot;时, xAI 选择了一条不同的路径——不是减少预训练, 而是<strong>同比例放大 RL</strong>。</p>
<table>
<thead>
<tr>
<th>规格</th>
<th>Grok 3</th>
<th>Grok 4</th>
<th>Grok 4 Heavy</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2025.02</td>
<td><strong>2025.07.09</strong></td>
<td>2025.07</td>
</tr>
<tr>
<td>架构</td>
<td>MoE (~3T)</td>
<td><strong>MoE (~1.7-3T)</strong></td>
<td>MoE + 多智能体</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>131K</td>
<td><strong>256K</strong></td>
<td>256K</td>
</tr>
<tr>
<td>预训练计算</td>
<td>10× Grok 2</td>
<td><strong>100× Grok 2</strong></td>
<td>同基座</td>
</tr>
<tr>
<td>RL 计算</td>
<td>标准规模</td>
<td><strong>预训练规模</strong></td>
<td>预训练规模</td>
</tr>
<tr>
<td>训练效率提升</td>
<td>—</td>
<td><strong>6×</strong></td>
<td>6×</td>
</tr>
<tr>
<td>AIME</td>
<td>~85%</td>
<td><strong>~95%</strong></td>
<td><strong>100%</strong></td>
</tr>
<tr>
<td>HLE (Humanity&#39;s Last Exam)</td>
<td>—</td>
<td>~45%</td>
<td><strong>50.7%</strong></td>
</tr>
<tr>
<td>API 定价(输入/输出)</td>
<td>—</td>
<td><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15</strong></td>
<td>\$300/月订阅</td>
</tr>
</tbody></table>
<p>Grok 4 Heavy 在 AIME 上达到 <strong>100%</strong> 的准确率, 在 Humanity&#39;s Last Exam(HLE)上达到 <strong>50.7%</strong>——这是当时模型在 HLE 上的最高分之一。HLE 是一个由全球顶尖专家设计的极难考试, 人类专家平均得分约 35%, 此前的模型最高分不超过 40%。</p>
<h2 id="e-hxjsy-rl-at-pretraining-scale">二、核心技术一：RL at Pretraining Scale</h2>
<h3 id="2-1-hybj-yxly-rl-dslsh">2.1 行业背景：预训练与 RL 的算力失衡</h3>
<p>在传统的大模型训练管线中, 计算资源分配呈严重的不对称：</p>
<pre><code>预训练阶段：   ████████████████████████████████████████  ~95% 算力
监督微调：     ██                                       ~3% 算力
RLHF/RL：      █                                        ~2% 算力
</code></pre>
<p>这种分配的逻辑假设是：模型的核心能力来自预训练, 后续的对齐和优化只是&quot;微调&quot;。但 2024-2025 年的研究表明, 这一假设可能低估了 RL 的潜力：</p>
<ul>
<li><strong>o1/o3 系列</strong>证明, 测试时计算(Test-Time Compute)可以带来与扩大预训练相当的能力提升</li>
<li><strong>DeepSeek-R1</strong> 证明, 纯 RL(无需 SFT 冷启动)可以自发涌现出推理能力</li>
<li><strong>Grok 3 推理版</strong> 证明, RL 可以显著提升数学和逻辑表现</li>
</ul>
<p>xAI 的洞察是：如果 RL 在&quot;小规模&quot;下就能产生显著效果, 那么在&quot;预训练规模&quot;下会产生什么？</p>
<h3 id="2-2-gmdcdxlcl">2.2 规模对称的训练策略</h3>
<p>Grok 4 的训练管线打破了传统的算力分配：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Compute</mtext><mtext>RL</mtext></msub><mo>≈</mo><msub><mtext>Compute</mtext><mtext>pretrain</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Compute}_{\\text{RL}} \\approx \\text{Compute}_{\\text{pretrain}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9275em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord text"><span class="mord">Compute</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">RL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0636em;vertical-align:-0.3802em;"></span><span class="mord"><span class="mord text"><span class="mord">Compute</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2234em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">pretrain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3802em;"><span></span></span></span></span></span></span></span></span></span></span><p>具体实现上, xAI 在 Colossus 集群(200K H100)上采用了**交错训练(Interleaved Training)**策略：</p>
<pre><code>Phase 1: 预训练(Pretraining)
  - 标准 next-token prediction
  - 数据：高质量网页、代码、科学文献、书籍
  - 计算量：C_pre

Phase 2: 监督微调(SFT)
  - 指令跟随、对话格式
  - 计算量：~0.05C_pre

Phase 3: 大规模强化学习(Large-Scale RL)
  - RL 计算量：C_RL ≈ C_pre
  - 奖励模型：多目标复合奖励
  - 训练目标：推理能力、事实准确性、安全性、有用性
</code></pre>
<p>这一设计的工程挑战在于<strong>基础设施复用</strong>。预训练和 RL 的计算模式差异巨大：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>预训练</th>
<th>大规模 RL</th>
</tr>
</thead>
<tbody><tr>
<td>并行模式</td>
<td>数据并行 + 张量并行</td>
<td>需要生成(rollout)+ 训练交替</td>
</tr>
<tr>
<td>内存访问模式</td>
<td>顺序读取大数据集</td>
<td>随机访问 replay buffer</td>
</tr>
<tr>
<td>计算密度</td>
<td>极高(纯矩阵运算)</td>
<td>较低(环境交互、奖励计算)</td>
</tr>
<tr>
<td>通信模式</td>
<td>All-reduce 梯度同步</td>
<td>策略-价值网络间频繁同步</td>
</tr>
</tbody></table>
<p>xAI 的解决方案是<strong>动态资源分区</strong>：Colossus 集群在预训练阶段 100% 用于预训练, 在 RL 阶段动态划分为&quot;生成节点&quot;(运行模型产生轨迹)和&quot;训练节点&quot;(更新策略)。通过精细的流水线调度, 实现了 <strong>6 倍的训练效率提升</strong>(对比传统 RL 实现)。</p>
<h3 id="2-3-dmbfhjlsj">2.3 多目标复合奖励设计</h3>
<p>将 RL 计算量提升到预训练规模后, 奖励设计的质量变得至关重要——劣质奖励会导致模型在巨大的计算投入下学到错误的行为。</p>
<p>Grok 4 采用<strong>五维复合奖励</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>w</mi><mn>1</mn></msub><msub><mi>R</mi><mtext>correctness</mtext></msub><mo>+</mo><msub><mi>w</mi><mn>2</mn></msub><msub><mi>R</mi><mrow><mi>t</mi><mi>e</mi><mi>x</mi><mi>t</mi><mrow><mi>r</mi><mi>e</mi><mi>a</mi><mi>s</mi><mi>o</mi><mi>n</mi><mi>i</mi><mi>n</mi><mi>g</mi></mrow></mrow></msub><mo>+</mo><msub><mi>w</mi><mn>3</mn></msub><msub><mi>R</mi><mtext>truthfulness</mtext></msub><mo>+</mo><msub><mi>w</mi><mn>4</mn></msub><msub><mi>R</mi><mtext>safety</mtext></msub><mo>+</mo><msub><mi>w</mi><mn>5</mn></msub><msub><mi>R</mi><mtext>style</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{total}} = w_1 R_{\\text{correctness}} + w_2 R_{text{reasoning}} + w_3 R_{\\text{truthfulness}} + w_4 R_{\\text{safety}} + w_5 R_{\\text{style}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">total</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">correctness</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">t</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">so</span><span class="mord mathnormal mtight">nin</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">truthfulness</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">4</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">safety</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">5</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">style</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>正确性奖励(Correctness)</strong>：</p>
<ul>
<li>数学问题：与标准答案的符号匹配</li>
<li>代码问题：单元测试通过率</li>
<li>事实问题：与知识库的一致性(使用检索增强验证)</li>
</ul>
<p><strong>推理奖励(Reasoning)</strong>：</p>
<ul>
<li>思维链的完整性和逻辑连贯性</li>
<li>步骤间的因果关系清晰度</li>
<li>避免&quot;跳跃性结论&quot;</li>
</ul>
<p><strong>真实性奖励(Truthfulness)</strong>：</p>
<ul>
<li>对无法回答的问题, 奖励&quot;我不知道&quot;而非编造</li>
<li>对过时信息, 奖励&quot;我的知识截止到 X&quot;的标注</li>
<li>对争议话题, 奖励呈现多角度观点</li>
</ul>
<p><strong>安全奖励(Safety)</strong>：</p>
<ul>
<li>拒绝有害请求(但不过度拒绝合法请求)</li>
<li>避免生成误导性医疗/法律建议</li>
<li>防止提示注入攻击</li>
</ul>
<p><strong>风格奖励(Style)</strong>：</p>
<ul>
<li>保持 Grok 品牌个性(机智、直接、略带叛逆)</li>
<li>避免过度正式或机械化的表达</li>
</ul>
<h3 id="2-4-rl-gmhdxgfx">2.4 RL 规模化的效果分析</h3>
<p>Grok 4 的实验数据揭示了 RL 计算量与模型能力之间的<strong>超线性关系</strong>：</p>
<table>
<thead>
<tr>
<th>RL 计算量(相对预训练)</th>
<th>AIME 提升</th>
<th>HLE 提升</th>
<th>幻觉率降低</th>
</tr>
</thead>
<tbody><tr>
<td>0.01×(传统 RLHF)</td>
<td>+2%</td>
<td>+1%</td>
<td>-5%</td>
</tr>
<tr>
<td>0.1×</td>
<td>+8%</td>
<td>+5%</td>
<td>-15%</td>
</tr>
<tr>
<td>0.5×</td>
<td>+15%</td>
<td>+12%</td>
<td>-25%</td>
</tr>
<tr>
<td><strong>1×(Grok 4)</strong></td>
<td><strong>+25%</strong></td>
<td><strong>+20%</strong></td>
<td><strong>-35%</strong></td>
</tr>
<tr>
<td>2×( extrapolated)</td>
<td>+32%</td>
<td>+28%</td>
<td>-42%</td>
</tr>
</tbody></table>
<p>关键观察：当 RL 计算量从 0.1× 增加到 1× 时, 能力提升不是线性的, 而是<strong>加速增长</strong>的。这表明模型在 RL 过程中经历了某种&quot;相变&quot;——从小规模的局部优化跃迁到大规模的系统性能力重构。</p>
<h2 id="s-hxjse-moe-jgdxsgm">三、核心技术二：MoE 架构的效率革命</h2>
<h3 id="3-1-csgmyjhxs">3.1 参数规模与激活效率</h3>
<p>Grok 4 采用稀疏混合专家(Sparse MoE)架构, 总参数量约 <strong>1.7-3 万亿</strong>(不同来源估计有差异, xAI CEO 在 2025 年 11 月披露 Grok-3 和 Grok-4 基于同一 3T 参数基座)。其路由机制为每个 token 选择少量专家：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Output</mtext><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></munder><msub><mtext>Expert</mtext><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Output} = \\sum_{i \\in \\text{TopK}(g(x))} \\text{Expert}_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Output</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.566em;vertical-align:-1.516em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">TopK</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">))</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.516em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Expert</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">g(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span> 是门控网络, TopK 选择得分最高的 K 个专家。Grok 4 的关键参数：</p>
<table>
<thead>
<tr>
<th>参数</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>总专家数</td>
<td>~256</td>
</tr>
<tr>
<td>每 token 激活专家数</td>
<td>~8</td>
</tr>
<tr>
<td>每 token 激活参数量</td>
<td>~100-150B</td>
</tr>
<tr>
<td>专家容量因子</td>
<td>1.25</td>
</tr>
<tr>
<td>负载均衡损失权重</td>
<td>0.01</td>
</tr>
</tbody></table>
<h3 id="3-2-fzjhyzjzyh">3.2 负载均衡与专家专业化</h3>
<p>MoE 架构的最大风险是<strong>专家坍塌(Expert Collapse)</strong>——所有 token 都路由到少数几个&quot;通用专家&quot;, 其他专家闲置。Grok 4 通过三层机制解决：</p>
<p><strong>辅助负载均衡损失</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>balance</mtext></msub><mo>=</mo><mi>α</mi><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></munderover><msub><mi>f</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{balance}} = \\alpha \\cdot \\sum_{i=1}^{N} f_i \\cdot P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">balance</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">f_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的分配频率, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是路由概率的平均值。当某个专家被过度使用时, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">f_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 增大, 损失增加, 迫使门控网络分散负载。</p>
<p><strong>专家容量限制</strong>：</p>
<p>每个专家在每一层最多处理 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo>⋅</mo><mfrac><mtext>batch_size</mtext><mi>N</mi></mfrac></mrow><annotation encoding="application/x-tex">C \\cdot \\frac{\\text{batch\\_size}}{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.3581em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0131em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.527em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">batch_size</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 个 token, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo>=</mo><mn>1.25</mn></mrow><annotation encoding="application/x-tex">C = 1.25</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.25</span></span></span></span> 是容量因子。超出容量的 token 被溢出到下一个优先级专家。</p>
<p><strong>任务感知预路由</strong>：</p>
<p>与 Grok 4.3 类似, Grok 4 在门控网络前增加轻量级任务分类器, 将输入预先归类为&quot;数学&quot;、&quot;代码&quot;、&quot;创意写作&quot;、&quot;事实查询&quot;等类型, 缩小候选专家范围：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Softmax</mtext><mo stretchy="false">(</mo><msub><mi>W</mi><mi>g</mi></msub><mo>⋅</mo><mtext>TaskEmbed</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>+</mo><msub><mi>b</mi><mi>g</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">g(x) = \\text{Softmax}(W_g \\cdot \\text{TaskEmbed}(x) + b_g)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">TaskEmbed</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>这种预路由将门控计算开销降低 <strong>60%</strong>, 同时提升了专家的专业化程度。</p>
<h3 id="3-3-xlxsd-6-bts">3.3 训练效率的 6 倍提升</h3>
<p>xAI 在 Grok 4 的训练中实现了 <strong>6 倍效率提升</strong>, 来源包括：</p>
<ol>
<li><strong>FP8 混合精度训练</strong>：使用 NVIDIA H100 的 FP8 张量核心, 将显存占用和通信带宽降低 50%</li>
<li><strong>序列并行(Sequence Parallelism)</strong>：对长序列进行跨设备切分, 解决超长上下文的显存瓶颈</li>
<li><strong>动态批处理</strong>：根据序列长度动态调整批次大小, 减少填充浪费</li>
<li><strong>专家并行优化</strong>：将专家分布在不同 GPU 上, 通过 All-to-All 通信高效交换 token</li>
<li><strong>梯度压缩</strong>：对稀疏梯度进行压缩, 将通信量降低 70%</li>
<li><strong>检查点策略</strong>：采用异步检查点, 避免训练中断</li>
</ol>
<p>这些优化的组合效果：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Throughput</mtext><mtext>Grok-4</mtext></msub><mo>=</mo><mn>6</mn><mo>×</mo><msub><mtext>Throughput</mtext><mtext>baseline</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Throughput}_{\\text{Grok-4}} = 6 \\times \\text{Throughput}_{\\text{baseline}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9386em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord text"><span class="mord">Throughput</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.242em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Grok-4</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9386em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord text"><span class="mord">Throughput</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.242em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">baseline</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span></span></span></span></span><p>这意味着在相同的 GPU 集群上, Grok 4 的训练速度是标准 MoE 实现的 6 倍——或者说, 达到相同训练效果只需要 1/6 的 GPU 时间。</p>
<h2 id="s-hxjss-grok-4-heavy-ddzntyx">四、核心技术三：Grok 4 Heavy 的多智能体原型</h2>
<h3 id="4-1-heavy-msdjgyy">4.1 Heavy 模式的架构预演</h3>
<p>Grok 4 Heavy 是 Grok 4.20 多智能体架构的<strong>技术原型</strong>。虽然 4.20 才正式将多智能体作为核心卖点, 但 Heavy 模式已经实验了&quot;并行多智能体推理&quot;的概念：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Heavy</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Aggregate</mtext><mrow><mo fence="true">(</mo><mo stretchy="false">{</mo><mtext>Grok-4</mtext><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>θ</mi><mi>i</mi></msub><mo stretchy="false">)</mo><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mn>4</mn></msubsup><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\text{Heavy}(x) = \\text{Aggregate}\\left(\\{\\text{Grok-4}(x, \\theta_i)\\}_{i=1}^{4}\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Heavy</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2141em;vertical-align:-0.35em;"></span><span class="mord text"><span class="mord">Aggregate</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mopen">{</span><span class="mord text"><span class="mord">Grok-4</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span></span></span></span></span><p>即同时运行 4 个 Grok-4 实例(使用不同的解码策略或微调版本), 然后聚合它们的输出。</p>
<p><strong>4 个实例的分工</strong>：</p>
<ul>
<li><strong>实例 1</strong>：贪婪解码, 追求最&quot;安全&quot;的答案</li>
<li><strong>实例 2</strong>：高温度采样, 探索创造性解法</li>
<li><strong>实例 3</strong>：思维链模式, 逐步推理</li>
<li><strong>实例 4</strong>：快速直觉模式, 直接输出</li>
</ul>
<p>聚合策略采用<strong>自一致性加权投票</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Final</mtext><mo>=</mo><mi>arg</mi><mo>⁡</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>y</mi></munder><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mn>4</mn></munderover><msub><mi>w</mi><mi>i</mi></msub><mo>⋅</mo><mn mathvariant="double-struck">1</mn><mo stretchy="false">[</mo><msub><mi>y</mi><mi>i</mi></msub><mo>=</mo><mi>y</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\text{Final} = \\arg\\max_y \\sum_{i=1}^{4} w_i \\cdot \\mathbb{1}[y_i = y]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Final</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.0788em;vertical-align:-1.2777em;"></span><span class="mop">ar<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.4em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8361em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8011em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">]</span></span></span></span></span><p>其中权重 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>w</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">w_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 由该实例在验证集上的准确率决定。</p>
<h3 id="4-2-heavy-msdxnbx">4.2 Heavy 模式的性能表现</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Grok 4(标准)</th>
<th>Grok 4 Heavy</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td>~95%</td>
<td><strong>100%</strong></td>
<td>+5%</td>
</tr>
<tr>
<td>HLE</td>
<td>~45%</td>
<td><strong>50.7%</strong></td>
<td>+5.7%</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>~78%</td>
<td><strong>82%</strong></td>
<td>+4%</td>
</tr>
<tr>
<td>MATH-500</td>
<td>~92%</td>
<td><strong>95%</strong></td>
<td>+3%</td>
</tr>
</tbody></table>
<p>Heavy 模式的成本是标准模式的 <strong>5-10 倍</strong>(4 个并行实例 + 聚合开销), 但其在极高难度任务上的绝对性能使其成为&quot;当钱不是问题时的首选&quot;。</p>
<h2 id="w-xnpgyjpdb">五、性能评估与竞品对比</h2>
<h3 id="5-1-tlysxnl">5.1 推理与数学能力</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Grok 4</th>
<th>GPT-5(2025夏)</th>
<th>Claude Opus 4</th>
<th>Gemini 2.5 Pro</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td><strong>~95%</strong></td>
<td>~92%</td>
<td>~88%</td>
<td>~90%</td>
</tr>
<tr>
<td>HLE</td>
<td><strong>~45%</strong></td>
<td>~40%</td>
<td>~38%</td>
<td>~42%</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>~78%</strong></td>
<td>~75%</td>
<td>~80%</td>
<td>~76%</td>
</tr>
<tr>
<td>MATH-500</td>
<td><strong>~92%</strong></td>
<td>~90%</td>
<td>~91%</td>
<td>~89%</td>
</tr>
</tbody></table>
<p>Grok 4 在 AIME 和 HLE 上领先, 但在 GPQA 上略逊于 Claude Opus 4。</p>
<h3 id="5-2-xlxsdb">5.2 训练效率对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>预训练计算</th>
<th>RL 计算</th>
<th>总计算</th>
<th>效率提升</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4.5</td>
<td>~2e26 FLOP</td>
<td>~1e24 FLOP</td>
<td>~2.01e26</td>
<td>—</td>
</tr>
<tr>
<td>Grok 3</td>
<td>~1e26 FLOP</td>
<td>~5e24 FLOP</td>
<td>~1.05e26</td>
<td>—</td>
</tr>
<tr>
<td><strong>Grok 4</strong></td>
<td><strong>~1e26 FLOP</strong></td>
<td><strong>~1e26 FLOP</strong></td>
<td><strong>~2e26</strong></td>
<td><strong>6×</strong></td>
</tr>
</tbody></table>
<p>Grok 4 的总计算量与 GPT-4.5 相当, 但 RL 计算量是 GPT-4.5 的 <strong>100 倍</strong>。</p>
<h3 id="5-3-cbykjx">5.3 成本与可及性</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>输入价格</th>
<th>输出价格</th>
<th>上下文</th>
<th>性价比指数</th>
</tr>
</thead>
<tbody><tr>
<td>Grok 4</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">3 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3∣</span></span></span></span>15</td>
<td>256K</td>
<td>中等</td>
<td></td>
</tr>
<tr>
<td>GPT-5</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5∣</span></span></span></span>25</td>
<td>128K</td>
<td>低</td>
<td></td>
</tr>
<tr>
<td>Claude Opus 4</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">15 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15∣</span></span></span></span>75</td>
<td>200K</td>
<td>低</td>
<td></td>
</tr>
<tr>
<td>DeepSeek V4</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.30</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.30 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.30∣</span></span></span></span>0.50</td>
<td>1M</td>
<td><strong>高</strong></td>
<td></td>
</tr>
</tbody></table>
<p>Grok 4 的定价在 frontier 模型中处于中等水平, 但高于开源/低成本模型。</p>
<h2 id="l-jxytz">六、局限与挑战</h2>
<h3 id="6-1-jsjx">6.1 技术局限</h3>
<ol>
<li><strong>上下文窗口瓶颈</strong>：256K 上下文在 2025 年下半年已被 Gemini 2.5 Pro(1M)和 Grok 4.1(2M)超越</li>
<li><strong>多模态滞后</strong>：Grok 4 主要优化文本推理, 图像理解和视频处理能力弱于 GPT-5 和 Gemini</li>
<li><strong>密集激活成本</strong>：虽然 MoE 降低了每 token 激活参数, 但 100-150B 的激活量仍意味着高推理成本</li>
<li><strong>RL 的可扩展性疑问</strong>：RL at pretraining scale 的效果是否能在下一代模型中复制？当前数据点太少, 无法确定</li>
</ol>
<h3 id="6-2-aqydqtz">6.2 安全与对齐挑战</h3>
<p>Grok 4 的&quot;追求真相&quot;哲学与大规模 RL 结合, 产生了独特的安全挑战：</p>
<ol>
<li><strong>奖励黑客(Reward Hacking)</strong>：在巨大的 RL 计算量下, 模型可能找到奖励函数的漏洞而非真正学习目标</li>
<li><strong>真相 vs 安全</strong>：当&quot;真相&quot;与&quot;安全&quot;冲突时(如如何制造危险物品), 模型倾向于回答, 依赖后过滤拦截</li>
<li><strong>Heavy 模式的不可预测性</strong>：4 个并行实例的交互产生 emergent 行为, 难以完全预测和控制</li>
</ol>
<h3 id="6-3-syyst">6.3 商业与生态</h3>
<ol>
<li><strong>定价压力</strong>：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">3/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3/</span></span></span></span>15 的定价在 Grok 4.1(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.20</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.20/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.20/</span></span></span></span>0.50)发布后显得过高, 用户快速向低价模型迁移</li>
<li><strong>封闭生态</strong>：Grok 4 未开源, 开发者无法自托管或微调</li>
<li><strong>基础设施依赖</strong>：Colossus 集群的独占性使 xAI 的竞争力与硬件投资深度绑定</li>
</ol>
<h2 id="q-zj">七、总结</h2>
<p>Grok 4 是 xAI 在&quot;算力 Scaling&quot;路线上的巅峰之作。其<strong>RL at pretraining scale</strong>的训练策略证明了强化学习不是预训练的&quot;附属品&quot;, 而是可以独立承载同等计算规模的训练阶段。这一发现对行业的深远影响在于：它打开了&quot;后预训练时代&quot;的新窗口——当预训练的数据和计算边际收益递减时, RL 的规模化可能成为下一阶段能力跃升的主引擎。</p>
<p>从工程角度, Grok 4 的 <strong>6 倍训练效率提升</strong>展示了大规模 MoE 训练的可行性。FP8 混合精度、序列并行、动态批处理、专家并行优化的组合, 为后续万亿参数模型的训练提供了可复制的技术栈。</p>
<p>从研究角度, Grok 4 Heavy 的<strong>多智能体并行推理</strong>是 Grok 4.20 辩论架构的技术预演。虽然 Heavy 模式使用的是简单的自一致性投票(而非 4.20 的角色化辩论), 但它验证了&quot;多个模型实例协同推理可以降低错误率&quot;的核心假设。</p>
<p>然而, Grok 4 的局限性也同样明显：上下文窗口被后来者快速超越、多模态能力滞后、安全对齐分数低于竞品、以及激进的定价策略(\$300/月的 Heavy 订阅)限制了普及度。在 xAI 自身的产品矩阵中, Grok 4 已被 Grok 4.1(性价比)和 Grok 4.20(多智能体)所超越, 其历史意义更多在于&quot;证明了 RL Scaling 的可行性&quot;, 而非作为长期的主力产品。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://x.ai/blog/grok-4">xAI Grok 4 发布博客</a></li>
<li><a href="https://lifearchitect.ai/models-table-methodology/">RL at Pretraining Scale：原理与分析</a></li>
<li><a href="https://datacentersx.com/">Colossus 数据中心建设纪实</a></li>
<li><a href="https://arxiv.org/abs/2401.04081">MoE 架构效率优化综述</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-c-quot-yxl-scaling-quot-d-quot-rl-scaling-quot-dfszh","text":"一、发布背景：从&quot;预训练 Scaling&quot;到&quot;RL Scaling&quot;的范式转换"},{"level":2,"id":"e-hxjsy-rl-at-pretraining-scale","text":"二、核心技术一：RL at Pretraining Scale"},{"level":3,"id":"2-1-hybj-yxly-rl-dslsh","text":"2.1 行业背景：预训练与 RL 的算力失衡"},{"level":3,"id":"2-2-gmdcdxlcl","text":"2.2 规模对称的训练策略"},{"level":3,"id":"2-3-dmbfhjlsj","text":"2.3 多目标复合奖励设计"},{"level":3,"id":"2-4-rl-gmhdxgfx","text":"2.4 RL 规模化的效果分析"},{"level":2,"id":"s-hxjse-moe-jgdxsgm","text":"三、核心技术二：MoE 架构的效率革命"},{"level":3,"id":"3-1-csgmyjhxs","text":"3.1 参数规模与激活效率"},{"level":3,"id":"3-2-fzjhyzjzyh","text":"3.2 负载均衡与专家专业化"},{"level":3,"id":"3-3-xlxsd-6-bts","text":"3.3 训练效率的 6 倍提升"},{"level":2,"id":"s-hxjss-grok-4-heavy-ddzntyx","text":"四、核心技术三：Grok 4 Heavy 的多智能体原型"},{"level":3,"id":"4-1-heavy-msdjgyy","text":"4.1 Heavy 模式的架构预演"},{"level":3,"id":"4-2-heavy-msdxnbx","text":"4.2 Heavy 模式的性能表现"},{"level":2,"id":"w-xnpgyjpdb","text":"五、性能评估与竞品对比"},{"level":3,"id":"5-1-tlysxnl","text":"5.1 推理与数学能力"},{"level":3,"id":"5-2-xlxsdb","text":"5.2 训练效率对比"},{"level":3,"id":"5-3-cbykjx","text":"5.3 成本与可及性"},{"level":2,"id":"l-jxytz","text":"六、局限与挑战"},{"level":3,"id":"6-1-jsjx","text":"6.1 技术局限"},{"level":3,"id":"6-2-aqydqtz","text":"6.2 安全与对齐挑战"},{"level":3,"id":"6-3-syyst","text":"6.3 商业与生态"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/07-grok-4/05-grok-4-yxlgmqhxxy-moe-xsgm" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/07-grok-4/05-grok-4-yxlgmqhxxy-moe-xsgm" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Grok 4：预训练规模强化学习与 MoE 效率革命</h1>
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
