"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 4: 原生多模态 MoE 模型的技术解读</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Meta 官方 Model Card、GitHub 开源代码 (llama-models)、Meta AI 博客、以及社区公开资料。Llama 4 暂未发布正式 arXiv 技术报告,本文基于官方已公开的技术细节进行系统性梳理与解读。</p>
</blockquote>
<hr>
<h2 id="zyyhxld">摘要与核心亮点</h2>
<p>Llama 4 是 Meta 于 2025 年 4 月发布的下一代开源大模型家族,标志着 Llama 生态进入「原生多模态 + Mixture-of-Experts (MoE)」的新纪元。与 Llama 3 的 Dense 架构不同,Llama 4 全系采用 MoE 架构,在保持极高推理效率的同时大幅扩展了模型容量。</p>
<p>本次公开发布包含两个可直接使用的模型:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>激活参数量</th>
<th>总参数量</th>
<th>Expert 数量</th>
<th>上下文长度</th>
<th>预训练 Token 量</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Llama 4 Scout</strong></td>
<td>17B</td>
<td>109B</td>
<td>16</td>
<td><strong>10M</strong></td>
<td>~40T</td>
</tr>
<tr>
<td><strong>Llama 4 Maverick</strong></td>
<td>17B</td>
<td>400B</td>
<td>128</td>
<td><strong>1M</strong></td>
<td>~22T</td>
</tr>
</tbody></table>
<p>此外,Meta 还 preview 了一个规模更大的教师模型 <strong>Llama 4 Behemoth</strong> (288B 激活 / 2T 总参,16 experts),目前仍在训练中,未来可能作为蒸馏源模型使用。</p>
<p><strong>核心创新点:</strong></p>
<ol>
<li><strong>原生多模态 (Native Multimodality)</strong>: 采用 Early Fusion 设计,在预训练阶段即将文本与视觉 token 融合到统一的主干网络中,而非后期拼接适配器。</li>
<li><strong>MoE 架构</strong>: 交替使用 Dense 层与 MoE 层,每个 token 仅激活一个 routed expert 加一个 shared expert,在 17B 激活参数下实现了 109B~400B 的总容量。</li>
<li><strong>超长上下文</strong>: Scout 支持业界领先的 <strong>1000 万 (10M) token</strong> 上下文窗口,通过 iRoPE 架构与注意力温度调节实现长度外推。</li>
<li><strong>训练规模</strong>: Scout 在约 40 万亿 token 上预训练,Maverick 在约 22 万亿 token 上预训练,数据量远超 Llama 3 的 15T。</li>
<li><strong>推理效率</strong>: Scout 经 Int4 量化后可放入单张 H100 GPU;Maverick 的 FP8 量化版本可放入单台 H100 DGX host。</li>
</ol>
<hr>
<h2 id="1-mxjgsj">1. 模型架构设计</h2>
<h3 id="1-1-moe-jg-jt-dense-yxsc">1.1 MoE 架构: 交替 Dense 与稀疏层</h3>
<p>Llama 4 的语言模型主干采用 MoE 架构,核心设计遵循以下原则 (从 GitHub 源码 <code>args.py</code> 与 <code>moe.py</code> 分析得出):</p>
<pre><code class="language-mermaid">flowchart TD
    Input[输入 Token Embedding] --&gt; T1[Transformer Layer 1&lt;br/&gt;Dense FFN]
    T1 --&gt; T2[Transformer Layer 2&lt;br/&gt;MoE Layer]
    T2 --&gt; T3[Transformer Layer 3&lt;br/&gt;Dense FFN]
    T3 --&gt; T4[Transformer Layer 4&lt;br/&gt;MoE Layer]
    T4 --&gt; T5[...]
    T5 --&gt; Tn[Transformer Layer N]
    Tn --&gt; Output[输出 Logits]

    subgraph MoE_Detail [MoE Layer 内部结构]
        direction TB
        Router[Router&lt;br/&gt;选择 Top-1 Expert] --&gt; E1[Expert 1]
        Router --&gt; E2[Expert 2]
        Router --&gt; Ek[Expert K&lt;br/&gt;K=16 or 128]
        E1 --&gt; Comb[加权组合]
        E2 --&gt; Comb
        Ek --&gt; Comb
        Shared[Shared Expert&lt;br/&gt;始终激活] --&gt; Comb
    end

    T2 -.-&gt; MoE_Detail
    T4 -.-&gt; MoE_Detail
</code></pre>
<ul>
<li><strong>交替层设计 (interleave_moe_layer_step=1)</strong>: 每隔一层设置一个 MoE 层,中间夹杂 Dense FFN 层。这种设计在计算效率与模型容量之间取得平衡。</li>
<li><strong>Top-K 路由 (top_k=1)</strong>: 每个 token 仅路由到 <strong>1 个专家</strong> 进行处理,外加一个始终激活的 shared expert。这意味着每个 token 实际激活的参数量约为 <code>shared_expert + 1 * routed_expert</code>。</li>
<li><strong>容量因子 (capacity_factor=1.0)</strong>: 控制每个 expert 可处理的 token 数量上限,避免负载极端不均衡。</li>
<li><strong>自动缩放 (auto_scale_F=True)</strong>: 自动调整 hidden_dim,使得 MoE 层的激活参数量与等价的 Dense 层相当,便于公平比较不同架构的计算量。</li>
<li><strong>SwiGLU 激活</strong>: MoE 层内部采用 SwiGLU 激活函数,与 Llama 3 保持一致。</li>
</ul>
<pre><code class="language-python"># 来自 llama-models/models/llama4/args.py
class MoEArgs(BaseModel):
    num_experts: int = -1
    capacity_factor: float = 1.0
    auto_scale_F: bool = True
    top_k: int = 1
    interleave_moe_layer_step: int = 1
