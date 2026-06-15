"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMoE 核心架构与路由专业化剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文: Muennighoff, N., Soldaini, L., Groeneveld, D., et al. &quot;OLMoE: Open Mixture-of-Experts Language Models.&quot; ICLR 2025 / arXiv:2409.02060.
原文链接: <a href="https://arxiv.org/abs/2409.02060">https://arxiv.org/abs/2409.02060</a>
发布时间: 2024年9月 (arXiv), 2025年1月 (ICLR)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsmkyjxyygqkfd-moe-jx">1. 设计动机: 为什么开源界需要一个全开放的 MoE 基线</h2>
<p>混合专家(MoE)架构自 2017 年被提出以来,始终处于「前沿采用、社区滞后」的尴尬位置. 业界头部模型如 GPT-4 和 Gemini-1.5 reportedly 已采用 MoE,但开源社区中完全开放的 MoE 模型屈指可数,且多数只开源了权重,训练数据、代码和配方仍是黑盒.</p>
<p>OLMoE 的核心动机可以概括为三点:</p>
<table>
<thead>
<tr>
<th>动机</th>
<th>具体表现</th>
</tr>
</thead>
<tbody><tr>
<td>科研可复现性</td>
<td>MoE 引入了比 Dense 模型更多的设计维度(专家数/激活数/路由算法/负载均衡策略),缺乏公开实验数据导致社区只能猜测</td>
</tr>
<tr>
<td>成本-性能权衡</td>
<td>7B 总参数 / 1B 激活参数的配比,使推理成本接近 1B Dense 模型,但模型容量接近 7B Dense 模型</td>
</tr>
<tr>
<td>延续 OLMo 开放传统</td>
<td>OLMo 系列是第一个完全开源(权重+数据+代码+日志)的 Dense LM 家族,OLMoE 将这一理念延伸到 MoE 领域</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下. MoE 相比 Dense 模型的设计空间膨胀是真实存在的:专家应该多大?多少个?是否共享?路由选 Token Choice 还是 Expert Choice?负载均衡损失权重设为多少?这些问题的答案在闭源模型中不可见,在仅有的几个开源 MoE 中(JetMoE、OpenMoE)也缺乏系统的消融实验. OLMoE 的论文价值不仅在于发布了模型,更在于它用「控制变量法」逐一回答了上述问题,并开源了所有实验日志.</p>
<hr>
<h2 id="2-jgyj-c-olmo-1b-d-ol-mo-e-1b-7b-dgjbq">2. 架构演进: 从 OLMo-1B 到 OLMoE-1B-7B 的关键变迁</h2>
<h3 id="2-1-csgmyjsxs">2.1 参数规模与计算效率</h3>
<p>OLMoE-1B-7B 的命名直观反映了其设计哲学:每个 token 仅激活 1.3B 参数,但总参数量达到 6.9B.</p>
<table>
<thead>
<tr>
<th>指标</th>
<th>OLMoE-1B-7B</th>
<th>OLMo-1B (0724)</th>
<th>OLMo-7B (0724)</th>
</tr>
</thead>
<tbody><tr>
<td>总参数量</td>
<td>6.9B</td>
<td>1.3B</td>
<td>6.9B</td>
</tr>
<tr>
<td>激活参数量</td>
<td>1.3B</td>
<td>1.3B</td>
<td>6.9B</td>
</tr>
<tr>
<td>层数</td>
<td>16</td>
<td>16</td>
<td>32</td>
</tr>
<tr>
<td>模型维度</td>
<td>2,048</td>
<td>2,048</td>
<td>4,096</td>
</tr>
<tr>
<td>FFN 维度(每专家)</td>
<td>1,024</td>
<td>8,192</td>
<td>8,192</td>
</tr>
<tr>
<td>注意力头数</td>
<td>16</td>
<td>16</td>
<td>32</td>
</tr>
<tr>
<td>专家总数</td>
<td>64</td>
<td>1</td>
<td>1</td>
</tr>
<tr>
<td>激活专家数</td>
<td>8</td>
<td>1</td>
<td>1</td>
</tr>
<tr>
<td>序列长度</td>
<td>4,096</td>
<td>4,096</td>
<td>4,096</td>
</tr>
<tr>
<td>词表大小</td>
<td>50,304</td>
<td>50,304</td>
<td>50,304</td>
</tr>
<tr>
<td>预训练 token</td>
<td>5.1T</td>
<td>2.0T</td>
<td>2.5T</td>
</tr>
</tbody></table>
<p>这里的关键洞察是:OLMoE-1B-7B 的「激活参数量」与 OLMo-1B 相同(1.3B),意味着单次前向传播的计算量(FLOPs)大致相当;但其「总参数量」与 OLMo-7B 相同(6.9B),意味着模型可以存储的知识容量接近 7B 级别. 这种「小激活、大容量」的架构,是 MoE 的核心价值所在.</p>
<h3 id="2-2-cfcsh-layer-norm-d-rms-norm-dhg">2.2 从非参数化 LayerNorm 到 RMSNorm 的回归</h3>
<p>OLMo-1 使用非参数化 LayerNorm(无可学习的 scale 和 shift 参数),主要动机是速度:非参数化实现比标准 LayerNorm 快约 15%. 但 OLMoE 的消融实验发现,这一选择对 MoE 训练是灾难性的:</p>
<ul>
<li>非参数化 LayerNorm 导致梯度出现大量尖峰,即使全局梯度裁剪阈值设为 1.0 也无法完全消除其影响</li>
<li>参数化 RMSNorm 不仅消除了梯度尖峰,还带来了约 1-2% 的下游性能提升</li>
<li>代价是吞吐量下降 15%</li>
</ul>
<p>这里的设计权衡非常清晰:稳定性优先于速度. 对于 MoE 模型,训练不稳定性的代价远高于 15% 的吞吐量损失——一次损失尖峰可能导致数小时的训练浪费,甚至需要回滚到上一个Checkpoint. OLMoE 最终将所有参数(包括嵌入和 RMSNorm)纳入权重衰减,进一步提升了稳定性.</p>
<h3 id="2-3-qk-norm-yjdztcsh-szszbx">2.3 QK-Norm 与截断正态初始化: 双重数值保险</h3>
<p>OLMoE 在 OLMo 的基础上引入了两项关键的稳定性改进:</p>
<p><strong>QK-Norm</strong>: 在 Query 和 Key 投影后添加层归一化,防止注意力 logit 过大导致数值溢出. 实验表明,即使在使用 RMSNorm 后,QK-Norm 仍能略微改善训练损失并防止大梯度范数尖峰. 代价是吞吐量下降近 10%.</p>
<p><strong>截断正态初始化</strong>: 使用 std=0.02 的截断正态分布(截断至 3 倍 std),替代普通正态初始化. 差异在约 450B token 后才变得明显——此时普通正态初始化开始发散. 这一发现提醒我们:初始化策略的优劣可能需要数百 B token 的训练才能显现,短期消融实验可能给出误导性结论.</p>
<h3 id="2-4-adam-w-epsilon-ygbhsdgjccs">2.4 AdamW Epsilon: 一个被忽视的关键超参数</h3>
<p>OLMoE 将 AdamW 的 epsilon 从 OLMo 使用的 1E-05 降至推荐默认值 1E-08,在没有稳定性损失的情况下带来了显著性能提升. 这是一个令人惊讶的发现:epsilon 通常被视为「次要超参数」,但它在 AdamW 中直接控制更新步长的下限——较大的 epsilon 会抑制小梯度方向的更新,而 MoE 的路由权重和专家参数可能恰好依赖这些精细的梯度信号.</p>
<hr>
<h2 id="3-xldlysj-64-zj-jh-8-gdxtxxz">3. 细粒度路由设计: 64 专家/激活 8 个的系统性选择</h2>
<h3 id="3-1-zjlddsydjqx">3.1 专家粒度的收益递减曲线</h3>
<p>MoE 的核心设计问题之一是「专家应该多大」. 理论上,更多更小的专家意味着更多的组合可能性,模型可以更灵活地将不同类型的 token 路由到最匹配的专家. OLMoE 通过控制变量实验验证了这一直觉:</p>
<table>
<thead>
<tr>
<th>专家数</th>
<th>激活数</th>
<th>每层组合数</th>
<th>HellaSwag</th>
<th>MMLU Var</th>
</tr>
</thead>
<tbody><tr>
<td>8</td>
<td>1</td>
<td>8</td>
<td>基线</td>
<td>基线</td>
</tr>
<tr>
<td>32</td>
<td>4</td>
<td>35,960</td>
<td>+~10%</td>
<td>+~10%</td>
</tr>
<tr>
<td>64</td>
<td>8</td>
<td>~4.4B</td>
<td>+~11-12%</td>
<td>+~11-12%</td>
</tr>
</tbody></table>
<p>从 8 专家增至 32 专家,性能跃升约 10%;但从 32 专家增至 64 专家,仅再提升 1-2%. 这种收益递减现象在组合数呈指数增长时并不意外——更多的组合并不自动意味着更好的泛化,因为模型可能无法有效学习利用如此庞大的组合空间.</p>
<p>Krajewski 等人的 scaling law 预测,在约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mn>22</mn></msup></mrow><annotation encoding="application/x-tex">3\\times 10^{22}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">22</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 的计算预算下,最优专家数为 256. 但 OLMoE 训练了 5T token,远超传统计算最优模型的规模. 这说明 scaling law 的预测必须结合具体的训练配置来理解,不能生搬硬套.</p>
<h3 id="3-2-gxzj-ygbzwdzj">3.2 共享专家: 一个被证伪的直觉</h3>
<p>DeepSeekMoE 提出使用「共享专家」——一个始终被激活的固定专家,负责学习通用信息,其余路由专家学习专业化知识. 这一设计的直觉很诱人:隔离通用知识可以减少专家间的冗余.</p>
<p>OLMoE 的实验直接挑战了这一假设:</p>
<ul>
<li>「1 共享 + 31 路由(激活 3 个)」vs.「32 路由(激活 4 个)」,两者激活和总参数量相同</li>
<li>共享专家配置的性能略差</li>
<li>更关键的是:共享专家将组合数从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>32</mn><mn>4</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>35,960</mn></mrow><annotation encoding="application/x-tex">\\binom{32}{4}=35{,}960</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">32</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">35</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">960</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>31</mn><mn>3</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>4,495</mn></mrow><annotation encoding="application/x-tex">\\binom{31}{3}=4{,}495</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">31</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">4</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">495</span></span></span></span>,减少了近 90%</li>
</ul>
<p>这一结果支持了「组合灵活性优于强制分工」的观点. 共享专家的潜在好处被其引入的灵活性损失所抵消. 论文进一步提出:让某些专家更频繁激活甚至始终激活的想法有价值,但不应该通过「共享专家」这种硬编码方式实现,而应该让路由网络自己学习这种行为——当前的负载均衡损失恰恰是限制这种灵活性的因素,因为它强制所有专家均匀使用.</p>
<h3 id="3-3-token-choice-vs-expert-choice-xnyxysd">3.3 Token Choice vs. Expert Choice: 性能优先于速度</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Token Choice (TC)</th>
<th>Expert Choice (EC)</th>
</tr>
</thead>
<tbody><tr>
<td>路由机制</td>
<td>每个 token 选择固定数量的专家</td>
<td>每个专家选择固定数量的 token</td>
</tr>
<tr>
<td>负载均衡</td>
<td>需要辅助损失强制均衡</td>
<td>设计上天然均衡</td>
</tr>
<tr>
<td>token 丢弃</td>
<td>无丢弃(dropless)实现可避免</td>
<td>可能导致 token 被丢弃</td>
</tr>
<tr>
<td>自回归兼容</td>
<td>完全兼容</td>
<td>不适用于自回归生成</td>
</tr>
<tr>
<td>训练速度</td>
<td>每设备 24,400 token/s</td>
<td>每设备 29,400 token/s(快约 20%)</td>
</tr>
<tr>
<td>下游性能</td>
<td>更优</td>
<td>略逊</td>
</tr>
</tbody></table>
<p>OLMoE 选择 Token Choice 的核心原因是:EC 不兼容自回归生成(每次只处理单个 token),而 TC 配合无丢弃实现和负载均衡损失可以获得更好的下游性能. 虽然 EC 速度更快,但 OLMoE 认为 EC 在多模态设置中可能更有价值(丢弃噪声图像 token 的损害小于丢弃文本 token),这为未来的多模态 MoE 模型留下了开放问题.</p>
<hr>
<h2 id="4-moe-xlwdxgc-wxgjcs">4. MoE 训练稳定性工程: 五项关键措施</h2>
<p>MoE 训练的稳定性挑战比 Dense 模型更严峻:路由网络的大 logit 可能导致数值溢出,专家激活不均可能导致「死权重」,梯度在不同专家间的传播路径差异可能引入额外的不稳定性. OLMoE 通过五项措施构建了稳定的训练环境:</p>
<table>
<thead>
<tr>
<th>措施</th>
<th>作用</th>
<th>代价</th>
<th>必要性</th>
</tr>
</thead>
<tbody><tr>
<td>RMSNorm</td>
<td>消除梯度尖峰</td>
<td>吞吐量 -15%</td>
<td>必需</td>
</tr>
<tr>
<td>QK-Norm</td>
<td>防止注意力 logit 溢出</td>
<td>吞吐量 -10%</td>
<td>必需</td>
</tr>
<tr>
<td>截断正态初始化</td>
<td>防止 450B+ token 后发散</td>
<td>无</td>
<td>必需</td>
</tr>
<tr>
<td>负载均衡损失(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>)</td>
<td>防止专家成为死权重</td>
<td>极小</td>
<td>必需</td>
</tr>
<tr>
<td>Router Z-loss(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi><mo>=</mo><mn>0.001</mn></mrow><annotation encoding="application/x-tex">\\beta=0.001</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.001</span></span></span></span>)</td>
<td>抑制路由大 logit,防止溢出</td>
<td>吞吐量 -2%</td>
<td>必需</td>
</tr>
</tbody></table>
<h3 id="4-1-fzjhss-fz-sqz-dbxdj">4.1 负载均衡损失: 防止「死权重」的必需代价</h3>
<p>不使用负载均衡损失的实验结果触目惊心:最初第一层所有 token 都被分配到第 6 个专家;训练结束时,虽然部分 token 开始分配给第 1 个专家,但其他 62 个专家基本未被使用——成为纯粹的「死权重」,占用 GPU 内存却不贡献任何计算.</p>
<p>负载均衡损失的公式为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub><mo>=</mo><msub><mi>N</mi><mi>E</mi></msub><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>N</mi><mi>E</mi></msub></munderover><msub><mi>f</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{LB}} = N_E \\cdot \\sum_{i=1}^{N_E} f_i \\cdot P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.1173em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8396em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3113em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">f_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为路由到专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的 token 比例,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为分配给 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的总路由概率. 损失乘以专家数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>E</mi></msub></mrow><annotation encoding="application/x-tex">N_E</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和权重 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>.</p>
<p>但论文同时指出:负载均衡损失是一把双刃剑. 它通过强制所有专家大致均等使用,限制了模型的灵活性,可能阻止专家在特定数据领域深度专业化. 这解释了为什么 Mixtral(从 Dense 模型上循环而来)未能发现强有力的专家专业化证据——负载均衡损失可能过度平滑了专家间的差异.</p>
<h3 id="4-2-router-z-loss-szwddzhydfx">4.2 Router Z-loss: 数值稳定的最后一道防线</h3>
<p>Router Z-loss 惩罚进入门控网络的大 logit:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">RZ</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>B</mi></mfrac><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>B</mi></munderover><msup><mrow><mo fence="true">(</mo><mi>log</mi><mo>⁡</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>N</mi><mi>E</mi></msub></munderover><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msubsup><mi>x</mi><mi>j</mi><mrow><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo></mrow></msubsup><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{RZ}}(x) = \\frac{1}{B} \\cdot \\sum_{i=1}^B \\left( \\log \\sum_{j=1}^{N_E} \\exp({x_j^{(i)}}) \\right)^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">RZ</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.4574em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8396em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3113em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.413em;"><span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:2.0436em;"><span style="top:-4.2925em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span><p>实验发现,添加 Router Z-loss 在训练损失、验证损失和下游性能上均改善了稳定性和质量(更少尖峰、更低损失、更高下游性能),仅降低约 2% 的吞吐量. 在 BF16 等低精度训练环境下,这一损失对防止数值溢出至关重要.</p>
<h3 id="4-3-xlzssdwzgc">4.3 训练总损失的完整构成</h3>
<p>OLMoE 的训练总损失为三项之和:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="script">L</mi><mo>=</mo><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">CE</mtext></msub><mo>+</mo><mi>α</mi><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub><mo>+</mo><mi>β</mi><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">RZ</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L} = \\mathcal{L}_{\\textit{CE}} + \\alpha \\mathcal{L}_{\\textit{LB}} + \\beta \\mathcal{L}_{\\textit{RZ}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">CE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">RZ</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">CE</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{CE}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">CE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为交叉熵损失,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi><mo>=</mo><mn>0.001</mn></mrow><annotation encoding="application/x-tex">\\beta=0.001</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.001</span></span></span></span>. 后两项虽然是辅助损失,但对训练稳定性和最终性能的贡献不可忽视.</p>
<hr>
<h2 id="5-xssxh-c-dense-gz-moe-djx">5. 稀疏上循环: 从 Dense「改造」MoE 的局限</h2>
<p>稀疏上循环(Sparse Upcycling)是一种将预训练 Dense 模型转换为 MoE 的技术:将 Dense MLP 克隆为每个目标专家,添加新初始化的路由器,继续预训练使克隆的 MLP 逐渐专业化. 先前工作声称上循环方法在原始 Dense Checkpoint计算预算的 120% 以内保持性能优势.</p>
<p>OLMoE 的实验给出了更悲观的结论:</p>
<ul>
<li>将 OLMo-1B (2T token Checkpoint)上循环为 MoE(8 专家,激活 2 个),再训练 610B token</li>
<li>500B token 后,从头训练的 MoE 已追上上循环模型</li>
<li>600B token 处,从头训练的 MoE 开始超越上循环模型</li>
<li>仅需原始 Dense 模型计算预算的 25% 即可追上(而非先前声称的 120%)</li>
</ul>
<p>更深层的局限在于:上循环的 MoE 受限于 Dense 模型的超参数选择. OLMo-1B (0724) 训练时未使用 QK-Norm 和截断正态初始化,而这两者在 OLMoE 的实验中都被证明对稳定性至关重要. 虽然可以像新路由器层一样从头训练新的 QK-Norm,但不可能改变原始 Dense 模型的初始化. 当训练预算足够大(如 OLMoE 的 5T token,约 250% 原始计算预算)时,从头训练是更优选择.</p>
<p>上循环的主要价值场景是「计算预算有限、需要快速获得一个可用的 MoE 模型」. 在计算充裕的情况下,从头训练的 MoE 不仅能超越上循环模型,还能自由选择最优的超参数组合.</p>
<hr>
<h2 id="6-lyhwsdfx-bh-gjhyzyh">6. 路由行为深度分析: 饱和、共激活与专业化</h2>
<p>OLMoE 论文最具科研价值的部分,是利用开源的中间Checkpoint(每 5000 步)对 MoE 内部路由行为进行了前所未有的系统性分析. 这部分工作无法在没有完整Checkpoint的情况下复现,凸显了 OLMoE 开放发布的独特价值.</p>
<h3 id="6-1-lybh-lyqzyxlzqj-dx">6.1 路由饱和: 路由器在预训练早期即「定型」</h3>
<p>路由饱和(Router Saturation)定义为:中间Checkpoint <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 与最终Checkpoint <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi></mrow><annotation encoding="application/x-tex">T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span> 相比,激活的专家 ID 匹配的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Router Saturation</mtext><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>N</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></munderover><mfrac><mrow><mi mathvariant="normal">∣</mi><msubsup><mi mathvariant="script">E</mi><mi>i</mi><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>∩</mo><msubsup><mi mathvariant="script">E</mi><mi>i</mi><mrow><mo stretchy="false">(</mo><mi>T</mi><mo stretchy="false">)</mo></mrow></msubsup><mi mathvariant="normal">∣</mi></mrow><mi>k</mi></mfrac></mrow><annotation encoding="application/x-tex">\\text{Router Saturation}(t) = \\frac{1}{N} \\sum_{i=1}^{N} \\frac{|\\mathcal{E}_{i}^{(t)} \\cap \\mathcal{E}_{i}^{(T)}|}{k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Router Saturation</span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.7218em;"><span style="top:-2.3588em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.2748em;"><span class="pstrut" style="height:3.0448em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7218em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord">∣</span><span class="mord"><span class="mord mathcal" style="margin-right:0.0894em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0894em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∩</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0894em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0894em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mord">∣</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>关键发现:</p>
<ul>
<li>预训练 1% 后(5,000 步或 20B token),Top-8 专家的路由已有约 60% 饱和</li>
<li>预训练 40% 后,饱和达到约 80%</li>
<li>Top-1 专家(概率最高的专家)饱和更慢</li>
<li>靠后的层饱和更早;第 0 层是异常值,饱和显著慢于其他层</li>
</ul>
<p>第一层的特殊性值得关注. DeepSeekMoE 选择「第一层不使用 MoE」,正是因为发现第一层的负载均衡收敛更慢. OLMoE 的饱和分析为这一现象提供了新视角:第一层的路由决策变化更频繁,导致某些专家突然获得过多数据,破坏负载均衡. 这为「是否应在第一层使用 MoE」留下了开放问题.</p>
<h3 id="6-2-zjgjh-hbefry">6.2 专家共激活: 互补而非冗余</h3>
<p>专家共激活(Expert Co-activation)度量两个专家被同时激活的频率:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Expert co-activation</mtext><mo stretchy="false">(</mo><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>E</mi><mi>j</mi></msub><mo stretchy="false">)</mo><mo>=</mo><mfrac><msub><mi>N</mi><mrow><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>E</mi><mi>j</mi></msub></mrow></msub><msub><mi>N</mi><msub><mi>E</mi><mi>i</mi></msub></msub></mfrac></mrow><annotation encoding="application/x-tex">\\text{Expert co-activation}(E_i, E_j) = \\frac{N_{E_i, E_j}}{N_{E_i}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Expert co-activation</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3568em;vertical-align:-0.9361em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4207em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7373em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3473em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9361em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>实验发现:同一层内专家共激活较弱,只有少数例外(如第 7 层的专家 48 和 23 共激活 60%). 这表明不同专家之间冗余较少,功能互补而非重叠. 少数共激活组在后续的词汇分析中得到了解释——它们都处理连接词(如 Then、Therefore),功能上存在天然关联.</p>
<h3 id="6-3-lyzyh-ol-mo-e-vs-mixtral-dxmdb">6.3 领域专业化: OLMoE vs. Mixtral 的鲜明对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>OLMoE-1B-7B</th>
<th>Mixtral-8x7B</th>
</tr>
</thead>
<tbody><tr>
<td>领域专业化</td>
<td>显著:许多专家在特定领域激活显著高于/低于随机</td>
<td>微弱:专家激活接近均匀路由基线</td>
</tr>
<tr>
<td>arXiv 专业化</td>
<td>第 0 层第一个专家几乎 100% 处理 arXiv token</td>
<td>无明显模式</td>
</tr>
<tr>
<td>GitHub/arXiv 共现</td>
<td>第 7 层经常一起激活</td>
<td>无明显模式</td>
</tr>
<tr>
<td>通用领域(C4)</td>
<td>激活更均衡,说明负载均衡有效</td>
<td>激活均衡</td>
</tr>
</tbody></table>
<p>这一对比揭示了从头训练与上循环训练的深层差异. Mixtral 从 Mistral Dense 模型上循环而来,所有专家从相同的局部最优开始初始化,可能限制了它们最终能分化到的专业化程度. OLMoE 从头训练,每个专家从随机初始化出发,有更大的空间学习不同的知识类型. 这反过来解释了为什么上循环模型最终被从头训练模型超越.</p>
<h3 id="6-4-chzyh-zjclsm-token">6.4 词汇专业化: 专家处理什么 token</h3>
<p>OLMoE 的词汇专业化分析揭示了专家层面的惊人分工:</p>
<table>
<thead>
<tr>
<th>专家 ID</th>
<th>输入 token 专业化</th>
<th>输出 token 专业化</th>
<th>解释</th>
</tr>
</thead>
<tbody><tr>
<td>27</td>
<td>非字母 token(版权符号、拉丁/梵文/西里尔字母)100%</td>
<td>斯洛伐克字母、版权符号、波斯语、日语等 100%</td>
<td>「多语言 token 专家」</td>
</tr>
<tr>
<td>58</td>
<td>标点符号和括号类 token 87-100%</td>
<td>连接词(such、see、which)88-100%</td>
<td>「语法结构专家」</td>
</tr>
<tr>
<td>7</td>
<td>宗教相关 token 65-100%</td>
<td>宗教词汇 50-94%</td>
<td>「宗教领域专家」</td>
</tr>
<tr>
<td>43</td>
<td>地理/国家相关 86-100%</td>
<td>地理相关 52-90%</td>
<td>「地理领域专家」</td>
</tr>
<tr>
<td>4</td>
<td>测量单位 41-90%</td>
<td>测量/科学术语 50-90%</td>
<td>「科学技术专家」</td>
</tr>
<tr>
<td>0</td>
<td>医药/广告相关 68-100%</td>
<td>医药相关 66-100%</td>
<td>「医药领域专家」</td>
</tr>
<tr>
<td>3</td>
<td>家庭关系词汇 62-92%</td>
<td>家庭相关 14-36%</td>
<td>「家庭叙事专家」(输出分化大)</td>
</tr>
<tr>
<td>23</td>
<td>连接词/标点 38-55%</td>
<td>政治/专有名词 33-53%</td>
<td>「连接词+政治专家」</td>
</tr>
</tbody></table>
<p>一个特别有趣的发现是:靠后的层更专注于预测的「输出 token ID」而非「输入 token ID」. 这意味着在深层,路由决策更多由「模型即将预测什么」驱动,而非「当前看到什么」. 这与直觉一致:在较早层,模型对下一个 token 的预测不确定性更大,路由更多基于输入的表层特征;在较深层,模型已形成更明确的预测意图,路由据此调整.</p>
<p>专家 58 的分工尤其精妙:输入端处理标点符号,输出端预测连接词. 这暗示该专家可能负责维护句子的语法连贯性——当看到标点时,它需要决定下一个句子如何与前面连接.</p>
<hr>
<h2 id="7-sjgcyxlpf">7. 数据工程与训练配方</h2>
<h3 id="7-1-ol-mo-e-mix-dclm-dolma-djxzh">7.1 OLMoE-Mix: DCLM + Dolma 的精选组合</h3>
<p>预训练数据总计约 4.06 万亿 token,来源组成如下:</p>
<table>
<thead>
<tr>
<th>来源</th>
<th>GPT-NeoX Token (B)</th>
<th>占比</th>
</tr>
</thead>
<tbody><tr>
<td>DCLM-Baseline(网页)</td>
<td>3,860</td>
<td>95.1%</td>
</tr>
<tr>
<td>StarCoder(代码)</td>
<td>101</td>
<td>2.5%</td>
</tr>
<tr>
<td>peS2o(STEM 论文)</td>
<td>57.2</td>
<td>1.4%</td>
</tr>
<tr>
<td>arXiv(论文)</td>
<td>21.1</td>
<td>0.5%</td>
</tr>
<tr>
<td>OpenWebMath(数学网页)</td>
<td>12.7</td>
<td>0.3%</td>
</tr>
<tr>
<td>Algebraic Stack(数学代码)</td>
<td>12.6</td>
<td>0.3%</td>
</tr>
<tr>
<td>Wikipedia &amp; Wikibooks</td>
<td>3.69</td>
<td>0.09%</td>
</tr>
</tbody></table>
<p>数据清洗策略:</p>
<ul>
<li>所有数据源:移除包含 32 个或更多重复 n-gram 的文档(n-gram 长度 1-13)</li>
<li>StarCoder 子集额外过滤:GitHub 星数少于 2 的仓库;最频繁单词占比超过 30%;前两个最频繁单词合计占比超过 50%</li>
</ul>
<p>DCLM-Baseline 占据绝对主导地位(95.1%),这与 DCLM 论文的发现一致:经过精心过滤的 Common Crawl 子集在常见基准上优于 Dolma 1.7 和其他数据集. 论文还尝试了添加 Reddit 和 FLAN,但未发现一致的性能提升.</p>
<h3 id="7-2-xllc">7.2 训练流程</h3>
<ul>
<li>总训练 token: 5.133T(约 1.3 个 epoch)</li>
<li>每轮开始时随机打乱数据</li>
<li>退火阶段:最后 100B token,重新打乱数据集后线性衰减学习率至 0</li>
</ul>
<h3 id="7-3-spjddgjfx">7.3 适配阶段的关键发现</h3>
<table>
<thead>
<tr>
<th>配置</th>
<th>MMLU</th>
<th>GSM8k</th>
<th>BBH</th>
<th>HumanEval</th>
<th>AlpacaEval</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>基线 +SFT</td>
<td>51.4</td>
<td>40.5</td>
<td>38.0</td>
<td>51.6</td>
<td>69.2</td>
<td>54.0</td>
</tr>
<tr>
<td>基线 +DPO</td>
<td>51.9</td>
<td>45.5</td>
<td>37.0</td>
<td>54.8</td>
<td>84.0</td>
<td>57.7</td>
</tr>
<tr>
<td>+SFT (保留 LBL)</td>
<td>50.9</td>
<td>36.5</td>
<td>35.7</td>
<td>52.4</td>
<td>66.9</td>
<td>52.8</td>
</tr>
<tr>
<td>退火前Checkpoint +SFT</td>
<td>50.2</td>
<td>43.0</td>
<td>35.6</td>
<td>55.5</td>
<td>68.9</td>
<td>53.8</td>
</tr>
</tbody></table>
<p>三个关键发现:</p>
<ol>
<li><p><strong>适配阶段应移除负载均衡损失</strong>: 保留 LBL 的 SFT 平均分 52.8,移除后 54.0. 这是因为路由行为在预训练早期就已基本定型,适配阶段不再需要强制均衡.</p>
</li>
<li><p><strong>退火后Checkpoint优于退火前</strong>: 退火后Checkpoint在 DPO 后平均分 57.7,退火前仅 56.3. 退火阶段的低学习率精细调整对最终适配质量有显著影响.</p>
</li>
<li><p><strong>DPO 与 KTO 表现相当</strong>: 两者平均分均为 57.7,但 DPO 在 AlpacaEval 上得分更高(84.0 vs. 81.6),而 AlpacaEval 的数据污染风险更小.</p>
</li>
</ol>
<p>SFT 带来的 GSM8k 提升超过 10 倍(从 3.0 到 40.5),主要得益于适配阶段纳入了额外的数学数据(MetaMathQA),补偿了预训练阶段相对较少的数学数据量.</p>
<hr>
<h2 id="8-xndwycbfx">8. 性能定位与成本分析</h2>
<h3 id="8-1-yxlh-1b-jhcsdtzl">8.1 预训练后: 1B 激活参数的统治力</h3>
<p>在 1B 激活参数级别,OLMoE-1B-7B 全面领先:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>激活参数</th>
<th>MMLU</th>
<th>HellaSwag</th>
<th>ARC-C</th>
<th>ARC-E</th>
<th>PIQA</th>
</tr>
</thead>
<tbody><tr>
<td>OLMo-1B</td>
<td>1.3B</td>
<td>32.1</td>
<td>67.5</td>
<td>36.4</td>
<td>53.5</td>
<td>74.0</td>
</tr>
<tr>
<td>TinyLlama-1B</td>
<td>1.1B</td>
<td>33.6</td>
<td>60.8</td>
<td>38.1</td>
<td>69.5</td>
<td>71.7</td>
</tr>
<tr>
<td>Llama3.2-1B</td>
<td>1.2B</td>
<td>38.2</td>
<td>67.3</td>
<td>43.5</td>
<td>71.6</td>
<td>73.7</td>
</tr>
<tr>
<td>DCLM-1B</td>
<td>1.4B</td>
<td>48.5</td>
<td>75.1</td>
<td>57.6</td>
<td>79.5</td>
<td>76.6</td>
</tr>
<tr>
<td><strong>OLMoE-1B-7B</strong></td>
<td><strong>1.3B</strong></td>
<td><strong>54.1</strong></td>
<td><strong>80.0</strong></td>
<td><strong>62.1</strong></td>
<td><strong>84.2</strong></td>
<td><strong>79.8</strong></td>
</tr>
</tbody></table>
<p>OLMoE-1B-7B 甚至超越了一些 7B Dense 模型(如 Llama2-7B 的 MMLU 46.2 vs. OLMoE 的 54.1),但略逊于最新的 7-9B 模型(如 Llama3.1-8B、Gemma2-9B). 这符合预期:MoE 的「以小博大」有其边界,无法无限跨越参数量差距.</p>
<h3 id="8-2-sph-cygdmxddhnl">8.2 适配后: 超越更大模型的对话能力</h3>
<p>OLMoE-1B-7B-Instruct (DPO) 在多个基准上超越了参数量更大的指令模型:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>激活参数</th>
<th>MMLU</th>
<th>GSM8k</th>
<th>BBH</th>
<th>HumanEval</th>
<th>AlpacaEval</th>
</tr>
</thead>
<tbody><tr>
<td>OLMo-7B-Instruct</td>
<td>6.9B</td>
<td>52.8</td>
<td>9.0</td>
<td>16.6</td>
<td>35.0</td>
<td>83.5</td>
</tr>
<tr>
<td>Llama2-13B-Chat</td>
<td>13B</td>
<td>~47</td>
<td>~30</td>
<td>~33</td>
<td>~28</td>
<td>~72</td>
</tr>
<tr>
<td>DeepSeekMoE-16B +Chat</td>
<td>2.9B</td>
<td>48.5</td>
<td>46.5</td>
<td>40.8</td>
<td>70.1</td>
<td>74.8</td>
</tr>
<tr>
<td><strong>OLMoE-1B-7B-Instruct</strong></td>
<td><strong>1.3B</strong></td>
<td><strong>51.9</strong></td>
<td><strong>45.5</strong></td>
<td><strong>37.0</strong></td>
<td><strong>54.8</strong></td>
<td><strong>84.0</strong></td>
</tr>
</tbody></table>
<p>平均分 57.7 在所有基准模型中最高. AlpacaEval 84% 的分数超越了许多更大 Dense 模型,验证了 MoE 架构在对话任务上的效率优势.</p>
<h3 id="8-3-xlytlcb">8.3 训练与推理成本</h3>
<table>
<thead>
<tr>
<th>阶段</th>
<th>硬件</th>
<th>时间</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>预训练</td>
<td>256 块 H100</td>
<td>约 10 天</td>
<td>NV-link 跨 GPU,InfiniBand 跨节点</td>
</tr>
<tr>
<td>SFT</td>
<td>32 块 H100</td>
<td>33 小时</td>
<td>序列长度 &lt; 4096</td>
</tr>
<tr>
<td>DPO</td>
<td>32 块 H100</td>
<td>14 小时</td>
<td></td>
</tr>
</tbody></table>
<p>MoE 的训练速度约为同等激活参数量 Dense LM 的约 2 倍(按训练时间计算). 虽然按 token 数量计算 MoE 以约 3 倍少的 token 达到 Dense 的最终性能,但 7B 总参数的额外内存开销使 MoE 的吞吐量约为 Dense 的 63%(23,600 vs. 37,500 token/s/GPU),因此实际时间加速约为 2 倍.</p>
<hr>
<h2 id="9-kfstdkyjz">9. 开放生态的科研价值</h2>
<p>OLMoE 在 MoE 领域的开放程度是前所未有的:</p>
<table>
<thead>
<tr>
<th>开放维度</th>
<th>JetMoE</th>
<th>OpenMoE</th>
<th>OLMoE</th>
</tr>
</thead>
<tbody><tr>
<td>模型权重</td>
<td>是</td>
<td>是</td>
<td>是</td>
</tr>
<tr>
<td>训练数据</td>
<td>否</td>
<td>是</td>
<td>是</td>
</tr>
<tr>
<td>训练代码</td>
<td>是</td>
<td>是</td>
<td>是</td>
</tr>
<tr>
<td>中间Checkpoint</td>
<td>否</td>
<td>否</td>
<td>是(每 5000 步)</td>
</tr>
<tr>
<td>训练日志</td>
<td>否</td>
<td>否</td>
<td>是(W&amp;B 完整日志)</td>
</tr>
<tr>
<td>消融实验配置</td>
<td>否</td>
<td>否</td>
<td>是(全部详细配置)</td>
</tr>
<tr>
<td>初始化方案</td>
<td>未提及</td>
<td>未提及</td>
<td>是(截断正态,std=0.02)</td>
</tr>
</tbody></table>
<p>中间Checkpoint的开放尤为重要. 路由饱和分析、专家共激活分析、领域和词汇专业化分析——这些深入理解 MoE 内部机制的工作,都依赖于对训练过程中间状态的访问. 没有中间Checkpoint,研究者只能分析最终模型的「静态快照」,无法观察路由行为如何随训练演化. OLMoE 的开放发布使这些研究成为可能.</p>
<hr>
<h2 id="10-jxywlfx">10. 局限与未来方向</h2>
<h3 id="10-1-fzjhssdmd">10.1 负载均衡损失的矛盾</h3>
<p>负载均衡损失是 MoE 训练的必需品(防止死权重),但它同时限制了专家的专业化深度. 一个理想的 MoE 应该允许某些专家在特定领域被更频繁地激活,而不是被强制均匀使用. 未来工作可以探索:</p>
<ul>
<li>动态调整的负载均衡损失权重</li>
<li>完全移除负载均衡损失,依赖其他机制防止死权重</li>
<li>领域感知的负载均衡策略</li>
</ul>
<h3 id="10-2-dyc-moe-dkfwt">10.2 第一层 MoE 的开放问题</h3>
<p>第一层的路由饱和显著慢于其他层,且负载均衡收敛更困难. DeepSeekMoE 选择「第一层不使用 MoE」,OLMoE 则保留了第一层 MoE 但接受了其较慢的饱和. 哪种策略更优尚无定论.</p>
<h3 id="10-3-zjzhd-scaling-limit">10.3 专家组合的 scaling limit</h3>
<p>64 专家/激活 8 个已接近收益递减的拐点. 继续增加专家数量(如 256 专家)可能带来的性能提升有限,但会显著增加路由网络的复杂度和通信开销. 在专家数量和组合灵活性之间,可能存在一个计算效率意义上的最优平衡点.</p>
<h3 id="10-4-dmt-moe-dqj">10.4 多模态 MoE 的前景</h3>
<p>OLMoE 在 Expert Choice vs. Token Choice 的分析中指出,EC 在多模态设置中可能更有益(丢弃噪声图像 token 的损害小于丢弃文本 token). 这为 OLMoE 的多模态扩展留下了明确的后续方向.</p>
<hr>
<h2 id="11-mxpxdw">11. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: OLMo-1B (架构基础、词表、训练框架)</li>
<li><strong>核心创新</strong>:<ul>
<li>细粒度 Token Choice MoE (64 专家/激活 8 个,无丢弃)</li>
<li>系统性的 MoE 消融实验(共享专家、上循环、粒度、路由算法)</li>
<li>路由行为深度分析(饱和、共激活、领域/词汇专业化)</li>
<li>训练稳定性工程(RMSNorm + QK-Norm + 截断初始化 + 小 epsilon)</li>
</ul>
</li>
<li><strong>同期可比模型</strong>: Mixtral-8x7B(更大规模但上循环)、DeepSeekMoE-16B(共享专家)、JetMoE-2B-9B、OpenMoE-3B-9B</li>
<li><strong>被后续工作引用</strong>: OLMoE 的路由专业化分析为 MoE 可解释性研究提供了实证基础;其开放发布模式影响了后续开源 MoE 模型的发布标准</li>
</ul>
<hr>
<p><em>本文档基于 OLMoE 原始论文(arXiv:2409.02060 / ICLR 2025)和配套开源资源进行技术剖析. 所有数据、公式和实验结论均来自原始论文.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsmkyjxyygqkfd-moe-jx","text":"1. 设计动机: 为什么开源界需要一个全开放的 MoE 基线"},{"level":2,"id":"2-jgyj-c-olmo-1b-d-ol-mo-e-1b-7b-dgjbq","text":"2. 架构演进: 从 OLMo-1B 到 OLMoE-1B-7B 的关键变迁"},{"level":3,"id":"2-1-csgmyjsxs","text":"2.1 参数规模与计算效率"},{"level":3,"id":"2-2-cfcsh-layer-norm-d-rms-norm-dhg","text":"2.2 从非参数化 LayerNorm 到 RMSNorm 的回归"},{"level":3,"id":"2-3-qk-norm-yjdztcsh-szszbx","text":"2.3 QK-Norm 与截断正态初始化: 双重数值保险"},{"level":3,"id":"2-4-adam-w-epsilon-ygbhsdgjccs","text":"2.4 AdamW Epsilon: 一个被忽视的关键超参数"},{"level":2,"id":"3-xldlysj-64-zj-jh-8-gdxtxxz","text":"3. 细粒度路由设计: 64 专家/激活 8 个的系统性选择"},{"level":3,"id":"3-1-zjlddsydjqx","text":"3.1 专家粒度的收益递减曲线"},{"level":3,"id":"3-2-gxzj-ygbzwdzj","text":"3.2 共享专家: 一个被证伪的直觉"},{"level":3,"id":"3-3-token-choice-vs-expert-choice-xnyxysd","text":"3.3 Token Choice vs. Expert Choice: 性能优先于速度"},{"level":2,"id":"4-moe-xlwdxgc-wxgjcs","text":"4. MoE 训练稳定性工程: 五项关键措施"},{"level":3,"id":"4-1-fzjhss-fz-sqz-dbxdj","text":"4.1 负载均衡损失: 防止「死权重」的必需代价"},{"level":3,"id":"4-2-router-z-loss-szwddzhydfx","text":"4.2 Router Z-loss: 数值稳定的最后一道防线"},{"level":3,"id":"4-3-xlzssdwzgc","text":"4.3 训练总损失的完整构成"},{"level":2,"id":"5-xssxh-c-dense-gz-moe-djx","text":"5. 稀疏上循环: 从 Dense「改造」MoE 的局限"},{"level":2,"id":"6-lyhwsdfx-bh-gjhyzyh","text":"6. 路由行为深度分析: 饱和、共激活与专业化"},{"level":3,"id":"6-1-lybh-lyqzyxlzqj-dx","text":"6.1 路由饱和: 路由器在预训练早期即「定型」"},{"level":3,"id":"6-2-zjgjh-hbefry","text":"6.2 专家共激活: 互补而非冗余"},{"level":3,"id":"6-3-lyzyh-ol-mo-e-vs-mixtral-dxmdb","text":"6.3 领域专业化: OLMoE vs. Mixtral 的鲜明对比"},{"level":3,"id":"6-4-chzyh-zjclsm-token","text":"6.4 词汇专业化: 专家处理什么 token"},{"level":2,"id":"7-sjgcyxlpf","text":"7. 数据工程与训练配方"},{"level":3,"id":"7-1-ol-mo-e-mix-dclm-dolma-djxzh","text":"7.1 OLMoE-Mix: DCLM + Dolma 的精选组合"},{"level":3,"id":"7-2-xllc","text":"7.2 训练流程"},{"level":3,"id":"7-3-spjddgjfx","text":"7.3 适配阶段的关键发现"},{"level":2,"id":"8-xndwycbfx","text":"8. 性能定位与成本分析"},{"level":3,"id":"8-1-yxlh-1b-jhcsdtzl","text":"8.1 预训练后: 1B 激活参数的统治力"},{"level":3,"id":"8-2-sph-cygdmxddhnl","text":"8.2 适配后: 超越更大模型的对话能力"},{"level":3,"id":"8-3-xlytlcb","text":"8.3 训练与推理成本"},{"level":2,"id":"9-kfstdkyjz","text":"9. 开放生态的科研价值"},{"level":2,"id":"10-jxywlfx","text":"10. 局限与未来方向"},{"level":3,"id":"10-1-fzjhssdmd","text":"10.1 负载均衡损失的矛盾"},{"level":3,"id":"10-2-dyc-moe-dkfwt","text":"10.2 第一层 MoE 的开放问题"},{"level":3,"id":"10-3-zjzhd-scaling-limit","text":"10.3 专家组合的 scaling limit"},{"level":3,"id":"10-4-dmt-moe-dqj","text":"10.4 多模态 MoE 的前景"},{"level":2,"id":"11-mxpxdw","text":"11. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/03-olmo-3/05-olmo-3-moe" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/03-olmo-3/05-olmo-3-moe" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMoE 核心架构与路由专业化剖析</h1>
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
