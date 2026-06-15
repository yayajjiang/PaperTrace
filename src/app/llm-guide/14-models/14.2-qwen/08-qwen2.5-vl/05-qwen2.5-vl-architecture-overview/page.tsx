"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-VL 多模态架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: Qwen2.5-VL Technical Report (arXiv:2502.13923)
<strong>剖析角度</strong>: 架构演进、视觉Encoder 重设计、时空动态处理、文档解析创新、智能体能力
<strong>面向读者</strong>: 已阅读 Qwen2.5-VL 技术报告精译,希望深入理解多模态架构演进的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-jgyj-c-qwen2-vl-d-qwen2-5-vl-dsdsj">1. 架构演进:从 Qwen2-VL 到 Qwen2.5-VL 的四大升级</h2>
<p>Qwen2.5-VL 并非对前代的简单迭代,而是在视觉Encoder 、时间处理、数据规模和智能体能力四个维度上进行了系统性升级.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Qwen2-VL (2024)</th>
<th align="left">Qwen2.5-VL (2025)</th>
<th align="left">升级意义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">视觉Encoder</td>
<td align="left">675M ViT,全局注意力</td>
<td align="left">重新设计 ViT,Window Attention + 2D-RoPE</td>
<td align="left">支持原生分辨率,计算效率提升</td>
</tr>
<tr>
<td align="left">时间处理</td>
<td align="left">MRoPE 帧级时间 ID</td>
<td align="left">MRoPE 绝对时间编码 + 动态 FPS</td>
<td align="left">秒级事件定位,跨帧率泛化</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">1.2T token</td>
<td align="left">4.1T token (+242%)</td>
<td align="left">智能体数据、长视频、文档解析新增</td>
</tr>
<tr>
<td align="left">文档解析</td>
<td align="left">文本识别为主</td>
<td align="left">QwenVL HTML 统一格式,端到端结构化</td>
<td align="left">版面+文本+图表+公式一体化输出</td>
</tr>
<tr>
<td align="left">智能体能力</td>
<td align="left">基础 UI 操作</td>
<td align="left">ScreenSpot Pro 43.6%,Android Control 93.7%</td>
<td align="left">从「能操作&quot;到「可部署&quot;</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>核心设计哲学</strong>: Qwen2.5-VL 将当前 LVLM 的能力比喻为「三明治饼干的中间层&quot;——底层是细粒度视觉感知,顶层是多模态推理,中间层「表现尚可但远未卓越&quot;.其策略是从底层(精确感知)和顶层(推理+Agent)同时发力,而非仅仅增强中间层的通用能力.</p>
</blockquote>
<hr>
<h2 id="2-sj-encoder-dzxsj-xsyjddph">2. 视觉Encoder 的重新设计:效率与精度的平衡</h2>
<h3 id="2-1-jgdq-r-vit-gx-llm">2.1 架构对齐:让 ViT 更像 LLM</h3>
<p>Qwen2.5-VL 的 ViT 采用了与 LLM 更一致的设计原则:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">传统 ViT (如 CLIP)</th>
<th align="left">Qwen2.5-VL ViT</th>
<th align="left">效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left">归一化</td>
<td align="left">LayerNorm</td>
<td align="left"><strong>RMSNorm</strong></td>
<td align="left">与 LLM 一致,简化训练流程</td>
</tr>
<tr>
<td align="left">激活函数</td>
<td align="left">GELU</td>
<td align="left"><strong>SwiGLU</strong></td>
<td align="left">与 LLM 一致,提升表达能力</td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="left">绝对位置嵌入</td>
<td align="left"><strong>2D-RoPE</strong></td>
<td align="left">支持可变分辨率,无需插值</td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">全局自注意力</td>
<td align="left"><strong>Window Attention + 稀疏全局层</strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo><mo>→</mo><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2) \\to O(n \\cdot w)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td align="left">训练方式</td>
<td align="left">冻结或微调</td>
<td align="left"><strong>从头训练</strong></td>
<td align="left">完全适配动态分辨率需求</td>
</tr>
</tbody></table>
<h3 id="2-2-window-attention-d-qj-jb-quot-jtcl">2.2 Window Attention 的「全局-局部&quot;交替策略</h3>
<p>Qwen2.5-VL 的 ViT 共 32 层,其中仅 <strong>4 层使用全局注意力</strong>(第 7/15/23/31 层),其余 28 层使用窗口大小为 112×112(对应 8×8 个 patch)的 Window Attention.</p>
<table>
<thead>
<tr>
<th align="left">注意力类型</th>
<th align="center">层数</th>
<th align="left">计算复杂度</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Window Attention</td>
<td align="center">28 层</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mclose">)</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi><mo>=</mo><mn>64</mn></mrow><annotation encoding="application/x-tex">w=64</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span></span></span></span> patch</td>
<td align="left">局部特征提取,降低计算量</td>
</tr>
<tr>
<td align="left">全局注意力</td>
<td align="center">4 层</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td align="left">跨窗口信息聚合,全局上下文整合</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>工程洞察</strong>: 这种「每隔 8 层来一次全局聚合&quot;的策略类似于通信网络中的「分层汇聚&quot;.与 Swin Transformer 的 shifted window 相比,设计更简洁(无需复杂的窗口偏移和 mask),但可能损失一些跨窗口的细粒度交互.对于 4K 图像(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∼</mo><mn>276</mn><mo>×</mo><mn>154</mn></mrow><annotation encoding="application/x-tex">\\sim 276 \\times 154</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="mrel">∼</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">276</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">154</span></span></span></span> patch),全局注意力的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 计算量约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>276</mn><mo>×</mo><mn>154</mn><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>≈</mo><mn>1.8</mn><mo>×</mo><msup><mn>10</mn><mn>9</mn></msup></mrow><annotation encoding="application/x-tex">(276 \\times 154)^2 \\approx 1.8 \\times 10^9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">276</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">154</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">9</span></span></span></span></span></span></span></span></span></span></span>,而 Window Attention 仅需 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>276</mn><mo>×</mo><mn>154</mn><mo>×</mo><mn>64</mn><mo>≈</mo><mn>2.7</mn><mo>×</mo><msup><mn>10</mn><mn>6</mn></msup></mrow><annotation encoding="application/x-tex">276 \\times 154 \\times 64 \\approx 2.7 \\times 10^6</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">276</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">154</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2.7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span>——计算量减少约 <strong>670 倍</strong>.</p>
</blockquote>
<h3 id="2-3-scctysjbm">2.3 三尺寸统一视觉编码</h3>
<table>
<thead>
<tr>
<th align="left">配置项</th>
<th align="center">3B</th>
<th align="center">7B</th>
<th align="center">72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">ViT Hidden Size</td>
<td align="center">1280</td>
<td align="center">1280</td>
<td align="center">1280</td>
</tr>
<tr>
<td align="left">ViT 层数</td>
<td align="center">32</td>
<td align="center">32</td>
<td align="center">32</td>
</tr>
<tr>
<td align="left">ViT 注意力头数</td>
<td align="center">16</td>
<td align="center">16</td>
<td align="center">16</td>
</tr>
<tr>
<td align="left">Merger 输出维度</td>
<td align="center">2048</td>
<td align="center">3584</td>
<td align="center">8192</td>
</tr>
<tr>
<td align="left">LLM Hidden Size</td>
<td align="center">2048</td>
<td align="center">3584</td>
<td align="center">8192</td>
</tr>
<tr>
<td align="left">LLM 层数</td>
<td align="center">36</td>
<td align="center">28</td>
<td align="center">80</td>
</tr>
<tr>
<td align="left">训练 token 总量</td>
<td align="center">4.1T</td>
<td align="center">4.1T</td>
<td align="center">4.1T</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键观察</strong>: ViT 和 Merger 在所有三个尺寸中保持完全一致的配置,只有 LLM 部分随规模缩放.这意味着 3B 和 72B 模型看到的视觉特征表示是相同的,差异仅在于语言推理能力的深度.这种「视觉统一、语言分层&quot;的设计使小模型上验证的视觉预训练策略可以直接迁移到大模型,无需重新调优.</p>
</blockquote>
<hr>
<h2 id="3-skdtcl-czdmdky">3. 时空动态处理:从帧到秒的跨越</h2>
<h3 id="3-1-dt-fps-cy-rmxxxsjjz">3.1 动态 FPS 采样:让模型学习时间节奏</h3>
<p>传统视频模型采用固定帧采样(如 1fps 或 2fps),导致两个问题:</p>
<ul>
<li>慢动作视频被过度采样,产生冗余 token</li>
<li>快动作视频被欠采样,丢失关键信息</li>
</ul>
<p>Qwen2.5-VL 在训练期间动态采样 FPS,使模型接触不同帧率的视频样本,学会根据内容密度自适应处理时间信息.</p>
<h3 id="3-2-m-ro-pe-jdsjbmdsxjc">3.2 MRoPE 绝对时间编码的数学基础</h3>
<p>Qwen2-VL 的 MRoPE 时间维度与时间戳绑定:</p>
<table>
<thead>
<tr>
<th align="left">版本</th>
<th align="left">时间 ID 定义</th>
<th align="left">含义</th>
<th align="left">局限</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen2-VL</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>i</mi></mrow><annotation encoding="application/x-tex">t_i = i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span></td>
<td align="left">第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 帧</td>
<td align="left">无法区分不同帧率的相同帧序列</td>
</tr>
<tr>
<td align="left">Qwen2.5-VL</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>t</mi><mi>i</mi><mi>m</mi><mi>e</mi><mi>s</mi><mi>t</mi><mi>a</mi><mi>m</mi><msub><mi>p</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">t_i = timestamp_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">t</span><span class="mord mathnormal">im</span><span class="mord mathnormal">es</span><span class="mord mathnormal">t</span><span class="mord mathnormal">am</span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="left">第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 帧对应的秒数</td>
<td align="left">直接感知真实时间长度和事件节奏</td>
</tr>
</tbody></table>
<p>绝对时间编码使模型能够从时间 ID 间隔推断帧率:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><mn>0.5</mn></mrow><annotation encoding="application/x-tex">\\Delta t = 0.5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.5</span></span></span></span>: 2fps(每 0.5 秒一帧)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><mn>0.04</mn></mrow><annotation encoding="application/x-tex">\\Delta t = 0.04</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.04</span></span></span></span>: 25fps(每 0.04 秒一帧)</li>
</ul>
<p>这为秒级事件定位提供了直接的数学基础.例如,当用户询问「视频第 3 分 15 秒发生了什么&quot;,模型无需将秒数转换为帧数,因为时间 ID 直接与秒数对齐.</p>
<h3 id="3-3-kjydysdtfbs">3.3 空间域的原生动态分辨率</h3>
<p>Qwen2.5-VL 将 Qwen2-VL 的动态分辨率策略进一步升级:</p>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">Qwen2-VL</th>
<th align="left">Qwen2.5-VL</th>
</tr>
</thead>
<tbody><tr>
<td align="left">图像处理</td>
<td align="left">动态分辨率,MLP 4x 压缩</td>
<td align="left">同上 + Window Attention 加速</td>
</tr>
<tr>
<td align="left">坐标表示</td>
<td align="left">相对坐标(归一化到 [0, 1000))</td>
<td align="left"><strong>绝对坐标(像素级)</strong></td>
</tr>
<tr>
<td align="left">尺度感知</td>
<td align="left">间接(通过分辨率推断)</td>
<td align="left"><strong>直接(坐标值即像素位置)</strong></td>
</tr>
<tr>
<td align="left">视频处理</td>
<td align="left">固定 2fps,3D 卷积深度 2</td>
<td align="left"><strong>动态 FPS,两帧一组</strong></td>
</tr>
</tbody></table>
<p>绝对坐标的引入使模型能够固有地学习尺度信息——一个边界框的坐标值直接对应像素位置,模型知道 100×100 的框在小图像中占据很大比例,但在 4K 图像中可能只是角落的一小块.这对物体定位和文档解析等需要精确坐标的任务至关重要.</p>
<hr>
<h2 id="4-yxlsj-4-1t-token-dzb">4. 预训练数据:4.1T Token 的质变</h2>
<h3 id="4-1-sjdxlcl">4.1 三阶段训练策略</h3>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">数据类型</th>
<th align="center">Token 量</th>
<th align="center">序列长度</th>
<th align="center">训练对象</th>
<th align="left">目标</th>
</tr>
</thead>
<tbody><tr>
<td align="left">第一阶段</td>
<td align="left">图像描述、视觉知识、OCR</td>
<td align="center">1.5T</td>
<td align="center">8192</td>
<td align="center">仅 ViT</td>
<td align="left">视觉-语言对齐</td>
</tr>
<tr>
<td align="left">第二阶段</td>
<td align="left">+ 纯文本、交错数据、VQA、视频、定位、智能体</td>
<td align="center">2.0T</td>
<td align="center">8192</td>
<td align="center">ViT + LLM</td>
<td align="left">多模态深度融合</td>
</tr>
<tr>
<td align="left">第三阶段</td>
<td align="left">+ 长视频、长智能体、长文档</td>
<td align="center">0.6T</td>
<td align="center">32768</td>
<td align="center">ViT + LLM</td>
<td align="left">长序列推理能力</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>渐进式学习洞察</strong>: 先让模型学好「看&quot;(第一阶段,仅 ViT),再让它学会「看懂并推理&quot;(第二阶段,全参数),最后再训练「长时间看懂并推理&quot;(第三阶段,长序列).如果一开始就训练长序列,模型会在学习基础视觉表示的同时承担长距离注意力的负担,导致两方面都学不好.</p>
</blockquote>
<h3 id="4-2-sjgcdldwd">4.2 数据构成的六大维度</h3>
<table>
<thead>
<tr>
<th align="left">数据类型</th>
<th align="left">规模/特点</th>
<th align="left">关键作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left">交错图文</td>
<td align="left">四维度评分(相关性/互补性/密度平衡/文本质量)</td>
<td align="left">保持纯文本能力 + 上下文学习</td>
</tr>
<tr>
<td align="left">定位数据</td>
<td align="left">1 万+ 物体类别,绝对坐标,XML/JSON/自定义格式</td>
<td align="left">开放词汇检测 + 精细定位</td>
</tr>
<tr>
<td align="left">文档解析</td>
<td align="left">QwenVL HTML 统一格式,600 万表格 + 100 万图表</td>
<td align="left">端到端结构化输出</td>
</tr>
<tr>
<td align="left">OCR</td>
<td align="left">10+ 语言,合成 + 真实场景</td>
<td align="left">多语言文本识别</td>
</tr>
<tr>
<td align="left">视频</td>
<td align="left">动态 FPS,半小时+ 长视频描述合成</td>
<td align="left">时间动态理解</td>
</tr>
<tr>
<td align="left">智能体</td>
<td align="left">移动端/Web/桌面截图 + UI 定位 + 多步轨迹推理</td>
<td align="left">GUI 自动化能力</td>
</tr>
</tbody></table>
<h3 id="4-3-qwen-vl-html-gs-wdjxdtybs">4.3 QwenVL HTML 格式:文档解析的统一表示</h3>
<p>Qwen2.5-VL 将文档中的多种元素(段落、表格、图表、公式、图像、乐谱、化学式)统一以 HTML 格式表示:</p>
<pre><code class="language-html">&lt;html&gt;&lt;body&gt;
&lt;p data-bbox=&quot;x1 y1 x2 y2&quot;&gt;段落文本&lt;/p&gt;
&lt;table data-bbox=&quot;x1 y1 x2 y2&quot; class=&quot;table{id}&quot;&gt;表格内容&lt;/table&gt;
&lt;div class=&quot;chart&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;table&gt;图表数据&lt;/table&gt;
&lt;/div&gt;
&lt;div class=&quot;formula&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;div&gt;公式内容&lt;/div&gt;
&lt;/div&gt;
&lt;/html&gt;&lt;/body&gt;
</code></pre>
<blockquote>
<p><strong>设计洞察</strong>: 传统文档解析是 pipeline 式的——先 OCR 提取文字,再版面分析确定区域关系,再图表识别转换数据——每个环节独立,误差会累积.Qwen2.5-VL 的 HTML 格式将所有信息编码在一个结构化文档中,模型可以端到端地学习「从像素到结构化输出&quot;的映射.这类似于网页浏览器渲染 HTML 的方式——模型本质上被训练成了一个「视觉浏览器&quot;,能够「渲染&quot;图像内容为结构化标记.</p>
</blockquote>
<hr>
<h2 id="5-hxl-sft-dpo-dsjddq">5. 后训练:SFT + DPO 的双阶段对齐</h2>
<h3 id="5-1-sjgldbhsj">5.1 数据过滤的闭环设计</h3>
<p>Qwen2.5-VL 的 SFT 数据过滤采用两阶段 pipeline:</p>
<p><strong>第一阶段:领域特定分类</strong></p>
<ul>
<li>使用 Qwen2-VL-Instag 模型(从 Qwen2-VL-72B 派生)对 QA 对进行层次分类</li>
<li>8 个主要领域 → 30 个细分子类别</li>
<li>例如 Coding 领域细分为 Code_Debugging、Code_Generation、Code_Translation、Code_Understanding</li>
</ul>
<p><strong>第二阶段:领域定制过滤</strong></p>
<ul>
<li>基于规则的过滤:消除重复模式、不完整响应、不相关查询</li>
<li>基于模型的过滤:使用奖励模型评估 QA 对的复杂性、相关性、正确性、完整性</li>
</ul>
<blockquote>
<p><strong>闭环特性</strong>: Instag 分类 → 领域定制过滤 → 奖励模型评分 → SFT 训练 → 更好的模型 → 更好的过滤标准.这个闭环意味着随着模型能力提升,数据质量筛选标准也会自动提升.但风险在于,如果初始奖励模型有系统性偏差,这种偏差会在循环中被放大.</p>
</blockquote>
<h3 id="5-2-jjcyzqtl">5.2 拒绝采样增强推理</h3>
<p>对于数学解题、代码生成和领域特定 VQA 等需要复杂推理的任务,Qwen2.5-VL 采用拒绝采样精炼数据:</p>
<ol>
<li>使用中间版本模型为带标注答案的问题生成多条推理路径</li>
<li>仅保留最终答案与 ground truth 匹配的样本</li>
<li>排除代码切换、过长或重复模式的响应</li>
<li>验证中间推理步骤是否正确整合视觉和文本模态</li>
</ol>
<h3 id="5-3-hxldj-vit-dgckl">5.3 后训练冻结 ViT 的工程考量</h3>
<p>后训练阶段(SFT + DPO)冻结 ViT 参数,仅训练 LLM 部分.这一决策基于以下考量:</p>
<table>
<thead>
<tr>
<th align="left">考量</th>
<th align="left">解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">防止视觉过拟合</td>
<td align="left">避免 ViT 在 SFT 阶段过度适应指令数据的特定视觉模式</td>
</tr>
<tr>
<td align="left">保留通用视觉表示</td>
<td align="left">预训练阶段学到的通用视觉特征不应被指令数据「污染&quot;</td>
</tr>
<tr>
<td align="left">降低训练成本</td>
<td align="left">ViT 虽然参数量不大,但处理高分辨率图像时的激活内存开销显著</td>
</tr>
<tr>
<td align="left">DPO 数据限制</td>
<td align="left">偏好数据收集成本高,视频和智能体任务的偏好标注尤其困难</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-xnfx-wdnlwddqmpg">6. 性能分析:五大能力维度的全面评估</h2>
<h3 id="6-1-wdy-ocr-czlydjdys">6.1 文档与 OCR:垂直领域的绝对优势</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Gemini 1.5 Pro</th>
<th align="center">GPT-4o</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="left">优势来源</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CC-OCR</td>
<td align="center">73.0</td>
<td align="center">66.9</td>
<td align="center"><strong>79.8</strong></td>
<td align="left">多语言 OCR 数据集 + 合成数据</td>
</tr>
<tr>
<td align="left">DocVQA</td>
<td align="center">93.1</td>
<td align="center">91.1</td>
<td align="center"><strong>96.4</strong></td>
<td align="left">600 万真实表格 + HTML 统一格式</td>
</tr>
<tr>
<td align="left">InfoVQA</td>
<td align="center">81.0</td>
<td align="center">80.7</td>
<td align="center"><strong>87.3</strong></td>
<td align="left">100 万合成图表</td>
</tr>
<tr>
<td align="left">OCRBench</td>
<td align="center">754</td>
<td align="center">736</td>
<td align="center"><strong>885</strong></td>
<td align="left">端到端结构化训练</td>
</tr>
<tr>
<td align="left">OCRBench_v2 中文</td>
<td align="center">43.1</td>
<td align="center">32.2</td>
<td align="center"><strong>63.7</strong></td>
<td align="left">中文文档数据扩充</td>
</tr>
</tbody></table>
<p>Qwen2.5-VL 在 OCR 和文档理解上建立了显著优势.在 OCRBench_v2 中文赛道上,63.7 分比 Gemini 1.5 Pro 的 43.1 高出 <strong>20.6 分</strong>——这直接反映了专用文档解析数据的规模和质量差异.</p>
<h3 id="6-2-kjlj-ckdddjxdw">6.2 空间理解:从框到点的精细定位</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">专用模型最佳</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="left">特点</th>
</tr>
</thead>
<tbody><tr>
<td align="left">RefCOCOg_test</td>
<td align="center">92.7 (InternVL2.5)</td>
<td align="center">90.3</td>
<td align="left">略低于专用模型,但泛化性更强</td>
</tr>
<tr>
<td align="left">ODinW (开放词汇)</td>
<td align="center">55.0 (Grounding DINO)</td>
<td align="center"><strong>43.1</strong></td>
<td align="left">远超 InternVL2.5 (31.7)</td>
</tr>
<tr>
<td align="left">CountBench</td>
<td align="center">91.2 (Molmo-72B)</td>
<td align="center"><strong>93.6</strong></td>
<td align="left">「先检测再计数&quot;策略有效</td>
</tr>
<tr>
<td align="left">PointGrounding</td>
<td align="center">69.2 (Molmo-72B)</td>
<td align="center">67.5</td>
<td align="left">基于点的精细定位</td>
</tr>
</tbody></table>
<p>Qwen2.5-VL 的定位能力更注重「泛化性&quot;而非「特定基准的极致精度&quot;.超过 1 万个物体类别的训练数据使模型学会了更通用的物体-文本关联,而非过拟合到 RefCOCO 的特定语言模式.</p>
<h3 id="6-3-splj-cspq-dspz">6.3 视频理解:长视频强、短视频中</h3>
<table>
<thead>
<tr>
<th align="left">基准类型</th>
<th align="left">代表基准</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="left">对比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">标准长度视频</td>
<td align="left">Video-MME (w/ sub)</td>
<td align="center">79.1</td>
<td align="left">低于 Gemini 1.5 Pro (81.3)</td>
</tr>
<tr>
<td align="left">长视频理解</td>
<td align="left">LVBench</td>
<td align="center"><strong>47.3</strong></td>
<td align="left">大幅超越 GPT-4o (30.8)</td>
</tr>
<tr>
<td align="left">长视频理解</td>
<td align="left">MLVU</td>
<td align="center"><strong>74.6</strong></td>
<td align="left">超越 GPT-4o (64.6)</td>
</tr>
<tr>
<td align="left">视频定位</td>
<td align="left">Charades-STA</td>
<td align="center"><strong>50.9 mIoU</strong></td>
<td align="left">超越 GPT-4o (35.7)</td>
</tr>
</tbody></table>
<p>「长视频强、短视频中&quot;的格局反映了 MRoPE 绝对时间编码和动态 FPS 策略在长视频场景下的优势.Gemini 1.5 Pro 的 Native Multimodality 架构在常规视频理解上仍有深厚积累.</p>
<h3 id="6-4-znt-cjzdbsdfy">6.4 智能体:从基准到部署的飞跃</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen2-VL-72B</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">提升倍数</th>
</tr>
</thead>
<tbody><tr>
<td align="left">ScreenSpot Pro</td>
<td align="center">1.6%</td>
<td align="center"><strong>43.6%</strong></td>
<td align="center"><strong>27x</strong></td>
</tr>
<tr>
<td align="left">Android Control High_EM</td>
<td align="center">59.1%</td>
<td align="center"><strong>67.36%</strong></td>
<td align="center">1.14x</td>
</tr>
<tr>
<td align="left">Android Control Low_EM</td>
<td align="center">59.2%</td>
<td align="center"><strong>93.7%</strong></td>
<td align="center">1.58x</td>
</tr>
<tr>
<td align="left">AndroidWorld_SR</td>
<td align="center">6%</td>
<td align="center"><strong>35%</strong></td>
<td align="center">5.8x</td>
</tr>
</tbody></table>
<p>ScreenSpot Pro 从 1.6% 跃升到 43.6% 是一个惊人的进步,直接来源于专门的智能体数据策展:合成数据引擎生成截图描述和 UI 元素定位标注,以及多步操作轨迹的推理过程标注.</p>
<h3 id="6-5-cwbnlbl">6.5 纯文本能力保留</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Qwen2.5-72B</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">差异</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">71.1</td>
<td align="center">71.2</td>
<td align="center">+0.1</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">83.1</td>
<td align="center">83.0</td>
<td align="center">-0.1</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">86.6</td>
<td align="center">87.8</td>
<td align="center">+1.2</td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">84.1</td>
<td align="center"><strong>86.3</strong></td>
<td align="center">+2.2</td>
</tr>
</tbody></table>
<p>Qwen2.5-VL-72B 几乎完全保留了 Qwen2.5-72B 的纯文本能力,说明多模态训练并没有造成「灾难性遗忘&quot;.在 IFEval(指令遵循)上甚至以 86.3 超越了基座 84.1,可能是因为 SFT 阶段的指令数据(50% 纯文本)对指令遵循能力进行了额外强化.</p>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-sjdj">7.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 「三明治饼干&quot;比喻背后的产品哲学</strong></p>
</blockquote>
<p>报告将当前 LVLM 的能力比喻为「三明治饼干的中间层&quot;——底层是细粒度视觉感知,顶层是多模态推理,中间层「表现尚可但远未卓越&quot;.这个比喻揭示了一个关键洞察:视觉语言模型的瓶颈不在「语言&quot;也不在「简单视觉&quot;,而在「精细视觉感知与语言推理的桥接&quot;.Qwen2.5-VL 选择从底层(细粒度感知)和顶层(多模态推理)同时发力.这种策略的产品化体现就是:模型不仅能「看懂图&quot;,还能「指出图中哪个物体的哪个部分&quot;——这是从「被动回答&quot;到「主动交互&quot;的质变.</p>
<blockquote>
<p><strong>思考 2: 为什么坚持原生动态分辨率而非统一 resize?</strong></p>
</blockquote>
<p>传统视觉模型通常将所有图像 resize 到固定尺寸,导致两个问题:小物体在 resize 后可能只占据几个像素,细节完全丢失;不同长宽比的图像被强行拉伸变形.Qwen2.5-VL 的原生动态分辨率策略让模型学会了「尺度感知&quot;——边界框坐标直接对应像素位置,模型知道 100×100 的框在小图像中占据很大比例,但在 4K 图像中可能只是角落的一小块.代价是 batch 内的序列长度差异巨大,需要动态打包策略来平衡 GPU 负载.</p>
<h3 id="7-2-sjsy">7.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: 4.1T token 的数据构成质变分析</strong></p>
</blockquote>
<p>从 1.2T 到 4.1T 的增长不仅是量的扩展,更是质的重构.最值得注意的是「智能体数据&quot;的引入——这是前代 Qwen2-VL 所没有的全新数据维度.专门收集移动端/Web/桌面截图、合成 UI 元素定位标注、构建多步操作轨迹的推理过程,这些数据直接转化为了 ScreenSpot Pro 上 27 倍的性能提升.另一个关键增量是「长视频数据&quot;——超过半小时的视频通过定向合成流程构建多帧描述,为 LVBench 和 MLVU 上的领先表现奠定了基础.</p>
<blockquote>
<p><strong>思考 4: 数据过滤 pipeline 的闭环设计与潜在风险</strong></p>
</blockquote>
<p>Instag 分类模型(8 领域 30 子类) → 领域定制过滤(规则 + 模型) → 奖励模型评分 → SFT 训练 → 更好的模型 → 更好的过滤标准.这个闭环的自我增强特性意味着:随着模型能力提升,数据质量筛选标准也会自动提升.但风险在于,如果初始的奖励模型有系统性偏差(比如对某种语言或某种文档类型评分偏低),这种偏差会在循环中被放大.此外,闭环的「自我强化&quot;效应可能导致数据多样性逐渐收窄——模型越来越擅长生成「符合当前奖励模型偏好&quot;的数据,而探索性、创新性的内容可能被过滤掉.</p>
<h3 id="7-3-jgxj">7.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: Window Attention 层的「全局-局部&quot;交替设计</strong></p>
</blockquote>
<p>Qwen2.5-VL 的 ViT 在 32 层中仅使用 4 层全局注意力(第 7/15/23/31 层),其余 28 层均使用 Window Attention.这种「每隔 8 层来一次全局聚合&quot;的策略类似于通信网络中的「分层汇聚&quot;:局部窗口处理细节,全局层整合上下文.与 Swin Transformer 的 shifted window 相比,这种设计更简单(无需复杂的窗口偏移和 mask),但可能损失一些跨窗口的细粒度交互.在工程实现上,Window Attention 配合 2D-RoPE 可以在不增加额外参数的情况下实现局部感知,这是对计算资源的极致利用.</p>
<blockquote>
<p><strong>思考 6: MRoPE 从「帧 ID&quot;到「秒 ID&quot;的数学含义</strong></p>
</blockquote>
<p>Qwen2-VL 的 MRoPE 时间维度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>i</mi></mrow><annotation encoding="application/x-tex">t_i = i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> (第 i 帧).
Qwen2.5-VL 的 MRoPE 时间维度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>t</mi><mi>i</mi><mi>m</mi><mi>e</mi><mi>s</mi><mi>t</mi><mi>a</mi><mi>m</mi><msub><mi>p</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">t_i = timestamp_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">t</span><span class="mord mathnormal">im</span><span class="mord mathnormal">es</span><span class="mord mathnormal">t</span><span class="mord mathnormal">am</span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> (第 i 帧对应的秒数).</p>
<p>这个变化使模型学到的时间表示从「离散帧索引&quot;变为「连续时间轴&quot;.当两个视频的帧率不同时,相同帧数的片段对应的真实时间长度不同,但 Qwen2.5-VL 可以通过时间 ID 的间隔(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><msub><mi>t</mi><mrow><mi>i</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>−</mo><msub><mi>t</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\Delta t = t_{i+1} - t_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8234em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)直接感知节奏差异.这种绝对时间对齐为秒级事件定位提供了直接的数学基础,无需额外的「帧→秒&quot;转换头.但一个隐含假设是:视频的时间戳信息在训练和推理时都可用——对于某些来源的视频(如用户上传的无元数据文件),可能需要预处理来推断或标注时间戳.</p>
<h3 id="7-4-jxyfx">7.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 长视频理解的「帧数天花板&quot;</strong></p>
</blockquote>
<p>报告明确限制每视频最大 768 帧、总视频 token 不超过 24576.以 14×14 的 patch size 计算,一帧 448×448 的图像产生 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>448</mn><mi mathvariant="normal">/</mi><mn>14</mn><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>=</mo><mn>1024</mn></mrow><annotation encoding="application/x-tex">(448/14)^2 = 1024</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">448/14</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1024</span></span></span></span> 个 patch,经 Merger 压缩 4× 后变为 256 个 token.768 帧即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>768</mn><mo>×</mo><mn>256</mn><mo>=</mo><mn>196608</mn></mrow><annotation encoding="application/x-tex">768 \\times 256 = 196608</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">768</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">256</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">196608</span></span></span></span> 个 token——远超 24576 的限制.这意味着实际处理时,视频帧会被进一步降采样或 resize 到更低分辨率.对于一小时的视频(3600 秒),即使以 1fps 采样也需要 3600 帧,远超 768 帧的上限.因此,当前模型对「数小时视频&quot;的理解实际上依赖于关键帧的选择,而非真正处理全部内容.如何实现真正的「全帧长视频理解&quot;仍是开放问题.</p>
<blockquote>
<p><strong>思考 8: Agent 能力的「真实世界鸿沟&quot;</strong></p>
</blockquote>
<p>虽然 Qwen2.5-VL 在 ScreenSpot 和 Android Control 等基准上表现出色,但这些基准是高度结构化的测试环境.真实的 GUI 自动化面临更多挑战:动态加载的网页元素、需要登录态的账户操作、跨应用的复杂工作流、以及操作失败后的恢复策略.OSWorld 上 8.83 的分数(远低于 Claude 的 14.90)恰恰暴露了模型在开放式桌面环境中的局限.ScreenSpot Pro 的 43.6% 虽然相比前代有 27 倍提升,但仍意味着超过一半的复杂 UI 元素定位失败——在真实部署中,单次定位失败可能导致整个任务链中断.</p>
<blockquote>
<p><strong>思考 9: 纯文本能力的「隐性代价&quot;</strong></p>
</blockquote>
<p>表 4 显示 Qwen2.5-VL-72B 在纯文本任务上几乎完全保留了 Qwen2.5-72B 的能力,但这是否意味着没有代价? 实际上,多模态预训练占用了 4.1T token 的计算预算,如果这些资源全部用于纯文本训练,语言基座可能会更强.此外,视觉 token 的引入增加了推理时的序列长度——对于纯文本任务,模型仍需加载 ViT 和 Merger 的权重,增加了部署时的内存开销.对于纯文本为主的应用场景,Qwen2.5-VL 相比同尺寸 LLM 并无优势,这是架构通用性带来的必然权衡.</p>
<h3 id="7-5-jspx">7.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: Qwen2.5-VL 在多模态架构家族中的位置与影响</strong></p>
</blockquote>
<p>Qwen2.5-VL 的架构继承关系:</p>
<pre><code>Flamingo(2022) 交错图文 → BLIP-2(2023) Q-Former 桥接 → LLaVA(2023) 线性投影
                                                                ↓
