"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-Llama3-V 2.5 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM-V: A GPT-4V Level MLLM on Your Phone
原文链接: <a href="https://arxiv.org/abs/2408.01800">https://arxiv.org/abs/2408.01800</a>
发布日期: 2024-05-20(模型发布), 2024-08-03(技术报告 arXiv)
发布机构: OpenBMB(面壁智能), Tsinghua University(清华大学 NLP 实验室)
模型规模: 8.5B 总参数(Llama-3-8B-Instruct + SigLIP-400M)
开源协议: Apache 2.0
备注: 本文基于 MiniCPM-V 系列技术报告(arXiv:2408.01800)精译, 该报告系统介绍了 MiniCPM-V 1.0/2.0/2.5 三代模型. 本节聚焦 Llama3-V 2.5 的技术细节与实验结果.</p>
</blockquote>
<hr>
<h2 id="zy-abstract">摘要 (Abstract)</h2>
<p>近年来, 多模态大语言模型(Multimodal Large Language Models, MLLMs)的迅猛发展从根本上重塑了 AI 研究与产业的格局, 为下一个 AI 里程碑指明了有希望的方向. 然而, 显著的挑战仍然阻碍着 MLLMs 在实际应用中的落地. 最突出的挑战来自于运行一个拥有庞大参数量和大量计算的 MLLM 所带来的巨大成本. 因此, 大多数 MLLM 只能部署在高性能的云服务器上, 这极大地限制了它们的应用范围, 例如移动设备、离线场景、能耗敏感场景以及隐私保护场景.</p>
<p>在这项工作中, 我们提出了 MiniCPM-V, 一系列可部署在端侧设备上的高效 MLLM. 通过整合架构、预训练和对齐方面的最新 MLLM 技术, 最新的 MiniCPM-Llama3-V 2.5 具有若干显著特性: (1) 强大的性能, 在 OpenCompass 综合评测的 11 个主流基准上超越 GPT-4V-1106、Gemini Pro 和 Claude 3; (2) 强大的 OCR 能力和 180 万像素任意长宽比的高分辨率图像感知; (3) 可信的行为, 在 Object HalBench 上实现比 GPT-4V-1106 更低的幻觉率; (4) 30+ 语言的多语言支持; (5) 高效的端侧部署. 更重要的是, MiniCPM-V 可以被视为一个代表趋势的典型案例: 达到可用性能水平(如 GPT-4V 级别)所需的模型规模正在迅速缩小, 而端侧设备的计算能力正在快速增长. 这两个趋势的交汇表明, 在端侧设备上部署 GPT-4V 级别的 MLLM 正变得越来越可行.</p>
<blockquote>
<p>译者注: MiniCPM-Llama3-V 2.5 的核心升级在于将语言基座从 MiniCPM-2B 替换为 Llama-3-8B-Instruct. 这一选择直接带来了两个收益: (1) Llama-3-8B 的强大语言能力和 128K 上下文窗口为多模态理解提供了更 robust 的基础; (2) Llama-3 的强大多语言能力(预训练覆盖 15 万亿多语言 token)使得多模态能力的跨语言泛化成为可能. 但代价也很明显: 总参数量从 2.8B 膨胀到 8.5B, 端侧部署的内存压力增加了约 3 倍. 这是一个典型的&quot;性能换效率&quot;权衡, 面壁智能选择了在 2.5 这一代优先追求性能, 将极致效率留给后续的 2.6/4.0/4.6 版本.</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>多模态大语言模型(MLLMs)的快速发展在理解、推理和交互方面带来了令人印象深刻的多模态能力激增. 然而, 当前的 MLLMs 在实际应用中仍远未成熟. 一个最主要的挑战是, 当前的 MLLM 通常需要大量的参数并施加沉重的计算负担. 因此, 大多数 MLLM 只能部署在高性能的云服务器上, 导致显著的能源消耗和碳排放. 这种限制严重制约了潜在的应用范围, 例如移动设备、能耗敏感场景、没有稳定网络连接的离线场景, 以及个人和工业用户的隐私/安全保护场景.</p>
<p>鉴于这些限制, 探索更高效的轻量化 MLLM 以在端侧设备上运行越来越引起人们的兴趣. 端侧场景涵盖更广泛的设备, 包括移动电话、个人电脑、车辆和机器人等.</p>
<p>在这项工作中, 我们提出了 MiniCPM-V, 一系列可部署在端侧设备上的高效 MLLM. 截至 2024 年, 我们已推出了三代模型:</p>
<ol>
<li><strong>2024 年 2 月</strong>: MiniCPM-V 1.0 2B 发布, 是首批为手机设计的 MLLM 之一.</li>
<li><strong>2024 年 4 月</strong>: MiniCPM-V 2.0 2B 发布, 在 OCR 和多模态理解上达到开源最优.</li>
<li><strong>2024 年 5 月</strong>: MiniCPM-Llama3-V 2.5 8B 发布, 在 OpenCompass 上超越 GPT-4V-1106、Gemini Pro 和 Claude 3.</li>
</ol>
<p>MiniCPM-Llama3-V 2.5 的五大核心特性:</p>
<ul>
<li><strong>领先的性能</strong>: 在 OpenCompass 11 个主流基准的综合评测上超越 GPT-4V-1106、Gemini Pro 和 Claude 3.</li>
<li><strong>强大的 OCR 能力</strong>: 在 OCRBench 上超越 GPT-4V、Gemini Pro 和 Qwen-VL-Max, 支持表格转 Markdown 和全文 OCR 转录.</li>
<li><strong>可信的行为</strong>: 基于 RLAIF-V 和 RLHF-V 技术, 在 Object HalBench 上实现比 GPT-4V-1106 更低的幻觉率.</li>
<li><strong>多语言支持</strong>: 将多模态能力泛化到 30+ 语言.</li>
<li><strong>高效的端侧部署</strong>: 集成量化、内存优化、编译优化和 NPU 加速等端侧优化技术.</li>
</ul>
<blockquote>
<p>译者注: &quot;超越 GPT-4V&quot;是一个 strong 的声明, 但需要仔细审视. 论文中明确对比的是 GPT-4V-1106(2023 年 11 月版本), 而非更新的 GPT-4V-2024-04 或 GPT-4o. 此外, &quot;超越&quot;基于的是 OpenCompass 综合评测, 这是一个加权平均分数, 不同基准的权重分配会影响最终结果. 在具体的 OCR 子任务上, 2.5 的 OCRBench 725 确实超越了 GPT-4V 的 645, 但在 DocVQA(84.8 vs 88.4)和 TextVQA(76.6 vs 78.0)上仍略低于 GPT-4V. 因此, &quot;超越&quot;应该理解为&quot;综合评测上超越&quot;, 而非&quot;所有任务上全面超越&quot;.</p>
</blockquote>
<hr>
<h2 id="2-mxjg-model-architecture">2 模型架构 (Model Architecture)</h2>
<h3 id="2-1-ztjg">2.1 整体结构</h3>
<p>MiniCPM-Llama3-V 2.5 的架构与 V 2.0 基本一致, 包含三个关键模块: 视觉编码器(SigLIP SoViT-400m/14)、压缩层(perceiver resampler, 单层 cross-attention)和 LLM. 核心差异在于:</p>
<ol>
<li><strong>LLM 基座</strong>: 从 MiniCPM-2B 升级为 Llama-3-8B-Instruct</li>
<li><strong>压缩层 queries</strong>: 从 64 增加到 96(以匹配更大的 LLM 容量)</li>
<li><strong>总参数量</strong>: 从 2.8B 增加到 8.5B</li>
</ol>
<table>
<thead>
<tr>
<th>组件</th>
<th>V 2.0</th>
<th>Llama3-V 2.5</th>
</tr>
</thead>
<tbody><tr>
<td>LLM</td>
<td>MiniCPM-2B</td>
<td>Llama-3-8B-Instruct</td>
</tr>
<tr>
<td>视觉编码器</td>
<td>SigLIP-400M</td>
<td>SigLIP-400M</td>
</tr>
<tr>
<td>压缩层 queries</td>
<td>64</td>
<td>96</td>
</tr>
<tr>
<td>最大分辨率</td>
<td>180 万像素</td>
<td>180 万像素</td>
</tr>
<tr>
<td>任意长宽比</td>
<td>是</td>
<td>是</td>
</tr>
<tr>
<td>总参数</td>
<td>2.8B</td>
<td>8.5B</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiniCPM-V 2.0 与 Llama3-V 2.5 的关键配置对比.</p>
</blockquote>
<h3 id="2-2-zsysjbm">2.2 自适应视觉编码</h3>
<p>MiniCPM-Llama3-V 2.5 继承了 V 2.0 的 LLaVA-UHD 自适应视觉编码方法, 支持 180 万像素以下任意长宽比图像输入. 具体技术细节(图像分片、评分函数、位置编码插值、token 压缩)与 V 2.0 相同, 参见 V 2.0 技术报告精译.</p>
<blockquote>
<p>译者注: 2.5 在视觉编码策略上与 2.0 完全一致, 这意味着视觉部分的计算成本基本相同. 8.5B 总参数中, 视觉编码器(SigLIP-400M)和压缩层(perceiver, 约 100M)只占约 500M, 其余 8B 都是 Llama-3-8B. 因此, 2.5 相比 2.0 的性能提升主要来自更强的语言基座, 而非视觉编码的改进. 这验证了一个核心假设: 在 MLLM 中, LLM 的语言能力是多模态理解的瓶颈——给一个好的视觉编码器配上更强的 LLM, 整体性能会显著提升.</p>
</blockquote>
<hr>
<h2 id="3-xl-training">3 训练 (Training)</h2>
<h3 id="3-1-yxl">3.1 预训练</h3>
<p>MiniCPM-Llama3-V 2.5 的预训练遵循与 V 2.0 相同的三阶段策略:</p>
<ul>
<li><strong>Stage-1</strong>: 压缩层预热, 224x224, 200M image captioning 数据</li>
<li><strong>Stage-2</strong>: 分辨率扩展, 224→448, 训练视觉编码器</li>
<li><strong>Stage-3</strong>: 自适应高分辨率 + OCR 数据, 训练压缩层 + 视觉编码器</li>
</ul>
<p>预训练数据规模与 V 2.0 相同(约 570M 图像-文本对).</p>
<h3 id="3-2-jdwt-sft">3.2 监督微调 (SFT)</h3>
<p>SFT 阶段的数据策略与 V 2.0 相同(Part-1 基础能力 + Part-2 高级能力), 但 Llama3-V 2.5 额外引入了两个数据来源:</p>
<ol>
<li><strong>Cauldron 数据集</strong>: 整合 2M 多模态知识增强数据, 提升模型的多模态知识覆盖.</li>
<li><strong>多语言数据</strong>: 90K 覆盖 36 种语言的多语言数据, 增强多语言对话能力.</li>
</ol>
<h3 id="3-3-rlaif-v-dq">3.3 RLAIF-V 对齐</h3>
<p>MiniCPM-Llama3-V 2.5 采用 RLAIF-V 技术替代了 V 2.0 的 RLHF-V. RLAIF-V 的核心创新是从开源 MLLM 获取 AI 反馈进行对齐, 而非依赖昂贵的人工标注.</p>
<p><strong>RLAIF-V 流程</strong>:</p>
<ol>
<li><strong>响应生成</strong>: 使用策略模型对给定指令采样 10 个响应.</li>
<li><strong>反馈收集</strong>: <ul>
<li>用 Llama-3 8B 将每个响应分解为原子声明(atomic claims).</li>
<li>用开源 MLLM(LLaVA-NeXT-Yi 34B)验证每个声明的正确性(转化为 yes/no 问题).</li>
<li>统计被拒绝的声明数作为响应得分.</li>
</ul>
</li>
<li><strong>直接偏好优化(DPO)</strong>: 基于得分构建偏好对, 用 DPO 训练.</li>
</ol>
<p><strong>RLAIF-V 相比 RLHF-V 的优势</strong>:</p>
<ul>
<li>成本更低: 无需人工标注, 全流程自动化.</li>
<li>可扩展性更高: 可以生成任意规模的偏好数据.</li>
<li>质量可控: 通过选择更强的验证器 MLLM 来提升反馈质量.</li>
</ul>
<blockquote>
<p>译者注: RLAIF-V 的&quot;分而治之&quot;策略是核心创新. 直接让 MLLM 判断&quot;这段描述是否正确&quot;很困难, 因为描述可能包含数十个对象和关系. 但分解为原子声明后, 每个声明的验证变成了简单的 yes/no 判断, 准确率显著提高. 不过这一方法有一个隐含假设: 验证器 MLLM(LLaVA-NeXT-Yi 34B)的视觉理解能力必须强于被验证的策略模型. 如果验证器本身也产生幻觉, 就会引入错误的偏好信号. 论文中选择 34B 的 Yi 作为验证器, 正是为了确保验证器的能力优势. 但这也带来了成本——34B 模型的推理开销远高于 8.5B 的策略模型.</p>
</blockquote>
<hr>
<h2 id="4-sy-experiments">4 实验 (Experiments)</h2>
<h3 id="4-1-tydmtjz">4.1 通用多模态基准</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OpenCompass</th>
<th>MME</th>
<th>MMB dev</th>
<th>MMB test</th>
<th>MMMU</th>
<th>MathVista</th>
<th>LLaVA Bench</th>
<th>Object HalBench(Res./Men.)</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4V(2023.11)</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>13.6/7.3</td>
</tr>
<tr>
<td>Gemini Pro</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Idefics2</td>
<td>8.0B</td>
<td>57.2</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>LLaVA-NeXT-Llama-3-8B</td>
<td>8.5B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Cambrian-34B</td>
<td>34B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Yi-VL-34B</td>
<td>34B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>CogVLM2-Llama3-19B</td>
<td>19B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>MiniCPM-V 2.0</td>
<td>2.8B</td>
<td>54.5</td>
<td>1808.6</td>
<td>69.1</td>
<td>66.5</td>
<td>38.2</td>
<td>38.7</td>
<td>69.2</td>
<td>14.5/7.8</td>
</tr>
<tr>
<td><strong>MiniCPM-Llama3-V 2.5</strong></td>
<td><strong>8.5B</strong></td>
<td><strong>65.1</strong></td>
<td><strong>2024.6</strong></td>
<td><strong>77.2</strong></td>
<td><strong>74.2</strong></td>
<td><strong>45.8</strong></td>
<td><strong>54.3</strong></td>
<td><strong>86.7</strong></td>
<td><strong>10.3/5.0</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 通用多模态基准评测结果. MiniCPM-Llama3-V 2.5 在 OpenCompass 上超越 Idefics2-8B 7.9 分, 超越 Cambrian-34B、Yi-VL-34B 和 CogVLM2-Llama3-19B 等更大规模模型. 在 Object HalBench 上, 幻觉率低于 GPT-4V-1106(13.6/7.3).</p>
</blockquote>
<blockquote>
<p>译者注: 这张表清晰地展示了&quot;基座升级&quot;带来的性能跃升. 从 V 2.0 到 2.5, OpenCompass 从 54.5 提升到 65.1(+10.6 分), MME 从 1808.6 提升到 2024.6(+216 分). 这种幅度的提升几乎完全来自 LLM 基座的更换——视觉编码器和训练数据基本没变. 特别值得关注的是 Object HalBench: 2.5 的 10.3/5.0 显著低于 GPT-4V-1106 的 13.6/7.3, 这意味着 2.5 的幻觉率比 GPT-4V 更低. 但要注意, HalBench 的评测方式是&quot;模型描述图像, 然后检查描述中的每个对象是否真实存在&quot;, 低分 = 更少幻觉 = 更好. 2.5 的这一成绩归功于 RLAIF-V 对齐.</p>
</blockquote>
<h3 id="4-2-ocr-xn">4.2 OCR 性能</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OCRBench</th>
<th>TextVQA val</th>
<th>DocVQA test</th>
</tr>
</thead>
<tbody><tr>
<td>Gemini Pro</td>
<td>-</td>
<td>680</td>
<td>74.6</td>
<td>88.1</td>
</tr>
<tr>
<td>GPT-4V(2023.11)</td>
<td>-</td>
<td>645</td>
<td>78.0</td>
<td>88.4</td>
</tr>
<tr>
<td>Qwen-VL-Max</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>CogVLM-Chat</td>
<td>17.4B</td>
<td>590</td>
<td>70.4</td>
<td>33.3</td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>9.6B</td>
<td>488</td>
<td>61.5</td>
<td>62.6</td>
</tr>
<tr>
<td>MiniCPM-V 2.0</td>
<td>2.8B</td>
<td>605</td>
<td>74.1</td>
<td>71.9</td>
</tr>
<tr>
<td><strong>MiniCPM-Llama3-V 2.5</strong></td>
<td><strong>8.5B</strong></td>
<td><strong>725</strong></td>
<td><strong>76.6</strong></td>
<td><strong>84.8</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: OCR 基准评测结果. MiniCPM-Llama3-V 2.5 在 OCRBench 上超越 GPT-4V(645)、Gemini Pro(680) 和 Qwen-VL-Max, 达到开源模型最优水平.</p>
</blockquote>
<blockquote>
<p>译者注: OCRBench 725 是一个非常 impressive 的数字. 作为对比, GPT-4V 是 645, Gemini Pro 是 680. 2.5 不仅是&quot;开源最优&quot;, 而且是&quot;全面最优&quot;——超越了所有已知模型(包括闭源). 这种优势主要来自两方面: (1) 更强的 LLM 基座(Llama-3-8B)对 OCR 文本的理解和推理更准确; (2) RLAIF-V 对齐减少了 OCR 结果中的幻觉(如误识别、添字漏字). 但在 TextVQA(76.6 vs GPT-4V 78.0)和 DocVQA(84.8 vs GPT-4V 88.4)上仍有小幅差距, 说明在极端复杂的场景文字和文档布局理解上, 8B 模型仍有提升空间.</p>
</blockquote>
<h3 id="4-3-rlaif-v-xrsy">4.3 RLAIF-V 消融实验</h3>
<table>
<thead>
<tr>
<th>方法</th>
<th>OpenCompass</th>
<th>MME</th>
<th>MMB dev</th>
<th>MMB test</th>
<th>MMMU</th>
<th>MathVista</th>
<th>LLaVA Bench</th>
<th>Object HalBench(Res./Men.)</th>
</tr>
</thead>
<tbody><tr>
<td>w/o RLAIF-V</td>
<td>64.5</td>
<td>2019.8</td>
<td>77.7</td>
<td>73.5</td>
<td>46.2</td>
<td>54.1</td>
<td>85.4</td>
<td>86.9/93.6</td>
</tr>
<tr>
<td>w/ RLAIF-V</td>
<td>65.1</td>
<td>2024.6</td>
<td>77.2</td>
<td>74.2</td>
<td>45.8</td>
<td>54.3</td>
<td>86.7</td>
<td>89.7/95.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: RLAIF-V 消融实验. 模型为 MiniCPM-Llama3-V 2.5. RLAIF-V 在 OpenCompass 平均 11 个基准上提升 0.6 分, 同时显著改善幻觉率.</p>
</blockquote>
<blockquote>
<p>译者注: 这里需要注意 Object HalBench 的数值方向. 论文中报告的 &quot;86.9/93.6&quot; 和 &quot;89.7/95.0&quot; 看起来像是准确率, 而非幻觉率. 实际上 Object HalBench 有两个指标: 响应级准确率(response-level accuracy)和提及级准确率(mention-level accuracy). 更高 = 更好. RLAIF-V 将响应级准确率从 86.9 提升到 89.7, 提及级从 93.6 提升到 95.0. 这与&quot;更低幻觉率&quot;的表述一致: 准确率提高意味着幻觉减少. 但 RLAIF-V 对通用能力(OpenCompass 65.1 vs 64.5)的提升相对温和(+0.6 分), 说明其主要价值在于可信行为而非全面性能.</p>
</blockquote>
<h3 id="4-4-dyynl">4.4 多语言能力</h3>
<p>基于 VisCPM 的多语言多模态泛化方法, MiniCPM-Llama3-V 2.5 将多模态能力扩展到 30+ 语言. 预训练仅使用英文和中文多模态数据, 然后通过轻量级但高质量的多语言 SFT 对齐到目标语言.</p>
<table>
<thead>
<tr>
<th>方法</th>
<th>French</th>
<th>German</th>
<th>Portuguese</th>
<th>Spanish</th>
<th>Czech</th>
<th>Hungarian</th>
<th>Japanese</th>
<th>Korean</th>
<th>Thai</th>
</tr>
</thead>
<tbody><tr>
<td>w/o 多语言 SFT</td>
<td>46.4</td>
<td>22.8</td>
<td>53.0</td>
<td>29.0</td>
<td>26.5</td>
<td>20.6</td>
<td>13.8</td>
<td>13.7</td>
<td>14.4</td>
</tr>
<tr>
<td>w/ 多语言 SFT</td>
<td>72.7</td>
<td>76.5</td>
<td>83.8</td>
<td>73.9</td>
<td>71.6</td>
<td>70.9</td>
<td>88.0</td>
<td>67.9</td>
<td>61.9</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 多语言多模态能力消融实验(LLaVA Bench 多语言版本). w/ 多语言 SFT 在所有语言上均有 25+ 分的提升.</p>
</blockquote>
<blockquote>
<p>译者注: 多语言 SFT 的效果非常显著. 以德语为例, 从无多语言 SFT 的 22.8 分提升到 76.5 分(+53.7 分). 日语从 13.8 提升到 88.0(+74.2 分). 这种&quot;轻量级对齐&quot;即可实现大幅跨语言泛化的现象, 验证了 VisCPM 的核心发现: 多模态能力可以通过强大的多语言 LLM 基座进行跨语言泛化, 无需为每种语言收集大量多模态训练数据. 但需要注意, 这种泛化能力在 LLM 基座多语言能力强的语言上效果更明显(如德语、日语), 在真正低资源的语言上(如斯瓦希里语、尼泊尔语)的效果可能有限.</p>
</blockquote>
<h3 id="4-5-yqt-llama-3-jmxddb">4.5 与其他 Llama-3 基模型的对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>视觉 token 数范围</th>
<th>架构特点</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-Llama3-V 2.5</td>
<td>(96, 960)</td>
<td>SigLIP + Perceiver Resampler(96 queries)</td>
</tr>
<tr>
<td>LLaVA-NeXT-Llama-3-8B</td>
<td>(1728, 2880)</td>
<td>CLIP ViT-L + MLP 投影(无压缩)</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 2.5 相比 LLaVA-NeXT-Llama-3-8B 的视觉 token 数显著更少(最大 960 vs 2880), 这意味着在推理速度、首 token 延迟、内存占用和功耗方面都有优势. 在端侧部署中, 视觉 token 数量直接决定了 prefill 阶段的计算量和 KV Cache 大小. 2.5 的 (96, 960) 范围来自: 最少 1 个切片(原始图像) x 96 queries = 96, 最多 10 个切片 x 96 queries = 960. 而 LLaVA-NeXT 的 (1728, 2880) 来自: 336x336 图像产生 576 个 patch, 高分辨率模式下产生更多. 这种 3 倍的 token 数量差异在实际端侧部署中意味着显著的用户体验差距.</p>
</blockquote>
<hr>
<h2 id="5-dcbs-end-side-deployment">5 端侧部署 (End-side Deployment)</h2>
<p>MiniCPM-Llama3-V 2.5 通过以下优化实现端侧部署:</p>
<ol>
<li><strong>量化</strong>: 支持 INT4/INT8 量化, GGUF 格式支持 llama.cpp 推理.</li>
<li><strong>内存优化</strong>: 针对 8B 模型的内存管理策略.</li>
<li><strong>编译优化</strong>: TVM 编译, 针对 Snapdragon NPU 优化.</li>
<li><strong>NPU 加速</strong>: 利用手机端 NPU 进行视觉编码和 LLM 推理加速.</li>
</ol>
<p><strong>实测性能</strong>:</p>
<table>
<thead>
<tr>
<th>部署方案</th>
<th>推理速度</th>
</tr>
</thead>
<tbody><tr>
<td>llama.cpp GGUF(INT4)</td>
<td>6~8 tokens/s(手机端)</td>
</tr>
<tr>
<td>vLLM</td>
<td>标准 GPU 推理</td>
</tr>
<tr>
<td>Ollama</td>
<td>消费级 GPU/CPU</td>
</tr>
<tr>
<td>多 GPU(12GB/16GB)</td>
<td>层分布推理</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 6~8 tokens/s 在手机端是一个可接受的解码速度——相当于每秒输出 1-2 个中文句子. 但 8.5B 模型的 INT4 量化后内存占用仍约 5-6GB, 对 8GB RAM 的中低端手机来说已经接近极限. 这也是面壁智能在后续版本(2.6/4.0/4.6)中持续追求更小模型和更高效率的原因.</p>
</blockquote>
<hr>
<h2 id="6-jl-conclusion">6 结论 (Conclusion)</h2>
<p>本文介绍了 MiniCPM-Llama3-V 2.5, 一个 8.5B 参数的端侧多模态大语言模型. 通过将语言基座升级为 Llama-3-8B-Instruct、引入 RLAIF-V 多模态对齐、扩展多语言 SFT 数据, MiniCPM-Llama3-V 2.5 在 OpenCompass 综合评测上超越了 GPT-4V-1106、Gemini Pro 和 Claude 3, 在 OCRBench 上达到全面最优, 并支持 30+ 语言的多模态理解.</p>
<p>MiniCPM-Llama3-V 2.5 代表了端侧 MLLM 的一个重要里程碑: 首次证明端侧设备上可以运行达到 GPT-4V 级别的多模态 AI. 随着端侧计算能力的持续增长和模型效率的不断提升, 我们相信更强大、更高效的端侧多模态 AI 将在不久的将来普及.</p>
<hr>
<h2 id="fl-syb">附录: 术语表</h2>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>MLLM</td>
<td>多模态大语言模型</td>
<td>摘要</td>
<td>融合视觉和语言能力的 AI 模型</td>
</tr>
<tr>
<td>RLAIF-V</td>
<td>基于 AI 反馈的视觉强化学习</td>
<td>摘要</td>
<td>从开源 MLLM 获取 AI 反馈进行多模态对齐</td>
</tr>
<tr>
<td>LLaVA-UHD</td>
<td>LLaVA 超高分辨率</td>
<td>第 2.2 节</td>
<td>支持任意长宽比高分辨率图像输入的视觉编码方法</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>第 3.3 节</td>
<td>不依赖奖励模型, 直接用偏好数据优化策略</td>
</tr>
<tr>
<td>Object HalBench</td>
<td>对象幻觉基准</td>
<td>第 4.1 节</td>
<td>评测模型生成描述中幻觉率的基准测试</td>
</tr>
<tr>
<td>OCRBench</td>
<td>OCR 综合基准</td>
<td>第 4.2 节</td>
<td>综合评测 OCR 能力的权威基准</td>
</tr>
<tr>
<td>OpenCompass</td>
<td>开放评测平台</td>
<td>第 4.1 节</td>
<td>综合评测基础模型能力的统一平台</td>
</tr>
<tr>
<td>VisCPM</td>
<td>视觉 CPM</td>
<td>第 4.4 节</td>
<td>通过多语言 LLM 基座实现多模态能力跨语言泛化的方法</td>
</tr>
<tr>
<td>Cauldron</td>
<td>熔炉数据集</td>
<td>第 3.2 节</td>
<td>大规模多模态知识增强数据集</td>
</tr>
<tr>
<td>GGUF</td>
<td>GPT-Generated Unified Format</td>
<td>第 5 节</td>
<td>llama.cpp 使用的量化模型格式</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 MiniCPM-Llama3-V 2.5 技术报告的精译. D1 PDF 已归档(arXiv:2408.01800, 26 页, 与 V 2.0 共享). D3 因 MinerU Windows 环境不稳定改用 arXiv HTML + PDF 文本提取替代. D4 基于 D3 内容整理.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy-abstract","text":"摘要 (Abstract)"},{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-mxjg-model-architecture","text":"2 模型架构 (Model Architecture)"},{"level":3,"id":"2-1-ztjg","text":"2.1 整体结构"},{"level":3,"id":"2-2-zsysjbm","text":"2.2 自适应视觉编码"},{"level":2,"id":"3-xl-training","text":"3 训练 (Training)"},{"level":3,"id":"3-1-yxl","text":"3.1 预训练"},{"level":3,"id":"3-2-jdwt-sft","text":"3.2 监督微调 (SFT)"},{"level":3,"id":"3-3-rlaif-v-dq","text":"3.3 RLAIF-V 对齐"},{"level":2,"id":"4-sy-experiments","text":"4 实验 (Experiments)"},{"level":3,"id":"4-1-tydmtjz","text":"4.1 通用多模态基准"},{"level":3,"id":"4-2-ocr-xn","text":"4.2 OCR 性能"},{"level":3,"id":"4-3-rlaif-v-xrsy","text":"4.3 RLAIF-V 消融实验"},{"level":3,"id":"4-4-dyynl","text":"4.4 多语言能力"},{"level":3,"id":"4-5-yqt-llama-3-jmxddb","text":"4.5 与其他 Llama-3 基模型的对比"},{"level":2,"id":"5-dcbs-end-side-deployment","text":"5 端侧部署 (End-side Deployment)"},{"level":2,"id":"6-jl-conclusion","text":"6 结论 (Conclusion)"},{"level":2,"id":"fl-syb","text":"附录: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/06-mini-cpm-llama3-v-2.5/01-mini-cpm-llama3-v-2.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/06-mini-cpm-llama3-v-2.5/01-mini-cpm-llama3-v-2.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-Llama3-V 2.5 技术报告精译</h1>
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
