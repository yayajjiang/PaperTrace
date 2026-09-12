"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>o1：测试时计算扩展与隐藏链式思维</h1>
<blockquote>
<p><strong>模型定位</strong>：OpenAI 首个推理专用模型系列(2024-09)，开创&quot;测试时计算扩展&quot;新范式
<strong>家族归属</strong>：14.12-OpenAI｜编号 13-o1
🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="y-fbbjyzlyy">一、发布背景与战略意义</h2>
<h3 id="1-1-c-quot-yxl-scaling-quot-d-quot-css-scaling-quot-dfsyq">1.1 从&quot;预训练Scaling&quot;到&quot;测试时Scaling&quot;的范式跃迁</h3>
<p>2024年9月，OpenAI发布o1系列(含o1-preview与o1-mini)，标志着大模型发展进入**测试时计算扩展(Test-Time Compute Scaling)**的新阶段。此前，模型性能提升主要依赖预训练阶段的参数规模与数据量增长(Kaplan et al., 2020; Hoffmann et al., 2022的Scaling Laws)。o1的出现证明：<strong>在推理阶段投入更多计算资源，同样可以显著提升模型在复杂任务上的表现</strong>。</p>
<p>这一发现补全了&quot;Bitter Lesson&quot;(Sutton, 2019)的最后一块拼图——不仅训练阶段可以利用计算，<strong>搜索/推理阶段也可以利用计算</strong>。o1没有使用显式的搜索算法(如MCTS、Beam Search)，而是通过RL训练模型学会在单一Chain-of-Thought(CoT)轨迹内进行<strong>隐式搜索</strong>，这是将搜索融入LLM的最简单方式，却取得了惊人效果。</p>
<h3 id="1-2-cpxtybbcy">1.2 产品形态与版本差异</h3>
<table>
<thead>
<tr>
<th>版本</th>
<th>定位</th>
<th>输出token上限</th>
<th>上下文窗口</th>
<th>知识截止</th>
</tr>
</thead>
<tbody><tr>
<td>o1-preview</td>
<td>完整版推理模型</td>
<td>32,768</td>
<td>128K</td>
<td>2023-10</td>
</tr>
<tr>
<td>o1-mini</td>
<td>轻量高效版</td>
<td>65,536</td>
<td>128K</td>
<td>2023-10</td>
</tr>
</tbody></table>
<p>o1-mini针对STEM推理(尤其是编程和数学)进行了优化，成本显著低于o1-preview，但通用知识范围较窄。两个版本均<strong>不支持工具调用、批量API、图像输入</strong>，专注于纯文本推理任务。</p>
<hr>
<h2 id="e-hxxlfs-rl-hidden-cot">二、核心训练范式：RL + Hidden CoT</h2>
<h3 id="2-1-xlxh-c-quot-mfgdbq-quot-d-quot-tskbgj-quot">2.1 训练信号：从&quot;模仿固定标签&quot;到&quot;探索可变轨迹&quot;</h3>
<p>OpenAI官方公告明确指出o1的训练方法：</p>
<blockquote>
<p>&quot;Our large-scale <strong>reinforcement learning algorithm</strong> teaches the model how to think productively using its <strong>chain of thought</strong> in a highly <strong>data-efficient</strong> training process.&quot;</p>
</blockquote>
<p>这句话揭示了三个关键设计选择：</p>
<ol>
<li><p><strong>Chain-of-Thought(CoT)作为推理媒介</strong>：o1在内部生成详细的推理过程(思考链)，而非直接输出答案。这与传统CoT prompting(Wei et al., 2022)的本质区别在于——o1的CoT是<strong>模型内生的、通过RL训练涌现的</strong>，而非通过prompt诱导的。</p>
</li>
<li><p><strong>Reinforcement Learning(RL)而非SFT</strong>：o1从<strong>可变rollout</strong>(variable rollouts)中学习，训练信号来自动态生成的reward，而非固定的ground-truth标签。这允许模型探索多种推理路径并学会评估哪些路径更有效。</p>
</li>
<li><p><strong>数据效率(Data-Efficiency)</strong>：该过程需要相对较少的(人工标注)样本。注意这并不意味着token效率或计算效率——o1在推理时可能生成数万token的内部CoT。</p>
</li>
</ol>
<h3 id="2-2-ysssjz">2.2 隐式搜索机制</h3>
<p>o1不运行显式搜索算法，而是训练模型在单一CoT轨迹内进行隐式搜索。这种隐式搜索表现为以下<strong>涌现能力</strong>(Noam Brown, 2024强调这些是模型自发学会的，非人为编程)：</p>
<table>
<thead>
<tr>
<th>涌现能力</th>
<th>具体表现</th>
<th>示例</th>
</tr>
</thead>
<tbody><tr>
<td><strong>错误识别与纠正</strong></td>
<td>在推理过程中发现先前步骤的错误并修正</td>
<td>&quot;Wait, I made a mistake in step 3...&quot;</td>
</tr>
<tr>
<td><strong>问题分解</strong></td>
<td>将复杂问题拆分为可管理的子问题</td>
<td>&quot;Let&#39;s break this into two parts...&quot;</td>
</tr>
<tr>
<td><strong>回溯与替代方案探索</strong></td>
<td>当前路径无效时尝试不同方法</td>
<td>&quot;This approach isn&#39;t working, let me try...&quot;</td>
</tr>
<tr>
<td><strong>自我验证</strong></td>
<td>对中间结果进行检验</td>
<td>&quot;Let me double-check this calculation...&quot;</td>
</tr>
</tbody></table>
<h3 id="2-3-hidden-cot-djgxz">2.3 Hidden CoT 的架构选择</h3>
<p>o1最富争议的设计决策是<strong>隐藏CoT</strong>(Hidden Chain-of-Thought)：模型生成完整的推理过程，但用户只能看到最终答案，无法访问中间推理token。</p>
<p><strong>隐藏CoT的技术动机</strong>：</p>
<ul>
<li><strong>防止蒸馏</strong>：防止竞争对手通过提取推理轨迹来训练自己的模型(OpenAI官方未承认，但业界普遍认同)</li>
<li><strong>用户体验</strong>：避免冗长推理过程干扰用户阅读</li>
<li><strong>安全控制</strong>：防止模型在推理过程中生成有害内容后直接暴露给用户</li>
</ul>
<p><strong>隐藏CoT的技术代价</strong>：</p>
<ul>
<li>用户无法验证推理过程的正确性</li>
<li>无法通过推理轨迹进行错误分析</li>
<li>学术界无法进行可解释性研究</li>
<li>API用户为隐藏token付费但无法审计</li>
</ul>
<p>这种设计引发了广泛的学术讨论，也催生了后续的开源推理模型(如DeepSeek-R1)选择<strong>公开CoT</strong>作为差异化策略。</p>
<hr>
<h2 id="s-deliberative-alignment-sysaqxl">三、Deliberative Alignment：审议式安全训练</h2>
<h3 id="3-1-ljdaqxlkj">3.1 两阶段安全训练框架</h3>
<p>o1引入了<strong>Deliberative Alignment</strong>(审议式对齐)安全训练方法，这是o1系列区别于之前GPT模型的关键安全创新。</p>
<p><strong>第一阶段：SFT with Deliberation</strong></p>
<ul>
<li>训练模型在回答前显式思考安全政策</li>
<li>模型学会识别请求中的潜在危害、评估不同回应方式的风险</li>
<li>不是简单的&quot;拒绝有害请求&quot;，而是<strong>理解为什么有害</strong></li>
</ul>
<p><strong>第二阶段：RL with Safety Rewards</strong></p>
<ul>
<li>在安全相关场景上运行RL，奖励符合安全政策的推理和回答</li>
<li>模型学会在CoT中主动进行安全推理：&quot;This request seems to be asking for [harmful activity], which violates policy [X]...&quot;</li>
</ul>
<h3 id="3-2-aqxnts">3.2 安全性能提升</h3>
<p>Deliberative Alignment使得o1在以下安全维度显著优于GPT-4o：</p>
<table>
<thead>
<tr>
<th>安全测试维度</th>
<th>o1 vs GPT-4o</th>
<th>机制解释</th>
</tr>
</thead>
<tbody><tr>
<td>越狱抵抗(Jailbreak)</td>
<td>显著提升</td>
<td>模型在CoT中主动识别越狱尝试</td>
</tr>
<tr>
<td>边缘案例处理</td>
<td>更 nuanced</td>
<td>不是简单拒绝，而是理解边界</td>
</tr>
<tr>
<td>虚假一致性(Sycophancy)</td>
<td>降低</td>
<td>模型学会独立判断而非迎合用户</td>
</tr>
<tr>
<td>过度拒绝(Over-refusal)</td>
<td>改善</td>
<td>更好的政策理解减少误伤</td>
</tr>
</tbody></table>
<hr>
<h2 id="s-css-scaling-laws">四、测试时Scaling Laws</h2>
<h3 id="4-1-xnstljsldkyczc">4.1 性能随推理计算量的可预测增长</h3>
<p>o1最引人注目的特性是：<strong>在固定模型参数的情况下，增加测试时计算(即允许模型思考更长时间)可以系统性地提升性能</strong>。这形成了新的Scaling Law——<strong>测试时Scaling Law</strong>。</p>
<p><strong>核心发现</strong>：</p>
<ul>
<li>在AIME(美国数学邀请赛)等推理基准上，o1的性能随测试时计算量呈近似单调增长</li>
<li>这种增长不是线性的，而是遵循**幂律(power law)<strong>或</strong>对数线性(log-linear)**关系</li>
<li>存在<strong>收益递减</strong>：简单问题增加思考时间提升有限，复杂问题收益更大</li>
</ul>
<h3 id="4-2-yyxl-scaling-ddb">4.2 与预训练Scaling的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>预训练Scaling</th>
<th>测试时Scaling</th>
</tr>
</thead>
<tbody><tr>
<td>投入资源</td>
<td>训练计算(GPU-hours)</td>
<td>推理计算(GPU-hours)</td>
</tr>
<tr>
<td>扩展方式</td>
<td>更多参数、更多数据</td>
<td>更多推理token、更多采样</td>
</tr>
<tr>
<td>边际成本</td>
<td>一次性训练成本</td>
<td>每次推理的增量成本</td>
</tr>
<tr>
<td>适用场景</td>
<td>通用能力提升</td>
<td>复杂推理任务</td>
</tr>
<tr>
<td>可预测性</td>
<td>Kaplan Scaling Laws</td>
<td>新兴的Test-Time Scaling Laws</td>
</tr>
</tbody></table>
<h3 id="4-3-tlsjdslj">4.3 推理时间的数量级</h3>
<p>o1-preview的典型推理时间：</p>
<ul>
<li><strong>简单问题</strong>：数秒(生成数百~数千推理token)</li>
<li><strong>中等复杂问题</strong>：数十秒(生成数千~数万推理token)</li>
<li><strong>复杂数学/编程问题</strong>：数分钟(生成数万+推理token)</li>
</ul>
<p>作为对比，GPT-4o的典型首token延迟为亚秒级。o1的&quot;慢思考&quot;本质上是<strong>用时间换精度</strong>的策略。</p>
<hr>
<h2 id="w-benchmark-xnynlbj">五、Benchmark性能与能力边界</h2>
<h3 id="5-1-dlpg">5.1 定量评估</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>o1-preview</th>
<th>GPT-4o</th>
<th>提升幅度</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2024</td>
<td>83.3%</td>
<td>13.4%</td>
<td><strong>+69.9pp</strong></td>
<td>美国数学邀请赛</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>78.3%</td>
<td>53.6%</td>
<td><strong>+24.7pp</strong></td>
<td>研究生级科学问答</td>
</tr>
<tr>
<td>MATH-500</td>
<td>94.8%</td>
<td>76.6%</td>
<td><strong>+18.2pp</strong></td>
<td>竞赛级数学题</td>
</tr>
<tr>
<td>Codeforces Elo</td>
<td>1807</td>
<td>759</td>
<td><strong>+1048</strong></td>
<td>编程竞赛排名</td>
</tr>
<tr>
<td>SWE-bench</td>
<td>41.3%</td>
<td>30.7%</td>
<td>+10.6pp</td>
<td>真实软件工程</td>
</tr>
<tr>
<td>MMLU</td>
<td>92.4%</td>
<td>88.7%</td>
<td>+3.7pp</td>
<td>通用知识</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>：o1在需要<strong>深度推理</strong>的任务上(数学、科学、编程竞赛)提升巨大，但在纯知识检索任务(MMLU)上提升有限。这验证了测试时Scaling的核心价值：<strong>复杂推理而非知识记忆</strong>。</p>
<h3 id="5-2-nlbjyjx">5.2 能力边界与局限</h3>
<p><strong>优势领域</strong>：</p>
<ul>
<li>多步数学证明与计算</li>
<li>算法设计与代码竞赛</li>
<li>科学假设推导</li>
<li>复杂逻辑谜题</li>
</ul>
<p><strong>局限领域</strong>：</p>
<ul>
<li>实时信息获取(无工具调用、知识截止2023-10)</li>
<li>多模态理解(无图像输入)</li>
<li>创意写作(推理开销无价值)</li>
<li>简单事实问答(慢思考是浪费)</li>
</ul>
<hr>
<h2 id="l-gcsxdgjmt">六、工程实现的关键谜题</h2>
<h3 id="6-1-tljcss">6.1 推理基础设施</h3>
<p>o1的推理涉及<strong>超长序列生成</strong>(数万token的隐藏CoT)，这对推理基础设施提出独特挑战：</p>
<ul>
<li><strong>KV Cache管理</strong>：长序列导致巨大的KV Cache内存占用</li>
<li><strong>流式生成延迟</strong>：用户需要等待完整推理完成后才能获得答案</li>
<li><strong>成本核算</strong>：API定价需覆盖隐藏推理token的成本</li>
</ul>
<p>OpenAI的解决方案推测：</p>
<ul>
<li>使用**投机解码(Speculative Decoding)**加速推理</li>
<li>**动态批次(Dynamic Batching)**提高GPU利用率</li>
<li>可能采用<strong>稀疏注意力</strong>减少长序列的计算复杂度</li>
</ul>
<h3 id="6-2-xljcss">6.2 训练基础设施</h3>
<p>o1的大规模RL训练需要：</p>
<ul>
<li><strong>大规模Rollout生成</strong>：并行生成大量推理轨迹</li>
<li><strong>Reward Model评估</strong>：对每条轨迹进行准确评估(尤其是数学/编程问题的答案验证可自动进行)</li>
<li><strong>在线学习</strong>：模型根据Reward信号持续更新策略</li>
</ul>
<p>业界推测o1的RL训练使用了<strong>数十万~数百万条高质量推理轨迹</strong>，通过**课程学习(Curriculum Learning)**从简单问题逐步过渡到复杂问题。</p>
<hr>
<h2 id="q-xsyxyhxyj">七、学术影响与后续演进</h2>
<h3 id="7-1-dtlmxyjdchzy">7.1 对推理模型研究的催化作用</h3>
<p>o1的发布引发了推理模型(Reasoning Models / LRMs)的研究热潮：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>核心方法</th>
<th>与o1的关系</th>
</tr>
</thead>
<tbody><tr>
<td>2024-09</td>
<td>o1</td>
<td>RL + Hidden CoT</td>
<td>开创者</td>
</tr>
<tr>
<td>2024-12</td>
<td>o3</td>
<td>升级RL + 多模态CoT</td>
<td>OpenAI继任</td>
</tr>
<tr>
<td>2025-01</td>
<td>DeepSeek-R1</td>
<td>GRPO + 公开CoT</td>
<td>开源复现</td>
</tr>
<tr>
<td>2025-02</td>
<td>Kimi k1.5</td>
<td>RL + Long CoT</td>
<td>长思维链</td>
</tr>
<tr>
<td>2025-03</td>
<td>QwQ-32B</td>
<td>RL + CoT</td>
<td>轻量推理</td>
</tr>
</tbody></table>
<h3 id="7-2-gjxszy">7.2 关键学术争议</h3>
<ol>
<li><p><strong>Hidden vs Public CoT</strong>：o1的隐藏CoT策略 vs DeepSeek-R1的公开CoT策略，哪种更优？</p>
<ul>
<li>隐藏CoT：保护知识产权、控制用户体验</li>
<li>公开CoT：可解释性、错误诊断、学术研究价值</li>
</ul>
</li>
<li><p><strong>Overthinking问题</strong>：o1-like模型在简单问题上也会生成冗长推理，造成计算浪费(Chen et al., 2025)。后续研究提出Length-Controlled Policy Optimization(LCPO)、Budget Forcing等方法控制推理长度。</p>
</li>
<li><p><strong>Scaling的可预测性</strong>：测试时Scaling Law是否像预训练Scaling Law一样具有稳定的幂律关系？初步证据支持，但长尾分布问题仍待研究。</p>
</li>
</ol>
<hr>
<h2 id="b-xj-o1-dlsdw">八、小结：o1的历史定位</h2>
<p>o1是大模型发展史上的<strong>里程碑式产品</strong>，其价值不仅在于性能数字，更在于它<strong>开辟了一个全新的Scaling维度</strong>：</p>
<blockquote>
<p><strong>预训练Scaling定义了过去十年。测试时Scaling定义了下一个十年。</strong></p>
</blockquote>
<p>o1证明了：</p>
<ol>
<li><strong>RL可以教会模型&quot;思考&quot;</strong>——不是字面意义上的思考，而是生成结构化、可验证的推理过程</li>
<li><strong>推理深度可以像参数规模一样被系统性地扩展</strong></li>
<li><strong>安全可以通过让模型&quot;理解&quot;政策而非简单&quot;记忆&quot;规则来实现</strong></li>
</ol>
<p>o1的局限性(无工具、无多模态、隐藏CoT、知识陈旧)在其继任者o3/GPT-5中逐步解决，但其开创的测试时Scaling范式已成为行业共识。</p>
<hr>
<p><strong>相关阅读</strong>：</p>
<ul>
<li><a href="/llm-guide/14-models/14.12-openai/14.12-openai">14.12-OpenAI 家族总览</a></li>
<li><a href="#broken-link">17-o3 测试时计算与多模态推理的深度融合</a></li>
<li><a href="#broken-link">DeepSeek-R1 强化学习驱动的推理能力涌现</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyzlyy","text":"一、发布背景与战略意义"},{"level":3,"id":"1-1-c-quot-yxl-scaling-quot-d-quot-css-scaling-quot-dfsyq","text":"1.1 从&quot;预训练Scaling&quot;到&quot;测试时Scaling&quot;的范式跃迁"},{"level":3,"id":"1-2-cpxtybbcy","text":"1.2 产品形态与版本差异"},{"level":2,"id":"e-hxxlfs-rl-hidden-cot","text":"二、核心训练范式：RL + Hidden CoT"},{"level":3,"id":"2-1-xlxh-c-quot-mfgdbq-quot-d-quot-tskbgj-quot","text":"2.1 训练信号：从&quot;模仿固定标签&quot;到&quot;探索可变轨迹&quot;"},{"level":3,"id":"2-2-ysssjz","text":"2.2 隐式搜索机制"},{"level":3,"id":"2-3-hidden-cot-djgxz","text":"2.3 Hidden CoT 的架构选择"},{"level":2,"id":"s-deliberative-alignment-sysaqxl","text":"三、Deliberative Alignment：审议式安全训练"},{"level":3,"id":"3-1-ljdaqxlkj","text":"3.1 两阶段安全训练框架"},{"level":3,"id":"3-2-aqxnts","text":"3.2 安全性能提升"},{"level":2,"id":"s-css-scaling-laws","text":"四、测试时Scaling Laws"},{"level":3,"id":"4-1-xnstljsldkyczc","text":"4.1 性能随推理计算量的可预测增长"},{"level":3,"id":"4-2-yyxl-scaling-ddb","text":"4.2 与预训练Scaling的对比"},{"level":3,"id":"4-3-tlsjdslj","text":"4.3 推理时间的数量级"},{"level":2,"id":"w-benchmark-xnynlbj","text":"五、Benchmark性能与能力边界"},{"level":3,"id":"5-1-dlpg","text":"5.1 定量评估"},{"level":3,"id":"5-2-nlbjyjx","text":"5.2 能力边界与局限"},{"level":2,"id":"l-gcsxdgjmt","text":"六、工程实现的关键谜题"},{"level":3,"id":"6-1-tljcss","text":"6.1 推理基础设施"},{"level":3,"id":"6-2-xljcss","text":"6.2 训练基础设施"},{"level":2,"id":"q-xsyxyhxyj","text":"七、学术影响与后续演进"},{"level":3,"id":"7-1-dtlmxyjdchzy","text":"7.1 对推理模型研究的催化作用"},{"level":3,"id":"7-2-gjxszy","text":"7.2 关键学术争议"},{"level":2,"id":"b-xj-o1-dlsdw","text":"八、小结：o1的历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/13-o1/05-13-o1-cssjskzyyclssw" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/13-o1/05-13-o1-cssjskzyyclssw" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">o1：测试时计算扩展与隐藏链式思维</h1>
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
