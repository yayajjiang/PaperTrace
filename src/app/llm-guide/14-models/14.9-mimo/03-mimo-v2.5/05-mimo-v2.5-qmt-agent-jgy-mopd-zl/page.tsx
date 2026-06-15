"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiMo-V2.5 全模态 Agent 架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">返回 14.9-MiMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: MiMo-V2.5 / MiMo-V2.5-Pro Technical Blog (Xiaomi AI Lab, 2026-04-22/27)
发布日期: 2026-04-22(V2.5 Standard) / 2026-04-27(V2.5-Pro)
发布机构: Xiaomi AI Lab
开源协议: MIT License</p>
</blockquote>
<hr>
<h2 id="1-sjdj-tydmty-token-xsdjd">1. 设计动机:统一多模态与 Token 效率的兼得</h2>
<p>MiMo-V2.5 是 MiMo 家族的首个多模态模型,在 V2-Flash 的纯文本能力基础上增加了原生视觉和音频理解能力.与市场上常见的「文本模型 + 外挂视觉模块」方案不同,MiMo-V2.5 采用统一架构:自研的视觉 Encoder 和音频 Encoder 通过轻量 projector 连接到语言 backbone,三种模态从底层共享同一个推理引擎.</p>
<p>发布两个版本:</p>
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
<p><strong>译者注</strong>: Standard 版本的 48T 训练数据量非常可观——约为 DeepSeek-V3(14.8T)的 3.2 倍.Pro 版本虽然总参数和激活参数更多,但训练数据反而更少(27T),可能使用了更高质量、更精选的数据,或通过 MOPD 蒸馏获取能力.原文没有解释这个数据量差异的原因,最可能的解释是 Pro 版本使用了更高质量的数据,同时通过后训练蒸馏来弥补预训练数据量的差距.</p>
</blockquote>
<p>MiMo-V2.5 的独特之处在于<strong>它是少数完全开源的多模态 Agent 模型之一</strong>,且在 token 效率和长程任务执行上展现出差异化优势.但多模态能力的定量验证仍是关键缺口——技术博客中缺乏多模态 benchmark 的具体分数.</p>
<hr>
<h2 id="2-hxjg-hybrid-attention-yjjssxwkz">2. 核心架构:Hybrid Attention 与渐进式上下文扩展</h2>
<h3 id="2-1-wjdxllc">2.1 五阶段训练流程</h3>
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
<p><strong>译者注</strong>: Agentic 任务天然需要长上下文——多轮 tool call 的轨迹累积、历史经验引用、大代码库理解.MiMo-V2.5 在训练时就习惯了百万级上下文,这意味着它在真实 Agent 场景中的长程连贯性可能比「先短后长」训练方式的模型更可靠.但渐进式扩展也增加了训练复杂度,每个阶段都需要重新调整位置编码和注意力机制.</p>
</blockquote>
<h3 id="2-2-hybrid-attention-6-1-jbyqjdjc">2.2 Hybrid Attention:6:1 局部与全局的交错</h3>
<p>MiMo-V2.5-Pro 继承自 MiMo-V2-Flash 的 <strong>hybrid attention</strong> 和 <strong>Multi-Token Prediction(MTP)</strong> 设计.Local Sliding Window Attention(SWA)和 Global Attention(GA)以 6:1 的比例交错,使用 128-token 窗口.</p>
<p>这种「大部分廉价 + 少部分昂贵」的设计在降低 KV Cache 的同时,通过 attention-sink bias 来缓解长距离信息丢失——bias 的作用是强制少数 token(通常是序列开头的几个)始终参与全局注意力,作为信息的「锚点」.配备 dense FFNs 的轻量 MTP 模块原生集成于训练和推理中,大致将输出吞吐量提升 3 倍,并加速 RL rollout.</p>
<table>
<thead>
<tr>
<th align="left">注意力类型</th>
<th align="center">比例</th>
<th align="center">计算复杂度</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Local SWA</td>
<td align="center">6/7</td>
<td align="center">O(n)</td>
<td align="left">捕获局部依赖,降低 KV Cache</td>
</tr>
<tr>
<td align="left">Global Attention</td>
<td align="center">1/7</td>
<td align="center">O(n^2)</td>
<td align="left">保留长距离连接,全局信息聚合</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 6:1 的 Local:Global attention 比例是一个有趣的工程选择.大部分注意力层使用高效的局部窗口,只有少部分层需要全局视野.这种设计在降低 KV Cache 的同时,通过 attention-sink bias 来缓解长距离信息丢失——bias 的作用是强制少数 token 始终参与全局注意力,作为信息的「锚点」.但 128-token 的窗口对于某些需要中长距离依赖的任务(如跨段落指代)可能仍然不足,1/7 的全局层是否足够,需要更多消融实验来验证.</p>
</blockquote>
<hr>
<h2 id="3-gjcx-mopd-zly-harness-awareness">3. 关键创新:MOPD 蒸馏与 Harness Awareness</h2>
<h3 id="3-1-mopd-djszxclzl">3.1 MOPD:多教师在线策略蒸馏</h3>
<p>MiMo-V2.5-Pro 后训练阶段的核心创新是 MOPD(Multi-Teacher On-Policy Distillation).传统的多教师蒸馏通常采用「离线」方式:每个学生从每个教师的静态输出中学习.MOPD 的「on-policy」意味着学生模型先生成自己的输出,然后教师模型对这些输出进行评分和指导.</p>
<p>后训练遵循三阶段范式:</p>
<ol>
<li><strong>Supervised Fine-Tuning</strong>: 在精选的数据对上建立基础指令遵循能力</li>
<li><strong>Domain-Specialized Training</strong>: 通过特定领域的 RL 分别优化多个教师模型,涵盖数学、安全、agentic tool-use 等领域</li>
<li><strong>MOPD</strong>: 单一学生模型在自身的 rollout 下向每个专家教师学习,在 token 级别接受每位专家教师的指导,将他们的能力融合到一个统一模型中</li>
</ol>
<blockquote>
<p><strong>译者注</strong>: MOPD 的挑战在于多个教师的反馈信号可能存在冲突.例如,安全教师可能倾向于保守回答,而数学教师可能鼓励精确推理.原文没有披露如何处理这些冲突,但 token 级别的指导暗示了一种细粒度的融合机制——不同 token 位置可能接受不同教师的指导.</p>
</blockquote>
<h3 id="3-2-harness-awareness-mx-hjjkdyrz">3.2 Harness Awareness:模型-环境接口的元认知</h3>
<p>MiMo-V2.5-Pro 展现出<strong>主动利用 harness 功能来优化执行效率</strong>的能力,这被称为「harness awareness」:</p>
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
<p>传统 Agent 模型通常将 harness 视为被动容器——模型只关心生成正确的 tool call,而不关心 harness 如何管理状态、如何组织上下文.MiMo-V2.5-Pro 的 harness awareness 意味着它能够主动利用 harness 的功能来优化自己的执行效率.</p>
<blockquote>
<p><strong>译者注</strong>: Harness Awareness 是 MiMo-V2.5-Pro 的一个独特卖点.原文未披露具体实现,但可以从行为反推:训练数据中可能包含 harness 元数据,模型学会解析;RL 奖励函数可能包含「效率」维度,激励最优路径;自注意力机制可能学习识别 harness 状态标记.如果 Harness Awareness 确实可靠,它可能改变 Agent 系统设计范式:从「为固定模型设计最优 harness」转向「让模型自适应地利用 harness」.</p>
</blockquote>
<h3 id="3-3-token-xs-zndyxwd">3.3 Token 效率:智能的隐性维度</h3>
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
<p><strong>译者注</strong>: Token 效率是 2026 年 agentic 模型竞争的关键隐性维度,但它的重要性容易被低估.40-60% 的 token 节省在长程 agentic 任务中是复合的——如果一条轨迹包含 100 次 tool call,每次节省 40% 的 token,总节省可能达到数十万美元(大规模部署时).但这里有一个重要的 caveat:ClawEval 的「per trajectory」token 计数是否包含了 tool call 返回的上下文?如果只计模型输出而忽略工具返回的大型上下文(如代码文件、日志内容),那么「70K tokens」可能低估了真实的成本.</p>
</blockquote>
<hr>
<h2 id="4-hxdb-xnqjyjzdw">4. 横向对比:性能全景与竞争定位</h2>
<h3 id="4-1-mimo-v2-5-pro-hxdb">4.1 MiMo-V2.5-Pro 横向对比</h3>
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
<p>GDPVal-AA ELO 1581 比前代 V2-Pro(1426)提升 155 分,超越 GLM 5.1(1535)和 Kimi K2.6(1480).SWE-Bench Pro 57.2% 与 Claude Opus 4.6(57.3%)几乎持平.Terminal-Bench 2.0 68.4% 超过了 Claude Opus 4.6(65.4%).</p>
<h3 id="4-2-ybymxdcj">4.2 与闭源模型的差距</h3>
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
<h3 id="4-3-standard-vs-pro-xzzn">4.3 Standard vs Pro 选择指南</h3>
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
<hr>
<h2 id="5-jxxyfx">5. 局限性与风险</h2>
<p><strong>多模态能力的技术报告缺失.</strong> MiMo-V2.5 强调「原生视觉和音频理解」,但技术博客中缺乏多模态能力的定量评估:</p>
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
<td align="left">「与前沿闭源模型同一水平」</td>
<td align="left">具体 benchmark 分数</td>
</tr>
<tr>
<td align="left">视频理解</td>
<td align="left">「追平 Gemini 3 Pro」</td>
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
<p>这种「定性声称 + 定量缺失」的组合降低了多模态能力的可信度.需要等待独立的第三方评测来验证.</p>
<p><strong>Pro 版本 27T vs Standard 48T 的数据量差异.</strong> Pro 版本虽然总参数和激活参数更多,但训练数据反而更少(27T vs 48T).这个差异可能反映了两种训练策略,但原文没有给出明确解释.如果 Pro 版本的能力提升主要来自后训练而非预训练,那么其泛化能力是否受限于预训练数据的广度,是一个未解问题.</p>
<p><strong>视频编辑器案例的评估模糊性.</strong> 视频编辑器案例(8,192 行代码,11.5 小时,1,868 次 tool call)缺乏明确的测试套件定义质量边界.「可用的桌面应用」是主观判断,大而有 bug 的系统可能不如小而精的工具.此外,按 \$3/1M output tokens 的定价,单次运行可能数百美元,成本结构需要优化.</p>
<p><strong>Pro 版本 42B 激活参数的推理成本.</strong> MiMo-V2.5-Pro 的 42B 激活参数是 Standard(15B)的 2.8 倍,但 API 倍率仅为 2x.这意味着小米可能在补贴 Pro 版本的使用.对于成本敏感的应用,Standard 版本的 15B 激活参数可能已足够.</p>
<p><strong>信息来源限制.</strong> MiMo-V2.5 的信息来源是官方博客而非学术论文,技术细节披露有限.五阶段训练的具体数据配比、MOPD 的教师冲突处理机制、Harness Awareness 的具体实现等关键信息未公开,限制了社区的精确复现.</p>
<hr>
<h2 id="6-zdmt-agent-yjzdwz">6. 在多模态 Agent 演进中的位置</h2>
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
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: MiMo-V2.5 / MiMo-V2.5-Pro Technical Blog, Xiaomi AI Lab, 2026-04-22/27</li>
<li>前置阅读: <a href="#broken-link">01-MiMo-V2.5技术博客精译</a></li>
<li>前代模型: MiMo-V2-Flash 技术报告精译(见 02-MiMo-V2-Flash 目录)</li>
<li>开源仓库: <a href="https://github.com/XiaomiMiMo/MiMo-V2-Flash">https://github.com/XiaomiMiMo/MiMo-V2-Flash</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-tydmty-token-xsdjd","text":"1. 设计动机:统一多模态与 Token 效率的兼得"},{"level":2,"id":"2-hxjg-hybrid-attention-yjjssxwkz","text":"2. 核心架构:Hybrid Attention 与渐进式上下文扩展"},{"level":3,"id":"2-1-wjdxllc","text":"2.1 五阶段训练流程"},{"level":3,"id":"2-2-hybrid-attention-6-1-jbyqjdjc","text":"2.2 Hybrid Attention:6:1 局部与全局的交错"},{"level":2,"id":"3-gjcx-mopd-zly-harness-awareness","text":"3. 关键创新:MOPD 蒸馏与 Harness Awareness"},{"level":3,"id":"3-1-mopd-djszxclzl","text":"3.1 MOPD:多教师在线策略蒸馏"},{"level":3,"id":"3-2-harness-awareness-mx-hjjkdyrz","text":"3.2 Harness Awareness:模型-环境接口的元认知"},{"level":3,"id":"3-3-token-xs-zndyxwd","text":"3.3 Token 效率:智能的隐性维度"},{"level":2,"id":"4-hxdb-xnqjyjzdw","text":"4. 横向对比:性能全景与竞争定位"},{"level":3,"id":"4-1-mimo-v2-5-pro-hxdb","text":"4.1 MiMo-V2.5-Pro 横向对比"},{"level":3,"id":"4-2-ybymxdcj","text":"4.2 与闭源模型的差距"},{"level":3,"id":"4-3-standard-vs-pro-xzzn","text":"4.3 Standard vs Pro 选择指南"},{"level":2,"id":"5-jxxyfx","text":"5. 局限性与风险"},{"level":2,"id":"6-zdmt-agent-yjzdwz","text":"6. 在多模态 Agent 演进中的位置"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.9-mimo/03-mimo-v2.5/05-mimo-v2.5-qmt-agent-jgy-mopd-zl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.9-mimo/03-mimo-v2.5/05-mimo-v2.5-qmt-agent-jgy-mopd-zl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiMo-V2.5 全模态 Agent 架构剖析</h1>
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