</code></pre>
<blockquote>
<p><strong>Thinking (Architecture &amp; Implementation)</strong>: Llama 4 选择 top_k=1 的极端稀疏路由策略,这与其他 MoE 模型 (如 Mixtral 的 top_k=2, DeepSeek-V3 的 top_k+shared) 形成对比。top_k=1 的优势在于推理时 KV Cache 和计算量最小化,但也对路由器的负载均衡提出了更高要求。交替 dense/MoE 层的设计让模型在部分层保持全连接计算 (有利于捕获全局模式),部分层利用稀疏专家 (有利于学习多样化子空间),这是一种务实的折中。</p>
</blockquote>
<h3 id="1-2-csxw-i-ro-pe-yzylwdtj">1.2 长上下文: iRoPE 与注意力温度调节</h3>
<p>Llama 4 Scout 的 10M 上下文窗口是其最引人注目的技术特性之一。实现这一能力的关键技术包括:</p>
<p><strong>Scaled RoPE (仅 Scout 使用)</strong></p>
<p>Scout 采用 Scaled Rotary Position Embedding,通过频率缩放实现长度外推。源码中的关键参数为:</p>
<ul>
<li><code>rope_scaling_factor = 16</code></li>
<li><code>rope_high_freq_factor = 1</code></li>
<li><code>rope_theta = 500000</code></li>
</ul>
<p>缩放策略采用 YaRN 风格的平滑插值:对高频分量 (短波长) 不做处理,对低频分量 (长波长) 按 <code>scale_factor</code> 压缩,中间频率区域做线性平滑过渡。</p>
<pre><code class="language-python"># 来自 llama-models/models/llama4/model.py
def apply_scaling(freqs, scale_factor, high_freq_factor):
    low_freq_factor = 1
    old_context_len = 8192
    low_freq_wavelen = old_context_len / low_freq_factor
    high_freq_wavelen = old_context_len / high_freq_factor
    for freq in freqs:
        wavelen = 2 * math.pi / freq
        if wavelen &lt; high_freq_wavelen:
            new_freqs.append(freq)
        elif wavelen &gt; low_freq_wavelen:
            new_freqs.append(freq / scale_factor)
        else:
            smooth = (old_context_len / wavelen - low_freq_factor) / (high_freq_factor - low_freq_factor)
            new_freqs.append((1 - smooth) * freq / scale_factor + smooth * freq)
