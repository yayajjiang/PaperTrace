"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ChatGLM: 从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools
原文链接: <a href="https://arxiv.org/abs/2406.12793">https://arxiv.org/abs/2406.12793</a>
发表会议: arXiv preprint (2024.06)
发布日期: 2024.06.18 (v1)
发布机构: Zhipu AI &amp; Tsinghua University (Team GLM)
开源协议: 模型权重公开 (ChatGLM-6B 三代, GLM-4-9B 系列)</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-chatglm-%E6%8A%80%E6%9C%AF">2 ChatGLM 技术</a><ul>
<li><a href="#21-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE">2.1 预训练数据</a></li>
<li><a href="#22-%E6%9E%B6%E6%9E%84">2.2 架构</a></li>
<li><a href="#23-%E5%AF%B9%E9%BD%90">2.3 对齐</a></li>
<li><a href="#24-chatglm-%E7%B3%BB%E5%88%97%E6%8A%80%E6%9C%AF">2.4 ChatGLM 系列技术</a></li>
<li><a href="#25-glm-4-all-tools">2.5 GLM-4 All Tools</a></li>
</ul>
</li>
<li><a href="#3-glm-4-%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0">3 GLM-4 能力评估</a><ul>
<li><a href="#31-%E5%AD%A6%E6%9C%AF%E5%9F%BA%E5%87%86%E8%AF%84%E4%BC%B0">3.1 学术基准评估</a></li>
<li><a href="#32-%E6%8C%87%E4%BB%A4%E9%81%B5%E5%BE%AA%E8%AF%84%E4%BC%B0">3.2 指令遵循评估</a></li>
<li><a href="#33-%E5%AF%B9%E9%BD%90%E8%AF%84%E4%BC%B0">3.3 对齐评估</a></li>
<li><a href="#34-%E9%95%BF%E4%B8%8A%E4%B8%8B%E6%96%87%E5%A4%84%E7%90%86%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0">3.4 长上下文处理能力评估</a></li>
<li><a href="#35-%E7%9C%9F%E5%AE%9E%E7%94%A8%E6%88%B7%E6%8F%90%E7%A4%BA%E4%B8%8B%E7%9A%84%E4%BB%A3%E7%A0%81%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0">3.5 真实用户提示下的代码能力评估</a></li>
<li><a href="#36-function-call-%E8%AF%84%E4%BC%B0">3.6 Function Call 评估</a></li>
<li><a href="#37-agent-%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0">3.7 Agent 能力评估</a></li>
<li><a href="#38-all-tools-%E8%AF%84%E4%BC%B0">3.8 All Tools 评估</a></li>
</ul>
</li>
<li><a href="#4-%E5%AE%89%E5%85%A8%E4%B8%8E%E9%A3%8E%E9%99%A9">4 安全与风险</a></li>
<li><a href="#5-%E7%BB%93%E8%AE%BA">5 结论</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E6%9C%AF%E8%AF%AD%E8%A1%A8">A. 术语表</a></li>
<li><a href="#b-%E6%A0%B8%E5%BF%83%E5%85%AC%E5%BC%8F%E4%B8%8E%E5%8F%82%E6%95%B0%E7%B4%A2%E5%BC%95">B. 核心公式与参数索引</a></li>
<li><a href="#c-%E6%A8%A1%E5%9E%8B%E8%B0%B1%E7%B3%BB%E5%AE%9A%E4%BD%8D">C. 模型谱系定位</a></li>
</ul>
</li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们介绍 ChatGLM，一个我们一直在持续开发演进的大语言模型家族. 本报告主要聚焦于 GLM-4 语言系列，包括 GLM-4、GLM-4-Air 和 GLM-4-9B. 它们代表了我们从前三代 ChatGLM 中获得的所有洞察和经验教训所训练出的最强模型. 迄今为止，GLM-4 模型已在约 10 万亿(10T) token 上进行预训练，语料主要为中文和英文，同时包含少量来自 24 种语言的语料，对齐主要针对中文和英文使用场景. 高质量的对齐通过多阶段后训练过程实现，包括监督微调(SFT)和从人类反馈中学习(RLHF). 评估表明，GLM-4 在以下方面表现突出：1) 在 MMLU、GSM8K、MATH、BBH、GPQA 和 HumanEval 等通用指标上接近或超越 GPT-4; 2) 在 IFEval 评测的指令遵循方面接近 GPT-4-Turbo; 3) 在长上下文任务上匹配 GPT-4 Turbo(128K)和 Claude 3; 4) 在 AlignBench 评测的中文对齐方面超越 GPT-4. GLM-4 All Tools 模型进一步对齐以理解用户意图，并自主决定何时以及使用哪些工具——包括网页浏览器、Python 解释器、文本到图像模型以及用户自定义函数——以有效完成复杂任务. 在实际应用中，它在通过网页浏览获取在线信息和使用 Python 解释器解决数学问题等任务上匹配甚至超越了 GPT-4 All Tools.</p>
<p>在此过程中，我们开源了一系列模型，包括三代 ChatGLM-6B、GLM-4-9B(128K、1M)、GLM-4V-9B、WebGLM 和 CodeGeeX，仅 2023 一年就在 Hugging Face 上吸引了超过 1000 万次下载. 开源模型可通过 <a href="https://github.com/THUDM">https://github.com/THUDM</a> 和 <a href="https://huggingface.co/THUDM">https://huggingface.co/THUDM</a> 访问.</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>大语言模型(LLMs)的快速发展令人瞩目(Zhao et al., 2023). 以 OpenAI 的 GPT 系列这一最成功的模型家族为例：2020 年发布的原始 GPT-3 模型(GPT3)标志着从 GPT-1 的 1.17 亿参数和 GPT-2 的 15 亿参数到 1750 亿参数的重大规模跃升. 这种规模化使基于 decoder-only transformer 的 GPT-3 模型具备了 in-context learning 和泛化能力：据 OpenAI 称，GPT-3.5 系列通过引入指令微调(instruction tuning)、监督微调(SFT)和/或人类反馈强化学习(RLHF)(Ouyang et al., 2022)改进了 GPT-3. 这如今已成为创建高性能 LLM 的标准流程，包括 PaLM 模型(Chowdhery et al., 2022)、LLaMA 模型(Touvron et al., 2023)、Gemini 模型(Gemini Team, 2023)等.</p>
<p>在与主流 LLM 开发实践并行的另一条路线上，我们提出了通用语言模型(GLM)架构(Du et al., 2022)，其特点是自回归空白填充(autoregressive blank infilling)目标，并于 2021 年开源了 GLM-10B 模型(参见图 1 中的 GLM 时间线). 从 2021 年末开始，我们开始预训练 GLM-130B(Zeng et al., 2022). 目标是训练一个 100B 规模的模型以匹配或超越 GPT-3(davinci)，同时验证在此规模上成功训练模型的技术，与同期的 OPT-175B(Zhang et al., 2022)和 BLOOM-176B(Scao et al., 2022)等努力类似. 我们在 2022 年 7 月完成了 GLM-130B 的 400B token 训练和评估，随后在 2022 年 8 月发布了模型和预训练细节(Zeng et al., 2022). 根据 2022 年 11 月的 HELM 评估，GLM-130B 在各个维度上匹配了 GPT-3(davinci)(Liang et al., 2023).</p>
<blockquote>
<p>图 1: GLM 家族语言、代码、视觉和 Agent 模型的时间线. 本报告主要聚焦于语言模型，即 ChatGLM. API 公开可访问于 <a href="https://bigmodel.cn%EF%BC%8C%E5%BC%80%E6%BA%90%E6%A8%A1%E5%9E%8B%E5%8F%AF%E9%80%9A%E8%BF%87">https://bigmodel.cn，开源模型可通过</a> <a href="https://github.com/THUDM">https://github.com/THUDM</a> 访问. 数据来源: 原文 Figure 1.</p>
</blockquote>
<p>在此之后，我们在 GLM-130B 上启动了指令微调. 后来，ChatGPT 进一步激励我们使用 SFT 和 RLHF 对齐基座模型. 我们从零开始创建和精心制作 prompt-response 对并执行 SFT，同时开始研究如何有效应用 RLHF. 2023 年 3 月 14 日，对齐后的模型 ChatGLM-130B 在 <a href="https://chatglm.cn">https://chatglm.cn</a> 上线. 此外，一个更小的版本 ChatGLM-6B(GitHub: ChatGLM-6B)在同一天开源，吸引了远超预期的关注. 它被设计为 62 亿参数，目的是 1) 促进预训练和后训练技术以及数据选择的快速迭代，2) 通过 INT4 量化实现消费级显卡上的本地部署. 从那时起，我们一直在快速探索和优化预训练和对齐技术，每三个月推出一代新的 ChatGLM 系列，第二代和第三代都是从头开始预训练的.</p>
<p>ChatGLM-6B 在约 1 万亿 token 的中英文语料上预训练，上下文长度为 2048(2K)，主要辅以 SFT. 2023 年 6 月发布的 ChatGLM2-6B 使用更多高质量数据预训练和对齐，相比前代有显著提升，包括 MMLU 上 +23%、GSM8K 上 +571%、BBH 上 +60%. 通过采用 FlashAttention 技术(Dao et al., 2022)，其上下文长度扩展到 32K. 此外，Multi-Query Attention(Shazeer, 2019)的集成使推理速度提升了 42%. 在此基础上，我们的第二代代码模型 CodeGeeX2-6B 通过在额外 6000 亿代码 token 上预训练而开发. 它在 HumanEval-X 评测中相比初代 CodeGeeX-13B(Zheng et al., 2023)展示了 Pass@1 的提升：Python +57%、C++ +71%、Java +54%、JavaScript +83%、Go +56%. 在适应基于角色的对话时，CharacterGLM(Zhou et al., 2023)允许在 LLM 上进行有效且安全的角色定制. 通过进一步适应更多样化的训练数据集、更充分的训练步数和更优化的训练策略，ChatGLM3-6B 在语义、数学、推理、代码和知识等 42 个基准上位居前列. 从这一代开始，ChatGLM 还支持函数调用(function call)和代码解释器(code interpreter)，以及复杂的 Agent 任务(Liu et al., 2023; Zeng et al., 2023; Lai et al., 2024). 在这些开发过程中，我们还开发了 1.5B、3B、12B、32B、66B 和 130B 参数的模型，使我们能够验证观察结果并建立自己的 scaling laws.</p>
<blockquote>
<p><strong>[设计动机]</strong> ChatGLM 的迭代哲学：小模型快速试错</p>
<p>ChatGLM 家族的一个独特策略是「小模型先行」. 通过发布 6B 参数的小型模型，团队能够在消费级 GPU 上快速迭代预训练和后训练技术. 这与 GPT-3/4 的闭源策略形成鲜明对比：OpenAI 不需要向公众证明自己的技术路线，而智谱 AI 作为学术背景浓厚的团队，需要通过开源来验证假设、收集反馈、建立声誉. 每三个月一代的迭代速度在当时的中国 LLM 赛道中是极快的，这得益于 6B 小模型将训练周期从数月压缩到数周. 从工程角度看，这种「小模型探路 → 大模型验证」的策略降低了试错成本，但也意味着每一代都需要从头预训练——没有采用继续预训练的方式，可能是因为团队希望彻底验证新的数据配方和训练策略.</p>
</blockquote>
<p>在积累的所有经验和教训基础上，我们启动了 GLM-4 的训练. 首个 cutoff Checkpoint随后经历了多阶段后训练过程(如 SFT、RLHF、安全对齐)，目前主要针对中文和英文. 随后，它发展为两个不同版本：GLM-4 和 GLM-4 All Tools，均支持 128K 上下文长度. 自 2024 年 1 月 16 日起，GLM-4(0116)通过 GLM-4 API 在 <a href="https://bigmodel.cn">https://bigmodel.cn</a> 上提供，GLM-4 All Tools 可通过 <a href="https://chatglm.cn">https://chatglm.cn</a> 网站和支持创建个人 Agent——GLMs——的移动应用访问. 最新模型为 GLM-4(0520)和 GLM-4-Air(0605)，在预训练和对齐上都有升级. GLM-4-Air 在更低的延迟和推理成本下实现了与 GLM-4(0116)相当的性能.</p>
<p>GLM-4 的评估在多种语言基准上进行. 这些评估评估了 GLM-4 的英文通用能力、中英文指令遵循、中文对齐、长上下文和 Agent 能力.</p>
<p>首先，在最常用的英文学术基准——MMLU、GSM8K、MATH、BBH、GPQA 和 HumanEval 上，GLM-4 0520 达到了与 GPT-4 0613(OpenAI, 2023)和 Gemini 1.5 Pro(Gemini Team, 2023)相近的性能. 例如，在 MMLU 上它得分 83.3，对比 GPT-4 的 86.4 和 Gemini 1.5 Pro 的 83.7. 其次，根据 IFEval(Zhou et al., 2023)，GLM-4 在中英文的 prompt 级和 instruction 级指令遵循能力大致与 GPT-4-Turbo 相当. 第三，在中文语言对齐方面，GLM-4 在 AlignBench(Liu et al., 2023)的八个维度上超越了 GPT-4 并匹配了 GPT-4-Turbo. 最后，对于长上下文任务，GLM-4(128K)模型在 LongBench-Chat(Bai et al., 2024)上匹配了 GPT-4 Turbo 和 Claude 3 Opus 的性能，即 87.3 对比 87.2 和 87.7.</p>
<blockquote>
<p>表 1: 三代开源 ChatGLM-6B 与 GLM-4-9B 的性能对比.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">语言</th>
<th align="left">数据集</th>
<th align="center">ChatGLM-6B (2023-03)</th>
<th align="center">ChatGLM2-6B (2023-06)</th>
<th align="center">ChatGLM3-6B-Base (2023-10)</th>
<th align="center">GLM-4-9B (2024-06)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">英文</td>
<td align="left">GSM8K</td>
<td align="center">1.5</td>
<td align="center">25.9</td>
<td align="center">72.3</td>
<td align="center">84.0</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">MATH</td>
<td align="center">3.1</td>
<td align="center">6.9</td>
<td align="center">25.7</td>
<td align="center">30.4</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">BBH</td>
<td align="center">0.0</td>
<td align="center">29.2</td>
<td align="center">66.1</td>
<td align="center">76.3</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">MMLU</td>
<td align="center">25.2</td>
<td align="center">45.2</td>
<td align="center">61.4</td>
<td align="center">74.7</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">GPQA</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">26.8</td>
<td align="center">34.3</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">HumanEval</td>
<td align="center">0.0</td>
<td align="center">9.8</td>
<td align="center">58.5</td>
<td align="center">70.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">BoolQ</td>
<td align="center">51.8</td>
<td align="center">79.0</td>
<td align="center">87.9</td>
<td align="center">89.6</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">CommonSenseQA</td>
<td align="center">20.5</td>
<td align="center">65.4</td>
<td align="center">86.5</td>
<td align="center">90.7</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">HellaSwag</td>
<td align="center">30.4</td>
<td align="center">57.0</td>
<td align="center">79.7</td>
<td align="center">82.6</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">PIQA</td>
<td align="center">65.7</td>
<td align="center">69.6</td>
<td align="center">80.1</td>
<td align="center">79.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">DROP</td>
<td align="center">3.9</td>
<td align="center">25.6</td>
<td align="center">70.9</td>
<td align="center">77.2</td>
</tr>
<tr>
<td align="left">中文</td>
<td align="left">C-Eval</td>
<td align="center">23.7</td>
<td align="center">51.7</td>
<td align="center">69.0</td>
<td align="center">77.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">CMMLU</td>
<td align="center">25.3</td>
<td align="center">50.0</td>
<td align="center">67.5</td>
<td align="center">75.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">GAOKAO-Bench</td>
<td align="center">26.8</td>
<td align="center">46.4</td>
<td align="center">67.3</td>
<td align="center">74.5</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">C3</td>
<td align="center">35.1</td>
<td align="center">58.6</td>
<td align="center">73.9</td>
<td align="center">77.2</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 1.</em></p>
<p>GLM-4 All Tools 模型专门对齐以更好地理解用户意图并自主选择最适合的工具完成任务. 例如，它可以通过网页浏览器以多轮方式访问在线信息，使用 Python 解释器解决数学问题，利用文本到图像模型生成图像，以及调用用户自定义函数. 图 2 展示了一个示例，显示 GLM-4 All Tools 使用网页浏览器和 Python 解释器处理用户查询「搜索 2000 年至 2023 年的全球人口，然后计算平均年增长率」. 我们的一手测试表明，它在常见任务上不仅匹配而且经常超越 GPT-4 All Tools 的能力.</p>
<blockquote>
<p>图 2: GLM-4 All Tools 的示例展示. 数据来源: 原文 Figure 2.</p>
</blockquote>
<p>在三代开源 ChatGLM-6B 模型之后，我们还开源发布了 GLM-4-9B(128K 和 1M 上下文长度)模型. GLM-4-9B 在约 10T 多语言语料上预训练，上下文长度为 8192(8K)，并使用与 GLM-4(0520)相同的流水线和对齐数据进行后训练. 在更少的训练计算下，它超越了 Llama-3-8B(Touvron et al., 2023)并支持 GLM-4 中 All Tools 的所有功能. 我们还提供了一个实验性模型 GLM-4-9B-Chat-1M，具有 100 万(1M)上下文长度(约 200 万中文字符). 表 1 展示了三代 ChatGLM-6B 模型和 GLM-4-9B 的性能，展示了 ChatGLM 随时间的逐步改进.</p>
<blockquote>
<p><strong>[数据实验]</strong> 三代 ChatGLM-6B 的跨越式提升</p>
<p>表 1 的数据非常直观地展示了 ChatGLM 的迭代速度. 从 ChatGLM-6B 到 ChatGLM3-6B-Base 的 7 个月内，MMLU 从 25.2% 提升到 61.4%，GSM8K 从 1.5% 提升到 72.3%——这不是简单的参数调整，而是整个预训练数据配方和对齐策略的重构. 特别值得注意的是 HumanEval 的跃升：从 0% 到 58.5%，说明第三代才真正具备了代码生成能力. 但一个需要审视的细节是：这些提升中有多少来自「数据质量」本身，多少来自「评测数据污染」? 例如，GSM8K 的数据格式相对固定，如果训练语料中包含了大量类似的数学应用题，提升幅度可能被高估. 不过，从 GLM-4-9B 在更少参数(9B vs ChatGLM3-6B 的 6B)上继续提升来看，智谱 AI 的数据策略确实在不断优化.</p>
</blockquote>
<p>图 3 总结了从 GLM-130B 到 GLM-4 All Tools 的主要改进和功能. 在整个旅程中，我们还为代码 LLM(CodeGeeX(Zheng et al., 2023))以及用于图像理解的视觉语言模型(CogVLM(Wang et al., 2023)和 CogAgent(Hong et al., 2023))和文本到图像生成(CogView(Ding et al., 2021, 2022; Zheng et al., 2024))的开源开发做出了贡献. 开源模型和数据可通过 <a href="https://github.com/THUDM">https://github.com/THUDM</a> 和 <a href="https://huggingface.co/THUDM">https://huggingface.co/THUDM</a> 访问.</p>
<blockquote>
<p>图 3: 从 GLM-130B 到 ChatGLM 到 ChatGLM2/3 到 GLM-4 All Tools 的主要改进和功能. 数据来源: 原文 Figure 3.</p>
</blockquote>
<hr>
<h2 id="2-chat-glm-js">2 ChatGLM 技术</h2>
<p>在本节中，我们介绍 ChatGLM 中采用和开发的预训练和后训练技术，包括模型架构、预训练数据、对齐和 All Tools. 我们有详细的技术报告介绍用于达到 GLM-4 的每项主要技术.</p>
<h3 id="2-1-yxlsj">2.1 预训练数据</h3>
<p>我们的预训练语料由多语言(主要为英文和中文)文档组成，来源包括网页、Wikipedia、书籍、代码和研究论文. 数据处理流水线主要包括三个阶段：去重、过滤和分词. 去重阶段通过精确去重和模糊去重去除重复或相似文档，提升数据多样性. 网页过滤阶段通过移除包含冒犯性语言、占位文本、源代码等的噪声文档来提升数据质量. 分词阶段将文本转换为 token 序列以进行进一步处理. 预训练数据中的 token 数量直接影响模型训练速度. 为优化这一点，我们采用字节级字节对编码(BPE)算法(Sennrich et al., 2016)分别学习中文和多语言 token，并将其与 tiktoken 中 cl100k_base 分词器的 token 合并为一个包含 150,000 个 token 的统一词表. 在最终训练集中，我们对不同来源重新加权以增加高质量和教育性来源(如书籍和 Wikipedia)的重要性. 为此，预训练语料由约 10 万亿(10T) token 组成.</p>
<p>在 ChatGLM 四代开发过程中，我们的发现与现有研究(Zhou et al., 2023)一致：数据质量和多样性对于构建有效的 LLM 至关重要. 尽管获得了经验性的教训和洞察，但迄今为止我们尚未确定一个能够指导数据收集、清洗和选择过程的根本性原则，这可能启发未来的研究方向.</p>
<blockquote>
<p><strong>[架构细节]</strong> 10T token 的数据规模在 2024 年处于什么水平?</p>
<p>2024 年，10T token 的预训练数据量在开源模型中属于顶级水平. 作为对比，Llama-2 使用 2T token，Llama-3 使用 15T token，Qwen2 使用 7T token. GLM-4 的 10T 数据量体现了智谱 AI 在数据工程上的大量投入. 值得注意的是，他们强调「重新加权不同来源」以增加高质量来源的比例——这与 Llama-3 的多层过滤策略类似，但 GLM-4 明确提到了对书籍和 Wikipedia 的上采样. 另一个关键细节是「统一词表 150K」：将中文 BPE 与 cl100k_base 合并，这对中英双语模型的 tokenization 效率至关重要. 如果中文使用独立的子词表，会导致同一概念的中英文表示不对齐，影响跨语言迁移.</p>
</blockquote>
<h3 id="2-2-jg">2.2 架构</h3>
<p>GLM 家族 LLM 建立在 Transformer(Vaswani et al., 2023)之上. 在 GLM-130B(Zeng et al., 2022)中，我们探索了各种选项来稳定预训练，同时考虑当时面临的硬件约束. 具体地，GLM-130B 利用 DeepNorm(Wang et al., 2022)作为层归一化策略，使用 Rotary Positional Encoding(RoPE)(Su et al., 2021)以及在 FFN 中使用带 GeLU(Hendrycks &amp; Gimpel, 2016)激活函数的 Gated Linear Unit(Shazeer, 2020). 在我们的探索过程中，我们研究了不同的策略来增强模型性能和推理效率. 近期的 GLM-4 模型采用了以下架构设计选择.</p>
<ul>
<li><strong>除 QKV 外无偏置</strong>: 为提高训练速度，我们移除了除注意力层 QKV 矩阵偏置外的所有偏置项. 在此过程中，我们观察到长度外推有轻微改善.</li>
<li><strong>RMSNorm 和 SwiGLU</strong>: 我们采用 RMSNorm 和 SwiGLU 分别替代 LayerNorm 和 ReLU. 这两种策略带来了更好的模型性能.</li>
<li><strong>旋转位置编码(RoPE)</strong>: 我们将 RoPE 扩展为二维形式以适应 GLM 中的二维位置编码.</li>
<li><strong>分组查询注意力(GQA)</strong>: 我们用 GQA 替代 MHA 以在推理时减少 KV cache 大小. 鉴于 GQA 比 MHA 使用更少的参数，我们增加了 FFN 参数数量以保持相同的模型大小，即将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{\\mathrm{ffn}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">ffn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 设置为隐藏维度的 10/3.</li>
</ul>
<blockquote>
<p><strong>[设计动机]</strong> 为什么 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><mn>10</mn><mi mathvariant="normal">/</mi><mn>3</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{\\mathrm{ffn}} = 10/3 \\times d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">ffn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10/3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>?</p>
<p>标准 Transformer 中 FFN 维度通常是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">4 \\times d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>，SwiGLU 由于门控机制通常设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi mathvariant="normal">/</mi><mn>3</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">8/3 \\times d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">8/3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>. GLM-4 进一步增加到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10</mn><mi mathvariant="normal">/</mi><mn>3</mn></mrow><annotation encoding="application/x-tex">10/3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10/3</span></span></span></span>，这是一个有趣的选择. 原因在于 GQA 减少了注意力头的数量(从而减少了参数)，为了保持总参数量不变，需要在 FFN 中补偿. 具体来说，如果 GQA 将 KV 头数从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mi mathvariant="normal">/</mi><mi>g</mi></mrow><annotation encoding="application/x-tex">h/g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">h</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 为分组数)，节省的参数约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">k</mi><mi mathvariant="normal">v</mi></mrow></msub><mo>×</mo><mi>h</mi><mo>×</mo><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mn>1</mn><mi mathvariant="normal">/</mi><mi>g</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">2 \\times d_{\\mathrm{hidden}} \\times d_{\\mathrm{kv}} \\times h \\times (1 - 1/g)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight" style="margin-right:0.0139em;">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mclose">)</span></span></span></span>. 将这些参数转移到 FFN 中，需要增加 FFN 的中间维度. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10</mn><mi mathvariant="normal">/</mi><mn>3</mn><mo>≈</mo><mn>3.33</mn></mrow><annotation encoding="application/x-tex">10/3 \\approx 3.33</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10/3</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3.33</span></span></span></span> 比 SwiGLU 标准的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi mathvariant="normal">/</mi><mn>3</mn><mo>≈</mo><mn>2.67</mn></mrow><annotation encoding="application/x-tex">8/3 \\approx 2.67</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">8/3</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2.67</span></span></span></span> 大了约 25%，这意味着每个 token 的前向计算中 FFN 部分的计算量增加了 25%. 这是「参数量不变 → 计算量增加」的权衡，因为 GQA 节省的是内存带宽(更少的 KV cache 读写)，而非计算.</p>
</blockquote>
<p>我们模型的上下文长度从 2K(ChatGLM)扩展到 32K(ChatGLM2 和 ChatGLM3)，再到 128K 和 1M(GLM-4). 这些扩展不仅通过上下文扩展——位置编码扩展(Press et al., 2022; Chen et al., 2023)和长文本上的持续训练(Xiong et al., 2023)——实现，还通过长上下文对齐实现，使 GLM-4 能够有效处理非常长的上下文(详见 Bai et al. (2024)的技术细节).</p>
<h3 id="2-3-dq">2.3 对齐</h3>
<p>预训练构建了 LLM 的基础，而后训练(Ouyang et al., 2022)进一步精炼这些模型以使其与人类偏好对齐，例如理解人类意图、遵循指令和促进多轮对话. 对于 GLM-4，对齐主要通过监督微调(SFT)和人类反馈强化学习(RLHF)(Hou et al., 2024)实现. 在 SFT 中，我们发现真实的人类提示和交互而非基于模板或模型生成的响应对对齐质量至关重要. 虽然 SFT 在很大程度上将基座模型与人类偏好对齐，但 RLHF 可以进一步帮助缓解响应拒答、安全性、双语 token 混合生成和多轮连贯性等问题.</p>
<p>对于我们第一代模型(ChatGLM-6B 和 ChatGLM-130B)，prompt-response 对主要由模型开发者标注. 对于后续模型，对齐数据是内部标注和从第三方获取的专有数据的组合，受严格的质量控制措施约束. 与现有实践类似(Touvron et al., 2023)，标注员被要求从多个维度对模型响应进行评分，包括安全性、事实性、相关性、有用性和人类偏好.</p>
<h3 id="2-4-chat-glm-xljs">2.4 ChatGLM 系列技术</h3>
<p>在 ChatGLM 的开发过程中，我们引入并将发布用于增强其性能的技术.</p>
<ul>
<li><strong>LLM 的涌现能力(Du et al., 2024)</strong>: 我们检查了预训练损失与下游任务性能之间的关系，发现对于相同的预训练损失，不同模型大小和训练 token 的 LLM 产生相同的下游性能. 我们还发现在某些任务(如 MMLU 和 GSM8K)上，性能仅在预训练损失低于某个阈值时才超越随机水平. 因此，我们将涌现能力重新定义为具有较低预训练损失的模型所展现的能力.</li>
<li><strong>LongAlign(Bai et al., 2024)</strong>: 为扩展 LLM 的上下文窗口大小，我们提出了 LongAlign——一种全面的长上下文对齐方案. 它使 GLM-4 能够处理长达 128K token 的长上下文文本，性能与 Claude 2 和 GPT-4 Turbo(1106)相当.</li>
<li><strong>ChatGLM-Math(Xu et al., 2024)</strong>: 为提升 LLM 的数学问题求解能力，我们引入了 ChatGLM-Math，利用自我批判而非外部模型或人工标注进行数据选择.</li>
<li><strong>ChatGLM-RLHF(Hou et al., 2024)</strong>: 为将 LLM 与人类反馈对齐，我们引入了 ChatGLM-RLHF——我们将 PPO 和 DPO 应用于 LLM 的实践.</li>
<li><strong>Self-Contrast(Liu et al., 2024)</strong>: 为避免昂贵的人类偏好反馈数据需求，我们开发了一种无反馈对齐策略 Self-Contrast. 它利用目标 LLM 自我生成大量负样本用于其 RLHF 对齐.</li>
<li><strong>AgentTuning(Zeng et al., 2023)</strong>: 为提升 LLM 的 Agent 能力，我们开发了 AgentTuning 框架，包含 AgentInstruct 指令微调数据集，涵盖 Agent 与环境之间的高质量交互轨迹.</li>
<li><strong>APAR(Liu et al., 2024)</strong>: 为提升 LLM 对具有层次结构响应的推理速度，我们提出了一种自动并行自回归(APAR)生成方法. 它利用指令微调训练 LLM 规划其(并行)生成过程并执行 APAR 生成.</li>
<li><strong>评测基准</strong>: 我们还开发了多个开源 LLM 评测基准，包括 AgentBench(Liu et al., 2023)用于评估 LLM 作为 Agent 的能力，LongBench(Bai et al., 2023)用于评估 LLM 的长上下文处理能力，AlignBench(Bai et al., 2024)用于衡量 ChatGLM 与中文内容的对齐质量，HumanEval-X(Zheng et al., 2023)用于评估 Python 之外编程语言的 HumanEval 问题，以及 NaturalCodeBench(NCB)用于衡量模型解决实际编程任务的能力.</li>
</ul>
<h3 id="2-5-glm-4-all-tools">2.5 GLM-4 All Tools</h3>
<p>最新的 ChatGLM 模型是 GLM-4 和 GLM-4 All Tools，两者都使用上述技术进行训练和对齐. GLM-4 All Tools 是进一步对齐以支持智能 Agent 和相关任务的模型版本. 它被训练为自主理解用户意图、逐步规划复杂指令，并调用一个或多个工具(如网页浏览器、Python 解释器和文本到图像模型)来完成复杂任务. 图 4 展示了 GLM-4 All Tools 系统的整体流水线. 当用户发出复杂请求时，模型分析任务并一步步规划问题解决过程. 如果它确定无法独立完成任务，将依次调用一个或多个外部工具，利用其中间反馈和结果来帮助解决任务.</p>
<blockquote>
<p>图 4: GLM-4 All Tools 和自定义 GLMs(Agents)的整体流水线. 数据来源: 原文 Figure 4.</p>
</blockquote>
<p>基于 GLM-4 的 all-tools 能力，我们还开发了 GLMs 应用平台，允许用户为特定任务创建和定制自己的 Agent. GLMs 不仅支持嵌入式 Python 解释器、网页浏览器、文本到图像模型，还支持用户自定义函数、API 和外部知识库，以更有效地满足用户需求.</p>
<blockquote>
<p>表 2: GLM-4 All Tools 性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">工具</th>
<th align="left">任务</th>
<th align="center">GLM-4 All Tools (Web, 0116)</th>
<th align="center">GPT-4 (Web, 0110)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Python 解释器</td>
<td align="left">GSM8K</td>
<td align="center">91.59</td>
<td align="center">92.72</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">MATH</td>
<td align="center">63.60</td>
<td align="center">65.00</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Math23K</td>
<td align="center">88.50</td>
<td align="center">88.40</td>
</tr>
<tr>
<td align="left">浏览器</td>
<td align="left">信息检索</td>
<td align="center">78.08</td>
<td align="center">67.12</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 2.</em></p>
<hr>
<h2 id="3-glm-4-nlpg">3 GLM-4 能力评估</h2>
<p>我们从多个视角审视 GLM-4 模型的能力，包括学术基准上的基座能力、代码问题求解、英文 Agent 能力、中英文指令遵循、长上下文以及中文对齐. 如前所述，GLM-4 主要在中文和英文上预训练并主要对中文对齐. 在本节中，我们主要报告最新 GLM-4 版本的结果，即 GLM-4(0520)和 GLM-4-Air(0605)，因为 GLM-4(0520)在评估基准上略优于其原始 0116 版本. 在评估期间，GLM-4 和 GLM-4-Air 均以 BFloat16 精度部署.</p>
<p>对于基线，我们展示了 GPT-4(0603)、GPT-4 Turbo(1106, 2024-04-09)、Claude 2、Claude 3 Opus 和 Gemini 1.5 Pro 的结果，均从对应的技术报告中提取或通过其公共 API 测试获得.</p>
<p>总体而言，GLM-4 在标准基准、指令遵循、长上下文、代码问题求解和英文 Agent 能力上接近最先进的模型(GPT-4-Turbo、Gemini 1.5 Pro 和 Claude 3 Opus). 在中文对齐方面，它在基础语言能力、高级中文理解、专业知识和开放式问答等多个领域对 SOTA 模型展现出强劲性能. 总结来说，GLM-4 在中文语言任务方面处于最佳水平. 它还在中文数学和逻辑推理能力方面展现出与 GPT-4 和 Claude 3 Opus 相当的性能，尽管落后于 GPT-4 Turbo.</p>
<h3 id="3-1-xsjzpg">3.1 学术基准评估</h3>
<p>为评估基座模型的通用性能，我们选择六个常用基准，涵盖知识、数学、推理、常识和代码：</p>
<ul>
<li>MMLU(Hendrycks et al., 2021): 从各种考试(包括数学、历史、计算机科学等)收集的多选题. 我们向模型呈现所有答案并要求其选择答案的字母.</li>
<li>GSM8K(GSM8k): 8500 道小学数学应用题(测试集 1000 道)，要求模型使用数学概念解决现实情境问题. 我们对此基准使用思维链提示(Wei et al., 2022).</li>
<li>MATH: 12500 道具有挑战性的竞赛级数学问题(测试集 5000 道). 我们对此基准使用思维链提示(Wei et al., 2022).</li>
<li>BBH(BBH): 23 个具有挑战性的 BIG-Bench(BigBench)任务套件. 我们对此基准使用思维链提示(Wei et al., 2022).</li>
<li>GPQA(GPQA): 生物学、化学和物理学的研究生级别多选题基准.</li>
<li>HumanEval(Humaneval): 一个代码基准，通过自动测试用例检查来衡量合成函数的正确性.</li>
</ul>
<p>我们将 GLM-4 的性能与原始 GPT-4(OpenAI, 2023)进行比较. 结果如表 3 所示.</p>
<blockquote>
<p>表 3: GLM-4 在学术基准上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">MMLU</th>
<th align="center">GSM8K</th>
<th align="center">MATH</th>
<th align="center">BBH</th>
<th align="center">GPQA</th>
<th align="center">HumanEval</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0314)</td>
<td align="center">86.4</td>
<td align="center">92.0</td>
<td align="center">52.9</td>
<td align="center">83.1</td>
<td align="center">35.7</td>
<td align="center">67.0</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">84.7</td>
<td align="center">95.7</td>
<td align="center">64.3</td>
<td align="center">88.3</td>
<td align="center">42.5</td>
<td align="center">83.7</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">86.7</td>
<td align="center">95.6</td>
<td align="center">73.4</td>
<td align="center">88.2</td>
<td align="center">49.3</td>
<td align="center">88.2</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">86.8</td>
<td align="center">95.0</td>
<td align="center">60.1</td>
<td align="center">86.8</td>
<td align="center">50.4</td>
<td align="center">84.9</td>
</tr>
<tr>
<td align="left">Gemini 1.5 Pro</td>
<td align="center">85.9</td>
<td align="center">90.8</td>
<td align="center">67.7</td>
<td align="center">89.2</td>
<td align="center">46.2</td>
<td align="center">84.1</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">72.4</td>
<td align="center">79.6</td>
<td align="center">50.6</td>
<td align="center">76.3</td>
<td align="center">28.8</td>
<td align="center">71.8</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">81.9</td>
<td align="center">90.9</td>
<td align="center">57.9</td>
<td align="center">80.4</td>
<td align="center">38.4</td>
<td align="center">75.7</td>
</tr>
<tr>
<td align="left">GLM-4 (0116)</td>
<td align="center">81.5</td>
<td align="center">87.6</td>
<td align="center">47.9</td>
<td align="center">82.3</td>
<td align="center">35.7</td>
<td align="center">72.0</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">83.3</td>
<td align="center">93.3</td>
<td align="center">61.3</td>
<td align="center">84.7</td>
<td align="center">39.9</td>
<td align="center">78.5</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 3.</em></p>
<p>我们可以观察到 GLM-4 在 MMLU 上达到 GPT-4 准确率的 96.3%，在其他基准上超越 GPT-4. 总体而言，GLM-4 的基座能力接近 GPT-4-Turbo 和 Claude 3 Opus.</p>
<blockquote>
<p><strong>[数据实验]</strong> GLM-4(0520) 与 GPT-4 Turbo 的差距分析</p>
<p>表 3 中最值得关注的是 GLM-4(0520)与 GPT-4 Turbo(2024-04-09)的差距. MMLU 上 83.3 vs 86.7(差距 3.4%)，HumanEval 上 78.5 vs 88.2(差距 9.7%)，GPQA 上 39.9 vs 49.3(差距 9.4%). 这些差距集中在「知识密集型」和「代码密集型」任务上. 论文在第 3.3 节也承认数学是当前的主要差距. 从工程角度看，这些差距可能源于几个因素：1) GPT-4 Turbo 的训练数据截止日期更晚，可能包含了更多高质量代码和学术内容; 2) GPT-4 的模型规模可能更大( rumored 为 8x220B MoE 或类似的架构); 3) OpenAI 在 RLHF 和数据质量上的投入可能更大. 但 GLM-4 在 GSM8K 上达到了 93.3%，与 GPT-4 Turbo 的 95.6% 差距不大，说明基础数学能力是扎实的.</p>
</blockquote>
<h3 id="3-2-zlzxpg">3.2 指令遵循评估</h3>
<p>我们使用最近引入的 IFEval 数据集(Zhou et al., 2023)评估 GLM-4 遵循指令的能力. 该数据集包含 541 个 prompt，源自 25 个可通过显式标准验证的不同指令(例如，「以 P.S. I do like the cake 结束你的邮件」可通过字符串匹配验证). 我们遵循 Zhou et al. (2023)的方法计算英文和中文的 prompt 级和 instruction 级准确率，分别使用严格模式(strict mode)和宽松模式(loose mode). 为进一步评估模型在中文上遵循指令的性能，我们将原始 prompt 翻译为中文，省略在中文中不适用的指令(如大写)，并调整评分脚本以适应中文数据.</p>
<blockquote>
<p>表 4: GLM-4 在 IFEval 上的性能. <code>L</code> 代表 <code>Loose</code>，<code>S</code> 代表 <code>Strict</code>，<code>P</code> 代表 <code>Prompt</code>，<code>I</code> 代表 <code>Instruction</code>.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">L-P(英)</th>
<th align="center">S-P(英)</th>
<th align="center">L-I(英)</th>
<th align="center">S-I(英)</th>
<th align="center">L-P(中)</th>
<th align="center">S-P(中)</th>
<th align="center">L-I(中)</th>
<th align="center">S-I(中)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0613)</td>
<td align="center">79.5</td>
<td align="center">77.1</td>
<td align="center">85.5</td>
<td align="center">83.7</td>
<td align="center">72.4</td>
<td align="center">68.9</td>
<td align="center">80.0</td>
<td align="center">75.7</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">79.1</td>
<td align="center">75.4</td>
<td align="center">85.1</td>
<td align="center">82.4</td>
<td align="center">74.3</td>
<td align="center">69.1</td>
<td align="center">80.8</td>
<td align="center">76.5</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">84.5</td>
<td align="center">81.2</td>
<td align="center">88.7</td>
<td align="center">85.9</td>
<td align="center">79.3</td>
<td align="center">72.6</td>
<td align="center">84.2</td>
<td align="center">79.1</td>
</tr>
<tr>
<td align="left">Claude 2</td>
<td align="center">75.0</td>
<td align="center">58.0</td>
<td align="center">81.7</td>
<td align="center">67.7</td>
<td align="center">57.1</td>
<td align="center">46.5</td>
<td align="center">64.9</td>
<td align="center">55.1</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">90.6</td>
<td align="center">85.5</td>
<td align="center">93.7</td>
<td align="center">90.0</td>
<td align="center">78.3</td>
<td align="center">73.3</td>
<td align="center">84.3</td>
<td align="center">80.4</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">73.0</td>
<td align="center">69.0</td>
<td align="center">80.3</td>
<td align="center">77.2</td>
<td align="center">73.0</td>
<td align="center">69.0</td>
<td align="center">80.3</td>
<td align="center">77.2</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">80.4</td>
<td align="center">75.2</td>
<td align="center">86.1</td>
<td align="center">82.3</td>
<td align="center">79.3</td>
<td align="center">71.2</td>
<td align="center">84.0</td>
<td align="center">77.3</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">83.7</td>
<td align="center">79.1</td>
<td align="center">88.7</td>
<td align="center">85.0</td>
<td align="center">79.7</td>
<td align="center">71.9</td>
<td align="center">84.2</td>
<td align="center">78.0</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 4.</em></p>
<p>在宽松模式下，GLM-4 在英文和中文上均匹配 GPT-4 Turbo 的 instruction 级准确率. 在严格模式下，GLM-4 在英文和中文上分别达到 GPT-4 Turbo(2024-04-09) instruction 级准确率的 99.0% 和 98.6%.</p>
<h3 id="3-3-dqpg">3.3 对齐评估</h3>
<p>AlignBench(Liu et al., 2023)提供了一种自动的 LLM-as-Judge 方法来基准测试中文语境下 LLM 的对齐质量. 它包含 683 个查询，涵盖 8 个不同类别，并使用基于 GPT-4 的多维规则校准逐点参考评分方法评估模型响应. 我们在 AlignBench-v1.1 上评估，该版本更仔细地改进了参考生成质量，特别是通过补充带有 URL 的网页人工收集证据来回答占总查询 66.5% 的知识相关问题. 在此版本上，几乎所有 LLM 的得分都比之前的 AlignBench 更低.</p>
<blockquote>
<p>表 5: GLM-4 在 AlignBench 上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">数学</th>
<th align="center">逻辑</th>
<th align="center">语言</th>
<th align="center">中文</th>
<th align="center">QA</th>
<th align="center">写作</th>
<th align="center">角色扮演</th>
<th align="center">专业</th>
<th align="center">总体</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0613)</td>
<td align="center">7.54</td>
<td align="center">7.17</td>
<td align="center">7.82</td>
<td align="center">7.02</td>
<td align="center">7.39</td>
<td align="center">7.67</td>
<td align="center">8.20</td>
<td align="center">7.29</td>
<td align="center">7.46</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">7.85</td>
<td align="center">7.66</td>
<td align="center">7.90</td>
<td align="center">7.22</td>
<td align="center">8.24</td>
<td align="center">8.53</td>
<td align="center">8.46</td>
<td align="center">7.95</td>
<td align="center">7.90</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">8.32</td>
<td align="center">7.67</td>
<td align="center">7.60</td>
<td align="center">7.57</td>
<td align="center">8.37</td>
<td align="center">7.75</td>
<td align="center">8.18</td>
<td align="center">8.59</td>
<td align="center">8.00</td>
</tr>
<tr>
<td align="left">Claude 2</td>
<td align="center">6.39</td>
<td align="center">5.85</td>
<td align="center">6.75</td>
<td align="center">5.72</td>
<td align="center">6.68</td>
<td align="center">5.87</td>
<td align="center">6.86</td>
<td align="center">6.56</td>
<td align="center">6.26</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">7.27</td>
<td align="center">7.11</td>
<td align="center">7.94</td>
<td align="center">7.71</td>
<td align="center">8.21</td>
<td align="center">7.61</td>
<td align="center">7.73</td>
<td align="center">8.02</td>
<td align="center">7.53</td>
</tr>
<tr>
<td align="left">Gemini 1.5 Pro</td>
<td align="center">7.07</td>
<td align="center">7.77</td>
<td align="center">7.31</td>
<td align="center">7.22</td>
<td align="center">8.55</td>
<td align="center">7.83</td>
<td align="center">7.79</td>
<td align="center">8.52</td>
<td align="center">7.47</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">7.00</td>
<td align="center">6.01</td>
<td align="center">6.69</td>
<td align="center">7.26</td>
<td align="center">7.97</td>
<td align="center">7.59</td>
<td align="center">8.10</td>
<td align="center">7.52</td>
<td align="center">7.01</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">7.69</td>
<td align="center">6.95</td>
<td align="center">7.53</td>
<td align="center">8.00</td>
<td align="center">7.90</td>
<td align="center">8.01</td>
<td align="center">8.35</td>
<td align="center">8.09</td>
<td align="center">7.65</td>
</tr>
<tr>
<td align="left">GLM-4 (0116)</td>
<td align="center">7.20</td>
<td align="center">7.20</td>
<td align="center">7.60</td>
<td align="center">8.19</td>
<td align="center">8.45</td>
<td align="center">7.88</td>
<td align="center">8.05</td>
<td align="center">8.56</td>
<td align="center">7.66</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">7.89</td>
<td align="center">7.95</td>
<td align="center">8.00</td>
<td align="center">7.86</td>
<td align="center">8.11</td>
<td align="center">8.04</td>
<td align="center">8.06</td>
<td align="center">8.47</td>
<td align="center">8.00</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 5.</em></p>
<p>结果如表 5 所示. GLM-4 总体上超越 GPT-4 Turbo、Claude 3 Opus 和 Gemini 1.5 Pro，在基线中取得最高总体得分. 尤其在中文逻辑推理和语言理解任务上，GLM-4 显著超越所有其他强大模型. 这些结果展示了其对中文语言和知识的强掌握.</p>
<p>GLM-4 与 GPT-4 Turbo(2024-04-09)之间的当前性能差距主要在数学维度. 我们一直在采用 ChatGLM-Math(Xu et al., 2024)中介绍的技术(如自我批判)来持续提升 GLM 模型的数学推理能力.</p>
<blockquote>
<p><strong>[局限风险]</strong> AlignBench 的评测方法论局限</p>
<p>需要谨慎看待 AlignBench 的结果. 首先，AlignBench 使用 GPT-4 作为评判器(judge)，这意味着如果 GPT-4 本身对中文的理解有偏差，评分就会系统性地偏向 GPT-4 风格的回答. GLM-4 在「中文」维度上得分 7.86，高于 GPT-4 Turbo 的 7.57，但在「数学」维度上 7.89 vs 8.32 有明显差距. 其次，AlignBench-v1.1 引入了网页证据补充，这实际上增加了评测的复杂度：模型不仅需要回答问题，还需要与提供的参考证据对齐. 如果 GLM-4 的训练数据中包含了更多中文百科和问答内容，它在这种评测中自然会有优势. 最后，8 分制的评分标准使得 0.1-0.2 分的差距在统计上是否显著并不清楚，论文未提供置信区间或多次评测的方差.</p>
</blockquote>
<h3 id="3-4-csxwclnlpg">3.4 长上下文处理能力评估</h3>
<p>为评估 GLM-4 在长文本任务上的性能，我们在 LongBench-Chat(Bai et al., 2024)上进行评估，这是一个上下文长度从 10K 到 100K 的基准集，涵盖用户频繁使用的广泛长文本场景，如文档问答、摘要和代码. 为提供更详细的对照，我们还将 LongBench-Chat 按语言分隔，得到中文和英文两个部分. 因此，我们分别报告两个部分的结果，提供 GLM-4 跨语言能力的细粒度概览.</p>
<p>关于具体评估设置，我们基于 GPT-4 对每个模型的输出进行评分，在 LongBench-Chat 中采用 few-shot 策略. 此外，鉴于我们的目标是最小化分数变化并获得更可靠的统计结论，我们重复评估多次. 随后，我们在表 6 中报告这些多次评估的平均值，以确保最终性能指标反映 GLM-4 在多样条件下的全面表现. 结果明确表明，GLM-4 在英文 prompt 上的性能与 GPT-4 Turbo 和 Claude 3 Opus 对齐，在中文 prompt 上超越了它们中的最佳者.</p>
<blockquote>
<p>表 6: GLM-4 在 LongBench-Chat 上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">英文</th>
<th align="center">中文</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">87.2</td>
<td align="center">71.4</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">85.0</td>
<td align="center">82.1</td>
</tr>
<tr>
<td align="left">Claude 2</td>
<td align="center">81.3</td>
<td align="center">76.2</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">87.7</td>
<td align="center">82.7</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">76.8</td>
<td align="center">79.0</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">82.4</td>
<td align="center">81.0</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">87.3</td>
<td align="center">84.0</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 6.</em></p>
<h3 id="3-5-zsyhtsxddmnlpg">3.5 真实用户提示下的代码能力评估</h3>
<p>虽然 HumanEval(Humaneval)已被广泛采用于评估 LLM 的代码生成，但其大多数问题涉及入门算法. 然而，在实践中，用户提出复杂问题来完成日常工作，其难度通常远超 HumanEval 的范围. 此外，先前工作报告了 HumanEval 训练数据污染(OpenAI, 2023; Li et al., 2023; Yang et al., 2023)，使得 HumanEval 上的结果相对不那么可信.</p>
<p>因此，除 HumanEval 外，我们还在 NaturalCodeBench(NCB)(Zhang et al., 2024)上评估 GLM-4，这是一个具有挑战性的双语代码基准，源自真实用户提示，以反映真实世界编码任务的复杂性.</p>
<blockquote>
<p>表 7: GLM-4 在 NaturalCodeBench(NCB)上的性能，该基准包含两种编程语言(Python 和 Java)的英文和中文真实编码 prompt.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">Python(en)</th>
<th align="center">Java(en)</th>
<th align="center">Python(zh)</th>
<th align="center">Java(zh)</th>
<th align="center">总体</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0613)</td>
<td align="center">55.7</td>
<td align="center">51.1</td>
<td align="center">53.4</td>
<td align="center">51.1</td>
<td align="center">52.8</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">51.9</td>
<td align="center">55.0</td>
<td align="center">47.3</td>
<td align="center">51.9</td>
<td align="center">51.5</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">57.5</td>
<td align="center">52.3</td>
<td align="center">53.1</td>
<td align="center">52.3</td>
<td align="center">53.8</td>
</tr>
<tr>
<td align="left">Claude 2</td>
<td align="center">34.4</td>
<td align="center">36.6</td>
<td align="center">33.6</td>
<td align="center">32.8</td>
<td align="center">34.4</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">48.9</td>
<td align="center">48.9</td>
<td align="center">45.0</td>
<td align="center">50.4</td>
<td align="center">48.3</td>
</tr>
<tr>
<td align="left">Gemini 1.5 Pro</td>
<td align="center">45.0</td>
<td align="center">39.7</td>
<td align="center">41.5</td>
<td align="center">43.1</td>
<td align="center">42.3</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">33.9</td>
<td align="center">29.8</td>
<td align="center">30.8</td>
<td align="center">34.4</td>
<td align="center">32.2</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">40.8</td>
<td align="center">39.7</td>
<td align="center">43.1</td>
<td align="center">39.7</td>
<td align="center">40.8</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">51.6</td>
<td align="center">42.8</td>
<td align="center">45.4</td>
<td align="center">48.9</td>
<td align="center">47.1</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 7.</em></p>
<p>如表 7 所示，GLM-4 在实际场景中的编码性能接近 Claude 3 Opus. 虽然与 GPT-4 模型仍有一些差距，但考虑到 GLM-4 的双语平衡特性，通过更好的训练策略和数据策划，在后续迭代中有相当大的潜力提升其在 NCB 上的性能.</p>
<blockquote>
<p><strong>[数据实验]</strong> NCB 作为「真实世界代码基准」的价值</p>
<p>NCB 的关键价值在于它来自「真实用户提示」——这与 HumanEval 的「面试题」风格截然不同. 从表 7 可以看到一个有趣的现象：GPT-4 Turbo(2024-04-09)在 NCB 上的总体得分 53.8% 并不高于 GPT-4(0613)的 52.8%，而 Claude 3 Opus 的 48.3% 甚至低于 GPT-4(0613). 这与 HumanEval 上 GPT-4 Turbo 大幅领先的格局完全不同. 这说明：1) 真实世界编码任务的难度分布与面试题不同; 2) 模型在「刷题」上的优势不一定迁移到实际工作场景. GLM-4 的 47.1% 与 Claude 3 Opus 的 48.3% 非常接近，但在 Java(zh)上 48.9% 甚至超越了 Claude 3 Opus 的 50.4%——等等，这不对，48.9 &lt; 50.4. 重新看：GLM-4 在 Java(zh)上是 48.9，Claude 3 Opus 是 50.4，差距 1.5%. 但在 Python(en)上 51.6 vs 48.9，GLM-4 超越了 Claude 3 Opus. 总体而言，GLM-4 在代码能力上处于「接近顶级但非顶级」的水平，这与它的定位一致——一个主要面向中文场景的通用模型，而非专门的代码模型.</p>
</blockquote>
<h3 id="3-6-function-call-pg">3.6 Function Call 评估</h3>
<p>为评估 GLM 模型在函数调用上的性能，我们在 Berkeley Function Call Leaderboard 上进行评估，这是一个包含 2K question-function-answer 对的基准. 该基准通过三个类别评估模型的函数调用能力：通过抽象语法树(AST)评估、通过执行 API 评估和相关性检测. 第一个类别将模型输出的函数与函数文档和可能答案进行 AST 分析对比. 第二个类别通过执行生成的函数调用来检查响应正确性. 相关性检测评估模型识别不适合回答用户问题的函数的能力.</p>
<blockquote>
<p>表 8: GLM 在 Berkeley Function Call Leaderboard 上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">AST Summary</th>
<th align="center">Exec Summary</th>
<th align="center">Relevance</th>
<th align="center">Overall</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Llama-3-8B-Instruct</td>
<td align="center">59.25</td>
<td align="center">70.01</td>
<td align="center">45.83</td>
<td align="center">58.88</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">82.14</td>
<td align="center">78.61</td>
<td align="center">88.75</td>
<td align="center">81.24</td>
</tr>
<tr>
<td align="left">GPT-4o (2024-05-13)</td>
<td align="center">85.23</td>
<td align="center">80.37</td>
<td align="center">81.25</td>
<td align="center">82.94</td>
</tr>
<tr>
<td align="left">ChatGLM3-6B</td>
<td align="center">62.18</td>
<td align="center">69.78</td>
<td align="center">5.42</td>
<td align="center">57.88</td>
</tr>
<tr>
<td align="left">GLM-4-9B-Chat</td>
<td align="center">80.26</td>
<td align="center">84.40</td>
<td align="center">87.92</td>
<td align="center">81.00</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">84.34</td>
<td align="center">85.93</td>
<td align="center">68.33</td>
<td align="center">80.94</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">82.59</td>
<td align="center">87.78</td>
<td align="center">84.17</td>
<td align="center">81.76</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 8.</em></p>
<p>结果如表 8 所示. 我们可以观察到 GLM-4(0520)的函数调用能力与 GPT-4 Turbo(2024-04-09)对齐，而 GLM-4-9B-Chat 显著超越 Llama-3-8B-Instruct. 另一个观察是，总体准确率并不随模型大小提升，而 GLM-4-9B-Chat 甚至可以超越 GLM-4-Air. 另一方面，我们观察到在执行摘要(评估真实世界 API 的执行结果)上的性能随模型大小平稳提升.</p>
<h3 id="3-7-agent-nlpg">3.7 Agent 能力评估</h3>
<p>广泛观察到 LLM 能够在多样化环境和上下文中充当智能 Agent(Park et al., 2023; Yao et al., 2022)，被称为 LLM-as-Agent(Liu et al., 2023). 因此，我们在 AgentBench(Liu et al., 2023)上评估 GLM-4 与其他对比 LLM，这是一个面向文本 LLM 的全面 Agent 基准，涵盖一系列实际环境，包括基于代码、基于游戏和基于网页的上下文. 具体地，我们在 8 个 AgentBench 环境中的 7 个进行评估，除了 Digital Card Game(交互过于耗时). 总体得分使用 AgentBench(Liu et al., 2023)提供的原始逐数据集权重计算.</p>
<blockquote>
<p>表 9: GLM-4 在 AgentBench 上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">OS</th>
<th align="center">DB</th>
<th align="center">KG</th>
<th align="center">LTP</th>
<th align="center">HH</th>
<th align="center">WS</th>
<th align="center">WB</th>
<th align="center">总体</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0613)</td>
<td align="center">42.4</td>
<td align="center">32.0</td>
<td align="center">58.8</td>
<td align="center">16.6</td>
<td align="center">78.0</td>
<td align="center">61.1</td>
<td align="center">29.0</td>
<td align="center">3.69</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">40.3</td>
<td align="center">52.7</td>
<td align="center">54.0</td>
<td align="center">17.7</td>
<td align="center">70.0</td>
<td align="center">52.8</td>
<td align="center">30.0</td>
<td align="center">3.77</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">41.0</td>
<td align="center">46.7</td>
<td align="center">53.2</td>
<td align="center">19.4</td>
<td align="center">72.0</td>
<td align="center">55.1</td>
<td align="center">19.0</td>
<td align="center">3.68</td>
</tr>
<tr>
<td align="left">Claude 2</td>
<td align="center">18.1</td>
<td align="center">27.3</td>
<td align="center">41.3</td>
<td align="center">8.4</td>
<td align="center">54.0</td>
<td align="center">61.4</td>
<td align="center">0.0</td>
<td align="center">2.03</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">23.6</td>
<td align="center">55.0</td>
<td align="center">53.4</td>
<td align="center">20.0</td>
<td align="center">70.0</td>
<td align="center">48.5</td>
<td align="center">28.0</td>
<td align="center">3.62</td>
</tr>
<tr>
<td align="left">GLM-4-Air (0605)</td>
<td align="center">31.9</td>
<td align="center">51.0</td>
<td align="center">53.8</td>
<td align="center">12.3</td>
<td align="center">78.0</td>
<td align="center">69.2</td>
<td align="center">30.0</td>
<td align="center">3.58</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">36.8</td>
<td align="center">52.7</td>
<td align="center">51.4</td>
<td align="center">15.3</td>
<td align="center">82.0</td>
<td align="center">68.3</td>
<td align="center">29.0</td>
<td align="center">3.79</td>
</tr>
</tbody></table>
<p><em>注: OS=Operating System, DB=DataBase, KG=Knowledge Graph, LTP=Lateral Thinking Puzzles, HH=House Holding, WS=Web Shopping, WB=Web Browsing. 数据来源: 原文 Table 9.</em></p>
<p>结果如表 9 所示. GLM-4 模型在 Agent 任务上展现了相当令人印象深刻的性能，GLM-4-Air 达到可比水平，GLM-4 超越 GPT-4 Turbo 和 Claude 3 Opus. 在具体环境方面，我们发现 GLM-4 系列在 Database、House-Holding 和 Web Shopping 任务上表现尤其出色，而在 Operating System、Knowledge Graph 和 Lateral Thinking Puzzles 上仍与 GPT-4 系列存在差距. 该差距表明 GLM-4 在代码相关 Agent 任务和高交互性语言任务上仍有提升空间.</p>
<h3 id="3-8-all-tools-pg">3.8 All Tools 评估</h3>
<p>GLM-4 进一步对齐以支持 <a href="https://chatglm.cn">https://chatglm.cn</a> 上的智能 Agent 和用户配置的 GLMs 功能， resultant 模型为 GLM-4 All Tools. 如前所述，GLM-4 All Tools 可以通过自主理解用户意图、逐步规划指令并调用多个工具(包括网页浏览器、Python 解释器和文本到图像模型(如 CogView3(Zheng et al., 2024)))来完成复杂任务. 表 2 显示 GLM-4 All Tools(Web)在 Python 解释器解决数学问题和浏览器信息检索方面分别达到了与 ChatGPT-4(Web)相当的性能.</p>
<hr>
<h2 id="4-aqyfx">4 安全与风险</h2>
<p>我们致力于确保 GLM-4 作为一个安全、负责任且无偏见的模型运行. 除解决常见的伦理和公平性问题外，我们仔细评估并减轻模型在现实场景中可能对用户造成的潜在伤害.</p>
<blockquote>
<p>表 10: GLM-4 在 SafetyBench 上的性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">伦理与道德</th>
<th align="center">非法活动</th>
<th align="center">心理健康</th>
<th align="center">冒犯性</th>
<th align="center">身体健康</th>
<th align="center">隐私与财产</th>
<th align="center">不公平与偏见</th>
<th align="center">总体</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4 (0613)</td>
<td align="center">92.7</td>
<td align="center">93.3</td>
<td align="center">93.0</td>
<td align="center">87.7</td>
<td align="center">96.7</td>
<td align="center">91.3</td>
<td align="center">73.3</td>
<td align="center">89.7</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (1106)</td>
<td align="center">91.0</td>
<td align="center">92.0</td>
<td align="center">93.0</td>
<td align="center">86.0</td>
<td align="center">92.0</td>
<td align="center">88.7</td>
<td align="center">74.3</td>
<td align="center">88.1</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo (2024-04-09)</td>
<td align="center">90.3</td>
<td align="center">91.3</td>
<td align="center">91.7</td>
<td align="center">85.3</td>
<td align="center">92.0</td>
<td align="center">89.3</td>
<td align="center">75.0</td>
<td align="center">87.9</td>
</tr>
<tr>
<td align="left">Claude 3 Opus</td>
<td align="center">92.7</td>
<td align="center">91.7</td>
<td align="center">92.7</td>
<td align="center">86.3</td>
<td align="center">94.7</td>
<td align="center">88.7</td>
<td align="center">66.0</td>
<td align="center">87.5</td>
</tr>
<tr>
<td align="left">GLM-4 (0520)</td>
<td align="center">92.3</td>
<td align="center">91.3</td>
<td align="center">93.3</td>
<td align="center">86.3</td>
<td align="center">92.3</td>
<td align="center">88.6</td>
<td align="center">66.0</td>
<td align="center">87.2</td>
</tr>
</tbody></table>
<p><em>数据来源: 原文 Table 10.</em></p>
<p><strong>风险缓解.</strong> 我们在预训练阶段仔细清洗数据，移除包含敏感关键词的文本和来自预定义黑名单的网页. 在对齐阶段，我们评估每个训练样本的安全性并移除任何存在潜在风险的样本. 无害性也是比较多个模型输出时偏好对齐的重要标准.</p>
<p>我们有一个红队不断用容易导致不安全回答的棘手问题挑战模型. 我们收集 GLM-4 的所有有害问答对并用人工标注改进以进行进一步的模型对齐.</p>
<p><strong>安全评估.</strong> 我们在 SafetyBench(Zhang et al., 2023)上评估 GLM-4 模型，该基准从 7 个维度评估每个模型：伦理与道德(不道德行为)、非法活动(基本法律知识)、心理健康(对心理健康的负面影响)、冒犯性(冒犯行为)、身体健康(可能造成身体伤害的危险行为)、隐私与财产(隐私泄露或财产损失)、不公平与偏见. 我们在 SafetyBench 的中文子集上评估不同模型，该子集通过移除容易被审查的高敏感问题创建，以减轻不同 API 安全策略的干扰.</p>
<p>表 10 展示了 GLM-4 和 SOTA 模型的安全结果. 在大多数维度上 GLM-4(0520)展现出有竞争力的安全性能，总体上与 Claude 3 Opus 达到可比性能. GLM-4 略落后于 GPT-4 家族，尤其在身体健康维度上，该维度需要关于物理世界的稳健常识知识来避免潜在风险. 更多努力已投入该方向以开发更强大和安全的 GLM 模型.</p>
<blockquote>
<p><strong>[局限风险]</strong> SafetyBench 中文子集的特殊性</p>
<p>论文明确提到 SafetyBench 的中文子集「通过移除容易被审查的高敏感问题创建」，这是一个重要的方法论选择. 这意味着评测结果被「软化」了——如果保留那些高敏感问题，不同模型的安全策略差异会更大. 例如，中国模型通常有更严格的内容过滤，可能在某些维度上得分更高，但也可能因过度审查而降低有用性. 论文通过移除这些问题来「减轻不同 API 安全策略的干扰」，但这同时也削弱了评测的区分度. 另一个值得注意的细节是 GLM-4 在「不公平与偏见」维度上与 Claude 3 Opus 同为 66.0%，显著低于 GPT-4 家族的 73-75%. 这可能反映了中文语料中性别和种族偏见的不同分布，而非模型本身的能力缺陷.</p>
</blockquote>
<hr>
<h2 id="5-jl">5 结论</h2>
<p>在本报告中，我们介绍了从 GLM-130B 到 GLM-4(All Tools)的 ChatGLM 大语言模型家族. 在过去一年半的时间里，我们从第一手经验中在理解大语言模型的各个方面取得了巨大进步. 随着每一代模型的发展，团队学习和应用了更有效和高效的预训练和对齐策略. 近期的 ChatGLM 模型——GLM-4(0116, 0520)、GLM-4-Air(0605)和 GLM-4 All Tools——展示了通过自主使用外部工具和功能来理解和执行复杂任务的重大进步. 这些 GLM-4 模型在性能上达到甚至超越了 GPT-4 Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等最先进模型，尤其在处理与中文语言相关的任务方面. 此外，我们致力于通过开源模型权重和在整个旅程中开发的技术来促进 LLM 的可访问性和安全性. 我们的开源模型，包括语言、代码和视觉模型，仅 2023 一年就在 Hugging Face 上吸引了超过 1000 万次下载. 目前，我们正在利用迄今为止所学的一切开发更强大的模型. 未来，我们将继续通过开源普及前沿 LLM 技术，并推动模型能力向「让机器像人类一样思考」的使命迈进.</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM</td>
<td align="left">General Language Model, 通用语言模型，采用自回归空白填充目标</td>
</tr>
<tr>
<td align="left">ChatGLM</td>
<td align="left">基于 GLM 架构的对话模型家族</td>
</tr>
<tr>
<td align="left">SFT</td>
<td align="left">Supervised Fine-Tuning, 监督微调</td>
</tr>
<tr>
<td align="left">RLHF</td>
<td align="left">Reinforcement Learning from Human Feedback, 人类反馈强化学习</td>
</tr>
<tr>
<td align="left">BPE</td>
<td align="left">Byte-Pair Encoding, 字节对编码</td>
</tr>
<tr>
<td align="left">RoPE</td>
<td align="left">Rotary Position Embedding, 旋转位置编码</td>
</tr>
<tr>
<td align="left">GQA</td>
<td align="left">Grouped Query Attention, 分组查询注意力</td>
</tr>
<tr>
<td align="left">RMSNorm</td>
<td align="left">Root Mean Square Layer Normalization, 均方根层归一化</td>
</tr>
<tr>
<td align="left">SwiGLU</td>
<td align="left">Swish-Gated Linear Unit, Swish 门控线性单元</td>
</tr>
<tr>
<td align="left">FlashAttention</td>
<td align="left">一种 IO-aware 的精确注意力算法，降低显存占用并加速计算</td>
</tr>
<tr>
<td align="left">MQA</td>
<td align="left">Multi-Query Attention, 多查询注意力</td>
</tr>
<tr>
<td align="left">LongAlign</td>
<td align="left">长上下文对齐方案，支持 128K token 上下文</td>
</tr>
<tr>
<td align="left">AgentTuning</td>
<td align="left">Agent 能力指令微调框架</td>
</tr>
<tr>
<td align="left">APAR</td>
<td align="left">Auto-Parallel Auto-Regressive, 自动并行自回归生成</td>
</tr>
<tr>
<td align="left">Self-Contrast</td>
<td align="left">无反馈对齐策略，利用模型自我生成负样本</td>
</tr>
<tr>
<td align="left">All Tools</td>
<td align="left">GLM-4 的工具调用能力，支持浏览器/Python/文生图等</td>
</tr>
<tr>
<td align="left">GLMs</td>
<td align="left">用户可定制的 Agent 平台</td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="left">Instruction Following Evaluation, 指令遵循评测基准</td>
</tr>
<tr>
<td align="left">AlignBench</td>
<td align="left">中文对齐质量评测基准</td>
</tr>
<tr>
<td align="left">LongBench</td>
<td align="left">长上下文处理能力评测基准</td>
</tr>
<tr>
<td align="left">NCB</td>
<td align="left">NaturalCodeBench, 真实用户提示代码基准</td>
</tr>
<tr>
<td align="left">SafetyBench</td>
<td align="left">安全性评测基准</td>
</tr>
</tbody></table>
<h3 id="b-hxgsycssy">B. 核心公式与参数索引</h3>
<table>
<thead>
<tr>
<th align="center">编号</th>
<th align="left">内容</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="center">(1)</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><mfrac><mn>10</mn><mn>3</mn></mfrac><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{\\mathrm{ffn}} = \\frac{10}{3} \\times d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">ffn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="left">GLM-4 中 GQA 补偿后的 FFN 维度</td>
</tr>
<tr>
<td align="center">(2)</td>
<td align="left">词表大小 = 150,000</td>
<td align="left">统一中英词表</td>
</tr>
<tr>
<td align="center">(3)</td>
<td align="left">预训练数据量 = 10T tokens</td>
<td align="left">多语言语料</td>
</tr>
<tr>
<td align="center">(4)</td>
<td align="left">ChatGLM-6B 参数量 = 6.2B</td>
<td align="left">初代对话模型</td>
</tr>
<tr>
<td align="center">(5)</td>
<td align="left">GLM-4-9B 参数量 = 9B</td>
<td align="left">开源版本</td>
</tr>
<tr>
<td align="center">(6)</td>
<td align="left">上下文长度: 2K → 32K → 128K/1M</td>
<td align="left">逐代扩展</td>
</tr>
</tbody></table>
<h3 id="c-mxpxdw">C. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: GLM-130B(ICLR 2023)、ChatGLM-6B(三代迭代)</li>
<li><strong>核心创新</strong>: 10T token 预训练、中英双语深度对齐、GLM-4 All Tools 自主工具调用、128K/1M 长上下文、GQA+SwiGLU+RMSNorm 架构升级</li>
<li><strong>被后续工作引用/改进</strong>: GLM-4.5(ARC, Agentic/Reasoning/Coding)、GLM-4.6/4.7(代码增强)、GLM-5(MoE, 744B 参数)</li>
<li><strong>同期竞争</strong>: GPT-4 Turbo(2024-04)、Claude 3 Opus、Gemini 1.5 Pro、Llama-3-8B/70B</li>
<li><strong>开源贡献</strong>: ChatGLM-6B 三代、GLM-4-9B(128K/1M)、GLM-4V-9B、CodeGeeX、CogVLM/CogAgent、CogView、WebGLM</li>
<li><strong>技术影响</strong>: LongAlign、AgentTuning、ChatGLM-RLHF、Self-Contrast、APAR 等创新被社区广泛采用</li>
</ul>
<blockquote>
<p><strong>历史定位</strong></p>
<p>GLM-4(2024.06)是智谱 AI 从学术开源走向商业化产品的关键节点. 它不仅是 ChatGLM 三代迭代的集大成者，也是 GLM 家族从「追赶 GPT-3」到「对标 GPT-4」的质变标志. 与 GLM-130B 的开源先驱精神不同，GLM-4 的核心模型权重并未完全开源(仅开源了 9B 小模型)，这反映了商业化压力与开源理想之间的张力. 但 GLM-4 在技术上确立了后续 GLM-4.5/4.6/4.7/5 系列的基座：10T 数据规模、中英双语深度对齐、自主工具调用、长上下文扩展. 从谱系角度看，GLM-4 是中国本土 LLM 从「跟随者」转变为「并行者」的里程碑.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-chat-glm-js","text":"2 ChatGLM 技术"},{"level":3,"id":"2-1-yxlsj","text":"2.1 预训练数据"},{"level":3,"id":"2-2-jg","text":"2.2 架构"},{"level":3,"id":"2-3-dq","text":"2.3 对齐"},{"level":3,"id":"2-4-chat-glm-xljs","text":"2.4 ChatGLM 系列技术"},{"level":3,"id":"2-5-glm-4-all-tools","text":"2.5 GLM-4 All Tools"},{"level":2,"id":"3-glm-4-nlpg","text":"3 GLM-4 能力评估"},{"level":3,"id":"3-1-xsjzpg","text":"3.1 学术基准评估"},{"level":3,"id":"3-2-zlzxpg","text":"3.2 指令遵循评估"},{"level":3,"id":"3-3-dqpg","text":"3.3 对齐评估"},{"level":3,"id":"3-4-csxwclnlpg","text":"3.4 长上下文处理能力评估"},{"level":3,"id":"3-5-zsyhtsxddmnlpg","text":"3.5 真实用户提示下的代码能力评估"},{"level":3,"id":"3-6-function-call-pg","text":"3.6 Function Call 评估"},{"level":3,"id":"3-7-agent-nlpg","text":"3.7 Agent 能力评估"},{"level":3,"id":"3-8-all-tools-pg","text":"3.8 All Tools 评估"},{"level":2,"id":"4-aqyfx","text":"4 安全与风险"},{"level":2,"id":"5-jl","text":"5 结论"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgsycssy","text":"B. 核心公式与参数索引"},{"level":3,"id":"c-mxpxdw","text":"C. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/03-glm-4/01-glm-4-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/03-glm-4/01-glm-4-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ChatGLM: 从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族 技术报告精译</h1>
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
