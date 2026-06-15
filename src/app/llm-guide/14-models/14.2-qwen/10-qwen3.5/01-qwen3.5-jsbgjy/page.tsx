"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.5: 以原生多模态智能体加速生产力</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Qwen3.5: Accelerating Productivity with Native Multimodal Agents
原文链接: <a href="https://qwen.ai/blog?id=qwen3.5">https://qwen.ai/blog?id=qwen3.5</a>
发布日期: 2026-02-16
发布机构: Qwen Team (阿里云)
模型规模: 397B 总参数 / 17B 激活参数 (MoE)
上下文窗口: 1M tokens (API 版本)
训练方式: 大规模视觉-文本语料预训练 + 扩展 RL 后训练</p>
</blockquote>
<hr>
<p>我们很高兴正式发布 Qwen3.5, 并推出 Qwen3.5 系列的第一款模型 Qwen3.5-397B-A17B 的开放权重版本. 作为原生视觉-语言模型, Qwen3.5-397B-A17B 在推理、编程、智能体能力与多模态理解等全方位基准评估中表现优异, 助力开发者与企业显著提升生产力. 该模型采用创新的混合架构, 将线性注意力(Gated Delta Networks)与稀疏混合专家(MoE)相结合, 实现出色的推理效率: 总参数量达 3970 亿, 每次前向传播仅激活 170 亿参数, 在保持能力的同时优化速度与成本. 我们还将语言与方言支持从 119 种扩展至 201 种, 为全球用户提供更广泛的可用性与更完善的支持.</p>
<p>Qwen3.5-Plus 为该模型的 API 版本, 通过阿里云百炼提供服务: 1M token 上下文窗口、官方工具及自适应调用.</p>
<blockquote>
<p>译者注(设计动机): Qwen3.5 的架构选择反映了一个清晰的工程判断——在旗舰模型的能力密度与推理效率之间, 线性注意力 + 稀疏 MoE 是当下最优的折中方案. 397B/17B 的激活比(约 4.3%)远低于传统 Dense 模型的 100%, 也低于部分 MoE 方案的 10%-20%. 这意味着在保持与 1T+ 参数模型相当能力的前提下, 推理成本被压缩到了极限. 更值得关注的是「原生多模态」的定位: 不同于后拼接视觉模块的方案, Qwen3.5 从预训练阶段就融合文本-图像-视频数据, 这种「一体成型」的策略在多模态 Agent 场景中有显著优势——视觉信号不是被「翻译」成文本再处理, 而是与文本在同一表征空间中被联合推理.</p>
</blockquote>
<hr>
<h2 id="1-mxbx">1 模型表现</h2>
<p>下面我们在多种评估任务与模态下, 对 Qwen3.5 与前沿模型进行全面对比评估.</p>
<h3 id="1-1-zryyjz">1.1 自然语言基准</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GPT-5.2</th>
<th align="center">Claude 4.5 Opus</th>
<th align="center">Gemini-3 Pro</th>
<th align="center">Qwen3-Max-Thinking</th>
<th align="center">K2.5-1T-A32B</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>知识与推理</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">87.4</td>
<td align="center">89.5</td>
<td align="center">89.8</td>
<td align="center">85.7</td>
<td align="center">87.1</td>
<td align="center">87.8</td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="center">95.0</td>
<td align="center">95.6</td>
<td align="center">95.9</td>
<td align="center">92.8</td>
<td align="center">94.5</td>
<td align="center">94.9</td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">67.9</td>
<td align="center">70.6</td>
<td align="center">74.0</td>
<td align="center">67.3</td>
<td align="center">69.2</td>
<td align="center">70.4</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">90.5</td>
<td align="center">92.2</td>
<td align="center">93.4</td>
<td align="center">93.7</td>
<td align="center">94.0</td>
<td align="center">93.0</td>
</tr>
<tr>
<td align="left"><strong>指令遵循</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">94.8</td>
<td align="center">90.9</td>
<td align="center">93.5</td>
<td align="center">93.4</td>
<td align="center">93.9</td>
<td align="center">92.6</td>
</tr>
<tr>
<td align="left">IFBench</td>
<td align="center">75.4</td>
<td align="center">58.0</td>
<td align="center">70.4</td>
<td align="center">70.9</td>
<td align="center">70.2</td>
<td align="center">76.5</td>
</tr>
<tr>
<td align="left">MultiChallenge</td>
<td align="center">57.9</td>
<td align="center">54.2</td>
<td align="center">64.2</td>
<td align="center">63.3</td>
<td align="center">62.7</td>
<td align="center">67.6</td>
</tr>
<tr>
<td align="left"><strong>长上下文</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">AA-LCR</td>
<td align="center">72.7</td>
<td align="center">74.0</td>
<td align="center">70.7</td>
<td align="center">68.7</td>
<td align="center">70.0</td>
<td align="center">68.7</td>
</tr>
<tr>
<td align="left">LongBench v2</td>
<td align="center">54.5</td>
<td align="center">64.4</td>
<td align="center">68.2</td>
<td align="center">60.6</td>
<td align="center">61.0</td>
<td align="center">63.2</td>
</tr>
<tr>
<td align="left"><strong>STEM</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">92.4</td>
<td align="center">87.0</td>
<td align="center">91.9</td>
<td align="center">87.4</td>
<td align="center">87.6</td>
<td align="center">88.4</td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">35.5</td>
<td align="center">30.8</td>
<td align="center">37.5</td>
<td align="center">30.2</td>
<td align="center">30.1</td>
<td align="center">28.7</td>
</tr>
<tr>
<td align="left">HLE-Verified</td>
<td align="center">43.3</td>
<td align="center">38.8</td>
<td align="center">48.0</td>
<td align="center">37.6</td>
<td align="center">--</td>
<td align="center">37.6</td>
</tr>
<tr>
<td align="left"><strong>推理</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">LiveCodeBench v6</td>
<td align="center">87.7</td>
<td align="center">84.8</td>
<td align="center">90.7</td>
<td align="center">85.9</td>
<td align="center">85.0</td>
<td align="center">83.6</td>
</tr>
<tr>
<td align="left">HMMT Feb 25</td>
<td align="center">99.4</td>
<td align="center">92.9</td>
<td align="center">97.3</td>
<td align="center">98.0</td>
<td align="center">95.4</td>
<td align="center">94.8</td>
</tr>
<tr>
<td align="left">HMMT Nov 25</td>
<td align="center">100</td>
<td align="center">93.3</td>
<td align="center">93.3</td>
<td align="center">94.7</td>
<td align="center">91.1</td>
<td align="center">92.7</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">86.3</td>
<td align="center">84.0</td>
<td align="center">83.3</td>
<td align="center">83.9</td>
<td align="center">81.8</td>
<td align="center">80.9</td>
</tr>
<tr>
<td align="left">AIME26</td>
<td align="center">96.7</td>
<td align="center">93.3</td>
<td align="center">90.6</td>
<td align="center">93.3</td>
<td align="center">93.3</td>
<td align="center">91.3</td>
</tr>
<tr>
<td align="left"><strong>通用 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">BFCL-V4</td>
<td align="center">63.1</td>
<td align="center">77.5</td>
<td align="center">72.5</td>
<td align="center">67.7</td>
<td align="center">68.3</td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left">TAU2-Bench</td>
<td align="center">87.1</td>
<td align="center">91.6</td>
<td align="center">85.4</td>
<td align="center">84.6</td>
<td align="center">77.0</td>
<td align="center">86.7</td>
</tr>
<tr>
<td align="left">VITA-Bench</td>
<td align="center">38.2</td>
<td align="center">56.3</td>
<td align="center">51.6</td>
<td align="center">40.9</td>
<td align="center">41.9</td>
<td align="center">49.7</td>
</tr>
<tr>
<td align="left">DeepPlanning</td>
<td align="center">44.6</td>
<td align="center">33.9</td>
<td align="center">23.3</td>
<td align="center">28.7</td>
<td align="center">14.5</td>
<td align="center">34.3</td>
</tr>
<tr>
<td align="left">Tool Decathlon</td>
<td align="center">43.8</td>
<td align="center">43.5</td>
<td align="center">36.4</td>
<td align="center">18.8</td>
<td align="center">27.8</td>
<td align="center">38.3</td>
</tr>
<tr>
<td align="left">MCP-Mark</td>
<td align="center">57.5</td>
<td align="center">42.3</td>
<td align="center">53.9</td>
<td align="center">33.5</td>
<td align="center">29.5</td>
<td align="center">46.1</td>
</tr>
<tr>
<td align="left"><strong>搜索 Agent</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HLE w/ tool</td>
<td align="center">45.5</td>
<td align="center">43.4</td>
<td align="center">45.8</td>
<td align="center">49.8</td>
<td align="center">50.2</td>
<td align="center">48.3</td>
</tr>
<tr>
<td align="left">BrowseComp</td>
<td align="center">65.8</td>
<td align="center">67.8</td>
<td align="center">59.2</td>
<td align="center">53.9</td>
<td align="center">--/74.9</td>
<td align="center">69.0/78.6</td>
</tr>
<tr>
<td align="left">BrowseComp-zh</td>
<td align="center">76.1</td>
<td align="center">62.4</td>
<td align="center">66.8</td>
<td align="center">60.9</td>
<td align="center">--</td>
<td align="center">70.3</td>
</tr>
<tr>
<td align="left">WideSearch</td>
<td align="center">76.8</td>
<td align="center">76.4</td>
<td align="center">68.0</td>
<td align="center">57.9</td>
<td align="center">72.7</td>
<td align="center">74.0</td>
</tr>
<tr>
<td align="left">Seal-0</td>
<td align="center">45.0</td>
<td align="center">47.7</td>
<td align="center">45.5</td>
<td align="center">46.9</td>
<td align="center">57.4</td>
<td align="center">46.9</td>
</tr>
<tr>
<td align="left"><strong>多语言</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMMLU</td>
<td align="center">89.5</td>
<td align="center">90.1</td>
<td align="center">90.6</td>
<td align="center">84.4</td>
<td align="center">86.0</td>
<td align="center">88.5</td>
</tr>
<tr>
<td align="left">MMLU-ProX</td>
<td align="center">83.7</td>
<td align="center">85.7</td>
<td align="center">87.7</td>
<td align="center">78.5</td>
<td align="center">82.3</td>
<td align="center">84.7</td>
</tr>
<tr>
<td align="left">NOVA-63</td>
<td align="center">54.6</td>
<td align="center">56.7</td>
<td align="center">56.7</td>
<td align="center">54.2</td>
<td align="center">56.0</td>
<td align="center">59.1</td>
</tr>
<tr>
<td align="left">INCLUDE</td>
<td align="center">87.5</td>
<td align="center">86.2</td>
<td align="center">90.5</td>
<td align="center">82.3</td>
<td align="center">83.3</td>
<td align="center">85.6</td>
</tr>
<tr>
<td align="left">Global PIQA</td>
<td align="center">90.9</td>
<td align="center">91.6</td>
<td align="center">93.2</td>
<td align="center">86.0</td>
<td align="center">89.3</td>
<td align="center">89.8</td>
</tr>
<tr>
<td align="left">PolyMATH</td>
<td align="center">62.5</td>
<td align="center">79.0</td>
<td align="center">81.6</td>
<td align="center">64.7</td>
<td align="center">43.1</td>
<td align="center">73.3</td>
</tr>
<tr>
<td align="left">WMT24++</td>
<td align="center">78.8</td>
<td align="center">79.7</td>
<td align="center">80.7</td>
<td align="center">77.6</td>
<td align="center">77.6</td>
<td align="center">78.9</td>
</tr>
<tr>
<td align="left">MAXIFE</td>
<td align="center">88.4</td>
<td align="center">79.2</td>
<td align="center">87.5</td>
<td align="center">84.0</td>
<td align="center">72.8</td>
<td align="center">88.2</td>
</tr>
<tr>
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
<td align="center">80.0</td>
<td align="center">80.9</td>
<td align="center">76.2</td>
<td align="center">75.3</td>
<td align="center">76.8</td>
<td align="center">76.4</td>
</tr>
<tr>
<td align="left">SWE-bench Multilingual</td>
<td align="center">72.0</td>
<td align="center">77.5</td>
<td align="center">65.0</td>
<td align="center">66.7</td>
<td align="center">73.0</td>
<td align="center">69.3</td>
</tr>
<tr>
<td align="left">SecCodeBench</td>
<td align="center">68.7</td>
<td align="center">68.6</td>
<td align="center">62.4</td>
<td align="center">57.5</td>
<td align="center">61.3</td>
<td align="center">68.3</td>
</tr>
<tr>
<td align="left">Terminal Bench 2</td>
<td align="center">54.0</td>
<td align="center">59.3</td>
<td align="center">54.2</td>
<td align="center">22.5</td>
<td align="center">50.8</td>
<td align="center">52.5</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Qwen3.5-397B-A17B 与前沿模型在自然语言任务上的对比. 数据来自官方博客, 评估日期为 2026 年 2 月.</p>
</blockquote>
<p><strong>基准注释说明:</strong></p>
<ul>
<li>HLE-Verified: Humanity&#39;s Last Exam (HLE) 的验证修订版本, 附带透明的逐组件验证协议和细粒度错误分类法. 数据集已开源于 <a href="https://huggingface.co/datasets/skylenage/HLE-Verified">https://huggingface.co/datasets/skylenage/HLE-Verified</a>.</li>
<li>TAU2-Bench: 遵循官方设置, 但在航空领域采用 Claude Opus 4.5 system card 中提出的修正方案进行评估.</li>
<li>MCP-Mark: GitHub MCP server 使用 api.githubcopilot.com 的 v0.30.3 版本; Playwright 工具响应截断至 32k tokens.</li>
<li>搜索 Agent: 基于我们模型构建的大多数搜索 Agent 采用简单的上下文折叠策略(256k): 一旦累积工具响应长度达到预设阈值, 较早的工具响应将从历史中被裁剪, 以保持上下文在限制范围内.</li>
<li>BrowseComp: 测试了两种策略, 简单上下文折叠获得 69.0 分, 而采用与 DeepSeek-V3.2 和 Kimi K2.5 相同的 discard-all 策略获得 78.6 分.</li>
<li>WideSearch: 使用 256k 上下文窗口, 不进行任何上下文管理.</li>
<li>MMLU-ProX: 报告 29 种语言上的平均准确率.</li>
<li>WMT24++: WMT24 经过难度标注和重平衡后的更难子集; 报告使用 XCOMET-XXL 在 55 种语言上的平均分数.</li>
<li>MAXIFE: 报告英语 + 多语言原始提示(共 23 种设置)上的准确率.</li>
<li>空单元格(--)表示分数尚未获得或不适用.</li>
</ul>
<blockquote>
<p>译者注(数据实验): 从表 1 可以读出几个关键信号. 第一, Qwen3.5 在通用 Agent 能力上(BFCL-V4、VITA-Bench、Tool Decathlon、MCP-Mark)全面超越 Qwen3-Max-Thinking 和 K2.5-1T-A32B, 这说明扩展 RL 环境对 Agent 泛化能力的增益是实质性的, 而非简单的 benchmark 调优. 第二, 在编码 Agent 场景(SWE-bench Verified 76.4、Terminal Bench 2 52.5)上, Qwen3.5 虽然略逊于 Claude 4.5 Opus, 但已显著超越 Gemini-3 Pro 和 K2.5, 考虑到 397B/17B 的激活规模, 这一性价比非常突出. 第三, BrowseComp 的两种策略得分(69.0 vs 78.6)揭示了一个有趣的工程细节: 上下文管理策略对搜索 Agent 的性能影响巨大, discard-all 策略比简单折叠高出近 10 分——这意味着在超长上下文搜索场景中, &quot;扔掉旧信息&quot;可能比&quot;压缩旧信息&quot;更有效.</p>
</blockquote>
<hr>
<h3 id="1-2-sjyyjz">1.2 视觉语言基准</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GPT-5.2</th>
<th align="center">Claude 4.5 Opus</th>
<th align="center">Gemini-3 Pro</th>
<th align="center">Qwen3-VL-235B-A22B</th>
<th align="center">K2.5-1T-A32B</th>
<th align="center">Qwen3.5-397B-A17B</th>
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
<td align="center">86.7</td>
<td align="center">80.7</td>
<td align="center">87.2</td>
<td align="center">80.6</td>
<td align="center">84.3</td>
<td align="center">85.0</td>
</tr>
<tr>
<td align="left">MMMU-Pro</td>
<td align="center">79.5</td>
<td align="center">70.6</td>
<td align="center">81.0</td>
<td align="center">69.3</td>
<td align="center">78.5</td>
<td align="center">79.0</td>
</tr>
<tr>
<td align="left">MathVision</td>
<td align="center">83.0</td>
<td align="center">74.3</td>
<td align="center">86.6</td>
<td align="center">74.6</td>
<td align="center">84.2</td>
<td align="center">88.6</td>
</tr>
<tr>
<td align="left">Mathvista(mini)</td>
<td align="center">83.1</td>
<td align="center">80.0</td>
<td align="center">87.9</td>
<td align="center">85.8</td>
<td align="center">90.1</td>
<td align="center">90.3</td>
</tr>
<tr>
<td align="left">We-Math</td>
<td align="center">79.0</td>
<td align="center">70.0</td>
<td align="center">86.9</td>
<td align="center">74.8</td>
<td align="center">84.7</td>
<td align="center">87.9</td>
</tr>
<tr>
<td align="left">DynaMath</td>
<td align="center">86.8</td>
<td align="center">79.7</td>
<td align="center">85.1</td>
<td align="center">82.8</td>
<td align="center">84.4</td>
<td align="center">86.3</td>
</tr>
<tr>
<td align="left">ZEROBench</td>
<td align="center">9</td>
<td align="center">3</td>
<td align="center">10</td>
<td align="center">4</td>
<td align="center">9</td>
<td align="center">12</td>
</tr>
<tr>
<td align="left">ZEROBench_sub</td>
<td align="center">33.2</td>
<td align="center">28.4</td>
<td align="center">39.0</td>
<td align="center">28.4</td>
<td align="center">33.5</td>
<td align="center">41.0</td>
</tr>
<tr>
<td align="left">BabyVision</td>
<td align="center">34.4</td>
<td align="center">14.2</td>
<td align="center">49.7</td>
<td align="center">22.2</td>
<td align="center">36.5</td>
<td align="center">52.3/43.3</td>
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
<td align="center">83.3</td>
<td align="center">77.0</td>
<td align="center">83.3</td>
<td align="center">81.3</td>
<td align="center">81.0</td>
<td align="center">83.9</td>
</tr>
<tr>
<td align="left">MMStar</td>
<td align="center">77.1</td>
<td align="center">73.2</td>
<td align="center">83.1</td>
<td align="center">78.7</td>
<td align="center">80.5</td>
<td align="center">83.8</td>
</tr>
<tr>
<td align="left">HallusionBench</td>
<td align="center">65.2</td>
<td align="center">64.1</td>
<td align="center">68.6</td>
<td align="center">66.7</td>
<td align="center">69.8</td>
<td align="center">71.4</td>
</tr>
<tr>
<td align="left">MMBenchEN-DEV-v1.1</td>
<td align="center">88.2</td>
<td align="center">89.2</td>
<td align="center">93.7</td>
<td align="center">89.7</td>
<td align="center">94.2</td>
<td align="center">93.7</td>
</tr>
<tr>
<td align="left">SimpleVQA</td>
<td align="center">55.8</td>
<td align="center">65.7</td>
<td align="center">73.2</td>
<td align="center">61.3</td>
<td align="center">71.2</td>
<td align="center">67.1</td>
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
<td align="center">85.7</td>
<td align="center">87.7</td>
<td align="center">88.5</td>
<td align="center">84.5</td>
<td align="center">88.8</td>
<td align="center">90.8</td>
</tr>
<tr>
<td align="left">CharXiv(RQ)</td>
<td align="center">82.1</td>
<td align="center">68.5</td>
<td align="center">81.4</td>
<td align="center">66.1</td>
<td align="center">77.5</td>
<td align="center">80.8</td>
</tr>
<tr>
<td align="left">MMLongBench-Doc</td>
<td align="center">--</td>
<td align="center">61.9</td>
<td align="center">60.5</td>
<td align="center">56.2</td>
<td align="center">58.5</td>
<td align="center">61.5</td>
</tr>
<tr>
<td align="left">CC-OCR</td>
<td align="center">70.3</td>
<td align="center">76.9</td>
<td align="center">79.0</td>
<td align="center">81.5</td>
<td align="center">79.7</td>
<td align="center">82.0</td>
</tr>
<tr>
<td align="left">AI2D_TEST</td>
<td align="center">92.2</td>
<td align="center">87.7</td>
<td align="center">94.1</td>
<td align="center">89.2</td>
<td align="center">90.8</td>
<td align="center">93.9</td>
</tr>
<tr>
<td align="left">OCRBench</td>
<td align="center">80.7</td>
<td align="center">85.8</td>
<td align="center">90.4</td>
<td align="center">87.5</td>
<td align="center">92.3</td>
<td align="center">93.1</td>
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
<td align="center">59.8</td>
<td align="center">46.8</td>
<td align="center">70.5</td>
<td align="center">52.5</td>
<td align="center">--</td>
<td align="center">67.5</td>
</tr>
<tr>
<td align="left">CountBench</td>
<td align="center">91.9</td>
<td align="center">90.6</td>
<td align="center">97.3</td>
<td align="center">93.7</td>
<td align="center">94.1</td>
<td align="center">97.2</td>
</tr>
<tr>
<td align="left">RefCOCO(avg)</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">84.1</td>
<td align="center">91.1</td>
<td align="center">87.8</td>
<td align="center">92.3</td>
</tr>
<tr>
<td align="left">ODInW13</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">46.3</td>
<td align="center">43.2</td>
<td align="center">--</td>
<td align="center">47.0</td>
</tr>
<tr>
<td align="left">EmbSpatialBench</td>
<td align="center">81.3</td>
<td align="center">75.7</td>
<td align="center">61.2</td>
<td align="center">84.3</td>
<td align="center">77.4</td>
<td align="center">84.5</td>
</tr>
<tr>
<td align="left">RefSpatialBench</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">65.5</td>
<td align="center">69.9</td>
<td align="center">--</td>
<td align="center">73.6</td>
</tr>
<tr>
<td align="left">LingoQA</td>
<td align="center">68.8</td>
<td align="center">78.8</td>
<td align="center">72.8</td>
<td align="center">66.8</td>
<td align="center">68.2</td>
<td align="center">81.6</td>
</tr>
<tr>
<td align="left">V*</td>
<td align="center">75.9</td>
<td align="center">67.0</td>
<td align="center">88.0</td>
<td align="center">85.9</td>
<td align="center">77.0</td>
<td align="center">95.8/91.1</td>
</tr>
<tr>
<td align="left">Hypersim</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">11.0</td>
<td align="center">--</td>
<td align="center">12.5</td>
</tr>
<tr>
<td align="left">SUNRGBD</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">34.9</td>
<td align="center">--</td>
<td align="center">38.3</td>
</tr>
<tr>
<td align="left">Nuscene</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">13.9</td>
<td align="center">--</td>
<td align="center">16.0</td>
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
<td align="center">86</td>
<td align="center">77.6</td>
<td align="center">88.4</td>
<td align="center">83.8</td>
<td align="center">87.4</td>
<td align="center">87.5</td>
</tr>
<tr>
<td align="left">VideoMME(w/o sub.)</td>
<td align="center">85.8</td>
<td align="center">81.4</td>
<td align="center">87.7</td>
<td align="center">79.0</td>
<td align="center">83.2</td>
<td align="center">83.7</td>
</tr>
<tr>
<td align="left">VideoMMMU</td>
<td align="center">85.9</td>
<td align="center">84.4</td>
<td align="center">87.6</td>
<td align="center">80.0</td>
<td align="center">86.6</td>
<td align="center">84.7</td>
</tr>
<tr>
<td align="left">MLVU (M-Avg)</td>
<td align="center">85.6</td>
<td align="center">81.7</td>
<td align="center">83.0</td>
<td align="center">83.8</td>
<td align="center">85.0</td>
<td align="center">86.7</td>
</tr>
<tr>
<td align="left">MVBench</td>
<td align="center">78.1</td>
<td align="center">67.2</td>
<td align="center">74.1</td>
<td align="center">75.2</td>
<td align="center">73.5</td>
<td align="center">77.6</td>
</tr>
<tr>
<td align="left">LVBench</td>
<td align="center">73.7</td>
<td align="center">57.3</td>
<td align="center">76.2</td>
<td align="center">63.6</td>
<td align="center">75.9</td>
<td align="center">75.5</td>
</tr>
<tr>
<td align="left">MMVU</td>
<td align="center">80.8</td>
<td align="center">77.3</td>
<td align="center">77.5</td>
<td align="center">71.1</td>
<td align="center">80.4</td>
<td align="center">75.4</td>
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
<td align="left">ScreenSpot Pro</td>
<td align="center">--</td>
<td align="center">45.7</td>
<td align="center">72.7</td>
<td align="center">62.0</td>
<td align="center">--</td>
<td align="center">65.6</td>
</tr>
<tr>
<td align="left">OSWorld-Verified</td>
<td align="center">38.2</td>
<td align="center">66.3</td>
<td align="center">--</td>
<td align="center">38.1</td>
<td align="center">63.3</td>
<td align="center">62.2</td>
</tr>
<tr>
<td align="left">AndroidWorld</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">63.7</td>
<td align="center">--</td>
<td align="center">66.8</td>
</tr>
<tr>
<td align="left"><strong>医学 VQA</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">SLAKE</td>
<td align="center">76.9</td>
<td align="center">76.4</td>
<td align="center">81.3</td>
<td align="center">72.5</td>
<td align="center">81.6</td>
<td align="center">79.9</td>
</tr>
<tr>
<td align="left">PMC-VQA</td>
<td align="center">58.9</td>
<td align="center">59.9</td>
<td align="center">62.3</td>
<td align="center">56.1</td>
<td align="center">63.3</td>
<td align="center">64.2</td>
</tr>
<tr>
<td align="left">MedXpertQA-MM</td>
<td align="center">73.3</td>
<td align="center">63.6</td>
<td align="center">76.0</td>
<td align="center">47.6</td>
<td align="center">65.3</td>
<td align="center">70.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Qwen3.5-397B-A17B 与前沿模型在视觉语言任务上的对比.</p>
</blockquote>
<p><strong>基准注释说明:</strong></p>
<ul>
<li>MathVision: 我们的模型分数使用固定提示评估, 例如 &quot;Please reason step by step, and put your final answer within \\boxed{}&quot;. 对于其他模型, 报告带和不带 \\boxed{} 格式化两种运行中的较高分.</li>
<li>BabyVision: 我们的模型分数在启用 CI(Code Interpreter)的情况下报告; 未启用 CI 时结果为 43.3.</li>
<li>V*: 我们的模型分数在启用 CI(Code Interpreter)的情况下报告; 未启用 CI 时结果为 91.1.</li>
<li>空单元格(--)表示分数尚未获得或不适用.</li>
<li>经复核, 我们发现历史版本 Qwen3-VL-235B-A22B 在 SLAKE 和 PMC-VQA 上的评估设置存在不一致. 相应的对比分数已于 2026 年 3 月 15 日修正.</li>
</ul>
<blockquote>
<p>译者注(数据实验): 视觉语言基准揭示了 Qwen3.5 在多模态推理上的显著提升. 在 MathVision(88.6)上, Qwen3.5 超越了 Gemini-3 Pro(86.6)和 K2.5(84.2), 这一优势在 STEM 密集型视觉任务中具有决定性意义. 更令人印象深刻的是 V* 基准: 启用 Code Interpreter 后达到 95.8, 远超 Gemini-3 Pro 的 88.0——这说明 Qwen3.5 不仅能「看懂」图像, 还能通过代码级交互主动「操作」图像(裁剪、标注、增强)以辅助推理. BabyVision(52.3/43.3)和 V*(95.8/91.1)的 CI 开关差距分别达到 9 分和 4.7 分, 验证了「视觉 + 代码」的协同效应. 在视觉 Agent 场景(OSWorld-Verified 62.2、AndroidWorld 66.8)上, Qwen3.5 已接近或超越 Claude 4.5 Opus, 这标志着开源模型在 GUI 自动化领域首次达到顶级水平.</p>
</blockquote>
<hr>
<h3 id="1-3-post-training-xntsly">1.3 Post-training 性能提升来源</h3>
<p>相对于 Qwen3 系列模型, Qwen3.5 的 Post-training 性能提升主要来自于我们对各类 RL 任务和环境的全面扩展. 我们更加强调 RL 环境的难度与可泛化性, 而非针对特定指标或狭隘类别的 query 进行优化.</p>
<p>下图展示了在通用 Agent 能力上, 模型效果随 RL Environment scaling 带来的增益. 整体性能由各模型在以下基准上的平均排名计算得出: BFCL-V4、VITA-Bench、DeepPlanning、Tool-Decathlon 和 MCP-Mark. 更多任务的 scaling 效果将在我们即将发布的技术报告中详述.</p>
<blockquote>
<p>图 1: Qwen3.5 通用 Agent 能力随 RL 环境规模扩展的增益曲线. (原文为动态图表, 此处记录核心结论: RL 环境扩展带来显著的 Agent 泛化性能提升.)</p>
</blockquote>
<blockquote>
<p>译者注(架构细节): 这里的「RL Environment scaling」值得深入分析. 传统 RLHF 的 reward model 通常基于人类偏好数据训练, 对 Agent 场景中的多步决策、工具调用链、环境状态反馈等复杂信号建模能力有限. Qwen3.5 的做法是扩展「环境」而非仅仅扩展「数据」——这意味着模型在训练时与真实的工具、API、多轮交互环境进行闭环学习, 而非仅在静态对话对上做 PPO. 这种「训推一体」的 RL 框架与 DeepSeek-V3.2 的「大规模智能体任务合成」有异曲同工之妙, 但 Qwen3.5 更强调环境的「可泛化性」(避免过拟合到特定指标). 异步 RL 框架(见第 3 节基础设施部分)支撑了这种环境扩展的可行性.</p>
</blockquote>
<hr>
<h2 id="2-yxl">2 预训练</h2>
<p>Qwen3.5 在能力、效率与通用性三个维度上推进预训练.</p>
<p><strong>能力(Power)</strong>. 在更大规模的视觉-文本语料上训练, 并加强中英文、多语言、STEM 与推理数据, 采用更严格的过滤, 实现跨代持平: Qwen3.5-397B-A17B 与参数量超过 1T 的 Qwen3-Max-Base 表现相当.</p>
<p><strong>效率(Efficiency)</strong>. 基于 Qwen3-Next 架构——更高稀疏度的 MoE、Gated DeltaNet + Gated Attention 混合注意力、稳定性优化与多 token 预测. 在 32k/256k 上下文长度下, Qwen3.5-397B-A17B 的解码吞吐量分别是 Qwen3-Max 的 8.6 倍/19.0 倍, 且性能相当. Qwen3.5-397B-A17B 的解码吞吐量分别是 Qwen3-235B-A22B 的 3.5 倍/7.2 倍.</p>
<p><strong>通用性(Versatility)</strong>. 通过早期文本-视觉融合与扩展的视觉/STEM/视频数据实现原生多模态, 在相近规模下优于 Qwen3-VL. 多语言覆盖从 119 增至 201 种语言/方言; 25 万词表(vs. 15 万)在多数语言上带来约 10-60% 的编码/解码效率提升.</p>
<blockquote>
<p>译者注(架构细节): 「Gated DeltaNet + Gated Attention 混合注意力」是 Qwen3.5 架构的核心创新. DeltaNet 是一种线性注意力变体, 通过门控机制控制状态更新, 将注意力复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span>, 同时保持了对长程依赖的建模能力. 混合架构的设计逻辑是: 在短上下文或需要精细对齐的场景使用 Gated Attention(标准注意力的门控变体), 在长上下文或需要高吞吐的场景使用 Gated DeltaNet. 这种「因地制宜」的注意力路由策略, 与 DeepSeek-V4 的 CSA + HCA 混合注意力、MiniMax-01 的 Lightning Attention + Softmax Attention 混合架构属于同一技术范式——2025-2026 年旗舰模型的共同选择是在「精确但慢」和「快速但粗」的注意力机制之间做动态权衡. 值得注意的是, Qwen3.5 的 25 万词表是一个大胆的决定: 更大的词表意味着更少的 token 数(编码效率提升 10-60%), 但也意味着 embedding 层更大的内存占用和更稀疏的梯度. 201 种语言的覆盖范围远超多数竞品(通常 50-100 种), 这对低资源语言的编码效率和平权有深远影响.</p>
</blockquote>
<h3 id="2-1-jzmxxn">2.1 基座模型性能</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen3-235B-A22B</th>
<th align="center">GLM-4.5-355B-A32B</th>
<th align="center">DeepSeek-V3.2-671B-A37B</th>
<th align="center">K2-1T-A32B</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>通用知识与多语言</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">87.33</td>
<td align="center">86.56</td>
<td align="center">88.11</td>
<td align="center">87.38</td>
<td align="center">88.61</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">67.73</td>
<td align="center">65.00</td>
<td align="center">62.82</td>
<td align="center">67.64</td>
<td align="center">76.01</td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="center">87.44</td>
<td align="center">86.86</td>
<td align="center">87.29</td>
<td align="center">86.65</td>
<td align="center">89.09</td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">42.84</td>
<td align="center">44.56</td>
<td align="center">43.46</td>
<td align="center">44.86</td>
<td align="center">57.96</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">91.82</td>
<td align="center">85.50</td>
<td align="center">90.48</td>
<td align="center">91.82</td>
<td align="center">91.82</td>
</tr>
<tr>
<td align="left">MMMLU</td>
<td align="center">81.27</td>
<td align="center">82.26</td>
<td align="center">83.20</td>
<td align="center">82.26</td>
<td align="center">85.82</td>
</tr>
<tr>
<td align="left">Include</td>
<td align="center">75.26</td>
<td align="center">73.41</td>
<td align="center">76.52</td>
<td align="center">72.05</td>
<td align="center">79.27</td>
</tr>
<tr>
<td align="left">Nova</td>
<td align="center">66.52</td>
<td align="center">60.96</td>
<td align="center">60.40</td>
<td align="center">61.44</td>
<td align="center">67.55</td>
</tr>
<tr>
<td align="left"><strong>推理与 STEM</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">87.95</td>
<td align="center">87.68</td>
<td align="center">86.03</td>
<td align="center">89.11</td>
<td align="center">90.98</td>
</tr>
<tr>
<td align="left">KoRBench</td>
<td align="center">50.80</td>
<td align="center">52.80</td>
<td align="center">54.00</td>
<td align="center">53.84</td>
<td align="center">54.08</td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">47.47</td>
<td align="center">44.63</td>
<td align="center">44.16</td>
<td align="center">46.78</td>
<td align="center">54.64</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">71.84</td>
<td align="center">61.84</td>
<td align="center">64.40</td>
<td align="center">71.50</td>
<td align="center">74.14</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">91.17</td>
<td align="center">89.31</td>
<td align="center">89.12</td>
<td align="center">92.12</td>
<td align="center">93.71</td>
</tr>
<tr>
<td align="left"><strong>编程</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Evalplus</td>
<td align="center">77.60</td>
<td align="center">69.49</td>
<td align="center">62.68</td>
<td align="center">71.77</td>
<td align="center">79.32</td>
</tr>
<tr>
<td align="left">MultiPLE</td>
<td align="center">65.94</td>
<td align="center">62.51</td>
<td align="center">61.88</td>
<td align="center">70.64</td>
<td align="center">79.39</td>
</tr>
<tr>
<td align="left">SWE-agentless</td>
<td align="center">31.77</td>
<td align="center">29.23</td>
<td align="center">34.67</td>
<td align="center">28.54</td>
<td align="center">43.26</td>
</tr>
<tr>
<td align="left">CRUX-I</td>
<td align="center">64.25</td>
<td align="center">67.63</td>
<td align="center">63.25</td>
<td align="center">70.50</td>
<td align="center">71.13</td>
</tr>
<tr>
<td align="left">CRUX-O</td>
<td align="center">78.88</td>
<td align="center">77.13</td>
<td align="center">73.88</td>
<td align="center">77.13</td>
<td align="center">82.38</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Qwen3.5-397B-A17B 基座模型与同类开源/闭源基座模型的对比.</p>
</blockquote>
<blockquote>
<p>译者注(技术谱系): 表 3 中几个数字极具谱系意义. MMLU-Pro 上 Qwen3.5(76.01) 大幅领先 DeepSeek-V3.2(62.82) 和 GLM-4.5(65.00), 这说明 Qwen3.5 在知识密集型任务上的优势不仅来自规模, 更来自数据质量——「更严格的过滤」和「加强 STEM 与推理数据」的策略在基座阶段就产生了显著效果. SWE-agentless(43.26)上 Qwen3.5 大幅领先所有对比模型(次高 V3.2 仅 34.67), 这一 8.6 分的差距表明 Qwen3.5 的预训练语料中包含了大量高质量的软件工程相关数据. 从演进脉络看, Qwen3.5 的基座在保持与 Qwen3-Max(1T+) 相当能力的同时, 激活参数仅为后者的约 1/60, 这验证了「稀疏 MoE + 线性注意力」路线在能力密度上的工程可行性.</p>
</blockquote>
<hr>
<h2 id="3-jcss">3 基础设施</h2>
<p>Qwen3.5 通过异构基础设施实现高效的原生多模态训练: 在视觉与语言组件上解耦并行策略, 避免统一方案带来的低效. 利用稀疏激活实现跨模块计算重叠, 在混合文本-图像-视频数据上相比纯文本基线达到近 100% 的训练吞吐. 在此基础上, 原生 FP8 流水线对激活、MoE 路由与 GEMM 运算采用低精度, 并通过运行时监控在敏感层保持 BF16, 实现约 50% 的激活显存降低与超过 10% 的加速, 并稳定扩展至数万亿 token.</p>
<p>为了持续释放强化学习的潜力, 我们构建了可扩展的异步强化学习框架, 支持 Qwen3.5 全尺寸模型, 并全面覆盖文本、多模态及多轮交互场景. 通过训推分离架构的解耦式设计, 该框架显著提升了硬件利用率, 实现了动态负载均衡和细粒度的故障恢复. 配合 FP8 训推、Rollout 路由回放、投机采样以及多轮 Rollout 锁定等技术, 我们进一步优化了系统吞吐, 提高了训推一致性. 通过系统与算法协同设计, 该框架在严格控制样本陈旧性的基础上有效缓解了数据长尾问题, 提高了训练曲线的稳定性和性能上限. 此外, 框架面向原生智能体工作流设计, 能够实现稳定、无缝的多轮环境交互, 消除了框架层的调度中断. 这种解耦设计使得系统能够扩展百万级规模的 Agent 脚手架与环境, 从而显著增强模型的泛化能力. 上述优化最终取得了 3-5 倍的端到端加速, 展现了卓越的稳定性、高效率与可扩展性.</p>
<blockquote>
<p>译者注(架构细节): Qwen3.5 的基础设施设计体现了「系统与算法协同设计」的先进理念. 三个关键工程决策值得拆解:</p>
<p>第一, <strong>异构并行策略解耦</strong>. 视觉Encoder 和语言Decoder  的计算特征截然不同: 视觉端以稠密卷积/Transformer 为主, 适合 TP(Tensor Parallelism); 语言端以稀疏 MoE 为主, 适合 EP(Expert Parallelism). 统一并行策略必然导致一方等待另一方. 解耦后, 视觉和语言组件可以各自选择最优并行拓扑, 这是「近 100% 训练吞吐」的关键.</p>
<p>第二, <strong>FP8 运行时监控回退 BF16</strong>. 纯 FP8 训练在长序列和敏感层(如 LayerNorm、注意力 Softmax 附近)容易出现数值不稳定. Qwen3.5 的方案是「默认 FP8 + 运行时监控自动回退 BF16」, 这避免了人工标注敏感层的繁琐工作, 也避免了全局 BF16 带来的显存浪费. 50% 的激活显存降低在数万亿 token 的训练规模下意味着数十 GB 甚至数百 GB 的显存节省, 直接转化为更大的 batch size 或更长的上下文.</p>
<p>第三, <strong>异步 RL 的训推分离架构</strong>. 传统 RL 训练(如 PPO)中, 策略生成(Rollout)和策略更新(Training)通常串行执行, GPU 在生成阶段大量闲置. 训推分离将 Rollout 放到专门的推理集群, 训练集群专注梯度计算, 通过异步队列解耦. 3-5 倍的端到端加速说明推理开销在总训练时间中占比极高(可能 60%-80%), 分离后训练集群的利用率从 20%-40% 提升到接近 100%. 「多轮 Rollout 锁定」技术则确保 Agent 场景中的多轮环境交互不会被调度中断——对于需要 10+ 轮工具调用的复杂任务, 任何中间调度中断都会导致轨迹断裂和 reward 信号污染.</p>
</blockquote>
<hr>
<h2 id="4-kssy-qwen3-5">4 开始使用 Qwen3.5</h2>
<h3 id="4-1-y-qwen3-5-jh">4.1 与 Qwen3.5 交互</h3>
<p>欢迎在 Qwen Chat 上使用 Qwen3.5. 我们提供自动(auto)、思考(thinking)与快速(fast)三种模式供用户选择. 「自动」模式下用户可使用自适应思考, 并调用搜索、代码解释器等工具; 「思考」模式下模型会对难题进行深度思考; 「快速」模式下模型将直接回答问题, 不消耗思考 token.</p>
<h3 id="4-2-alybl">4.2 阿里云百炼</h3>
<p>用户可通过阿里云百炼调用我们的旗舰模型 Qwen3.5-Plus 进行体验. 若要开启推理、联网搜索与 Code Interpreter 等高级能力, 只需传入以下参数:</p>
<ul>
<li><code>enable_thinking</code>: 开启推理模式(链式思考)</li>
<li><code>enable_search</code>: 开启联网搜索与 Code Interpreter</li>
</ul>
<p>示例代码(基于兼容 OpenAI API 的接口):</p>
<pre><code class="language-python">from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get(&quot;DASHSCOPE_API_KEY&quot;),
    base_url=&quot;https://dashscope-intl.aliyuncs.com/compatible-mode/v1&quot;,
)

