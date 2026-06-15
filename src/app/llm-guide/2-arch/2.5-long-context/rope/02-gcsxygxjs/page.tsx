"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>工程实现与高效计算</h1>
<blockquote>
<p>标签: #RoPE #工程实现 #GPT-NeoX #HuggingFace #融合Kernel #内存优化</p>
</blockquote>
<hr>
<h2 id="1-lzfzfgdb">1. 两种分组风格对比</h2>
<p>RoPE的实现有两大流派, 核心区别在于<strong>维度如何配对</strong>：</p>
<table>
<thead>
<tr>
<th>风格</th>
<th>分组方式</th>
<th>代表模型</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>GPT-J Style</strong></td>
<td>相邻配对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>q</mi><mn>0</mn></msub><mo separator="true">,</mo><msub><mi>q</mi><mn>1</mn></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mo stretchy="false">(</mo><msub><mi>q</mi><mn>2</mn></msub><mo separator="true">,</mo><msub><mi>q</mi><mn>3</mn></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mo>…</mo></mrow><annotation encoding="application/x-tex">(q_0, q_1), (q_2, q_3), \\ldots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span></span></span></span></td>
<td>GPT-J, 原始RoPE论文</td>
<td>与理论推导一致, 直观易懂</td>
</tr>
<tr>
<td><strong>GPT-NeoX Style</strong></td>
<td>前后半配对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>q</mi><mn>0</mn></msub><mo separator="true">,</mo><msub><mi>q</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mo stretchy="false">(</mo><msub><mi>q</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>q</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mo>…</mo></mrow><annotation encoding="application/x-tex">(q_0, q_{d/2}), (q_1, q_{d/2+1}), \\ldots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1052em;vertical-align:-0.3552em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span></span></span></span></td>
<td>LLaMA, Qwen2, Mistral</td>
<td>内存访问友好, 现代LLM主流</td>
</tr>
</tbody></table>
<p><strong>GPT-NeoX Style的优势</strong>：</p>
<ul>
<li>内存访问连续(前半段和后半段各自连续), 与GPU缓存行对齐</li>
<li>与FlashAttention等优化内核兼容更好</li>
<li><code>rotate_half</code> 操作只需一次内存拷贝</li>
</ul>
<pre><code class="language-python"># GPT-NeoX Style 的 rotate_half
def rotate_half(x):
    &quot;&quot;&quot;将 hidden dim 的后半部分旋转到前半部分的负值&quot;&quot;&quot;
    x1 = x[..., : x.shape[-1] // 2]   # [x0, x1, x2, x3]
    x2 = x[..., x.shape[-1] // 2 :]   # [x4, x5, x6, x7]
    return torch.cat((-x2, x1), dim=-1)  # [-x4..-x7, x0..x3]
</code></pre>
<hr>
<h2 id="2-hugging-face-transformers-sx">2. HuggingFace Transformers实现</h2>
<h3 id="2-1-llama-rotary-embedding-l">2.1 LlamaRotaryEmbedding类</h3>
<pre><code class="language-python">class LlamaRotaryEmbedding(nn.Module):
    &quot;&quot;&quot;HuggingFace Transformers中的RoPE实现(Qwen2/Llama系列)&quot;&quot;&quot;
    
    def __init__(self, config, device=None):
        super().__init__()
        # 支持多种RoPE变体: default, linear, dynamic, yarn等
        self.rope_type = config.rope_scaling.get(&quot;type&quot;, &quot;default&quot;) if config.rope_scaling else &quot;default&quot;
        self.max_seq_len_cached = config.max_position_embeddings
        self.original_max_seq_len = config.max_position_embeddings
        
        # 初始化inv_freq: 1/theta_i
        inv_freq, self.attention_scaling = self.rope_init_fn(self.config, device, **self.rope_kwargs)
        self.register_buffer(&quot;inv_freq&quot;, inv_freq, persistent=False)
        self.original_inv_freq = self.inv_freq

    @torch.no_grad()
    def forward(self, x, position_ids):
        # 核心RoPE计算: 计算cos(m*theta_i)和sin(m*theta_i)
        inv_freq_expanded = self.inv_freq[None, :, None].float().expand(
            position_ids.shape[0], -1, 1
        )
        position_ids_expanded = position_ids[:, None, :].float()
        
        # 强制float32避免精度问题
        device_type = x.device.type
        device_type = device_type if isinstance(device_type, str) and device_type != &quot;mps&quot; else &quot;cpu&quot;
        with torch.autocast(device_type=device_type, enabled=False):
            freqs = (inv_freq_expanded.float() @ position_ids_expanded.float()).transpose(1, 2)
            emb = torch.cat((freqs, freqs), dim=-1)
            cos = emb.cos()
            sin = emb.sin()
        
        # 高级RoPE类型(如yarn)应用后处理缩放因子
        cos = cos * self.attention_scaling
        sin = sin * self.attention_scaling
        
        return cos.to(dtype=x.dtype), sin.to(dtype=x.dtype)


def apply_rotary_pos_emb(q, k, cos, sin, unsqueeze_dim=1):
    &quot;&quot;&quot;应用旋转位置编码到q和k张量
    
    数学基础：q_embed = q * cos + rotate_half(q) * sin
    
    Args:
        q: [batch_size, num_heads, seq_len, head_dim]
        k: [batch_size, num_heads, seq_len, head_dim]
        cos/sin: [batch_size, seq_len, head_dim]
    &quot;&quot;&quot;
    cos = cos.unsqueeze(unsqueeze_dim)  # [batch, 1, seq, head_dim]
    sin = sin.unsqueeze(unsqueeze_dim)
    
    q_embed = (q * cos) + (rotate_half(q) * sin)
    k_embed = (k * cos) + (rotate_half(k) * sin)
    return q_embed, k_embed
</code></pre>
<h3 id="2-2-dt-rope-gx">2.2 动态RoPE更新</h3>
<p>动态RoPE在序列长度增长时重新计算<code>inv_freq</code>, 无需预先知道最大长度：</p>
<pre><code class="language-python">def _dynamic_frequency_update(self, position_ids, device):
    &quot;&quot;&quot;动态RoPE：序列长度增长时重新计算inv_freq&quot;&quot;&quot;
    seq_len = torch.max(position_ids) + 1
    if seq_len &gt; self.max_seq_len_cached:
        inv_freq, self.attention_scaling = self.rope_init_fn(
            self.config, device, seq_len=seq_len, **self.rope_kwargs
        )
        self.register_buffer(&quot;inv_freq&quot;, inv_freq, persistent=False)
        self.max_seq_len_cached = seq_len
    
    # 序列缩短回原始范围时重置
    if seq_len &lt; self.original_max_seq_len and self.max_seq_len_cached &gt; self.original_max_seq_len:
        self.register_buffer(&quot;inv_freq&quot;, self.original_inv_freq, persistent=False)
        self.max_seq_len_cached = self.original_max_seq_len
</code></pre>
<p><strong>性能影响</strong>：动态更新触发时(序列跨越新长度阈值), 需重新计算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 个频率值, 耗时约0.1-0.5ms. 为减少抖动, 可预分配足够大的缓存. </p>
<hr>
<h2 id="3-yjsyhccl">3. 预计算与缓存策略</h2>
<h3 id="3-1-psbyjs">3.1 频率表预计算</h3>
<pre><code class="language-python">def precompute_rope_params(head_dim, theta_base=10_000, context_length=4096):
    &quot;&quot;&quot;预计算RoPE的cos和sin值&quot;&quot;&quot;
    assert head_dim % 2 == 0, &quot;Embedding dimension must be even&quot;
    
    # 计算逆频率: 1/theta_i
    inv_freq = 1.0 / (theta_base ** (torch.arange(0, head_dim, 2).float() / head_dim))
    
    # 位置索引 [0, 1, ..., context_length-1]
    positions = torch.arange(context_length)
    
    # 角度矩阵: [context_length, head_dim//2]
    angles = positions[:, None] * inv_freq[None, :]
    
    # 扩展到head_dim(每对维度共享同一个角度)
    angles = torch.cat([angles, angles], dim=1)
    
    return torch.cos(angles), torch.sin(angles)
</code></pre>
<h3 id="3-2-nczyfx">3.2 内存占用分析</h3>
<p>设 <code>max_seq_len = 131072</code>(128K), <code>head_dim = 128</code>, <code>dtype = float16</code>：</p>
<table>
<thead>
<tr>
<th>项目</th>
<th>计算</th>
<th>大小</th>
</tr>
</thead>
<tbody><tr>
<td>cos表</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>131072</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">131072 \\times 128 \\times 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">131072</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> bytes</td>
<td>33.5 MB</td>
</tr>
<tr>
<td>sin表</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>131072</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">131072 \\times 128 \\times 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">131072</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> bytes</td>
<td>33.5 MB</td>
</tr>
<tr>
<td><strong>总计</strong></td>
<td></td>
<td><strong>67 MB</strong></td>
</tr>
</tbody></table>
<p>对H100 80GB显存占比 &lt; 0.1%. 预计算为一次性开销, 后续每次前向传播复用. </p>
<p><strong>失效模式</strong>：若未缓存频率表而是每次前向实时计算, 128K长度下额外引入约33.5M次浮点运算, 在高吞吐场景中可能成为瓶颈. </p>
<hr>
<h2 id="4-rh-kernel-yh">4. 融合Kernel优化</h2>
<p>FlashAttention-v2+ 原生支持RoPE的在线计算, 将位置编码融合到Attention内核中：</p>
<p><strong>优势</strong>：</p>
<ol>
<li>避免单独的RoPE kernel启动开销</li>
<li>减少一次HBM读写(Q/K从HBM读取后直接在内核中做RoPE, 不写回)</li>
<li>与FlashAttention的分块策略协同, 最大化SRAM利用率</li>
</ol>
<p><strong>实现方式</strong>：在FlashAttention的<code>forward</code>内核中, 每个分块计算完Q/K后, 立即应用RoPE旋转, 然后继续进入Attention计算. </p>
<p><strong>性能提升</strong>：在L=32K, d=128, batch=1的场景下, 融合RoPE可减少约5-8%的总推理延迟. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-lzfzfgdb","text":"1. 两种分组风格对比"},{"level":2,"id":"2-hugging-face-transformers-sx","text":"2. HuggingFace Transformers实现"},{"level":3,"id":"2-1-llama-rotary-embedding-l","text":"2.1 LlamaRotaryEmbedding类"},{"level":3,"id":"2-2-dt-rope-gx","text":"2.2 动态RoPE更新"},{"level":2,"id":"3-yjsyhccl","text":"3. 预计算与缓存策略"},{"level":3,"id":"3-1-psbyjs","text":"3.1 频率表预计算"},{"level":3,"id":"3-2-nczyfx","text":"3.2 内存占用分析"},{"level":2,"id":"4-rh-kernel-yh","text":"4. 融合Kernel优化"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.5-long-context/rope/02-gcsxygxjs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.5-long-context/rope/02-gcsxygxjs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">工程实现与高效计算</h1>
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
