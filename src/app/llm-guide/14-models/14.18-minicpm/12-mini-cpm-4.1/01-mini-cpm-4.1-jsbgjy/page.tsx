"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-4.1 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文来源: OpenBMB GitHub 官方仓库 / InfLLM-V2 论文(arXiv:2509.24663) / HuggingFace 模型卡片
官方链接: <a href="https://github.com/OpenBMB/MiniCPM">https://github.com/OpenBMB/MiniCPM</a>
HuggingFace: <a href="https://huggingface.co/openbmb/MiniCPM4.1-8B">https://huggingface.co/openbmb/MiniCPM4.1-8B</a>
发布日期: 2025 年 9 月 5 日
发布机构: 清华大学面壁智能(OpenBMB)
模型规模: 8B 参数
说明: MiniCPM-4.1 无独立技术报告 PDF, 本文基于 GitHub README、InfLLM-V2 论文及官方公开信息综合整理精译</p>
</blockquote>
<hr>
<h2 id="1-mxgs">1 模型概述</h2>
<p>MiniCPM-4.1 是面壁智能于 2025 年 9 月发布的端侧混合推理大语言模型(Hybrid Reasoning LLM),基于 MiniCPM-4.0 的架构演进而来,核心参数规模为 8B。该模型最大的差异化特征是<strong>混合推理模式</strong>(Hybrid Reasoning Mode)——用户可以在「深度思考模式」(deep reasoning mode)和「非思考模式」(non-reasoning mode)之间自由切换,而无需加载两个独立的模型权重。</p>
<p>与 MiniCPM-4.0 相比,4.1 版本进行了三项关键升级:</p>
<p>(1) <strong>混合推理架构</strong>: 单模型同时支持 reasoning 和 non-reasoning 输出,通过 <code>enable_thinking</code> 参数或 <code>/think</code> / <code>/no_think</code> 指令实现动态切换;
(2) <strong>上下文长度扩展</strong>: 预训练上下文长度从 32K 扩展至 64K,通过 YaRN 技术可外推至 128K;
(3) <strong>推理速度优化</strong>: 在 reasoning 场景下实现 <strong>3x</strong> 解码速度提升,长文本场景下维持与 4.0 相同的 <strong>7x</strong> 加速水平。</p>
<p>模型家族包含 8B 主模型和 0.5B 轻量模型,均支持稀疏注意力推理(dense 和 sparse 两种模式)。在端侧芯片 Jetson AGX Orin 和 RTX 4090 上,MiniCPM-4.1 的长文本处理效率显著优于同尺寸模型。</p>
<blockquote>
<p>这里需要停下来想一下: 为什么要在端侧做混合推理？2025 年初 DeepSeek-R1 的发布证明了大语言模型可以通过强化学习获得强大的推理能力,但 R1 的「始终思考」模式带来了两个现实问题。第一,每个请求都要消耗大量推理 token(数万级别),在端侧设备上这意味着不可接受的延迟和电量消耗。第二,很多日常任务根本不需要深度推理——比如「明天天气怎么样」或「把这段文字翻译成英文」,强行思考只会浪费算力。MiniCPM-4.1 的混合推理模式本质上是在「能力」和「效率」之间做了一个可配置的平衡,让用户(或应用开发者)根据场景需求动态选择推理深度。这在端侧场景中尤为关键,因为端侧用户最敏感的是响应速度和续航时间。</p>
</blockquote>
<hr>
<h2 id="2-hxjg">2 核心架构</h2>
<h3 id="2-1-inf-llm-v2-kxlxszyl">2.1 InfLLM-V2 可训练稀疏注意力</h3>
<p>MiniCPM-4.1 沿用了 MiniCPM-4.0 的 InfLLM-V2 稀疏注意力架构。InfLLM-V2 的核心设计在于「密集-稀疏可切换注意力」(Dense-Sparse Switchable Attention),它在处理短序列时使用标准密集注意力,在处理长序列时平滑过渡为块稀疏注意力,且<strong>无需引入任何额外参数</strong>。</p>
<p>与 NSA(Natively Trainable Sparse Attention)相比,InfLLM-V2 的关键改进包括:</p>
<ul>
<li><strong>共享 KV 投影</strong>: NSA 为三种注意力模式(Compressed、Selected、Sliding)各自维护独立的 KV 投影矩阵,而 InfLLM-V2 仅使用一组共享的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>K</mi></msub></mrow><annotation encoding="application/x-tex">W_K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>V</mi></msub></mrow><annotation encoding="application/x-tex">W_V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,直接用预训练 dense attention 的参数初始化;</li>
<li><strong>统一稀疏注意力</strong>: 将 Selected Attention 和 Sliding Attention 合并为一个统一的 Sparse Attention 模块,消除 Compressed Attention 的输出,计算流程更贴近标准 dense attention;</li>
<li><strong>三阶段块压缩</strong>: 采用 coarse-to-fine 的 3-stage 压缩策略(mean-pooling → block-wise sparse attention → max-pooling),在保持选择精度的同时降低 I/O 开销。</li>
</ul>
<blockquote>
<p>译者注: NSA 和 InfLLM-V2 的架构差异值得仔细对比。NSA 的设计思路是「为稀疏注意力专门设计一套模块」,这导致三个注意力分支 + gating MLP 的复杂结构,短序列处理时也不得不计算所有分支,引入显著 overhead。InfLLM-V2 的思路则是「让稀疏注意力复用密集注意力的全部参数」,通过架构改造而非参数增量的方式实现稀疏化。这个设计选择直接决定了两种方法在「短到长适配」场景中的适用性——NSA 更适合从头训练,InfLLM-V2 更适合在预训练 dense 模型基础上做继续训练。MiniCPM-4.1 选择在 4.0 的 dense 基座上通过 InfLLM-V2 做继续训练,只需要 <strong>5B</strong> 长文本 token 即可完成适配,这是一个非常经济的训练成本。</p>
</blockquote>
<h3 id="2-2-hhtlmsdgcsx">2.2 混合推理模式的工程实现</h3>
<p>MiniCPM-4.1 的混合推理模式通过 tokenizer 级别的指令控制实现,而非在模型架构层面维护两个独立的前向路径。</p>
<p><strong>API 层切换方式</strong>:</p>
<pre><code class="language-python"># 启用思考模式
prompt_text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True
)

