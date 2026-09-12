"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-o 4.5：面向实时全双工全模态交互</h1>
<blockquote>
<p><strong>论文标题</strong>: MiniCPM-o 4.5: Towards Real-Time Full-Duplex Omni-Modal Interaction<br><strong>作者</strong>: Junbo Cui, Bokai Xu, Chongyi Wang, Tianyu Yu 等 (OpenBMB / Tsinghua)<br><strong>arXiv</strong>: 2604.27393<br><strong>发表时间</strong>: 2026-04-30<br><strong>页数</strong>: 22 页<br><strong>模型规模</strong>: 9B 参数  </p>
</blockquote>
<hr>
<h2 id="1-hxgxgs">1. 核心贡献概述</h2>
<p>MiniCPM-o 4.5 是多模态大语言模型 (MLLM) 向&quot;类人交互&quot;演进的关键一步。它突破了传统轮询式交互的瓶颈, 实现了<strong>实时全双工全模态交互</strong>——模型可以在持续感知视觉和听觉输入的同时, 实时生成语音响应, 并具备<strong>主动行为</strong>(如基于场景理解的主动提醒和评论)。</p>
<p>三大核心贡献：</p>
<ol>
<li><strong>首个全双工全模态开源 LLM</strong>(9B 参数), 可在边缘设备上以 &lt;12GB RAM 实现实时全双工交互。</li>
<li><strong>视觉语言能力接近 Gemini 2.5 Flash</strong>, 在同等规模开源模型中达到 SOTA; 全模态理解和语音生成质量超越 Qwen3-Omni-30B-A3B, 且计算效率显著更高。</li>
<li><strong>提出 Omni-Flow 统一流式框架</strong>, 将多模态输入输出沿共享时间轴对齐, 为全双工和主动式多模态交互提供了通用数学形式化。</li>
</ol>
<hr>
<h2 id="2-yjbjydj">2. 研究背景与动机</h2>
<h3 id="2-1-xyjhfsdpj">2.1 现有交互范式的瓶颈</h3>
<p>当前 MLLM 的交互范式存在两个根本性限制：</p>
<ul>
<li><strong>感知与响应交替进行</strong>：模型在生成响应时无法接受新的输入信息, 导致信息流动被阻塞(Blocked-I/O)。例如, 当模型正在描述一个场景时, 如果环境中发生了新的变化, 它无法即时调整已开始的描述。</li>
<li><strong>被动响应</strong>：模型行为严格由用户请求驱动, 无法从持续变化的多模态环境中主动发起行为(如实时场景描述、主动提醒等)。</li>
</ul>
<h3 id="2-2-clxdqsgdyj">2.2 从轮询到全双工的演进</h3>
<p>如图 2 所示, AI 交互范式经历了三个阶段：</p>
<ol>
<li><strong>纯文本交互</strong>(ChatGPT、Claude 3 等)</li>
<li><strong>多模态理解与直播流式</strong>(GPT-4o、Gemini Live、Qwen3-Omni 等)</li>
<li><strong>全双工交互</strong>(MiniCPM-o 4.5)——感知与响应在时间上的 token 级别持续耦合, 听说读写并行进行</li>
</ol>
<p>全双工交互要求：</p>
<ul>
<li>感知与响应在 token 级别持续耦合, 听说读写并行而非串行</li>
<li>交互应由上下文驱动而非纯粹被动触发</li>
</ul>
<hr>
<h2 id="3-dddqmtjg">3. 端到端全模态架构</h2>
<p>MiniCPM-o 4.5 采用端到端可微架构, 所有组件通过 token 级别的隐状态连续连接, 支持联合优化。总参数量约 9B。</p>
<h3 id="3-1-jggl">3.1 架构概览</h3>
<p>三个核心组件：</p>
<ol>
<li><strong>多模态编码器</strong>：流式处理视觉和音频输入</li>
<li><strong>LLM 主干</strong>：执行全模态理解和文本生成</li>
<li><strong>语音解码器</strong>：包括交错语音 token 解码器(自回归生成离散语音 token)和流式流匹配解码器(将 token 转为音频波形)</li>
</ol>
<p>所有可学习组件(从多模态编码器到语音 token 解码器)总计约 9B 参数, 均为端到端可微连接。</p>
<h3 id="3-2-sjbm">3.2 视觉编码</h3>
<p>采用 <strong>LLaVA-UHD</strong> 图像切分策略：</p>
<ul>
<li>全双工流式模式：最大分辨率 448×448</li>
<li>普通模式：最大分辨率 2240×2240</li>
<li>每张图像先切分为切片, 每切片经 <strong>SigLIP ViT (0.4B)</strong> 编码为 1024 个 token</li>
<li>通过 Resampler 模块压缩为 64 个 token, 实现 <strong>16× 压缩率</strong></li>
<li>远高于常见的 4× 压缩(如 Qwen3-Omni、Qwen3-VL), 大幅降低视觉处理开销</li>
</ul>
<h3 id="3-3-ypbm">3.3 音频编码</h3>
<ul>
<li><strong>Whisper Medium 编码器 (0.3B)</strong>, 以 chunk-based 流式方式编码输入音频</li>
<li>每秒产生 50 个特征 token</li>
<li>经两层 MLP projector 进行 <strong>5× 时间压缩</strong>, 最终每秒 10 个音频 token 输入 LLM</li>
</ul>
<h3 id="3-4-wbjmy-llm-zg">3.4 文本解码与 LLM 主干</h3>
<ul>
<li><strong>Qwen3-8B</strong> 作为 LLM 主干</li>
<li>关键设计：LLM 只生成文本 token, 不直接生成语音 token</li>
<li>实时全双工交互时, LLM 仅需每秒 3-4 个解码步(人类语速)</li>
<li>避免了直接生成语音 token(通常每秒约 25 个 token)带来的效率瓶颈和语言能力退化问题</li>
</ul>
<h3 id="3-5-yy-token-sc">3.5 语音 Token 生成</h3>
<ul>
<li>轻量级 <strong>Llama 语音 token 解码器 (~0.3B)</strong></li>
<li>每个文本 token 的 LLM 隐状态(经 MLP 重塑)与语音解码器状态求和, 生成 <strong>S3 语义 token</strong></li>
<li>LLM 主干预先编码韵律决策, 小语音解码器专注于语音建模</li>
<li>输入文本 token 和输出语音 token 以时间对齐方式交错, 确保语音与并发环境紧密耦合</li>
</ul>
<h3 id="3-6-bxhc">3.6 波形合成</h3>
<ul>
<li><strong>流式流匹配解码器</strong> 将 S3 token 转换为音频波形</li>
<li>支持基于多模态系统提示中参考音频的语音克隆</li>
</ul>
<hr>
<h2 id="4-omni-flow-tylskj">4. Omni-Flow：统一流式框架</h2>
<p>Omni-Flow 是 MiniCPM-o 4.5 的核心技术创新。它将传统轮询式交互转化为<strong>连续全双工、时间对齐</strong>的交互过程。</p>
<h3 id="4-1-sjdql-time-aligned-streams">4.1 时间对齐流(Time-Aligned Streams)</h3>
<p>Omni-Flow 识别出三个时间对齐的流：</p>
<ol>
<li><strong>env-visual</strong>：环境的实时视觉观察(视频流)</li>
<li><strong>env-audio</strong>：声学场景, 包括用户语音(当存在时)</li>
<li><strong>out-stream</strong>：助手的文本和语音输出</li>
</ol>
<p>在此视角下, 用户请求不再是特权会话角色, 而是 env-audio 流的一部分。模型无需区分&quot;用户说话&quot;与&quot;环境声音&quot;, 只需将一切视为沿时间轴到达的信号。</p>
<h3 id="4-2-sffy-time-division-multiplexing">4.2 时分复用(Time-Division Multiplexing)</h3>
<p>受通信领域时分复用技术启发, Omni-Flow 将连续交互切分为持续时间为 t 的细粒度时间窗口。</p>
<ul>
<li>每个窗口内, 模型整合新到达的信号, 同时产生下一步输出</li>
<li>传统轮询被转化为一系列时间局部更新</li>
<li>当 t 足够小时, 感知与响应在时间上紧密耦合, 自然逼近全双工行为</li>
</ul>
<p><strong>关键设计决策</strong>(通过消融实验验证)：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>变体</th>
<th>最优选择</th>
<th>理由</th>
</tr>
</thead>
<tbody><tr>
<td>时间粒度</td>
<td>0.35s / 0.56s / <strong>1.0s</strong></td>
<td><strong>1.0s</strong></td>
<td>过小导致每块建模预算不足, 决策不稳定</td>
</tr>
<tr>
<td>边界显式标记</td>
<td>隐式 / <strong>显式</strong></td>
<td><strong>显式</strong></td>
<td>区分新输入与新输出是非平凡问题, 显式标记降低模型负担</td>
</tr>
<tr>
<td>交互控制与内容生成</td>
<td>LT(联合预测)/ <strong>LS(分离预测)</strong></td>
<td><strong>LS</strong></td>
<td>&quot;是否说话&quot;与&quot;说什么&quot;应解耦, 单步联合预测使全双工更难学习</td>
</tr>
</tbody></table>
<h3 id="4-3-zdhw-proactive-behavior">4.3 主动行为(Proactive Behavior)</h3>
<p>现有 MLLM 严格被动响应。Omni-Flow 使主动行为能在同一交互循环中自然涌现：</p>
<ul>
<li>模型持续感知环境流, 可在无显式用户请求时识别需要关注的事件</li>
<li>例如：当视觉流显示特定场景变化时, 模型可主动发出提醒或评论</li>
<li>支持连续场景描述、主动提醒等高级能力</li>
</ul>
<h3 id="4-4-sjdqjcyysc-tail">4.4 时间对齐交错语音生成(TAIL)</h3>
<p>这是 Omni-Flow 中最精妙的设计之一, 解决<strong>语音输出与最新观察上下文的时间对齐</strong>问题。</p>
<p><strong>问题</strong>：文本生成时间与语音播放时间不匹配。如果 m 秒内生成的文本需要远超 m 秒才能朗读完, 语音流会逐渐滞后于模型的最新状态。</p>
<p><strong>现有策略的缺陷</strong>(见图 5)：</p>
<ul>
<li><strong>非交错生成</strong>：先生成一大段文本, 再合成语音 → 文本大幅领先播放</li>
<li><strong>固定文本-语音比例交错</strong>：假设文本 token 与语音时长呈固定对应关系 → 无法适应变长发音</li>
</ul>
<p><strong>TAIL 方案</strong>：</p>
<ul>
<li>chunk-wise 语音生成策略, 自适应控制每步生成多少文本</li>
<li>在第 k 个 chunk, 模型调整生成文本量, 使得朗读新内容后, 语音流接近当前时间边界 kt</li>
<li>如果前面 chunk 已引入轻微播放延迟, 当前 chunk 可自适应生成更少文本 token 让语音追赶</li>
<li><strong>有界前瞻机制</strong>：chunk k 中最后几个文本 token 的语音 token 推迟到 chunk k+1, 为发音和韵律提供局部上下文, 同时不让文本流大幅超前</li>
</ul>
<p><strong>TAIL 监督构造</strong>：从全双工流式训练数据中收集每个文本 token 的起止时间, 将起止时间落入 [(k-1)t, kt) 的 token 及其语音 token 分配给第 k 个 Omni-Flow chunk。这教导模型学习历史依赖的交错模式。</p>
<hr>
<h2 id="5-sjgc">5. 数据工程</h2>
<h3 id="5-1-yysj">5.1 语音数据</h3>
<ul>
<li><strong>大规模自然语音数据</strong>：数百万小时无标签语音, 经开源工具链处理, 用于零样本 TTS、ASR、多轮多说话人对话</li>
<li><strong>口语对话数据</strong>：<ul>
<li>先用文本 LLM 生成口语化、指令遵循的对话</li>
<li>子集由专业配音演员在录音棚重新录制</li>
<li>演员以对话风格而非照本宣科, 在统一声线下变化情绪、语速、重音</li>
<li>覆盖指令遵循 TTS、问答、多轮自然对话</li>
</ul>
</li>
</ul>
<h3 id="5-2-sjyysj">5.2 视觉语言数据</h3>
<p>在 MiniCPM-V 4.5 数据系统基础上扩展：</p>
<ul>
<li><strong>高质量知识与对齐数据</strong>：升级 CapsFusion 生成器, 合成更多信息量图像描述; 改进图像-文本相关性估计的过滤流程</li>
<li><strong>复杂文档与 OCR 数据</strong>：采用<strong>相关性感知掩码策略</strong>——优先掩码与图表更相关的文本区域, 促使模型关注视觉锚定内容</li>
<li><strong>真实场景数据</strong>：引入更自然多样的查询模式; 将简短直接回答样本改写为详细的 CoT 风格推理; 基于奖励模型的过滤确保数据质量</li>
<li><strong>密集视频感知数据</strong>：构建密集视频描述数据集, 提供时间事件、人类动作、复杂场景转换的连续细粒度描述</li>
<li><strong>纯文本数据</strong>：引入 MiniCPM 4.1 后训练数据集中高质量文本指令数据</li>
</ul>
<h3 id="5-3-qmtqsgsj">5.3 全模态全双工数据</h3>
<ul>
<li><strong>大规模网络音视频数据</strong>：过滤掉单说话人主导或音画相关性弱的片段; 应用 OCR 字幕去除、说话人检测、ASR 转录过滤</li>
<li><strong>全双工任务数据</strong>：手动构建多场景并标注指令遵循数据, 支持连续场景描述、主动提醒等高级能力</li>
<li>每个训练样本包含完整视觉输入、音频输入、输出文本、输出语音, 均带时间索引</li>
</ul>
<hr>
<h2 id="6-xlcl">6. 训练策略</h2>
<p>基于 MiniCPM-V 4.5 预训练检查点, 分四阶段渐进式整合语音能力：</p>
<h3 id="6-1-yyyxl-speech-pretraining">6.1 语音预训练(Speech Pretraining)</h3>
<ul>
<li>初始化：Whisper 编码器 + MiniCPM-V 4.5 预训练检查点 + 随机初始化的语音相关模块(音频 projector、LLM-to-speech projector、语音解码器)</li>
<li><strong>冻结预训练组件</strong>, 只更新新增模块</li>
<li>目标：将 Whisper 特征与 LLM 隐空间对齐; 训练语音解码器将 LLM 隐状态转换为语义和韵律基础的语音 token</li>
</ul>
<h3 id="6-2-lhyxl-joint-pretraining">6.2 联合预训练(Joint Pretraining)</h3>
<ul>
<li><strong>解冻全部参数</strong>, 在视觉语言、语音、全模态数据的平衡混合上训练</li>
<li>为稳定优化, 不同模态组合分配给不同数据并行 rank, 确保每步固定数据比例</li>
<li>包含传统轮询样本和主动/全双工交互数据</li>
<li>文本 token 与语音、视觉信号在共享时间轴上对齐</li>
<li>统一 next-token prediction 目标</li>
</ul>
<h3 id="6-3-lhjdwt-joint-sft">6.3 联合监督微调(Joint SFT)</h3>
<p>两阶段：</p>
<ol>
<li><strong>大规模指令微调</strong>：广泛能力适应</li>
<li><strong>高质量人工标注微调</strong>：细粒度行为优化</li>
</ol>
<p>灵活的质量-效率权衡：全模态数据以不同分辨率和帧率增强, 最大帧分辨率随机设为 0.2-0.4 百万像素, 帧率从 1-5 FPS 均匀采样。</p>
<h3 id="6-4-qhxx-rl">6.4 强化学习(RL)</h3>
<ul>
<li><strong>GRPO</strong>：增强推理和指令遵循能力<ul>
<li>准确性奖励：规则验证 + 高效 judge 模型</li>
<li>格式奖励</li>
<li><strong>平滑长度奖励</strong>(改编自 Kimi-K1.5)：<ul>
<li>避免奖励短错误回答(min(0, si))</li>
<li>τ 缩放回应当长度差异较小时</li>
<li>前 480 步不包含长度奖励以确保收敛</li>
</ul>
</li>
</ul>
</li>
<li><strong>通用奖励模型</strong>：提升回答质量, 抑制意外代码混合</li>
<li><strong>RLAIF-V</strong>：减少视觉场景幻觉, 发现图像-文本数据上学到的幻觉缓解可有效迁移到流式设置</li>
</ul>
<p><strong>长度奖励消融</strong>(表 9)：</p>
<ul>
<li>Kimi K1.5 风格：thinking 模式长度减少 50.7%, 但 benchmark 均值从 73.5 降至 73.0</li>
<li>本文方法：thinking 模式长度减少 35.3%, benchmark 均值提升至 74.3</li>
<li>训练曲线显示 K1.5 风格在后期出现明显减速甚至轻微退化</li>
</ul>
<hr>
<h2 id="7-syjgyfx">7. 实验结果与分析</h2>
<h3 id="7-1-pgwd">7.1 评估维度</h3>
<p>四大能力组：</p>
<ol>
<li><strong>视觉语言理解</strong>：STEM/通用推理、文档/OCR、多图理解、幻觉、视频理解</li>
<li><strong>语音理解与生成</strong>：ASR、语音翻译、音频理解、语音问答、语音生成</li>
<li><strong>文本能力</strong>：与骨干 LLM 对比, 评估多模态训练是否保留语言能力</li>
<li><strong>全模态流式交互</strong>：轮询全模态理解 + 全双工流式交互</li>
</ol>
<h3 id="7-2-sjyyjg">7.2 视觉语言结果</h3>
<p><strong>Instruct 模式</strong>(表 2)：</p>
<ul>
<li><strong>OpenCompass 综合</strong>：77.6, 接近 Gemini 2.5 Flash (78.5), 超越 Qwen3-Omni-30B-A3B (75.7)</li>
<li><strong>MMBench EN v1.1</strong>：87.6, 超越所有对比模型(包括 Gemini 2.5 Flash 86.6)</li>
<li><strong>MathVista</strong>：80.1, 超越所有对比模型</li>
<li><strong>OCR 与文档</strong>：OmniDocBench (EN) 0.109, 显著优于 Qwen3-Omni-30B-A3B (0.216)</li>
<li><strong>多图理解</strong>：MMSI-Bench 16.6, 超越所有对比模型</li>
<li><strong>视频理解</strong>：MLVU 76.5, 接近 Qwen3-VL (78.1); Video-MME (无字幕) 70.4</li>
</ul>
<p><strong>Thinking 模式</strong>(表 3)：</p>
<ul>
<li>OpenCompass 78.2, MMBench EN v1.1 89.0, 进一步拉开差距</li>
</ul>
<h3 id="7-3-yyjg">7.3 语音结果</h3>
<p><strong>音频理解</strong>(表 4)：</p>
<ul>
<li>ASR：中英文基准接近领先水平, GigaSpeech (8.5) 和 VoxPopuli (6.2) 最优</li>
<li>语义语音任务优势更明显：CoVoST 2 en→zh (49.9)、MELD (60.2)、VoiceBench AlpacaEval (4.81)、Speech TriviaQA (75.5) 均为最优</li>
</ul>
<p><strong>语音生成</strong>(表 5)：</p>
<ul>
<li>SeedTTS Test-ZH CER 0.86, SeedTTS Test-EN WER 2.38, 均为最低</li>
<li>LongTTS 英文 WER 3.37, 远低于 CosyVoice2 (14.80) 和 Qwen3-Omni (17.33)</li>
<li>Expresso (29.8) 和 ESD (82.1) 情感和风格控制最优</li>
</ul>
<h3 id="7-4-wbjg">7.4 文本结果</h3>
<p>(表 6)MiniCPM-o 4.5 在多数纯文本任务上超越其骨干 Qwen3-8B-Instruct：</p>
<ul>
<li>IFEval-PLS 84.7 (vs 83.0)</li>
<li>BBH 81.1 (vs 69.4)</li>
<li>GSM8K 94.5 (vs 93.4)</li>
<li>平均值 82.1 (vs 81.6)</li>
</ul>
<p>这表明策略性的文本与多模态数据平衡使模型在获得强多模态能力的同时保留了文本能力。</p>
<h3 id="7-5-qmtylsjg">7.5 全模态与流式结果</h3>
<p><strong>全模态理解</strong>(表 7, simplex 设置)：</p>
<ul>
<li>Daily-Omni 80.2、WorldSense 55.7、Video-Holmes 64.3、JointAVBench 60.0、AVUT-Human 78.6 —— 均为最优</li>
<li>7 个基准中 5 个第一, 超越 Gemini 2.5 Flash 和 Qwen3-Omni-30B-A3B</li>
</ul>
<p><strong>全双工结果</strong>(表 8)：</p>
<ul>
<li>LiveSports-3K-CC：win rate 54.4, 超越 LiveCC (41.5) 和 StreamingVLM (45.6)</li>
<li>证明 Omni-Flow 对连续视觉交互有效：沿共享时间轴组织感知和响应, 使模型响应更好地锚定于演进场景</li>
</ul>
<h3 id="7-6-tlxs">7.6 推理效率</h3>
<p><strong>与 Qwen3-Omni-30B-A3B 对比</strong>(RTX 4090 + vLLM, 表 11)：</p>
<ul>
<li>BF16：Qwen3-Omni OOM; MiniCPM-o 4.5 达 154.3 tokens/s, 显存 19GB</li>
<li>INT4：MiniCPM-o 4.5 达 212.3 tokens/s, 首 token 延迟 0.58s, 显存 11GB(Qwen3-Omni 为 147.8 tokens/s、0.98s、20GB)</li>
</ul>
<p><strong>llama.cpp-omni</strong>(自研推理框架, 表 12)：</p>
<ul>
<li>RTX 4090 INT4：RTF 0.21, 显存 11GB</li>
<li>DGX Spark INT4：RTF 0.20, 显存 11GB</li>
<li>支持 macOS、Windows、Linux</li>
<li>&lt;12GB RAM 即可实现实时全双工交互</li>
</ul>
<h3 id="7-7-yyscmsdb">7.7 语音生成模式对比</h3>
<p>(表 10)三种语音生成模式对比：</p>
<ul>
<li><strong>非交错生成</strong>：SeedTTS ZH CER 1.44, EN WER 2.70</li>
<li><strong>固定文本交错</strong>：ZH CER 0.86, EN WER 2.38(最优, chunked 流式生成提升发音精度)</li>
<li><strong>TAIL 动态文本交错</strong>：ZH CER 1.04, EN WER 3.93(为全双工时间对齐牺牲少许识别精度, 维持合理的整体语音质量)</li>
</ul>
<hr>
<h2 id="8-jxxywlgz">8. 局限性与未来工作</h2>
<ol>
<li><strong>长时动态真实世界流式交互</strong>：基础能力和鲁棒性仍需改进和验证</li>
<li><strong>全模态流式语音生成稳定性</strong>：偶有发音错误或中英意外混合</li>
<li><strong>网络 demo 延迟</strong>：不稳定网络下可能出现延迟增加或输出片段丢失; 本地部署(llama.cpp-omni)可更好支持平滑实时交互</li>
<li><strong>主动行为相对简单</strong>：更丰富的上下文感知规划和自主协助留待未来工作</li>
</ol>
<hr>
<h2 id="9-yzps">9. 译者评述</h2>
<h3 id="9-1-fstpyy">9.1 范式突破意义</h3>
<p>MiniCPM-o 4.5 最大的价值不在于某一项 benchmark 分数, 而在于它证明了<strong>全双工多模态交互在端侧的可行性</strong>。这不仅是工程上的胜利, 更是交互范式的升级：</p>
<ul>
<li>从&quot;我说一句、你回一句&quot;到&quot;我们同时说、同时看、同时听&quot;</li>
<li>从&quot;我问你才答&quot;到&quot;你主动告诉我该注意什么&quot;</li>
</ul>
<p>这种变化类似于从拨号上网到宽带、从功能机到智能机的跨越——不是量变, 是质变。</p>
<h3 id="9-2-omni-flow-dsjzh">9.2 Omni-Flow 的设计智慧</h3>
<p>Omni-Flow 框架体现了通信工程思维在 AI 架构设计中的成功迁移：</p>
<ul>
<li><strong>时分复用</strong>：将连续交互切分为时间窗口, 每个窗口内感知与生成并行</li>
<li><strong>LS(Listen-Speak 分离)</strong>：将&quot;是否说话&quot;与&quot;说什么&quot;解耦, 类似操作系统的 I/O 分离设计</li>
<li><strong>TAIL</strong>：用历史依赖的自适应交错解决文本-语音时间对齐问题, 是典型控制论思维</li>
</ul>
<h3 id="9-3-dcbsdgckl">9.3 端侧部署的工程考量</h3>
<p>论文在效率上的数据非常亮眼：</p>
<ul>
<li>9B 参数 vs Qwen3-Omni-30B-A3B, BF16 下后者直接 OOM</li>
<li>INT4 量化后 212 tokens/s + 11GB 显存, 说明架构设计(16× 视觉压缩、LLM 不直接生成语音 token)的优化空间被充分挖掘</li>
<li>llama.cpp-omni 的跨平台支持(macOS/Windows/Linux)意味着消费级硬件即可体验</li>
</ul>
<h3 id="9-4-y-mini-cpm-xldyxx">9.4 与 MiniCPM 系列的延续性</h3>
<p>MiniCPM-o 4.5 是系列技术的集大成者：</p>
<ul>
<li>视觉：继承 V-4.5 的 LLaVA-UHD + 16× Resampler 压缩</li>
<li>文本：基于 Qwen3-8B + MiniCPM 4.1 的后训练数据</li>
<li>语音：端到端可微架构 + S3 token + 流匹配解码</li>
<li>训练：四阶段渐进式策略(预训练→联合预训练→SFT→RL), 与 4.0/4.1 一脉相承</li>
</ul>
<h3 id="9-5-djjwt">9.5 待解决问题</h3>
<ul>
<li><strong>TAIL 的精度-对齐权衡</strong>：表 10 显示 TAIL 的 WER 明显高于固定交错模式, 说明&quot;说得好&quot;和&quot;说得及时&quot;在全双工场景下存在固有 tension</li>
<li><strong>主动行为的&quot;度&quot;</strong>：论文坦承主动行为仍相对简单, 如何避免&quot;过度主动&quot;(频繁打断、 irrelevant 提醒)是产品化关键</li>
<li><strong>长时稳定性</strong>：22 页论文主要展示 benchmark 结果, 真实世界几小时连续交互的稳定性尚未充分验证</li>
</ul>
<hr>
<blockquote>
<p><strong>翻译说明</strong>: 本文基于 arXiv:2604.27393 技术报告全文精译, 所有技术术语、数据表格、实验结论均忠实于原文。关键创新点(Omni-Flow、TAIL、LS 解耦)的翻译经过反复推敲, 力求在准确性与可读性之间取得平衡。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxgxgs","text":"1. 核心贡献概述"},{"level":2,"id":"2-yjbjydj","text":"2. 研究背景与动机"},{"level":3,"id":"2-1-xyjhfsdpj","text":"2.1 现有交互范式的瓶颈"},{"level":3,"id":"2-2-clxdqsgdyj","text":"2.2 从轮询到全双工的演进"},{"level":2,"id":"3-dddqmtjg","text":"3. 端到端全模态架构"},{"level":3,"id":"3-1-jggl","text":"3.1 架构概览"},{"level":3,"id":"3-2-sjbm","text":"3.2 视觉编码"},{"level":3,"id":"3-3-ypbm","text":"3.3 音频编码"},{"level":3,"id":"3-4-wbjmy-llm-zg","text":"3.4 文本解码与 LLM 主干"},{"level":3,"id":"3-5-yy-token-sc","text":"3.5 语音 Token 生成"},{"level":3,"id":"3-6-bxhc","text":"3.6 波形合成"},{"level":2,"id":"4-omni-flow-tylskj","text":"4. Omni-Flow：统一流式框架"},{"level":3,"id":"4-1-sjdql-time-aligned-streams","text":"4.1 时间对齐流(Time-Aligned Streams)"},{"level":3,"id":"4-2-sffy-time-division-multiplexing","text":"4.2 时分复用(Time-Division Multiplexing)"},{"level":3,"id":"4-3-zdhw-proactive-behavior","text":"4.3 主动行为(Proactive Behavior)"},{"level":3,"id":"4-4-sjdqjcyysc-tail","text":"4.4 时间对齐交错语音生成(TAIL)"},{"level":2,"id":"5-sjgc","text":"5. 数据工程"},{"level":3,"id":"5-1-yysj","text":"5.1 语音数据"},{"level":3,"id":"5-2-sjyysj","text":"5.2 视觉语言数据"},{"level":3,"id":"5-3-qmtqsgsj","text":"5.3 全模态全双工数据"},{"level":2,"id":"6-xlcl","text":"6. 训练策略"},{"level":3,"id":"6-1-yyyxl-speech-pretraining","text":"6.1 语音预训练(Speech Pretraining)"},{"level":3,"id":"6-2-lhyxl-joint-pretraining","text":"6.2 联合预训练(Joint Pretraining)"},{"level":3,"id":"6-3-lhjdwt-joint-sft","text":"6.3 联合监督微调(Joint SFT)"},{"level":3,"id":"6-4-qhxx-rl","text":"6.4 强化学习(RL)"},{"level":2,"id":"7-syjgyfx","text":"7. 实验结果与分析"},{"level":3,"id":"7-1-pgwd","text":"7.1 评估维度"},{"level":3,"id":"7-2-sjyyjg","text":"7.2 视觉语言结果"},{"level":3,"id":"7-3-yyjg","text":"7.3 语音结果"},{"level":3,"id":"7-4-wbjg","text":"7.4 文本结果"},{"level":3,"id":"7-5-qmtylsjg","text":"7.5 全模态与流式结果"},{"level":3,"id":"7-6-tlxs","text":"7.6 推理效率"},{"level":3,"id":"7-7-yyscmsdb","text":"7.7 语音生成模式对比"},{"level":2,"id":"8-jxxywlgz","text":"8. 局限性与未来工作"},{"level":2,"id":"9-yzps","text":"9. 译者评述"},{"level":3,"id":"9-1-fstpyy","text":"9.1 范式突破意义"},{"level":3,"id":"9-2-omni-flow-dsjzh","text":"9.2 Omni-Flow 的设计智慧"},{"level":3,"id":"9-3-dcbsdgckl","text":"9.3 端侧部署的工程考量"},{"level":3,"id":"9-4-y-mini-cpm-xldyxx","text":"9.4 与 MiniCPM 系列的延续性"},{"level":3,"id":"9-5-djjwt","text":"9.5 待解决问题"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/15-mini-cpm-o-4.5/01-mini-cpm-o-4.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/15-mini-cpm-o-4.5/01-mini-cpm-o-4.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-o 4.5 技术报告精译：面向实时全双工全模态交互</h1>
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
