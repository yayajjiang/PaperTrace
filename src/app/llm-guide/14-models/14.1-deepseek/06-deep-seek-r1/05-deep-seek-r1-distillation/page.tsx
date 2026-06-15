"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-R1 蒸馏与工业落地</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 DeepSeek-R1 的蒸馏策略、小模型性能分析, 以及在实际部署中的工程考量.</p>
</blockquote>
<hr>
<h2 id="1-zlcldsjdj">1 蒸馏策略的设计动机</h2>
<h3 id="1-1-wsmxyzl">1.1 为什么需要蒸馏</h3>
<p>DeepSeek-R1 是一个 671B 总参数、37B 激活参数的 MoE 模型. 虽然其推理能力接近 OpenAI o1, 但部署成本仍然很高:</p>
<ul>
<li>推理需要 8× H800 GPU 或同等算力</li>
<li>长 CoT 意味着每个请求的 token 消耗巨大(平均数千到数万)</li>
<li>MoE 架构的专家路由增加了系统复杂性</li>
</ul>
<p>对于资源有限的研究者和开发者, 需要一个更轻量的替代方案.</p>
<p>蒸馏的核心假设是: <strong>大模型通过 RL 发现的推理模式, 可以被编码为监督数据, 并迁移到小模型中</strong>.</p>
<h3 id="1-2-zl-vs-c-rl-gjsy">1.2 蒸馏 vs 纯 RL: 关键实验</h3>
<p>表 5 中的对比揭示了核心发现:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME 2024</th>
<th>MATH-500</th>
<th>LiveCodeBench</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-32B-Zero(纯 RL)</td>
<td>47.0%</td>
<td>91.6%</td>
<td>40.2%</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-32B(蒸馏)</td>
<td>72.6%</td>
<td>94.3%</td>
<td>57.2%</td>
</tr>
<tr>
<td>差距</td>
<td>+25.6%</td>
<td>+2.7%</td>
<td>+17.0%</td>
</tr>
</tbody></table>
<p>在相同基础模型(Qwen-32B)上, 蒸馏版本在所有基准上都显著优于纯 RL 版本. 这意味着:</p>
<ol>
<li><strong>小模型的容量不足以通过纯 RL 自发发现复杂推理模式</strong></li>
<li><strong>从强教师模型蒸馏的高质量推理数据, 比小模型自己探索更有效</strong></li>
</ol>
<blockquote>
<p>译者注: 这个发现具有重要的理论和实践意义. 理论上, 它暗示了推理能力的涌现可能需要跨过某个模型容量门槛 —— 低于这个门槛, 模型无法自主发现有效的推理策略, 只能模仿. 实践上, 它为社区提供了一个「捷径」: 不需要昂贵的 RL 基础设施, 只需要 R1 生成的推理数据和足够的 SFT 算力, 就能获得强大的推理能力. 这也解释了为什么 DeepSeek 选择开源 6 个蒸馏模型 —— 它们是立即可用的推理引擎.</p>
</blockquote>
<hr>
<h2 id="2-zlmxdxnfx">2 蒸馏模型的性能分析</h2>
<h3 id="2-1-qxlzlmxgl">2.1 全系列蒸馏模型概览</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>基础模型</th>
<th>参数量</th>
<th>AIME 2024</th>
<th>MATH-500</th>
<th>Codeforces Rating</th>
</tr>
</thead>
<tbody><tr>
<td>R1-Distill-Qwen-1.5B</td>
<td>Qwen2.5-Math-1.5B</td>
<td>1.5B</td>
<td>28.9%</td>
<td>83.9%</td>
<td>954</td>
</tr>
<tr>
<td>R1-Distill-Qwen-7B</td>
<td>Qwen2.5-Math-7B</td>
<td>7B</td>
<td>55.5%</td>
<td>92.8%</td>
<td>1189</td>
</tr>
<tr>
<td>R1-Distill-Qwen-14B</td>
<td>Qwen2.5-14B</td>
<td>14B</td>
<td>69.7%</td>
<td>93.9%</td>
<td>1481</td>
</tr>
<tr>
<td>R1-Distill-Qwen-32B</td>
<td>Qwen2.5-32B</td>
<td>32B</td>
<td>72.6%</td>
<td>94.3%</td>
<td>1691</td>
</tr>
<tr>
<td>R1-Distill-Llama-8B</td>
<td>Llama-3.1-8B</td>
<td>8B</td>
<td>50.4%</td>
<td>89.1%</td>
<td>1205</td>
</tr>
<tr>
<td>R1-Distill-Llama-70B</td>
<td>Llama-3.3-70B-Instruct</td>
<td>70B</td>
<td>70.0%</td>
<td>94.5%</td>
<td>1633</td>
</tr>
</tbody></table>
<h3 id="2-2-gmxyfx">2.2 规模效应分析</h3>
<p>从 1.5B 到 32B, 蒸馏模型的性能呈现近似对数增长:</p>
<ul>
<li><strong>1.5B</strong>: 已经可以超越 GPT-4o 在 AIME 上的表现(9.3%)</li>
<li><strong>7B</strong>: 超越 Claude-3.5-Sonnet(16.0%), 接近 QwQ-32B-Preview(50.0%)</li>
<li><strong>14B</strong>: 接近 OpenAI-o1-mini(63.6%)</li>
<li><strong>32B</strong>: 全面超越 o1-mini, 接近 o1 正式版</li>
</ul>
<p>这种规模效应的规律是: 每增加约 2 倍参数量, AIME 性能提升约 10-15 个百分点.</p>
<h3 id="2-3-jgcy-qwen-vs-llama">2.3 架构差异: Qwen vs Llama</h3>
<p>在相近参数量下, Qwen 系列的蒸馏模型普遍优于 Llama 系列:</p>
<table>
<thead>
<tr>
<th>参数量区间</th>
<th>Qwen</th>
<th>Llama</th>
<th>差距</th>
</tr>
</thead>
<tbody><tr>
<td>~7-8B</td>
<td>55.5% (Qwen-7B)</td>
<td>50.4% (Llama-8B)</td>
<td>+5.1%</td>
</tr>
<tr>
<td>~32-70B</td>
<td>72.6% (Qwen-32B)</td>
<td>70.0% (Llama-70B)</td>
<td>+2.6%</td>
</tr>
</tbody></table>
<p>这种差距可能源于:</p>
<ol>
<li>Qwen2.5 的基础能力更强(特别是在数学和中文上)</li>
<li>Qwen2.5-Math 系列针对数学推理进行了专门优化</li>
<li>R1 的蒸馏数据主要是中英文, 与 Qwen 的训练语言更匹配</li>
</ol>
<p>值得注意的是, 即使 Llama-70B(70B 参数)也未能超越 Qwen-32B(32B 参数). 这表明<strong>基础模型的质量比参数量更重要</strong>.</p>
<hr>
<h2 id="3-zldjsxj">3 蒸馏的技术细节</h2>
<h3 id="3-1-sjzb">3.1 数据准备</h3>
<p>蒸馏数据与 R1 的拒绝采样 SFT 数据相同, 约 800K 条:</p>
<ul>
<li>600K 推理数据(数学、代码、STEM、逻辑)</li>
<li>200K 非推理数据(写作、QA、翻译等)</li>
</ul>
<p>这些数据由 R1 生成, 经过正确性验证和格式过滤.</p>
<h3 id="3-2-xlpz">3.2 训练配置</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>初始学习率</th>
<th>训练 epoch</th>
<th>最大长度</th>
<th>Batch size</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen-1.5B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1\\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
<tr>
<td>Qwen-7B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
<tr>
<td>Qwen-14B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
<tr>
<td>Qwen-32B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
<tr>
<td>Llama-8B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
<tr>
<td>Llama-70B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>2-3</td>
<td>32768</td>
<td>64</td>
</tr>
</tbody></table>
<p>所有模型使用余弦衰减学习率调度, 最终学习率降至初始值的 1/10.</p>
<h3 id="3-3-wsmxxssmxzdejd">3.3 为什么学习率随模型增大而降低</h3>
<p>观察表 6 可以发现, 学习率从 1.5B 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 递减到 70B 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>. 这遵循了深度学习中的常见规律:</p>
<ul>
<li>小模型需要更高的学习率来快速适应新的数据分布</li>
<li>大模型参数更多, 过高的学习率会导致不稳定或灾难性遗忘</li>
</ul>
<p>学习率与参数量的近似反比关系:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>LR</mtext><mo>≈</mo><mfrac><mi>C</mi><msqrt><msub><mi>N</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>m</mi><mi>s</mi></mrow></msub></msqrt></mfrac></mrow><annotation encoding="application/x-tex">\\text{LR} \\approx \\frac{C}{\\sqrt{N_{params}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">LR</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4903em;vertical-align:-1.13em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.2264em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8836em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">am</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8436em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3564em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.13em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 是常数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>m</mi><mi>s</mi></mrow></msub></mrow><annotation encoding="application/x-tex">N_{params}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">am</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是参数量.</p>
<hr>
<h2 id="4-gylddgckl">4 工业落地的工程考量</h2>
<h3 id="4-1-bscbgs">4.1 部署成本估算</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>显存需求(FP16/BF16)</th>
<th>量化方案</th>
<th>量化后显存</th>
<th>推荐 GPU 配置</th>
</tr>
</thead>
<tbody><tr>
<td>R1-Distill-Qwen-1.5B</td>
<td>~3 GB</td>
<td>INT4</td>
<td>~1 GB</td>
<td>单张消费级 GPU</td>
</tr>
<tr>
<td>R1-Distill-Qwen-7B</td>
<td>~14 GB</td>
<td>INT4</td>
<td>~4 GB</td>
<td>单张 RTX 4090</td>
</tr>
<tr>
<td>R1-Distill-Qwen-14B</td>
<td>~28 GB</td>
<td>INT4</td>
<td>~8 GB</td>
<td>单张 A100 40GB</td>
</tr>
<tr>
<td>R1-Distill-Qwen-32B</td>
<td>~64 GB</td>
<td>INT4</td>
<td>~18 GB</td>
<td>2× A100 40GB</td>
</tr>
<tr>
<td>R1-Distill-Llama-70B</td>
<td>~140 GB</td>
<td>INT4</td>
<td>~40 GB</td>
<td>2× A100 80GB</td>
</tr>
<tr>
<td>DeepSeek-R1(671B)</td>
<td>~1400 GB</td>
<td>INT8</td>
<td>~700 GB</td>
<td>8× H800</td>
</tr>
</tbody></table>
<p>对于绝大多数应用场景, 7B 或 14B 的蒸馏模型已经足够:</p>
<ul>
<li><strong>7B</strong>: 可以在单张消费级 GPU 上运行, AIME 55.5%, 适合个人开发者和小团队</li>
<li><strong>14B</strong>: AIME 69.7%, 接近 o1-mini 水平, 适合中小规模应用</li>
<li><strong>32B</strong>: AIME 72.6%, 达到 o1 级别, 适合企业级部署</li>
</ul>
<h3 id="4-2-tlxsyh">4.2 推理效率优化</h3>
<p>蒸馏模型的推理面临两个挑战:</p>
<ol>
<li><strong>长 CoT 的延迟</strong>: 每个请求可能生成数千到数万 token, 推理时间较长.</li>
<li><strong>KV Cache 的内存占用</strong>: 长序列导致巨大的 KV Cache.</li>
</ol>
<p>优化策略:</p>
<ul>
<li><strong>投机解码</strong>: 使用 MTP(Multi-Token Prediction)或 draft model 来加速解码</li>
<li><strong>动态批处理</strong>: 根据序列长度动态分组, 减少填充浪费</li>
<li><strong>量化</strong>: INT4/INT8 量化减少显存占用, 提升吞吐</li>
<li><strong>分页注意力</strong>: 使用 vLLM 的 PagedAttention 来高效管理 KV Cache</li>
</ul>
<h3 id="4-3-zldbjyjx">4.3 蒸馏的边界与局限</h3>
<p>蒸馏虽然有效, 但存在明确的边界:</p>
<ol>
<li><p><strong>能力天花板</strong>: 蒸馏模型的能力受限于教师模型. 如果教师模型在某些任务上表现不佳, 蒸馏模型也无法超越.</p>
</li>
<li><p><strong>数据分布依赖</strong>: 蒸馏数据主要来自数学、代码和 STEM 问题. 对于创意写作、情感分析等任务, 蒸馏带来的增益有限.</p>
</li>
<li><p><strong>无法学习新策略</strong>: 蒸馏是「模仿」而非「探索」. 如果教师模型的推理策略存在系统性的缺陷, 蒸馏模型会继承这些缺陷.</p>
</li>
<li><p><strong>思维链长度</strong>: 小模型的上下文窗口和生成能力有限, 可能无法完整复现教师模型的长思维链.</p>
</li>
</ol>
<p>表 5 中的数据证实了这一点: 即使是 32B 模型, 纯 RL(47.0%)也远不如蒸馏(72.6%). 这说明蒸馏不是「教会」模型推理, 而是「激活」模型已有的推理潜力.</p>
<hr>
<h2 id="5-zlzsfpxzdwz">5 蒸馏在算法谱系中的位置</h2>
<table>
<thead>
<tr>
<th>方法</th>
<th>代表工作</th>
<th>优势</th>
<th>劣势</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td>纯 RL</td>
<td>R1-Zero</td>
<td>自主发现新策略</td>
<td>需要大模型、训练不稳定</td>
<td>探索推理上限</td>
</tr>
<tr>
<td>SFT + RL</td>
<td>R1</td>
<td>稳定、可控</td>
<td>流水线复杂</td>
<td>生产级部署</td>
</tr>
<tr>
<td>蒸馏</td>
<td>R1-Distill</td>
<td>低成本、即插即用</td>
<td>能力受限于教师</td>
<td>资源受限场景</td>
</tr>
<tr>
<td>纯 SFT</td>
<td>传统指令微调</td>
<td>简单</td>
<td>无推理能力</td>
<td>通用任务</td>
</tr>
</tbody></table>
<p>蒸馏在这个谱系中占据了「实用主义」的位置: 它不是最优雅的(纯 RL), 也不是最强大的(完整 R1), 但它是<strong>性价比最高</strong>的.</p>
<p>对于工业界而言, 蒸馏模型的开源具有革命性意义:</p>
<ul>
<li><strong>7B 模型</strong>: 个人开发者可以在笔记本电脑上运行接近 o1-mini 的推理能力</li>
<li><strong>32B 模型</strong>: 中小企业可以在 2 张 A100 上部署 o1 级别的推理服务</li>
<li><strong>成本对比</strong>: R1-Distill-Qwen-32B 的部署成本约为 DeepSeek-R1 的 1/20, 但 AIME 性能达到 91%</li>
</ul>
<hr>
<h2 id="6-wlfx">6 未来方向</h2>
<h3 id="6-1-ddzl">6.1 迭代蒸馏</h3>
<p>当前蒸馏是一次性的: R1 → 小模型. 未来的方向可能是<strong>迭代蒸馏</strong>:</p>
<ol>
<li>用小模型生成推理数据</li>
<li>用这些数据进一步微调教师模型</li>
<li>用改进的教师模型重新蒸馏</li>
</ol>
<p>这种自举循环可能持续提升模型能力, 类似于 AlphaZero 的自我对弈.</p>
<h3 id="6-2-lythzl">6.2 领域特化蒸馏</h3>
<p>R1 的蒸馏数据是通用的数学和代码问题. 对于特定领域(如医学诊断、法律推理、科学研究), 可以:</p>
<ol>
<li>收集领域特定的验证器</li>
<li>用 R1 生成领域特定的推理数据</li>
<li>蒸馏领域特化的小模型</li>
</ol>
<p>这种「通用教师 + 领域验证器」的模式可能是垂直应用的最佳路径.</p>
<h3 id="6-3-dmttlzl">6.3 多模态推理蒸馏</h3>
<p>R1 目前只处理文本. 将蒸馏扩展到多模态(图像、视频、音频)推理是一个自然但困难的方向:</p>
<ul>
<li>需要多模态的验证器</li>
<li>思维链可能涉及跨模态的关联</li>
<li>小模型的多模态Encoder 容量有限</li>
</ul>
<hr>
<p><em>本文档基于《01-DeepSeek-R1技术报告精译.md》的蒸馏章节进行深度剖析.</em></p>
<hr>
<h2 id="zsktb">知识库同步</h2>
<p>本文档同步至知识库以下位置:</p>
<ul>
<li><code>docs/sections/knowledge/algorithms/</code> — 对齐与蒸馏技术谱系</li>
<li><code>docs/sections/knowledge/cs336/Lecture16/Lecture16-DeepSeek-R1.md</code> — CS336 课程: DeepSeek-R1 技术解读</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zlcldsjdj","text":"1 蒸馏策略的设计动机"},{"level":3,"id":"1-1-wsmxyzl","text":"1.1 为什么需要蒸馏"},{"level":3,"id":"1-2-zl-vs-c-rl-gjsy","text":"1.2 蒸馏 vs 纯 RL: 关键实验"},{"level":2,"id":"2-zlmxdxnfx","text":"2 蒸馏模型的性能分析"},{"level":3,"id":"2-1-qxlzlmxgl","text":"2.1 全系列蒸馏模型概览"},{"level":3,"id":"2-2-gmxyfx","text":"2.2 规模效应分析"},{"level":3,"id":"2-3-jgcy-qwen-vs-llama","text":"2.3 架构差异: Qwen vs Llama"},{"level":2,"id":"3-zldjsxj","text":"3 蒸馏的技术细节"},{"level":3,"id":"3-1-sjzb","text":"3.1 数据准备"},{"level":3,"id":"3-2-xlpz","text":"3.2 训练配置"},{"level":3,"id":"3-3-wsmxxssmxzdejd","text":"3.3 为什么学习率随模型增大而降低"},{"level":2,"id":"4-gylddgckl","text":"4 工业落地的工程考量"},{"level":3,"id":"4-1-bscbgs","text":"4.1 部署成本估算"},{"level":3,"id":"4-2-tlxsyh","text":"4.2 推理效率优化"},{"level":3,"id":"4-3-zldbjyjx","text":"4.3 蒸馏的边界与局限"},{"level":2,"id":"5-zlzsfpxzdwz","text":"5 蒸馏在算法谱系中的位置"},{"level":2,"id":"6-wlfx","text":"6 未来方向"},{"level":3,"id":"6-1-ddzl","text":"6.1 迭代蒸馏"},{"level":3,"id":"6-2-lythzl","text":"6.2 领域特化蒸馏"},{"level":3,"id":"6-3-dmttlzl","text":"6.3 多模态推理蒸馏"},{"level":2,"id":"zsktb","text":"知识库同步"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-distillation" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-distillation" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-R1 蒸馏与工业落地</h1>
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