# 启用非思考模式
prompt_text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False
)
</code></pre>
<p><strong>用户指令层切换方式</strong>:</p>
<p>用户可以在查询末尾添加 <code>/think</code> 强制启用思考模式,或添加 <code>/no_think</code> 强制禁用思考模式。若不添加任何特殊指令,模型默认启用思考模式。</p>
<blockquote>
<p>这个实现方式非常聪明。从技术角度看,混合推理不是在模型内部维护两个独立的「推理头」或「非推理头&quot;,而是通过 chat template 在 prompt 中插入不同的系统级指令或特殊 token,引导模型进入不同的生成行为模式。这避免了模型权重的倍增(不需要两个 8B 模型),也避免了架构层面的复杂改造。代价是模型需要在 post-training 阶段学会识别这些特殊指令并调整生成策略——具体来说,就是在 SFT 和 RL 阶段同时暴露 reasoning 和 non-reasoning 的示例,让模型学会「看到 /think 就展开 CoT,看到 /no_think 就直接输出答案」。这本质上是一种通过 prompt engineering 实现的「软切换」,而不是硬编码的架构分支。</p>
</blockquote>
<hr>
<h2 id="3-xlsjycl">3 训练数据与策略</h2>
<h3 id="3-1-yxlsj">3.1 预训练数据</h3>
<p>MiniCPM-4.1 的预训练数据延续了 MiniCPM-4.0 的 UltraClean 清洗策略,总量约 <strong>8T tokens</strong>。与 4.0 的关键差异在于长文本预训练阶段的上下文长度从 32K 提升到 <strong>64K</strong>,这一扩展使模型在原生训练阶段就能接触到更长的上下文依赖关系。</p>
<p>长度扩展通过 YaRN(Yet another RoPE extension method)技术实现,该技术通过对 RoPE 的旋转角度进行缩放和温度调整,在不修改模型参数的前提下扩展上下文窗口。在 128K「大海捞针」(Needle-in-a-Haystack)测试中,MiniCPM-4.1 表现优异,证明了其在超长上下文中的检索能力。</p>
<h3 id="3-2-hxlsj">3.2 后训练数据</h3>
<p>后训练阶段使用了 UltraChat v2 数据集,覆盖知识密集型数据、推理密集型数据、指令遵循数据、长文本理解数据和工具调用数据五个维度。</p>
<p>混合推理模式的后训练是关键难点。模型需要同时学习两种输出格式:</p>
<ul>
<li><strong>Reasoning 模式</strong>: 输出格式为 <code>&lt;think&gt;...&lt;/think&gt;&lt;answer&gt;...&lt;/answer&gt;</code>,中间包含完整的 Chain-of-Thought 推理链;</li>
<li><strong>Non-reasoning 模式</strong>: 直接输出 <code>&lt;answer&gt;...&lt;/answer&gt;</code>,不包含显式思考过程。</li>
</ul>
<p>训练数据需要按一定比例混合两种模式的样本,同时确保模型不会因为过度偏向某一种模式而导致另一种模式的性能退化。</p>
<blockquote>
<p>混合推理的训练数据配比是一个没有标准答案的工程问题。如果 reasoning 样本比例过高,模型在非思考模式下可能会「忍不住」输出推理过程;如果 non-reasoning 样本比例过高,模型的推理深度可能不足。面壁智能没有公开具体的配比方案,但从工程实践推断,一个合理的策略是: 在 SFT 阶段保持大致 1:1 的配比,在 RL 阶段根据下游任务的表现动态调整。此外,推理样本的质量控制比数量更重要——低质量的 CoT(比如重复思考、逻辑跳跃)会对模型产生负面影响,因此需要专门的过滤机制来剔除劣质 reasoning 轨迹。</p>
</blockquote>
<hr>
<h2 id="4-pgjg">4 评估结果</h2>
<h3 id="4-1-zhxnpc">4.1 综合性能评测</h3>
<p>MiniCPM-4.1-8B 在深度思考模式下,在 15 项评测任务上超越了同尺寸模型,达到同类端侧模型的最佳水平。评测覆盖的维度包括:</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>代表基准</th>
<th>对比模型</th>
</tr>
</thead>
<tbody><tr>
<td>通用知识</td>
<td>MMLU, C-Eval</td>
<td>Qwen3-8B, Llama-3.1-8B</td>
</tr>
<tr>
<td>数学推理</td>
<td>GSM8K, MATH</td>
<td>DeepSeek-R1-Distill-Qwen-7B</td>
</tr>
<tr>
<td>代码生成</td>
<td>HumanEval, MBPP</td>
<td>CodeQwen-7B</td>
</tr>
<tr>
<td>长文本理解</td>
<td>LongBench, InfiniteBench</td>
<td>Qwen3-8B</td>
</tr>
<tr>
<td>工具调用</td>
<td>BFCL</td>
<td>GLM-4-9B, Qwen2.5-7B</td>
</tr>
</tbody></table>
<p>在非思考模式下,MiniCPM-4.1 的综合性能与同尺寸 dense 模型相当,响应速度显著快于思考模式。</p>
<h3 id="4-2-tlsdpc">4.2 推理速度评测</h3>
<p>在典型端侧芯片上的推理加速表现如下:</p>
<table>
<thead>
<tr>
<th>平台</th>
<th>模型</th>
<th>长文本加速比</th>
<th>推理加速比</th>
</tr>
</thead>
<tbody><tr>
<td>Jetson AGX Orin</td>
<td>MiniCPM-4.1 vs Qwen3-8B</td>
<td>约 7x</td>
<td>约 3x</td>
</tr>
<tr>
<td>RTX 4090</td>
<td>MiniCPM-4.1 vs Qwen3-8B</td>
<td>约 7x</td>
<td>约 3x</td>
</tr>
</tbody></table>
<blockquote>
<p>需要注意加速比数据的解读方式。7x 长文本加速主要来自 InfLLM-V2 稀疏注意力带来的计算量减少(128K 场景下仅计算不到 5% 的 token 相关性)。3x 推理加速则是一个更复杂的数字——它既包含了稀疏注意力的贡献,也包含了 reasoning 场景下模型生成效率的优化(比如更短的平均 CoT 长度或更高效的投机采样)。但这里存在一个潜在的测量偏差: 如果对比基准是 Qwen3-8B 的 dense attention 推理,那么加速比中的一部分其实来自「稀疏 vs 密集」的结构性差异,而非 MiniCPM-4.1 本身的独特优化。一个更公平的对比应该是 MiniCPM-4.1 sparse vs MiniCPM-4.1 dense,这样可以分离出稀疏注意力单独的加速贡献。</p>
</blockquote>
<h3 id="4-3-cwbnl">4.3 长文本能力</h3>
<p>MiniCPM-4.1 在 128K 长文本 Needle-in-a-Haystack 测试中表现优异,所有测试点均成功检索。预训练阶段使用 64K 上下文长度,通过 YaRN 扩展至 128K,这一配置使其成为端侧模型中少有的原生支持 128K 上下文的推理模型。</p>
<hr>
<h2 id="5-tlybs">5 推理与部署</h2>
<h3 id="5-1-tlkjzc">5.1 推理框架支持</h3>
<p>MiniCPM-4.1 支持以下推理框架:</p>
<table>
<thead>
<tr>
<th>框架</th>
<th>密集注意力</th>
<th>稀疏注意力</th>
<th>混合推理</th>
</tr>
</thead>
<tbody><tr>
<td>HuggingFace Transformers</td>
<td>支持</td>
<td>支持</td>
<td>支持</td>
</tr>
<tr>
<td>vLLM</td>
<td>支持</td>
<td>不支持</td>
<td>支持</td>
</tr>
<tr>
<td>SGLang</td>
<td>支持</td>
<td>不支持</td>
<td>支持</td>
</tr>
<tr>
<td>CPM.cu</td>
<td>支持</td>
<td>支持</td>
<td>支持</td>
</tr>
</tbody></table>
<p>对于追求极致推理速度的场景,官方推荐使用 CPM.cu——这是面壁智能自研的轻量级 CUDA 推理框架,集成了稀疏注意力、模型量化和投机采样,在端侧芯片上实现了高效的 prefill 和 decoding。</p>
<h3 id="5-2-tjjmzc">5.2 投机解码支持</h3>
<p>MiniCPM-4.1 支持通过 EAGLE3 协议进行投机解码(Speculative Decoding),需要配合专门的 draft model 使用。在 vLLM 和 SGLang 中均可配置,配置流程包括: (1) 下载 MiniCPM-4.1 draft model; (2) 安装 EAGLE3-compatible 版本的推理框架; (3) 启动服务时指定 draft model 路径。</p>
<h3 id="5-3-lhbs">5.3 量化部署</h3>
<p>通过 BitCPM 三值量化技术,MiniCPM-4.1 可实现 1.58-bit 参数精度,在保持与全精度模型相当性能的同时,将模型体积压缩至原来的约 10%。量化模型支持在 HuggingFace 框架中直接推理,无需专门的量化推理引擎。</p>
<blockquote>
<p>BitCPM 的 1.58-bit 量化是一个相当激进的方案。传统量化通常是 INT8(8-bit)或 INT4(4-bit),1.58-bit 意味着每个参数只有约 3 个可能取值(典型实现为 {-1, 0, 1})。这种极端压缩能在端侧节省大量存储和内存带宽,但代价是: 第一,量化感知训练(QAT)需要额外的训练周期; 第二,1.58-bit 的数值精度对注意力计算中的 softmax 和层归一化等操作可能引入累积误差; 第三,目前主流推理框架(vLLM、SGLang)对三值量化的原生支持仍然有限,实际部署时可能需要回退到 HuggingFace 或 CPM.cu。对于端侧应用,1.58-bit 的存储节省(约 5x)通常值得这些代价,但对于追求最高精度的场景,FP16 或 INT8 仍是更稳妥的选择。</p>
</blockquote>
<hr>
<h2 id="6-mxjzyjspx">6 模型家族与技术谱系</h2>
<h3 id="6-1-mini-cpm-xlyj">6.1 MiniCPM 系列演进</h3>
<table>
<thead>
<tr>
<th>版本</th>
<th>发布时间</th>
<th>核心特征</th>
<th>上下文长度</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-2B</td>
<td>2024.02</td>
<td>端侧基座首发</td>
<td>4K</td>
</tr>
<tr>
<td>MiniCPM-4.0</td>
<td>2025.06</td>
<td>InfLLM v2, 8T tokens</td>
<td>128K(32K 预训练)</td>
</tr>
<tr>
<td><strong>MiniCPM-4.1</strong></td>
<td><strong>2025.09</strong></td>
<td><strong>混合推理, InfLLM-V2</strong></td>
<td><strong>128K(64K 预训练)</strong></td>
</tr>
<tr>
<td>MiniCPM-SALA</td>
<td>2026.02</td>
<td>稀疏+线性注意力混合, 1M 上下文</td>
<td>1M+</td>
</tr>
</tbody></table>
<h3 id="6-2-tlmxjzdw">6.2 推理模型家族定位</h3>
<p>MiniCPM-4.1 在 2025 年的推理模型生态中占据独特的「端侧推理」 niche:</p>
<ul>
<li><strong>DeepSeek-R1</strong> (671B): 云端超大规模推理模型,能力最强但无法端侧部署;</li>
<li><strong>Kimi-K2</strong> (32B): 长文本 + 推理,主要面向云端 API 服务;</li>
<li><strong>Qwen3-8B</strong>: 通用 dense 模型,支持思考模式但无稀疏注意力;</li>
<li><strong>MiniCPM-4.1</strong> (8B): <strong>唯一同时具备「端侧可部署」+「可训练稀疏注意力」+「混合推理模式」的开源模型</strong>。</li>
</ul>
<blockquote>
<p>MiniCPM-4.1 的谱系定位非常有意思。它既不是 DeepSeek-R1 那样的「推理能力优先、部署成本不管」的云端模型,也不是 Qwen3-8B 那样的「通用能力优先、推理靠 brute-force」的 dense 模型。它的核心创新在于证明了: 在 8B 规模的端侧模型上,通过「可训练稀疏注意力 + 混合推理训练」,可以同时获得接近云端模型的推理能力和远低于云端模型的推理成本。InfLLM-V2 论文中的实验数据支撑了这一观点——稀疏注意力在 CoT 推理场景下保留了 99.7% 的 dense attention 性能,同时实现 4x 加速。这意味着端侧设备上的推理模型不再是「阉割版」,而是一个在特定约束(延迟、功耗、内存)下重新优化的独立品类。</p>
</blockquote>
<hr>
<h2 id="fl-a-syb">附录 A: 术语表</h2>
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
<td>Hybrid Reasoning</td>
<td>混合推理</td>
<td>1 模型概述</td>
<td>单模型同时支持深度思考模式和非思考模式的切换能力</td>
</tr>
<tr>
<td>InfLLM-V2</td>
<td>可训练无限长上下文语言模型 v2</td>
<td>2.1</td>
<td>密集-稀疏可切换注意力框架,无需额外参数</td>
</tr>
<tr>
<td>Dense-Sparse Switchable Attention</td>
<td>密集-稀疏可切换注意力</td>
<td>2.1</td>
<td>短序列用 dense attention,长序列自动切换为 sparse attention</td>
</tr>
<tr>
<td>YaRN</td>
<td>yet another RoPE extension method</td>
<td>3.1</td>
<td>通过调整 RoPE 旋转角度实现上下文长度扩展的技术</td>
</tr>
<tr>
<td>BitCPM</td>
<td>三值量化模型</td>
<td>5.3</td>
<td>将模型参数量化至 1.58-bit(约 3 个取值)的极端压缩方案</td>
</tr>
<tr>
<td>EAGLE3</td>
<td>-</td>
<td>5.2</td>
<td>投机解码协议,通过 draft model 预测后续 token 加速生成</td>
</tr>
<tr>
<td>CPM.cu</td>
<td>-</td>
<td>5.1</td>
<td>面壁智能自研的轻量级 CUDA 推理框架</td>
</tr>
<tr>
<td>CoT</td>
<td>Chain-of-Thought,思维链</td>
<td>3.2</td>
<td>模型在输出答案前先输出中间推理步骤的技术</td>
</tr>
<tr>
<td>Needle-in-a-Haystack</td>
<td>大海捞针</td>
<td>3.1</td>
<td>在长文本中插入特定信息并测试模型能否准确检索的评测方法</td>
</tr>
<tr>
<td>NSA</td>
<td>Natively Trainable Sparse Attention</td>
<td>2.1</td>
<td>原生可训练稀疏注意力,使用三组分块注意力 + gating</td>
</tr>
<tr>
<td>GQA</td>
<td>Grouped-Query Attention</td>
<td>2.1</td>
<td>分组查询注意力,Query 头分组共享 KV 头以节省显存</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxgs","text":"1 模型概述"},{"level":2,"id":"2-hxjg","text":"2 核心架构"},{"level":3,"id":"2-1-inf-llm-v2-kxlxszyl","text":"2.1 InfLLM-V2 可训练稀疏注意力"},{"level":3,"id":"2-2-hhtlmsdgcsx","text":"2.2 混合推理模式的工程实现"},{"level":2,"id":"3-xlsjycl","text":"3 训练数据与策略"},{"level":3,"id":"3-1-yxlsj","text":"3.1 预训练数据"},{"level":3,"id":"3-2-hxlsj","text":"3.2 后训练数据"},{"level":2,"id":"4-pgjg","text":"4 评估结果"},{"level":3,"id":"4-1-zhxnpc","text":"4.1 综合性能评测"},{"level":3,"id":"4-2-tlsdpc","text":"4.2 推理速度评测"},{"level":3,"id":"4-3-cwbnl","text":"4.3 长文本能力"},{"level":2,"id":"5-tlybs","text":"5 推理与部署"},{"level":3,"id":"5-1-tlkjzc","text":"5.1 推理框架支持"},{"level":3,"id":"5-2-tjjmzc","text":"5.2 投机解码支持"},{"level":3,"id":"5-3-lhbs","text":"5.3 量化部署"},{"level":2,"id":"6-mxjzyjspx","text":"6 模型家族与技术谱系"},{"level":3,"id":"6-1-mini-cpm-xlyj","text":"6.1 MiniCPM 系列演进"},{"level":3,"id":"6-2-tlmxjzdw","text":"6.2 推理模型家族定位"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/12-mini-cpm-4.1/01-mini-cpm-4.1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/12-mini-cpm-4.1/01-mini-cpm-4.1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-4.1 技术报告精译</h1>
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
