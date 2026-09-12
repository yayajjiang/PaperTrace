"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-130B 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.6-glm/14.6-glm">14.6-GLM</a></p>
</blockquote>
<p>GLM-130B(ICLR 2023, arXiv:2210.02414)是首个在多项英文 benchmark 上<strong>超越 GPT-3 175B</strong> 的开源 100B+ 双语模型(130B 参数). 核心贡献: GLM 架构、DeepNorm 训练稳定、EGS 防 loss spike、<strong>无后训练 INT4 量化</strong>(4×RTX 3090 可推理).</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.6-glm/01-glm-130b/01-glm-130b-dhlwjy">01-GLM-130B 顶会论文精译</a></td>
<td>ICLR 2023 中文精译(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-GLM-130B-mineru-en</a></td>
<td>MinerU 英文原文(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-GLM-130B-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/01-glm-130b/02-glm-130b-ew-rope-sltd">02-GLM-130B 二维 RoPE 推导</a></td>
<td>2D RoPE 数学专题</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/01-glm-130b/05-glm-130b-rope">05-GLM-130B-RoPE</a></td>
<td>RoPE 工程实践</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>2022 年 GPT-3 闭源, OPT-175B / BLOOM-176B 开源但性能不及 GPT-3. GLM-130B 要证明:</p>
<ol>
<li><strong>100B+ 开源模型能否追上并超越 GPT-3?</strong></li>
<li><strong>100B 稠密模型训练如何克服 loss spike / 梯度爆炸?</strong></li>
<li><strong>100B 模型能否在消费级 GPU 上部署?</strong></li>
</ol>
<p>同时提供完整双语(中英)能力, 挑战 ERNIE Titan 3.0 260B 等中文闭源模型.</p>
<h2 id="ffcj">方法拆解</h2>
<p><strong>GLM 架构</strong></p>
<ul>
<li>自回归空白填充: <code>[MASK]</code>(理解) + <code>[gMASK]</code>(生成) 统一目标.</li>
<li>双向上下文注意力(零样本 LAMBADA <strong>80.2%</strong>).</li>
<li>DeepNorm Post-LN + RoPE + GLU-GeLU FFN.</li>
</ul>
<p><strong>预训练</strong></p>
<ul>
<li>400B tokens(中英 1:1), 768× A100 40G, 3D 并行(4 TP × 8 PP × 3 DP).</li>
<li>MIP(Multi-task Instruction Pre-training): 5% 英文指令数据, 74 数据集.</li>
</ul>
<p><strong>训练稳定性</strong></p>
<ul>
<li><strong>DeepNorm</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><msqrt><mrow><mn>2</mn><mi>N</mi></mrow></msqrt></mrow><annotation encoding="application/x-tex">\\alpha = \\sqrt{2N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.1133em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9267em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span><span style="top:-2.8867em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1133em;"><span></span></span></span></span></span></span></span></span>, Xavier 缩放 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>2</mn><mi>N</mi><msup><mo stretchy="false">)</mo><mrow><mo>−</mo><mn>1</mn><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msup></mrow><annotation encoding="application/x-tex">(2N)^{-1/2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">1/2</span></span></span></span></span></span></span></span></span></span></span></span>.</li>
<li><strong>EGS(Embedding Gradient Shrink)</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.1</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.1</span></span></span></span>, <code>.detach()</code> 切断嵌入层大梯度.</li>
<li>FP16 混合精度(非 BF16, 兼容 V100).</li>
</ul>
<p><strong>INT4 推理</strong></p>
<ul>
<li>GLM 权重分布更窄 → 对称 INT4 几乎无损.</li>
<li>4× RTX 3090(24G) 或 8× RTX 2080 Ti(11G) 可运行 130B.</li>
</ul>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>模块</th>
<th>工程要点</th>
</tr>
</thead>
<tbody><tr>
<td>并行</td>
<td>PipeDream-Flush 流水线, MFU ~32.5%</td>
</tr>
<tr>
<td>稳定性</td>
<td>数月 spike 排查 → EGS 为关键</td>
</tr>
<tr>
<td>量化</td>
<td>attn-dense / w2 分布决定 INT4 质量</td>
</tr>
<tr>
<td>开源</td>
<td>权重 + 代码 + 训练日志全公开</td>
</tr>
<tr>
<td>伦理</td>
<td>CrowS-Pairs / StereoSet / RealToxicPrompts 主动评估</td>
</tr>
</tbody></table>
<p><strong>关键 benchmark</strong>: LAMBADA +5% vs GPT-3; MMLU 5-shot 44.8; BIG-bench-lite 零样本超 PaLM 540B; CLUE 超 ERNIE 260B +24%.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>: 研究 100B 训练稳定性、双语 LLM、INT4 边缘部署; 理解 GLM 谱系(→ ChatGLM → GLM-4).</p>
<p><strong>边界</strong>:</p>
<ul>
<li>400B token 按 Chinchilla 仍 under-trained(130B 最优约 2.6T).</li>
<li>少样本 in-context learning 增益弱于 GPT-3(双向模型零样本已接近上限).</li>
<li>30% 激活维度 outlier 使 LLM.int8() 类方法不适用.</li>
<li>2022 伦理评估标准较初级.</li>
</ul>
<p><strong>谱系地位</strong>: 开源 100B+ <strong>性能里程碑</strong> → 后续 ChatGLM / GLM-4 家族的技术与工程基座.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/01-glm-130b/05-glm-130b-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/01-glm-130b/05-glm-130b-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-130B Index</h1>
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
