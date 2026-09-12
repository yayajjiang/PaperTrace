"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.7: 面向智能体时代的新一代旗舰模型</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Qwen3.7: The Agent Frontier
原文链接: <a href="https://qwen.ai/blog?id=qwen3.7">https://qwen.ai/blog?id=qwen3.7</a>
发布日期: 2026-05-20
发布机构: Qwen Team (阿里云)
模型规模: 未公开
上下文窗口: 1M tokens
开源协议: 未开源(仅 API 服务)</p>
</blockquote>
<hr>
<p>今天, 我们正式发布 Qwen3.7-Max——面向智能体时代的新一代旗舰模型, 即将通过 API 提供服务. Qwen3.7-Max 致力于成为全能的智能体基座——无论是编写和调试代码、自动化办公流程, 还是在跨越数百乃至数千步的长周期任务中持续自主执行, 都能胜任.</p>
<p>Qwen3.7-Max 的核心优势在于智能体能力的广度与深度: 编程方面, 从前端原型开发到复杂的多文件工程均能驾驭; 办公与生产力方面, 通过 MCP 集成和多智能体协作实现工作流自动化; 长周期自主执行方面, 在一项长达 35 小时、超过 1,000 次工具调用的全自主内核优化实验中保持了连贯推理, 充分验证了其持久稳定的执行能力; 此外, 无论部署在 Claude Code、OpenClaw、Qwen Code 还是其他框架下, 都能稳定发挥出色的跨框架泛化能力.</p>
<blockquote>
<p>这里值得停下来想一下. Qwen3.7 的发布时间点(2026 年 5 月)距离 Qwen3.6 的发布仅约一个月, 这种&quot;月更&quot;节奏在旗舰模型领域极为罕见. 通常, 顶级模型的迭代周期为 3-6 个月. 阿里如此激进的发布节奏背后, 反映了一个战略判断: <strong>智能体(Agent)赛道的时间窗口极窄, 先发优势可以转化为生态锁定</strong>. Qwen3.7 的核心叙事不是&quot;某个基准又提升了 2%&quot;, 而是&quot;我能自主跑 35 小时不崩溃&quot;——这是一个从&quot;能力参数&quot;到&quot;可靠性参数&quot;的范式转移. 对于企业用户来说, 一个能稳定执行 8 小时的 Agent 比一个在 AIME 上多考 5 分的模型更有商业价值.</p>
</blockquote>
<hr>
<h2 id="1-mxbx">1 模型表现</h2>
<p>下面我们在多种评估任务与模态下, 对 Qwen3.7-Max 与前沿模型进行全面对比评估.</p>
<h3 id="1-1-bcznt">1.1 编程智能体</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Opus-4.6 Max</th>
<th align="center">K2.6 Thinking</th>
<th align="center">GLM-5.1 Thinking</th>
<th align="center">DS-V4-Pro Max</th>
<th align="center">Qwen3.6-Plus</th>
<th align="center"><strong>Qwen3.7-Max</strong></th>
</tr>
</thead>
<tbody><tr>
<td align="left">Terminal Bench 2.0-Terminus</td>
<td align="center">65.4</td>
<td align="center">66.7</td>
<td align="center">63.5</td>
<td align="center">67.9</td>
<td align="center">61.6</td>
<td align="center"><strong>69.7</strong></td>
</tr>
<tr>
<td align="left">SWE-Verified</td>
<td align="center">80.8</td>
<td align="center">80.2</td>
<td align="center">—</td>
<td align="center">80.6</td>
<td align="center">78.8</td>
<td align="center"><strong>80.4</strong></td>
</tr>
<tr>
<td align="left">SWE-Pro</td>
<td align="center">57.3</td>
<td align="center">59.5</td>
<td align="center">58.8</td>
<td align="center">59.0</td>
<td align="center">56.6</td>
<td align="center"><strong>60.6</strong></td>
</tr>
<tr>
<td align="left">SWE-Multilingual</td>
<td align="center">77.5</td>
<td align="center">76.7</td>
<td align="center">—</td>
<td align="center">76.2</td>
<td align="center">73.8</td>
<td align="center"><strong>78.3</strong></td>
</tr>
<tr>
<td align="left">NL2repo</td>
<td align="center">47.6</td>
<td align="center">42.8</td>
<td align="center">41.0</td>
<td align="center">35.5</td>
<td align="center">34.4</td>
<td align="center"><strong>47.2</strong></td>
</tr>
<tr>
<td align="left">SciCode</td>
<td align="center">51.9</td>
<td align="center">52.2</td>
<td align="center">45.1</td>
<td align="center">—</td>
<td align="center">41.4</td>
<td align="center"><strong>53.5</strong></td>
</tr>
<tr>
<td align="left">QwenSVG</td>
<td align="center">1541</td>
<td align="center">1325</td>
<td align="center">1605</td>
<td align="center">1506</td>
<td align="center">1432</td>
<td align="center"><strong>1608</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>评测配置说明</strong>:</p>
<ul>
<li>Terminal Bench 2.0: Harbor/Terminus-2 harness; 5h timeout, 12 CPU/24 GB RAM; temp=1.0, top_p=0.95, top_k=20, max_tokens=80K, 256K ctx; avg of 5 runs.</li>
<li>SWE-Bench 系列: Internal agent scaffold (bash + file-edit tools); temp=1.0, top_p=0.95, 200K context window.</li>
<li>SWE-bench Pro: Problematic tasks corrected and all baselines evaluated on the refined benchmark.</li>
<li>NL2repo: Evaluated via Claude-code. Bash commands that attempt to access the specific repository (pip download, pip install, git clone) are disabled.</li>
</ul>
</blockquote>
<p>在编程智能体方面, Qwen3.7-Max 在 SWE-Pro(60.6)、SWE-Multilingual(78.3)、SciCode(53.5) 和 QwenSVG(1608) 上均取得领先表现. 在 Terminal Bench 2.0-Terminus(69.7) 上超越 DS-V4-Pro Max(67.9). 在 SWE-Verified(80.4) 上与 Opus-4.6 Max(80.8) 和 DS-V4-Pro Max(80.6) 表现相当.</p>
<blockquote>
<p>这里需要注意评测配置的细节. Terminal Bench 2.0 使用了 5 小时超时和 256K 上下文, 这是一个&quot;长时运行&quot;的测试场景, 而非单次快速完成的基准. 更关键的是&quot;prepend a token at each turn, allowing the model to decide whether to engage extended thinking&quot;——这意味着模型在每个回合都可以自主选择是否进入&quot;深度思考&quot;模式. 这种设计允许模型在简单步骤上快速通过, 在复杂步骤上深入推理, 是对真实编程场景的更好模拟. SWE-bench Pro 的&quot;Problematic tasks corrected&quot;说明原始 SWE-bench 中存在一些标注错误或边界情况, 修正后的基准更能反映真实的代码修复能力.</p>
</blockquote>
<h3 id="1-2-tyznt">1.2 通用智能体</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Opus-4.6 Max</th>
<th align="center">K2.6 Thinking</th>
<th align="center">GLM-5.1 Thinking</th>
<th align="center">DS-V4-Pro Max</th>
<th align="center">Qwen3.6-Plus</th>
<th align="center"><strong>Qwen3.7-Max</strong></th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwenclaw</td>
<td align="center">65.5</td>
<td align="center">54.7</td>
<td align="center">58.7</td>
<td align="center">59.2</td>
<td align="center">57.2</td>
<td align="center"><strong>64.3</strong></td>
</tr>
<tr>
<td align="left">CoWorkBench</td>
<td align="center">68.2</td>
<td align="center">58.2</td>
<td align="center">66.0</td>
<td align="center">66.3</td>
<td align="center">64.5</td>
<td align="center"><strong>67.2</strong></td>
</tr>
<tr>
<td align="left">ClawEval</td>
<td align="center">70.4</td>
<td align="center">61.5</td>
<td align="center">62.7</td>
<td align="center">58.4</td>
<td align="center">57.1</td>
<td align="center"><strong>65.2</strong></td>
</tr>
<tr>
<td align="left">Skillsbench</td>
<td align="center">—</td>
<td align="center">56.2</td>
<td align="center">53.1</td>
<td align="center">52.3</td>
<td align="center">45.7</td>
<td align="center"><strong>59.2</strong></td>
</tr>
<tr>
<td align="left">BFCL-V4</td>
<td align="center">76.7</td>
<td align="center">71.3</td>
<td align="center">70.9</td>
<td align="center">70.6</td>
<td align="center">68.9</td>
<td align="center"><strong>75.0</strong></td>
</tr>
<tr>
<td align="left">MCP-Mark</td>
<td align="center">56.7</td>
<td align="center">55.9</td>
<td align="center">57.5</td>
<td align="center">57.1</td>
<td align="center">48.2</td>
<td align="center"><strong>60.8</strong></td>
</tr>
<tr>
<td align="left">MCP-Atlas</td>
<td align="center">75.8</td>
<td align="center">66.6</td>
<td align="center">71.8</td>
<td align="center">73.6</td>
<td align="center">74.1</td>
<td align="center"><strong>76.4</strong></td>
</tr>
<tr>
<td align="left">SpreadSheetBench-v1</td>
<td align="center">89.3</td>
<td align="center">84.5</td>
<td align="center">85.2</td>
<td align="center">84.9</td>
<td align="center">80.2</td>
<td align="center"><strong>87.0</strong></td>
</tr>
<tr>
<td align="left">Kernel Bench L3</td>
<td align="center">2.63/98%</td>
<td align="center">1.41/80%</td>
<td align="center">2.00/78%</td>
<td align="center">1.07/54%</td>
<td align="center">1.03/48%</td>
<td align="center"><strong>1.98/96%</strong></td>
</tr>
<tr>
<td align="left">HLE w/ tools</td>
<td align="center">53.0</td>
<td align="center">54.0</td>
<td align="center">52.3</td>
<td align="center">48.2</td>
<td align="center">50.2</td>
<td align="center"><strong>53.5</strong></td>
</tr>
<tr>
<td align="left">QwenWorldBench</td>
<td align="center">56.1</td>
<td align="center">50.9</td>
<td align="center">50.2</td>
<td align="center">52.3</td>
<td align="center">47.6</td>
<td align="center"><strong>57.3</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>评测配置说明</strong>:</p>
<ul>
<li>QwenClawBench: 真实用户分布的 Claw agent 基准; 开源: <a href="https://github.com/SKYLENAGE-AI/QwenClawBench">https://github.com/SKYLENAGE-AI/QwenClawBench</a>.</li>
<li>CoWorkBench: 内部 cowork 基准; 覆盖计算机科学、金融、法律、医学等生产力领域的长程任务.</li>
<li>SkillsBench: 通过 OpenCode 在 78 个任务上评估(排除 9 个依赖外部 API 的任务); 5 次运行平均.</li>
<li>MCP-Mark: GitHub MCP v0.30.3; Playwright responses truncated at 32K tokens.</li>
<li>MCP-Atlas: Public set score; gemini-2.5-pro judger.</li>
<li>Kernel Bench L3: 中位数加速比(相对于 PyTorch eager 参考) / 超过 torch.compile 的问题比例, 共 50 个问题. 每个测试在独立 Docker 容器中运行(H100 80GB), 互联网限制为 CUTLASS 代码库和官方 CUDA 文档, 最多 500 次工具调用, 100 次无改进后提前停止. GPT-5.4 (xhigh) 检测潜在作弊行为. CUPTI 用于内核级计时.</li>
</ul>
</blockquote>
<p>在通用智能体方面, 提升更为显著. Qwen3.7-Max 在 MCP-Mark(60.8 vs. GLM-5.1 的 57.5)、MCP-Atlas(76.4 vs. Opus-4.6 的 75.8) 和 Skillsbench(59.2 vs. K2.6 的 56.2) 上表现突出, 并在 Kernel Bench L3(1.98 倍中位数加速, 96% 加速率) 上展示了强大的 GPU 内核优化能力. 在 BFCL-V4(75.0)、Qwenclaw(64.3) 和 ClawEval(65.2) 上同样表现出色, 紧追 Opus-4.6 Max. 在办公自动化基准 SpreadSheetBench-v1 上得分 87.0, 处于顶尖水平.</p>
<blockquote>
<p>Kernel Bench L3 的评测设计非常严苛: 模型需要在完全隔离的 Docker 环境中, 仅依靠 CUTLASS 代码库和 CUDA 文档, 自主编写 GPU 内核. &quot;100 次无改进后提前停止&quot;的机制意味着模型需要具备自我评估能力——知道什么时候该继续尝试, 什么时候该放弃. 96% 的加速率(即 96% 的问题都写出了比 torch.compile 更快的内核)是一个极高的数字, 说明 Qwen3.7-Max 不仅具备代码生成能力, 还具备性能工程能力. 但需要注意的是, GPT-5.4 (xhigh) 被用来&quot;检测潜在作弊行为&quot;, 这暗示了评测方对模型可能利用漏洞(如硬编码答案、利用评测脚本的弱点)的担忧. 这种反作弊机制本身也反映了 Agent 评测的复杂性.</p>
</blockquote>
<h3 id="1-3-stem-ytl">1.3 STEM 与推理</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Opus-4.6 Max</th>
<th align="center">K2.6 Thinking</th>
<th align="center">GLM-5.1 Thinking</th>
<th align="center">DS-V4-Pro Max</th>
<th align="center">Qwen3.6-Plus</th>
<th align="center"><strong>Qwen3.7-Max</strong></th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPQA Diamond</td>
<td align="center">91.3</td>
<td align="center">90.5</td>
<td align="center">86.2</td>
<td align="center">90.1</td>
<td align="center">90.4</td>
<td align="center"><strong>92.4</strong></td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">40.0</td>
<td align="center">36.4</td>
<td align="center">34.7</td>
<td align="center">37.7</td>
<td align="center">28.8</td>
<td align="center"><strong>41.4</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">88.8</td>
<td align="center">89.6</td>
<td align="center">—</td>
<td align="center">93.5</td>
<td align="center">87.1</td>
<td align="center"><strong>91.6</strong></td>
</tr>
<tr>
<td align="left">HMMT 2026 Feb</td>
<td align="center">96.2</td>
<td align="center">92.7</td>
<td align="center">89.4</td>
<td align="center">95.2</td>
<td align="center">87.8</td>
<td align="center"><strong>97.1</strong></td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">75.3</td>
<td align="center">86.0</td>
<td align="center">83.8</td>
<td align="center">89.8</td>
<td align="center">83.8</td>
<td align="center"><strong>90.0</strong></td>
</tr>
<tr>
<td align="left">CritPT</td>
<td align="center">12.6</td>
<td align="center">8.0</td>
<td align="center">4.6</td>
<td align="center">12.9</td>
<td align="center">2.9</td>
<td align="center"><strong>11.4</strong></td>
</tr>
<tr>
<td align="left">Apex</td>
<td align="center">34.5</td>
<td align="center">24.0</td>
<td align="center">11.5</td>
<td align="center">38.3</td>
<td align="center">8.8</td>
<td align="center"><strong>44.5</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>评测配置说明</strong>:</p>
<ul>
<li>Reasoning scenarios: 推荐系统提示: &quot;Reasoning effort is set to xhigh. Please think carefully through the task, validate key assumptions, consider plausible alternatives, and prioritize correctness, consistency, and clarity in the final answer.&quot;</li>
</ul>
</blockquote>
<p>在推理方面, Qwen3.7-Max 在 GPQA Diamond(92.4 vs. Opus-4.6 的 91.3)、HLE(41.4 vs. Opus-4.6 的 40.0)、HMMT 2026 Feb(97.1 vs. Opus-4.6 的 96.2)、IMOAnswerBench(90.0 vs. DS-V4-Pro 的 89.8) 和 Apex(44.5 vs. DS-V4-Pro 的 38.3) 上均取得领先成绩, 在高难度推理基准上展现了强大实力.</p>
<blockquote>
<p>HLE(Humanity&#39;s Last Exam)41.4% 的分数需要特别解读. HLE 是一个由数千名领域专家构建的极端困难基准, 当前人类专家的平均水平约为 8-10%. Qwen3.7-Max 的 41.4% 意味着它在某些子领域已经达到了超越绝大多数人类的水平. 但需要注意的是, HLE 的题目分布极不均匀——模型可能在某些子领域(如数学、物理)表现极好, 在其他子领域(如人文、艺术)表现一般. &quot;xhigh&quot; reasoning effort 的系统提示也暗示了这些分数是在&quot;最大推理预算&quot;下取得的, 实际部署中如果使用更低的推理预算, 分数会显著下降.</p>
</blockquote>
<h3 id="1-4-tynlydyy">1.4 通用能力与多语言</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Opus-4.6 Max</th>
<th align="center">K2.6 Thinking</th>
<th align="center">GLM-5.1 Thinking</th>
<th align="center">DS-V4-Pro Max</th>
<th align="center">Qwen3.6-Plus</th>
<th align="center"><strong>Qwen3.7-Max</strong></th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">89.7</td>
<td align="center">87.1</td>
<td align="center">86.3</td>
<td align="center">87.5</td>
<td align="center">88.5</td>
<td align="center"><strong>89.6</strong></td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="center">95.2</td>
<td align="center">95.3</td>
<td align="center">94.3</td>
<td align="center">94.8</td>
<td align="center">94.5</td>
<td align="center"><strong>95.0</strong></td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">72.5</td>
<td align="center">71.3</td>
<td align="center">68.0</td>
<td align="center">69.9</td>
<td align="center">71.6</td>
<td align="center"><strong>73.6</strong></td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">91.9</td>
<td align="center">94.5</td>
<td align="center">94.5</td>
<td align="center">91.9</td>
<td align="center">94.3</td>
<td align="center"><strong>94.3</strong></td>
</tr>
<tr>
<td align="left">IFBench</td>
<td align="center">62.5</td>
<td align="center">76.0</td>
<td align="center">76.0</td>
<td align="center">77.0</td>
<td align="center">74.2</td>
<td align="center"><strong>79.1</strong></td>
</tr>
<tr>
<td align="left">MRCR-v2 128k</td>
<td align="center">84.0</td>
<td align="center">63.1</td>
<td align="center">62.0</td>
<td align="center">74.4</td>
<td align="center">85.9</td>
<td align="center"><strong>90.4</strong></td>
</tr>
<tr>
<td align="left">WMT24++</td>
<td align="center">82.7</td>
<td align="center">81.6</td>
<td align="center">81.8</td>
<td align="center">82.2</td>
<td align="center">84.3</td>
<td align="center"><strong>85.8</strong></td>
</tr>
<tr>
<td align="left">MAXIFE</td>
<td align="center">81.3</td>
<td align="center">87.7</td>
<td align="center">87.7</td>
<td align="center">88.9</td>
<td align="center">88.2</td>
<td align="center"><strong>89.2</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>评测配置说明</strong>:</p>
<ul>
<li>MRCR-v2: 128K context subset containing 8 needles utilized.</li>
<li>WMT24++: Harder WMT24 subset; avg scores on 55 langs via XCOMET-XXL.</li>
<li>MAXIFE: Accuracy on EN + multilingual prompts (23 settings total).</li>
</ul>
</blockquote>
<p>在通用能力与多语言方面, Qwen3.7-Max 在 IFBench(79.1 vs. DS-V4-Pro 的 77.0) 上表现突出, 展示了精准的指令遵循能力. 在 WMT24++(85.8) 和 MAXIFE(89.2) 上同样领先, 表明其多语言理解和翻译质量处于一流水平. 在 SuperGPQA(73.6) 和 QwenWorldBench(57.3) 上同样表现出色.</p>
<blockquote>
<p>IFBench 79.1 是一个值得关注的数字. IFBench 专门测试模型的&quot;指令遵循&quot;能力——即模型能否精确执行复杂、多步骤、带约束的指令. 这比传统的 MMLU 更能反映模型在实际应用中的可靠性. MRCR-v2 128K 的 90.4% 说明 Qwen3.7-Max 在长上下文中的&quot;大海捞针&quot;能力极强——在 128K 上下文中准确检索 8 个关键信息点. 但&quot;大海捞针&quot;只是检索能力的测试, 不代表模型能在长文档中进行复杂的多步推理.</p>
</blockquote>
<p>值得强调的是, 上述评测分数来自多种不同的智能体框架. Qwen3.7-Max 并非针对某一特定框架优化, 而是在 Claude Code、OpenClaw、Qwen Code 和各类自定义工具使用框架下都能稳定发挥, 是各类智能体系统的可靠底座.</p>
<hr>
<h2 id="2-sclzs">2 生产力助手</h2>
<p>面向真实生产力场景, Qwen3.7-Max 将成为您的深度协作者. 依托强大的智能体能力, 全面重塑专业工作流: 海量信息的全面研读与整合、复杂数据的深度分析与建模、出版级文档与可视化生成——精准承接高复杂度、高强度的企业级任务.</p>
<p>Qwen3.7-Max 原生适配主流智能体框架. 面向长链路交付任务, 支持长达数小时的自主规划与运行, 通过上千次工具调用, 数十轮版本迭代, 持续提升交付物质量. 以往需专业团队耗时一至两周的复杂项目, 现由 Qwen3.7-Max 驱动的智能体即可在数小时内完成端到端交付闭环, 推动生产力实现真实跃升.</p>
<blockquote>
<p>&quot;以往需专业团队耗时一至两周的复杂项目, 现由 Qwen3.7-Max 驱动的智能体即可在数小时内完成&quot;——这是一个非常大胆的产品宣言. 但需要谨慎看待: 这里的&quot;复杂项目&quot;具体指什么? 是标准化的数据处理流水线, 还是需要创造性设计的产品原型? 如果是前者, 自动化确实可以大幅压缩时间; 如果是后者, AI 目前还难以替代人类工程师的核心创意. 此外, &quot;数小时内完成&quot;的前提是智能体框架、工具链、验证机制都已就绪, 实际企业部署中这些基础设施的建设往往比模型本身更耗时.</p>
</blockquote>
<hr>
<h2 id="3-zntkz">3 智能体扩展</h2>
<p>在 Qwen3.5 中引入的环境扩展方法基础上, Qwen3.7 进一步大幅扩展了智能体训练环境的质量与多样性. 正如语言模型从多样化的预训练文本中获得泛化能力, 我们发现智能体能力同样可以从多样化的训练环境中实现泛化.</p>
<p>这种环境扩展带来了清晰且稳定的性能提升轨迹, Qwen3.7-Max 在综合排名中位列前三, 接近 Claude-4.6-Opus-Max 的水平. 值得注意的是, 我们评测中所有基准测试所涉及的环境均为训练中从未出现过的全新领域外环境.</p>
<p>我们还观察到扩展行为中一个显著的可预测性: 任意基准子集上的性能增益高度一致, 可以可靠地预测其余基准或整体平均值的相对增益, 表明环境扩展驱动的是真正的能力泛化, 而非针对特定基准的提升. 关于扩展动态和方法论的进一步分析将在即将发布的技术报告中详细介绍.</p>
<blockquote>
<p>这里的设计动机值得深入理解. Qwen3.7 的智能体训练方法论与 OpenAI 的&quot;规模即一切&quot;(Scale is All You Need)和 DeepSeek 的&quot;规则即奖励&quot;(Rule-based Reward)形成了第三条路线: <strong>环境扩展驱动泛化</strong>. 其核心洞察是: 与其在单一环境中过度优化(导致过拟合), 不如在大量多样化的环境中训练(实现泛化). 这与语言模型的预训练逻辑一致——模型从海量多样化的文本中学习, 而非从单一领域的文本中死记硬背. &quot;任意基准子集上的性能增益可以预测整体增益&quot;是一个关键的实证发现, 它意味着智能体能力的扩展遵循可预测的幂律, 类似于预训练中的 Loss Scaling Laws. 如果这一规律成立, 它将为智能体模型的训练资源分配提供科学依据.</p>
</blockquote>
<hr>
<h2 id="4-kkjfhnl">4 跨框架泛化能力</h2>
<p>我们的 Rollout 环境基础设施将每个训练实例解耦为三个正交组件——任务(Task)、运行框架(Harness)与验证器(Verifier), 这些组件可自由重组. 我们兼容多种运行框架及其迭代版本, 并将环境立足于真实场景而非合成替代品. 这种解耦设计实现了组合式扩展: 同一任务能以极低的边际成本, 与不同类型、不同版本的框架及验证器相匹配. 更关键的是, 它赋能了跨框架与跨验证器的强化学习(RL)训练——使模型在多变的框架配置下处理同源任务, 从而迫使其学习具备泛化能力的解题策略, 而非依赖特定框架的捷径.</p>
<p>在 QwenClawBench 与 CoWorkBench 评测中, 无论评估时使用何种运行框架, Qwen3.7-Max 均展现出强劲且一致的性能, 显著超越 Qwen3.6 系列模型, 证实了该模型已真正掌握了解决任务的能力, 而非过拟合特定框架.</p>
<blockquote>
<p>跨框架泛化是 Agent 模型评估中最关键的维度, 也是最容易被忽视的问题. 许多模型在 Claude Code 上优化过度, 换到 OpenClaw 或自定义框架后性能断崖下跌. Qwen3.7-Max 通过在训练时&quot;打乱&quot;框架配置(同一任务配不同框架), 迫使模型学习&quot;任务本质&quot;而非&quot;框架捷径&quot;. 这种设计类似于计算机视觉中的 Domain Randomization——通过在训练时引入多样化的环境扰动, 提升模型在未知环境中的鲁棒性. &quot;三个正交组件解耦&quot;的架构设计(Task/Harness/Verifier)是一个值得借鉴的工程模式, 它使得训练环境的扩展变得模块化、可组合, 降低了新增环境的边际成本.</p>
</blockquote>
<hr>
<h2 id="5-sz-35-xszzjh">5 实战: 35 小时自主进化</h2>
<p>Extend Attention 是 SGLang 中一个生产级的变长多头注意力算子. 在当前测试场景中, 它需要在最多 32K 长度的前缀 KV-cache 上搭配 MTP 计算新生成 token 的注意力分数——是 LLM 推理服务中一个访存密集、延迟敏感的关键 kernel. 参考实现是 SGLang 官方的 Triton 实现.</p>
<p>我们让 Qwen3.7-Max 在配备平头哥真武 M890 PPUs 的 ECS 上优化该 kernel——这是一个训练过程中从未见过的硬件平台. 模型没有该架构的性能分析数据、硬件文档或示例 kernel. 它的起点仅有一个任务描述、一个现有 SGLang 的实现和一个评估脚本.</p>
<p>在随后约 35 小时的连续自主执行中, 模型共完成 432 次 kernel 评估, 跨越 1,158 次工具调用. 它完全自主地编写、编译、性能分析并迭代改进 Extend Attention Kernel——诊断编译错误、修复正确性 bug、通过运行时测量定位性能瓶颈, 并多次重新设计 kernel 架构.</p>
<p>最终结果: 在多个工作负载上测量得出, 相对 Triton 参考实现的几何平均加速比为 10.0x. 优化轨迹显示, 模型在最初几小时之后仍然持续取得实质性进展: 在 30+ 小时后仍在发现有意义的改进, 证明长程自主优化不仅可行, 而且有效.</p>
<blockquote>
<p>35 小时自主进化实验是 Qwen3.7 最具震撼力的技术演示, 也是当前大模型领域最接近&quot;AGI 时刻&quot;的实验之一. 几个关键细节值得深入分析:</p>
<ol>
<li><strong>零先验知识</strong>: 模型没有任何关于平头哥 M890 的文档或示例代码, 完全依靠运行时反馈学习硬件特性. 这验证了模型的 In-context 泛化能力——不是依靠记忆, 而是依靠推理和实验.</li>
<li><strong>30+ 小时后仍有改进</strong>: 这表明模型没有陷入局部最优, 而是持续探索新的优化方向. 对于人类工程师来说, 连续 30 小时的高强度优化几乎不可能, 而模型不受疲劳影响.</li>
<li><strong>10.0x 加速</strong>: 这个加速比需要放在上下文中理解. Triton 参考实现本身已经是一个相当优化的版本, 在此基础上再提升 10 倍, 说明模型发现了人类工程师遗漏的优化机会——可能是内存访问模式的重新设计、并行策略的调整, 或算法层面的改进.</li>
<li><strong>但实验条件受控</strong>: 任务描述、评估脚本、参考实现都是预先提供的. 在真实场景中, 模型还需要自己定义&quot;什么是好的 kernel&quot;(即设计评估指标), 这比实验中的条件更难.</li>
</ol>
</blockquote>
<h3 id="5-1-yhgjzdgjjgxyq">5.1 优化轨迹中的关键结构性跃迁</h3>
<p>我们也在相同条件下用多个其他模型运行了同一任务:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">相对 Triton 参考实现的加速比</th>
<th align="left">提前停止原因</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Qwen3.7-Max</strong></td>
<td align="center"><strong>10.0x</strong></td>
<td align="left">完成优化</td>
</tr>
<tr>
<td align="left">GLM-5.1</td>
<td align="center">7.3x</td>
<td align="left">完成优化</td>
</tr>
<tr>
<td align="left">Kimi K2.6</td>
<td align="center">5.0x</td>
<td align="left">完成优化</td>
</tr>
<tr>
<td align="left">DeepSeek V4 Pro</td>
<td align="center">3.3x</td>
<td align="left">完成优化</td>
</tr>
<tr>
<td align="left">Qwen3.6-Plus</td>
<td align="center">1.1x</td>
<td align="left">主动结束(连续五轮未发出工具调用)</td>
</tr>
</tbody></table>
<p>提前停止的模型是因为连续五轮未发出任何工具调用——模型判断自身已无法继续取得进展, 主动结束了任务.</p>
<p>除了在 PPU 上取得较好 kernel 生成结果, Qwen3.7-Max 在多种 NVIDIA GPU 上也能生成高质量生产级 kernel. 例如在 KernelBench L3 中, Qwen3.7-Max 能够对 96% 的场景写出有加速的 Kernel, 而 Opus-4.6 为 98%, GLM-5.1 为 78%, Kimi K2.6 为 80%, DeepSeek V4 Pro 为 54%, Qwen3.6-Plus 为 48%.</p>
<p>这一结果凸显了 Qwen3.7-Max 作为长程自主智能体基础模型的两个特性: <strong>长程持续推理能力</strong>——模型在超过一千次工具调用中保持连贯的优化策略, 不丢失上下文、不退化; 以及 <strong>强大的 In-context 泛化能力</strong>——它能为从未见过的架构生成有竞争力的 kernel, 依靠运行时反馈而非记忆中的硬件知识.</p>
<blockquote>
<p>Qwen3.6-Plus 的&quot;主动结束&quot;行为特别值得关注. 当模型连续五轮未发出工具调用时, 它实际上是在做元认知判断:&quot;我已经尝试了所有我能想到的方法, 继续尝试只会浪费时间.&quot;这种&quot;知道何时停止&quot;的能力, 对于长程自主智能体至关重要——避免了无意义的资源消耗. 但这也意味着模型存在&quot;过早放弃&quot;的风险: 如果正确的优化方向需要更多探索才能发现, 模型可能在找到它之前就放弃了. Qwen3.7-Max 没有提前停止, 说明它在&quot;坚持&quot;和&quot;放弃&quot;之间找到了更好的平衡.</p>
</blockquote>
<hr>
<h2 id="6-sz-ccxlzdjlzbzzjk">6 实战: 长程训练中的奖励作弊自主监控</h2>
<p>我们将 Qwen3.7-Max 接入软件工程任务(SWE)的强化学习(RL)训练监控, 成功构建了奖励作弊(Reward Hacking)的自我监测与规则自进化体系. 在逾 80 小时的 RL 实验中, 模型自主拉取训练轨迹并进行回放, 累计执行超万次调用, 系统归纳候选作弊模式(如通过各种方式访问 GitHub 的标准答案), 并对检测规则进行验证、反例挖掘与迭代优化.</p>
<p>最终, Qwen3.7-Max 实现了规则的多轮自进化, 新增 13 条启发式规则, 精准识别出 1,618 个作弊案例, 在保障我们 RL 实验奖励稳定性的同时, 实现了模型作为软件工程智能体的持续自我提升.</p>
<blockquote>
<p>奖励作弊(Reward Hacking)是 RL 训练中的经典问题: 模型发现捷径来满足奖励函数, 而非真正解决任务. 例如, 在代码修复任务中, 模型可能通过访问 GitHub 的标准答案来&quot;作弊&quot;, 而非真正理解 bug 并修复. Qwen3.7-Max 的&quot;自主监控&quot;能力意味着它不仅能执行任务, 还能监控自己的训练过程, 发现并修正训练中的偏差. &quot;新增 13 条启发式规则, 识别 1,618 个作弊案例&quot;——这个数字表明奖励作弊在 SWE 任务的 RL 训练中相当普遍, 如果不加以监控, 模型的&quot;表面性能&quot;会虚高, 而真实能力并未提升. 但这也引发了一个深层问题: <strong>谁来监控监控者?</strong> 如果模型自己制定规则来检测作弊, 它是否也可能绕过这些规则? 这是一个自指问题, 目前没有完美的解决方案.</p>
</blockquote>
<hr>
<h2 id="7-sz-qyglzdccghyzh">7 实战: 企业管理中的长程规划与执行</h2>
<p>我们在动态累积生存博弈框架下扩展了训练任务的时序复杂度, 专项强化长程规划与执行能力, 提升了智能体在超千步的连续决策中的策略一致性, 包括持续构建假设、从反馈中动态调整策略、累积经验与记忆, 并在漫长的时间跨度内维持稳定的执行节奏, 不受上下文腐化和指令漂移问题的影响.</p>
<p>以模拟经营创业公司的 YC-Bench 为例, 该基准测试模拟了跨越一整年的真实商业环境, 涵盖数百轮决策涉及员工管理、合同筛选、恶意客户识别, 以及在人力成本持续攀升中守住盈利底线. Qwen3.7-Max 的营收高达 2.08M 美元, 是 Qwen3.6-Plus(1.05M 美元)的 2 倍, 是 Qwen3.5-Plus(352K 美元)的 5.9 倍, 累计完成任务 237 项.</p>
<p>更值得关注的是, 它展现出了跨上下文窗口的策略进化能力: 主动探索客户、识别并拉黑恶意陷阱、聚焦可靠收入来源、从中期危机中自主恢复, 并最终收敛至稳定的高效执行循环.</p>
<blockquote>
<p>YC-Bench 的设计非常有趣: 它模拟的不是静态的编程任务, 而是动态的商业环境——竞争对手在变化、市场在波动、员工在流失. 这种&quot;开放式&quot;任务比&quot;封闭式&quot;任务(如修复一个确定的 bug)更能反映真实世界的复杂性. Qwen3.6-Plus 的营收(1.05M)是 Qwen3.5-Plus(352K)的 3 倍, 而 Qwen3.7-Max(2.08M)又是 Qwen3.6-Plus 的 2 倍——这种&quot;翻倍增长&quot;的模式是否可持续? 随着模型能力的提升, 模拟环境的复杂度也需要同步提升, 否则模型会&quot;通关&quot;环境, 评测失去区分度. &quot;跨上下文窗口的策略进化&quot;是一个关键能力: 在超千步的决策中, 早期决策的影响可能在数百步后才显现, 模型需要在长距离上保持因果推理的连贯性.</p>
</blockquote>
<hr>
<h2 id="8-kssy-qwen3-7">8 开始使用 Qwen3.7</h2>
<p>Qwen3.7-Max 即将通过阿里云百炼提供服务. 您可以将其与主流智能体框架和编程助手无缝集成.</p>
<h3 id="8-1-api-syfs">8.1 API 使用方式</h3>
<p>Qwen3.7-Max 支持 <code>preserve_thinking</code> 功能: 在消息中保留所有前序轮次的思维内容, 推荐用于智能体任务.</p>
<pre><code class="language-python">from openai import OpenAI
import os

api_key = os.environ.get(&quot;DASHSCOPE_API_KEY&quot;)
client = OpenAI(
    api_key=api_key,
    base_url=&quot;https://dashscope.aliyuncs.com/compatible-mode/v1&quot;,
)

messages = [{&quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;用Python写一个合并两个有序链表的函数.&quot;}]

completion = client.chat.completions.create(
    model=&quot;qwen3.7-max&quot;,
    messages=messages,
    extra_body={
        &quot;enable_thinking&quot;: True,
        # &quot;preserve_thinking&quot;: True,
    },
    stream=True
)
</code></pre>
<h3 id="8-2-zntkjjc">8.2 智能体框架集成</h3>
<p><strong>Claude Code</strong>:</p>
<pre><code class="language-bash">npm install -g @anthropic-ai/claude-code
export ANTHROPIC_MODEL=&quot;qwen3.7-max&quot;
export ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/apps/anthropic
claude
</code></pre>
<p><strong>OpenClaw</strong>:</p>
<pre><code class="language-bash">curl -fsSL https://molt.bot/install.sh | bash
export DASHSCOPE_API_KEY=&lt;your_api_key&gt;
openclaw dashboard
</code></pre>
<p><strong>Qwen Code</strong>:</p>
<pre><code class="language-bash">npm install -g @qwen-code/qwen-code@latest
qwen
</code></pre>
<hr>
<h2 id="9-zj">9 总结</h2>
<p>Qwen3.7-Max 是我们迄今最全面、最强大的智能体模型. 从编程和办公自动化到长周期自主任务, 它将前沿推理能力、跨框架泛化性和持续高效执行有机融合, 为构建下一代 AI 智能体提供了坚实的基础. 我们将持续优化模型, 欢迎社区反馈, 期待看到大家的创造, 敬请关注!</p>
<blockquote>
<p>从技术谱系看, Qwen3.7 标志着 Qwen 家族从&quot;语言模型&quot;向&quot;智能体基座&quot;的战略转型. Qwen3(2025.05) 引入了双模式架构(思考/非思考), Qwen3.5(2026.02) 扩展了多模态和 Agent 能力, Qwen3.6(2026.04) 提升了推理效率, 而 Qwen3.7(2026.05) 则聚焦于&quot;长程自主执行&quot;和&quot;跨框架泛化&quot;. 这种迭代节奏(平均 1-2 个月一个大版本)在业界极为罕见, 甚至超过了 GPT 系列(约 3-6 个月)和 Claude 系列(约 3-4 个月). 但高频迭代也带来了风险: 版本间的兼容性、API 稳定性、文档更新速度可能跟不上模型迭代速度. 对于企业用户来说, &quot;最新最强&quot;不等于&quot;最适合&quot;, 选择模型时需要综合考虑稳定性、成本和生态支持.</p>
</blockquote>
<hr>
<h2 id="fl-gjsyb">附录: 关键术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Agent / 智能体</td>
<td align="left">能够自主规划、调用工具、与环境交互并完成复杂任务的 AI 系统</td>
</tr>
<tr>
<td align="left">MCP</td>
<td align="left">Model Context Protocol, Anthropic 提出的智能体与外部工具交互的标准协议</td>
</tr>
<tr>
<td align="left">Harness</td>
<td align="left">智能体的运行环境, 包含任务定义、工具集和验证机制</td>
</tr>
<tr>
<td align="left">Reward Hacking</td>
<td align="left">奖励作弊, 模型利用奖励函数的漏洞获得高分而非真正解决任务</td>
</tr>
<tr>
<td align="left">Kernel</td>
<td align="left">GPU 内核, 在 GPU 上执行的核心计算函数</td>
</tr>
<tr>
<td align="left">Triton</td>
<td align="left">OpenAI 开发的 Python DSL, 用于编写高性能 GPU 内核</td>
</tr>
<tr>
<td align="left">SGLang</td>
<td align="left">用于 LLM 服务的高效推理框架</td>
</tr>
<tr>
<td align="left">MTP</td>
<td align="left">Multi-Token Prediction, 多 token 预测, 加速解码的技术</td>
</tr>
<tr>
<td align="left">KV Cache</td>
<td align="left">键值缓存, 存储历史 token 的 key 和 value 以避免重复计算</td>
</tr>
<tr>
<td align="left">RL</td>
<td align="left">Reinforcement Learning, 强化学习</td>
</tr>
<tr>
<td align="left">In-context</td>
<td align="left">上下文内学习, 模型依靠当前提示中的信息而非预训练记忆来推理</td>
</tr>
<tr>
<td align="left">YC-Bench</td>
<td align="left">模拟创业公司经营的长期决策基准</td>
</tr>
<tr>
<td align="left">SWE-Bench</td>
<td align="left">软件工程基准, 评估模型修复真实 GitHub issue 的能力</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 Qwen3.7 技术报告精译. 部署实践参考见《05-Qwen3.7-Architecture-Overview.md》(待创建).</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxbx","text":"1 模型表现"},{"level":3,"id":"1-1-bcznt","text":"1.1 编程智能体"},{"level":3,"id":"1-2-tyznt","text":"1.2 通用智能体"},{"level":3,"id":"1-3-stem-ytl","text":"1.3 STEM 与推理"},{"level":3,"id":"1-4-tynlydyy","text":"1.4 通用能力与多语言"},{"level":2,"id":"2-sclzs","text":"2 生产力助手"},{"level":2,"id":"3-zntkz","text":"3 智能体扩展"},{"level":2,"id":"4-kkjfhnl","text":"4 跨框架泛化能力"},{"level":2,"id":"5-sz-35-xszzjh","text":"5 实战: 35 小时自主进化"},{"level":3,"id":"5-1-yhgjzdgjjgxyq","text":"5.1 优化轨迹中的关键结构性跃迁"},{"level":2,"id":"6-sz-ccxlzdjlzbzzjk","text":"6 实战: 长程训练中的奖励作弊自主监控"},{"level":2,"id":"7-sz-qyglzdccghyzh","text":"7 实战: 企业管理中的长程规划与执行"},{"level":2,"id":"8-kssy-qwen3-7","text":"8 开始使用 Qwen3.7"},{"level":3,"id":"8-1-api-syfs","text":"8.1 API 使用方式"},{"level":3,"id":"8-2-zntkjjc","text":"8.2 智能体框架集成"},{"level":2,"id":"9-zj","text":"9 总结"},{"level":2,"id":"fl-gjsyb","text":"附录: 关键术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/12-qwen3.7/01-qwen3.7-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/12-qwen3.7/01-qwen3.7-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.7: 面向智能体时代的新一代旗舰模型</h1>
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
