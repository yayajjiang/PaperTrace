"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-3 模型-系统协同设计与解码成本优化剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding (arXiv:2507.19427v1)
<strong>剖析角度</strong>: 模型-系统协同设计、MFA 注意力机制、AFD 分布式推理、算术强度与硬件匹配
<strong>面向读者</strong>: 已阅读 Step-3 技术报告精译,希望深入理解解码成本优化与分布式推理系统设计的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxdw-jmcbbscsdhs">1. 核心定位:解码成本不是参数的函数</h2>
<p>Step-3 的出发点是「解码阶段的成本焦虑&quot;.在测试时扩展(test-time scaling)范式下,模型通过生成更长的推理链来提升能力,但这直接转化为更高的推理成本.阶跃星辰团队的核心洞察是:<strong>总参数数量和激活参数数量都不是解码成本的良好指标.</strong></p>
<p>| 模型 | 总参数 | 激活参数 | 8K 上下文解码成本(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mn>32</mn><mi>K</mi><mtext>上下文解码成本</mtext><mo stretchy="false">(</mo></mrow><annotation encoding="application/x-tex">/1M tokens) | 32K 上下文解码成本(</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣32</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord cjk_fallback">上下文解码成本</span><span class="mopen">(</span></span></span></span>/1M tokens) |
|:---|:---:|:---:|:---:|:---:|
| DSv3 | 671B | 37B | 0.068 | 0.211 |
| Qwen3 MoE | 235B | 22B | 0.062 | 0.193 |
| <strong>Step-3</strong> | <strong>321B</strong> | <strong>38B</strong> | <strong>0.055</strong> | <strong>0.129</strong> |</p>
<blockquote>
<p><strong>关键洞察</strong>: Step-3 的总参数介于 DSv3 和 Qwen3 MoE 之间,激活参数甚至高于两者,但解码成本却比两者低约 40%.这说明「小模型&quot;不等于「低成本&quot;,解码成本取决于架构设计与硬件的匹配程度,而非单纯的参数规模.</p>
</blockquote>
<hr>
<h2 id="2-mfa-kv-hcyjsldphys">2. MFA:KV 缓存与计算量的平衡艺术</h2>
<h3 id="2-1-szzylsjdqhkj">2.1 三种注意力设计的权衡空间</h3>
<p>Step-3 提出的 MFA(Multi-Matrix Factorization Attention)在 KV 缓存和注意力计算之间寻找了一个独特的平衡点:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">DSv3 (MLA)</th>
<th align="left">Qwen3 (GQA)</th>
<th align="left">Step-3 (MFA)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">KV 缓存策略</td>
<td align="left">低秩压缩 KV</td>
<td align="left">分组共享 KV</td>
<td align="left">低秩分解 QK</td>
</tr>
<tr>
<td align="left">8K KV 内存访问</td>
<td align="left">2.88×10^8 B</td>
<td align="left">7.89×10^8 B</td>
<td align="left"><strong>2.56×10^8 B</strong></td>
</tr>
<tr>
<td align="left">8K 注意力 FLOPs</td>
<td align="left">1.47×10^11</td>
<td align="left">2.52×10^10</td>
<td align="left"><strong>3.27×10^10</strong></td>
</tr>
<tr>
<td align="left">有效秩</td>
<td align="left">16384</td>
<td align="left">8192</td>
<td align="left"><strong>16384</strong></td>
</tr>
<tr>
<td align="left">算术强度</td>
<td align="left">512</td>
<td align="left">32</td>
<td align="left"><strong>128</strong></td>
</tr>
</tbody></table>
<p>MFA 的设计:64 个 Query 头共享 1 个 KV 头,Query 先降维(7168→2048)再升维(2048→16384).这意味着:</p>
<ul>
<li><strong>KV 缓存</strong>:仅 1 个 KV 头,接近 MLA 的压缩水平</li>
<li><strong>注意力计算</strong>:在低秩空间进行 QK 计算,FLOPs 约为 MLA 的 1/4.5</li>
<li><strong>表达能力</strong>:有效秩 16384,与 MLA 相同,大于 GQA 的 8192</li>
</ul>
<h3 id="2-2-ssqd-ljmxsjyyjdql">2.2 算术强度:连接模型设计与硬件的桥梁</h3>
<p>算术强度(arithmetic intensity)是每字节内存访问所需的浮点运算数,是 roofline 模型的核心指标.</p>
<table>
<thead>
<tr>
<th align="left">硬件</th>
<th align="center">Roofline(计算-带宽比)</th>
<th align="center">MLA(512)</th>
<th align="center">MFA(128)</th>
<th align="center">GQA(32)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">H800</td>
<td align="center">591</td>
<td align="center">刚好匹配</td>
<td align="center">内存受限</td>
<td align="center">内存受限</td>
</tr>
<tr>
<td align="left">H20</td>
<td align="center">74</td>
<td align="center">严重计算受限</td>
<td align="center"><strong>接近平衡</strong></td>
<td align="center">内存受限</td>
</tr>
<tr>
<td align="left">A800</td>
<td align="center">156</td>
<td align="center">计算受限</td>
<td align="center"><strong>接近平衡</strong></td>
<td align="center">内存受限</td>
</tr>
<tr>
<td align="left">昇腾 910B</td>
<td align="center">175</td>
<td align="center">计算受限</td>
<td align="center"><strong>接近平衡</strong></td>
<td align="center">内存受限</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: MLA 的算术强度 512 太高了——在 H800 上刚好匹配,但在 H20/A800/910B 上严重计算受限,效率暴跌.GQA 的算术强度 32 太低了——在所有硬件上都是内存受限的.MFA 选择 128 是一个精妙的平衡:它低于 A800/910B 的 roofline,留下了量化/MTP 的优化空间,同时避免了 MLA 在低端硬件上的崩溃.</p>
</blockquote>
<h3 id="2-3-lhy-mtp-djrx">2.3 量化与 MTP 的兼容性</h3>
<p>MFA 的中等算术强度使其对未来的优化技术更加友好:</p>
<table>
<thead>
<tr>
<th align="left">技术</th>
<th align="left">对算术强度的影响</th>
<th align="left">MLA</th>
<th align="left">MFA</th>
<th align="left">GQA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">KV 4-bit 存储 + 8-bit 计算</td>
<td align="left">翻倍</td>
<td align="left">超过 H800 roofline,无收益</td>
<td align="left">适度提升</td>
<td align="left">接近 H20 roofline,显著收益</td>
</tr>
<tr>
<td align="left">MTP</td>
<td align="left">翻倍</td>
<td align="left">超过 H800 roofline,无收益</td>
<td align="left">显著收益</td>
<td align="left">显著收益</td>
</tr>
</tbody></table>
<p>DSv3 的 MLA 因为算术强度已经接近 H800 的 roofline,进一步的量化或 MTP 不会带来实质性收益.而 MFA 的 128 留下了充足的优化空间.</p>
<hr>
<h2 id="3-afd-zyly-ffn-djogm">3. AFD:注意力与 FFN 的解耦革命</h2>
<h3 id="3-1-wsmxyjo">3.1 为什么需要解耦?</h3>
<p>在解码阶段,Attention 和 FFN 展现出根本不同的计算特性:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">主要瓶颈</th>
<th align="left">与上下文关系</th>
<th align="left">理想硬件</th>
</tr>
</thead>
<tbody><tr>
<td align="left">注意力</td>
<td align="left">内存带宽(KV 缓存访问)</td>
<td align="left">线性增长</td>
<td align="left">高内存带宽(H20)</td>
</tr>
<tr>
<td align="left">FFN</td>
<td align="left">计算能力(矩阵乘法)</td>
<td align="left">无关</td>
<td align="left">高算力(H800)</td>
</tr>
</tbody></table>
<p>传统部署中两者在同一 GPU 上交替执行,导致资源利用率不均衡:AFD 的核心思想是将它们解耦为专用子系统.</p>
<h3 id="3-2-afd-dsjmb">3.2 AFD 的设计目标</h3>
<table>
<thead>
<tr>
<th align="left">目标</th>
<th align="left">具体指标</th>
<th align="left">实现方式</th>
</tr>
</thead>
<tbody><tr>
<td align="left">性能目标</td>
<td align="left">50ms TPOT(20 tokens/s)</td>
<td align="left">3 阶段流水线,每段 16.6ms</td>
</tr>
<tr>
<td align="left">流水线优化</td>
<td align="left">完美隐藏通信延迟</td>
<td align="left">A→F→通信多阶段重叠</td>
</tr>
<tr>
<td align="left">独立设计</td>
<td align="left">注意力/FFN 分别最优</td>
<td align="left">架构解耦,灵活修改</td>
</tr>
<tr>
<td align="left">硬件选择</td>
<td align="left">异构部署</td>
<td align="left">注意力配 H20,FFN 配 H800</td>
</tr>
</tbody></table>
<h3 id="3-3-afd-vs-deep-seek-ep">3.3 AFD vs DeepSeek EP</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">DeepSeek EP</th>
<th align="left">Step-3 AFD</th>
</tr>
</thead>
<tbody><tr>
<td align="left">部署规模</td>
<td align="left">320 GPU/实例</td>
<td align="left"><strong>32 GPU/实例</strong></td>
</tr>
<tr>
<td align="left">上下文扩展</td>
<td align="left">固定专家-节点分配,扩展困难</td>
<td align="left"><strong>注意力实例独立扩展</strong></td>
</tr>
<tr>
<td align="left">负载均衡</td>
<td align="left">专家复制,内存开销大</td>
<td align="left"><strong>混合 TP-EP 灵活平衡</strong></td>
</tr>
<tr>
<td align="left">异构硬件</td>
<td align="left">强制同质部署</td>
<td align="left"><strong>支持异构</strong></td>
</tr>
<tr>
<td align="left">FFN 批大小</td>
<td align="left">受注意力影响</td>
<td align="left"><strong>始终保持理想批大小</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: AFD 不是 EP 的替代品,而是互补方法.Step-3 的 FFN 实例可以使用 TP+EP 混合策略,而注意力实例独立扩展.这种「分而治之&quot;的清晰度使得性能建模更精确,理论预测与实测之间的差距显著缩小.</p>
</blockquote>
<hr>
<h2 id="4-moe-xsddyjys">4. MoE 稀疏度的硬件约束</h2>
<h3 id="4-1-zyxsddsxtd">4.1 最优稀疏度的数学推导</h3>
<p>MoE 的稀疏度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 不能任意降低——过度稀疏会带来网络带宽瓶颈和批大小不足的问题.作者从三个约束推导出最小稀疏度:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>S</mi><mo>≥</mo><mfrac><mrow><mi>H</mi><mo>×</mo><mtext>FLOPs</mtext><mo>×</mo><mi>L</mi></mrow><mrow><mtext>Net</mtext><mo>×</mo><mtext>Bandwidth</mtext><mo>×</mo><mn>11.1</mn><mtext>ms</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">S \\geq \\frac{H \\times \\text{FLOPs} \\times L}{\\text{Net} \\times \\text{Bandwidth} \\times 11.1\\text{ms}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8193em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Net</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">11.1</span><span class="mord text"><span class="mord">ms</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">硬件</th>
<th align="center">最小稀疏度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span></th>
<th align="center">DSv3 实际 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span></th>
<th align="center">Step-3 实际 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span></th>
</tr>
</thead>
<tbody><tr>
<td align="left">H800</td>
<td align="center">0.058</td>
<td align="center">0.031</td>
<td align="center"><strong>0.083</strong></td>
</tr>
<tr>
<td align="left">H20</td>
<td align="center">0.007</td>
<td align="center">0.031</td>
<td align="center"><strong>0.083</strong></td>
</tr>
<tr>
<td align="left">A800</td>
<td align="center">0.031</td>
<td align="center">0.031</td>
<td align="center"><strong>0.083</strong></td>
</tr>
<tr>
<td align="left">910B</td>
<td align="center">0.034</td>
<td align="center">0.031</td>
<td align="center"><strong>0.083</strong></td>
</tr>
</tbody></table>
<p>DSv3 的稀疏度 0.031 远低于 H800 的 0.058 阈值,这意味着在 H800 上要么延迟超标,要么 MFU 很低.Step-3 选择约 0.083 的稀疏度(3 路由专家+1 共享专家,从 48 个中选择),在所有主流硬件上都能高效运行.</p>
<h3 id="4-2-gdxsdbtfajqdj">4.2 过度稀疏的变通方案及其代价</h3>
<table>
<thead>
<tr>
<th align="left">变通方案</th>
<th align="left">原理</th>
<th align="left">代价</th>
</tr>
</thead>
<tbody><tr>
<td align="left">大 EP</td>
<td align="left">EP &gt; K,减少单节点网络流量</td>
<td align="left">专家不平衡加剧,可靠性降低</td>
</tr>
<tr>
<td align="left">路由限制</td>
<td align="left">Token 限制到相邻专家</td>
<td align="left">损害模型表达能力</td>
</tr>
</tbody></table>
<p>DSv3 同时采用两种方法,Kimi K2 跟随大 EP 但取消路由限制.这些变通方案都是有代价的.Step-3 通过避免过度稀疏,不需要任何变通方案.</p>
<hr>
<h2 id="5-step-mesh-afd-dtxyq">5. StepMesh:AFD 的通信引擎</h2>
<h3 id="5-1-sjtz">5.1 设计挑战</h3>
<p>AFD 的 3 阶段流水线要求在 272μs 内完成所有通信,现有库难以满足:</p>
<table>
<thead>
<tr>
<th align="left">库</th>
<th align="left">SM 使用</th>
<th align="left">延迟</th>
<th align="left">AFD 适配性</th>
</tr>
</thead>
<tbody><tr>
<td align="left">NCCL</td>
<td align="left">高(通信内核占 SM)</td>
<td align="left">较高</td>
<td align="left">差</td>
</tr>
<tr>
<td align="left">DeepEP</td>
<td align="left">高</td>
<td align="left">中等</td>
<td align="left">差</td>
</tr>
<tr>
<td align="left"><strong>StepMesh</strong></td>
<td align="left"><strong>零 SM 使用</strong></td>
<td align="left"><strong>超低</strong></td>
<td align="left"><strong>专为 AFD 设计</strong></td>
</tr>
</tbody></table>
<h3 id="5-2-gjjsxz">5.2 关键技术选择</h3>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">设计</th>
<th align="left">优势</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CPU 端 RDMA</td>
<td align="left">PostSend/PollCQ 在 CPU 执行</td>
<td align="left">释放 GPU SM 用于计算</td>
</tr>
<tr>
<td align="left">预注册张量</td>
<td align="left">通信前注册,直接内存传输</td>
<td align="left">避免拷贝和拼接开销</td>
</tr>
<tr>
<td align="left">异步 API</td>
<td align="left">独立收发线程</td>
<td align="left">低 CPU 延迟,流畅数据流</td>
</tr>
<tr>
<td align="left">仅 PFC 传输</td>
<td align="left">禁用拥塞控制</td>
<td align="left">最低延迟(牺牲网络公平性)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: StepMesh 的「零 SM 使用&quot;设计对于 AFD 的流水线隐藏至关重要.如果通信占用了 SM,计算就被挤占了,流水线阶段时间就会拉长.StepMesh 已开源(<a href="https://github.com/stepfun-ai/StepMesh),%E5%A2%9E%E5%BC%BA%E4%BA%86%E7%BB%93%E6%9E%9C%E7%9A%84%E5%8F%AF%E5%A4%8D%E7%8E%B0%E6%80%A7%E5%92%8C%E5%8F%AF%E4%BF%A1%E5%BA%A6">https://github.com/stepfun-ai/StepMesh),增强了结果的可复现性和可信度</a>.</p>
</blockquote>
<hr>
<h2 id="6-xnyz-llyscdsl">6. 性能验证:理论与实测的收敛</h2>
<h3 id="6-1-dddtt">6.1 端到端吞吐</h3>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="center">GPU 数</th>
<th align="center">峰值 TGS</th>
<th align="center">相对 DSv3</th>
</tr>
</thead>
<tbody><tr>
<td align="left">DSv3 (博客报告)</td>
<td align="center">144</td>
<td align="center">1850</td>
<td align="center">基线</td>
</tr>
<tr>
<td align="left">DSv3 (性能分析)</td>
<td align="center">128</td>
<td align="center">2324</td>
<td align="center">+26%</td>
</tr>
<tr>
<td align="left">Step-3 (BF16 注意力)</td>
<td align="center">40 (3A2F)</td>
<td align="center">3321</td>
<td align="center"><strong>+43%</strong></td>
</tr>
<tr>
<td align="left"><strong>Step-3 (FP8 注意力)</strong></td>
<td align="center"><strong>32 (2A2F)</strong></td>
<td align="center"><strong>4039</strong></td>
<td align="center"><strong>+74%</strong></td>
</tr>
</tbody></table>
<p>Step-3 在 32 张 GPU 上达到 4039 TGS,比 DSv3 在 128 张 GPU 上的 2324 TGS 高出 74%.更少的 GPU 数意味着更低的运维复杂度和成本.</p>
<h3 id="6-2-mfa-vs-mla-vs-gqa-wgdb">6.2 MFA vs MLA vs GQA 微观对比</h3>
<table>
<thead>
<tr>
<th align="left">上下文</th>
<th align="center">硬件</th>
<th align="center">MFA-Step3</th>
<th align="center">MLA-DSv3</th>
<th align="center">GQA-Qwen3</th>
</tr>
</thead>
<tbody><tr>
<td align="left">8K</td>
<td align="center">H800</td>
<td align="center">281μs</td>
<td align="center">372μs</td>
<td align="center">382μs</td>
</tr>
<tr>
<td align="left">8K</td>
<td align="center">H20</td>
<td align="center"><strong>438μs</strong></td>
<td align="center">1252μs</td>
<td align="center">812μs</td>
</tr>
<tr>
<td align="left">32K</td>
<td align="center">H800</td>
<td align="center">791μs</td>
<td align="center">1125μs</td>
<td align="center">1391μs</td>
</tr>
<tr>
<td align="left">32K</td>
<td align="center">H20</td>
<td align="center"><strong>1452μs</strong></td>
<td align="center">4817μs</td>
<td align="center">3042μs</td>
</tr>
</tbody></table>
<p>在 H20 上,MFA 比 MLA 快近 3 倍,比 GQA 快约 1.9 倍.这验证了 MFA 的「甜点&quot;算术强度使其在各种硬件上都能高效运行.</p>
<h3 id="6-3-600b-sjxr">6.3 600B 升级消融</h3>
<p>将 Step-3 的 FFN 升级到 600B 参数(与 DSv3 类似大小),使用 3A4F 部署:</p>
<ul>
<li>峰值 TGS: 3291(仍远高于 DSv3 的 2324)</li>
<li>说明 Step-3 的优势不仅来自「模型更小&quot;,而是来自 AFD 架构本身</li>
</ul>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-sjdj">7.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么「解码成本&quot;应该是模型设计的核心优化目标?</strong></p>
</blockquote>
<p>传统模型设计以训练效率和能力为首要目标,推理优化交给系统团队.Step-3 将解码成本提升为与模型能力并列的设计约束,原因有四:</p>
<ol>
<li>解码的每 token 成本最高(MFU 低)</li>
<li>推理模型需要更长的思考链,解码成本直接转化为智能上限</li>
<li>更快更便宜的解码加速 RL 训练</li>
<li>优化空间大,技术趣味性强</li>
</ol>
<p>这种「成本先行&quot;的设计哲学与行业趋势形成对比:DeepSeek-R1 展示了长推理链的价值,但没有系统性地优化解码成本;Qwen3 追求长思考模式,但稠密架构的 KV 缓存开销巨大.Step-3 的贡献在于证明了「能力扩展&quot;和&quot;成本控制&quot;不是零和博弈——通过模型-系统协同设计,两者可以兼得.</p>
<blockquote>
<p><strong>思考 2: 为什么「架构团队&quot;和「系统团队&quot;必须坐在一起?</strong></p>
</blockquote>
<p>Step-3 的核心洞察是:只有当架构设计和系统部署被联合考虑时,才能实现真正的成本优化.传统分离模式的弊端:</p>
<table>
<thead>
<tr>
<th align="left">分离模式的问题</th>
<th align="left">协同设计的收益</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构设计过度压缩 KV 缓存,计算负载爆炸</td>
<td align="left">MFA 平衡 KV 和计算,适配多种硬件</td>
</tr>
<tr>
<td align="left">架构追求极致稀疏度,网络带宽崩溃</td>
<td align="left">稀疏度与硬件 roofline 联合优化</td>
</tr>
<tr>
<td align="left">系统团队被动适配,优化空间受限</td>
<td align="left">AFD 从架构层面支持解耦部署</td>
</tr>
</tbody></table>
<p>AFD 不是单纯的系统优化技巧,而是一种重新思考模型架构设计的方法论.它要求架构师在设计注意力层时就考虑「这部分将在什么硬件上以什么批大小运行&quot;,在设计 MoE 时就考虑「网络带宽能支持多大的 EP 规模&quot;.</p>
<h3 id="7-2-sjsy">7.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: MFA 的「甜点&quot;算术强度 128 是如何确定的?</strong></p>
</blockquote>
<p>MFA 的算术强度 128 不是随意选择的,而是经过精心计算的战略决策:</p>
<table>
<thead>
<tr>
<th align="center">算术强度</th>
<th align="center">H800</th>
<th align="center">H20</th>
<th align="center">A800</th>
<th align="center">910B</th>
<th align="left">评价</th>
</tr>
</thead>
<tbody><tr>
<td align="center">32 (GQA)</td>
<td align="center">内存受限</td>
<td align="center">内存受限</td>
<td align="center">内存受限</td>
<td align="center">内存受限</td>
<td align="left">KV 太大,总成本高</td>
</tr>
<tr>
<td align="center">128 (MFA)</td>
<td align="center">内存受限但带宽大</td>
<td align="center"><strong>接近平衡</strong></td>
<td align="center"><strong>接近平衡</strong></td>
<td align="center"><strong>接近平衡</strong></td>
<td align="left">最优折中</td>
</tr>
<tr>
<td align="center">256 (量化后)</td>
<td align="center">内存受限</td>
<td align="center">计算受限</td>
<td align="center">接近平衡</td>
<td align="center">接近平衡</td>
<td align="left">仍有优化空间</td>
</tr>
<tr>
<td align="center">512 (MLA)</td>
<td align="center">刚好匹配</td>
<td align="center">严重计算受限</td>
<td align="center">计算受限</td>
<td align="center">计算受限</td>
<td align="left">高端硬件专用</td>
</tr>
</tbody></table>
<p>Step-3 选择 128 是一个「前瞻性的保守&quot;:它低于 A800/910B 的 roofline,留下了量化/MTP 将算术强度提升到 256 的空间,而 256 仍然不超过这些硬件的 roofline.如果一开始选 256,量化后变成 512 就会像 MLA 一样在低端硬件上崩溃.</p>
<blockquote>
<p><strong>思考 4: 表 6 理论成本分析的假设与现实差距</strong></p>
</blockquote>
<p>表 6 的理论成本分析假设了 100% MFU 和完美的通信隐藏,这在现实中很难达到.几个关键的现实差距:</p>
<table>
<thead>
<tr>
<th align="left">假设</th>
<th align="left">现实</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">100% MFU</td>
<td align="left">实际 MFU 通常 30-60%</td>
<td align="left">实际成本高于理论值</td>
</tr>
<tr>
<td align="left">完美通信隐藏</td>
<td align="left">DeepEP 实测 40GB/s vs 理论 50GB/s</td>
<td align="left">25% 效率损失</td>
</tr>
<tr>
<td align="left">理想批大小</td>
<td align="left">实际批大小受请求分布限制</td>
<td align="left">FFN MFU 可能低于预期</td>
</tr>
<tr>
<td align="left">FP8 无损量化</td>
<td align="left">某些层可能需要 BF16</td>
<td align="left">注意力成本增加 ~18%</td>
</tr>
</tbody></table>
<p>作者的回应是&quot;给对手优惠&quot;——在理论分析中故意忽略对竞争对手不利的因素(如 DSv3 的实际 EP 效率损失),即使如此 Step-3 仍然胜出.这种学术诚实增强了结论的可信度.但第三方独立验证仍然是必要的.</p>
<h3 id="7-3-jgxj">7.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: AFD 的「注意力实例独立扩展&quot;对长上下文的意义</strong></p>
</blockquote>
<p>AFD 解耦后,注意力实例可以独立于 FFN 实例扩展:</p>
<table>
<thead>
<tr>
<th align="center">平均上下文</th>
<th align="center">部署配置</th>
<th align="center">GPU 数</th>
<th align="center">峰值 TGS</th>
</tr>
</thead>
<tbody><tr>
<td align="center">4K</td>
<td align="center">2A2F</td>
<td align="center">32</td>
<td align="center">4039</td>
</tr>
<tr>
<td align="center">8K</td>
<td align="center">4A2F</td>
<td align="center">48</td>
<td align="center">2643</td>
</tr>
<tr>
<td align="center">16K</td>
<td align="center">8A2F</td>
<td align="center">64</td>
<td align="center">1794(估算)</td>
</tr>
<tr>
<td align="center">32K</td>
<td align="center">16A2F</td>
<td align="center">96</td>
<td align="center">898(估算)</td>
</tr>
</tbody></table>
<p>这种线性扩展能力在传统 EP 部署中很难实现,因为 EP 的固定专家-节点分配使得上下文扩展会不成比例地增加 FFN 的通信负担.AFD 的解耦使得「上下文长了就加注意力 GPU&quot;成为简单的容量规划问题.</p>
<blockquote>
<p><strong>思考 6: StepMesh 的「仅 PFC&quot;网络策略的风险与收益</strong></p>
</blockquote>
<p>StepMesh 选择完全依赖 PFC(Priority Flow Control)而禁用更高层的拥塞控制:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">收益</th>
<th align="left">风险</th>
</tr>
</thead>
<tbody><tr>
<td align="left">延迟</td>
<td align="left">消除拥塞控制的处理开销,最低延迟</td>
<td align="left">PFC 可能导致 head-of-line blocking</td>
</tr>
<tr>
<td align="left">可靠性</td>
<td align="left">无损网络,不丢包</td>
<td align="left">网络拥塞时可能引发级联暂停</td>
</tr>
<tr>
<td align="left">适用场景</td>
<td align="left">封闭、可控的数据中心 AFD 环境</td>
<td align="left">不适合共享网络或多租户环境</td>
</tr>
</tbody></table>
<p>这是一种为了极致性能而牺牲通用性的设计.在 StepFun 自有的推理集群中,网络是专用的、拓扑是可控的,PFC 的风险可以被管理.但对于第三方部署者,这需要仔细的网络配置和监控.</p>
<h3 id="7-4-jxyfx">7.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: Step-3 的 65536 最大上下文长度是否足够?</strong></p>
</blockquote>
<p>Step-3 的最大上下文长度为 65536 tokens,在当前开源模型中属于中等水平:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">最大上下文</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Kimi K2.6</td>
<td align="center">256K</td>
</tr>
<tr>
<td align="left">Qwen3</td>
<td align="center">128K</td>
</tr>
<tr>
<td align="left">Step-3</td>
<td align="center"><strong>64K</strong></td>
</tr>
<tr>
<td align="left">DSv3</td>
<td align="center">128K</td>
</tr>
</tbody></table>
<p>对于代码库理解(可能需要一次性处理数十万 token)和长文档分析,64K 可能不够用.AFD 的注意力实例独立扩展理论上可以支持更长的上下文,但 Moonshot 已经展示了 256K 上下文在 Zig 推理引擎案例中的价值.Step-3 的下一代可能需要扩展上下文长度以保持竞争力.</p>
<blockquote>
<p><strong>思考 8: 理论分析中的「自我优待&quot;与学术诚实</strong></p>
</blockquote>
<p>作者在多处承认&quot;给对手优惠&quot;:</p>
<ul>
<li>忽略 DSv3 的实际 EP 效率损失(40GB/s vs 50GB/s)</li>
<li>忽略过度稀疏模型在 H800 上的实际 FFN 成本翻倍</li>
<li>对混合模型采用官方保守量化方案</li>
</ul>
<p>这种自我约束增强了结论的说服力.但另一方面,分析仍然基于理想假设(100% MFU、完美流水线),实际差距可能缩小.Step-3 的真正优势需要在第三方独立部署中得到验证.</p>
<blockquote>
<p><strong>思考 9: AFD 对模型架构创新的限制</strong></p>
</blockquote>
<p>AFD 的解耦假设 Attention 和 FFN 可以清晰分离.但新兴的架构设计可能打破这一假设:</p>
<ul>
<li><strong>融合注意力-FFN</strong>: 某些新架构将注意力和 FFN 融合为单一模块</li>
<li><strong>循环连接</strong>: 层间循环连接使得解耦困难</li>
<li><strong>动态深度</strong>: 根据输入动态调整层数</li>
</ul>
<p>如果未来模型架构不再遵循清晰的 Attention+FFN 分层结构,AFD 的适用性将受到挑战.Step-3 的设计是在当前 Transformer 范式内的最优解,但可能不是未来架构的最优解.</p>
<h3 id="7-5-jspx">7.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: Step-3 在解码优化技术谱系中的位置</strong></p>
</blockquote>
<p>当前 LLM 解码优化形成了多层次的技术栈:</p>
<table>
<thead>
<tr>
<th align="left">层级</th>
<th align="left">技术</th>
<th align="left">代表</th>
</tr>
</thead>
<tbody><tr>
<td align="left">算法层</td>
<td align="left">投机解码、MTP</td>
<td align="left">Medusa, EAGLE</td>
</tr>
<tr>
<td align="left">架构层</td>
<td align="left">注意力变体</td>
<td align="left">MLA, GQA, MFA</td>
</tr>
<tr>
<td align="left">量化层</td>
<td align="left">KV/权重量化</td>
<td align="left">INT8, FP8, INT4</td>
</tr>
<tr>
<td align="left">系统层</td>
<td align="left">分布式部署</td>
<td align="left">EP, AFD, PD 解耦</td>
</tr>
<tr>
<td align="left">网络层</td>
<td align="left">通信优化</td>
<td align="left">NCCL, DeepEP, StepMesh</td>
</tr>
</tbody></table>
<p>Step-3 的贡献在于:<strong>它是第一个在所有层级上进行协同优化的系统</strong>.MFA 在架构层为量化层和系统层创造条件,AFD 在系统层释放架构层的潜力,StepMesh 在网络层支撑系统层的流水线.这种「全栈协同&quot;可能是未来解码优化的标准范式.</p>
<blockquote>
<p><strong>思考 11: 从「模型中心&quot;到「系统中心&quot;的范式转移对开源生态的影响</strong></p>
</blockquote>
<p>Step-3 代表了一种范式转移:AI 系统的竞争正在从「谁的模型更大&quot;转向「谁的系统更擅长利用模型&quot;.这对开源生态的影响深远:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">模型中心</th>
<th align="left">系统中心</th>
</tr>
</thead>
<tbody><tr>
<td align="left">开源重点</td>
<td align="left">模型权重</td>
<td align="left">模型权重 + 推理系统</td>
</tr>
<tr>
<td align="left">竞争壁垒</td>
<td align="left">预训练数据</td>
<td align="left">系统优化 + 部署经验</td>
</tr>
<tr>
<td align="left">用户价值</td>
<td align="left">能力上限</td>
<td align="left">能力/成本比</td>
</tr>
<tr>
<td align="left">社区贡献</td>
<td align="left">微调适配</td>
<td align="left">部署优化 + 硬件适配</td>
</tr>
</tbody></table>
<p>Step-3 开源了 StepMesh 通信库,这是「系统开源&quot;的重要一步.未来,开源社区可能不再满足于「给我权重&quot;,而是要求「给我完整的推理解决方案&quot;——包括优化的内核、高效的通信库和经过验证的部署配置.</p>
<hr>
<h2 id="8-bssj-cjspyyjxz">8. 部署视角:场景适配与硬件选择</h2>
<h3 id="8-1-cj-mxpp">8.1 场景-模型匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐配置</th>
<th align="left">关键优势</th>
<th align="left">注意事项</th>
</tr>
</thead>
<tbody><tr>
<td align="left">高吞吐在线服务</td>
<td align="left">AFD + H800/H20 混合</td>
<td align="left">4039 TGS,50ms TPOT</td>
<td align="left">需要 Rail-Optimized RoCE 网络</td>
</tr>
<tr>
<td align="left">成本敏感部署</td>
<td align="left">AFD + L20 替代 H800</td>
<td align="left">4×L20 替代 1×H800</td>
<td align="left">上下文不超过 328K</td>
</tr>
<tr>
<td align="left">长上下文任务</td>
<td align="left">扩展注意力实例(4A2F/8A2F)</td>
<td align="left">线性扩展,FFN 不受影响</td>
<td align="left">GPU 数随上下文增长</td>
</tr>
<tr>
<td align="left">推理模型服务</td>
<td align="left">支持 MTP 进一步提升</td>
<td align="left">预计 +50% 吞吐</td>
<td align="left">需要评估 FFN 额外成本</td>
</tr>
<tr>
<td align="left">端侧/边缘部署</td>
<td align="left">不适用</td>
<td align="left">321B 模型无法端侧</td>
<td align="left">考虑 Step-3.5-Flash 替代</td>
</tr>
</tbody></table>
<h3 id="8-2-yjxzzn">8.2 硬件选择指南</h3>
<table>
<thead>
<tr>
<th align="left">预算/场景</th>
<th align="left">注意力硬件</th>
<th align="left">FFN 硬件</th>
<th align="center">预估成本(\$/1M tokens,8K)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">性能优先</td>
<td align="left">H800</td>
<td align="left">H800</td>
<td align="center">~0.048</td>
</tr>
<tr>
<td align="left">成本优先</td>
<td align="left">H20</td>
<td align="left">H800</td>
<td align="center">~0.040</td>
</tr>
<tr>
<td align="left">极致成本</td>
<td align="left">H20</td>
<td align="left">H20</td>
<td align="center">~0.055</td>
</tr>
<tr>
<td align="left">国产替代</td>
<td align="left">910B</td>
<td align="left">910B</td>
<td align="center">~0.043</td>
</tr>
<tr>
<td align="left">非旗舰</td>
<td align="left">L20</td>
<td align="left">L20</td>
<td align="center">~0.060(估算)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>建议</strong>: 对于中小规模部署,H20+H800 异构配置提供了最佳性价比.对于大规模集群,全 H800 配置简化运维.910B 的国产替代路线在成本上具有竞争力,但需要验证实际 MFU 和通信效率.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding, arXiv:2507.19427v1</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.7-stepfun/02-step-3/01-step-3-jsbgjy">01-Step-3技术报告精译</a></li>
<li>开源组件: StepMesh (<a href="https://github.com/stepfun-ai/StepMesh">https://github.com/stepfun-ai/StepMesh</a>)</li>
<li>对比基准: DeepSeek-V3, Qwen3-235B-A22B, Kimi K2</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxdw-jmcbbscsdhs","text":"1. 核心定位:解码成本不是参数的函数"},{"level":2,"id":"2-mfa-kv-hcyjsldphys","text":"2. MFA:KV 缓存与计算量的平衡艺术"},{"level":3,"id":"2-1-szzylsjdqhkj","text":"2.1 三种注意力设计的权衡空间"},{"level":3,"id":"2-2-ssqd-ljmxsjyyjdql","text":"2.2 算术强度:连接模型设计与硬件的桥梁"},{"level":3,"id":"2-3-lhy-mtp-djrx","text":"2.3 量化与 MTP 的兼容性"},{"level":2,"id":"3-afd-zyly-ffn-djogm","text":"3. AFD:注意力与 FFN 的解耦革命"},{"level":3,"id":"3-1-wsmxyjo","text":"3.1 为什么需要解耦?"},{"level":3,"id":"3-2-afd-dsjmb","text":"3.2 AFD 的设计目标"},{"level":3,"id":"3-3-afd-vs-deep-seek-ep","text":"3.3 AFD vs DeepSeek EP"},{"level":2,"id":"4-moe-xsddyjys","text":"4. MoE 稀疏度的硬件约束"},{"level":3,"id":"4-1-zyxsddsxtd","text":"4.1 最优稀疏度的数学推导"},{"level":3,"id":"4-2-gdxsdbtfajqdj","text":"4.2 过度稀疏的变通方案及其代价"},{"level":2,"id":"5-step-mesh-afd-dtxyq","text":"5. StepMesh:AFD 的通信引擎"},{"level":3,"id":"5-1-sjtz","text":"5.1 设计挑战"},{"level":3,"id":"5-2-gjjsxz","text":"5.2 关键技术选择"},{"level":2,"id":"6-xnyz-llyscdsl","text":"6. 性能验证:理论与实测的收敛"},{"level":3,"id":"6-1-dddtt","text":"6.1 端到端吞吐"},{"level":3,"id":"6-2-mfa-vs-mla-vs-gqa-wgdb","text":"6.2 MFA vs MLA vs GQA 微观对比"},{"level":3,"id":"6-3-600b-sjxr","text":"6.3 600B 升级消融"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-sjdj","text":"7.1 设计动机"},{"level":3,"id":"7-2-sjsy","text":"7.2 数据实验"},{"level":3,"id":"7-3-jgxj","text":"7.3 架构细节"},{"level":3,"id":"7-4-jxyfx","text":"7.4 局限与风险"},{"level":3,"id":"7-5-jspx","text":"7.5 技术谱系"},{"level":2,"id":"8-bssj-cjspyyjxz","text":"8. 部署视角:场景适配与硬件选择"},{"level":3,"id":"8-1-cj-mxpp","text":"8.1 场景-模型匹配"},{"level":3,"id":"8-2-yjxzzn","text":"8.2 硬件选择指南"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/02-step-3/05-step-3-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/02-step-3/05-step-3-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-3 模型-系统协同设计与解码成本优化剖析</h1>
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