Qwen-VL(2023) 统一训练 → Qwen2-VL(2024) MRoPE + 动态分辨率 → Qwen2.5-VL(2025) 绝对时间 + Window Attention
</code></pre>
<p>与同期竞争架构相比:</p>
<ul>
<li><strong>vs Gemini 1.5 Pro</strong>: Gemini 采用 Native Multimodality(从预训练即融合),Qwen2.5-VL 采用「ViT + LLM&quot;的分体式架构.Gemini 在长视频理解(Video-MME)上仍有优势,但 Qwen2.5-VL 在文档解析和定位精度上反超.</li>
<li><strong>vs InternVL2.5</strong>: InternVL2.5 采用更大规模的 ViT(InternViT-6B),Qwen2.5-VL 则通过更高效的 ViT 设计和更优质的数据策展实现了同等甚至更优的性能.</li>
<li><strong>vs GPT-4o</strong>: GPT-4o 的架构细节未公开,但从 OCR 和文档理解的表现看,Qwen2.5-VL 已经在这两个垂直领域建立了明显优势.</li>
</ul>
<p>对后续工作的影响:Qwen2-VL 率先引入的动态分辨率策略已被多家后续工作采纳;Qwen2.5-VL 进一步将其扩展到时间维度(动态 FPS),这可能会成为未来视频理解模型的标准做法.「不 resize、不 normalize、用原始像素坐标&quot;的理念正在改变视觉模型设计的基本假设.</p>
<hr>
<h2 id="8-bssj-cjspycbgs">8. 部署视角:场景适配与成本估算</h2>
<h3 id="8-1-cj-mxppzn">8.1 场景-模型匹配指南</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐模型</th>
<th align="left">关键能力</th>
</tr>
</thead>
<tbody><tr>
<td align="left">移动端 OCR/文档扫描</td>
<td align="left">3B</td>
<td align="left">端侧可运行,CC-OCR 74.5 已具备实用价值</td>
</tr>
<tr>
<td align="left">网页内容理解/VQA</td>
<td align="left">7B</td>
<td align="left">MMBench-EN 83.5,性价比最优</td>
</tr>
<tr>
<td align="left">复杂文档解析/表格提取</td>
<td align="left">72B</td>
<td align="left">DocVQA 96.4,InfoVQA 87.3,HTML 结构化输出</td>
</tr>
<tr>
<td align="left">视频内容分析(&lt;10分钟)</td>
<td align="left">7B/72B</td>
<td align="left">动态 FPS 自适应,Charades-STA 50.9 mIoU</td>
</tr>
<tr>
<td align="left">长视频理解(&gt;30分钟)</td>
<td align="left">72B</td>
<td align="left">LVBench 47.3,MLVU 74.6,但受 768 帧限制</td>
</tr>
<tr>
<td align="left">GUI 自动化/UI 测试</td>
<td align="left">72B</td>
<td align="left">ScreenSpot Pro 43.6%,Android Control 93.7%</td>
</tr>
<tr>
<td align="left">多语言内容审核</td>
<td align="left">72B</td>
<td align="left">OCRBench_v2 中文 63.7,MTVQA 31.7</td>
</tr>
<tr>
<td align="left">纯文本任务(通用对话)</td>
<td align="left">不推荐</td>
<td align="left">同尺寸 LLM 更优,Qwen2.5-72B 即可</td>
</tr>
</tbody></table>
<h3 id="8-2-tlxcyttlgs">8.2 推理显存与吞吐量估算</h3>
<p>以 FP16 推理、batch_size=1 为例:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">权重显存</th>
<th align="center">单图(448x448)</th>
<th align="center">视频(64帧,448x448)</th>
<th align="center">上下文 32K</th>
</tr>
</thead>
<tbody><tr>
<td align="left">3B</td>
<td align="center">~6GB</td>
<td align="center">+0.25GB</td>
<td align="center">+16GB</td>
<td align="center">+2.0GB</td>
</tr>
<tr>
<td align="left">7B</td>
<td align="center">~14GB</td>
<td align="center">+0.25GB</td>
<td align="center">+16GB</td>
<td align="center">+2.0GB</td>
</tr>
<tr>
<td align="left">72B</td>
<td align="center">~144GB</td>
<td align="center">+0.25GB</td>
<td align="center">+16GB</td>
<td align="center">+2.0GB</td>
</tr>
</tbody></table>
<blockquote>
<p>注:ViT 和 Merger 的计算开销与 LLM 规模无关.一帧 448×448 图像经 Window Attention ViT 编码后产生约 256 个视觉 token,在 72B 模型的注意力计算中占比很小.视频推理的显存瓶颈主要来自序列长度:64 帧 × 256 token = 16384 视觉 token,加上文本 token 后总序列长度可能接近 32K 上限.对于长视频任务,建议使用帧采样(而非逐帧处理)以降低序列长度.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Qwen2.5-VL Technical Report, arXiv:2502.13923</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.2-qwen/08-qwen2.5-vl/01-qwen2.5-vl-jsbgjy">01-Qwen2.5-VL技术报告精译</a></li>
<li>前代模型: Qwen2-VL 技术报告精译(见 03-Qwen2-VL 目录)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jgyj-c-qwen2-vl-d-qwen2-5-vl-dsdsj","text":"1. 架构演进:从 Qwen2-VL 到 Qwen2.5-VL 的四大升级"},{"level":2,"id":"2-sj-encoder-dzxsj-xsyjddph","text":"2. 视觉Encoder 的重新设计:效率与精度的平衡"},{"level":3,"id":"2-1-jgdq-r-vit-gx-llm","text":"2.1 架构对齐:让 ViT 更像 LLM"},{"level":3,"id":"2-2-window-attention-d-qj-jb-quot-jtcl","text":"2.2 Window Attention 的「全局-局部&quot;交替策略"},{"level":3,"id":"2-3-scctysjbm","text":"2.3 三尺寸统一视觉编码"},{"level":2,"id":"3-skdtcl-czdmdky","text":"3. 时空动态处理:从帧到秒的跨越"},{"level":3,"id":"3-1-dt-fps-cy-rmxxxsjjz","text":"3.1 动态 FPS 采样:让模型学习时间节奏"},{"level":3,"id":"3-2-m-ro-pe-jdsjbmdsxjc","text":"3.2 MRoPE 绝对时间编码的数学基础"},{"level":3,"id":"3-3-kjydysdtfbs","text":"3.3 空间域的原生动态分辨率"},{"level":2,"id":"4-yxlsj-4-1t-token-dzb","text":"4. 预训练数据:4.1T Token 的质变"},{"level":3,"id":"4-1-sjdxlcl","text":"4.1 三阶段训练策略"},{"level":3,"id":"4-2-sjgcdldwd","text":"4.2 数据构成的六大维度"},{"level":3,"id":"4-3-qwen-vl-html-gs-wdjxdtybs","text":"4.3 QwenVL HTML 格式:文档解析的统一表示"},{"level":2,"id":"5-hxl-sft-dpo-dsjddq","text":"5. 后训练:SFT + DPO 的双阶段对齐"},{"level":3,"id":"5-1-sjgldbhsj","text":"5.1 数据过滤的闭环设计"},{"level":3,"id":"5-2-jjcyzqtl","text":"5.2 拒绝采样增强推理"},{"level":3,"id":"5-3-hxldj-vit-dgckl","text":"5.3 后训练冻结 ViT 的工程考量"},{"level":2,"id":"6-xnfx-wdnlwddqmpg","text":"6. 性能分析:五大能力维度的全面评估"},{"level":3,"id":"6-1-wdy-ocr-czlydjdys","text":"6.1 文档与 OCR:垂直领域的绝对优势"},{"level":3,"id":"6-2-kjlj-ckdddjxdw","text":"6.2 空间理解:从框到点的精细定位"},{"level":3,"id":"6-3-splj-cspq-dspz","text":"6.3 视频理解:长视频强、短视频中"},{"level":3,"id":"6-4-znt-cjzdbsdfy","text":"6.4 智能体:从基准到部署的飞跃"},{"level":3,"id":"6-5-cwbnlbl","text":"6.5 纯文本能力保留"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-sjdj","text":"7.1 设计动机"},{"level":3,"id":"7-2-sjsy","text":"7.2 数据实验"},{"level":3,"id":"7-3-jgxj","text":"7.3 架构细节"},{"level":3,"id":"7-4-jxyfx","text":"7.4 局限与风险"},{"level":3,"id":"7-5-jspx","text":"7.5 技术谱系"},{"level":2,"id":"8-bssj-cjspycbgs","text":"8. 部署视角:场景适配与成本估算"},{"level":3,"id":"8-1-cj-mxppzn","text":"8.1 场景-模型匹配指南"},{"level":3,"id":"8-2-tlxcyttlgs","text":"8.2 推理显存与吞吐量估算"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-VL 多模态架构剖析</h1>
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
