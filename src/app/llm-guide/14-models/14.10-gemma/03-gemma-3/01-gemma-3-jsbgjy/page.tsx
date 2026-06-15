"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma 3 Technical Report 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Gemma 3 Technical Report
原文链接: <a href="https://arxiv.org/abs/2503.19786">https://arxiv.org/abs/2503.19786</a>
发布日期: 2025.03.12
发布机构: Google DeepMind, Gemma Team</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-%E6%A8%A1%E5%9E%8B%E6%9E%B6%E6%9E%84">2 模型架构</a><ul>
<li><a href="#21-%E8%A7%86%E8%A7%89%E6%A8%A1%E6%80%81">2.1 视觉模态</a></li>
<li><a href="#22-%E9%A2%84%E8%AE%AD%E7%BB%83">2.2 预训练</a></li>
<li><a href="#23-%E9%87%8F%E5%8C%96%E6%84%9F%E7%9F%A5%E8%AE%AD%E7%BB%83">2.3 量化感知训练</a></li>
<li><a href="#24-%E8%AE%A1%E7%AE%97%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">2.4 计算基础设施</a></li>
</ul>
</li>
<li><a href="#3-%E6%8C%87%E4%BB%A4%E5%BE%AE%E8%B0%83">3 指令微调</a></li>
<li><a href="#4-%E6%9C%80%E7%BB%88%E6%A8%A1%E5%9E%8B%E8%AF%84%E4%BC%B0">4 最终模型评估</a><ul>
<li><a href="#41-lmsys-chatbot-arena">4.1 LMSYS Chatbot Arena</a></li>
<li><a href="#42-%E6%A0%87%E5%87%86%E5%9F%BA%E5%87%86%E6%B5%8B%E8%AF%95">4.2 标准基准测试</a></li>
</ul>
</li>
<li><a href="#5-%E6%B6%88%E8%9E%8D%E5%AE%9E%E9%AA%8C">5 消融实验</a><ul>
<li><a href="#51-%E9%A2%84%E8%AE%AD%E7%BB%83%E8%83%BD%E5%8A%9B%E6%8E%A2%E6%B5%8B">5.1 预训练能力探测</a></li>
<li><a href="#52-localglobal-%E6%B3%A8%E6%84%8F%E5%8A%9B%E5%B1%82">5.2 Local:Global 注意力层</a></li>
<li><a href="#53-%E5%90%AF%E7%94%A8%E9%95%BF%E4%B8%8A%E4%B8%8B%E6%96%87">5.3 启用长上下文</a></li>
<li><a href="#54-%E5%B0%8F%E6%95%99%E5%B8%88-vs-%E5%A4%A7%E6%95%99%E5%B8%88">5.4 小教师 vs. 大教师</a></li>
<li><a href="#55-%E8%A7%86%E8%A7%89Encoder">5.5 视觉Encoder </a></li>
</ul>
</li>
<li><a href="#6-%E8%AE%A8%E8%AE%BA%E4%B8%8E%E7%BB%93%E8%AE%BA">6 讨论与结论</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%80%A7%E8%83%BD%E8%AF%A6%E6%83%85">A 预训练性能详情</a></li>
<li><a href="#b-it-%E6%A8%A1%E5%9E%8B%E6%80%A7%E8%83%BD">B IT 模型性能</a></li>
<li><a href="#c-%E8%AF%84%E4%BC%B0%E7%BB%86%E8%8A%82">C 评估细节</a></li>
</ul>
</li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们推出 Gemma 3,这是 Gemma 轻量级开放模型家族的多模态新成员,规模从 10 亿到 270 亿参数不等. 本版本引入了视觉理解能力、更广泛的语言覆盖范围以及更长的上下文窗口——至少 128K token. 我们还修改了模型架构以减少 KV Cache 内存在长上下文场景下的爆炸性增长,这通过增加局部(local)注意力层与全局(global)注意力层的比例,并保持局部注意力的跨度较短来实现. Gemma 3 模型采用知识蒸馏训练,在预训练和指令微调版本上均优于 Gemma 2. 特别是,我们新颖的后训练配方显著提升了数学、对话、指令遵循和多语言 ability,使得 Gemma3-4B-IT 可与 Gemma2-27B-IT 竞争,而 Gemma3-27B-IT 在多个基准测试上与 Gemini-1.5-Pro 相当. 我们将所有模型发布给社区.</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>我们呈现 Gemma 开放语言模型的最新版本,与 Gemini 前沿模型家族协同设计. 新版本在规模上与 Gemma 2 相当,并增加了 1B 模型. 这些模型设计用于在标准消费级硬件(如手机、笔记本电脑和高端 GPU)上运行. 本版本为 Gemma 家族带来了几项新能力:多模态、长上下文和多语言,同时保持或超越了先前版本的性能.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么做轻量级开放模型?
Google 在 Gemini 系列之外维护 Gemma 产品线,核心定位是「开放、轻量、可部署」. 与 Llama 的竞争策略不同,Gemma 更强调在消费级硬件上的可运行性——1B 模型可跑在手机端,27B 模型可跑在单张高端 GPU 上. 这一定位决定了其架构选择必须围绕「效率」而非「规模」展开.</p>
</blockquote>
<p>在多模态方面,大多数 Gemma 3 模型兼容定制版的 SigLIP 视觉Encoder . 语言模型将图像视为由 SigLIP 编码的软 token 序列. 我们通过将视觉嵌入压缩为固定大小的 256 个向量来降低图像处理的推理成本. Encoder 以固定分辨率工作,我们借鉴 LLaVA 的 Pan and Scan (P&amp;S) 方法实现灵活分辨率.</p>
<blockquote>
<p><strong>[架构细节]</strong> P&amp;S 的本质
Pan and Scan 是一种推理时自适应窗口算法:将图像分割为等大小的不重叠裁剪块,覆盖整个图像,然后将其 resize 到 896x896 像素后送入Encoder . 这仅在必要时应用,并控制最大裁剪数量. 这是一个纯推理时优化,可以在需要更快推理时禁用.</p>
</blockquote>
<p>第二个主要架构改进是将上下文大小增加到 128K token,且性能不降. 长上下文的挑战在于推理期间 KV Cache 的内存爆炸. 为减少这一问题,我们在每个全局层之间交错多个局部层,并为局部层分配仅 1024 token 的较小跨度. 因此,只有全局层关注长上下文,且每 5 个局部层对应 1 个全局层.</p>
<blockquote>
<p><strong>[技术细节]</strong> 5:1 Local:Global 的 KV Cache 收益
标准 Transformer 的全局注意力意味着每个 token 都要与所有先前 token 计算注意力,导致 KV Cache 随序列长度线性增长. Gemma 3 的 5:1 局部-全局交错策略意味着:只有 1/6 的层需要存储完整的 128K KV Cache,其余 5/6 的层仅需存储 1024 的滑动窗口 KV Cache. 这是一个从算法层面直接削减显存占用的设计.</p>
</blockquote>
<p>预训练优化配方与 Gemma 2 类似,在架构设计上有一些修改. 我们使用与 Gemini 2.0 相同的分词器,并重新调整数据混合以提升模型的多语言能力,同时引入图像理解. 所有 Gemma 3 模型均采用知识蒸馏训练.</p>
<p>在后训练中,我们专注于提升数学、推理和对话能力,以及整合 Gemma 3 的新能力:长上下文和图像输入. 我们采用一种新颖的后训练方法,在数学、代码、对话、指令遵循和多语言等所有能力上带来提升. 由此产生的 Gemma 3 指令微调模型既强大又通用,大幅超越了前代模型.</p>
<p>在后续章节中,我们简要概述模型,包括架构以及预训练和后训练配方. 我们还提供了跨多种定量和定性基准的详细评估. 我们讨论安全部署的方法,并概述 Gemma 3 的更广泛影响、局限性和优势.</p>
<blockquote>
<p>图 1: Gemma 3 27B IT 模型的视觉交互示例,展示了对收据图像的理解和回答能力.</p>
</blockquote>
<hr>
<h2 id="2-mxjg">2 模型架构</h2>
<p>Gemma 3 模型遵循与先前迭代相同的通用 decoder-only Transformer 架构,大多数架构元素与前两个 Gemma 版本相似. 我们使用带有 Post-Norm 和 Pre-Norm 的 RMSNorm 的 GQA(Grouped-Query Attention,分组查询注意力). 受先前工作启发,我们用 QK-Norm 替代了 Gemma 2 的 soft-capping. 本节重点介绍与先前版本的关键差异.</p>
<h3 id="2-1-sjmt">2.1 视觉模态</h3>
<p><strong>视觉Encoder .</strong> 我们使用 400M 参数变体的 SigLIP Encoder ,这是一个使用 CLIP 损失变体训练的 Vision Transformer. Gemma 视觉Encoder 接收 resize 为 896x896 的方形图像输入,并在视觉助手任务的数据上进行微调. 为简化,我们在 4B、12B 和 27B 模型之间共享视觉Encoder ,在训练期间保持其冻结.</p>
<p><strong>Pan &amp; Scan (P&amp;S).</strong> Gemma 视觉Encoder 以固定分辨率 896x896 运行. 这导致处理非方形宽高比和高分辨率图像时产生伪影,导致文本不可读或小物体消失. 我们通过推理期间的自适应窗口算法解决此问题:将图像分割为等大小的不重叠裁剪块覆盖整个图像,并将其 resize 到 896x896 像素后送入Encoder . 此窗口仅在必要时应用,并控制最大裁剪数量. 这是一个纯推理时优化,可以在需要更快推理时禁用.</p>
<h3 id="2-2-yxl">2.2 预训练</h3>
<p>我们遵循与 Gemma 2 类似的预训练配方,使用知识蒸馏.</p>
<p><strong>训练数据.</strong> 我们在略大于 Gemma 2 的 token 预算上预训练模型:27B 模型训练 14T token,12B 版本训练 12T token,4B 训练 4T token,1B 训练 2T token. token 增加量考虑了预训练期间使用的图像和文本混合. 我们还增加了多语言数据量以提升语言覆盖. 我们添加单语和并行数据,并使用受先前工作启发的策略处理语言表示的不平衡.</p>
<p><strong>分词器.</strong> 我们使用与 Gemini 2.0 相同的分词器:SentencePiece 分词器,带有数字拆分、保留空白和字节级编码. 结果词表有 262k 个条目. 此分词器对非英语语言更平衡.</p>
<blockquote>
<p><strong>[数据实验]</strong> 262k 词表 vs. 50k 词表的权衡
Gemma 3 的 262k 词表远大于 Llama 3 的 128k 和 Gemma 2 的约 50k. 更大的词表意味着:(1) 非英语 token 表示更高效,减少序列长度;(2) 嵌入矩阵参数量增加(1B 模型中 302M 参数中有约 1/3 来自嵌入);(3) 词表稀疏性增加,对小型模型可能不利. 论文中 1B 模型的性能略低于 Gemma 2 的 2B,可能部分与此相关.</p>
</blockquote>
<p><strong>过滤.</strong> 我们使用过滤技术降低有害或不安全内容的风险,移除某些个人信息和其他敏感数据. 我们对预训练数据混合进行去污染,并通过最小化敏感输出来降低背诵风险. 我们还应用受先前工作启发的质量重加权步骤来减少低质量数据的出现.</p>
<p><strong>蒸馏.</strong> 我们每 token 采样 256 个 logit,按教师概率加权. 学生通过交叉熵损失学习教师在这些采样中的分布. 教师的目标分布对非采样 logit 设为零概率并重新归一化.</p>
<blockquote>
<p><strong>[技术细节]</strong> 蒸馏的实现方式
Gemma 3 的蒸馏不是简单的「硬标签」蒸馏(只取教师预测的 top-1),而是「软标签」蒸馏:每步采样 256 个 logit,保留完整的概率分布. 这让学生能学到教师对次优选择的「置信度梯度」,保留了更多信号. 但代价是每步需要额外计算教师的 256 维概率分布,增加了训练开销.</p>
</blockquote>
<h3 id="2-3-lhgzxl">2.3 量化感知训练</h3>
<p>除了原始Checkpoint,我们还以不同标准格式提供模型的量化版本. 这些版本通过对每个模型进行少量步骤(通常 5,000 步)的微调获得,使用 QAT(Quantization Aware Training,量化感知训练). 我们使用非量化Checkpoint的概率作为目标,并调整数据以匹配预训练和后训练分布. 基于最流行的开源量化推理引擎(如 llama.cpp),我们关注三种权重表示:per-channel int4、per-block int4 和 switched fp8.</p>
<p>下表报告了在 32k 序列长度下,原始和量化模型在有无 KV Cache 时的内存占用:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>Raw bf16 (GB)</th>
<th>Int4 (GB)</th>
<th>Int4 blocks=32 (GB)</th>
<th>SFP8 (GB)</th>
</tr>
</thead>
<tbody><tr>
<td>1B</td>
<td>2.0</td>
<td>0.5</td>
<td>0.7</td>
<td>1.0</td>
</tr>
<tr>
<td>+KV</td>
<td>2.9</td>
<td>1.4</td>
<td>1.6</td>
<td>1.9</td>
</tr>
<tr>
<td>4B</td>
<td>8.0</td>
<td>2.6</td>
<td>2.9</td>
<td>4.4</td>
</tr>
<tr>
<td>+KV</td>
<td>12.7</td>
<td>7.3</td>
<td>7.6</td>
<td>9.1</td>
</tr>
<tr>
<td>12B</td>
<td>24.0</td>
<td>6.6</td>
<td>7.1</td>
<td>12.4</td>
</tr>
<tr>
<td>+KV</td>
<td>38.9</td>
<td>21.5</td>
<td>22.0</td>
<td>27.3</td>
</tr>
<tr>
<td>27B</td>
<td>54.0</td>
<td>14.1</td>
<td>15.3</td>
<td>27.4</td>
</tr>
<tr>
<td>+KV</td>
<td>72.7</td>
<td>32.8</td>
<td>34.0</td>
<td>46.1</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[架构细节]</strong> QAT 的价值
标准 PTQ(Post-Training Quantization)直接对训练好的模型进行量化,往往导致性能下降. QAT 通过在微调阶段模拟量化误差(前向传播使用量化权重,反向传播更新全精度权重),让模型学会适应量化带来的精度损失. 5,000 步的 QAT 是一个轻量级的「量化适配」过程,成本远低于从头训练.</p>
</blockquote>
<h3 id="2-4-jsjcss">2.4 计算基础设施</h3>
<p>我们使用 TPUv4、TPUv5e 和 TPUv5p 训练模型,具体配置如下:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>类型</th>
<th>芯片数</th>
<th>Data Shards</th>
<th>Seq. Shards</th>
<th>Replica</th>
</tr>
</thead>
<tbody><tr>
<td>1B</td>
<td>TPUv5e</td>
<td>512</td>
<td>16</td>
<td>16</td>
<td>2</td>
</tr>
<tr>
<td>4B</td>
<td>TPUv5e</td>
<td>2048</td>
<td>16</td>
<td>16</td>
<td>8</td>
</tr>
<tr>
<td>12B</td>
<td>TPUv4</td>
<td>6144</td>
<td>16</td>
<td>16</td>
<td>24</td>
</tr>
<tr>
<td>27B</td>
<td>TPUv5p</td>
<td>6144</td>
<td>24</td>
<td>8</td>
<td>32</td>
</tr>
</tbody></table>
<p>每个模型配置都经过优化以最小化训练步时间. 对于视觉Encoder ,我们预计算每张图像的嵌入并直接用嵌入训练,不给语言模型训练增加成本.</p>
<p>优化器状态使用 ZeRO-3 实现进行分片. 对于多 pod 训练,我们通过 Pathways 方法在数据中心网络上执行数据副本规约. 我们使用 Jax 和 Pathways 的「单控制器」编程范式,以及 GSPMD 分区器和 MegaScale XLA 编译器.</p>
<p><strong>5:1 局部-全局层交错.</strong> 我们在局部滑动窗口自注意力和全局自注意力之间交替,模式为每 1 个全局层对应 5 个局部层,以局部层作为模型的第一层.</p>
<p><strong>长上下文.</strong> Gemma 3 模型支持 128K token 的上下文长度,1B 模型除外(32K). 我们在全局自注意力层上将 RoPE 基频从 10k 增加到 1M,局部层保持 10k. 我们遵循与位置插值类似的过程来扩展全局自注意力层的跨度.</p>
<hr>
<h2 id="3-zlwt">3 指令微调</h2>
<p>预训练模型通过改进的后训练方法转化为指令微调模型.</p>
<p><strong>技术.</strong> 我们的后训练方法依赖于改进版知识蒸馏,来自大型 IT 教师模型,以及基于改进版 BOND、WARM 和 WARP 的 RL 微调阶段.</p>
<p><strong>强化学习目标.</strong> 我们使用多种奖励函数来提升 helpfulness、数学、代码、推理、指令遵循和多语言能力,同时最小化模型有害性. 这包括从用人类反馈数据训练的权重平均奖励模型学习、代码执行反馈,以及数学问题求解的 ground-truth 奖励.</p>
<blockquote>
<p><strong>[技术细节]</strong> BOND、WARM、WARP 是什么?</p>
<ul>
<li>BOND(Best-of-N Distillation):从 Best-of-N 采样中学习,将拒绝采样的高效性蒸馏到单样本生成中.</li>
<li>WARM(Weight Averaged Reward Models):通过平均多个奖励模型的权重来获得更鲁棒的奖励信号,减少单一奖励模型的过拟合.</li>
<li>WARP(Weight Averaged Policy):类似地,对策略模型进行权重平均,提升泛化能力.
这三种方法的共同点是利用「权重平均」来增强鲁棒性,这是 DeepMind 在 RLHF 领域的特色技术路线.</li>
</ul>
</blockquote>
<p><strong>数据过滤.</strong> 我们仔细优化后训练中使用的数据以最大化模型性能. 我们过滤掉包含某些个人信息、不安全或有毒模型输出、错误自我识别数据和重复示例的数据. 包含鼓励更好的上下文归因、对冲和拒绝的子集也能最小化幻觉,在不降低其他指标性能的情况下提升事实性指标.</p>
<p><strong>[BOS] token.</strong> 对于 PT 和 IT 模型,文本都以 [BOS] token 开头,需要显式添加,因为文本 &quot;[BOS]&quot; 不会映射到 [BOS] token.</p>
<p><strong>PT 与 IT 格式差异.</strong> 所有模型共享相同的分词器,IT 格式有专用控制 token. 关键区别是 PT 模型在生成结束时输出 <code>&lt;eos&gt;</code> token,而 IT 模型输出 <code>&lt;end_of_turn&gt;</code>. 因此微调任一模型类型也需要添加其 respective 结束 token.</p>
<table>
<thead>
<tr>
<th>上下文</th>
<th>格式</th>
</tr>
</thead>
<tbody><tr>
<td>User turn</td>
<td><code>&lt;start_of_turn&gt;user</code></td>
</tr>
<tr>
<td>Model turn</td>
<td><code>&lt;start_of_turn&gt;model</code></td>
</tr>
<tr>
<td>End of turn</td>
<td><code>&lt;end_of_turn&gt;</code></td>
</tr>
</tbody></table>
<hr>
<h2 id="4-zzmxpg">4 最终模型评估</h2>
<h3 id="4-1-lmsys-chatbot-arena">4.1 LMSYS Chatbot Arena</h3>
<p>Gemma 3 27B IT 模型在 LMSYS Chatbot Arena 上进行评估,使用 Elo 评分系统. 请注意,Elo 评分不考虑视觉能力,上述模型都不具备视觉能力.</p>
<h3 id="4-2-bzjzcs">4.2 标准基准测试</h3>
<p>下表展示了指令微调(IT)模型在零样本基准测试上的性能,与 Gemini 1.5、Gemini 2.0 和 Gemma 2 对比:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemini 1.5 Flash</th>
<th>Gemini 1.5 Pro</th>
<th>Gemini 2.0 Flash</th>
<th>Gemini 2.0 Pro</th>
<th>Gemma 2 2B</th>
<th>Gemma 2 9B</th>
<th>Gemma 2 27B</th>
<th>Gemma 3 1B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU-Pro</td>
<td>67.3</td>
<td>75.8</td>
<td>77.6</td>
<td>79.1</td>
<td>15.6</td>
<td>46.8</td>
<td>56.9</td>
<td>14.7</td>
<td>43.6</td>
<td>60.6</td>
<td>67.5</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>30.7</td>
<td>34.2</td>
<td>34.5</td>
<td>36.0</td>
<td>1.2</td>
<td>10.8</td>
<td>20.4</td>
<td>1.9</td>
<td>12.6</td>
<td>24.6</td>
<td>29.7</td>
</tr>
<tr>
<td>Bird-SQL (dev)</td>
<td>45.6</td>
<td>54.4</td>
<td>58.7</td>
<td>59.3</td>
<td>12.2</td>
<td>33.8</td>
<td>46.7</td>
<td>6.4</td>
<td>36.3</td>
<td>47.9</td>
<td>54.4</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>51.0</td>
<td>59.1</td>
<td>60.1</td>
<td>64.7</td>
<td>24.7</td>
<td>28.8</td>
<td>34.3</td>
<td>19.2</td>
<td>30.8</td>
<td>40.9</td>
<td>42.4</td>
</tr>
<tr>
<td>SimpleQA</td>
<td>8.6</td>
<td>24.9</td>
<td>29.9</td>
<td>44.3</td>
<td>2.8</td>
<td>5.3</td>
<td>9.2</td>
<td>2.2</td>
<td>4.0</td>
<td>6.3</td>
<td>10.0</td>
</tr>
<tr>
<td>FACTS Grounding</td>
<td>82.9</td>
<td>80.0</td>
<td>84.6</td>
<td>82.8</td>
<td>43.8</td>
<td>62.0</td>
<td>62.4</td>
<td>36.4</td>
<td>70.1</td>
<td>75.8</td>
<td>74.9</td>
</tr>
<tr>
<td>Global MMLU-Lite</td>
<td>73.7</td>
<td>80.8</td>
<td>83.4</td>
<td>86.5</td>
<td>41.9</td>
<td>64.8</td>
<td>68.6</td>
<td>34.2</td>
<td>54.5</td>
<td>69.5</td>
<td>75.1</td>
</tr>
<tr>
<td>MATH</td>
<td>77.9</td>
<td>86.5</td>
<td>90.9</td>
<td>91.8</td>
<td>27.2</td>
<td>49.4</td>
<td>55.6</td>
<td>48.0</td>
<td>75.6</td>
<td>83.8</td>
<td>89.0</td>
</tr>
<tr>
<td>HiddenMath</td>
<td>47.2</td>
<td>52.0</td>
<td>63.5</td>
<td>65.2</td>
<td>1.8</td>
<td>10.4</td>
<td>14.8</td>
<td>15.8</td>
<td>43.0</td>
<td>54.5</td>
<td>60.3</td>
</tr>
<tr>
<td>MMMU (val)</td>
<td>62.3</td>
<td>65.9</td>
<td>71.7</td>
<td>72.7</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>48.8</td>
<td>59.6</td>
<td>64.9</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[实验分析]</strong> 4B 模型如何媲美 27B?
最引人注目的是 Gemma3-4B-IT 与 Gemma2-27B-IT 的对比. 在 MATH 上,4B 达到 75.6% 而 Gemma2-27B 仅 55.6%;在 HiddenMath 上,4B 达到 43.0% 而 Gemma2-27B 仅 14.8%. 这验证了论文摘要中的 claim:「Gemma3-4B-IT competitive with Gemma2-27B-IT」. 这种跨越量级的提升来自:(1) 知识蒸馏从更强的教师模型学习;(2) 改进的后训练配方;(3) 更大的词表对多语言和数学表示更高效.</p>
</blockquote>
<p>我们不直接与外部模型比较,因为它们通常报告自己的评估设置,在我们的设置下运行不能保证公平比较. 我们鼓励读者关注第三方静态排行榜以获得跨模型的更公平比较.</p>
<hr>
<h2 id="5-xrsy">5 消融实验</h2>
<p>本节关注架构变化的影响,以及模型新增的一些视觉能力.</p>
<h3 id="5-1-yxlnltc">5.1 预训练能力探测</h3>
<p>我们使用多个标准基准作为预训练期间的探测,以确保模型掌握通用能力. 下图比较了 Gemma 2 和 Gemma 3 预训练模型在通用能力上的表现,包括科学、代码、事实性、多语言、推理和视觉.</p>
<blockquote>
<p>图 2-4: Gemma 2 和 Gemma 3 不同预训练模型在通用能力上的性能雷达图.</p>
</blockquote>
<p>总体而言,新版本在大多数类别上都有提升,尽管增加了视觉能力. 我们特别关注本版本的多语言能力,这直接影响了模型质量. 然而,尽管使用了去污染技术,这些探测仍存在被污染的风险,使得得出更确定的结论更加困难.</p>
<blockquote>
<p><strong>[数据实验]</strong> 探测污染问题
论文明确承认了探测基准污染的风险:「despite the use of decontamination techniques, there is always a risk of contamination&quot;. 这是所有大规模预训练模型面临的共同问题——训练数据量达到万亿级别时,完全去污染几乎不可能. 这也是论文中大量依赖内部 held-out 数据集(如 N2C)的原因.</p>
</blockquote>
<h3 id="5-2-local-global-zylc">5.2 Local:Global 注意力层</h3>
<p>我们测量了局部和全局自注意力层变化对性能和推理内存消耗的影响.</p>
<p><strong>Local:Global 比例.</strong> 我们比较了不同局部与全局注意力层的比例. Gemma 2 使用 1:1,Gemma 3 使用 5:1. 我们观察到改变此比例对困惑度影响极小.</p>
<blockquote>
<p>图 5: 不同 Local:Global 比例对验证集困惑度的影响. 即使 7:1 的比例,影响也微乎其微.</p>
</blockquote>
<p><strong>滑动窗口大小.</strong> 我们比较了不同滑动窗口大小对局部注意力层的影响. 滑动窗口可以显著减小而不影响困惑度.</p>
<blockquote>
<p>图 6: 不同滑动窗口大小对困惑度的影响. 考虑了两个 2B 模型,分别使用 1:1 和 1:3 的局部-全局层比例.</p>
</blockquote>
<p><strong>对 KV Cache 内存的影响.</strong> 我们展示了在 32k token 上下文推理期间,模型权重和 KV Cache 使用的内存之间的平衡. &quot;global only&quot; 配置是大多数 Dense 模型的标准配置. &quot;1:1, sw=4096&quot; 是 Gemma 2 使用的配置. 我们观察到 &quot;global only&quot; 配置导致 60% 的内存开销,而使用 1:3 和 1024 滑动窗口时减少到不足 15%.</p>
<blockquote>
<p>图 7: 32k 预填充 KV Cache 下模型与 KV Cache 内存对比. 考虑不同局部-全局比例和滑动窗口大小的 2B 模型.</p>
</blockquote>
<blockquote>
<p>图 8: KV Cache 内存随上下文长度变化. 展示了我们架构(L:G=5:1, sw=1024)与仅全局注意力 Transformer 的对比.</p>
</blockquote>
<blockquote>
<p><strong>[架构细节]</strong> 内存收益量化
Gemma 3 的 KV Cache 优化效果非常显著. 在 32k 上下文中,标准全局注意力的 KV Cache 占用了模型权重 60% 的额外内存;而 Gemma 3 的 5:1 + sw=1024 配置将这一开销压缩到不足 15%. 随着上下文继续增长,这一差距会进一步拉大——在 128k 上下文中,全局注意力的 KV Cache 可能超过模型权重本身,而 Gemma 3 的 KV Cache 仍保持可控.</p>
</blockquote>
<h3 id="5-3-qycsxw">5.3 启用长上下文</h3>
<p>我们不是从一开始就使用 128K 序列训练,而是先用 32K 序列预训练模型,然后在预训练结束时通过 RoPE rescaling 将 4B、12B 和 27B 模型扩展到 128K token. 我们发现缩放因子为 8 在实践中效果很好. 与 Gemma 2 相比,我们还增加了全局自注意力层的 RoPE 基频(从 10k 到 1M),同时保持局部自注意力层为 10k.</p>
<blockquote>
<p>图 9: 预训练模型在 RoPE rescaling 前后的长上下文性能. 模型泛化到 128K,但继续扩展时迅速退化.</p>
</blockquote>
<blockquote>
<p><strong>[局限与风险]</strong> 128K 之后的性能悬崖
论文坦诚地展示了长上下文能力的局限:模型在 128K 附近表现良好,但超过后继续扩展时「rapidly degrade&quot;. 这说明 128K 并非一个「自然」的上下文长度,而是通过位置插值强行扩展的结果. 在真实场景中,如果输入恰好超过 128K,模型性能可能出现断崖式下降.</p>
</blockquote>
<h3 id="5-4-xjs-vs-djs">5.4 小教师 vs. 大教师</h3>
<p>常见发现是,训练小模型时,从小教师蒸馏更好. 我们怀疑这是因为这些研究通常在较小教师 worse teacher 的正则化效应 surpasses 更好教师带来的收益的设置下进行. 我们用不同大小的两个教师(一大一小)训练学生,在不同训练长度下进行. 我们发现对于短训练长度,较小教师更好,但在更长训练下趋势反转.</p>
<blockquote>
<p>图 10: 使用小教师和大教师的困惑度相对差异. 较小数字表示从更大教师蒸馏更好.</p>
</blockquote>
<blockquote>
<p><strong>[实验分析]</strong> 为什么长训练下大教师更好?
这个发现很有趣:短训练时小教师的正则化效应占优(防止过拟合),但长训练时大教师的上限更高. 这暗示了蒸馏存在一个「训练长度阈值」——超过该阈值后,教师模型的能力上限成为瓶颈因素. 对于 Gemma 3 的 2T-14T token 训练规模,大教师显然是更合适的选择.</p>
</blockquote>
<h3 id="5-5-sj-encoder">5.5 视觉Encoder</h3>
<p><strong>图像分辨率的影响.</strong> 我们使用基于 SigLIP 的视觉Encoder . 视觉Encoder 保持冻结,仅训练语言模型. 多模态数据中的每张图像由视觉Encoder 的 256 个图像 token 表示. 更高分辨率的Encoder 因此使用平均池化将其输出减少到 256 个 token. 例如,896 分辨率Encoder 对其输出进行 4x4 平均池化. 如下表所示,更高分辨率Encoder 的表现优于较小分辨率.</p>
<table>
<thead>
<tr>
<th>分辨率</th>
<th>DocVQA</th>
<th>InfoVQA</th>
<th>TextVQA</th>
</tr>
</thead>
<tbody><tr>
<td>256</td>
<td>31.9</td>
<td>23.1</td>
<td>44.1</td>
</tr>
<tr>
<td>448</td>
<td>45.4</td>
<td>31.6</td>
<td>53.5</td>
</tr>
<tr>
<td>896</td>
<td>59.8</td>
<td>33.7</td>
<td>58.0</td>
</tr>
</tbody></table>
<p><strong>与 PaliGemma 2 的比较.</strong> 我们按照 PaliGemma 2 的协议对 Gemma 3 多模态预训练Checkpoint进行微调——仅扫描学习率,其余转移设置相同. 结果表明 Gemma 3 在文档理解基准上表现出色,甚至超越了更大的 PaliGemma 2 变体. 由于视觉Encoder 中的平均池化,Gemma 3 的 4B 和 12B 模型在相同 896x896 分辨率下转移成本比 PaliGemma 2 的 9B 和 27B 模型低约 10 倍. Gemma 3 在 AI2D 和 OKVQA 上也表现更好,但 PaliGemma 2 在 VQAv2 和 COCO caption 上略优.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>PaliGemma 2 2B</th>
<th>PaliGemma 2 9B</th>
<th>PaliGemma 2 27B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>DocVQA</td>
<td>81.6</td>
<td>86.3</td>
<td>85.1</td>
<td>86.1</td>
<td>89.0</td>
<td>89.5</td>
</tr>
<tr>
<td>InfoVQA</td>
<td>41.4</td>
<td>53.1</td>
<td>50.2</td>
<td>55.6</td>
<td>61.6</td>
<td>64.6</td>
</tr>
<tr>
<td>TextVQA</td>
<td>76.3</td>
<td>76.3</td>
<td>75.1</td>
<td>79.1</td>
<td>81.6</td>
<td>83.2</td>
</tr>
<tr>
<td>ChartQA</td>
<td>70.7</td>
<td>79.1</td>
<td>71.3</td>
<td>79.8</td>
<td>83.5</td>
<td>83.4</td>
</tr>
<tr>
<td>AI2D</td>
<td>76.0</td>
<td>84.4</td>
<td>84.6</td>
<td>80.9</td>
<td>85.6</td>
<td>86.5</td>
</tr>
<tr>
<td>OKVQA</td>
<td>64.1</td>
<td>68.6</td>
<td>70.6</td>
<td>65.2</td>
<td>69.3</td>
<td>71.1</td>
</tr>
<tr>
<td>CountBenchQA</td>
<td>82.0</td>
<td>85.3</td>
<td>87.4</td>
<td>79.4</td>
<td>83.5</td>
<td>87.8</td>
</tr>
<tr>
<td>COCO caption</td>
<td>143</td>
<td>145</td>
<td>145</td>
<td>143</td>
<td>143</td>
<td>144</td>
</tr>
<tr>
<td>VQAv2</td>
<td>84.8</td>
<td>85.8</td>
<td>85.8</td>
<td>84.1</td>
<td>84.9</td>
<td>85.1</td>
</tr>
<tr>
<td>Tally QA</td>
<td>80.6</td>
<td>82.4</td>
<td>82.1</td>
<td>79.0</td>
<td>81.3</td>
<td>81.7</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-tlyjl">6 讨论与结论</h2>
<p>在本工作中,我们推出了 Gemma 3,Gemma 开放语言模型家族的最新成员,支持文本、图像和代码. 本版本中,我们专注于添加图像理解和长上下文,同时提升多语言和 STEM 相关能力. 我们的模型规模和架构设计为与标准硬件兼容,大多数架构改进都针对该硬件定制,同时保持性能.</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-yxlxnxq">A 预训练性能详情</h3>
<p><strong>事实性与常识.</strong> 下表报告了新预训练基准与先前版本的性能对比:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 2 2B</th>
<th>Gemma 2 9B</th>
<th>Gemma 2 27B</th>
<th>Gemma 3 1B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>HellaSwag</td>
<td>72.9</td>
<td>81.9</td>
<td>86.4</td>
<td>62.3</td>
<td>77.2</td>
<td>84.2</td>
<td>85.6</td>
</tr>
<tr>
<td>BoolQ</td>
<td>75.6</td>
<td>77.5</td>
<td>76.2</td>
<td>63.2</td>
<td>72.3</td>
<td>78.8</td>
<td>82.4</td>
</tr>
<tr>
<td>PIQA</td>
<td>78.1</td>
<td>81.9</td>
<td>83.5</td>
<td>73.8</td>
<td>79.6</td>
<td>81.8</td>
<td>83.3</td>
</tr>
<tr>
<td>SIQA</td>
<td>51.8</td>
<td>53.3</td>
<td>53.8</td>
<td>48.9</td>
<td>51.9</td>
<td>53.4</td>
<td>54.9</td>
</tr>
<tr>
<td>TriviaQA</td>
<td>60.2</td>
<td>76.5</td>
<td>83.8</td>
<td>39.8</td>
<td>65.8</td>
<td>78.2</td>
<td>85.5</td>
</tr>
<tr>
<td>Natural Questions</td>
<td>17.2</td>
<td>29.2</td>
<td>34.7</td>
<td>9.48</td>
<td>20.0</td>
<td>31.4</td>
<td>36.1</td>
</tr>
<tr>
<td>ARC-C</td>
<td>55.8</td>
<td>69.1</td>
<td>71.4</td>
<td>38.4</td>
<td>56.2</td>
<td>68.9</td>
<td>70.6</td>
</tr>
<tr>
<td>ARC-E</td>
<td>80.6</td>
<td>88.3</td>
<td>88.6</td>
<td>73.0</td>
<td>82.4</td>
<td>88.3</td>
<td>89.0</td>
</tr>
<tr>
<td>WinoGrande</td>
<td>65.4</td>
<td>73.9</td>
<td>79.4</td>
<td>58.2</td>
<td>64.7</td>
<td>74.3</td>
<td>78.8</td>
</tr>
<tr>
<td>BBH</td>
<td>42.4</td>
<td>69.4</td>
<td>74.8</td>
<td>28.4</td>
<td>50.9</td>
<td>72.6</td>
<td>77.7</td>
</tr>
<tr>
<td>DROP</td>
<td>53.2</td>
<td>71.5</td>
<td>75.2</td>
<td>42.4</td>
<td>60.1</td>
<td>72.2</td>
<td>77.2</td>
</tr>
</tbody></table>
<p><strong>STEM 与代码.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 2 2B</th>
<th>Gemma 2 9B</th>
<th>Gemma 2 27B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>52.2</td>
<td>71.2</td>
<td>75.2</td>
<td>59.6</td>
<td>74.5</td>
<td>78.6</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>22.2</td>
<td>43.7</td>
<td>49.4</td>
<td>29.2</td>
<td>45.3</td>
<td>52.2</td>
</tr>
<tr>
<td>AGIEval</td>
<td>31.6</td>
<td>53.1</td>
<td>55.1</td>
<td>42.1</td>
<td>57.4</td>
<td>66.2</td>
</tr>
<tr>
<td>MATH</td>
<td>16.4</td>
<td>36.4</td>
<td>42.1</td>
<td>24.2</td>
<td>43.3</td>
<td>50.0</td>
</tr>
<tr>
<td>GSM8K</td>
<td>25.0</td>
<td>70.2</td>
<td>74.6</td>
<td>38.4</td>
<td>71.0</td>
<td>82.6</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>12.5</td>
<td>24.8</td>
<td>26.3</td>
<td>15.0</td>
<td>25.4</td>
<td>24.3</td>
</tr>
<tr>
<td>MBPP</td>
<td>31.0</td>
<td>51.2</td>
<td>60.8</td>
<td>46.0</td>
<td>60.4</td>
<td>65.6</td>
</tr>
<tr>
<td>HumanEval</td>
<td>19.5</td>
<td>40.2</td>
<td>51.2</td>
<td>36.0</td>
<td>45.7</td>
<td>48.8</td>
</tr>
</tbody></table>
<p><strong>图像理解.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>COCO Caption</td>
<td>102</td>
<td>111</td>
<td>116</td>
</tr>
<tr>
<td>DocVQA</td>
<td>72.8</td>
<td>82.3</td>
<td>85.6</td>
</tr>
<tr>
<td>InfoVQA</td>
<td>44.1</td>
<td>54.8</td>
<td>59.4</td>
</tr>
<tr>
<td>MMMU</td>
<td>39.2</td>
<td>50.3</td>
<td>56.1</td>
</tr>
<tr>
<td>TextVQA</td>
<td>58.9</td>
<td>66.5</td>
<td>68.6</td>
</tr>
<tr>
<td>RealWorldQA</td>
<td>45.5</td>
<td>52.2</td>
<td>53.9</td>
</tr>
<tr>
<td>ReMI</td>
<td>27.3</td>
<td>38.5</td>
<td>44.8</td>
</tr>
<tr>
<td>AI2D</td>
<td>63.2</td>
<td>75.2</td>
<td>79.0</td>
</tr>
<tr>
<td>ChartQA</td>
<td>63.6</td>
<td>74.7</td>
<td>76.3</td>
</tr>
<tr>
<td>VQAv2</td>
<td>63.9</td>
<td>71.2</td>
<td>72.9</td>
</tr>
<tr>
<td>BLINK</td>
<td>38.0</td>
<td>35.9</td>
<td>39.6</td>
</tr>
<tr>
<td>OK-VQA</td>
<td>51.0</td>
<td>58.7</td>
<td>60.2</td>
</tr>
<tr>
<td>TallyQA</td>
<td>42.5</td>
<td>51.8</td>
<td>54.3</td>
</tr>
<tr>
<td>SpatialSense VQA</td>
<td>50.9</td>
<td>60.0</td>
<td>59.4</td>
</tr>
<tr>
<td>CountBench VQA</td>
<td>26.1</td>
<td>17.8</td>
<td>68.0</td>
</tr>
</tbody></table>
<p><strong>多语言.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 2 2B</th>
<th>Gemma 2 9B</th>
<th>Gemma 2 27B</th>
<th>Gemma 3 1B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MGSM</td>
<td>18.7</td>
<td>57.3</td>
<td>68.0</td>
<td>2.04</td>
<td>34.7</td>
<td>64.3</td>
<td>74.3</td>
</tr>
<tr>
<td>GMMLU</td>
<td>43.3</td>
<td>64.0</td>
<td>69.4</td>
<td>24.9</td>
<td>57.0</td>
<td>69.4</td>
<td>75.7</td>
</tr>
<tr>
<td>WMT24++</td>
<td>38.8</td>
<td>50.3</td>
<td>53.0</td>
<td>36.7</td>
<td>48.4</td>
<td>53.9</td>
<td>55.7</td>
</tr>
<tr>
<td>FLoRes</td>
<td>30.2</td>
<td>41.3</td>
<td>44.3</td>
<td>29.5</td>
<td>39.2</td>
<td>46.0</td>
<td>48.8</td>
</tr>
<tr>
<td>XQuAD</td>
<td>53.7</td>
<td>72.2</td>
<td>73.9</td>
<td>43.9</td>
<td>68.0</td>
<td>74.5</td>
<td>76.8</td>
</tr>
<tr>
<td>ECLeKTic</td>
<td>8.29</td>
<td>14.0</td>
<td>17.1</td>
<td>4.69</td>
<td>11.0</td>
<td>17.2</td>
<td>24.4</td>
</tr>
<tr>
<td>IndicGB</td>
<td>47.4</td>
<td>59.3</td>
<td>62.1</td>
<td>41.4</td>
<td>57.2</td>
<td>61.7</td>
<td>63.4</td>
</tr>
</tbody></table>
<p><strong>长上下文.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>上下文</th>
<th>Gemma 3 PT 4B</th>
<th>Gemma 3 PT 12B</th>
<th>Gemma 3 PT 27B</th>
<th>Gemma 3 IT 4B</th>
<th>Gemma 3 IT 12B</th>
<th>Gemma 3 IT 27B</th>
</tr>
</thead>
<tbody><tr>
<td>RULER</td>
<td>32K</td>
<td>67.1</td>
<td>90.6</td>
<td>85.9</td>
<td>61.4</td>
<td>80.3</td>
<td>91.1</td>
</tr>
<tr>
<td>RULER</td>
<td>128K</td>
<td>51.7</td>
<td>80.7</td>
<td>72.9</td>
<td>46.8</td>
<td>57.1</td>
<td>66.0</td>
</tr>
<tr>
<td>MRCR</td>
<td>32K</td>
<td>44.7</td>
<td>59.8</td>
<td>63.2</td>
<td>49.8</td>
<td>53.7</td>
<td>63.2</td>
</tr>
<tr>
<td>MRCR</td>
<td>128K</td>
<td>40.6</td>
<td>56.9</td>
<td>60.0</td>
<td>44.6</td>
<td>49.8</td>
<td>59.3</td>
</tr>
</tbody></table>
<h3 id="b-it-mxxn">B IT 模型性能</h3>
<p><strong>多模态 IT 模型.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 3 IT 4B</th>
<th>Gemma 3 IT 12B</th>
<th>Gemma 3 IT 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU (val)</td>
<td>48.8</td>
<td>59.6</td>
<td>64.9</td>
</tr>
<tr>
<td>DocVQA</td>
<td>75.8</td>
<td>87.1</td>
<td>86.6</td>
</tr>
<tr>
<td>InfoVQA</td>
<td>50.0</td>
<td>64.9</td>
<td>70.6</td>
</tr>
<tr>
<td>TextVQA</td>
<td>57.8</td>
<td>67.7</td>
<td>65.1</td>
</tr>
<tr>
<td>AI2D</td>
<td>74.8</td>
<td>84.2</td>
<td>84.5</td>
</tr>
<tr>
<td>ChartQA</td>
<td>68.8</td>
<td>75.7</td>
<td>78.0</td>
</tr>
<tr>
<td>VQAv2 (val)</td>
<td>62.4</td>
<td>71.6</td>
<td>71.0</td>
</tr>
<tr>
<td>MathVista (testmini)</td>
<td>50.0</td>
<td>62.9</td>
<td>67.6</td>
</tr>
</tbody></table>
<p><strong>视频理解 IT 模型.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 3 IT 4B</th>
<th>Gemma 3 IT 12B</th>
<th>Gemma 3 IT 27B</th>
</tr>
</thead>
<tbody><tr>
<td>Perception Test MCVQA</td>
<td>50.6</td>
<td>54.9</td>
<td>58.1</td>
</tr>
<tr>
<td>ActivityNet-QA</td>
<td>46.3</td>
<td>50.4</td>
<td>52.8</td>
</tr>
</tbody></table>
<p><strong>更多 IT 基准.</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 2 2B</th>
<th>Gemma 2 9B</th>
<th>Gemma 2 27B</th>
<th>Gemma 3 1B</th>
<th>Gemma 3 4B</th>
<th>Gemma 3 12B</th>
<th>Gemma 3 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>56.1</td>
<td>71.3</td>
<td>76.2</td>
<td>38.8</td>
<td>58.1</td>
<td>71.9</td>
<td>76.9</td>
</tr>
<tr>
<td>MBPP</td>
<td>36.6</td>
<td>59.2</td>
<td>67.4</td>
<td>35.2</td>
<td>63.2</td>
<td>73.0</td>
<td>74.4</td>
</tr>
<tr>
<td>HumanEval</td>
<td>20.1</td>
<td>40.2</td>
<td>51.8</td>
<td>41.5</td>
<td>71.3</td>
<td>85.4</td>
<td>87.8</td>
</tr>
<tr>
<td>N2C</td>
<td>46.8</td>
<td>68.3</td>
<td>77.3</td>
<td>56.0</td>
<td>70.3</td>
<td>80.7</td>
<td>84.5</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>7.0</td>
<td>20.0</td>
<td>29.0</td>
<td>5.0</td>
<td>23.0</td>
<td>32.0</td>
<td>39.0</td>
</tr>
<tr>
<td>GSM8K</td>
<td>62.6</td>
<td>88.1</td>
<td>91.1</td>
<td>62.8</td>
<td>89.2</td>
<td>94.4</td>
<td>95.9</td>
</tr>
<tr>
<td>MATH</td>
<td>27.2</td>
<td>49.4</td>
<td>55.6</td>
<td>48.0</td>
<td>75.6</td>
<td>83.8</td>
<td>89.0</td>
</tr>
<tr>
<td>HiddenMath</td>
<td>2.0</td>
<td>8.0</td>
<td>12.0</td>
<td>15.0</td>
<td>42.0</td>
<td>51.0</td>
<td>56.0</td>
</tr>
<tr>
<td>BBH</td>
<td>41.4</td>
<td>69.0</td>
<td>74.9</td>
<td>39.1</td>
<td>72.2</td>
<td>85.7</td>
<td>87.6</td>
</tr>
<tr>
<td>BBEH</td>
<td>5.9</td>
<td>9.8</td>
<td>14.8</td>
<td>7.2</td>
<td>11.0</td>
<td>16.3</td>
<td>19.3</td>
</tr>
<tr>
<td>IFEval</td>
<td>80.4</td>
<td>88.4</td>
<td>91.1</td>
<td>80.2</td>
<td>90.2</td>
<td>88.9</td>
<td>90.4</td>
</tr>
<tr>
<td>GMMLU-Lite</td>
<td>41.9</td>
<td>64.8</td>
<td>68.6</td>
<td>34.2</td>
<td>54.5</td>
<td>69.5</td>
<td>75.1</td>
</tr>
<tr>
<td>ECLeKTic</td>
<td>5.3</td>
<td>11.8</td>
<td>17.6</td>
<td>1.4</td>
<td>4.6</td>
<td>10.3</td>
<td>16.7</td>
</tr>
<tr>
<td>WMT24++</td>
<td>37.4</td>
<td>48.7</td>
<td>51.7</td>
<td>35.9</td>
<td>46.8</td>
<td>51.6</td>
<td>53.4</td>
</tr>
</tbody></table>
<h3 id="c-pgxj">C 评估细节</h3>
<p><strong>文本基准评估设置.</strong></p>
<table>
<thead>
<tr>
<th>评估</th>
<th>指标</th>
<th>类型</th>
<th>n-shot</th>
<th>COT</th>
<th>归一化</th>
</tr>
</thead>
<tbody><tr>
<td>MBPP</td>
<td>pass@1</td>
<td>sampling</td>
<td>3-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>HumanEval</td>
<td>pass@1</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>HellaSwag</td>
<td>Accuracy</td>
<td>scoring</td>
<td>10-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>BoolQ</td>
<td>Accuracy</td>
<td>scoring</td>
<td>0-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>PIQA</td>
<td>Accuracy</td>
<td>scoring</td>
<td>0-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>SIQA</td>
<td>Accuracy</td>
<td>scoring</td>
<td>0-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>TriviaQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>5-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>Natural Questions</td>
<td>Accuracy</td>
<td>sampling</td>
<td>5-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>ARC-C</td>
<td>Accuracy</td>
<td>scoring</td>
<td>25-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>ARC-E</td>
<td>Accuracy</td>
<td>scoring</td>
<td>0-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>WinoGrande</td>
<td>Accuracy</td>
<td>scoring</td>
<td>5-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>BBH</td>
<td>Accuracy</td>
<td>sampling</td>
<td>few-shot</td>
<td>Yes</td>
<td></td>
</tr>
<tr>
<td>DROP</td>
<td>Token F1</td>
<td>sampling</td>
<td>1-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>AGIEval</td>
<td>Accuracy</td>
<td>sampling</td>
<td>3-5-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>MMLU</td>
<td>Accuracy</td>
<td>scoring</td>
<td>5-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>MATH</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
<td>Yes</td>
<td></td>
</tr>
<tr>
<td>GSM8K</td>
<td>Accuracy</td>
<td>sampling</td>
<td>8-shot</td>
<td>Yes</td>
<td></td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>Accuracy</td>
<td>sampling</td>
<td>5-shot</td>
<td>Yes</td>
<td></td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>Accuracy</td>
<td>sampling</td>
<td>5-shot</td>
<td>Yes</td>
<td></td>
</tr>
<tr>
<td>MGSM</td>
<td>Accuracy</td>
<td>sampling</td>
<td>8-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>FLoRes</td>
<td>CHaR F-score</td>
<td>sampling</td>
<td>1-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>Global-MMLU-Lite</td>
<td>Accuracy</td>
<td>scoring</td>
<td>5-shot</td>
<td></td>
<td>Char-Len</td>
</tr>
<tr>
<td>XQuAD</td>
<td>CHaR F-score</td>
<td>sampling</td>
<td>5-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>WMT24++</td>
<td>CHaR F-score</td>
<td>sampling</td>
<td>5-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>ECLeKTic</td>
<td>ECLeKTic score</td>
<td>sampling</td>
<td>2-shot</td>
<td></td>
<td>First-line/strip</td>
</tr>
<tr>
<td>RULER</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
<td></td>
</tr>
<tr>
<td>MRCR</td>
<td>MRCR score</td>
<td>sampling</td>
<td>few-shot</td>
<td></td>
<td></td>
</tr>
</tbody></table>
<p><strong>视觉基准评估设置.</strong></p>
<table>
<thead>
<tr>
<th>评估</th>
<th>指标</th>
<th>类型</th>
<th>n-shot</th>
</tr>
</thead>
<tbody><tr>
<td>COCO Caption</td>
<td>Cider score</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>DocVQA</td>
<td>ANLS score</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>InfographicVQA</td>
<td>ANLS score</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>MMMU</td>
<td>Accuracy</td>
<td>sampling</td>
<td>3-shot text only</td>
</tr>
<tr>
<td>TextVQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>RealWorldQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot text only</td>
</tr>
<tr>
<td>ReMI</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>AI2D</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>ChartQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>VQA v2</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>BLINK</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
</tr>
<tr>
<td>OK-VQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>TallyQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>SpatialSense VQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>4-shot</td>
</tr>
<tr>
<td>CountBench VQA</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
</tr>
</tbody></table>
<p><strong>IT 基准评估设置.</strong></p>
<table>
<thead>
<tr>
<th>评估</th>
<th>指标</th>
<th>类型</th>
<th>n-shot</th>
<th>COT</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>MBPP</td>
<td>pass@1</td>
<td>sampling</td>
<td>3-shot</td>
<td></td>
</tr>
<tr>
<td>HumanEval</td>
<td>pass@1</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>N2C</td>
<td>pass@1</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>Average over 8 samples</td>
<td>sampling</td>
<td>0-shot</td>
<td>Yes</td>
</tr>
<tr>
<td>GSM8K</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td>Yes</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td>Yes</td>
</tr>
<tr>
<td>MATH</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>HiddenMath</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>BBH</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>BBEH</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>IFEval</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>Global-MMLU-lite</td>
<td>Accuracy</td>
<td>sampling</td>
<td>0-shot</td>
<td>Yes</td>
</tr>
<tr>
<td>ECLeKTic</td>
<td>ECLeKTic score</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
<tr>
<td>WMT24++</td>
<td>CHaR F-score</td>
<td>sampling</td>
<td>0-shot</td>
<td></td>
</tr>
</tbody></table>
<hr>
<h2 id="tbsy">图表索引</h2>
<table>
<thead>
<tr>
<th>图号</th>
<th>文件名</th>
<th>描述</th>
</tr>
</thead>
<tbody><tr>
<td>图 1</td>
<td>zurich-receipt.jpg / zurich_answer.png</td>
<td>Gemma 3 27B IT 视觉交互示例</td>
</tr>
<tr>
<td>图 2-4</td>
<td>fig-radar-pt-1/2/3.pdf</td>
<td>预训练模型通用能力雷达图</td>
</tr>
<tr>
<td>图 5</td>
<td>fig-local-global.pdf</td>
<td>Local:Global 比例对困惑度影响</td>
</tr>
<tr>
<td>图 6</td>
<td>fig-sliding-window.pdf</td>
<td>滑动窗口大小对困惑度影响</td>
</tr>
<tr>
<td>图 7</td>
<td>fig-kv-cache.pdf</td>
<td>模型 vs KV Cache 内存对比</td>
</tr>
<tr>
<td>图 8</td>
<td>fig-mem-lc.pdf</td>
<td>KV Cache 内存随上下文长度变化</td>
</tr>
<tr>
<td>图 9</td>
<td>fig-long-context.png</td>
<td>RoPE rescaling 前后长上下文性能</td>
</tr>
<tr>
<td>图 10</td>
<td>fig-teachers.pdf</td>
<td>小教师 vs 大教师蒸馏效果</td>
</tr>
</tbody></table>
<hr>
<h2 id="mxcsxq">模型参数详情</h2>
<table>
<thead>
<tr>
<th>模型</th>
<th>视觉Encoder</th>
<th>嵌入参数</th>
<th>非嵌入参数</th>
<th>总参数</th>
</tr>
</thead>
<tbody><tr>
<td>1B</td>
<td>0</td>
<td>302M</td>
<td>698M</td>
<td>~1B</td>
</tr>
<tr>
<td>4B</td>
<td>417M</td>
<td>675M</td>
<td>3,209M</td>
<td>~4.3B</td>
</tr>
<tr>
<td>12B</td>
<td>417M</td>
<td>1,012M</td>
<td>10,759M</td>
<td>~12.2B</td>
</tr>
<tr>
<td>27B</td>
<td>417M</td>
<td>1,416M</td>
<td>25,600M</td>
<td>~27.4B</td>
</tr>
</tbody></table>
<hr>
<p><em>本文档由 Kimi 基于 Gemma 3 Technical Report (arXiv:2503.19786) 逐句翻译并整理. 翻译遵循「忠实原文、术语精确、中文可读」原则. 所有技术数据、表格均来自原始论文.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-mxjg","text":"2 模型架构"},{"level":3,"id":"2-1-sjmt","text":"2.1 视觉模态"},{"level":3,"id":"2-2-yxl","text":"2.2 预训练"},{"level":3,"id":"2-3-lhgzxl","text":"2.3 量化感知训练"},{"level":3,"id":"2-4-jsjcss","text":"2.4 计算基础设施"},{"level":2,"id":"3-zlwt","text":"3 指令微调"},{"level":2,"id":"4-zzmxpg","text":"4 最终模型评估"},{"level":3,"id":"4-1-lmsys-chatbot-arena","text":"4.1 LMSYS Chatbot Arena"},{"level":3,"id":"4-2-bzjzcs","text":"4.2 标准基准测试"},{"level":2,"id":"5-xrsy","text":"5 消融实验"},{"level":3,"id":"5-1-yxlnltc","text":"5.1 预训练能力探测"},{"level":3,"id":"5-2-local-global-zylc","text":"5.2 Local:Global 注意力层"},{"level":3,"id":"5-3-qycsxw","text":"5.3 启用长上下文"},{"level":3,"id":"5-4-xjs-vs-djs","text":"5.4 小教师 vs. 大教师"},{"level":3,"id":"5-5-sj-encoder","text":"5.5 视觉Encoder"},{"level":2,"id":"6-tlyjl","text":"6 讨论与结论"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-yxlxnxq","text":"A 预训练性能详情"},{"level":3,"id":"b-it-mxxn","text":"B IT 模型性能"},{"level":3,"id":"c-pgxj","text":"C 评估细节"},{"level":2,"id":"tbsy","text":"图表索引"},{"level":2,"id":"mxcsxq","text":"模型参数详情"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/03-gemma-3/01-gemma-3-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/03-gemma-3/01-gemma-3-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma 3 Technical Report 技术报告精译</h1>
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
