"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.6: 全尺度智能体编程能力的飞跃</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All / Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model
原文链接: <a href="https://qwen.ai/blog?id=qwen3.6-35b-a3b">https://qwen.ai/blog?id=qwen3.6-35b-a3b</a> / <a href="https://qwen.ai/blog?id=qwen3.6-27b">https://qwen.ai/blog?id=qwen3.6-27b</a>
发布日期: 2026-04-15 / 2026-04-22
发布机构: Qwen Team (阿里云)
模型规格:</p>
<ul>
<li>Qwen3.6-35B-A3B: 35B 总参数 / 3B 激活参数 (MoE)</li>
<li>Qwen3.6-27B: 27B 参数 (Dense)</li>
<li>Qwen3.6-Plus / Qwen3.6-Max-Preview: 线上 API 版本
上下文窗口: 128K (API), 256K (Agent 场景)</li>
</ul>
</blockquote>
<hr>
<p>继 Qwen3.6-Plus 发布之后, Qwen Team 于 2026 年 4 月相继开源了 Qwen3.6-35B-A3B 和 Qwen3.6-27B, 构建起覆盖全尺度的 Qwen3.6 开源家族. 这两个模型均支持多模态思考与非思考模式, 在智能体编程方面达到了旗舰级表现.</p>
<p><strong>Qwen3.6-35B-A3B</strong> 是一个稀疏但能力出色的混合专家(MoE)模型, 总参数量 350 亿, 激活参数仅 30 亿. 尽管高效轻量, 它在智能体编程方面表现卓越, 大幅超越前代模型 Qwen3.5-35B-A3B, 并可与 Qwen3.5-27B 和 Gemma-4-31B 等稠密模型一较高下.</p>
<p><strong>Qwen3.6-27B</strong> 是一个拥有 270 亿参数的稠密多模态模型, 是社区呼声最高的模型规格. 作为稠密架构, 它无需 MoE 路由即可部署, 在智能体编程方面全面超越前代开源旗舰 Qwen3.5-397B-A17B(总参数 397B / 激活参数 17B 的 MoE 模型)——包括 SWE-bench Verified(77.2 vs. 76.2)、SWE-bench Pro(53.5 vs. 50.9)、Terminal-Bench 2.0(59.3 vs. 52.5)以及 SkillsBench(48.2 vs. 30.0). 它是开发者在实用、可广泛部署规模上获取顶尖编程能力的理想选择.</p>
<p>两个模型均已在 Qwen Studio 上线, 可通过阿里云百炼 API 调用, 并以开源权重的形式向社区发布.</p>
<blockquote>
<p>译者注(设计动机): Qwen3.6 家族的产品策略揭示了一个反直觉但深刻的技术判断: 在智能体编程这一特定能力维度上, 模型质量(数据、训练方法)的权重正在超越模型规模. Qwen3.6-27B 以 27B 稠密参数全面超越 397B/17B 的 MoE 前代旗舰, 这一事实对传统「规模即能力」的假设构成了直接挑战. 可能的解释包括: (1) Qwen3.6 采用了更优质的代码/Agent 训练数据, 尤其是真实用户分布的反馈数据; (2) 后训练阶段的 RL 环境可能针对编程 Agent 做了专门优化; (3) 稠密模型在单步推理的一致性上可能优于小激活参数的 MoE(3B 激活 vs 27B 全参数). 这种「小模型、强能力」的趋势对开源社区意义深远——它意味着开发者无需部署庞大的 MoE 基础设施, 即可在本地获得顶级的 Agent 编程能力.</p>
</blockquote>
<hr>
<h2 id="1-mxbx">1 模型表现</h2>
<h3 id="1-1-zryyjz">1.1 自然语言基准</h3>
<h4 id="1-1-1-qwen3-6-35b-a3b-ytgmmxdb">1.1.1 Qwen3.6-35B-A3B 与同规模模型对比</h4>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen3.5-27B</th>
<th align="center">Gemma4-31B</th>
<th align="center">Qwen3.5-35B-A3B</th>
<th align="center">Gemma4-26B-A4B</th>
<th align="center">Qwen3.6-35B-A3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>编码 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">SWE-bench Verified</td>
<td align="center">75.0</td>
<td align="center">52.0</td>
<td align="center">70.0</td>
<td align="center">17.4</td>
<td align="center">73.4</td>
</tr>
<tr>
<td align="left">SWE-bench Multilingual</td>
<td align="center">69.3</td>
<td align="center">51.7</td>
<td align="center">60.3</td>
<td align="center">17.3</td>
<td align="center">67.2</td>
</tr>
<tr>
<td align="left">SWE-bench Pro</td>
<td align="center">51.2</td>
<td align="center">35.7</td>
<td align="center">44.6</td>
<td align="center">13.8</td>
<td align="center">49.5</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0</td>
<td align="center">41.6</td>
<td align="center">42.9</td>
<td align="center">40.5</td>
<td align="center">34.2</td>
<td align="center">51.5</td>
</tr>
<tr>
<td align="left">Claw-Eval Avg</td>
<td align="center">64.3</td>
<td align="center">48.5</td>
<td align="center">65.4</td>
<td align="center">58.8</td>
<td align="center">68.7</td>
</tr>
<tr>
<td align="left">Claw-Eval Pass^3</td>
<td align="center">46.2</td>
<td align="center">25.0</td>
<td align="center">51.0</td>
<td align="center">28.0</td>
<td align="center">50.0</td>
</tr>
<tr>
<td align="left">SkillsBench Avg5</td>
<td align="center">27.2</td>
<td align="center">23.6</td>
<td align="center">4.4</td>
<td align="center">12.3</td>
<td align="center">28.7</td>
</tr>
<tr>
<td align="left">QwenClawBench</td>
<td align="center">52.2</td>
<td align="center">41.7</td>
<td align="center">47.7</td>
<td align="center">38.7</td>
<td align="center">52.6</td>
</tr>
<tr>
<td align="left">NL2Repo</td>
<td align="center">27.3</td>
<td align="center">15.5</td>
<td align="center">20.5</td>
<td align="center">11.6</td>
<td align="center">29.4</td>
</tr>
<tr>
<td align="left">QwenWebBench</td>
<td align="center">1068</td>
<td align="center">1197</td>
<td align="center">978</td>
<td align="center">1178</td>
<td align="center">1397</td>
</tr>
<tr>
<td align="left"><strong>通用 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">TAU3-Bench</td>
<td align="center">68.4</td>
<td align="center">67.5</td>
<td align="center">68.9</td>
<td align="center">59.0</td>
<td align="center">67.2</td>
</tr>
<tr>
<td align="left">VITA-Bench</td>
<td align="center">41.8</td>
<td align="center">43.0</td>
<td align="center">29.1</td>
<td align="center">36.9</td>
<td align="center">35.6</td>
</tr>
<tr>
<td align="left">DeepPlanning</td>
<td align="center">22.6</td>
<td align="center">24.0</td>
<td align="center">22.8</td>
<td align="center">16.2</td>
<td align="center">25.9</td>
</tr>
<tr>
<td align="left">Tool Decathlon</td>
<td align="center">31.5</td>
<td align="center">21.2</td>
<td align="center">28.7</td>
<td align="center">12.0</td>
<td align="center">26.9</td>
</tr>
<tr>
<td align="left">MCPMark</td>
<td align="center">36.3</td>
<td align="center">18.1</td>
<td align="center">27.0</td>
<td align="center">14.2</td>
<td align="center">37.0</td>
</tr>
<tr>
<td align="left">MCP-Atlas</td>
<td align="center">68.4</td>
<td align="center">57.2</td>
<td align="center">62.4</td>
<td align="center">50.0</td>
<td align="center">62.8</td>
</tr>
<tr>
<td align="left">WideSearch</td>
<td align="center">66.4</td>
<td align="center">35.2</td>
<td align="center">59.1</td>
<td align="center">38.3</td>
<td align="center">60.1</td>
</tr>
<tr>
<td align="left"><strong>知识</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">86.1</td>
<td align="center">85.2</td>
<td align="center">85.3</td>
<td align="center">82.6</td>
<td align="center">85.2</td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="center">93.2</td>
<td align="center">93.7</td>
<td align="center">93.3</td>
<td align="center">92.7</td>
<td align="center">93.3</td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">65.6</td>
<td align="center">65.7</td>
<td align="center">63.4</td>
<td align="center">61.4</td>
<td align="center">64.7</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">90.5</td>
<td align="center">82.6</td>
<td align="center">90.2</td>
<td align="center">82.5</td>
<td align="center">90.0</td>
</tr>
<tr>
<td align="left"><strong>STEM 与推理</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">85.5</td>
<td align="center">84.3</td>
<td align="center">84.2</td>
<td align="center">82.3</td>
<td align="center">86.0</td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">24.3</td>
<td align="center">19.5</td>
<td align="center">22.4</td>
<td align="center">8.7</td>
<td align="center">21.4</td>
</tr>
<tr>
<td align="left">LiveCodeBench v6</td>
<td align="center">80.7</td>
<td align="center">80.0</td>
<td align="center">74.6</td>
<td align="center">77.1</td>
<td align="center">80.4</td>
</tr>
<tr>
<td align="left">HMMT Feb 25</td>
<td align="center">92.0</td>
<td align="center">88.7</td>
<td align="center">89.0</td>
<td align="center">91.7</td>
<td align="center">90.7</td>
</tr>
<tr>
<td align="left">HMMT Nov 25</td>
<td align="center">89.8</td>
<td align="center">87.5</td>
<td align="center">89.2</td>
<td align="center">87.5</td>
<td align="center">89.1</td>
</tr>
<tr>
<td align="left">HMMT Feb 26</td>
<td align="center">84.3</td>
<td align="center">77.2</td>
<td align="center">78.7</td>
<td align="center">79.0</td>
<td align="center">83.6</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">79.9</td>
<td align="center">74.5</td>
<td align="center">76.8</td>
<td align="center">74.3</td>
<td align="center">78.9</td>
</tr>
<tr>
<td align="left">AIME26</td>
<td align="center">92.6</td>
<td align="center">89.2</td>
<td align="center">91.0</td>
<td align="center">88.3</td>
<td align="center">92.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Qwen3.6-35B-A3B 与同规模模型的自然语言基准对比. 数据来自官方博客, 2026 年 4 月.</p>
</blockquote>
<p><strong>基准注释说明:</strong></p>
<ul>
<li>SWE-Bench Series: 内部 Agent 脚手架(bash + file-edit tools); temp=1.0, top_p=0.95, 200K 上下文窗口. 已修正 SWE-bench Pro 公开集中的部分问题任务, 所有基线均在修正后的基准上评估.</li>
<li>Terminal-Bench 2.0: Harbor/Terminus-2 harness; 3h 超时, 32 CPU/48 GB RAM; temp=1.0, top_p=0.95, top_k=20, max_tokens=80K, 256K ctx; 5 次运行平均.</li>
<li>SkillsBench: 通过 OpenCode 在 78 个任务(自包含子集, 排除 API 依赖任务)上评估; 5 次运行平均.</li>
<li>NL2Repo: 其他模型通过 Claude Code 评估(temp=1.0, top_p=0.95, max_turns=900).</li>
<li>QwenClawBench: 内部真实用户分布的 Claw agent 基准(即将开源); temp=0.6, 256K ctx.</li>
<li>QwenWebBench: 内部前端代码生成基准; 双语(EN/CN), 7 个类别(网页设计、Web 应用、游戏、SVG、数据可视化、动画、3D); 自动渲染 + 多模态评判(代码/视觉正确性); BT/Elo 评分系统.</li>
<li>TAU3-Bench: 使用官方用户模型(gpt-5.2, low reasoning effort) + 默认 BM25 检索.</li>
<li>VITA-Bench: 子领域平均分; 使用 claude-4-sonnet 作为评判器(官方评判器 claude-3.7-sonnet 已不可用).</li>
<li>MCPMark: GitHub MCP v0.30.3; Playwright 响应截断至 32K tokens.</li>
<li>MCP-Atlas: 公开集分数; gemini-2.5-pro 评判器.</li>
<li>AIME 26: 使用完整 AIME 2026 (I &amp; II), 分数可能与 Qwen 3.5 的记录不同.</li>
</ul>
<h4 id="1-1-2-qwen3-6-27b-yqhdjqymxdb">1.1.2 Qwen3.6-27B 与前后代及前沿模型对比</h4>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen3.5-27B</th>
<th align="center">Qwen3.5-397B-A17B</th>
<th align="center">Gemma4-31B</th>
<th align="center">Claude 4.5 Opus</th>
<th align="center">Qwen3.6-35B-A3B</th>
<th align="center">Qwen3.6-27B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>编码 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">SWE-bench Verified</td>
<td align="center">75.0</td>
<td align="center">76.2</td>
<td align="center">52.0</td>
<td align="center">80.9</td>
<td align="center">73.4</td>
<td align="center">77.2</td>
</tr>
<tr>
<td align="left">SWE-bench Pro</td>
<td align="center">51.2</td>
<td align="center">50.9</td>
<td align="center">35.7</td>
<td align="center">57.1</td>
<td align="center">49.5</td>
<td align="center">53.5</td>
</tr>
<tr>
<td align="left">SWE-bench Multilingual</td>
<td align="center">69.3</td>
<td align="center">69.3</td>
<td align="center">51.7</td>
<td align="center">77.5</td>
<td align="center">67.2</td>
<td align="center">71.3</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0</td>
<td align="center">41.6</td>
<td align="center">52.5</td>
<td align="center">42.9</td>
<td align="center">59.3</td>
<td align="center">51.5</td>
<td align="center">59.3</td>
</tr>
<tr>
<td align="left">SkillsBench Avg5</td>
<td align="center">27.2</td>
<td align="center">30.0</td>
<td align="center">23.6</td>
<td align="center">45.3</td>
<td align="center">28.7</td>
<td align="center">48.2</td>
</tr>
<tr>
<td align="left">QwenWebBench</td>
<td align="center">1068</td>
<td align="center">1186</td>
<td align="center">1197</td>
<td align="center">1536</td>
<td align="center">1397</td>
<td align="center">1487</td>
</tr>
<tr>
<td align="left">NL2Repo</td>
<td align="center">27.3</td>
<td align="center">32.2</td>
<td align="center">15.5</td>
<td align="center">43.2</td>
<td align="center">29.4</td>
<td align="center">36.2</td>
</tr>
<tr>
<td align="left">Claw-Eval Avg</td>
<td align="center">64.3</td>
<td align="center">70.7</td>
<td align="center">48.5</td>
<td align="center">76.6</td>
<td align="center">68.7</td>
<td align="center">72.4</td>
</tr>
<tr>
<td align="left">Claw-Eval Pass^3</td>
<td align="center">46.2</td>
<td align="center">48.1</td>
<td align="center">25.0</td>
<td align="center">59.6</td>
<td align="center">50.0</td>
<td align="center">60.6</td>
</tr>
<tr>
<td align="left">QwenClawBench</td>
<td align="center">52.2</td>
<td align="center">51.8</td>
<td align="center">41.7</td>
<td align="center">52.3</td>
<td align="center">52.6</td>
<td align="center">53.4</td>
</tr>
<tr>
<td align="left"><strong>知识</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">86.1</td>
<td align="center">87.8</td>
<td align="center">85.2</td>
<td align="center">89.5</td>
<td align="center">85.2</td>
<td align="center">86.2</td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="center">93.2</td>
<td align="center">94.9</td>
<td align="center">93.7</td>
<td align="center">95.6</td>
<td align="center">93.3</td>
<td align="center">93.5</td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">65.6</td>
<td align="center">70.4</td>
<td align="center">65.7</td>
<td align="center">70.6</td>
<td align="center">64.7</td>
<td align="center">66.0</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">90.5</td>
<td align="center">93.0</td>
<td align="center">82.6</td>
<td align="center">92.2</td>
<td align="center">90.0</td>
<td align="center">91.4</td>
</tr>
<tr>
<td align="left"><strong>STEM 与推理</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPQA Diamond</td>
<td align="center">85.5</td>
<td align="center">88.4</td>
<td align="center">84.3</td>
<td align="center">87.0</td>
<td align="center">86.0</td>
<td align="center">87.8</td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">24.3</td>
<td align="center">28.7</td>
<td align="center">19.5</td>
<td align="center">30.8</td>
<td align="center">21.4</td>
<td align="center">24.0</td>
</tr>
<tr>
<td align="left">LiveCodeBench v6</td>
<td align="center">80.7</td>
<td align="center">83.6</td>
<td align="center">80.0</td>
<td align="center">84.8</td>
<td align="center">80.4</td>
<td align="center">83.9</td>
</tr>
<tr>
<td align="left">HMMT Feb 25</td>
<td align="center">92.0</td>
<td align="center">94.8</td>
<td align="center">88.7</td>
<td align="center">92.9</td>
<td align="center">90.7</td>
<td align="center">93.8</td>
</tr>
<tr>
<td align="left">HMMT Nov 25</td>
<td align="center">89.8</td>
<td align="center">92.7</td>
<td align="center">87.5</td>
<td align="center">93.3</td>
<td align="center">89.1</td>
<td align="center">90.7</td>
</tr>
<tr>
<td align="left">HMMT Feb 26</td>
<td align="center">84.3</td>
<td align="center">87.9</td>
<td align="center">77.2</td>
<td align="center">85.3</td>
<td align="center">83.6</td>
<td align="center">84.3</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">79.9</td>
<td align="center">80.9</td>
<td align="center">74.5</td>
<td align="center">84.0</td>
<td align="center">78.9</td>
<td align="center">80.8</td>
</tr>
<tr>
<td align="left">AIME26</td>
<td align="center">92.6</td>
<td align="center">93.3</td>
<td align="center">89.2</td>
<td align="center">95.1</td>
<td align="center">92.7</td>
<td align="center">94.1</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Qwen3.6-27B 与前后代及前沿模型的自然语言基准对比.</p>
</blockquote>
<blockquote>
<p>译者注(数据实验): 表 2 中最引人注目的数字是 SkillsBench: Qwen3.6-27B 以 48.2 分大幅超越 Qwen3.5-397B-A17B 的 30.0 分——这是一个 60% 的相对提升, 且是在模型规模缩小约 15 倍(27B vs 397B 总参数)的情况下实现的. SkillsBench 通过 OpenCode 在 78 个自包含任务上评估, 反映的是真实编程助手的端到端能力, 而非单一代码补全. 这一差距说明 Qwen3.6 在「Agent 脚手架 + 工具调用 + 多轮推理」的整合能力上有了质的飞跃. 另一个关键对比是 Terminal-Bench 2.0: Qwen3.6-27B(59.3) 与 Claude 4.5 Opus(59.3) 持平, 超越 Qwen3.5-397B-A17B(52.5) 近 7 分——在终端自动化场景中, 27B 稠密模型已达到顶级闭源水平. 然而, 在纯知识任务(MMLU-Pro 86.2 vs 87.8)和 SuperGPQA(66.0 vs 70.4)上, Qwen3.6-27B 仍略逊于 397B/17B 的 MoE 前代, 这符合预期: 知识密集型任务仍受益于更大的模型容量, 而 Agent 编程能力更依赖于训练数据质量和后训练方法.</p>
</blockquote>
<hr>
<h3 id="1-2-sjyyjz">1.2 视觉语言基准</h3>
<h4 id="1-2-1-qwen3-6-35b-a3b-sjyybx">1.2.1 Qwen3.6-35B-A3B 视觉语言表现</h4>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen3.5-27B</th>
<th align="center">Claude-Sonnet-4.5</th>
<th align="center">Gemma4-31B</th>
<th align="center">Gemma4-26B-A4B</th>
<th align="center">Qwen3.5-35B-A3B</th>
<th align="center">Qwen3.6-35B-A3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>STEM 与谜题</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMMU</td>
<td align="center">82.3</td>
<td align="center">79.6</td>
<td align="center">80.4</td>
<td align="center">78.4</td>
<td align="center">81.4</td>
<td align="center">81.7</td>
</tr>
<tr>
<td align="left">MMMU-Pro</td>
<td align="center">75.0</td>
<td align="center">68.4</td>
<td align="center">76.9*</td>
<td align="center">73.8*</td>
<td align="center">75.1</td>
<td align="center">75.3</td>
</tr>
<tr>
<td align="left">Mathvista(mini)</td>
<td align="center">87.8</td>
<td align="center">79.8</td>
<td align="center">79.3</td>
<td align="center">79.4</td>
<td align="center">86.2</td>
<td align="center">86.4</td>
</tr>
<tr>
<td align="left">ZEROBench_sub</td>
<td align="center">36.2</td>
<td align="center">26.3</td>
<td align="center">26.0</td>
<td align="center">26.3</td>
<td align="center">34.1</td>
<td align="center">34.4</td>
</tr>
<tr>
<td align="left"><strong>通用 VQA</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">RealWorldQA</td>
<td align="center">83.7</td>
<td align="center">70.3</td>
<td align="center">72.3</td>
<td align="center">72.2</td>
<td align="center">84.1</td>
<td align="center">85.3</td>
</tr>
<tr>
<td align="left">MMBenchEN-DEV-v1.1</td>
<td align="center">92.6</td>
<td align="center">88.3</td>
<td align="center">90.9</td>
<td align="center">89.0</td>
<td align="center">91.5</td>
<td align="center">92.8</td>
</tr>
<tr>
<td align="left">SimpleVQA</td>
<td align="center">56.0</td>
<td align="center">57.6</td>
<td align="center">52.9</td>
<td align="center">52.2</td>
<td align="center">58.3</td>
<td align="center">58.9</td>
</tr>
<tr>
<td align="left">HallusionBench</td>
<td align="center">70.0</td>
<td align="center">59.9</td>
<td align="center">67.4</td>
<td align="center">66.1</td>
<td align="center">67.9</td>
<td align="center">69.8</td>
</tr>
<tr>
<td align="left"><strong>文本识别与文档理解</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">OmniDocBench1.5</td>
<td align="center">88.9</td>
<td align="center">85.8</td>
<td align="center">80.1</td>
<td align="center">74.4</td>
<td align="center">89.3</td>
<td align="center">89.9</td>
</tr>
<tr>
<td align="left">CharXiv(RQ)</td>
<td align="center">79.5</td>
<td align="center">67.2</td>
<td align="center">67.9</td>
<td align="center">69.0</td>
<td align="center">77.5</td>
<td align="center">78.0</td>
</tr>
<tr>
<td align="left">CC-OCR</td>
<td align="center">81.0</td>
<td align="center">68.1</td>
<td align="center">75.7</td>
<td align="center">74.5</td>
<td align="center">80.7</td>
<td align="center">81.9</td>
</tr>
<tr>
<td align="left">AI2D_TEST</td>
<td align="center">92.9</td>
<td align="center">87.0</td>
<td align="center">89.0</td>
<td align="center">88.3</td>
<td align="center">92.6</td>
<td align="center">92.7</td>
</tr>
<tr>
<td align="left"><strong>空间智能</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">RefCOCO(avg)</td>
<td align="center">90.9</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">89.2</td>
<td align="center">92.0</td>
</tr>
<tr>
<td align="left">ODInW13</td>
<td align="center">41.1</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">42.6</td>
<td align="center">50.8</td>
</tr>
<tr>
<td align="left">EmbSpatialBench</td>
<td align="center">84.5</td>
<td align="center">71.8</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">83.1</td>
<td align="center">84.3</td>
</tr>
<tr>
<td align="left">RefSpatialBench</td>
<td align="center">67.7</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">63.5</td>
<td align="center">64.3</td>
</tr>
<tr>
<td align="left"><strong>视频理解</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">VideoMME(w sub.)</td>
<td align="center">87.0</td>
<td align="center">81.1</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">86.6</td>
<td align="center">86.6</td>
</tr>
<tr>
<td align="left">VideoMME(w/o sub.)</td>
<td align="center">82.8</td>
<td align="center">75.3</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">82.5</td>
<td align="center">82.5</td>
</tr>
<tr>
<td align="left">VideoMMMU</td>
<td align="center">82.3</td>
<td align="center">77.6</td>
<td align="center">81.6</td>
<td align="center">76.0</td>
<td align="center">80.4</td>
<td align="center">83.7</td>
</tr>
<tr>
<td align="left">MLVU</td>
<td align="center">85.9</td>
<td align="center">72.8</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">85.6</td>
<td align="center">86.2</td>
</tr>
<tr>
<td align="left">MVBench</td>
<td align="center">74.6</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">74.8</td>
<td align="center">74.6</td>
</tr>
<tr>
<td align="left">LVBench</td>
<td align="center">73.6</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">71.4</td>
<td align="center">71.4</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Qwen3.6-35B-A3B 与同规模模型的视觉语言基准对比.</p>
</blockquote>
<p><strong>基准注释说明:</strong></p>
<ul>
<li>空单元格(--)表示分数尚未获得或不适用.</li>
<li>MMMU-Pro 带 * 号的分数来自特定评估设置.</li>
</ul>
<blockquote>
<p>译者注(数据实验): Qwen3.6-35B-A3B 在视觉语言上的表现同样值得关注. 仅凭约 30 亿激活参数, 其在 RealWorldQA(85.3)、MMBench(92.8)、OmniDocBench(89.9)等基准上已接近或超越 Claude Sonnet 4.5 和 Gemma4-31B. 空间智能是突出优势: RefCOCO(92.0)和 ODInW13(50.8)相较前代(89.2 / 42.6)有显著提升, 尤其是 ODInW13 的 8.2 分跃升说明模型在开放词汇物体检测上的能力大幅增强. 这一能力与 Qwen3.6 作为「视觉 Agent」的定位高度一致——能够精确识别 UI 元素的空间位置是 GUI 自动化的前提.</p>
</blockquote>
<h4 id="1-2-2-qwen3-6-27b-sjyybx">1.2.2 Qwen3.6-27B 视觉语言表现</h4>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen3.5-27B</th>
<th align="center">Qwen3.5-397B-A17B</th>
<th align="center">Gemma4-31B</th>
<th align="center">Claude 4.5 Opus</th>
<th align="center">Qwen3.6-35B-A3B</th>
<th align="center">Qwen3.6-27B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>STEM 与谜题</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMMU</td>
<td align="center">82.3</td>
<td align="center">85.0</td>
<td align="center">80.4</td>
<td align="center">80.7</td>
<td align="center">81.7</td>
<td align="center">82.9</td>
</tr>
<tr>
<td align="left">MMMU-Pro</td>
<td align="center">75.0</td>
<td align="center">79.0</td>
<td align="center">76.9</td>
<td align="center">70.6</td>
<td align="center">75.3</td>
<td align="center">75.8</td>
</tr>
<tr>
<td align="left">MathVista mini</td>
<td align="center">87.8</td>
<td align="center">--</td>
<td align="center">79.3</td>
<td align="center">--</td>
<td align="center">86.4</td>
<td align="center">87.4</td>
</tr>
<tr>
<td align="left">DynaMath</td>
<td align="center">87.7</td>
<td align="center">86.3</td>
<td align="center">79.5</td>
<td align="center">79.7</td>
<td align="center">82.8</td>
<td align="center">85.6</td>
</tr>
<tr>
<td align="left">VlmsAreBlind</td>
<td align="center">96.9</td>
<td align="center">--</td>
<td align="center">87.2</td>
<td align="center">--</td>
<td align="center">96.6</td>
<td align="center">97.0</td>
</tr>
<tr>
<td align="left"><strong>通用 VQA</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">RealWorldQA</td>
<td align="center">83.7</td>
<td align="center">83.9</td>
<td align="center">72.3</td>
<td align="center">77.0</td>
<td align="center">85.3</td>
<td align="center">84.1</td>
</tr>
<tr>
<td align="left">MMStar</td>
<td align="center">81.0</td>
<td align="center">83.8</td>
<td align="center">77.3</td>
<td align="center">73.2</td>
<td align="center">80.7</td>
<td align="center">81.4</td>
</tr>
<tr>
<td align="left">MMBenchEN-DEV-v1.1</td>
<td align="center">92.6</td>
<td align="center">--</td>
<td align="center">90.9</td>
<td align="center">--</td>
<td align="center">92.8</td>
<td align="center">92.3</td>
</tr>
<tr>
<td align="left">SimpleVQA</td>
<td align="center">56.0</td>
<td align="center">67.1</td>
<td align="center">52.9</td>
<td align="center">65.7</td>
<td align="center">58.9</td>
<td align="center">56.1</td>
</tr>
<tr>
<td align="left"><strong>文档理解</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">CharXiv RQ</td>
<td align="center">79.5</td>
<td align="center">80.8</td>
<td align="center">67.9</td>
<td align="center">68.5</td>
<td align="center">78.0</td>
<td align="center">78.4</td>
</tr>
<tr>
<td align="left">CC-OCR</td>
<td align="center">81.0</td>
<td align="center">82.0</td>
<td align="center">75.7</td>
<td align="center">76.9</td>
<td align="center">81.9</td>
<td align="center">81.2</td>
</tr>
<tr>
<td align="left">OCRBench</td>
<td align="center">89.4</td>
<td align="center">--</td>
<td align="center">86.1</td>
<td align="center">--</td>
<td align="center">90.0</td>
<td align="center">89.4</td>
</tr>
<tr>
<td align="left"><strong>空间智能</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">ERQA</td>
<td align="center">60.5</td>
<td align="center">67.5</td>
<td align="center">57.5</td>
<td align="center">46.8</td>
<td align="center">61.8</td>
<td align="center">62.5</td>
</tr>
<tr>
<td align="left">CountBench</td>
<td align="center">97.8</td>
<td align="center">97.2</td>
<td align="center">96.1</td>
<td align="center">90.6</td>
<td align="center">96.1</td>
<td align="center">97.8</td>
</tr>
<tr>
<td align="left">RefCOCO avg</td>
<td align="center">90.9</td>
<td align="center">92.3</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">92.0</td>
<td align="center">92.5</td>
</tr>
<tr>
<td align="left">EmbSpatialBench</td>
<td align="center">84.5</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">84.3</td>
<td align="center">84.6</td>
</tr>
<tr>
<td align="left">RefSpatialBench</td>
<td align="center">67.7</td>
<td align="center">--</td>
<td align="center">4.7</td>
<td align="center">--</td>
<td align="center">64.3</td>
<td align="center">70.0</td>
</tr>
<tr>
<td align="left"><strong>视频理解</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">VideoMME(w sub.)</td>
<td align="center">87.0</td>
<td align="center">87.5</td>
<td align="center">--</td>
<td align="center">77.7</td>
<td align="center">86.6</td>
<td align="center">87.7</td>
</tr>
<tr>
<td align="left">VideoMMMU</td>
<td align="center">82.3</td>
<td align="center">84.7</td>
<td align="center">81.6</td>
<td align="center">84.4</td>
<td align="center">83.7</td>
<td align="center">84.4</td>
</tr>
<tr>
<td align="left">MLVU</td>
<td align="center">85.9</td>
<td align="center">86.7</td>
<td align="center">--</td>
<td align="center">81.7</td>
<td align="center">86.2</td>
<td align="center">86.6</td>
</tr>
<tr>
<td align="left">MVBench</td>
<td align="center">74.6</td>
<td align="center">77.6</td>
<td align="center">--</td>
<td align="center">67.2</td>
<td align="center">74.6</td>
<td align="center">75.5</td>
</tr>
<tr>
<td align="left"><strong>视觉 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">V*</td>
<td align="center">93.7</td>
<td align="center">95.8</td>
<td align="center">--</td>
<td align="center">67.0</td>
<td align="center">90.1</td>
<td align="center">94.7</td>
</tr>
<tr>
<td align="left">AndroidWorld</td>
<td align="center">64.2</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">70.3</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Qwen3.6-27B 与前后代及前沿模型的视觉语言基准对比.</p>
</blockquote>
<blockquote>
<p>译者注(技术谱系): 从视觉语言基准的演进脉络可以清晰看到 Qwen3.6 的技术传承与突破. Qwen3.6-27B 在 V*(94.7)上已接近 Qwen3.5-397B-A17B(95.8), 在 AndroidWorld(70.3)上更是实现了从零到领先的跨越. 特别值得注意的是 VlmsAreBlind(97.0)——这个基准专门测试视觉模型是否会被幻觉性文本描述误导, 97.0 的高分说明 Qwen3.6 在「视觉 grounding」上的鲁棒性极强, 不会轻易被错误的语言提示带偏. 从代际对比看, Qwen3.6-27B 在绝大多数视觉基准上超越 Qwen3.5-27B, 与 397B/17B 的 MoE 旗舰差距进一步缩小, 验证了「数据 + 训练方法」的迭代可以部分弥补规模的劣势.</p>
</blockquote>
<hr>
<h2 id="2-syybs">2 使用与部署</h2>
<h3 id="2-1-api-ykyqz">2.1 API 与开源权重</h3>
<p>Qwen3.6-35B-A3B 和 Qwen3.6-27B 的开源权重均已在 Hugging Face 和 ModelScope 上提供, 支持本地部署; 也可通过阿里云百炼 API 调用(Qwen3.6-35B-A3B 以 <code>qwen3.6-flash</code> 名称, Qwen3.6-27B 以 <code>qwen3.6-27b</code> 名称). 用户还可以在 Qwen Studio 上即时体验.</p>
<p>两个模型均可以无缝集成到流行的第三方编程助手中, 包括 OpenClaw、Claude Code 和 Qwen Code, 从而简化开发流程, 实现高效且具备上下文感知能力的编码体验.</p>
<h3 id="2-2-xtx-preserve-thinking">2.2 新特性: preserve_thinking</h3>
<p>本次发布支持 <code>preserve_thinking</code> 功能: 在消息中保留所有前序轮次的思维内容, 推荐用于智能体任务. 这一功能对于多轮 Agent 交互至关重要——当模型需要基于前序推理过程做出新的工具调用决策时, 完整的思考链可以避免「遗忘」中间结论, 显著提高复杂任务的完成率.</p>
<h3 id="2-3-dsfgjjcsl">2.3 第三方工具集成示例</h3>
<p>模型支持兼容 OpenAI 规范的聊天补全 API 和兼容 Anthropic 的 API 接口. 通过传入 <code>enable_thinking=True</code> 可开启推理模式, 通过 <code>enable_search=True</code> 可开启联网搜索. 流式响应中, <code>reasoning_content</code> 字段包含模型的思考过程, <code>content</code> 字段包含最终回答.</p>
<hr>
<h2 id="3-zj">3 总结</h2>
<p>Qwen3.6-35B-A3B 表明, 稀疏 MoE 模型可以实现卓越的智能体编程和推理能力. 仅凭 30 亿激活参数, 它便能够交付与数倍于其激活规模的稠密模型相当的性能, 同时在多模态基准上同样表现出色. 作为完全开源的模型权重, 它为该规模下的模型能力树立了新的标杆.</p>
<p>Qwen3.6-27B 的发布, 证明了一个经过精心训练的稠密模型, 可以在开发者最关心的任务上, 超越规模显著更大的前代模型. 作为广泛部署的开源模型规格——270 亿参数, 它在所有主要智能体编程基准上超越了拥有 3970 亿参数的 Qwen3.5-397B-A17B, 同时部署和服务都更加便捷.</p>
<p>随着 Qwen3.6 开源家族正式构建起覆盖全尺度的模型矩阵——从 30 亿激活参数的 Qwen3.6-35B-A3B, 到 270 亿参数的稠密模型 Qwen3.6-27B, 再到线上的 Qwen3.6-Plus 和 Qwen3.6-Max-Preview——这一代在各个规模上都实现了智能体编程能力的飞跃.</p>
<blockquote>
<p>译者注(局限风险): Qwen3.6 家族展现了令人瞩目的「能力密度」提升, 但几个工程现实需要冷静看待. 第一, Qwen3.6-27B 的稠密架构虽然部署便捷, 但 27B 参数在消费级硬件上仍需要约 60GB 显存(FP16)或 30GB(BF16/INT8), 对普通开发者而言并非「轻量」. Qwen3.6-35B-A3B 的 3B 激活参数在理论上更轻量, 但 MoE 路由的 all-to-all 通信开销在小 batch 场景下可能抵消稀疏性带来的计算节省. 第二, 两篇博客对架构细节和训练方法的披露非常有限——我们没有看到关于数据构成、RL 环境设计、损失函数等方面的任何技术细节, 这使得独立复现或深度分析变得困难. 第三, 多个内部基准(QwenClawBench、QwenWebBench、NL2Repo)的评估设置依赖 Claude Code 等外部工具, 这引入了评估者偏差: 如果 Claude Code 的脚手架对 Qwen 模型有隐性偏好或排斥, 分数的可比性会受到影响. 第四, 博客中反复提及的「即将开源」承诺(QwenClawBench、完整技术报告)尚未兑现, 这意味着当前分析基于不完整信息. 尽管如此, Qwen3.6 在公开可验证基准(SWE-bench、Terminal-Bench、AIME)上的强劲表现, 已经足以证明这一代模型的工程成熟度.</p>
</blockquote>
<hr>
<h2 id="citation">Citation</h2>
<pre><code class="language-bibtex">@misc{qwen36_35b_a3b,
    title = {Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All},
    url = {https://qwen.ai/blog?id=qwen3.6-35b-a3b},
    author = {Qwen Team},
    month = {April},
    year = {2026}
}

@misc{qwen36_27b,
    title = {Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model},
    url = {https://qwen.ai/blog?id=qwen3.6-27b},
    author = {Qwen Team},
    month = {April},
    year = {2026}
}
</code></pre>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxbx","text":"1 模型表现"},{"level":3,"id":"1-1-zryyjz","text":"1.1 自然语言基准"},{"level":4,"id":"1-1-1-qwen3-6-35b-a3b-ytgmmxdb","text":"1.1.1 Qwen3.6-35B-A3B 与同规模模型对比"},{"level":4,"id":"1-1-2-qwen3-6-27b-yqhdjqymxdb","text":"1.1.2 Qwen3.6-27B 与前后代及前沿模型对比"},{"level":3,"id":"1-2-sjyyjz","text":"1.2 视觉语言基准"},{"level":4,"id":"1-2-1-qwen3-6-35b-a3b-sjyybx","text":"1.2.1 Qwen3.6-35B-A3B 视觉语言表现"},{"level":4,"id":"1-2-2-qwen3-6-27b-sjyybx","text":"1.2.2 Qwen3.6-27B 视觉语言表现"},{"level":2,"id":"2-syybs","text":"2 使用与部署"},{"level":3,"id":"2-1-api-ykyqz","text":"2.1 API 与开源权重"},{"level":3,"id":"2-2-xtx-preserve-thinking","text":"2.2 新特性: preserve_thinking"},{"level":3,"id":"2-3-dsfgjjcsl","text":"2.3 第三方工具集成示例"},{"level":2,"id":"3-zj","text":"3 总结"},{"level":2,"id":"citation","text":"Citation"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/11-qwen3.6/01-qwen3.6-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/11-qwen3.6/01-qwen3.6-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.6: 全尺度智能体编程能力的飞跃</h1>
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
