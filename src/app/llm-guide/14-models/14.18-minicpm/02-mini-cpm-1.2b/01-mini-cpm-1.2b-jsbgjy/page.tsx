"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-1.2B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies
原文链接: <a href="https://arxiv.org/abs/2404.06395">https://arxiv.org/abs/2404.06395</a>
发布日期: 2024-04-09 (v1), 2024-06-03 (v3)
发布机构: Tsinghua University (清华大学) &amp; Modelbest Inc. (面壁智能)
模型规模: 1.2B 非嵌入参数(总计约 1.3B)
训练数据: 与 MiniCPM-2.4B 共用 1T+ tokens 预训练数据
开源协议: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="1-mxdw-dcbsd-quot-xxgp-quot">1 模型定位: 端侧部署的&quot;小小钢炮&quot;</h2>
<p>MiniCPM-1.2B 是面壁智能于 2024 年 4 月发布的端侧小语言模型, 与 MiniCPM-2.4B 共同构成 MiniCPM 系列的基座模型双旗舰. 在参数量较 2.4B 减少近一半的前提下, 1.2B 版本仍保持了前者约 87% 的综合性能, 同时在推理速度上提升 38%, 服务成本下降 60%.</p>
<p>面壁智能将 1.2B 定位为&quot;小小钢炮&quot;——一个专为更广泛端侧场景优化的尺寸变体. 如果说 2.4B 瞄准的是旗舰手机的高端体验, 那么 1.2B 则下探到中低端机型乃至更轻量级的终端设备, 让端侧大模型的部署门槛进一步降低.</p>
<blockquote>
<p>这里值得理解面壁智能的产品策略. 同时发布 2.4B 和 1.2B 两个尺寸, 本质上是端侧模型产品化的标准做法: 用一个技术底座覆盖不同算力层级的设备生态. 但 MiniCPM 的独特之处在于, 两个尺寸并非简单的&quot;缩放&quot;关系——1.2B 不是 2.4B 的直接剪枝或量化产物, 而是从头训练的独立模型, 拥有更深的网络(52 层 vs 40 层)和更激进的架构优化(GQA + 小词表). 这意味着 1.2B 在保持能力的同时, 针对性地解决了端侧部署的三大痛点: 内存占用、推理延迟和功耗.</p>
</blockquote>
<hr>
<h2 id="2-jgsj-gsgby-gqa-dzhq">2 架构设计: 更深更薄与 GQA 的组合拳</h2>
<h3 id="2-1-gsgbdwljg">2.1 更深更薄的网络结构</h3>
<p>MiniCPM-1.2B 采用了与 2.4B 截然不同的宽高比设计. 具体配置如表 1 所示:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>N(B)</th>
<th>d_model</th>
<th>d_ff</th>
<th>d_h</th>
<th>n_q</th>
<th>n_kv</th>
<th>L</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-1.2B</td>
<td>1,247,442,432</td>
<td>1536</td>
<td>3840</td>
<td>64</td>
<td>24</td>
<td>8</td>
<td>52</td>
</tr>
<tr>
<td>MiniCPM-2.4B</td>
<td>2,442,057,984</td>
<td>2304</td>
<td>5760</td>
<td>64</td>
<td>36</td>
<td>36</td>
<td>40</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiniCPM-1.2B 与 2.4B 的模型架构对比. N(B) 为非嵌入参数数量, d_model 为隐藏维度, d_ff 为前馈层瓶颈维度, d_h 为注意力头维度, n_q 为 Query 头数, n_kv 为 Key/Value 头数, L 为层数.</p>
</blockquote>
<p>从表 1 可以清晰地看到 1.2B 的设计哲学: <strong>用深度换宽度</strong>. 1.2B 的隐藏维度 d_model 从 2.4B 的 2304 缩减到 1536, 但层数从 40 增加到 52. 这种&quot;更深更薄&quot;的架构选择源于模型风洞实验的发现——对于小型语言模型, 更深的网络比较宽的网络表现更好, 这一观察与 Liu et al. (2024) 的结论一致.</p>
<blockquote>
<p>这里的设计权衡值得深入分析. 从表达能力理论看, Transformer 的深度决定了特征抽象的层次数, 每一层新增的非线性变换都能提升模型的复合表征能力; 而宽度主要决定每层的&quot;记忆容量&quot;. 对于固定参数量, 增加深度带来的收益在 SLM 区域尤为明显——因为小模型天然缺乏&quot;暴力记忆&quot;大知识库的能力, 必须依赖更深的层次化抽象来提取和压缩信息. 52 层对 1.2B 参数来说是一个相当激进的深度: 作为对比, Llama2-7B 仅 32 层, Qwen1.5-1.8B 为 24 层. 但过深的网络面临梯度消失和训练不稳定的风险, 面壁智能通过模型风洞实验中对初始化、学习率和归一化策略的精细调优, 成功稳定了 52 层网络的训练.</p>
</blockquote>
<h3 id="2-2-group-query-attention">2.2 Group Query Attention</h3>
<p>MiniCPM-1.2B 在注意力机制上采用了 Group Query Attention(GQA, 分组查询注意力), 而 2.4B 保持标准的多头注意力(MHA)不变. 具体而言, 1.2B 的 n_q = 24, n_kv = 8, 即每 3 个 Query 头共享 1 组 Key/Value 头.</p>
<blockquote>
<p>GQA 的引入有两个直接动机. 第一是<strong>参数压缩</strong>: 注意力层的参数量与头数成正比. 在标准 MHA 中, 注意力层参数约为 4 × d_model × d_model; 采用 GQA 后, 由于 KV 投影矩阵的维度缩减, 这部分参数显著降低. 对于 1.2B 这样参数预算极其紧张的模型, 每一处压缩都至关重要. 第二是<strong>推理优化</strong>: 端侧部署中长文本场景的 KV Cache 内存是核心瓶颈. 标准 MHA 的 KV Cache 大小为 2 × n_heads × d_head × seq_len × batch_size × sizeof(dtype); GQA 将 n_heads 替换为 n_kv_heads, 在 1.2B 中就是从 24 降到 8, 直接削减了 2/3 的 KV Cache 占用. 这意味着在 128K 长文本场景下, GQA 可以为 1.2B 节省数 GB 的显存/内存, 是决定端侧可用性的关键设计.</p>
</blockquote>
<h3 id="2-3-cbys-mini-cpm-tokenizer-70k">2.3 词表压缩: MiniCPMTokenizer-70K</h3>
<p>Embedding 层在 SLM 中占据不可忽视的参数比例. MiniCPM-2.4B 使用了 122,753 的词表(MiniCPMTokenizer-120K), 但对于 1.2B 模型, 如此庞大的词表会吃掉过多参数预算. 因此, 1.2B 采用了重新训练的 MiniCPMTokenizer-70K, 词表大小缩减至 73,440.</p>
<p>词表压缩的具体策略是: 在与 120K tokenizer 相同的文档上重新训练 BPE(Byte Pair Encoding), 将最大词表数限制为 64,000; 特殊字符方面, 保留繁体中文、emoji 和常用特殊符号, 但移除了中文生僻字.</p>
<p>压缩效果如表 2 所示:</p>
<table>
<thead>
<tr>
<th>Tokenizer</th>
<th>词表大小</th>
<th>中文压缩率</th>
<th>英文压缩率</th>
<th>代码压缩率</th>
<th>论文压缩率</th>
<th>平均压缩率</th>
</tr>
</thead>
<tbody><tr>
<td>Báichuan2</td>
<td>125,696</td>
<td>3.64</td>
<td>4.12</td>
<td>2.71</td>
<td>2.74</td>
<td>3.30</td>
</tr>
<tr>
<td>ChatGLM2</td>
<td>64,794</td>
<td>3.54</td>
<td>4.02</td>
<td>2.71</td>
<td>2.88</td>
<td>3.29</td>
</tr>
<tr>
<td>Llama2</td>
<td>32,000</td>
<td>1.87</td>
<td>3.78</td>
<td>2.74</td>
<td>2.97</td>
<td>2.84</td>
</tr>
<tr>
<td>MiniCPM-120K</td>
<td>122,753</td>
<td><strong>3.73</strong></td>
<td><strong>4.14</strong></td>
<td><strong>2.81</strong></td>
<td><strong>2.93</strong></td>
<td><strong>3.40</strong></td>
</tr>
<tr>
<td>MiniCPM-70K</td>
<td>73,440</td>
<td>3.56</td>
<td>4.02</td>
<td>2.76</td>
<td>2.88</td>
<td>3.31</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 不同 tokenizer 在 30 万文档评测集上的压缩率对比(Bytes/Tokens, 越高越好). 数据取自 MiniCPM 技术报告 Table 8.</p>
</blockquote>
<blockquote>
<p>词表压缩是 1.2B 最核心的&quot;瘦身&quot;手段之一, 但它不是一个无代价的优化. 从表 2 可以看到, 70K 词表的中文压缩率从 3.73 降到 3.56, 英文从 4.14 降到 4.02——这意味着同样的文本需要更多 token 来表示, 变相增加了推理时的计算量. 但权衡之下, 词表缩小带来的 embedding 层参数节省(约减少 40% 的 embedding 参数量)被重新分配给了 Transformer 层, 最终提升了模型的整体表达能力. 另一个潜在代价是生僻字的编码: 移除中文 rare characters 后, 某些古籍、方言或专业术语中的低频汉字会被拆分为多个 subword, 可能影响特定领域的理解精度. 不过对于面向通用端侧场景的 1.2B 来说, 这是一个合理的取舍.</p>
</blockquote>
<hr>
<h2 id="3-xldty-wsd-tdq">3 训练动态与 WSD 调度器</h2>
<h3 id="3-1-gxdxljcss">3.1 共享的训练基础设施</h3>
<p>MiniCPM-1.2B 与 2.4B 共用同一套训练基础设施和训练数据, 包括:</p>
<ul>
<li><strong>优化器</strong>: AdamW, 权重衰减 0.1.</li>
<li><strong>学习率调度器</strong>: Warmup-Stable-Decay(WSD)三阶段调度器.</li>
<li><strong>训练数据</strong>: 来自网页、书籍、代码和对话的多样化文本, 总量超过 1T tokens.</li>
<li><strong>分词器</strong>: 1.2B 使用 MiniCPMTokenizer-70K, 2.4B 使用 MiniCPMTokenizer-120K.</li>
</ul>
<p>WSD 调度器的核心设计是将训练分为 Warmup(学习率线性上升至 η)、Stable(学习率保持 η 不变)和 Decay(学习率指数衰减)三个阶段. 1.2B 和 2.4B 在 Stable 阶段共用相同的训练数据 pipeline, 但在 Decay 阶段可以根据各自的目标进行微调.</p>
<h3 id="3-2-1-2b-tydxlxx">3.2 1.2B 特有的训练现象</h3>
<p>论文 Figure 12 展示了 MiniCPM-1.2B 在 C4 数据集上的训练 loss 曲线. 与 2.4B 不同, 1.2B 的 loss 曲线在训练初期出现了一个明显的第一次下降, 这并非来自学习率衰减, 而是<strong>batch size 增大</strong>的结果.</p>
<blockquote>
<p>这个现象与 Smith et al. (2017) 的发现一致: 在一定范围内, 增大 batch size 与降低学习率具有相似的优化效果——两者都减小了参数更新的噪声, 使优化轨迹更稳定地朝向 loss landscape 的底部移动. 对于 1.2B 这样参数较少的模型, 较大的 batch size 带来的梯度估计方差减小尤为重要, 因为小模型的 loss landscape 通常比大模型更&quot;崎岖&quot;, 高方差的更新容易使其陷入糟糕的局部最小值. 面壁智能在 1.2B 的训练中利用了这一点, 通过在某个阶段增大 batch size 来诱导 loss 的显著下降, 这是一种经济且高效的训练技巧.</p>
</blockquote>
<p>在 Decay 阶段, 1.2B 同样观察到了 loss 的急剧下降, 这与 2.4B 的现象一致, 进一步验证了 WSD 调度器&quot;稳定阶段探索、衰减阶段精炼&quot;的训练动态假设.</p>
<hr>
<h2 id="4-xnpc-yxbddbj">4 性能评测: 以小博大的边界</h2>
<h3 id="4-1-jzmxpc">4.1 基座模型评测</h3>
<p>我们在多个学术基准测试上评估了 MiniCPM-1.2B, 评测设置与 2.4B 保持一致, 结果如表 3 所示.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>C-Eval</th>
<th>CMMLU</th>
<th>MMLU</th>
<th>GSM8K</th>
<th>MATH</th>
<th>HumanEval</th>
<th>MBPP</th>
<th>BBH</th>
<th>ARC-e</th>
<th>ARC-c</th>
<th>HellaSwag</th>
</tr>
</thead>
<tbody><tr>
<td>TinyLlama-1.1B</td>
<td>25.02</td>
<td>24.03</td>
<td>24.30</td>
<td>6.71</td>
<td>1.80</td>
<td>19.91</td>
<td>2.27</td>
<td>28.78</td>
<td>60.77</td>
<td>28.15</td>
<td>58.33</td>
</tr>
<tr>
<td>Qwen1.5-1.8B</td>
<td>55.00</td>
<td>50.85</td>
<td>43.81</td>
<td>5.49</td>
<td>24.82</td>
<td>26.16</td>
<td>3.25</td>
<td>29.07</td>
<td>63.97</td>
<td>43.69</td>
<td>59.28</td>
</tr>
<tr>
<td>Gemma-2B</td>
<td>29.26</td>
<td>28.56</td>
<td>38.49</td>
<td>24.39</td>
<td>3.34</td>
<td>29.74</td>
<td>16.83</td>
<td>30.93</td>
<td>74.33</td>
<td>40.70</td>
<td>69.51</td>
</tr>
<tr>
<td>Phi-2(2B)</td>
<td>23.37</td>
<td>24.18</td>
<td>52.66</td>
<td>47.56</td>
<td>3.50</td>
<td>55.04</td>
<td>57.16</td>
<td>43.39</td>
<td>86.11</td>
<td>71.25</td>
<td>73.07</td>
</tr>
<tr>
<td>Llama2-7B</td>
<td>32.42</td>
<td>31.11</td>
<td>44.32</td>
<td>12.20</td>
<td>1.80</td>
<td>27.17</td>
<td>13.57</td>
<td>33.23</td>
<td>75.25</td>
<td>42.75</td>
<td>75.62</td>
</tr>
<tr>
<td>Llama2-13B</td>
<td>37.32</td>
<td>37.06</td>
<td>54.71</td>
<td>17.07</td>
<td>2.25</td>
<td>32.55</td>
<td>21.15</td>
<td>37.92</td>
<td>78.87</td>
<td>58.19</td>
<td>79.23</td>
</tr>
<tr>
<td><strong>MiniCPM-1.2B</strong></td>
<td><strong>49.14</strong></td>
<td><strong>46.81</strong></td>
<td><strong>49.63</strong></td>
<td><strong>44.51</strong></td>
<td><strong>10.60</strong></td>
<td><strong>31.77</strong></td>
<td><strong>10.60</strong></td>
<td><strong>34.70</strong></td>
<td><strong>80.93</strong></td>
<td><strong>66.81</strong></td>
<td><strong>54.72</strong></td>
</tr>
<tr>
<td>MiniCPM-2.4B</td>
<td>51.13</td>
<td>51.07</td>
<td>53.46</td>
<td>50.00</td>
<td>10.24</td>
<td>47.31</td>
<td>53.83</td>
<td>36.87</td>
<td>85.44</td>
<td>68.00</td>
<td>68.25</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: MiniCPM-1.2B 与同等规模及更大规模模型的性能对比. 所有结果均为 few-shot 设置. 数据取自 MiniCPM 技术报告 Table 3 和 Table 4.</p>
</blockquote>
<p>从表 3 可以看出, MiniCPM-1.2B 在多个维度上实现了&quot;以小博大&quot;:</p>
<ul>
<li><strong>中文能力</strong>: C-Eval 49.14% 和 CMMLU 46.81% 超越了 Llama2-7B(32.42%, 31.11%)和 Llama2-13B(37.32%, 37.06%), 甚至接近部分 7B 级模型的水平.</li>
<li><strong>综合知识</strong>: MMLU 49.63% 同样超越了 Llama2-7B(44.32%)和 Llama2-13B(54.71% 略低, 但 1.2B 参数仅为 13B 的 1/10).</li>
<li><strong>数学推理</strong>: GSM8K 44.51% 是一个亮眼的成绩, 远超 Gemma-2B(24.39%)和 Llama2-7B(12.20%), 甚至超过了 Qwen1.5-1.8B(5.49%). 但相比 Phi-2(2B)的 47.56% 仍有小幅差距.</li>
<li><strong>代码能力</strong>: HumanEval 31.77% 超越了 Gemma-2B(29.74%)和 Llama2-7B(27.17%), 但与 Phi-2(55.04%)和 MiniCPM-2.4B(47.31%)差距明显. MBPP 10.60% 同样偏低.</li>
</ul>
<blockquote>
<p>对这些数据需要保持审慎. 首先, MiniCPM-1.2B 的 MMLU 49.63% 在 1B-2B 尺寸中属于顶尖水平, 但值得注意的是 Phi-2(2B)在 MMLU 上达到了 52.66%, 且在 HumanEval(55.04%)和 MBPP(57.16%)上大幅领先. 这表明 Phi-2 在代码能力上有特殊的优化(可能使用了更高比例的代码数据进行训练), 而 MiniCPM-1.2B 的优势更多体现在中文和通用知识上. 其次, 1.2B 的 MATH 仅 10.60%, 这说明复杂数学推理仍是小模型的明显短板——即使采用了 52 层的深层架构, 1.2B 的参数预算仍不足以支撑多步符号推理所需的复杂模式记忆. 第三, 评测分数均为作者自报, 训练数据的具体构成和截止日期未完全公开, 存在数据污染的潜在风险(特别是 GSM8K 和 HumanEval 的测试数据可能出现在预训练语料中).</p>
</blockquote>
<h3 id="4-2-dhmxpc">4.2 对话模型评测</h3>
<p>经过 SFT 和 DPO 对齐后, MiniCPM-1.2B 的对话版本在 MTBench 等对话评测中同样表现出色. 具体而言, MiniCPM-1.2B-DPO 在 MTBench 上超越了 Zephyr-7B, 展示了小模型在经过偏好对齐后可以达到的对话质量.</p>
<blockquote>
<p>这一结果的意义不容低估. MTBench 评测的是模型的多轮对话、推理、角色扮演、编码等综合能力, 1.2B 模型能在该基准上超越 7B 级的 Zephyr-7B, 说明对齐训练(特别是 DPO)对小模型的提升效果可能比对大模型更显著——因为小模型的初始策略更接近&quot;随机&quot;, 偏好数据提供的信号相对更强. 但需要注意的是, MTBench 的评分主观性较强, 且 1.2B 模型在生成长文本时可能面临更严重的&quot;重复&quot;和&quot;幻觉&quot;问题, 这些在自动化基准测试中难以完全捕捉.</p>
</blockquote>
<hr>
<h2 id="5-dcyh-sd-ncycbdszys">5 端侧优化: 速度、内存与成本的三重压缩</h2>
<h3 id="5-1-tlsd-25-token-s-ddcty">5.1 推理速度: 25 token/s 的端侧体验</h3>
<p>MiniCPM-1.2B 在 iPhone 15 上的实测推理速度达到 <strong>25 token/s</strong>, 较 MiniCPM-2.4B 提升 <strong>38%</strong>. 这一速度相当于人类自然语速的 15 到 25 倍.</p>
<blockquote>
<p>25 token/s 是一个关键的产品化阈值. 人类口语语速约为 150<del>200 词/分钟, 折算成 token 约为 10</del>15 token/s; 阅读速度约为 250<del>300 词/分钟, 即 15</del>20 token/s. 25 token/s 的生成速度意味着模型输出速度远超人类消费速度, 为实时交互应用(如语音助手、实时翻译)提供了充足的延迟冗余. 但有两个现实约束需要注意: 第一, 这是 iPhone 15(A17 Pro)上的成绩, 在中低端 Android 设备(如骁龙 6 系或 4 系)上推理速度可能下降到 5~10 token/s; 第二, 25 token/s 是在无并发、短序列(prefill 开销小)条件下的 decode 速度, 在长文本或高并发场景下会显著下降.</p>
</blockquote>
<h3 id="5-2-nczy-js-51-9">5.2 内存占用: 减少 51.9%</h3>
<p>在 iOS 系统端, MiniCPM-1.2B 的内存用量为 <strong>1.01 GB</strong>, 而 MiniCPM-2.4B 的量化模型为 2.1 GB, 内存减少 <strong>51.9%</strong>.</p>
<blockquote>
<p>内存占用的降低来自三个方面: 模型参数本身减半(1.2B vs 2.4B)、KV Cache 因 GQA 减少 2/3、以及词表缩小带来的 embedding 层压缩. 1.01 GB 的内存 footprint 意味着 1.2B 可以舒适地运行在 4 GB RAM 的设备上(考虑操作系统和其他应用的内存占用), 而 2.4B 可能需要 6 GB 以上的设备. 这直接决定了目标设备的市场覆盖范围——根据 2024 年的市场数据, 全球仍有大量 4 GB RAM 的存量设备, 1.2B 的出现让这些设备也能运行端侧大模型.</p>
</blockquote>
<h3 id="5-3-fwcb-xj-60">5.3 服务成本: 下降 60%</h3>
<p>在云端 API 服务场景下, MiniCPM-1.2B 的成本较 2.4B 下降 <strong>60%</strong>, 折算为 <strong>1 元人民币可处理 4,150,000 tokens</strong>.</p>
<blockquote>
<p>这一成本优势主要来源于推理时的 FLOPs 减少和内存带宽压力降低. 对于端侧本地化部署而言, &quot;成本&quot;更多体现为功耗和电池续航. 1.2B 在纯 CPU 推理时的能耗约为 2.4B 的一半以下, 这对于需要长时间运行的端侧应用(如后台智能助手、持续监听)至关重要. 但 60% 的成本下降是以 13% 的综合性能损失为代价的——对于对精度要求极高的任务(如医疗咨询、法律分析), 开发者需要在成本和性能之间做明确的权衡.</p>
</blockquote>
<hr>
<h2 id="6-jxxynlbj">6 局限性与能力边界</h2>
<p>尽管 MiniCPM-1.2B 在 1B-2B 尺寸中表现出色, 但其能力边界同样清晰:</p>
<p><strong>第一, 复杂推理天花板</strong>. MATH 10.60% 和复杂代码生成任务上的差距表明, 1.2B 的参数预算难以支撑多步逻辑推理和高级抽象模式的记忆. 这并非 MiniCPM-1.2B 独有的问题, 而是所有 1B 级模型的共同瓶颈.</p>
<p><strong>第二, 长文本的内存与速度权衡</strong>. 虽然 GQA 压缩了 KV Cache, 但在 128K 上下文场景下, 1.2B 的 KV Cache 仍需要数百 MB 内存, 且 prefill 阶段的计算延迟会显著增加.</p>
<p><strong>第三, 多语言能力的隐性损失</strong>. 70K 词表对中文和英文的覆盖良好, 但对日语、韩语、阿拉伯语等非训练重点语言的支持可能弱于 120K 词表的 2.4B 版本.</p>
<p><strong>第四, 知识时效性</strong>. MiniCPM-1.2B 的训练数据截止时间与 2.4B 相同, 模型不具备实时信息获取能力, 对于 2024 年后的新事件和知识无法回答.</p>
<hr>
<h2 id="fl-a-syb">附录 A 术语表</h2>
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
<td>SLM</td>
<td>小型语言模型</td>
<td>第 1 节</td>
<td>参数量通常在 1B-3B 范围内的语言模型</td>
</tr>
<tr>
<td>GQA</td>
<td>分组查询注意力</td>
<td>第 2.2 节</td>
<td>将 Query 头分组共享 KV 头, 减少参数量和 KV Cache</td>
</tr>
<tr>
<td>MHA</td>
<td>多头注意力</td>
<td>第 2.2 节</td>
<td>标准 Transformer 注意力, 每个头独立计算 Q/K/V</td>
</tr>
<tr>
<td>WSD</td>
<td>热身-稳定-衰减</td>
<td>第 3.1 节</td>
<td>三阶段学习率调度器, 支持持续训练和中间检查点复用</td>
</tr>
<tr>
<td>BPE</td>
<td>字节对编码</td>
<td>第 2.3 节</td>
<td>一种子词分词算法, 通过合并高频字节对构建词表</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>第 4.2 节</td>
<td>不依赖奖励模型, 直接用偏好数据优化策略的对齐方法</td>
</tr>
<tr>
<td>KV Cache</td>
<td>键值缓存</td>
<td>第 2.2 节</td>
<td>自回归推理中缓存历史 Key/Value 以避免重复计算</td>
</tr>
<tr>
<td>MTBench</td>
<td>多轮对话基准</td>
<td>第 4.2 节</td>
<td>评测模型对话、推理、角色扮演等综合能力的基准测试</td>
</tr>
</tbody></table>
<h2 id="fl-b-hxsysjhz">附录 B 核心实验数据汇总</h2>
<table>
<thead>
<tr>
<th>评测维度</th>
<th>基准测试</th>
<th>MiniCPM-1.2B</th>
<th>MiniCPM-2.4B</th>
<th>Llama2-7B</th>
<th>Llama2-13B</th>
</tr>
</thead>
<tbody><tr>
<td>中文综合</td>
<td>C-Eval</td>
<td>49.14</td>
<td>51.13</td>
<td>32.42</td>
<td>37.32</td>
</tr>
<tr>
<td>中文综合</td>
<td>CMMLU</td>
<td>46.81</td>
<td>51.07</td>
<td>31.11</td>
<td>37.06</td>
</tr>
<tr>
<td>英文综合</td>
<td>MMLU</td>
<td>49.63</td>
<td>53.46</td>
<td>44.32</td>
<td>54.71</td>
</tr>
<tr>
<td>数学推理</td>
<td>GSM8K</td>
<td>44.51</td>
<td>50.00</td>
<td>12.20</td>
<td>17.07</td>
</tr>
<tr>
<td>数学推理</td>
<td>MATH</td>
<td>10.60</td>
<td>10.24</td>
<td>1.80</td>
<td>2.25</td>
</tr>
<tr>
<td>代码生成</td>
<td>HumanEval</td>
<td>31.77</td>
<td>47.31</td>
<td>27.17</td>
<td>32.55</td>
</tr>
<tr>
<td>代码生成</td>
<td>MBPP</td>
<td>10.60</td>
<td>53.83</td>
<td>13.57</td>
<td>21.15</td>
</tr>
<tr>
<td>常识推理</td>
<td>HellaSwag</td>
<td>54.72</td>
<td>68.25</td>
<td>75.62</td>
<td>79.23</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: MiniCPM-1.2B 核心评测数据横向对比汇总.</p>
</blockquote>
<h2 id="fl-c-mxpxdw">附录 C 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-2.4B 的训练基础设施和方法论(模型风洞实验、WSD 调度器).</li>
<li><strong>核心创新</strong>: 更深更薄架构(52 层) + GQA + 词表压缩的三重瘦身策略.</li>
<li><strong>被后续工作引用/影响</strong>: MiniCPM-S-1.2B(ProSparse 稀疏激活进一步压缩)、Gemma-2 2B(2024 年 6 月发布的同尺寸竞品)、Qwen2.5-1.5B(2024 年底的端侧模型).</li>
<li><strong>技术谱系</strong>: 面壁智能&quot;高效 Scaling Law&quot;方法论的重要实践节点, 验证了 SLM 区域&quot;深薄优于宽厚&quot;的架构假设.</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdw-dcbsd-quot-xxgp-quot","text":"1 模型定位: 端侧部署的&quot;小小钢炮&quot;"},{"level":2,"id":"2-jgsj-gsgby-gqa-dzhq","text":"2 架构设计: 更深更薄与 GQA 的组合拳"},{"level":3,"id":"2-1-gsgbdwljg","text":"2.1 更深更薄的网络结构"},{"level":3,"id":"2-2-group-query-attention","text":"2.2 Group Query Attention"},{"level":3,"id":"2-3-cbys-mini-cpm-tokenizer-70k","text":"2.3 词表压缩: MiniCPMTokenizer-70K"},{"level":2,"id":"3-xldty-wsd-tdq","text":"3 训练动态与 WSD 调度器"},{"level":3,"id":"3-1-gxdxljcss","text":"3.1 共享的训练基础设施"},{"level":3,"id":"3-2-1-2b-tydxlxx","text":"3.2 1.2B 特有的训练现象"},{"level":2,"id":"4-xnpc-yxbddbj","text":"4 性能评测: 以小博大的边界"},{"level":3,"id":"4-1-jzmxpc","text":"4.1 基座模型评测"},{"level":3,"id":"4-2-dhmxpc","text":"4.2 对话模型评测"},{"level":2,"id":"5-dcyh-sd-ncycbdszys","text":"5 端侧优化: 速度、内存与成本的三重压缩"},{"level":3,"id":"5-1-tlsd-25-token-s-ddcty","text":"5.1 推理速度: 25 token/s 的端侧体验"},{"level":3,"id":"5-2-nczy-js-51-9","text":"5.2 内存占用: 减少 51.9%"},{"level":3,"id":"5-3-fwcb-xj-60","text":"5.3 服务成本: 下降 60%"},{"level":2,"id":"6-jxxynlbj","text":"6 局限性与能力边界"},{"level":2,"id":"fl-a-syb","text":"附录 A 术语表"},{"level":2,"id":"fl-b-hxsysjhz","text":"附录 B 核心实验数据汇总"},{"level":2,"id":"fl-c-mxpxdw","text":"附录 C 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/02-mini-cpm-1.2b/01-mini-cpm-1.2b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/02-mini-cpm-1.2b/01-mini-cpm-1.2b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-1.2B 技术报告精译</h1>
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
