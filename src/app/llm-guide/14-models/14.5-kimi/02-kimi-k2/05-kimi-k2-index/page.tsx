"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi-K2 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">14.5-Kimi</a></p>
</blockquote>
<p>Kimi K2(arXiv:2507.20534, 2025-07)是 Moonshot AI 首款<strong>开源万亿 MoE 旗舰</strong>, 以 <strong>Agentic Intelligence</strong> 为设计主轴: 1.04T 总参数 / 32B 激活, 15.5T token 零 loss spike 预训练, SWE-bench Verified <strong>65.8%</strong>(非 thinking 模式)刷新开源 Agent 编程上限.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.5-kimi/02-kimi-k2/01-kimi-k2-jsbgjy">01-Kimi-K2 技术报告精译</a></td>
<td>中文精译主稿(D2)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.5-kimi/02-kimi-k2/02-kimi-k2-hxyhpx">02-Kimi-K2 核心演化剖析</a></td>
<td>架构演化与能力对比(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-Kimi-K2-mineru-en</a></td>
<td>MinerU 英文原文(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-Kimi-K2-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-architecture-overview">05-Kimi-K2 架构专题</a></td>
<td>MuonClip / MoE / Agentic RL 深度拆解</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Kimi K2 要解决的不是「再做一个更大的通用基座」, 而是在高质量人类数据见顶、Agent 能力数据稀缺的约束下, 让开源模型在<strong>工具使用、软件工程、多步规划</strong>等 Agentic 任务上接近闭源 Claude 4 水平.</p>
<p>核心矛盾有三层:</p>
<ol>
<li><strong>预训练</strong>: 如何在 15.5T token 规模上用 Muon 优化器获得更高 token 效率, 同时避免 MoE+MLA 下的 attention logit 爆炸?</li>
<li><strong>数据</strong>: 自然语料中 Agent 轨迹极少, 如何规模化合成可验证的工具调用演示?</li>
<li><strong>后训练</strong>: 如何把 SWE-bench 等可验证奖励(RLVR)与开放式任务的自我批评评分结合, 且不导致推理成本失控?</li>
</ol>
<h2 id="ffcj">方法拆解</h2>
<p><strong>预训练 — MuonClip</strong></p>
<ul>
<li><strong>Muon 优化器</strong>: 对权重矩阵做 Newton-Schulz 正交化, 满秩更新, token 效率优于 AdamW(Moonlight 已验证).</li>
<li><strong>QK-Clip</strong>: Muon 易引发 attention logit 爆炸; QK-Clip 在优化步后对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub><mo separator="true">,</mo><msub><mi>W</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">W_q, W_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 按 per-head 阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 重缩放, 不侵入前向/反向, 适配 MLA(无法直接用 QK-Norm).</li>
<li><strong>结果</strong>: 15.5T token 训练全程无 loss spike.</li>
</ul>
<p><strong>架构 — 超稀疏 MoE + MLA</strong></p>
<ul>
<li>384 专家 / 8 激活(稀疏度 48), 64 注意力头(非 DeepSeek-V3 的 128 头), 1 层 dense FFN.</li>
<li>缩放定律实验驱动: 更高稀疏度在 iso-FLOPs 下更低 loss; 减头数换 128K 上下文推理效率(83% FLOPs 节省).</li>
</ul>
<p><strong>后训练 — Agentic 流水线</strong></p>
<ol>
<li><strong>SFT</strong>: 20,000+ 合成工具 + 3,000+ 真实 MCP 工具; 模拟环境 + 10,000 并发真实沙箱混合生成轨迹.</li>
<li><strong>RL</strong>: RLVR(代码/数学可验证奖励) + K2 Critic 评分表(开放式任务); 预算控制限制响应长度.</li>
<li><strong>基础设施</strong>: 训练/推理引擎 colocate, checkpoint engine 30s 内完成 1T 模型权重广播(Appendix G).</li>
</ol>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>模块</th>
<th>工程要点</th>
<th>落地启示</th>
</tr>
</thead>
<tbody><tr>
<td>训练并行</td>
<td>灵活 PP/TP/EP, 交错 1F1B(非 DualPipe), EP=16 最小可行</td>
<td>1T MoE 在 H800 集群可迭代实验</td>
</tr>
<tr>
<td>显存</td>
<td>CPU activation offload + copy engine 与计算/通信重叠</td>
<td>超大模型显存不足时的标准套路</td>
</tr>
<tr>
<td>工具调用</td>
<td>TypeScript 工具声明 + 约束解码 enforcer</td>
<td>结构化生成减少幻觉参数</td>
</tr>
<tr>
<td>RL 引擎切换</td>
<td>H2D / Broadcast / Reload 三阶段流水线; H800 PCIe 饱和退化为两阶段</td>
<td>RL 扩展受互连带宽约束</td>
</tr>
<tr>
<td>开源</td>
<td>Base + Instruct 权重开放(HuggingFace)</td>
<td>社区可复现 Agent 能力</td>
</tr>
</tbody></table>
<p><strong>关键 benchmark(非 thinking)</strong>: Tau2-Bench 66.1, SWE-bench Verified 65.8, LiveCodeBench v6 53.7, AIME 2025 49.5, GPQA-Diamond 75.1.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用场景</strong></p>
<ul>
<li>需要<strong>开源权重</strong>的 Agent / 代码助手 / 工具调用系统.</li>
<li>长上下文 Agent 任务(128K 评估窗口), 软件工程自动化(SWE-bench 类).</li>
<li>研究 Muon 优化器、超稀疏 MoE 缩放定律、Agentic 数据合成与 RLVR 框架.</li>
</ul>
<p><strong>边界与局限(论文自述 + 评测观察)</strong></p>
<ul>
<li><strong>非 thinking 模式评估</strong>: 未启用测试时扩展, 与 DeepSeek-R1 等推理特化模型不完全可比.</li>
<li><strong>过度生成</strong>: RL 后模型可能输出过长, 需预算控制或早停.</li>
<li><strong>工具误激活</strong>: SFT 可能过度触发 tool-calling, 需意图分类门控.</li>
<li><strong>安全</strong>: Criminal/Security 迭代越狱通过率低于 Qwen3, Crescendo 攻击仍有效.</li>
<li><strong>单次生成 vs Agent 框架</strong>: SWE-bench 高分依赖多轮 Agent 框架, 裸 one-shot 仍有差距.</li>
</ul>
<p><strong>谱系位置</strong>: Kimi-Chat(长上下文产品) → <strong>K2(1T MoE 开源 Agent 标杆)</strong> → K2.5(多模态) → K2.6(最新旗舰). K2 是 Moonshot 从「产品驱动」转向「技术报告 + 开源权重」的里程碑.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi-K2 Index</h1>
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
