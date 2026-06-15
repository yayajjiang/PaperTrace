"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-o 4.5 深度解析：Omni-Flow 全双工流式交互框架</h1>
<blockquote>
<p><strong>论文</strong>: MiniCPM-o 4.5: Towards Real-Time Full-Duplex Omni-Modal Interaction<br><strong>arXiv</strong>: 2604.27393<br><strong>模型规模</strong>: 9B 参数<br><strong>核心创新</strong>: Omni-Flow 统一流式框架 + TAIL 时间对齐交错语音生成</p>
</blockquote>
<hr>
<h2 id="1-wtdy-wsmlxsjhbgl">1. 问题定义：为什么轮询式交互不够了</h2>
<h3 id="1-1-llgbqx">1.1 两类根本缺陷</h3>
<p>当前 MLLM 的交互范式——无论是否支持语音/视频——本质上都属于<strong>轮询式(turn-based)</strong>：</p>
<pre><code>用户: [说话/发图/发视频]
模型: [处理输入 → 生成完整响应]
用户: [下一句话]
模型: [处理输入 → 生成完整响应]
</code></pre>
<p>这种范式存在两个根本性限制：</p>
<p><strong>Blocked-I/O(阻塞 I/O)</strong>：模型生成响应时无法接受新的输入。在实时场景中, 这意味着：</p>
<ul>
<li>模型正在描述一个场景时, 环境中发生了新变化 → 无法即时调整</li>
<li>模型正在回答一个问题时, 用户补充了关键信息 → 无法中途纳入</li>
<li>语音合成已经开始, 但上下文已改变 → 说出的是&quot;过时&quot;的内容</li>
</ul>
<p><strong>被动响应</strong>：模型行为严格由用户请求触发。无法做到：</p>
<ul>
<li>主动提醒：&quot;注意, 红灯亮了&quot;</li>
<li>主动评论：&quot;刚才那个动作很危险&quot;</li>
<li>持续场景描述：像体育解说员一样持续 narrate</li>
</ul>
<h3 id="1-2-qsgjhdtxxbz">1.2 全双工交互的通信学本质</h3>
<p>从通信工程视角看, 轮询式交互是<strong>半双工(half-duplex)</strong>：同一时刻只有一个方向的数据流。而人类对话是<strong>全双工(full-duplex)</strong>：双方同时说、同时听、随时打断。</p>
<p>Omni-Flow 的核心洞察是：<strong>将通信领域的时分复用(TDM)概念迁移到 AI 交互建模中</strong>, 把连续交互切分为时间窗口, 每个窗口内同时进行感知和生成。</p>
<hr>
<h2 id="2-omni-flow-dxshkj">2. Omni-Flow 的形式化框架</h2>
<h3 id="2-1-stsjdql">2.1 三条时间对齐流</h3>
<p>Omni-Flow 将交互抽象为三条沿共享时间轴演化的流：</p>
<table>
<thead>
<tr>
<th>流名称</th>
<th>符号</th>
<th>内容</th>
<th>方向</th>
</tr>
</thead>
<tbody><tr>
<td>环境视觉流</td>
<td>env-visual</td>
<td>实时视频帧、图像</td>
<td>输入</td>
</tr>
<tr>
<td>环境音频流</td>
<td>env-audio</td>
<td>环境声、用户语音</td>
<td>输入</td>
</tr>
<tr>
<td>输出流</td>
<td>out-stream</td>
<td>助手文本 + 语音</td>
<td>输出</td>
</tr>
</tbody></table>
<p>关键设计：<strong>用户请求不再是特权角色</strong>, 而是 env-audio 流的一部分。模型无需区分&quot;用户说话&quot;与&quot;环境声音&quot;, 只需将一切视为沿时间轴到达的信号。</p>
<h3 id="2-2-sjckyztgx">2.2 时间窗口与状态更新</h3>
<p>设时间窗口大小为 t(论文取 1.0s), 第 k 个窗口覆盖时间区间 [(k-1)t, kt)。</p>
<p>在每个窗口内：</p>
<pre><code>State_k = f(State_{k-1}, env-visual[(k-1)t:kt], env-audio[(k-1)t:kt])
out-stream[(k-1)t:kt] = g(State_k)
</code></pre>
<p>其中：</p>
<ul>
<li><code>f</code> 是状态更新函数(感知新输入)</li>
<li><code>g</code> 是输出生成函数(基于最新状态生成响应片段)</li>
</ul>
<p>当 t → 0 时, 感知与响应在时间上无限紧密耦合, 逼近理想全双工。</p>
<h3 id="2-3-ybz-transformer-dqb">2.3 与标准 Transformer 的区别</h3>
<p>标准 Transformer 处理的是<strong>序列</strong>：</p>
<pre><code>[x_1, x_2, x_3, ..., x_n] → [y_1, y_2, y_3, ..., y_m]
</code></pre>
<p>Omni-Flow 处理的是<strong>时间索引的多模态张量</strong>：</p>
<pre><code>{visual_t, audio_t, text_t, speech_t | t ∈ [0, T]}
</code></pre>
<p>每个时间窗口内, 所有模态的 token 共享同一时间戳, 模型通过 attention 机制学习跨模态、跨时间的关联。</p>
<hr>
<h2 id="3-sffy-chunk-sjdgcqh">3. 时分复用：Chunk 设计的工程权衡</h2>
<h3 id="3-1-sggjsjjc">3.1 三个关键设计决策</h3>
<p>论文通过系统性消融实验验证了三个维度的设计选择：</p>
<h4 id="1-sjld-t">(1) 时间粒度 t</h4>
<table>
<thead>
<tr>
<th>Chunk 大小</th>
<th>延迟</th>
<th>每块建模预算</th>
<th>决策稳定性</th>
<th>综合效果</th>
</tr>
</thead>
<tbody><tr>
<td>0.35s</td>
<td>低</td>
<td>极低</td>
<td>差</td>
<td>退化明显</td>
</tr>
<tr>
<td>0.56s</td>
<td>中</td>
<td>低</td>
<td>较差</td>
<td>略有退化</td>
</tr>
<tr>
<td><strong>1.0s</strong></td>
<td><strong>适中</strong></td>
<td><strong>充足</strong></td>
<td><strong>稳定</strong></td>
<td><strong>最优</strong></td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：chunk 不是越小越好。过小的 chunk 导致每块内 token 数不足, 模型无法在一个时间窗口内获得充分信息做出稳定决策, 生成内容变得支离破碎。1.0s 是响应性与稳定性之间的&quot;甜点&quot;。</p>
<h4 id="2-bjxsbj">(2) 边界显式标记</h4>
<table>
<thead>
<tr>
<th>策略</th>
<th>效果</th>
</tr>
</thead>
<tbody><tr>
<td>隐式边界</td>
<td>较差</td>
</tr>
<tr>
<td><strong>显式标记</strong></td>
<td><strong>更好</strong></td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：区分&quot;新观察到的输入&quot;与&quot;新生成的输出&quot;对模型来说是非平凡问题。显式插入边界 token(如 <code>&lt;|new_input|&gt;</code>、<code>&lt;|new_output|&gt;</code>)降低了模型的认知负担, 让它无需从上下文推断边界位置。</p>
<h4 id="3-jhkzynrscdohfs">(3) 交互控制与内容生成的耦合方式</h4>
<table>
<thead>
<tr>
<th>策略</th>
<th>全称</th>
<th>机制</th>
<th>效果</th>
</tr>
</thead>
<tbody><tr>
<td>LT</td>
<td>Listen-Talk Joint</td>
<td>单步联合预测&quot;是否说话&quot;和&quot;说什么&quot;</td>
<td>较差</td>
</tr>
<tr>
<td><strong>LS</strong></td>
<td><strong>Listen-Speak Separate</strong></td>
<td><strong>先预测&quot;是否说话&quot;, 再预测&quot;说什么&quot;</strong></td>
<td><strong>更好</strong></td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：&quot;是否说话&quot;(交互控制)和&quot;说什么&quot;(内容生成)是两个不同层面的决策。将它们解耦：</p>
<ul>
<li>第一步：二元决策(沉默 token vs 说话 token)</li>
<li>第二步：仅在决定说话时生成内容</li>
</ul>
<p>这种分离避免了&quot;内容压力&quot;干扰&quot;时机判断&quot;, 类比于操作系统的 I/O 调度分离于计算逻辑。</p>
<h3 id="3-2-zdhwdzryx">3.2 主动行为的自然涌现</h3>
<p>在上述框架下, 主动行为不需要单独的模块或损失函数。当模型在 env-visual 流中检测到需要关注的事件(如红灯、危险动作), 它可以在该时间窗口内将 &quot;Speak Token&quot; 设为激活状态, 并生成相应提醒。主动行为是<strong>框架的涌现属性(emergent property)</strong>, 而非硬编码规则。</p>
<hr>
<h2 id="4-tail-sjdqjcyysc">4. TAIL：时间对齐交错语音生成</h2>
<p>TAIL(Time-Aligned Interleaving)是 Omni-Flow 中最精妙的设计, 专门解决<strong>语音输出与并发环境的时间对齐</strong>问题。</p>
<h3 id="4-1-wtdsxbs">4.1 问题的数学表述</h3>
<p>设：</p>
<ul>
<li>T_text(k) = 第 k 个 chunk 生成的文本 token 集合</li>
<li>D_speech(t) = 文本 token t 的语音播放时长</li>
<li>L(k) = 到第 k 个 chunk 结束时的累积播放延迟</li>
</ul>
<p>理想情况：</p>
<pre><code>Σ_{t∈T_text(k)} D_speech(t) ≈ t  (每个 chunk 的语音播放时长 ≈ chunk 时长)
L(k) ≈ 0  (零累积延迟)
</code></pre>
<p>实际情况：</p>
<ul>
<li>不同 token 的语音时长差异很大(&quot;the&quot; 短, &quot;uncharacteristically&quot; 长)</li>
<li>模型生成文本的速度 ≠ 语音播放速度</li>
<li>累积延迟 L(k) 会持续增长</li>
</ul>
<h3 id="4-2-xycldqx">4.2 现有策略的缺陷</h3>
<p><strong>策略 A：非交错生成</strong></p>
<pre><code>[生成完整文本] → [合成完整语音]
</code></pre>
<p>文本流大幅超前播放流。当语音读到第 3 秒的内容时, 模型可能已经在基于第 10 秒的状态生成第 15 秒的文本。</p>
<p><strong>策略 B：固定比例交错</strong></p>
<pre><code>[文本:语音 = 1:3] → [文本:语音 = 1:3] → ...
</code></pre>
<p>假设文本 token 与语音时长呈固定比例。但 &quot;the apple&quot; 和 &quot;the car&quot; 中 &quot;the&quot; 的时长不同, 固定比例会导致系统性偏差。</p>
<h3 id="4-3-tail-dzsyjz">4.3 TAIL 的自适应机制</h3>
<p>TAIL 的核心公式(简化理解)：</p>
<p>在第 k 个 chunk：</p>
<pre><code>目标: Σ D_speech(t) ≈ kt - 已播放时长
调整: 如果 L(k-1) &gt; 0 → 减少 T_text(k) 的 token 数
      如果 L(k-1) &lt; 0 → 增加 T_text(k) 的 token 数
