"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>工业实践与失效模式</h1>
<blockquote>
<p>标签: #RoPE #工业实践 #失效模式 #性能优化 #配置调优</p>
</blockquote>
<hr>
<h2 id="1-dxpzdb">1. 典型配置对比</h2>
<table>
<thead>
<tr>
<th>模型</th>
<th>head_dim</th>
<th>base</th>
<th>位置编码</th>
<th>最大上下文</th>
<th>模态</th>
</tr>
</thead>
<tbody><tr>
<td>LLaMA2-7B</td>
<td>128</td>
<td>10,000</td>
<td>1D-RoPE</td>
<td>4K</td>
<td>文本</td>
</tr>
<tr>
<td>LLaMA3-8B</td>
<td>128</td>
<td>500,000</td>
<td>1D-RoPE</td>
<td>128K</td>
<td>文本</td>
</tr>
<tr>
<td>Qwen2-VL</td>
<td>128</td>
<td>1,000,000</td>
<td>M-RoPE [16,24,24]</td>
<td>32K</td>
<td>文本+图像+视频</td>
</tr>
<tr>
<td>Qwen3-VL</td>
<td>128</td>
<td>1,000,000</td>
<td>Interleaved-MRoPE</td>
<td>128K</td>
<td>文本+图像+视频</td>
</tr>
</tbody></table>
<p><strong>LLaMA3的base选择</strong>：从10,000提升至500,000, 使得所有维度频率大幅降低. 在128K长度下, 最高频维度的周期从<del>6步提升到</del>300步, 显著减少长程位置碰撞. </p>
<hr>
<h2 id="2-jskx">2. 计算开销</h2>
<table>
<thead>
<tr>
<th>操作</th>
<th>计算量</th>
<th>H100上延迟(L=32K, d=128)</th>
</tr>
</thead>
<tbody><tr>
<td>预计算频率表</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo>×</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L \\times d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></td>
<td>0.5 ms(一次性)</td>
</tr>
<tr>
<td>apply_rotary_pos_emb</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>B</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>L</mi><mo>×</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(B \\times H \\times L \\times d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></td>
<td>~2 ms(batch=1, 32 heads)</td>
</tr>
<tr>
<td>2D/3D坐标映射</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span></td>
<td>&lt;0.1 ms</td>
</tr>
</tbody></table>
<p>RoPE在总前向传播中的占比通常&lt;1%, 不是推理瓶颈. 真正的开销来自<strong>预计算频率表的内存占用</strong>：128K长度 × 128维度 × 2(cos+sin) × 2bytes = 67MB. </p>
<hr>
<h2 id="3-sxmssdfx">3. 失效模式深度分析</h2>
<h3 id="3-1-ccwzpz-aliasing">3.1 长程位置碰撞(Aliasing)</h3>
<ul>
<li><strong>现象</strong>：超长序列中, 远距离位置的注意力分数异常高, 模型产生幻觉或重复</li>
<li><strong>物理原因</strong>：高频维度的周期短, 位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>+</mo><mn>2</mn><mi>π</mi><mi mathvariant="normal">/</mi><msub><mi>θ</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">m + 2\\pi/\\theta_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 在维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 上旋转角度等价(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>cos</mi><mo>⁡</mo></mrow><annotation encoding="application/x-tex">\\cos</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mop">cos</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>sin</mi><mo>⁡</mo></mrow><annotation encoding="application/x-tex">\\sin</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6679em;"></span><span class="mop">sin</span></span></span></span> 以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>π</mi></mrow><annotation encoding="application/x-tex">2\\pi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span></span></span></span> 为周期)</li>
<li><strong>数值示例</strong>：base=10000, d=128, i=0 时 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mn>0</mn></msub><mo>=</mo><mn>1.0</mn></mrow><annotation encoding="application/x-tex">\\theta_0 = 1.0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.0</span></span></span></span>, 周期 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≈</mo><mn>6.28</mn></mrow><annotation encoding="application/x-tex">\\approx 6.28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4831em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">6.28</span></span></span></span> 步. 位置0和位置6在维度0上旋转角度差为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>π</mi></mrow><annotation encoding="application/x-tex">2\\pi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span></span></span></span>, 完全不可区分</li>
<li><strong>缓解</strong>：增大base(如LLaMA3用500000)、使用NTK-aware扩展、YaRN插值</li>
</ul>
<h3 id="3-2-sj-wbmthx">3.2 视觉-文本模态混淆</h3>
<ul>
<li><strong>现象</strong>：多模态模型在图文混合输入时, 文本token错误关注图像token, 或反之</li>
<li><strong>物理原因</strong>：若视觉和文本使用同一位置编码(如简单展平), 不同模态的token可能映射到同一位置索引</li>
<li><strong>数值示例</strong>：文本token位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>=</mo><mn>100</mn></mrow><annotation encoding="application/x-tex">m=100</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">100</span></span></span></span>, 图像展平后某像素位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>m</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mn>100</mn></mrow><annotation encoding="application/x-tex">m&#x27;=100</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7519em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">100</span></span></span></span>, 二者旋转角度完全相同</li>
<li><strong>缓解</strong>：M-RoPE的模态隔离设计(不同模态使用独立坐标轴)、显式的模态类型嵌入</li>
</ul>
<h3 id="3-3-pppxdzdkjpc">3.3 频谱偏斜导致的空间偏差</h3>
<ul>
<li><strong>现象</strong>：在M-RoPE(非交错)中, 模型对某方向的空间变化不敏感</li>
<li><strong>物理原因</strong>：若某维度(如时间)只分配到高频通道, 则长距离时间关系编码不足; 若只分配到低频通道, 则短距离变化模糊</li>
<li><strong>缓解</strong>：Interleaved-MRoPE的轮询分配, 或使用可学习的轴间权重</li>
</ul>
<h3 id="3-4-dt-rope-pfgx">3.4 动态RoPE频繁更新</h3>
<ul>
<li><strong>现象</strong>：推理延迟抖动</li>
<li><strong>物理原因</strong>：序列长度跨越阈值时重新计算inv_freq</li>
<li><strong>缓解</strong>：预分配足够大的缓存, 减少动态更新频率</li>
</ul>
<hr>
<h2 id="4-jsqz">4. 技术前瞻</h2>
<ol>
<li><strong>动态NTK</strong>(Qwen2.5采用)：推理时根据实际序列长度动态调整base</li>
<li><strong>YaRN</strong>：结合PI和NTK, 引入温度因子, 当前外推SOTA</li>
<li><strong>NoPE(无位置编码)</strong>：部分研究表明, 在足够大的模型和数据上, Attention可能隐式学习位置信息, 但尚未成为主流</li>
<li><strong>xPOS / FIRE</strong>：针对RoPE在超长序列上的周期性重叠问题, 提出新的位置编码函数形式</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dxpzdb","text":"1. 典型配置对比"},{"level":2,"id":"2-jskx","text":"2. 计算开销"},{"level":2,"id":"3-sxmssdfx","text":"3. 失效模式深度分析"},{"level":3,"id":"3-1-ccwzpz-aliasing","text":"3.1 长程位置碰撞(Aliasing)"},{"level":3,"id":"3-2-sj-wbmthx","text":"3.2 视觉-文本模态混淆"},{"level":3,"id":"3-3-pppxdzdkjpc","text":"3.3 频谱偏斜导致的空间偏差"},{"level":3,"id":"3-4-dt-rope-pfgx","text":"3.4 动态RoPE频繁更新"},{"level":2,"id":"4-jsqz","text":"4. 技术前瞻"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.5-long-context/rope/05-gysjysxms" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.5-long-context/rope/05-gysjysxms" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">工业实践与失效模式</h1>
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