</code></pre>
<p><strong>NOPE 层 (No Position Encoding layers)</strong></p>
<p>源码中出现了 <code>nope_layer_interval</code> 参数,表明部分 attention 层可能不使用位置编码。这与 DeepSeek-V2/V3 的 MLA 中去除位置编码的设计思路类似,目的是在长序列中减少位置编码带来的噪声累积。</p>
<p><strong>注意力温度调节 (Attention Temperature Tuning)</strong></p>
<pre><code class="language-python"># 来自 args.py
attn_temperature_tuning: bool = False  # 超长上下文时启用
floor_scale: float = 8192.0
attn_scale: float = 0.1
</code></pre>
<p>当处理极长序列时,注意力分数的尺度会随着序列长度变化而漂移,导致 Softmax 过度锐化 (部分 token 获得接近 1 的注意力权重,其余接近 0)。注意力温度调节通过在推理时动态调整 attention temperature 来缓解这一问题,是支持 10M 上下文稳定运行的关键技术之一。</p>
<p><strong>QK Normalization</strong></p>
<p>源码中 <code>use_qk_norm: bool = False</code> 表明 QK 归一化作为可选功能存在。QK Norm (对 Query 和 Key 做 LayerNorm 后再计算 attention score) 有助于稳定大学习率训练和提升长度外推能力。</p>
<blockquote>
<p><strong>Thinking (Long Context)</strong>: 10M token 上下文是业界的数量级突破 (此前主流开源模型最多 1M~2M)。Scout 通过「Scaled RoPE + NOPE + 注意力温度调节」的组合拳实现这一能力,而非简单依赖线性注意力或状态空间模型。这保持了 Transformer 架构的通用性,同时通过位置编码的精巧设计突破了长度限制。不过 10M 上下文的实际可用性还受限于 KV Cache 的内存占用——即使 17B 激活参数,10M 的 KV Cache 在 BF16 下也需要数百 GB 显存。</p>
</blockquote>
<h3 id="1-3-ysdmt-early-fusion-sj-encoder">1.3 原生多模态: Early Fusion 视觉Encoder</h3>
<p>Llama 4 是 Meta 首个「原生多模态」模型,其视觉处理能力不是通过后期添加 adapter 实现的,而是在预训练阶段就将图像 token 与文本 token 融合到统一的主干中。</p>
<p><strong>视觉 token 表示</strong></p>
<p>根据 prompt format 文档,Llama 4 使用以下特殊 token 处理图像:</p>
<ul>
<li><code>&lt;|image_start|&gt;</code> / <code>&lt;|image_end|&gt;</code>: 包裹图像数据</li>
<li><code>&lt;|patch|&gt;</code>: 图像 patch</li>
<li><code>&lt;|tile_x_separator|&gt;</code> / <code>&lt;|tile_y_separator|&gt;</code>: 分隔不同 tile</li>
<li><code>&lt;|image|&gt;</code>: 分隔原始尺寸图像与下采样后的单 tile 版本</li>
</ul>
<p>这种设计表明 Llama 4 采用了 <strong>tile-based 图像编码</strong>: 高分辨率图像被切分为多个 tile,每个 tile 编码为一系列 patch token,再通过 separator token 组织成序列输入语言模型。</p>
<p><strong>Early Fusion 的优势</strong></p>
<p>传统的 Late Fusion (如 LLaVA 系列) 先分别编码图像和文本,再通过 projector 对齐后输入 LLM。Early Fusion 则直接在预训练阶段让视觉和语言 token 共享 attention 计算,理论上可以:</p>
<ul>
<li>学习更深度的跨模态关联 (如图文的对齐、指代、推理)</li>
<li>避免 adapter 带来的信息瓶颈</li>
<li>统一处理任意模态组合的输入 (多图、图文交错、视频帧序列)</li>
</ul>
<blockquote>
<p><strong>Thinking (Multimodality)</strong>: Early Fusion 虽然概念上更优雅,但工程复杂度远高于 Late Fusion。预训练时需要同时处理文本和图像数据,数据配比、采样策略、训练稳定性都是挑战。Meta 选择在 Llama 4 上采用这一路线,说明其内部基础设施已能支撑大规模多模态预训练。不过,Scout 和 Maverick 的 benchmark 中视觉任务分数 (MMMU 69.4/73.4, MathVista 70.7/73.7) 虽然优秀,但与专门的 VLM (如 Qwen2.5-VL、Kimi-VL) 相比并不占绝对优势,说明原生多模态的优势可能需要更大规模才能充分释放。</p>
</blockquote>
<h3 id="1-4-qtjgxj">1.4 其他架构细节</h3>
<table>
<thead>
<tr>
<th>特性</th>
<th>配置</th>
</tr>
</thead>
<tbody><tr>
<td>归一化</td>
<td>RMSNorm (eps=1e-5)</td>
</tr>
<tr>
<td>注意力</td>
<td>多头注意力,支持 GQA (Grouped Query Attention)</td>
</tr>
<tr>
<td>激活函数</td>
<td>SwiGLU</td>
</tr>
<tr>
<td>位置编码</td>
<td>RoPE (theta=500000), Scout 启用 scaled 版本</td>
</tr>
<tr>
<td>词表</td>
<td>支持 12 种主要语言,预训练覆盖 200 种语言</td>
</tr>
<tr>
<td>特殊 Token</td>
<td>\`&lt;</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-yxl">2. 预训练</h2>
<h3 id="2-1-xlsj">2.1 训练数据</h3>
<p>Llama 4 的预训练数据来源与 Llama 3 类似,但规模显著扩大:</p>
<ul>
<li><strong>Scout</strong>: ~40 万亿 (40T) token</li>
<li><strong>Maverick</strong>: ~22 万亿 (22T) token</li>
</ul>
<p>数据构成包括:</p>
<ul>
<li>公开可用的网络数据</li>
<li>授权数据</li>
<li>Meta 产品和服务中的信息 (包括 Instagram 和 Facebook 的公开分享帖子,以及用户与 Meta AI 的互动数据)</li>
</ul>
<p><strong>知识截止</strong>: 2024 年 8 月</p>
<p><strong>语言覆盖</strong>: 官方支持 12 种语言 (阿拉伯语、英语、法语、德语、印地语、印度尼西亚语、意大利语、葡萄牙语、西班牙语、他加禄语、泰语、越南语)。预训练阶段实际覆盖了 <strong>200 种语言</strong> (基于 Meta 的 &quot;No Language Left Behind&quot; 项目)。</p>
<blockquote>
<p><strong>Thinking (Data)</strong>: 40T token 的预训练数据量约为 Llama 3 (15T) 的 2.7 倍,是开源社区中数据规模最大的模型之一。值得注意的是,Scout 的数据量 (40T) 反而多于 Maverick (22T),这与常规直觉相反——通常更大的模型需要更多的数据。可能的原因是: (1) Scout 需要额外的长上下文数据进行 mid-training;(2) 两个模型的训练策略不同,Scout 可能采用了更激进的重复数据策略;(3) Maverick 的 128 experts 可能更需要高质量而非高数量的数据来训练路由器。</p>
</blockquote>
<h3 id="2-2-xljcssynh">2.2 训练基础设施与能耗</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>Scout</th>
<th>Maverick</th>
<th>合计</th>
</tr>
</thead>
<tbody><tr>
<td>GPU 训练时间</td>
<td>5.0M GPU 小时</td>
<td>2.38M GPU 小时</td>
<td>7.38M GPU 小时</td>
</tr>
<tr>
<td>GPU 类型</td>
<td>H100-80GB</td>
<td>H100-80GB</td>
<td>-</td>
</tr>
<tr>
<td>单卡功耗 (TDP)</td>
<td>700W</td>
<td>700W</td>
<td>-</td>
</tr>
<tr>
<td>位置基准碳排放</td>
<td>1,354 吨 CO2eq</td>
<td>645 吨 CO2eq</td>
<td><strong>1,999 吨 CO2eq</strong></td>
</tr>
<tr>
<td>市场基准碳排放</td>
<td>0 吨 (Meta 使用 100% 可再生能源)</td>
<td>0 吨</td>
<td>0 吨</td>
</tr>
</tbody></table>
<p>Meta 自 2020 年起实现全球运营净零碳排放,100% 使用清洁可再生能源。由于模型以开源方式发布,其他使用者无需重复承担训练能耗。</p>
<blockquote>
<p><strong>Thinking (Training Scale)</strong>: 7.38M H100 GPU 小时的训练规模极为庞大。作为对比,Llama 3 405B 据报道使用了约 16K H100 训练约 54 天 (~21M GPU 小时)。Llama 4 两个模型的总训练量约为 Llama 3 405B 的 35%,但考虑到 Llama 4 的激活参数仅 17B (vs 405B Dense),其训练效率显著提升——MoE 架构用更少的激活计算量实现了更高的总容量。</p>
</blockquote>
<h3 id="2-3-sxwkzcl">2.3 上下文扩展策略</h3>
<p>Llama 4 的长上下文能力不是一次性训练到 10M 的,而是通过多阶段训练实现的:</p>
<pre><code class="language-mermaid">flowchart LR
    P1[阶段1: 初始预训练&lt;br/&gt;上下文 8K~128K&lt;br/&gt;~40T/22T tokens] --&gt; P2[阶段2: Mid-training&lt;br/&gt;上下文扩展 128K~1M&lt;br/&gt;长序列数据]
    P2 --&gt; P3[阶段3: 超长上下文激活&lt;br/&gt;1M -&gt; 10M&lt;br/&gt;iRoPE + 注意力温度调节]
    P3 --&gt; P4[阶段4: 后训练&lt;br/&gt;SFT + RL + DPO&lt;br/&gt;指令对齐]

    style P3 fill:#e1f5fe
</code></pre>
<ol>
<li><strong>初始预训练</strong>: 在较短上下文 (如 8K~128K) 上进行大规模预训练</li>
<li><strong>Mid-training / 长上下文扩展</strong>: 使用长序列数据继续训练,逐步扩展上下文长度</li>
<li><strong>注意力机制优化</strong>: 通过 iRoPE (interleaved attention layers with RoPE) 和注意力温度调节来稳定超长序列的注意力计算</li>
</ol>
<p>Scout 的 <code>use_scaled_rope=True</code> 和 <code>rope_scaling_factor=16</code> 表明其位置编码在 8192 基础长度上做了 16 倍外推,理论外推长度可达 ~131K。但实际支持 10M 说明还结合了其他技术 (如 NOPE 层、注意力温度调节、以及可能的循环或压缩机制)。</p>
<hr>
<h2 id="3-hxlyaqdq">3. 后训练与安全对齐</h2>
<h3 id="3-1-hxlffl">3.1 后训练方法论</h3>
<p>根据被撤回的 arXiv 论文摘要 (2601.11659) 以及 Meta 官方释放信息,Llama 4 的后训练包含以下阶段:</p>
<ol>
<li><strong>轻量级 SFT (Supervised Fine-Tuning)</strong>: 使用高质量指令数据进行监督微调</li>
<li><strong>在线 RL (Reinforcement Learning)</strong>: 使用在线强化学习 (推测为 RLHF 或 DPO 的变体) 进一步优化模型输出</li>
<li><strong>轻量级 DPO (Direct Preference Optimization)</strong>: 对齐人类偏好</li>
</ol>
<p>与 Llama 3 的 6 轮 RS+SFT+DPO 迭代相比,Llama 4 的后训练流程被描述为更「轻量级」,可能意味着:</p>
<ul>
<li>减少迭代轮次,降低计算成本</li>
<li>更依赖预训练阶段获得的基础能力</li>
<li>使用合成数据减少对人类标注的依赖</li>
</ul>
<h3 id="3-2-aqdqgj">3.2 安全对齐改进</h3>
<p>Llama 4 在安全方面做了以下改进:</p>
<p><strong>降低误拒率 (Reducing False Refusals)</strong></p>
<p>Meta 在 Llama 4 上大幅降低了模型对良性提示的拒绝率。策略包括:</p>
<ul>
<li>在安全数据集中加入边界案例 (borderline) 和对抗性提示</li>
<li>修改安全数据的回复风格,遵循 tone 指南</li>
</ul>
<p><strong>改善回复语气 (Tone)</strong></p>
<ul>
<li>去除说教式、道德优越感的语言</li>
<li>修正格式问题 (正确使用标题、列表、表格)</li>
<li>使模型听起来更自然、更对话化</li>
</ul>
<p><strong>System Prompt 可操控性 (Steerability)</strong></p>
<p>Llama 4 是一个更易操控的模型,开发者可以通过 system prompt 显著改变模型的行为风格。Meta 推荐以下基本模板:</p>
<pre><code>You are an expert conversationalist who responds to the best of your ability. 
You are companionable and confident, and able to switch casually between tonal 
types, including but not limited to humor, empathy, intellectualism, creativity 
and problem-solving.

You understand user intent and don&#39;t try to be overly helpful to the point where 
you miss that the user is looking for chit-chat, emotional support, humor or venting.

You never lecture people to be nicer or more inclusive. You never use phrases that 
imply moral superiority or a sense of authority, including but not limited to 
&quot;it&#39;s important to&quot;, &quot;it&#39;s crucial to&quot;, &quot;it&#39;s essential to&quot;, &quot;it&#39;s unethical to&quot;, 
&quot;it&#39;s worth noting...&quot;, &quot;Remember...&quot; etc.
</code></pre>
<h3 id="3-3-xtjaqbh">3.3 系统级安全保护</h3>
<p>Meta 采用三层安全策略:</p>
<ol>
<li><strong>帮助开发者部署</strong>: 提供 helpful、safe、flexible 的模型基座</li>
<li><strong>保护开发者</strong>: 防御试图利用模型造成危害的对抗性用户</li>
<li><strong>保护社区</strong>: 防止模型被滥用</li>
</ol>
<p>配套安全工具:</p>
<ul>
<li><strong>Llama Guard</strong>: 输入/输出内容过滤</li>
<li><strong>Prompt Guard</strong>: 提示词注入检测</li>
<li><strong>Code Shield</strong>: 代码安全扫描</li>
</ul>
<p>关键风险领域的红队测试:</p>
<ul>
<li><strong>CBRNE</strong> (化学、生物、放射性、核、爆炸物): 评估模型是否会被用于协助武器制造</li>
<li><strong>儿童安全</strong>: 评估模型产生儿童安全相关风险内容的能力</li>
<li><strong>网络攻击</strong>: 评估模型自动化网络攻击的能力</li>
</ul>
<p>评估结论: Llama 4 模型不会引入可导致灾难性网络后果的风险。</p>
<hr>
<h2 id="4-xnpg">4. 性能评估</h2>
<h3 id="4-1-yxlmx-base">4.1 预训练模型 (Base)</h3>
<table>
<thead>
<tr>
<th>类别</th>
<th>Benchmark</th>
<th>Shot</th>
<th>指标</th>
<th>Llama 3.1 70B</th>
<th>Llama 3.1 405B</th>
<th><strong>Scout</strong></th>
<th><strong>Maverick</strong></th>
</tr>
</thead>
<tbody><tr>
<td>推理与知识</td>
<td>MMLU</td>
<td>5</td>
<td>macro_avg/acc_char</td>
<td>79.3</td>
<td>85.2</td>
<td>79.6</td>
<td>85.5</td>
</tr>
<tr>
<td>推理与知识</td>
<td>MMLU-Pro</td>
<td>5</td>
<td>macro_avg/em</td>
<td>53.8</td>
<td>61.6</td>
<td>58.2</td>
<td>62.9</td>
</tr>
<tr>
<td>推理与知识</td>
<td>MATH</td>
<td>4</td>
<td>em_maj1@1</td>
<td>41.6</td>
<td>53.5</td>
<td>50.3</td>
<td>61.2</td>
</tr>
<tr>
<td>代码</td>
<td>MBPP</td>
<td>3</td>
<td>pass@1</td>
<td>66.4</td>
<td>74.4</td>
<td>67.8</td>
<td>77.6</td>
</tr>
<tr>
<td>多语言</td>
<td>TydiQA</td>
<td>1</td>
<td>average/f1</td>
<td>29.9</td>
<td>34.3</td>
<td>31.5</td>
<td>31.7</td>
</tr>
<tr>
<td>图像</td>
<td>ChartQA</td>
<td>0</td>
<td>relaxed_accuracy</td>
<td>-</td>
<td>-</td>
<td>83.4</td>
<td>85.3</td>
</tr>
<tr>
<td>图像</td>
<td>DocVQA</td>
<td>0</td>
<td>anls</td>
<td>-</td>
<td>-</td>
<td>89.4</td>
<td>91.6</td>
</tr>
</tbody></table>
<h3 id="4-2-zlwtmx-instruct">4.2 指令微调模型 (Instruct)</h3>
<table>
<thead>
<tr>
<th>类别</th>
<th>Benchmark</th>
<th>Shot</th>
<th>指标</th>
<th>Llama 3.3 70B</th>
<th>Llama 3.1 405B</th>
<th><strong>Scout</strong></th>
<th><strong>Maverick</strong></th>
</tr>
</thead>
<tbody><tr>
<td>图像推理</td>
<td>MMMU</td>
<td>0</td>
<td>accuracy</td>
<td>-</td>
<td>-</td>
<td>69.4</td>
<td><strong>73.4</strong></td>
</tr>
<tr>
<td>图像推理</td>
<td>MMMU Pro</td>
<td>0</td>
<td>accuracy</td>
<td>-</td>
<td>-</td>
<td>52.2</td>
<td>59.6</td>
</tr>
<tr>
<td>图像推理</td>
<td>MathVista</td>
<td>0</td>
<td>accuracy</td>
<td>-</td>
<td>-</td>
<td>70.7</td>
<td><strong>73.7</strong></td>
</tr>
<tr>
<td>图像理解</td>
<td>ChartQA</td>
<td>0</td>
<td>relaxed_accuracy</td>
<td>-</td>
<td>-</td>
<td>88.8</td>
<td>90.0</td>
</tr>
<tr>
<td>图像理解</td>
<td>DocVQA (test)</td>
<td>0</td>
<td>anls</td>
<td>-</td>
<td>-</td>
<td>94.4</td>
<td>94.4</td>
</tr>
<tr>
<td>代码</td>
<td>LiveCodeBench</td>
<td>0</td>
<td>pass@1</td>
<td>33.3</td>
<td>27.7</td>
<td>32.8</td>
<td><strong>43.4</strong></td>
</tr>
<tr>
<td>推理与知识</td>
<td>MMLU Pro</td>
<td>0</td>
<td>macro_avg/acc</td>
<td>68.9</td>
<td>73.4</td>
<td>74.3</td>
<td><strong>80.5</strong></td>
</tr>
<tr>
<td>推理与知识</td>
<td>GPQA Diamond</td>
<td>0</td>
<td>accuracy</td>
<td>50.5</td>
<td>49.0</td>
<td>57.2</td>
<td><strong>69.8</strong></td>
</tr>
<tr>
<td>多语言</td>
<td>MGSM</td>
<td>0</td>
<td>average/em</td>
<td>91.1</td>
<td>91.6</td>
<td>90.6</td>
<td>92.3</td>
</tr>
<tr>
<td>长上下文</td>
<td>MTOB (half book) eng-&gt;kgv</td>
<td>-</td>
<td>chrF</td>
<td>-</td>
<td>-</td>
<td>42.2</td>
<td><strong>54.0</strong></td>
</tr>
<tr>
<td>长上下文</td>
<td>MTOB (half book) kgv-&gt;eng</td>
<td>-</td>
<td>chrF</td>
<td>-</td>
<td>-</td>
<td>36.6</td>
<td><strong>46.4</strong></td>
</tr>
<tr>
<td>长上下文</td>
<td>MTOB (full book) eng-&gt;kgv</td>
<td>-</td>
<td>chrF</td>
<td>-</td>
<td>-</td>
<td>39.7</td>
<td><strong>50.8</strong></td>
</tr>
<tr>
<td>长上下文</td>
<td>MTOB (full book) kgv-&gt;eng</td>
<td>-</td>
<td>chrF</td>
<td>-</td>
<td>-</td>
<td>36.3</td>
<td><strong>46.7</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>Thinking (Benchmarks)</strong>: 从 benchmark 数据可以得出几个关键洞察:</p>
<ol>
<li><p><strong>Maverick 全面超越 Llama 3.1 405B</strong>: 在 MMLU Pro (80.5 vs 73.4)、MATH (61.2 vs 53.5)、GPQA Diamond (69.8 vs 49.0)、LiveCodeBench (43.4 vs 27.7) 等核心推理基准上,Maverick 以仅 17B 激活参数的 MoE 架构全面碾压了 405B Dense 的 Llama 3.1。这证明了 MoE 架构在参数量效率上的巨大优势——400B 总参数的稀疏模型在推理任务上优于 405B 全激活的 Dense 模型。</p>
</li>
<li><p><strong>Scout 的定位是「长上下文专家」</strong>: Scout 在标准推理 benchmark 上略逊于 Maverick,但拥有 10M 上下文窗口。MTOB (Massively Multilingual Translation of Books) 基准测试整本书的翻译能力,Scout 在这个任务上已展现出长上下文的优势,而 Maverick 由于 1M 上下文限制表现更强 (因为能处理更多内容)。</p>
</li>
<li><p><strong>多模态能力处于第一梯队</strong>: Maverick 的 MMMU 73.4、MathVista 73.7、DocVQA 94.4 等指标与 GPT-4o、Gemini 2.0 Flash 等闭源模型相当,在开源 VLM 中处于领先地位。</p>
</li>
<li><p><strong>代码能力突出</strong>: Maverick 的 LiveCodeBench 43.4 远超 Llama 3.1 405B 的 27.7,也优于许多专门的代码模型,说明后训练阶段对代码能力做了重点优化。</p>
</li>
</ol>
</blockquote>
<h3 id="4-3-yjpdb">4.3 与竞品对比</h3>
<p>根据 Meta 官方宣传以及社区测试,Llama 4 Maverick 的关键竞品对比:</p>
<table>
<thead>
<tr>
<th>Benchmark</th>
<th>Llama 4 Maverick</th>
<th>GPT-4o</th>
<th>Gemini 2.0 Flash</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU</td>
<td>73.4</td>
<td>69.1</td>
<td>71.7</td>
</tr>
<tr>
<td>MathVista</td>
<td>73.7</td>
<td>63.8</td>
<td>73.1</td>
</tr>
<tr>
<td>DocVQA</td>
<td>94.4</td>
<td>92.8</td>
<td>-</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>69.8</td>
<td>53.6</td>
<td>60.1</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>43.4</td>
<td>-</td>
<td>34.5</td>
</tr>
</tbody></table>
<p><em>注: GPT-4o 和 Gemini 数据来自 Meta 官方博客,可能存在测试条件差异。</em></p>
<hr>
<h2 id="5-bsylh">5. 部署与量化</h2>
<h3 id="5-1-lhfa">5.1 量化方案</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>BF16 大小</th>
<th>量化方案</th>
<th>量化后大小</th>
<th>部署要求</th>
</tr>
</thead>
<tbody><tr>
<td>Scout</td>
<td>~218GB</td>
<td>Int4 (on-the-fly)</td>
<td>~55GB</td>
<td><strong>单张 H100 GPU</strong></td>
</tr>
<tr>
<td>Maverick</td>
<td>~800GB</td>
<td>FP8</td>
<td>~400GB</td>
<td><strong>单台 H100 DGX host</strong></td>
</tr>
</tbody></table>
<ul>
<li><strong>Scout</strong>: 官方提供 BF16 权重,支持 on-the-fly Int4 量化。Int4 量化后可在单张 H100 上运行,且 Meta 声称性能损失最小化。</li>
<li><strong>Maverick</strong>: 同时发布 BF16 和 FP8 两种版本。FP8 版本在保持质量的同时大幅减小显存占用,可放入单台 DGX host。</li>
</ul>
<h3 id="5-2-tlxs">5.2 推理效率</h3>
<p>MoE 架构的核心优势在于推理效率:</p>
<ul>
<li>每个 token 仅激活 17B 参数 (vs 总参数量 109B/400B)</li>
<li>以 Dense 17B 的计算成本获得远超 17B Dense 模型的能力</li>
<li>KV Cache 大小与激活参数量成正比,而非总参数量</li>
</ul>
<p>不过,MoE 推理也有额外开销:</p>
<ul>
<li><strong>路由计算</strong>: 需要计算每个 token 应该发送到哪个 expert</li>
<li><strong>通信开销</strong>: 在分布式部署时,不同 expert 可能位于不同 GPU 上,需要 all-to-all 通信</li>
<li><strong>负载不均衡</strong>: 如果某些 expert 被过度使用,会导致等待时间增加</li>
</ul>
<blockquote>
<p><strong>Thinking (Deployment)</strong>: Llama 4 的部署效率是其在开源社区获得广泛采用的关键因素。Scout 能放入单张 H100 (Int4) 意味着中小企业和个人开发者都能本地部署;Maverick 的 FP8 版本可放入 DGX host 意味着大型应用也能以合理成本运行。相比之下,Llama 3 405B Dense 模型即使 FP8 量化也需要多台服务器才能运行。MoE 的「小激活、大容量」特性在推理阶段的优势被充分发挥。不过需要注意的是,on-the-fly Int4 量化虽然方便,但在某些精度敏感任务上可能不如预量化 (pre-quantized) 的模型稳定。</p>
</blockquote>
<hr>
<h2 id="6-tlyzj">6. 讨论与总结</h2>
<h3 id="6-1-llama-4-dyy">6.1 Llama 4 的意义</h3>
<p>Llama 4 代表了 Meta 开源战略的三大转向:</p>
<ol>
<li><p><strong>从 Dense 到 MoE</strong>: 放弃了 Llama 1~3 的 Dense 架构,全面拥抱稀疏专家模型。这是计算效率与模型能力权衡后的必然选择——在 H100 等高端 GPU 供应受限的背景下,用更少的激活计算获得更大的模型容量是可持续的扩展路径。</p>
</li>
<li><p><strong>从纯文本到原生多模态</strong>: Early Fusion 设计让 Llama 4 不再是「会看图的文本模型」,而是真正统一的模态理解系统。这为未来的视频、音频扩展奠定了基础。</p>
</li>
<li><p><strong>从标准上下文到超长上下文</strong>: Scout 的 10M 上下文窗口开启了全新的应用场景——整本书翻译、代码库级理解、长文档分析、多轮对话历史保持等。</p>
</li>
</ol>
<h3 id="6-2-jxxyzy">6.2 局限性与争议</h3>
<p>Llama 4 的发布也伴随着一些争议:</p>
<ol>
<li><p><strong>无正式技术报告</strong>: 与 Llama 1~3 均发布详细技术报告不同,Llama 4 截至发布时未提供正式论文。arXiv 上出现的第三方总结 &quot;The Llama 4 Herd&quot; 后来被撤回。这让研究社区难以深入理解模型的训练细节和架构选择背后的 rationale。</p>
</li>
<li><p><strong>Benchmark 争议</strong>: 发布初期有用户反映 Llama 4 在实际任务中的表现与 benchmark 分数存在差距。Meta GenAI 负责人 Ahmad Al-Dahle 回应称这是由于「实现需要稳定化」,否认了在测试集上训练的说法。</p>
</li>
<li><p><strong>Behemoth 仍未发布</strong>: 作为 2T 参数的「教师模型」,Behemoth 的 preview 引发了社区对 Meta 是否「画饼」的质疑。如果 Behemoth 最终不发布,那么以它为蒸馏目标的训练策略将无法被社区复现。</p>
</li>
<li><p><strong>数据隐私</strong>: 预训练数据包含 Meta 产品 (Instagram、Facebook) 的用户内容,虽然声称仅使用公开分享的内容,但仍引发了对数据使用边界的讨论。</p>
</li>
</ol>
<h3 id="6-3-jsqsdc">6.3 技术趋势洞察</h3>
<p>Llama 4 的发布印证了几个行业趋势:</p>
<ul>
<li><strong>MoE 成为主流</strong>: 从 DeepSeek-V2/V3、Qwen3、Mixtral 到 Llama 4,MoE 已从实验性架构变为开源大模型的标配。</li>
<li><strong>长上下文军备竞赛</strong>: 从 128K 到 1M 再到 10M,上下文长度成为模型差异化的关键维度。但真正的挑战不在于「能处理多长」,而在于「在长上下文中的信息检索与推理能力是否同步提升」。</li>
<li><strong>多模态统一化</strong>: Early Fusion 代表了多模态建模的演进方向——不是给 LLM「加装」视觉能力,而是从头训练一个真正的多模态系统。</li>
<li><strong>推理效率优先</strong>: 在模型能力差距逐渐缩小的背景下,推理成本 (每 token 价格、延迟、显存占用) 成为模型竞争力的核心指标。</li>
</ul>
<h3 id="6-4-zj">6.4 总结</h3>
<p>Llama 4 是 Meta 开源战略的重要里程碑,其 MoE 架构、原生多模态能力和超长上下文窗口代表了当前开源大模型的技术前沿。尽管缺乏正式技术报告让部分技术细节仍笼罩在迷雾中,但从开源代码和官方 Model Card 中已能勾勒出一幅清晰的架构图景。</p>
<p>对于开发者而言,Llama 4 提供了极具吸引力的部署选择: Scout 以单卡可运行的成本提供 10M 上下文和强大的多模态能力;Maverick 以 DGX host 级别的成本提供接近前沿闭源模型的推理性能。对于研究者而言,Llama 4 的 Early Fusion 多模态设计和 iRoPE 长上下文技术为下一代模型架构提供了有价值的参考。</p>
<hr>
<h2 id="ckly">参考来源</h2>
<ol>
<li>Meta AI, &quot;Llama 4 Model Card&quot;, GitHub: meta-llama/llama-models (2025)</li>
<li>Meta AI, &quot;The Llama 4 Herd: The Beginning of a New Era of Natively Multimodal AI Innovation&quot;, Meta AI Blog (2025)</li>
<li>Meta AI, &quot;Llama 4 Prompt Format Documentation&quot;, GitHub: meta-llama/llama-models (2025)</li>
<li>Meta AI, &quot;Llama 4 Source Code (args.py, model.py, moe.py, vision/)&quot;, GitHub: meta-llama/llama-models (2025)</li>
<li>arXiv:2601.11659 [withdrawn], &quot;The Llama 4 Herd: Architecture, Training, Evaluation, and Deployment Notes&quot;</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zyyhxld","text":"摘要与核心亮点"},{"level":2,"id":"1-mxjgsj","text":"1. 模型架构设计"},{"level":3,"id":"1-1-moe-jg-jt-dense-yxsc","text":"1.1 MoE 架构: 交替 Dense 与稀疏层"},{"level":3,"id":"1-2-csxw-i-ro-pe-yzylwdtj","text":"1.2 长上下文: iRoPE 与注意力温度调节"},{"level":3,"id":"1-3-ysdmt-early-fusion-sj-encoder","text":"1.3 原生多模态: Early Fusion 视觉Encoder"},{"level":3,"id":"1-4-qtjgxj","text":"1.4 其他架构细节"},{"level":2,"id":"2-yxl","text":"2. 预训练"},{"level":3,"id":"2-1-xlsj","text":"2.1 训练数据"},{"level":3,"id":"2-2-xljcssynh","text":"2.2 训练基础设施与能耗"},{"level":3,"id":"2-3-sxwkzcl","text":"2.3 上下文扩展策略"},{"level":2,"id":"3-hxlyaqdq","text":"3. 后训练与安全对齐"},{"level":3,"id":"3-1-hxlffl","text":"3.1 后训练方法论"},{"level":3,"id":"3-2-aqdqgj","text":"3.2 安全对齐改进"},{"level":3,"id":"3-3-xtjaqbh","text":"3.3 系统级安全保护"},{"level":2,"id":"4-xnpg","text":"4. 性能评估"},{"level":3,"id":"4-1-yxlmx-base","text":"4.1 预训练模型 (Base)"},{"level":3,"id":"4-2-zlwtmx-instruct","text":"4.2 指令微调模型 (Instruct)"},{"level":3,"id":"4-3-yjpdb","text":"4.3 与竞品对比"},{"level":2,"id":"5-bsylh","text":"5. 部署与量化"},{"level":3,"id":"5-1-lhfa","text":"5.1 量化方案"},{"level":3,"id":"5-2-tlxs","text":"5.2 推理效率"},{"level":2,"id":"6-tlyzj","text":"6. 讨论与总结"},{"level":3,"id":"6-1-llama-4-dyy","text":"6.1 Llama 4 的意义"},{"level":3,"id":"6-2-jxxyzy","text":"6.2 局限性与争议"},{"level":3,"id":"6-3-jsqsdc","text":"6.3 技术趋势洞察"},{"level":3,"id":"6-4-zj","text":"6.4 总结"},{"level":2,"id":"ckly","text":"参考来源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/04-llama-4/01-llama-4-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/04-llama-4/01-llama-4-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 4: 原生多模态 MoE 模型的技术解读</h1>
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
