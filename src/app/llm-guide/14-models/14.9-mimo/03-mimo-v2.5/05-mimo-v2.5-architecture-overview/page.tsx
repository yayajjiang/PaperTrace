"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiMo-V2.5 多模态 Agentic 能力与 Harness 感知剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">返回 14.9-MiMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: MiMo-V2.5 / MiMo-V2.5-Pro Technical Blog (Xiaomi AI Lab, 2026-04-22/27)
<strong>剖析角度</strong>: 多模态统一架构、Harness Awareness、Token 效率、长程 Agentic 任务
<strong>面向读者</strong>: 已阅读 MiMo-V2.5 技术博客精译,希望深入理解多模态 Agent 能力与长程自主任务执行的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxdw-ccwbddmt-agent-dys">1. 核心定位:从纯文本到多模态 Agent 的跃升</h2>
<p>MiMo-V2.5 是 MiMo 家族的首个多模态模型,在 V2-Flash 的纯文本能力基础上增加了原生视觉和音频理解能力.发布两个版本:</p>
<table>
<thead>
<tr>
<th align="left">版本</th>
<th align="center">总参数</th>
<th align="center">激活参数</th>
<th align="center">训练数据</th>
<th align="center">上下文</th>
<th align="left">定位</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>MiMo-V2.5</strong></td>
<td align="center"><strong>310B</strong></td>
<td align="center"><strong>15B</strong></td>
<td align="center"><strong>48T</strong></td>
<td align="center"><strong>1M</strong></td>
<td align="left"><strong>效率优先,多模态 Agent</strong></td>
</tr>
<tr>
<td align="left"><strong>MiMo-V2.5-Pro</strong></td>
<td align="center"><strong>1.02T</strong></td>
<td align="center"><strong>42B</strong></td>
<td align="center"><strong>27T</strong></td>
<td align="center"><strong>1M</strong></td>
<td align="left"><strong>性能优先,前沿 Agent</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Standard 版本的 48T 训练数据量非常可观——约为 DeepSeek-V3(14.8T)的 3.2 倍.Pro 版本虽然总参数和激活参数更多,但训练数据反而更少(27T),可能使用了更高质量、更精选的数据,或通过蒸馏获取能力.</p>
</blockquote>
<hr>
<h2 id="2-wjdxlyjjssxwkz">2. 五阶段训练与渐进式上下文扩展</h2>
<h3 id="2-1-xllc">2.1 训练流程</h3>
<table>
<thead>
<tr>
<th align="center">阶段</th>
<th align="left">内容</th>
<th align="center">上下文</th>
</tr>
</thead>
<tbody><tr>
<td align="center">1</td>
<td align="left">Text pre-training: 构建 LLM backbone</td>
<td align="center">32K</td>
</tr>
<tr>
<td align="center">2</td>
<td align="left">Projector warmup: 对齐视觉/音频 projector</td>
<td align="center">32K</td>
</tr>
<tr>
<td align="center">3</td>
<td align="left">Multimodal pre-training: 跨模态数据训练</td>
<td align="center">32K</td>
</tr>
<tr>
<td align="center">4</td>
<td align="left">SFT + Agentic post-training</td>
<td align="center"><strong>32K → 256K → 1M</strong></td>
</tr>
<tr>
<td align="center">5</td>
<td align="left">RL + MOPD: 强化感知、推理和 Agentic 能力</td>
<td align="center">1M</td>
</tr>
</tbody></table>
<h3 id="2-2-sxwkzdclyy">2.2 上下文扩展的策略意义</h3>
<p>大多数模型的长上下文扩展采用两阶段方法(预训练固定 + 后训练扩展).MiMo-V2.5 的独特之处在于<strong>在 SFT + Agentic post-training 阶段就进行渐进式扩展</strong>:</p>
<table>
<thead>
<tr>
<th align="center">阶段</th>
<th align="center">上下文</th>
<th align="left">模型在学习什么</th>
</tr>
</thead>
<tbody><tr>
<td align="center">32K</td>
<td align="center">基础指令遵循</td>
<td align="left">基本工具使用</td>
</tr>
<tr>
<td align="center">256K</td>
<td align="center">中长程 Agent 任务</td>
<td align="left">多轮 tool call 轨迹管理</td>
</tr>
<tr>
<td align="center"><strong>1M</strong></td>
<td align="center"><strong>长程复杂任务</strong></td>
<td align="left"><strong>在百万级上下文中保持连贯性</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Agentic 任务天然需要长上下文——多轮 tool call 的轨迹累积、历史经验引用、大代码库理解.MiMo-V2.5 在训练时就习惯了百万级上下文,这意味着它在真实 Agent 场景中的长程连贯性可能比「先短后长&quot;训练方式的模型更可靠.</p>
</blockquote>
<hr>
<h2 id="3-harness-awareness-mx-hjjkdyrz">3. Harness Awareness:模型-环境接口的元认知</h2>
<h3 id="3-1-ct-agent-mxdjx">3.1 传统 Agent 模型的局限</h3>
<p>传统 Agent 模型通常将 harness 视为被动容器——模型只关心生成正确的 tool call,而不关心 harness 如何管理状态、如何组织上下文.</p>
<h3 id="3-2-mimo-v2-5-pro-d-harness-awareness">3.2 MiMo-V2.5-Pro 的 Harness Awareness</h3>
<p>MiMo-V2.5-Pro 展现出<strong>主动利用 harness 功能来优化执行效率</strong>的能力:</p>
<table>
<thead>
<tr>
<th align="left">能力</th>
<th align="left">表现</th>
<th align="left">意义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">上下文管理</td>
<td align="left">主动请求特定上下文格式</td>
<td align="left">减少无效 token 消耗</td>
</tr>
<tr>
<td align="left">记忆利用</td>
<td align="left">利用 harness 记忆机制避免重复计算</td>
<td align="left">提升长程任务效率</td>
</tr>
<tr>
<td align="left">工作流适应</td>
<td align="left">调整自身工作流以适应 harness 约束</td>
<td align="left">在受限环境中最大化产出</td>
</tr>
<tr>
<td align="left">状态塑造</td>
<td align="left">塑造上下文填充方式以服务最终目标</td>
<td align="left"><strong>元认知级别的策略优化</strong></td>
</tr>
</tbody></table>
<h3 id="3-3-al-mn-eda-zd-harness-awareness">3.3 案例:模拟 EDA 中的 Harness Awareness</h3>
<p>在 FVF-LDO 电路设计任务中,模型在 ngspice 仿真闭环中展现出显著的 Harness Awareness:</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="center">初始值</th>
<th align="center">最终值</th>
<th align="center">提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Line Regulation</td>
<td align="center">0.65 mV/V</td>
<td align="center">0.03 mV/V</td>
<td align="center"><strong>22x</strong></td>
</tr>
<tr>
<td align="left">Load Regulation</td>
<td align="center">0.51 mV/mA</td>
<td align="center">0.03 mV/mA</td>
<td align="center"><strong>17x</strong></td>
</tr>
<tr>
<td align="left">Quiescent Current</td>
<td align="center">536 uA</td>
<td align="center">59 uA</td>
<td align="center"><strong>9x</strong></td>
</tr>
<tr>
<td align="left">Undershoot</td>
<td align="center">20.4 mV</td>
<td align="center">1.52 mV</td>
<td align="center"><strong>13x</strong></td>
</tr>
</tbody></table>
<p>约一小时的闭环迭代中,模型调用仿真器、读取波形、微调参数,充分利用了 harness 环境的 affordances.</p>
<hr>
<h2 id="4-token-xs-zndyxwd">4. Token 效率:智能的隐性维度</h2>
<h3 id="4-1-xsdb">4.1 效率对比</h3>
<p>在 ClawEval 上,MiMo-V2.5-Pro 以仅约 <strong>70K tokens per trajectory</strong> 达到 64% Pass^3:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">Pass^3</th>
<th align="center">Tokens/轨迹</th>
<th align="left">效率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MiMo-V2.5-Pro</td>
<td align="center">64%</td>
<td align="center"><strong>~70K</strong></td>
<td align="left"><strong>最高</strong></td>
</tr>
<tr>
<td align="left">Claude Opus 4.6</td>
<td align="center">~64%</td>
<td align="center">~120K</td>
<td align="left">中等</td>
</tr>
<tr>
<td align="left">Gemini 3.1 Pro</td>
<td align="center">~64%</td>
<td align="center">~110K</td>
<td align="left">中等</td>
</tr>
<tr>
<td align="left">GPT-5.4</td>
<td align="center">~64%</td>
<td align="center">~140K</td>
<td align="left">较低</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Token 效率是 2026 年 agentic 模型竞争的关键隐性维度.40-60% 的 token 节省在长程 agentic 任务中是复合的——如果一条轨迹包含 100 次 tool call,每次节省 40% 的 token,总节省可能达到数十万美元(大规模部署时).</p>
</blockquote>
<h3 id="4-2-xsly">4.2 效率来源</h3>
<table>
<thead>
<tr>
<th align="left">因素</th>
<th align="left">贡献</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Harness Awareness</td>
<td align="left">主动优化上下文使用,减少冗余</td>
</tr>
<tr>
<td align="left">渐进式上下文扩展训练</td>
<td align="left">在百万级上下文中学会高效信息组织</td>
</tr>
<tr>
<td align="left">MOPD 蒸馏</td>
<td align="left">吸收多教师的效率策略</td>
</tr>
<tr>
<td align="left">混合注意力架构</td>
<td align="left">6:1 SWA:GA 降低 KV Cache,减少内存瓶颈</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-ccrwalyj">5. 长程任务案例研究</h2>
<h3 id="5-1-aly-rust-sx-sysy-byq">5.1 案例一:Rust 实现 SysY 编译器</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">数据</th>
</tr>
</thead>
<tbody><tr>
<td align="left">任务</td>
<td align="left">从零实现完整 SysY 编译器(lexer, parser, AST, IR, backend)</td>
</tr>
<tr>
<td align="left">时间</td>
<td align="left">4.3 小时</td>
</tr>
<tr>
<td align="left">Tool call</td>
<td align="left">672 次</td>
</tr>
<tr>
<td align="left">测试分数</td>
<td align="left"><strong>233/233(满分)</strong></td>
</tr>
<tr>
<td align="left">冷启动通过率</td>
<td align="left">59%(首次编译通过 137/233)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 59% 的冷启动通过率表明模型在写第一行代码之前就已经对编译器整体架构有了清晰设计,而不是边写边改.第 512 轮的回归-恢复循环展示了自我诊断能力.</p>
</blockquote>
<h3 id="5-2-ale-qgnspbjq">5.2 案例二:全功能视频编辑器</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">数据</th>
</tr>
</thead>
<tbody><tr>
<td align="left">规模</td>
<td align="left">8,192 行代码</td>
</tr>
<tr>
<td align="left">时间</td>
<td align="left">11.5 小时</td>
</tr>
<tr>
<td align="left">Tool call</td>
<td align="left">1,868 次</td>
</tr>
<tr>
<td align="left">功能</td>
<td align="left">多轨时间线、片段裁剪、交叉淡入淡出、音频混音、导出</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>注意</strong>: 「可用的桌面应用&quot;缺乏明确的测试套件定义质量边界.8,192 行代码和 1,868 次 tool call 是过程指标,不是质量指标.</p>
</blockquote>
<h3 id="5-3-als-mn-eda">5.3 案例三:模拟 EDA</h3>
<p>详见 3.3 节.最具技术深度:模型在物理约束(工艺参数、电路拓扑)和仿真反馈(波形、指标)之间进行闭环优化.</p>
<hr>
<h2 id="6-xnqjyjzdw">6. 性能全景与竞争定位</h2>
<h3 id="6-1-mimo-v2-5-pro-hxdb">6.1 MiMo-V2.5-Pro 横向对比</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">V2.5-Pro</th>
<th align="center">V2-Pro</th>
<th align="center">K2.6</th>
<th align="center">GLM 5.1</th>
<th align="center">Claude Opus 4.6</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GDPVal-AA(ELO)</td>
<td align="center"><strong>1581</strong></td>
<td align="center">1426</td>
<td align="center">1480</td>
<td align="center">1535</td>
<td align="center">1606</td>
</tr>
<tr>
<td align="left">tau^3-bench</td>
<td align="center">72.9</td>
<td align="center">64.5</td>
<td align="center">71.0</td>
<td align="center">70.6</td>
<td align="center">72.4</td>
</tr>
<tr>
<td align="left">Claw-Eval</td>
<td align="center">63.8</td>
<td align="center">57.8</td>
<td align="center">62.3</td>
<td align="center">62.7</td>
<td align="center"><strong>70.4</strong></td>
</tr>
<tr>
<td align="left">SWE-Bench Pro</td>
<td align="center">57.2</td>
<td align="center">55.0</td>
<td align="center"><strong>58.6</strong></td>
<td align="center">58.4</td>
<td align="center">57.3</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0</td>
<td align="center"><strong>68.4</strong></td>
<td align="center">57.1</td>
<td align="center">66.7</td>
<td align="center">63.5</td>
<td align="center">65.4</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: GDPVal-AA ELO 1581 比前代 V2-Pro(1426)提升 155 分,超越 GLM 5.1(1535)和 Kimi K2.6(1480).SWE-Bench Pro 57.2% 与 Claude Opus 4.6(57.3%)几乎持平.Terminal-Bench 2.0 68.4% 超过了 Claude Opus 4.6(65.4%).</p>
</blockquote>
<h3 id="6-2-ybymxdcj">6.2 与闭源模型的差距</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">V2.5-Pro</th>
<th align="center">GPT-5.4</th>
<th align="center">差距</th>
</tr>
</thead>
<tbody><tr>
<td align="left">HLE(w/o tools)</td>
<td align="center">48.0</td>
<td align="center">58.7</td>
<td align="center">-10.7</td>
</tr>
<tr>
<td align="left">HLE(with tools)</td>
<td align="center">34.0</td>
<td align="center">42.7</td>
<td align="center">-8.7</td>
</tr>
<tr>
<td align="left">FrontierSWE(rank)</td>
<td align="center">#3.4</td>
<td align="center">#1.9</td>
<td align="center">—</td>
</tr>
</tbody></table>
<p>闭源模型在极端难度任务上仍有优势,但差距正在缩小.</p>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-sjdj">7.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么在五阶段训练中嵌入渐进式上下文扩展?</strong></p>
</blockquote>
<p>传统方法的局限:</p>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">预训练直接 1M</td>
<td align="left">通信开销极大,训练效率低</td>
</tr>
<tr>
<td align="left">后训练一次性扩展</td>
<td align="left">模型未在训练时习惯长上下文,实际表现不稳定</td>
</tr>
<tr>
<td align="left"><strong>渐进式扩展(32K→256K→1M)</strong></td>
<td align="left"><strong>在学会指令遵循的同时习惯长上下文</strong></td>
</tr>
</tbody></table>
<p>这种「能力并行培养&quot;策略的优势:模型在学会使用工具的同时,也在学习如何利用越来越长的上下文.这比「先学会短上下文工具使用,再被迫适应长上下文&quot;更自然.</p>
<blockquote>
<p><strong>思考 2: 为什么 Standard 版本用 48T 数据而 Pro 只用 27T?</strong></p>
</blockquote>
<p>两种可能的解释:</p>
<table>
<thead>
<tr>
<th align="left">解释</th>
<th align="left">依据</th>
<th align="center">合理性</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Standard 采用更广泛通用数据</td>
<td align="left">需要多模态对齐,数据多样性要求高</td>
<td align="center">高</td>
</tr>
<tr>
<td align="left">Pro 使用更高质量精选数据</td>
<td align="left">1.02T 模型需要更高信噪比</td>
<td align="center">高</td>
</tr>
<tr>
<td align="left">Pro 通过蒸馏获取部分能力</td>
<td align="left">MOPD 可以从教师蒸馏,减少预训练需求</td>
<td align="center">中</td>
</tr>
<tr>
<td align="left">Pro 训练时间更短,急于发布</td>
<td align="left">发布时间仅差 5 天</td>
<td align="center">低</td>
</tr>
</tbody></table>
<p>最可能的解释是前两者结合:Pro 版本使用了更高质量的数据,同时通过后训练(MOPD 蒸馏)来弥补预训练数据量的差距.</p>
<h3 id="7-2-sjsy">7.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: MiMo Coding Bench 的内部基准可信度</strong></p>
</blockquote>
<p>MiMo Coding Bench 是 Xiaomi 内部构建的 benchmark:</p>
<table>
<thead>
<tr>
<th align="left">风险</th>
<th align="left">表现</th>
<th align="left">缓解</th>
</tr>
</thead>
<tbody><tr>
<td align="left">训练-评测重叠</td>
<td align="left">后训练数据可能包含相似任务</td>
<td align="left">SWE-Bench Pro 等第三方基准交叉验证</td>
</tr>
<tr>
<td align="left">任务分布偏差</td>
<td align="left">可能偏向 Xiaomi 关注的场景</td>
<td align="left">与 Claude Opus 4.6 对比(77.1 vs 73.7)</td>
</tr>
<tr>
<td align="left">评测标准主观性</td>
<td align="left">内部定义,未公开详细 rubric</td>
<td align="left">需要社区独立复现</td>
</tr>
</tbody></table>
<p>V2.5-Pro 在 SWE-Bench Pro(57.2%)和 Terminal-Bench 2.0(68.4%)上的强劲第三方表现为内部 benchmark 的高分提供了可信度支撑.</p>
<blockquote>
<p><strong>思考 4: Token 效率数字的解读边界</strong></p>
</blockquote>
<p>ClawEval 上 70K tokens/轨迹的「效率&quot;需要仔细解读:</p>
<table>
<thead>
<tr>
<th align="left">问题</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">是否包含 tool call 返回的上下文?</td>
<td align="left">如果只计模型输出而忽略工具返回,真实成本被低估</td>
</tr>
<tr>
<td align="left">不同 harness 的上下文管理策略</td>
<td align="left">prompt caching、选择性压缩与模型能力无关</td>
</tr>
<tr>
<td align="left">Pass^3 的含义</td>
<td align="left">3 次尝试中至少 1 次通过,与单次 Pass@1 不同</td>
</tr>
</tbody></table>
<p>更严格的效率评估需要:统一 harness、统一上下文管理策略、报告单次 Pass@1 的 token 消耗.</p>
<h3 id="7-3-jgxj">7.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: 1M 上下文不加收倍率乘数的市场策略</strong></p>
</blockquote>
<p>MiMo-V2.5 对 1M 上下文窗口不加收额外费用:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">不加收费用</th>
<th align="left">实际成本</th>
</tr>
</thead>
<tbody><tr>
<td align="left">用户感知</td>
<td align="left">1M = 标准价格,极具吸引力</td>
<td align="left">—</td>
</tr>
<tr>
<td align="left">实际推理</td>
<td align="left">KV Cache 存储和计算显著增加</td>
<td align="left">成本上升</td>
</tr>
<tr>
<td align="left">商业策略</td>
<td align="left">市场渗透,吸引长程 Agent 用户</td>
<td align="left">短期补贴,长期盈利?</td>
</tr>
</tbody></table>
<p>这与 GLM-5.1 的长文本高成本形成对比.小米作为新进入者,可能选择「补贴换市场份额&quot;策略.</p>
<blockquote>
<p><strong>思考 6: Harness Awareness 的技术实现猜测</strong></p>
</blockquote>
<p>原文未披露 Harness Awareness 的具体实现,但可以从行为反推:</p>
<table>
<thead>
<tr>
<th align="left">行为</th>
<th align="left">可能的实现机制</th>
</tr>
</thead>
<tbody><tr>
<td align="left">主动请求特定上下文格式</td>
<td align="left">训练数据中包含 harness 元数据,模型学会解析</td>
</tr>
<tr>
<td align="left">利用记忆机制</td>
<td align="left">训练时模拟多种记忆接口,模型学会最优使用</td>
</tr>
<tr>
<td align="left">调整工作流</td>
<td align="left">RL 奖励函数包含「效率&quot;维度,激励最优路径</td>
</tr>
<tr>
<td align="left">塑造上下文填充</td>
<td align="left">自注意力机制学习识别 harness 状态标记</td>
</tr>
</tbody></table>
<p>如果 Harness Awareness 确实可靠,它可能改变 Agent 系统设计范式:从「为固定模型设计最优 harness&quot;转向「让模型自适应地利用 harness&quot;.</p>
<h3 id="7-4-jxyfx">7.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 视频编辑器案例的评估模糊性</strong></p>
</blockquote>
<p>视频编辑器案例(8,192 行代码,11.5 小时,1,868 次 tool call)的问题:</p>
<table>
<thead>
<tr>
<th align="left">问题</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">无明确测试套件</td>
<td align="left">「可用&quot;的定义主观</td>
</tr>
<tr>
<td align="left">过程指标 ≠ 质量指标</td>
<td align="left">大而有 bug 的系统可能不如小而精的工具</td>
</tr>
<tr>
<td align="left">成本问题</td>
<td align="left">按 \$3/1M output tokens,单次运行可能数百美元</td>
</tr>
<tr>
<td align="left">可复制性</td>
<td align="left">未公开 prompt 和 harness 配置</td>
</tr>
</tbody></table>
<p>与 SysY 编译器案例(233/233 满分,4.3 小时)相比,视频编辑器的说服力明显较弱.</p>
<blockquote>
<p><strong>思考 8: 多模态能力的技术报告缺失</strong></p>
</blockquote>
<p>MiMo-V2.5 强调「原生视觉和音频理解&quot;,但技术博客中缺乏多模态能力的定量评估:</p>
<table>
<thead>
<tr>
<th align="left">能力</th>
<th align="left">声称</th>
<th align="left">缺失</th>
</tr>
</thead>
<tbody><tr>
<td align="left">视觉推理</td>
<td align="left">「与前沿闭源模型同一水平&quot;</td>
<td align="left">具体 benchmark 分数</td>
</tr>
<tr>
<td align="left">视频理解</td>
<td align="left">「追平 Gemini 3 Pro&quot;</td>
<td align="left">视频 benchmark 数据</td>
</tr>
<tr>
<td align="left">音频理解</td>
<td align="left">提及但未展开</td>
<td align="left">音频 benchmark 数据</td>
</tr>
<tr>
<td align="left">多模态 Agent</td>
<td align="left">提及但未展开</td>
<td align="left">多模态 Agent 基准</td>
</tr>
</tbody></table>
<p>这种「定性声称 + 定量缺失&quot;的组合降低了多模态能力的可信度.需要等待独立的第三方评测来验证.</p>
<blockquote>
<p><strong>思考 9: Pro 版本 42B 激活参数的推理成本</strong></p>
</blockquote>
<p>MiMo-V2.5-Pro 的 42B 激活参数是 Standard(15B)的 2.8 倍:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="center">Standard(15B)</th>
<th align="center">Pro(42B)</th>
<th align="center">比率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">推理 FLOPs</td>
<td align="center">基准</td>
<td align="center"><strong>2.8x</strong></td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">内存占用</td>
<td align="center">基准</td>
<td align="center"><strong>2.8x</strong></td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">延迟</td>
<td align="center">基准</td>
<td align="center"><strong>更高</strong></td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">API 定价</td>
<td align="center">1x 倍率</td>
<td align="center"><strong>2x 倍率</strong></td>
<td align="center">2x</td>
</tr>
</tbody></table>
<p>2x 的 API 倍率似乎低于 2.8x 的计算增长,这意味着小米可能在补贴 Pro 版本的使用.对于成本敏感的应用,Standard 版本的 15B 激活参数可能已足够.</p>
<h3 id="7-5-jspx">7.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: MiMo-V2.5 在多模态 Agent 演进中的位置</strong></p>
</blockquote>
<p>2026 年 Q2 的多模态 Agent 竞争格局:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">模态</th>
<th align="left">核心优势</th>
<th align="left">Agentic 能力</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>MiMo-V2.5</strong></td>
<td align="left"><strong>文本+视觉+音频</strong></td>
<td align="left"><strong>Token 效率,Harness Awareness</strong></td>
<td align="left"><strong>长程 Agent(1000+ tool call)</strong></td>
</tr>
<tr>
<td align="left">Gemini 3.1 Pro</td>
<td align="left">文本+视觉+音频+视频</td>
<td align="left">全面领先</td>
<td align="left">强</td>
</tr>
<tr>
<td align="left">Kimi K2.6</td>
<td align="left">文本+视觉</td>
<td align="left">Agent Swarm</td>
<td align="left">强(300 子 Agent)</td>
</tr>
<tr>
<td align="left">GLM-5.1</td>
<td align="left">文本</td>
<td align="left">长程持续优化</td>
<td align="left">强(数百轮迭代)</td>
</tr>
<tr>
<td align="left">Claude Opus 4.6</td>
<td align="left">文本+视觉</td>
<td align="left">通用能力</td>
<td align="left">强</td>
</tr>
</tbody></table>
<p>MiMo-V2.5 的独特价值在于:<strong>它是少数完全开源的多模态 Agent 模型之一</strong>,且在 token 效率和长程任务执行上展现出差异化优势.但多模态能力的定量验证仍是关键缺口.</p>
<blockquote>
<p><strong>思考 11: 从「模型能力&quot;到「系统能力&quot;的评估范式转移</strong></p>
</blockquote>
<p>MiMo-V2.5 的案例研究揭示了一个趋势:评估范式正在从「模型能力&quot;转向「系统能力&quot;:</p>
<table>
<thead>
<tr>
<th align="left">范式</th>
<th align="left">评估对象</th>
<th align="left">典型基准</th>
</tr>
</thead>
<tbody><tr>
<td align="left">模型中心</td>
<td align="left">模型本身的推理/生成能力</td>
<td align="left">MMLU, AIME</td>
</tr>
<tr>
<td align="left"><strong>系统中心</strong></td>
<td align="left"><strong>模型 + Harness 的端到端交付能力</strong></td>
<td align="left"><strong>SysY 编译器,视频编辑器,模拟 EDA</strong></td>
</tr>
</tbody></table>
<p>系统中心评估的优势:更接近真实使用场景.劣势:难以标准化,可复制性差.MiMo-V2.5 的案例研究虽然生动,但缺乏严格的控制条件——不同 harness、不同环境配置可能导致截然不同的结果.</p>
<hr>
<h2 id="8-bssj-cjspybbxz">8. 部署视角:场景适配与版本选择</h2>
<h3 id="8-1-standard-vs-pro-xzzn">8.1 Standard vs Pro 选择指南</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐版本</th>
<th align="left">理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left">日常编码</td>
<td align="left">Standard</td>
<td align="left">成本一半,能力接近</td>
</tr>
<tr>
<td align="left">复杂软件工程</td>
<td align="left">Pro</td>
<td align="left">SWE-Pro 57.2%,Terminal-Bench 68.4%</td>
</tr>
<tr>
<td align="left">长程 Agent 任务</td>
<td align="left">Pro</td>
<td align="left">1000+ tool call 稳定性</td>
</tr>
<tr>
<td align="left">多模态理解</td>
<td align="left">Standard/Pro</td>
<td align="left">两者均支持,Pro 能力更强</td>
</tr>
<tr>
<td align="left">实时交互</td>
<td align="left">Standard</td>
<td align="left">15B 激活参数延迟更低</td>
</tr>
<tr>
<td align="left">成本敏感批处理</td>
<td align="left">Standard</td>
<td align="left">1x 倍率 vs 2x</td>
</tr>
<tr>
<td align="left">研究/实验</td>
<td align="left">Standard</td>
<td align="left">开源权重,MIT 许可</td>
</tr>
</tbody></table>
<h3 id="8-2-1m-sxwdsjjz">8.2 1M 上下文的实际价值</h3>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">1M 上下文优势</th>
<th align="left">实际使用建议</th>
</tr>
</thead>
<tbody><tr>
<td align="left">大代码库理解</td>
<td align="left">一次性加载整个仓库</td>
<td align="left">结合代码索引,避免全量加载</td>
</tr>
<tr>
<td align="left">长文档分析</td>
<td align="left">处理整本书/长论文</td>
<td align="left">分段处理+全局摘要可能更高效</td>
</tr>
<tr>
<td align="left">多轮 Agent 轨迹</td>
<td align="left">保留完整历史</td>
<td align="left">利用 harness 记忆,选择性保留</td>
</tr>
<tr>
<td align="left">视频理解</td>
<td align="left">处理长视频序列</td>
<td align="left">关键帧提取可能比全序列更高效</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>建议</strong>: 1M 上下文是「能力上限&quot;,但不一定总是「最优策略&quot;.在实际部署中,结合 harness 的记忆管理和上下文压缩,可能比单纯依赖长上下文更经济高效.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: MiMo-V2.5 / MiMo-V2.5-Pro Technical Blog, Xiaomi AI Lab, 2026-04-22/27</li>
<li>前置阅读: <a href="#broken-link">01-MiMo-V2.5技术博客精译</a></li>
<li>前代模型: <a href="#broken-link">MiMo-V2-Flash 剖析</a></li>
<li>开源仓库: <a href="https://github.com/XiaomiMiMo/MiMo-V2-Flash">https://github.com/XiaomiMiMo/MiMo-V2-Flash</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxdw-ccwbddmt-agent-dys","text":"1. 核心定位:从纯文本到多模态 Agent 的跃升"},{"level":2,"id":"2-wjdxlyjjssxwkz","text":"2. 五阶段训练与渐进式上下文扩展"},{"level":3,"id":"2-1-xllc","text":"2.1 训练流程"},{"level":3,"id":"2-2-sxwkzdclyy","text":"2.2 上下文扩展的策略意义"},{"level":2,"id":"3-harness-awareness-mx-hjjkdyrz","text":"3. Harness Awareness:模型-环境接口的元认知"},{"level":3,"id":"3-1-ct-agent-mxdjx","text":"3.1 传统 Agent 模型的局限"},{"level":3,"id":"3-2-mimo-v2-5-pro-d-harness-awareness","text":"3.2 MiMo-V2.5-Pro 的 Harness Awareness"},{"level":3,"id":"3-3-al-mn-eda-zd-harness-awareness","text":"3.3 案例:模拟 EDA 中的 Harness Awareness"},{"level":2,"id":"4-token-xs-zndyxwd","text":"4. Token 效率:智能的隐性维度"},{"level":3,"id":"4-1-xsdb","text":"4.1 效率对比"},{"level":3,"id":"4-2-xsly","text":"4.2 效率来源"},{"level":2,"id":"5-ccrwalyj","text":"5. 长程任务案例研究"},{"level":3,"id":"5-1-aly-rust-sx-sysy-byq","text":"5.1 案例一:Rust 实现 SysY 编译器"},{"level":3,"id":"5-2-ale-qgnspbjq","text":"5.2 案例二:全功能视频编辑器"},{"level":3,"id":"5-3-als-mn-eda","text":"5.3 案例三:模拟 EDA"},{"level":2,"id":"6-xnqjyjzdw","text":"6. 性能全景与竞争定位"},{"level":3,"id":"6-1-mimo-v2-5-pro-hxdb","text":"6.1 MiMo-V2.5-Pro 横向对比"},{"level":3,"id":"6-2-ybymxdcj","text":"6.2 与闭源模型的差距"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-sjdj","text":"7.1 设计动机"},{"level":3,"id":"7-2-sjsy","text":"7.2 数据实验"},{"level":3,"id":"7-3-jgxj","text":"7.3 架构细节"},{"level":3,"id":"7-4-jxyfx","text":"7.4 局限与风险"},{"level":3,"id":"7-5-jspx","text":"7.5 技术谱系"},{"level":2,"id":"8-bssj-cjspybbxz","text":"8. 部署视角:场景适配与版本选择"},{"level":3,"id":"8-1-standard-vs-pro-xzzn","text":"8.1 Standard vs Pro 选择指南"},{"level":3,"id":"8-2-1m-sxwdsjjz","text":"8.2 1M 上下文的实际价值"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.9-mimo/03-mimo-v2.5/05-mimo-v2.5-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.9-mimo/03-mimo-v2.5/05-mimo-v2.5-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiMo-V2.5 多模态 Agentic 能力与 Harness 感知剖析</h1>
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