</code></pre>
<p><strong>监督信号构造</strong>：</p>
<ol>
<li>从全双工训练数据中收集每个文本 token 的真实起止时间</li>
<li>将起止时间落入 [(k-1)t, kt) 的 token 分配给 chunk k</li>
<li>这教导模型学习&quot;历史依赖的交错模式&quot;</li>
</ol>
<h3 id="4-4-yjqz">4.4 有界前瞻</h3>
<p>语音合成需要有限的未来文本上下文来确定发音和韵律。例如：</p>
<ul>
<li>&quot;the apple&quot; → /ði/(元音前)</li>
<li>&quot;the car&quot; → /ðə/(辅音前)</li>
</ul>
<p>TAIL 的解决方案：</p>
<ul>
<li>chunk k 中最后 N 个文本 token 的语音 token 推迟到 chunk k+1</li>
<li>其余 token 的语音在 chunk k 中生成</li>
<li>N 是 small bounded constant(有界常数)</li>
</ul>
<p>这样：</p>
<ul>
<li>提供了局部上下文用于韵律决策</li>
<li>不让文本流大幅超前于播放</li>
<li>保持了 Omni-Flow 的时间对齐结构</li>
</ul>
<h3 id="4-5-syyz">4.5 实验验证</h3>
<table>
<thead>
<tr>
<th>模式</th>
<th>ZH CER↓</th>
<th>ZH SIM-o↑</th>
<th>EN WER↓</th>
<th>EN SIM-o↑</th>
</tr>
</thead>
<tbody><tr>
<td>非交错</td>
<td>1.44</td>
<td>74.1</td>
<td>2.70</td>
<td>64.9</td>
</tr>
<tr>
<td>固定交错</td>
<td><strong>0.86</strong></td>
<td><strong>74.5</strong></td>
<td><strong>2.38</strong></td>
<td>64.9</td>
</tr>
<tr>
<td>TAIL 动态</td>
<td>1.04</td>
<td>74.1</td>
<td>3.93</td>
<td><strong>65.1</strong></td>
</tr>
</tbody></table>
<p><strong>解读</strong>：</p>
<ul>
<li>固定交错在识别精度上最优(因为允许文本适度超前)</li>
<li>TAIL 牺牲了少许识别精度(尤其英文 WER 从 2.38 升至 3.93), 但维持了时间对齐</li>
<li>这是全双工场景下&quot;说得好&quot;与&quot;说得及时&quot;之间的固有 tension</li>
</ul>
<hr>
<h2 id="5-yxyffddbfx">5. 与现有方法的对比分析</h2>
<h3 id="5-1-jhfsdb">5.1 交互范式对比</h3>
<table>
<thead>
<tr>
<th>模型/框架</th>
<th>交互模式</th>
<th>是否全双工</th>
<th>是否主动</th>
<th>关键技术</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4o</td>
<td>轮询 + 语音</td>
<td>❌</td>
<td>❌</td>
<td>独立语音 pipeline</td>
</tr>
<tr>
<td>Gemini Live</td>
<td>流式输入 + 轮询输出</td>
<td>❌</td>
<td>❌</td>
<td>流式视觉输入</td>
</tr>
<tr>
<td>Qwen3-Omni</td>
<td>轮询 + 全模态</td>
<td>❌</td>
<td>❌</td>
<td>端到端语音</td>
</tr>
<tr>
<td>MiniCPM-o 2.6</td>
<td>轮询 + 全模态</td>
<td>❌</td>
<td>❌</td>
<td>流式架构</td>
</tr>
<tr>
<td><strong>MiniCPM-o 4.5</strong></td>
<td><strong>全双工流式</strong></td>
<td><strong>✅</strong></td>
<td><strong>✅</strong></td>
<td><strong>Omni-Flow + TAIL</strong></td>
</tr>
</tbody></table>
<h3 id="5-2-jgxsdb">5.2 架构效率对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数</th>
<th>视觉压缩</th>
<th>LLM 语音生成</th>
<th>RTX 4090 BF16</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen3-Omni-30B</td>
<td>30B-A3B</td>
<td>4×</td>
<td>直接生成</td>
<td>OOM</td>
</tr>
<tr>
<td>MiniCPM-o 4.5</td>
<td><strong>9B</strong></td>
<td><strong>16×</strong></td>
<td><strong>专用解码器</strong></td>
<td><strong>154 tok/s</strong></td>
</tr>
</tbody></table>
<p>关键架构差异：</p>
<ul>
<li><strong>视觉压缩</strong>：16× vs 4×, 意味着同等分辨率下视觉 token 数仅为 1/4</li>
<li><strong>语音生成分离</strong>：LLM 只生成文本(3-4 tok/s), 轻量解码器生成语音 token(25 tok/s), 避免了 LLM 被高频语音生成拖累</li>
</ul>
<hr>
<h2 id="6-gcsxyd">6. 工程实现要点</h2>
<h3 id="6-1-xlcmdtz">6.1 训练层面的挑战</h3>
<p><strong>数据并行中的模态平衡</strong>：</p>
<ul>
<li>不同模态组合分配给不同数据并行 rank</li>
<li>确保每步固定数据比例, 防止某一模态主导梯度</li>
</ul>
<p><strong>时间对齐标签构造</strong>：</p>
<ul>
<li>每个训练样本的所有模态 token 必须带时间索引</li>
<li>TAIL 监督需要精确的 token 起止时间</li>
<li>数据标注成本远高于传统轮询数据</li>
</ul>
<h3 id="6-2-tlcmdtz">6.2 推理层面的挑战</h3>
<p><strong>流式编码器的状态管理</strong>：</p>
<ul>
<li>Whisper 编码器需要维护 chunk 间的状态(不能每 chunk 独立编码)</li>
<li>视觉编码器需要处理可变帧率输入(1-5 FPS)</li>
</ul>
<p><strong>实时性约束</strong>：</p>
<ul>
<li>1.0s chunk 要求整个前向传播(编码 → LLM → 语音解码 → 流匹配)必须在 1.0s 内完成</li>
<li>llama.cpp-omni 的 RTF 0.21 意味着每 1 秒音频仅需 0.21 秒处理, 留有充足余量</li>
</ul>
<p><strong>内存管理</strong>：</p>
<ul>
<li>持续流式交互中 KV Cache 会不断增长</li>
<li>需要设计滑动窗口或压缩策略来限制内存增长</li>
</ul>
<h3 id="6-3-llama-cpp-omni-dyh">6.3 llama.cpp-omni 的优化</h3>
<p>论文开发了专门的推理框架：</p>
<ul>
<li>针对流式交互范式定制(非通用 LLM 推理框架的适配)</li>
<li>跨平台支持(macOS/Windows/Linux)</li>
<li>INT4 量化下 RTX 4090 RTF 0.21, DGX Spark RTF 0.20</li>
<li>显存占用仅 11GB, 真正实现消费级硬件部署</li>
</ul>
<hr>
<h2 id="7-jxxygjfx">7. 局限性与改进方向</h2>
<h3 id="7-1-dqjx">7.1 当前局限</h3>
<ol>
<li><strong>TAIL 的精度-对齐 trade-off</strong>：表 10 显示 TAIL 的英文 WER (3.93) 明显高于固定交错 (2.38), 说明时间对齐以语音质量为代价</li>
<li><strong>主动行为的&quot;度&quot;</strong>：论文坦承主动行为仍相对简单, 如何避免过度主动(频繁打断、无关提醒)是产品化关键</li>
<li><strong>长时稳定性</strong>：benchmark 是短片段评估, 几小时连续交互的稳定性未充分验证</li>
<li><strong>语音生成的语言混合</strong>：偶有中英意外混合, 说明多语言语音 token 的解耦仍不完美</li>
</ol>
<h3 id="7-2-kndgjfx">7.2 可能的改进方向</h3>
<p><strong>自适应 Chunk 大小</strong>：</p>
<ul>
<li>静态 1.0s 未必适合所有场景</li>
<li>可根据内容动态调整(如静态场景用 2.0s, 快速变化场景用 0.5s)</li>
</ul>
<p><strong>更精细的主动行为策略</strong>：</p>
<ul>
<li>引入&quot;重要性阈值&quot;, 只有高重要性事件才触发主动说话</li>
<li>学习用户的打断偏好, 个性化调整主动频率</li>
</ul>
<p><strong>多说话人全双工</strong>：</p>
<ul>
<li>当前框架假设单一用户 + 环境</li>
<li>扩展到多人对话需要说话人分离 + 注意力分配机制</li>
</ul>
<p><strong>视觉-音频联合压缩</strong>：</p>
<ul>
<li>当前视觉和音频分别压缩(16× 和 5×)</li>
<li>联合压缩可能发现跨模态冗余, 进一步降低 token 数</li>
</ul>
<hr>
<h2 id="8-zj">8. 总结</h2>
<p>Omni-Flow 是 MiniCPM-o 4.5 的灵魂, 也是全双工多模态交互从概念到可部署产品的关键桥梁。它的设计智慧体现在三个层面：</p>
<p><strong>理论层面</strong>：将交互从&quot;序列&quot;重新定义为&quot;时间索引的多模态张量&quot;, 为全双工提供了数学形式化。</p>
<p><strong>算法层面</strong>：时分复用 + LS 解耦 + TAIL 自适应交错, 三个组件协同解决&quot;同时感知和生成&quot;的核心矛盾。</p>
<p><strong>工程层面</strong>：16× 视觉压缩、LLM-语音解码器分离、llama.cpp-omni 推理框架, 确保 9B 参数模型能在 &lt;12GB RAM 上实时运行。</p>
<p>从更宏观的视角看, Omni-Flow 代表了 MLLM 架构设计的一个新方向：<strong>从&quot;如何更好地理解多模态输入&quot;转向&quot;如何更自然地与多模态世界交互&quot;</strong>。这不是能力的量变, 而是范式的质变。</p>
<hr>
<blockquote>
<p><strong>双向同步声明</strong></p>
<p>本文档的知识库同步版本位于: <code>docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM-o-4.5-Omni-Flow全双工流式交互框架.md</code><br>更新日期: 2026-05-22<br>两个文件保持同步更新。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtdy-wsmlxsjhbgl","text":"1. 问题定义：为什么轮询式交互不够了"},{"level":3,"id":"1-1-llgbqx","text":"1.1 两类根本缺陷"},{"level":3,"id":"1-2-qsgjhdtxxbz","text":"1.2 全双工交互的通信学本质"},{"level":2,"id":"2-omni-flow-dxshkj","text":"2. Omni-Flow 的形式化框架"},{"level":3,"id":"2-1-stsjdql","text":"2.1 三条时间对齐流"},{"level":3,"id":"2-2-sjckyztgx","text":"2.2 时间窗口与状态更新"},{"level":3,"id":"2-3-ybz-transformer-dqb","text":"2.3 与标准 Transformer 的区别"},{"level":2,"id":"3-sffy-chunk-sjdgcqh","text":"3. 时分复用：Chunk 设计的工程权衡"},{"level":3,"id":"3-1-sggjsjjc","text":"3.1 三个关键设计决策"},{"level":4,"id":"1-sjld-t","text":"(1) 时间粒度 t"},{"level":4,"id":"2-bjxsbj","text":"(2) 边界显式标记"},{"level":4,"id":"3-jhkzynrscdohfs","text":"(3) 交互控制与内容生成的耦合方式"},{"level":3,"id":"3-2-zdhwdzryx","text":"3.2 主动行为的自然涌现"},{"level":2,"id":"4-tail-sjdqjcyysc","text":"4. TAIL：时间对齐交错语音生成"},{"level":3,"id":"4-1-wtdsxbs","text":"4.1 问题的数学表述"},{"level":3,"id":"4-2-xycldqx","text":"4.2 现有策略的缺陷"},{"level":3,"id":"4-3-tail-dzsyjz","text":"4.3 TAIL 的自适应机制"},{"level":3,"id":"4-4-yjqz","text":"4.4 有界前瞻"},{"level":3,"id":"4-5-syyz","text":"4.5 实验验证"},{"level":2,"id":"5-yxyffddbfx","text":"5. 与现有方法的对比分析"},{"level":3,"id":"5-1-jhfsdb","text":"5.1 交互范式对比"},{"level":3,"id":"5-2-jgxsdb","text":"5.2 架构效率对比"},{"level":2,"id":"6-gcsxyd","text":"6. 工程实现要点"},{"level":3,"id":"6-1-xlcmdtz","text":"6.1 训练层面的挑战"},{"level":3,"id":"6-2-tlcmdtz","text":"6.2 推理层面的挑战"},{"level":3,"id":"6-3-llama-cpp-omni-dyh","text":"6.3 llama.cpp-omni 的优化"},{"level":2,"id":"7-jxxygjfx","text":"7. 局限性与改进方向"},{"level":3,"id":"7-1-dqjx","text":"7.1 当前局限"},{"level":3,"id":"7-2-kndgjfx","text":"7.2 可能的改进方向"},{"level":2,"id":"8-zj","text":"8. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/15-mini-cpm-o-4.5/05-mini-cpm-o-4.5-omni-flow-qsglsjhkj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/15-mini-cpm-o-4.5/05-mini-cpm-o-4.5-omni-flow-qsglsjhkj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-o 4.5 深度解析：Omni-Flow 全双工流式交互框架</h1>
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
