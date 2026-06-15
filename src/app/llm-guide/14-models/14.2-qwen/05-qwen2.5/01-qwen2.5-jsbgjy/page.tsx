"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5 Technical Report 精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文: Qwen Team. &quot;Qwen2.5 Technical Report&quot;. arXiv:2412.15115, 2024.
原文链接: <a href="https://arxiv.org/abs/2412.15115">https://arxiv.org/abs/2412.15115</a></p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>Qwen2.5 是我们持续努力创造更优大型语言模型的成果. 开源权重部分, 我们发布了 0.5B、1.5B、3B、7B、14B、32B 和 72B 共 7 种尺寸的预训练与指令微调模型, 提供 bfloat16 原始模型及多种精度量化模型. 旗舰模型 Qwen2.5-72B-Instruct 展现出与最先进开源模型 Llama-3-405B-Instruct(约 5 倍参数量)相竞争的性能. 此外, 我们还发布了专有 MoE 模型 Qwen2.5-Turbo 与 Qwen2.5-Plus, 分别与 GPT-4o-mini 和 GPT-4o 性能相当.</p>
<p>Qwen2.5 的关键特性包括: <strong>尺寸更丰富</strong> —— 新增 3B、14B、32B 模型, 为资源受限场景提供更优性价比; <strong>数据更优质</strong> —— 预训练数据从 7T 扩展至 18T, 后训练数据超过 100 万条, 覆盖 SFT、DPO 与 GRPO 阶段; <strong>使用更友好</strong> —— 生成长度从 2K 扩展至 8K, 强化结构化输入输出支持, 优化工具调用, Qwen2.5-Turbo 支持最高 100 万 token 上下文.</p>
<blockquote>
<p><strong>技术思考 1.1 | 设计动机</strong>: Qwen2.5 的定位是「Qwen2 的全面升级版」而非「颠覆性创新」. 其核心策略是「数据驱动 + 规模覆盖」: 18T 预训练数据(2.5 倍于 Qwen2)带来基础能力的系统性提升, 7 个开源尺寸(新增 3B/14B/32B)填补了 Qwen2 在「中端性价比」市场的空白, GRPO 的引入则标志着后训练方法论从「DPO 为主」向「RL 深度优化」的演进. 与 Llama-3.1 的「单一大模型(405B) + 长上下文直扩」策略不同, Qwen2.5 选择「全尺寸矩阵 + 渐进式扩展」, 更适合服务多样化的开发者生态.</p>
</blockquote>
<blockquote>
<p><strong>技术思考 1.2 | 技术谱系</strong>: Qwen2.5 处于 Qwen2 与后续 Qwen3 之间的关键迭代节点. 其技术债务继承自 Qwen2(GQA、SwiGLU、RoPE、RMSNorm、DCA+YARN), 但有三项显著进化: (1) <strong>数据规模跃迁</strong> 7T→18T, 验证了 scaling law 在数据端的持续有效性; (2) <strong>GRPO 引入</strong> 标志着 Qwen 系列首次采用「纯 RL」方法优化人类偏好, 与 DeepSeek-Math 的 GRPO 发明形成技术共振; (3) <strong>MoE API 模型</strong> (Turbo/Plus) 的独立发布, 表明 Qwen 团队将 MoE 定位为「成本-性能平衡」的商业化产品, 而非仅作为技术演示.</p>
</blockquote>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>通用人工智能(AGI)的火花正通过大型基础模型的快速发展而日益显现, 尤以大型语言模型(LLM)为甚. 模型与数据的持续扩展, 结合大规模预训练后接高质量 SFT 与 RLHF 的范式, 使 LLM 在语言理解、生成与推理方面涌现出强大能力. 在此基础上, 推理时计算扩展的突破——尤以 o1 为代表——通过逐步推理与反思增强了 LLM 的深入思考能力.</p>
<p>近两年, 开源 LLM 蓬勃发展, 例如 Llama 系列、Mistral 系列及我们的 Qwen 系列. 开源权重模型使 LLM 对普通用户和开发者触手可及, 促进了更广泛的研究参与、社区协作创新及跨领域 AI 应用加速.</p>
<p>本技术报告介绍 Qwen2.5. 开源部分发布 7 种尺寸的预训练与指令微调模型, 包括 0.5B、1.5B、3B、7B、14B、32B 和 72B, 提供 bfloat16 原始模型及多种量化模型. Qwen2.5-72B-Instruct 展现出与 Llama-3-405B-Instruct(约 5 倍参数量)相竞争的性能. 此外, 专有 MoE 模型 Qwen2.5-Turbo 与 Qwen2.5-Plus 分别与 GPT-4o-mini 和 GPT-4o 性能相当.</p>
<hr>
<h2 id="2-jgy-tokenizer">2 架构与 Tokenizer</h2>
<p>Qwen2.5 开源稠密模型包括 Qwen2.5-0.5B/1.5B/3B/7B/14B/32B/72B, 专有 MoE 模型包括 Qwen2.5-Turbo 与 Qwen2.5-Plus. 稠密模型沿用 Qwen2 的 Transformer Decoder  架构, 核心组件包括: GQA 高效 KV cache 利用、SwiGLU 激活、RoPE 位置编码、QKV 偏置、RMSNorm 预归一化. MoE 模型在稠密架构基础上以 MoE 层替换标准 FFN, 采用细粒度专家分割与共享专家路由.</p>
<p>Tokenizer 沿用 Qwen 的 byte-level BPE, 词表 151,643 个常规 token. 控制 token 从 3 个扩展至 22 个, 新增 2 个工具功能 token 及其余能力 token, 建立统一词表以减少兼容性问题.</p>
<p><strong>表 1 | Qwen2.5 开源模型架构与许可</strong></p>
<table>
<thead>
<tr>
<th align="left">Models</th>
<th align="center">Layers</th>
<th align="center">Heads (Q / KV)</th>
<th align="center">Tie Embedding</th>
<th align="center">Context / Gen Length</th>
<th align="center">License</th>
</tr>
</thead>
<tbody><tr>
<td align="left">0.5B</td>
<td align="center">24</td>
<td align="center">14 / 2</td>
<td align="center">Yes</td>
<td align="center">32K / 8K</td>
<td align="center">Apache 2.0</td>
</tr>
<tr>
<td align="left">1.5B</td>
<td align="center">28</td>
<td align="center">12 / 2</td>
<td align="center">Yes</td>
<td align="center">32K / 8K</td>
<td align="center">Apache 2.0</td>
</tr>
<tr>
<td align="left">3B</td>
<td align="center">36</td>
<td align="center">16 / 2</td>
<td align="center">Yes</td>
<td align="center">32K / 8K</td>
<td align="center">Qwen Research</td>
</tr>
<tr>
<td align="left">7B</td>
<td align="center">28</td>
<td align="center">28 / 4</td>
<td align="center">No</td>
<td align="center">128K / 8K</td>
<td align="center">Apache 2.0</td>
</tr>
<tr>
<td align="left">14B</td>
<td align="center">48</td>
<td align="center">40 / 8</td>
<td align="center">No</td>
<td align="center">128K / 8K</td>
<td align="center">Apache 2.0</td>
</tr>
<tr>
<td align="left">32B</td>
<td align="center">64</td>
<td align="center">40 / 8</td>
<td align="center">No</td>
<td align="center">128K / 8K</td>
<td align="center">Apache 2.0</td>
</tr>
<tr>
<td align="left">72B</td>
<td align="center">80</td>
<td align="center">64 / 8</td>
<td align="center">No</td>
<td align="center">128K / 8K</td>
<td align="center">Qwen</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>技术思考 2.1 | 架构细节</strong>: Qwen2.5 的架构表揭示了三个关键设计决策: (1) <strong>0.5B/1.5B/3B 的 embedding tying</strong> 降低小模型参数量(非嵌入参数仅 0.3B/1.2B/2.8B), 是端侧部署的关键; (2) <strong>7B/14B/32B 的 context 128K</strong> 与 Qwen2 一致, 但 3B 及以下仅 32K, 反映了「小模型 × 长上下文 = 高推理成本」的工程权衡; (3) <strong>3B 使用 Qwen Research 许可</strong> 而非 Apache 2.0, 暗示该尺寸可能承载了更多实验性技术或商业考量. 新增 3B 模型是一个重要信号 —— 在 1.5B 与 7B 之间存在显著的性能 gap, 3B 填补了「中端边缘设备」的空白(如 8GB 显存的手机芯片).</p>
</blockquote>
<hr>
<h2 id="3-yxl">3 预训练</h2>
<h3 id="3-1-yxlsj">3.1 预训练数据</h3>
<p>Qwen2.5 预训练数据相较 Qwen2 实现四维度提升:</p>
<ul>
<li><strong>更好的数据过滤</strong>: 使用 Qwen2-Instruct 模型作为数据质量过滤器, 进行多维度综合评分. 受益于 Qwen2 在更大规模多语言语料上的预训练, 过滤方法在保留高质量数据与剔除低质样本方面均有提升.</li>
<li><strong>更好的数学与代码数据</strong>: 整合 Qwen2.5-Math 与 Qwen2.5-Coder 的训练数据, 使模型在数学推理与代码生成方面达到 SOTA.</li>
<li><strong>更好的合成数据</strong>: 利用 Qwen2-72B-Instruct 与 Qwen2-Math-72B-Instruct 生成高质量合成数据(数学、代码、知识领域), 并通过专有通用奖励模型与 Qwen2-Math-RM-72B 进行严格过滤.</li>
<li><strong>更好的数据混合</strong>: 使用 Qwen2-Instruct 模型分类平衡各 domain 内容. 分析发现电商、社交媒体、娱乐等在网页数据中过度代表且包含重复/模板化/机器生成内容; 科技、科学、学术研究等高质量 domain 传统上代表不足. 通过对过度代表 domain 降采样与高价值 domain 升采样, 确保更均衡且信息丰富的训练数据集.</li>
</ul>
<p>基于这些技术, 预训练数据集从 Qwen2 的 7 万亿 token 扩展至 <strong>18 万亿 token</strong>.</p>
<blockquote>
<p><strong>技术思考 3.1 | 数据实验</strong>: Qwen2.5 的「18T」是 Qwen2「7T 质量 &gt; 12T 数量」结论的直接反转. 从 7T 到 18T, 团队显然找到了突破质量天花板的方法 —— 核心手段是<strong>合成数据</strong>与<strong>专业化数据</strong>(Math/Coder). 合成数据由 72B 模型生成并由奖励模型过滤, 这意味着数据质量的上限由生成模型的能力决定, 形成一个「模型越好 → 合成数据越好 → 下一代模型越好」的正反馈循环. 这种自举数据合成(self-bootstrapping data synthesis)是 2024 年 LLM 训练的关键趋势, Qwen2.5、Llama-3 与 DeepSeek-V3 均采用了类似策略.</p>
</blockquote>
<h3 id="3-2-ccsd-scaling-law">3.2 超参数的 Scaling Law</h3>
<p>Qwen2.5 发展了基于预训练数据的超参数 scaling law. 与此前研究主要用 scaling law 确定给定计算预算下的最优模型尺寸不同, Qwen2.5 利用 scaling law 识别不同架构的最优训练超参数. 具体而言, 分析最优学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>μ</mi><mtext>opt</mtext></msub></mrow><annotation encoding="application/x-tex">\\mu_{\\text{opt}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">μ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">opt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 与 batch size <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>B</mi><mtext>opt</mtext></msub></mrow><annotation encoding="application/x-tex">B_{\\text{opt}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">opt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 如何随模型尺寸 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 与预训练数据量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span> 变化. 实验覆盖 44M 至 14B 参数的稠密模型与 44M 至 1B 激活参数的 MoE 模型, 训练数据量从 0.8B 到 600B token.</p>
<p>此外, scaling law 用于预测不同参数量的 MoE 模型相对于稠密模型的性能, 指导 MoE 模型的超参数配置, 使 Qwen2.5-Turbo 与 Qwen2.5-Plus 在激活/总参数量调优后达到与特定稠密变体(如 72B、14B)相当的性能.</p>
<blockquote>
<p><strong>技术思考 3.2 | 架构细节</strong>: 将 scaling law 用于「超参数预测」而非仅「模型尺寸预测」是一个工程上的精明选择. 传统做法是在固定超参下训练多个尺寸的模型拟合 loss curve, 然后选最优尺寸. Qwen2.5 的做法更实用: 对每个候选架构(不同层数/头数/FFN 尺寸), 用小型 proxy 模型(44M-1B)快速探索超参空间, 建立 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>μ</mi></mrow><annotation encoding="application/x-tex">\\mu</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">μ</span></span></span></span>-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 的映射关系, 然后外推到目标尺寸. 这避免了在 72B 模型上进行昂贵的超参搜索. 论文未披露具体 scaling law 公式, 但通常形式为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>μ</mi><mtext>opt</mtext></msub><mo>∝</mo><msup><mi>N</mi><mrow><mo>−</mo><mn>0.5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\mu_{\\text{opt}} \\propto N^{-0.5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">μ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">opt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">0.5</span></span></span></span></span></span></span></span></span></span></span></span> 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>B</mi><mtext>opt</mtext></msub><mo>∝</mo><msup><mi>N</mi><mn>0.5</mn></msup><msup><mi>D</mi><mn>0.5</mn></msup></mrow><annotation encoding="application/x-tex">B_{\\text{opt}} \\propto N^{0.5} D^{0.5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">opt</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.5</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.5</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
</blockquote>
<h3 id="3-3-csxwyxl">3.3 长上下文预训练</h3>
<p>Qwen2.5 采用两阶段预训练: 初始阶段 4,096 token 上下文, 后续扩展至更长序列. 除 Qwen2.5-Turbo 外, 所有模型在预训练最后阶段将上下文从 4,096 扩展至 32,768 token, 同时将 RoPE 基频从 10,000 提升至 1,000,000(ABF 技术).</p>
<p>Qwen2.5-Turbo 采用渐进式上下文扩展: 32,768 → 65,536 → 131,072 → 262,144 token, RoPE 基频 10,000,000. 每阶段精心筛选训练数据, 包含 40% 当前最大长度序列与 60% 较短序列, 使模型平稳适应递增的上下文长度同时保持对变长序列的泛化能力.</p>
<p>推理阶段通过 YARN 与 DCA 将序列长度能力提升 4 倍, Qwen2.5-Turbo 支持最高 <strong>100 万 token</strong>, 其他模型支持 131,072 token. 这些方法在降低长序列困惑度的同时保持短序列性能.</p>
<hr>
<h2 id="4-hxl">4 后训练</h2>
<p>Qwen2.5 相较 Qwen2 在后训练上有两大进展:</p>
<ol>
<li><strong>SFT 数据覆盖扩展</strong>: 利用数百万高质量示例, 针对性解决前代模型的关键短板, 包括长序列生成、数学解题、代码生成、指令遵循、结构化数据理解、逻辑推理、跨语言迁移与鲁棒系统指令.</li>
<li><strong>两阶段强化学习</strong>: RL 分为离线 RL 与在线 RL.<ul>
<li><strong>离线 RL</strong>: 聚焦奖励模型难以评估的能力(推理、事实性、指令遵循), 通过精心构建与验证训练数据确保信号可学习与可靠.</li>
<li><strong>在线 RL</strong>: 利用奖励模型检测输出质量的细微差别(真实性、有用性、简洁性、相关性、无害性、去偏), 生成精确、连贯、结构良好的回复.</li>
</ul>
</li>
</ol>
<h3 id="4-1-jdwt">4.1 监督微调</h3>
<p>Qwen2.5 SFT 在以下 9 个关键领域进行增强:</p>
<ul>
<li><strong>长序列生成</strong>: 支持最高 8,192 token 输出. 采用回译技术从预训练语料生成长文本查询, 施加输出长度约束, 并用 Qwen2 过滤低质量配对数据.</li>
<li><strong>数学</strong>: 引入 Qwen2.5-Math 的思维链数据, 涵盖公开数据集、K-12 题库与合成问题. 采用拒绝采样结合奖励模型与标注答案指导, 生成逐步推理过程.</li>
<li><strong>代码</strong>: 引入 Qwen2.5-Coder 的指令微调数据. 使用多语言特定 agent 协作框架生成近 40 种编程语言的高质量指令对. 通过多语言沙箱进行静态代码检查与自动单元测试验证.</li>
<li><strong>指令遵循</strong>: 实现基于代码的验证框架, LLM 生成指令与验证代码及单元测试, 通过执行反馈的拒绝采样筛选训练数据.</li>
<li><strong>结构化数据理解</strong>: 开发涵盖表格问答、事实验证、错误修正、结构化/半结构化数据复杂任务的综合性数据集, 在回复中融入推理链.</li>
<li><strong>逻辑推理</strong>: 引入 70,000 条涵盖多选题、判断题与开放题的新查询, 训练模型运用演绎推理、归纳概括、类比推理、因果推理与统计推理.</li>
<li><strong>跨语言迁移</strong>: 使用翻译模型将高资源语言指令转换为低资源语言, 评估多语言回复与原文的语义对齐.</li>
<li><strong>鲁棒系统指令</strong>: 构建数百个通用系统提示以提升多样性, 确保系统提示与对话的一致性.</li>
<li><strong>回复过滤</strong>: 采用专用 critic 模型与多 agent 协作评分系统, 仅保留被所有评分系统判定为无瑕疵的回复.</li>
</ul>
<p>最终构建超过 100 万条 SFT 示例. 模型以 32,768 token 序列长度微调两个 epoch, 学习率从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>, 权重衰减 0.1, 梯度裁剪最大值 1.0.</p>
<blockquote>
<p><strong>技术思考 4.1 | 数据实验</strong>: Qwen2.5 的 SFT 数据集从 Qwen2 的 50 万扩展到 100 万+, 且覆盖 9 个独立领域. 这种「领域拆分 + 专项增强」的策略与 Qwen2 的「通用协同标注 + 自动化合成」形成代际差异. 值得注意的是, 9 个领域中有 3 个(数学/代码/结构化数据)直接引入了专业化子模型(Qwen2.5-Math/Coder)的数据, 这验证了一个重要假设: <strong>专业化模型的训练数据可作为通用模型的「能力补丁」</strong>. 这种「特化→通用」的数据迁移比「通用→特化」更高效, 因为特化数据经过了更高密度的质量筛选.</p>
</blockquote>
<h3 id="4-2-lxqhxx">4.2 离线强化学习</h3>
<p>离线 RL 针对存在标准答案但奖励模型难以准确评估的任务(数学、代码、指令遵循、逻辑推理). 复用 SFT 阶段的执行反馈与答案匹配流水线, 用 SFT 模型对新查询集重采样回复. 通过质量检查的回复作为正例, 未通过的作为负例进行 DPO 训练. 通过人工与自动审查双重验证确保训练信号的可靠性.</p>
<p>最终构建约 150,000 训练对. 模型使用 Online Merging Optimizer 训练一个 epoch, 学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
<h3 id="4-3-zxqhxx">4.3 在线强化学习</h3>
<p>Qwen2.5 在线 RL 采用 <strong>Group Relative Policy Optimization(GRPO, DeepSeek-Math)</strong>. 奖励模型的训练数据来自开源数据与更高复杂度的专有查询集, 回复由不同训练阶段(SFT/DPO/RL)与不同温度的 Qwen 模型 checkpoint 采样生成.</p>
<p>奖励模型的标注准则涵盖 6 个维度:</p>
<ul>
<li><strong>真实性</strong>: 回复必须基于事实准确, 忠实反映上下文与指令</li>
<li><strong>有用性</strong>: 输出应真正有用, 积极、引人入胜、教育性强且相关</li>
<li><strong>简洁性</strong>: 回复应简明扼要, 避免不必要的冗长</li>
<li><strong>相关性</strong>: 所有内容应与用户查询、对话历史与 assistant 上下文直接相关</li>
<li><strong>无害性</strong>: 避免任何可能导致非法、不道德或有害行为的内容</li>
<li><strong>去偏</strong>: 回复应无性别、种族、国籍、政治等偏见</li>
</ul>
<p>在线 RL 中, 查询按奖励模型评估的回复分数方差排序, 优先处理方差高的查询以确保更有效学习. 每个查询采样 8 条回复, 全局 batch size 2048, 每轮 2048 样本.</p>
<blockquote>
<p><strong>技术思考 4.2 | 架构细节</strong>: Qwen2.5 引入 GRPO 是其后训练方法论的最重大升级. GRPO 与 PPO 的核心差异在于<strong>无需 critic 模型</strong>: PPO 需要单独的 value network 估计优势函数, 而 GRPO 通过「组内相对奖励」直接估计基线. 具体而言, 对每个查询采样一组回复(论文中为 8 条), 用奖励模型打分, 组内分数的均值作为基线, 每条回复的优势为其分数与基线之差. 这大幅降低了 RL 的内存与计算开销(无需维护 critic), 同时避免了 critic 模型本身的训练不稳定性. Qwen2.5 选择 GRPO 而非 DeepSeek-R1 的纯 RL(无 SFT 启动), 说明其定位是「SFT + DPO 基础上的 RL 精调」而非「从零 RL 探索」. 这种渐进式策略更适合工业化场景 —— 风险可控, 收敛稳定.</p>
</blockquote>
<blockquote>
<p><strong>技术思考 4.3 | 局限性</strong>: Qwen2.5 的在线 RL 仅使用短指令(≤32K), 原因有二: (1) 长上下文 RL 计算成本极高; (2) 缺乏适合长上下文的奖励模型. 这是一个关键工程约束 —— 即使 Qwen2.5-Turbo 支持 1M 上下文, 其后训练中的 RL 优化并未直接针对长上下文进行. 论文发现「仅在短指令上进行 RL 仍能显著提升长上下文任务中的人类偏好对齐」, 这表明短上下文习得的「有用性/真实性/简洁性」等通用偏好具有跨长度迁移能力. 但这也意味着长上下文特有的能力(如长文档摘要的连贯性、多跳推理的准确性)可能未在 RL 阶段被充分优化.</p>
</blockquote>
<h3 id="4-4-csxwwt">4.4 长上下文微调</h3>
<p>Qwen2.5-Turbo 的后训练采用两阶段 SFT: 第一阶段仅用 ≤32K token 的短指令(与其他模型相同); 第二阶段混合短指令(≤32K)与长指令(≤262K). 这种混合方法在增强长上下文指令遵循能力的同时保持短任务性能. RL 阶段仅使用短指令.</p>
<hr>
<h2 id="5-sy">5 实验</h2>
<p>为防止测试数据泄露, 构建训练数据时采用 n-gram 匹配排除潜在污染. 沿用 Qwen2 标准: 对 tokenized 序列, 若存在测试序列使 LCS 长度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≥</mo><mn>13</mn></mrow><annotation encoding="application/x-tex">\\geq 13</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">13</span></span></span></span> 且 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≥</mo><mn>0.6</mn><mo>×</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi mathvariant="normal">∣</mi><msub><mi mathvariant="bold">s</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mo separator="true">,</mo><mi mathvariant="normal">∣</mi><msub><mi mathvariant="bold">s</mi><mi>e</mi></msub><mi mathvariant="normal">∣</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\geq 0.6 \\times \\min(|\\mathbf{s}_t|, |\\mathbf{s}_e|)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">0.6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord">∣</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mclose">)</span></span></span></span>, 则移除该训练序列.</p>
<h3 id="5-1-jcyymx">5.1 基础语言模型</h3>
<p>基础模型评估聚焦自然语言理解、通用问答、编程、数学、科学知识、推理与多语言能力. 评估数据集包括: MMLU/MMLU-Pro/MMLU-redux(5-shot)、BBH(3-shot)、ARC-C(25-shot)、TruthfulQA(0-shot)、Winogrande(5-shot)、HellaSwag(10-shot)、GPQA/Theorem QA(5-shot)、GSM8K(4-shot)、MATH(4-shot)、HumanEval/HumanEval+/MBPP/MBPP+/MultiPL-E(0-shot)、多语言 Exam/Understanding/Mathematics/Translation.</p>
<p><strong>表 2 | 70B+ 基础模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Llama-3-70B</th>
<th align="center">Mixtral-8x22B</th>
<th align="center">Llama-3-405B</th>
<th align="center">Qwen2-72B</th>
<th align="center">Qwen2.5-72B</th>
<th align="center">Qwen2.5-Plus</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">79.5</td>
<td align="center">77.8</td>
<td align="center">85.2</td>
<td align="center">84.2</td>
<td align="center"><strong>86.1</strong></td>
<td align="center">85.4</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">52.8</td>
<td align="center">51.6</td>
<td align="center">61.6</td>
<td align="center">55.7</td>
<td align="center">58.1</td>
<td align="center"><strong>64.0</strong></td>
</tr>
<tr>
<td align="left">MMLU-redux</td>
<td align="center">75.0</td>
<td align="center">72.9</td>
<td align="center">-</td>
<td align="center">80.5</td>
<td align="center"><strong>83.9</strong></td>
<td align="center">82.8</td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">81.0</td>
<td align="center">78.9</td>
<td align="center">85.9</td>
<td align="center">82.4</td>
<td align="center"><strong>86.3</strong></td>
<td align="center">85.8</td>
</tr>
<tr>
<td align="left">ARC-C</td>
<td align="center">68.8</td>
<td align="center">70.7</td>
<td align="center">-</td>
<td align="center">68.9</td>
<td align="center"><strong>72.4</strong></td>
<td align="center">70.9</td>
</tr>
<tr>
<td align="left">TruthfulQA</td>
<td align="center">45.6</td>
<td align="center">51.0</td>
<td align="center">-</td>
<td align="center">54.8</td>
<td align="center"><strong>60.4</strong></td>
<td align="center">55.3</td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">36.3</td>
<td align="center">34.3</td>
<td align="center">-</td>
<td align="center">37.4</td>
<td align="center"><strong>45.9</strong></td>
<td align="center">43.9</td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">32.3</td>
<td align="center">35.9</td>
<td align="center">-</td>
<td align="center">42.8</td>
<td align="center">42.4</td>
<td align="center"><strong>48.5</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">42.5</td>
<td align="center">41.7</td>
<td align="center">53.8</td>
<td align="center">50.9</td>
<td align="center">62.1</td>
<td align="center"><strong>64.4</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">77.6</td>
<td align="center">83.7</td>
<td align="center">89.0</td>
<td align="center">89.0</td>
<td align="center">91.5</td>
<td align="center"><strong>93.0</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">48.2</td>
<td align="center">46.3</td>
<td align="center"><strong>61.0</strong></td>
<td align="center">64.6</td>
<td align="center">59.1</td>
<td align="center">59.1</td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">70.4</td>
<td align="center">71.7</td>
<td align="center">73.0</td>
<td align="center">76.9</td>
<td align="center"><strong>84.7</strong></td>
<td align="center">79.7</td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">46.3</td>
<td align="center">46.7</td>
<td align="center">-</td>
<td align="center">59.6</td>
<td align="center">60.5</td>
<td align="center"><strong>61.0</strong></td>
</tr>
<tr>
<td align="left">Multi-Exam</td>
<td align="center">70.0</td>
<td align="center">63.5</td>
<td align="center">-</td>
<td align="center">76.6</td>
<td align="center"><strong>78.7</strong></td>
<td align="center">78.5</td>
</tr>
<tr>
<td align="left">Multi-Understanding</td>
<td align="center">79.9</td>
<td align="center">77.7</td>
<td align="center">-</td>
<td align="center">80.7</td>
<td align="center"><strong>89.6</strong></td>
<td align="center">89.2</td>
</tr>
<tr>
<td align="left">Multi-Mathematics</td>
<td align="center">67.1</td>
<td align="center">62.9</td>
<td align="center">-</td>
<td align="center">76.0</td>
<td align="center">76.7</td>
<td align="center"><strong>82.4</strong></td>
</tr>
<tr>
<td align="left">Multi-Translation</td>
<td align="center">38.0</td>
<td align="center">23.3</td>
<td align="center">-</td>
<td align="center">37.8</td>
<td align="center">39.0</td>
<td align="center"><strong>40.4</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-72B 在绝大多数任务上显著领先同尺寸基线, 并以 1/5 参数量达到与 Llama-3-405B 相当的性能. Qwen2.5-Plus 以显著更低的训练与推理成本在 Hellaswag、TheoremQA、MATH、GSM8K、MultiPL-E 等任务上超越 Qwen2.5-72B.</p>
<p><strong>表 3 | 14B-30B+ 基础模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen1.5-32B</th>
<th align="center">Gemma2-27B</th>
<th align="center">Yi-1.5-34B</th>
<th align="center">Qwen2.5-Turbo</th>
<th align="center">Qwen2.5-14B</th>
<th align="center">Qwen2.5-32B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">74.3</td>
<td align="center">75.2</td>
<td align="center">77.2</td>
<td align="center">79.5</td>
<td align="center">79.7</td>
<td align="center"><strong>83.3</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">44.1</td>
<td align="center">49.1</td>
<td align="center">48.3</td>
<td align="center"><strong>55.6</strong></td>
<td align="center">51.2</td>
<td align="center">55.1</td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">66.8</td>
<td align="center">74.9</td>
<td align="center">76.4</td>
<td align="center">76.1</td>
<td align="center">78.2</td>
<td align="center"><strong>84.5</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">36.1</td>
<td align="center">42.7</td>
<td align="center">41.7</td>
<td align="center">55.6</td>
<td align="center">55.6</td>
<td align="center"><strong>57.7</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">78.5</td>
<td align="center">81.1</td>
<td align="center">81.7</td>
<td align="center">88.3</td>
<td align="center">90.2</td>
<td align="center"><strong>92.9</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">43.3</td>
<td align="center">54.9</td>
<td align="center">46.3</td>
<td align="center">57.3</td>
<td align="center">56.7</td>
<td align="center"><strong>58.5</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">64.2</td>
<td align="center">75.7</td>
<td align="center">65.5</td>
<td align="center">76.2</td>
<td align="center">76.7</td>
<td align="center"><strong>84.5</strong></td>
</tr>
<tr>
<td align="left">Multi-Exam</td>
<td align="center">61.6</td>
<td align="center">65.8</td>
<td align="center">58.3</td>
<td align="center">70.3</td>
<td align="center">70.6</td>
<td align="center"><strong>75.4</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-32B 在数学(MATH 57.7)与编程(MBPP 84.5)方面表现突出. Qwen2.5-Turbo 以显著更低的成本在 MMLU-Pro 上甚至优于 Qwen2.5-32B.</p>
<p><strong>表 4 | 7B+ 基础模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Mistral-7B</th>
<th align="center">Llama3-8B</th>
<th align="center">Gemma2-9B</th>
<th align="center">Qwen2-7B</th>
<th align="center">Qwen2.5-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">64.2</td>
<td align="center">66.6</td>
<td align="center">71.3</td>
<td align="center">70.3</td>
<td align="center"><strong>74.2</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">30.9</td>
<td align="center">35.4</td>
<td align="center">44.7</td>
<td align="center">40.1</td>
<td align="center"><strong>45.0</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">56.1</td>
<td align="center">57.7</td>
<td align="center">68.2</td>
<td align="center">62.3</td>
<td align="center"><strong>70.4</strong></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">24.7</td>
<td align="center">25.8</td>
<td align="center">32.8</td>
<td align="center">30.8</td>
<td align="center"><strong>36.4</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">10.2</td>
<td align="center">20.5</td>
<td align="center">37.7</td>
<td align="center">43.5</td>
<td align="center"><strong>49.8</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">36.2</td>
<td align="center">55.3</td>
<td align="center">70.7</td>
<td align="center">80.2</td>
<td align="center"><strong>85.4</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">29.3</td>
<td align="center">33.5</td>
<td align="center">37.8</td>
<td align="center">51.2</td>
<td align="center"><strong>57.9</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">51.1</td>
<td align="center">53.9</td>
<td align="center">62.2</td>
<td align="center">64.2</td>
<td align="center"><strong>74.9</strong></td>
</tr>
<tr>
<td align="left">Multi-Exam</td>
<td align="center">47.1</td>
<td align="center">52.3</td>
<td align="center"><strong>61.2</strong></td>
<td align="center">59.2</td>
<td align="center">59.4</td>
</tr>
<tr>
<td align="left">Multi-Understanding</td>
<td align="center">63.3</td>
<td align="center">68.6</td>
<td align="center">78.3</td>
<td align="center">72.0</td>
<td align="center"><strong>79.3</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-7B 非嵌入参数量仅 6.5B(低于 Gemma2-9B 的 8.2B), 却在绝大多数任务上领先.</p>
<p><strong>表 5 | 小基础模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen2-0.5B</th>
<th align="center">Qwen2.5-0.5B</th>
<th align="center">Qwen2-1.5B</th>
<th align="center">Qwen2.5-1.5B</th>
<th align="center">Gemma2-2.6B</th>
<th align="center">Qwen2.5-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">44.3</td>
<td align="center">47.5</td>
<td align="center">55.9</td>
<td align="center">60.9</td>
<td align="center">52.2</td>
<td align="center"><strong>65.6</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">14.7</td>
<td align="center">15.7</td>
<td align="center">21.6</td>
<td align="center">28.5</td>
<td align="center">23.0</td>
<td align="center"><strong>34.6</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">18.2</td>
<td align="center">20.3</td>
<td align="center">36.5</td>
<td align="center">45.1</td>
<td align="center">41.9</td>
<td align="center"><strong>56.3</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">11.2</td>
<td align="center">19.5</td>
<td align="center">21.6</td>
<td align="center">35.0</td>
<td align="center">18.3</td>
<td align="center"><strong>42.6</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">36.4</td>
<td align="center">41.6</td>
<td align="center">46.9</td>
<td align="center">68.5</td>
<td align="center">30.3</td>
<td align="center"><strong>79.1</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">22.6</td>
<td align="center">30.5</td>
<td align="center">34.8</td>
<td align="center">37.2</td>
<td align="center">19.5</td>
<td align="center"><strong>42.1</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">33.1</td>
<td align="center">39.3</td>
<td align="center">46.9</td>
<td align="center"><strong>60.2</strong></td>
<td align="center">42.1</td>
<td align="center">57.1</td>
</tr>
<tr>
<td align="left">Multi-Exam</td>
<td align="center">29.4</td>
<td align="center">30.8</td>
<td align="center">43.1</td>
<td align="center">47.9</td>
<td align="center">38.1</td>
<td align="center"><strong>54.6</strong></td>
</tr>
<tr>
<td align="left">Multi-Understanding</td>
<td align="center">40.4</td>
<td align="center">41.0</td>
<td align="center">50.7</td>
<td align="center">65.1</td>
<td align="center">46.8</td>
<td align="center"><strong>76.6</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-0.5B 在多项数学与编程任务上超越 Gemma2-2.6B. Qwen2.5-3B 展现出与小尺寸不相称的强劲性能.</p>
<h3 id="5-2-zlwtmx">5.2 指令微调模型</h3>
<p>指令模型评估使用开放基准与内部数据集, 特别关注长上下文能力.</p>
<p><strong>表 6 | 70B+ 指令模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Llama-3.1-70B</th>
<th align="center">Llama-3.1-405B</th>
<th align="center">Qwen2-72B</th>
<th align="center">Qwen2.5-72B</th>
<th align="center">Qwen2.5-Plus</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">66.4</td>
<td align="center"><strong>73.3</strong></td>
<td align="center">64.4</td>
<td align="center">71.1</td>
<td align="center">72.5</td>
</tr>
<tr>
<td align="left">MMLU-redux</td>
<td align="center">83.0</td>
<td align="center">86.2</td>
<td align="center">81.6</td>
<td align="center"><strong>86.8</strong></td>
<td align="center">86.3</td>
</tr>
<tr>
<td align="left">LiveBench 0831</td>
<td align="center">46.6</td>
<td align="center">53.2</td>
<td align="center">41.5</td>
<td align="center">52.3</td>
<td align="center"><strong>54.6</strong></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">46.7</td>
<td align="center"><strong>51.1</strong></td>
<td align="center">42.4</td>
<td align="center">49.0</td>
<td align="center">49.7</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">68.0</td>
<td align="center">73.8</td>
<td align="center">69.0</td>
<td align="center">83.1</td>
<td align="center"><strong>84.7</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">95.1</td>
<td align="center"><strong>96.8</strong></td>
<td align="center">93.2</td>
<td align="center">95.8</td>
<td align="center">96.0</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">80.5</td>
<td align="center"><strong>89.0</strong></td>
<td align="center">86.0</td>
<td align="center">86.6</td>
<td align="center">87.8</td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">84.2</td>
<td align="center">84.5</td>
<td align="center">80.2</td>
<td align="center"><strong>88.2</strong></td>
<td align="center">85.5</td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">68.2</td>
<td align="center">73.5</td>
<td align="center">69.2</td>
<td align="center">75.1</td>
<td align="center"><strong>77.0</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">32.1</td>
<td align="center">41.6</td>
<td align="center">32.2</td>
<td align="center"><strong>55.5</strong></td>
<td align="center">51.4</td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">83.6</td>
<td align="center">86.0</td>
<td align="center">77.6</td>
<td align="center">84.1</td>
<td align="center"><strong>86.3</strong></td>
</tr>
<tr>
<td align="left">Arena-Hard</td>
<td align="center">55.7</td>
<td align="center">69.3</td>
<td align="center">48.1</td>
<td align="center">81.2</td>
<td align="center"><strong>81.4</strong></td>
</tr>
<tr>
<td align="left">MT-Bench</td>
<td align="center">8.79</td>
<td align="center">9.08</td>
<td align="center">9.12</td>
<td align="center"><strong>9.35</strong></td>
<td align="center">9.30</td>
</tr>
</tbody></table>
<p>Qwen2.5-72B-Instruct 在 MMLU-redux、MATH、MBPP、MultiPL-E、LiveCodeBench、Arena-Hard 与 MT-Bench 上超越 Llama-3.1-405B-Instruct. Qwen2.5-Plus 在 13 项基准中的 9 项上优于 Qwen2.5-72B.</p>
<p><strong>表 7 | 14B-30B+ 指令模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen2-57BA14B</th>
<th align="center">Gemma2-27B</th>
<th align="center">GPT4o-mini</th>
<th align="center">Qwen2.5-Turbo</th>
<th align="center">Qwen2.5-14B</th>
<th align="center">Qwen2.5-32B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">52.8</td>
<td align="center">55.5</td>
<td align="center">63.1</td>
<td align="center">64.5</td>
<td align="center">63.7</td>
<td align="center"><strong>69.0</strong></td>
</tr>
<tr>
<td align="left">LiveBench 0831</td>
<td align="center">31.1</td>
<td align="center">39.6</td>
<td align="center">43.3</td>
<td align="center">42.3</td>
<td align="center">44.4</td>
<td align="center"><strong>50.7</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">49.1</td>
<td align="center">54.4</td>
<td align="center">70.2</td>
<td align="center">81.1</td>
<td align="center">80.0</td>
<td align="center"><strong>83.1</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">85.3</td>
<td align="center">90.4</td>
<td align="center">93.2</td>
<td align="center">93.8</td>
<td align="center">94.8</td>
<td align="center"><strong>95.9</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">79.9</td>
<td align="center">78.7</td>
<td align="center"><strong>88.4</strong></td>
<td align="center">86.6</td>
<td align="center">83.5</td>
<td align="center"><strong>88.4</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">22.5</td>
<td align="center">-</td>
<td align="center">40.7</td>
<td align="center">37.8</td>
<td align="center">42.6</td>
<td align="center"><strong>51.2</strong></td>
</tr>
<tr>
<td align="left">Arena-Hard</td>
<td align="center">17.8</td>
<td align="center">57.5</td>
<td align="center"><strong>74.9</strong></td>
<td align="center">67.1</td>
<td align="center">68.3</td>
<td align="center">74.5</td>
</tr>
<tr>
<td align="left">MT-Bench</td>
<td align="center">8.55</td>
<td align="center">9.10</td>
<td align="center">-</td>
<td align="center">8.81</td>
<td align="center">8.88</td>
<td align="center"><strong>9.20</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-32B-Instruct 在大多数任务上优于同尺寸模型. Qwen2.5-Turbo 以显著更低的成本在 10 项基准中的 8 项上超越 Qwen2.5-14B.</p>
<p><strong>表 8 | 7B+ 指令模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Gemma2-9B</th>
<th align="center">Llama3.1-8B</th>
<th align="center">Qwen2-7B</th>
<th align="center">Qwen2.5-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">52.1</td>
<td align="center">48.3</td>
<td align="center">44.1</td>
<td align="center"><strong>56.3</strong></td>
</tr>
<tr>
<td align="left">LiveBench 0831</td>
<td align="center">30.6</td>
<td align="center">26.7</td>
<td align="center">29.2</td>
<td align="center"><strong>35.9</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">44.3</td>
<td align="center">51.9</td>
<td align="center">52.9</td>
<td align="center"><strong>75.5</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">76.7</td>
<td align="center">84.5</td>
<td align="center">85.7</td>
<td align="center"><strong>91.6</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">68.9</td>
<td align="center">72.6</td>
<td align="center">79.9</td>
<td align="center"><strong>84.8</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">74.9</td>
<td align="center">69.6</td>
<td align="center">67.2</td>
<td align="center"><strong>79.2</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">18.9</td>
<td align="center">8.3</td>
<td align="center">23.9</td>
<td align="center"><strong>28.7</strong></td>
</tr>
<tr>
<td align="left">Arena-Hard</td>
<td align="center">41.6</td>
<td align="center">27.8</td>
<td align="center">25.0</td>
<td align="center"><strong>52.0</strong></td>
</tr>
<tr>
<td align="left">MT-Bench</td>
<td align="center">8.49</td>
<td align="center">8.23</td>
<td align="center">8.26</td>
<td align="center"><strong>8.75</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-7B-Instruct 在 MATH(75.5)与 Arena-Hard(52.0)上展现显著优势.</p>
<p><strong>表 9 | 2B-4B 指令模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Gemma2-2B</th>
<th align="center">Phi3.5-Mini</th>
<th align="center">MiniCPM3-4B</th>
<th align="center">Qwen2.5-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Non-Emb Params</td>
<td align="center">2.0B</td>
<td align="center">3.6B</td>
<td align="center">4.0B</td>
<td align="center">2.8B</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">26.6</td>
<td align="center">48.5</td>
<td align="center">46.6</td>
<td align="center"><strong>65.9</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">63.2</td>
<td align="center">86.2</td>
<td align="center">81.1</td>
<td align="center"><strong>86.7</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">68.9</td>
<td align="center">72.6</td>
<td align="center"><strong>74.4</strong></td>
<td align="center"><strong>74.4</strong></td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">30.5</td>
<td align="center">47.2</td>
<td align="center">49.1</td>
<td align="center"><strong>60.2</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-3B-Instruct 以更少参数在数学与编程上超越 Phi3.5-Mini 与 MiniCPM3-4B.</p>
<p><strong>表 10 | 0.5B-1.5B 指令模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen2-0.5B</th>
<th align="center">Qwen2.5-0.5B</th>
<th align="center">Qwen2-1.5B</th>
<th align="center">Qwen2.5-1.5B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MATH</td>
<td align="center">13.9</td>
<td align="center"><strong>34.4</strong></td>
<td align="center">25.3</td>
<td align="center"><strong>55.2</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">40.1</td>
<td align="center"><strong>49.6</strong></td>
<td align="center">61.6</td>
<td align="center"><strong>73.2</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">31.1</td>
<td align="center"><strong>35.4</strong></td>
<td align="center">42.1</td>
<td align="center"><strong>61.6</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">39.7</td>
<td align="center"><strong>49.6</strong></td>
<td align="center">44.2</td>
<td align="center"><strong>63.2</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">1.6</td>
<td align="center"><strong>5.1</strong></td>
<td align="center">4.5</td>
<td align="center"><strong>14.8</strong></td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">14.6</td>
<td align="center"><strong>27.9</strong></td>
<td align="center">29.0</td>
<td align="center"><strong>42.5</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-1.5B-Instruct 的 MATH(55.2)相比 Qwen2-1.5B(25.3)提升超过一倍.</p>
<h3 id="5-3-nbzdpg">5.3 内部自动评估</h3>
<p><strong>表 11 | 内部英文自动评估基准</strong></p>
<table>
<thead>
<tr>
<th align="left">Models</th>
<th align="center">IF</th>
<th align="center">Knowledge</th>
<th align="center">Comprehension</th>
<th align="center">Coding</th>
<th align="center">Math</th>
<th align="center">Reasoning</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4o-08</td>
<td align="center">83.28</td>
<td align="center">68.08</td>
<td align="center">76.51</td>
<td align="center">58.05</td>
<td align="center">52.36</td>
<td align="center">66.45</td>
</tr>
<tr>
<td align="left">Claude3.5-sonnet</td>
<td align="center">84.22</td>
<td align="center">74.61</td>
<td align="center">79.02</td>
<td align="center">67.17</td>
<td align="center">48.67</td>
<td align="center">70.20</td>
</tr>
<tr>
<td align="left">Qwen2-72B-Instruct</td>
<td align="center">76.08</td>
<td align="center">59.49</td>
<td align="center">72.19</td>
<td align="center">48.95</td>
<td align="center">48.07</td>
<td align="center">60.33</td>
</tr>
<tr>
<td align="left">Llama-3.1-405B-Instruct</td>
<td align="center">83.33</td>
<td align="center">67.10</td>
<td align="center">75.55</td>
<td align="center">58.14</td>
<td align="center">47.09</td>
<td align="center">64.74</td>
</tr>
<tr>
<td align="left">Qwen2.5-72B-Instruct</td>
<td align="center">82.65</td>
<td align="center">66.09</td>
<td align="center">74.43</td>
<td align="center">60.41</td>
<td align="center">59.73</td>
<td align="center">65.90</td>
</tr>
<tr>
<td align="left">Qwen2.5-Plus</td>
<td align="center">83.18</td>
<td align="center">68.41</td>
<td align="center">79.35</td>
<td align="center">59.58</td>
<td align="center">62.52</td>
<td align="center">66.92</td>
</tr>
</tbody></table>
<p>Qwen2.5-72B 在 Coding(60.41)与 Math(59.73)上显著超越 Qwen2-72B(48.95/48.07). Qwen2.5-Plus 在 Math(62.52)上超越 GPT-4o-08(52.36)与 Claude3.5(48.67).</p>
<p><strong>表 12 | 内部中文自动评估基准</strong></p>
<table>
<thead>
<tr>
<th align="left">Models</th>
<th align="center">IF</th>
<th align="center">Knowledge</th>
<th align="center">Comprehension</th>
<th align="center">Coding</th>
<th align="center">Math</th>
<th align="center">Reasoning</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4o-08</td>
<td align="center">42.50</td>
<td align="center">68.55</td>
<td align="center">80.11</td>
<td align="center">61.53</td>
<td align="center">61.74</td>
<td align="center">56.88</td>
</tr>
<tr>
<td align="left">Claude3.5-sonnet</td>
<td align="center">49.25</td>
<td align="center">72.09</td>
<td align="center">82.16</td>
<td align="center">66.00</td>
<td align="center">63.71</td>
<td align="center">66.60</td>
</tr>
<tr>
<td align="left">Qwen2-72B-Instruct</td>
<td align="center">31.98</td>
<td align="center">74.96</td>
<td align="center">75.49</td>
<td align="center">41.57</td>
<td align="center">65.55</td>
<td align="center">58.19</td>
</tr>
<tr>
<td align="left">Llama-3.1-405B-Instruct</td>
<td align="center">30.39</td>
<td align="center">63.79</td>
<td align="center">72.27</td>
<td align="center">60.73</td>
<td align="center">46.05</td>
<td align="center">55.88</td>
</tr>
<tr>
<td align="left">Qwen2.5-72B-Instruct</td>
<td align="center">37.22</td>
<td align="center">75.86</td>
<td align="center">78.85</td>
<td align="center">56.71</td>
<td align="center">68.39</td>
<td align="center">63.02</td>
</tr>
<tr>
<td align="left">Qwen2.5-Plus</td>
<td align="center">46.15</td>
<td align="center">72.07</td>
<td align="center">82.64</td>
<td align="center">58.48</td>
<td align="center">69.96</td>
<td align="center">62.98</td>
</tr>
</tbody></table>
<p>Qwen2.5-Plus 在中文 IF(46.15)上弥补了 Qwen2.5-72B(37.22)的短板, 接近 GPT-4o(42.50).</p>
<h3 id="5-4-dyypg">5.4 多语言评估</h3>
<p><strong>表 13 | 70B+ 指令模型多语言任务</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen2-72B</th>
<th align="center">Llama3.1-70B</th>
<th align="center">Qwen2.5-32B</th>
<th align="center">Mistral-Large</th>
<th align="center">GPT4o-mini</th>
<th align="center">Qwen2.5-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">IFEval (multilingual)</td>
<td align="center">79.69</td>
<td align="center">80.47</td>
<td align="center">82.68</td>
<td align="center">82.69</td>
<td align="center">85.03</td>
<td align="center"><strong>86.98</strong></td>
</tr>
<tr>
<td align="left">AMMLU (Arabic)</td>
<td align="center">68.85</td>
<td align="center">70.08</td>
<td align="center">70.44</td>
<td align="center">69.24</td>
<td align="center">69.73</td>
<td align="center"><strong>72.44</strong></td>
</tr>
<tr>
<td align="left">JMMLU (Japanese)</td>
<td align="center">77.37</td>
<td align="center">73.89</td>
<td align="center">76.55</td>
<td align="center">75.77</td>
<td align="center">73.74</td>
<td align="center"><strong>80.56</strong></td>
</tr>
<tr>
<td align="left">KMMLU (Korean)</td>
<td align="center">57.04</td>
<td align="center">53.23</td>
<td align="center">60.75</td>
<td align="center">56.42</td>
<td align="center">56.77</td>
<td align="center"><strong>61.96</strong></td>
</tr>
<tr>
<td align="left">TurkishMMLU</td>
<td align="center">69.22</td>
<td align="center">66.89</td>
<td align="center">72.41</td>
<td align="center">64.78</td>
<td align="center">71.19</td>
<td align="center"><strong>76.12</strong></td>
</tr>
<tr>
<td align="left">MGSM8K (extended)</td>
<td align="center">82.72</td>
<td align="center">73.31</td>
<td align="center">87.15</td>
<td align="center"><strong>89.01</strong></td>
<td align="center">87.36</td>
<td align="center">88.16</td>
</tr>
<tr>
<td align="left">BLEnD (Cultural)</td>
<td align="center">25.90</td>
<td align="center">30.49</td>
<td align="center">27.88</td>
<td align="center">33.47</td>
<td align="center"><strong>35.91</strong></td>
<td align="center">32.48</td>
</tr>
</tbody></table>
<p>Qwen2.5-72B 在多语言指令遵循(86.98)与知识(AMMLU/JMMLU/KMMLU/TurkishMMLU)上表现突出, 但在文化细微差别(BLEnD)上仍有提升空间.</p>
<h3 id="5-5-jlmxpg">5.5 奖励模型评估</h3>
<p><strong>表 14 | 多奖励模型基准对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Metric</th>
<th align="center">Nemotron-4-340B-Reward</th>
<th align="center">Llama-3.1-Nemotron-70B-Reward</th>
<th align="center">Athene-RM-70B</th>
<th align="center">Qwen2.5-RM-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Reward Bench (Score)</td>
<td align="center">92.00</td>
<td align="center"><strong>94.10</strong></td>
<td align="center">88.32</td>
<td align="center">91.59</td>
</tr>
<tr>
<td align="left">RMB (Overall)</td>
<td align="center">59.83</td>
<td align="center">64.57</td>
<td align="center"><strong>73.98</strong></td>
<td align="center">68.71</td>
</tr>
<tr>
<td align="left">PPE (Objective-Avg)</td>
<td align="center">60.64</td>
<td align="center">63.62</td>
<td align="center">69.09</td>
<td align="center"><strong>69.85</strong></td>
</tr>
<tr>
<td align="left">Human-Preference-Chinese</td>
<td align="center">50.46</td>
<td align="center">59.95</td>
<td align="center">61.11</td>
<td align="center"><strong>61.27</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-RM-72B 在 PPE 与中文人类偏好基准上领先, Reward Bench 上仅次于 Llama-3.1-Nemotron-70B-Reward. 论文指出单一基准优化可能触发 Goodhart 定律, 且当前 RM 评估基准无法准确预测下游 RL 模型性能.</p>
<blockquote>
<p><strong>技术思考 5.1 | 局限性</strong>: 奖励模型评估的「Goodhart 定律」问题是 RLHF 领域的核心挑战. 当奖励模型被过度优化以在 Reward Bench 等基准上得高分时, 它可能学会「欺骗」评估指标而非真正理解人类偏好. Qwen2.5 团队观察到「RM 基准分数更高的模型, 其下游 RL 模型未必表现更好」, 这暗示了当前 RM 评估与最终模型质量之间存在脱节. 一个可能的解释是: RM 基准测试的是「区分好坏回复的能力」, 而 RL 需要的是「引导策略模型生成更好回复的能力」—— 前者是判别任务, 后者是生成任务, 两者的优化目标并不完全一致. 这解释了为何 DeepSeek-R1 选择完全弃用奖励模型, 转向纯 RL 的规则驱动奖励.</p>
</blockquote>
<h3 id="5-6-csxwnl">5.6 长上下文能力</h3>
<p><strong>表 15 | RULER 长上下文基准</strong></p>
<p>| Model | Claimed Length | Av.</p>
<p>| 4K | 8K | 16K | 32K | 64K | 128K |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| GLM4-9b-Chat-1M | 1M | 89.9 | 94.7 | 92.8 | 92.1 | 89.9 | 86.7 | 83.1 |
| Llama-3.1-70B-Instruct | 128K | 89.6 | 96.5 | 95.8 | 95.4 | 94.8 | 88.4 | 66.6 |
| GPT-4o-mini | 128K | 87.3 | 95.0 | 92.9 | 92.7 | 90.2 | 87.6 | 65.8 |
| GPT-4 | 128K | 91.6 | 96.6 | 96.3 | 95.2 | 93.2 | 87.0 | 81.2 |
| Qwen2.5-7B-Instruct | 128K | 85.4 | 96.7 | 95.1 | 93.7 | 89.4 | 82.3 | 55.1 |
| w/o DCA+YARN | | 80.1 | 96.7 | 95.1 | 93.7 | 89.4 | 74.5 | 31.4 |
| Qwen2.5-14B-Instruct | 128K | 91.4 | 97.7 | 96.8 | 95.9 | 93.4 | 86.7 | 78.1 |
| w/o DCA+YARN | | 86.5 | 97.7 | 96.8 | 95.9 | 93.4 | 82.3 | 53.0 |
| Qwen2.5-32B-Instruct | 128K | 92.9 | 96.9 | 97.1 | 95.5 | 95.5 | 90.3 | 82.0 |
| w/o DCA+YARN | | 88.0 | 96.9 | 97.1 | 95.5 | 95.5 | 85.3 | 57.7 |
| <strong>Qwen2.5-72B-Instruct</strong> | 128K | <strong>95.1</strong> | <strong>97.7</strong> | <strong>97.2</strong> | <strong>97.7</strong> | <strong>96.5</strong> | <strong>93.0</strong> | <strong>88.4</strong> |
| w/o DCA+YARN | | 90.8 | 97.7 | 97.2 | 97.7 | 96.5 | 88.5 | 67.0 |
| Qwen2.5-Turbo | 1M | 93.1 | 97.5 | 95.7 | 95.5 | 94.8 | 90.8 | 84.5 |</p>
<p>Qwen2.5-72B-Instruct 在 RULER 所有长度上均表现最强, 128K 时 88.4 远超 GPT-4(81.2)与 Llama-3.1-70B(66.6). DCA+YARN 在 64K-128K 区间贡献显著(72B: 88.4 vs 67.0).</p>
<p><strong>表 16 | LV-Eval 与 LongBench-Chat</strong></p>
<table>
<thead>
<tr>
<th align="left">Model</th>
<th align="center">16k</th>
<th align="center">32k</th>
<th align="center">64k</th>
<th align="center">128k</th>
<th align="center">256k</th>
<th align="center">LongBench-Chat</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM4-9B-Chat-1M</td>
<td align="center">46.4</td>
<td align="center">43.2</td>
<td align="center">42.9</td>
<td align="center">40.4</td>
<td align="center">37.0</td>
<td align="center">7.82</td>
</tr>
<tr>
<td align="left">Llama-3.1-70B-Instruct</td>
<td align="center">48.6</td>
<td align="center">47.4</td>
<td align="center">42.9</td>
<td align="center">26.2</td>
<td align="center">N/A</td>
<td align="center">6.80</td>
</tr>
<tr>
<td align="left">GPT-4o-mini</td>
<td align="center">52.9</td>
<td align="center">48.1</td>
<td align="center">46.0</td>
<td align="center">40.7</td>
<td align="center">N/A</td>
<td align="center">8.48</td>
</tr>
<tr>
<td align="left">Qwen2.5-72B-Instruct</td>
<td align="center"><strong>60.4</strong></td>
<td align="center"><strong>57.5</strong></td>
<td align="center"><strong>53.9</strong></td>
<td align="center"><strong>50.9</strong></td>
<td align="center"><strong>45.2</strong></td>
<td align="center"><strong>8.72</strong></td>
</tr>
<tr>
<td align="left">Qwen2.5-Turbo</td>
<td align="center">53.4</td>
<td align="center">50.0</td>
<td align="center">45.4</td>
<td align="center">43.9</td>
<td align="center">38.0</td>
<td align="center">8.34</td>
</tr>
</tbody></table>
<p>Qwen2.5-72B-Instruct 在 LV-Eval 所有长度上均领先, LongBench-Chat 上 8.72 优于 GPT-4o-mini(8.48).</p>
<p>Qwen2.5-Turbo 在 1M token 的 passkey retrieval 任务上达到 100% 准确率. 基于 Minference 的稀疏注意力机制将 1M token 序列的注意力计算负载降低 12.5 倍, TTFT 加速 3.2-4.3 倍.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/05-qwen2.5/01-qwen2.5-jsbgjy/images/passkey_retrieval.pdf" alt="图 1 | Qwen2.5-Turbo 在 1M Token Passkey Retrieval 任务上的性能"></p>
<p><img src="/llm-guide/14-models/14.2-qwen/05-qwen2.5/01-qwen2.5-jsbgjy/images/inference_speed.pdf" alt="图 2 | Qwen2.5-Turbo 与 Qwen2.5-7B 在不同硬件配置下的 TTFT(首 token 时间)对比, 全注意力 vs 本文方法"></p>
<hr>
<h2 id="6-jl">6 结论</h2>
<p>Qwen2.5 代表了大型语言模型的重大进步, 通过 18 万亿 token 的增强预训练与包括 SFT 和多阶段 RL 在内的复杂后训练技术, 提升了人类偏好对齐、长文本生成与结构化数据分析能力. Qwen2.5 提供从 0.5B 到 72B 的开源权重模型及 Qwen2.5-Turbo/Plus 等成本效益 MoE 变体. 实证评估表明 Qwen2.5-72B-Instruct 以 6 倍更小的尺寸达到 Llama-3-405B-Instruct 的性能水平.</p>
<p>未来, 我们将聚焦三个方向: (1) 通过更广泛、更多样、更高质量的数据迭代精炼基础与指令微调 LLM; (2) 持续发展多模态模型, 将文本、视觉与听觉整合入统一框架; (3) 通过推理计算资源的战略扩展增强模型推理能力.</p>
<blockquote>
<p><strong>技术思考 6.1 | 技术谱系</strong>: Qwen2.5 的技术遗产可概括为「数据密度 × 方法深度」的双重提升. 数据端: 18T token + 1M+ SFT 样本 + 150K DPO 对 + GRPO 在线迭代, 构成了当时开源社区最密集的「预训练-后训练」流水线. 方法端: GRPO 的引入标志着 Qwen 系列正式进入「深度 RL 优化」时代, 与 DeepSeek-Math(GRPO 发明者)和 DeepSeek-R1(纯 RL 极致探索)共同定义了 2024 年 RL 后训练的技术前沿. Qwen2.5 的局限性(如长上下文 RL 的缺失、文化细微差别 BLEnD 的短板)则明确了 Qwen3 的优化方向 —— 这些正是其结论中「推理计算扩展」与「多模态统一」所指.</p>
</blockquote>
<hr>
<p><em>本文件为 Qwen2.5 技术报告(arXiv:2412.15115)的中文精译, 遵循逐段翻译、信息零增删原则. 原文 PDF 见 <code>pdfs/Qwen2.5-Technical-Report.pdf</code>.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-jgy-tokenizer","text":"2 架构与 Tokenizer"},{"level":2,"id":"3-yxl","text":"3 预训练"},{"level":3,"id":"3-1-yxlsj","text":"3.1 预训练数据"},{"level":3,"id":"3-2-ccsd-scaling-law","text":"3.2 超参数的 Scaling Law"},{"level":3,"id":"3-3-csxwyxl","text":"3.3 长上下文预训练"},{"level":2,"id":"4-hxl","text":"4 后训练"},{"level":3,"id":"4-1-jdwt","text":"4.1 监督微调"},{"level":3,"id":"4-2-lxqhxx","text":"4.2 离线强化学习"},{"level":3,"id":"4-3-zxqhxx","text":"4.3 在线强化学习"},{"level":3,"id":"4-4-csxwwt","text":"4.4 长上下文微调"},{"level":2,"id":"5-sy","text":"5 实验"},{"level":3,"id":"5-1-jcyymx","text":"5.1 基础语言模型"},{"level":3,"id":"5-2-zlwtmx","text":"5.2 指令微调模型"},{"level":3,"id":"5-3-nbzdpg","text":"5.3 内部自动评估"},{"level":3,"id":"5-4-dyypg","text":"5.4 多语言评估"},{"level":3,"id":"5-5-jlmxpg","text":"5.5 奖励模型评估"},{"level":3,"id":"5-6-csxwnl","text":"5.6 长上下文能力"},{"level":2,"id":"6-jl","text":"6 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/05-qwen2.5/01-qwen2.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/05-qwen2.5/01-qwen2.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5 Technical Report 精译</h1>
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