messages = [{&quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;Introduce Qwen3.5.&quot;}]

completion = client.chat.completions.create(
    model=&quot;qwen3.5-plus&quot;,
    messages=messages,
    extra_body={
        &quot;enable_thinking&quot;: True,
        &quot;enable_search&quot;: False
    },
    stream=True
)

# 处理流式响应: reasoning_content 为思考过程, content 为最终回答
for chunk in completion:
    delta = chunk.choices[0].delta
    if hasattr(delta, &quot;reasoning_content&quot;) and delta.reasoning_content:
        print(delta.reasoning_content, end=&quot;&quot;, flush=True)
    if hasattr(delta, &quot;content&quot;) and delta.content:
        print(delta.content, end=&quot;&quot;, flush=True)
</code></pre>
<p>你可以将百炼 API 与 Qwen Code、Claude Code、Cline、OpenClaw、OpenCode 等第三方编程工具无缝集成, 获得流畅的「vibe coding」体验.</p>
<hr>
<h2 id="5-demo-nlzs">5 Demo 能力展示</h2>
<p>Qwen3.5 具备丰富的 Agent 与多模态能力, 以下为核心场景概述.</p>
<h3 id="5-1-dmyznt">5.1 代码与智能体</h3>
<p>Qwen3.5 可协助进行网页开发, 尤其在构建网页和设计用户界面等前端任务方面表现出色. 它能够将简单的指令转化为可运行的代码, 让网站创建变得更加轻松高效. 通过与 OpenClaw 等第三方智能体环境集成, Qwen3.5 能够进行网页搜索、信息收集和结构化报告生成——结合自身的推理与工具调用能力, 以及 OpenClaw 的接口, 为用户带来流畅的编码和研究体验. 以 Qwen3.5 为底层模型的 Qwen Code 支持「vibe coding」体验, 可将自然语言指令转化为代码、实时迭代开发项目.</p>
<h3 id="5-2-sjznt">5.2 视觉智能体</h3>
<p>Qwen3.5 可作为视觉智能体, 自主操作手机与电脑完成日常任务. 在移动端, 它已适配更多主流应用, 支持自然语言指令驱动操作; 在 PC 端, 能处理跨应用的数据整理、多步骤流程自动化等复杂任务. 此外, Qwen3.5 能将手绘界面草图转化为结构清晰的前端代码, 对简单游戏视频进行逻辑还原, 或将长视频内容自动提炼为结构化网页或可视化图表. 借助对图像像素级位置信息的建模, Qwen3.5 在物体计数、相对位置判断、空间关系描述等任务中表现更准确, 在自动驾驶场景理解、机器人导航等具身智能应用中展现出良好的空间感知潜力.</p>
<h3 id="5-3-sjtl">5.3 视觉推理</h3>
<p>相比 Qwen3-VL, Qwen3.5 在学科解题及其他视觉推理任务上表现更稳健. 通过将图像内容与上下文理解相结合, 它能进行多步逻辑推理. 突破传统抠图工具的局限, Qwen3.5 原生支持代码级图像处理: 可自动裁剪局部区域放大细节, 或通过标注、增强等操作强化关键特征, 实现更精细的视觉推理与分析.</p>
<hr>
<h2 id="6-dyynl">6 多语言能力</h2>
<p>Qwen3.5 语言能力全面升级, 支持超 200 种语言和方言, 在 Qwen3 语种支持的基础上, 重点对低资源语言进行了扩充, 以更广阔的语言图谱, 赋能全球 AI 平权.</p>
<table>
<thead>
<tr>
<th align="left">语系</th>
<th align="left">语种与方言</th>
</tr>
</thead>
<tbody><tr>
<td align="left">印欧语系</td>
<td align="left">英语、法语、葡萄牙语、德语、罗马尼亚语、瑞典语、丹麦语、保加利亚语、俄语、捷克语、希腊语、乌克兰语、西班牙语、荷兰语、斯洛伐克语、克罗地亚语、波兰语、立陶宛语、挪威语(博克马尔语)、挪威尼诺斯克语、波斯语、斯洛文尼亚语、古吉拉特语、拉脱维亚语、意大利语、奥克语、尼泊尔语、马拉地语、白俄罗斯语、塞尔维亚语、卢森堡语、威尼斯语、阿萨姆语、威尔士语、西里西亚语、阿斯图里亚语、恰蒂斯加尔语、阿瓦德语、迈蒂利语、博杰普尔语、信德语、爱尔兰语、法罗语、印地语、旁遮普语、孟加拉语、奥里雅语、塔吉克语、东意第绪语、伦巴第语、利古里亚语、西西里语、弗留利语、撒丁岛语、加利西亚语、加泰罗尼亚语、冰岛语、托斯克语、阿尔巴尼亚语、林堡语、达里语、南非荷兰语、马其顿语、僧伽罗语、乌尔都语、马加希语、波斯尼亚语、亚美尼亚语、拉特加利亚语、苏格兰盖尔语、中库尔德语、北库尔德语、南普什图语、梵语、敦达里语、马尔瓦里语、阿希拉尼语、巴盖利语、巴格里语、本德利语、布拉吉语、库马翁语、克什米尔语</td>
</tr>
<tr>
<td align="left">汉藏语系</td>
<td align="left">中文(简体中文、繁体中文、粤语)、缅甸语、藏语、梅泰语</td>
</tr>
<tr>
<td align="left">亚非语系</td>
<td align="left">阿拉伯语(标准语、内志语、黎凡特语、埃及语、摩洛哥语、美索不达米亚语、塔伊兹-阿德尼语、突尼斯语、海湾语、阿尔及利亚语、苏丹语、利比亚语)、希伯来语、马耳他语、阿姆哈拉语、提格里尼亚语、卡比尔语、索马里语、西中奥罗莫语、豪萨语</td>
</tr>
<tr>
<td align="left">南岛语系</td>
<td align="left">印度尼西亚语、马来语、他加禄语、宿务语、爪哇语、巽他语、米南加保语、巴厘岛语、班加语、邦阿西楠语、伊洛科语、瓦雷语(菲律宾)、高原马达加斯加语、马达加斯加语、布吉语、毛利语、萨摩亚语、夏威夷语、斐济语</td>
</tr>
<tr>
<td align="left">德拉威语</td>
<td align="left">泰米尔语、泰卢固语、卡纳达语、马拉雅拉姆语</td>
</tr>
<tr>
<td align="left">突厥语系</td>
<td align="left">土耳其语、北阿塞拜疆语、北乌兹别克语、哈萨克语、巴什基尔语、鞑靼语、克里米亚鞑靼语、吉尔吉斯语、土库曼语、维吾尔语</td>
</tr>
<tr>
<td align="left">壮侗语系</td>
<td align="left">泰语、老挝语、掸语</td>
</tr>
<tr>
<td align="left">乌拉尔语系</td>
<td align="left">芬兰语、爱沙尼亚语、匈牙利语、草原马里语</td>
</tr>
<tr>
<td align="left">南亚语系</td>
<td align="left">越南语、高棉语</td>
</tr>
<tr>
<td align="left">尼日尔-刚果语系</td>
<td align="left">约鲁巴语、埃维语、卢旺达语、林加拉语、北索托语、尼扬贾语、绍纳语、南索托语、茨瓦纳语、科萨语、祖鲁语、卢干达语、斯瓦蒂语、聪加语、通布卡语、文达语、乔奎语、卢巴-卡赛语、隆迪语、姆本杜语、基库尤语、刚果语、尼日利亚富拉语、沃洛夫语、丰语、卡比耶语、莫西语、阿坎语、特维语、班巴拉语、伊博语</td>
</tr>
<tr>
<td align="left">其他</td>
<td align="left">日语、韩语、格鲁吉亚语、巴斯克语、海地语、帕皮阿门托语、卡布维尔迪亚努语、托克皮辛语、斯瓦希里语、中部艾马拉语、图卢语、那加语、尼日利亚皮钦语、毛里求斯克里奥尔语、桑戈语、阿亚库乔克丘亚语、喀尔喀蒙古语、西南丁卡语、努埃尔语、瓜拉尼语</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Qwen3.5 支持的语言与方言列表(201 种).</p>
</blockquote>
<hr>
<h2 id="7-zjjwlgz">7 总结及未来工作</h2>
<p>Qwen3.5 凭借高效的混合架构与原生多模态推理, 为通用数字智能体奠定了坚实基础. 下一阶段的重点将从模型规模转向系统整合: 构建具备跨会话持久记忆的智能体、面向真实世界交互的具身接口、自我改进机制, 目标是能够长期自主运行、逻辑一致的系统, 将当前以任务为边界的助手升级为可持续、可信任的伙伴.</p>
<blockquote>
<p>译者注(局限风险): Qwen3.5 的技术路线清晰地指向了「Agent 原生」这一下一代大模型的核心形态, 但几个潜在风险值得警惕. 第一, 397B/17B 的极端稀疏比对推理基础设施提出了极高要求——MoE 路由的 all-to-all 通信在跨节点场景下可能成为瓶颈, 尤其在消费级硬件上单卡部署 17B 激活参数仍需要 40GB+ 显存, 与「普及化」目标存在张力. 第二, 异步 RL 框架虽然实现了 3-5 倍加速, 但「严格控制样本陈旧性」在长轨迹 Agent 任务中是一个尚未被充分验证的假设——当环境交互需要 50+ 轮时, 异步带来的时滞可能导致 credit assignment 失效. 第三, 201 种语言的支持在技术上是壮举, 但低资源语言的训练数据质量参差不齐, 可能在某些语种上存在「覆盖广但深度浅」的问题. 第四, 博客中提到的「即将发布的技术报告」暗示当前公开信息可能只是全貌的一部分, 更多技术细节(如确切的训练数据构成、RL 环境的具体设计、Gated DeltaNet 的数学形式化)有待后续披露.</p>
</blockquote>
<hr>
<h2 id="citation">Citation</h2>
<p>如果 Qwen3.5 对你有所帮助, 欢迎引用以下文章:</p>
<pre><code class="language-bibtex">@misc{qwen35blog,
    title = {Qwen3.5: Accelerating Productivity with Native Multimodal Agents},
    url = {https://qwen.ai/blog?id=qwen3.5},
    author = {Qwen Team},
    month = {February},
    year = {2026}
}
</code></pre>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxbx","text":"1 模型表现"},{"level":3,"id":"1-1-zryyjz","text":"1.1 自然语言基准"},{"level":3,"id":"1-2-sjyyjz","text":"1.2 视觉语言基准"},{"level":3,"id":"1-3-post-training-xntsly","text":"1.3 Post-training 性能提升来源"},{"level":2,"id":"2-yxl","text":"2 预训练"},{"level":3,"id":"2-1-jzmxxn","text":"2.1 基座模型性能"},{"level":2,"id":"3-jcss","text":"3 基础设施"},{"level":2,"id":"4-kssy-qwen3-5","text":"4 开始使用 Qwen3.5"},{"level":3,"id":"4-1-y-qwen3-5-jh","text":"4.1 与 Qwen3.5 交互"},{"level":3,"id":"4-2-alybl","text":"4.2 阿里云百炼"},{"level":2,"id":"5-demo-nlzs","text":"5 Demo 能力展示"},{"level":3,"id":"5-1-dmyznt","text":"5.1 代码与智能体"},{"level":3,"id":"5-2-sjznt","text":"5.2 视觉智能体"},{"level":3,"id":"5-3-sjtl","text":"5.3 视觉推理"},{"level":2,"id":"6-dyynl","text":"6 多语言能力"},{"level":2,"id":"7-zjjwlgz","text":"7 总结及未来工作"},{"level":2,"id":"citation","text":"Citation"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/10-qwen3.5/01-qwen3.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/10-qwen3.5/01-qwen3.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.5: 以原生多模态智能体加速生产力</h1>
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
