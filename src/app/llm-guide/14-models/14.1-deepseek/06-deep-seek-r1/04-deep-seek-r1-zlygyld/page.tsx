"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-R1 蒸馏与工业落地</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 DeepSeek-R1 的蒸馏策略、小模型性能分析以及实际部署中的工程考量. 详细分析请参阅 <a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-distillation">05-DeepSeek-R1-Distillation.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-zldsjdj">1 蒸馏的设计动机</h2>
<p>DeepSeek-R1 是 671B 总参数、37B 激活参数的 MoE 模型, 部署成本很高. 蒸馏的核心假设是: <strong>大模型通过 RL 发现的推理模式, 可以被编码为监督数据并迁移到小模型</strong>.</p>
<p>关键实验揭示了核心发现:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">AIME 2024</th>
<th align="left">MATH-500</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen2.5-32B-Zero(纯 RL)</td>
<td align="left">47.0%</td>
<td align="left">91.6%</td>
</tr>
<tr>
<td align="left">R1-Distill-Qwen-32B(蒸馏)</td>
<td align="left">72.6%</td>
<td align="left">94.3%</td>
</tr>
</tbody></table>
<p>在相同基础模型上, 蒸馏版本显著优于纯 RL 版本. 这意味着: <strong>小模型的容量不足以通过纯 RL 自发发现复杂推理模式, 从强教师模型蒸馏的高质量数据比小模型自己探索更有效</strong>.</p>
<blockquote>
<p>译者注: 这个发现暗示了推理能力的涌现可能需要跨过某个模型容量门槛. 低于这个门槛, 模型无法自主发现有效的推理策略, 只能模仿. 实践上, 这为社区提供了一个「捷径」: 不需要昂贵的 RL 基础设施, 只需 R1 生成的推理数据和 SFT 算力, 就能获得强大的推理能力.</p>
</blockquote>
<hr>
<h2 id="2-zlmxxnfx">2 蒸馏模型性能分析</h2>
<h3 id="2-1-qxlgl">2.1 全系列概览</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">参数量</th>
<th align="left">AIME 2024</th>
<th align="left">MATH-500</th>
<th align="left">Codeforces</th>
</tr>
</thead>
<tbody><tr>
<td align="left">R1-Distill-Qwen-1.5B</td>
<td align="left">1.5B</td>
<td align="left">28.9%</td>
<td align="left">83.9%</td>
<td align="left">954</td>
</tr>
<tr>
<td align="left">R1-Distill-Qwen-7B</td>
<td align="left">7B</td>
<td align="left">55.5%</td>
<td align="left">92.8%</td>
<td align="left">1189</td>
</tr>
<tr>
<td align="left">R1-Distill-Qwen-14B</td>
<td align="left">14B</td>
<td align="left">69.7%</td>
<td align="left">93.9%</td>
<td align="left">1481</td>
</tr>
<tr>
<td align="left">R1-Distill-Qwen-32B</td>
<td align="left">32B</td>
<td align="left">72.6%</td>
<td align="left">94.3%</td>
<td align="left">1691</td>
</tr>
<tr>
<td align="left">R1-Distill-Llama-8B</td>
<td align="left">8B</td>
<td align="left">50.4%</td>
<td align="left">89.1%</td>
<td align="left">1205</td>
</tr>
<tr>
<td align="left">R1-Distill-Llama-70B</td>
<td align="left">70B</td>
<td align="left">70.0%</td>
<td align="left">94.5%</td>
<td align="left">1633</td>
</tr>
</tbody></table>
<p>从 1.5B 到 32B, 性能呈近似对数增长. 每增加约 2 倍参数量, AIME 性能提升约 10-15 个百分点.</p>
<h3 id="2-2-jgcy-qwen-vs-llama">2.2 架构差异: Qwen vs Llama</h3>
<p>在相近参数量下, Qwen 系列蒸馏模型普遍优于 Llama 系列. 即使 Llama-70B(70B 参数)也未能超越 Qwen-32B(32B 参数). 这表明<strong>基础模型的质量比参数量更重要</strong>.</p>
<hr>
<h2 id="3-gybskl">3 工业部署考量</h2>
<h3 id="3-1-bscb">3.1 部署成本</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">FP16 显存</th>
<th align="left">INT4 量化后</th>
<th align="left">推荐配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen-1.5B</td>
<td align="left">~3 GB</td>
<td align="left">~1 GB</td>
<td align="left">单张消费级 GPU</td>
</tr>
<tr>
<td align="left">Qwen-7B</td>
<td align="left">~14 GB</td>
<td align="left">~4 GB</td>
<td align="left">单张 RTX 4090</td>
</tr>
<tr>
<td align="left">Qwen-14B</td>
<td align="left">~28 GB</td>
<td align="left">~8 GB</td>
<td align="left">单张 A100 40GB</td>
</tr>
<tr>
<td align="left">Qwen-32B</td>
<td align="left">~64 GB</td>
<td align="left">~18 GB</td>
<td align="left">2x A100 40GB</td>
</tr>
<tr>
<td align="left">Llama-70B</td>
<td align="left">~140 GB</td>
<td align="left">~40 GB</td>
<td align="left">2x A100 80GB</td>
</tr>
<tr>
<td align="left">DeepSeek-R1</td>
<td align="left">~1400 GB</td>
<td align="left">~700 GB</td>
<td align="left">8x H800</td>
</tr>
</tbody></table>
<p>对于绝大多数应用场景, 7B 或 14B 蒸馏模型已经足够.</p>
<h3 id="3-2-tlyh">3.2 推理优化</h3>
<ul>
<li><strong>投机解码</strong>: 使用 MTP 或 draft model 加速解码</li>
<li><strong>动态批处理</strong>: 根据序列长度动态分组</li>
<li><strong>量化</strong>: INT4/INT8 减少显存占用</li>
<li><strong>分页注意力</strong>: vLLM 的 PagedAttention 高效管理 KV Cache</li>
</ul>
<h3 id="3-3-zldbj">3.3 蒸馏的边界</h3>
<ol>
<li><strong>能力天花板</strong>: 受限于教师模型.</li>
<li><strong>数据分布依赖</strong>: 对创意写作等任务增益有限.</li>
<li><strong>无法学习新策略</strong>: 是「模仿」而非「探索」.</li>
<li><strong>思维链长度</strong>: 小模型可能无法完整复现教师的长思维链.</li>
</ol>
<hr>
<h2 id="4-zlzsfpxzdwz">4 蒸馏在算法谱系中的位置</h2>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">优势</th>
<th align="left">劣势</th>
<th align="left">适用场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left">纯 RL</td>
<td align="left">自主发现新策略</td>
<td align="left">需要大模型、不稳定</td>
<td align="left">探索推理上限</td>
</tr>
<tr>
<td align="left">SFT + RL</td>
<td align="left">稳定、可控</td>
<td align="left">流水线复杂</td>
<td align="left">生产级部署</td>
</tr>
<tr>
<td align="left">蒸馏</td>
<td align="left">低成本、即插即用</td>
<td align="left">能力受限于教师</td>
<td align="left">资源受限场景</td>
</tr>
</tbody></table>
<p>蒸馏占据了「实用主义」的位置: 它不是最优雅的, 也不是最强大的, 但它是<strong>性价比最高</strong>的. 7B 模型可在笔记本电脑上运行接近 o1-mini 的推理能力; 32B 模型可在 2 张 A100 上部署 o1 级别的推理服务.</p>
<hr>
<blockquote>
<p>本文档为蒸馏与工业落地分析. 详细精译见《01-DeepSeek-R1技术报告精译.md》, 完整蒸馏分析见《05-DeepSeek-R1-Distillation.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zldsjdj","text":"1 蒸馏的设计动机"},{"level":2,"id":"2-zlmxxnfx","text":"2 蒸馏模型性能分析"},{"level":3,"id":"2-1-qxlgl","text":"2.1 全系列概览"},{"level":3,"id":"2-2-jgcy-qwen-vs-llama","text":"2.2 架构差异: Qwen vs Llama"},{"level":2,"id":"3-gybskl","text":"3 工业部署考量"},{"level":3,"id":"3-1-bscb","text":"3.1 部署成本"},{"level":3,"id":"3-2-tlyh","text":"3.2 推理优化"},{"level":3,"id":"3-3-zldbj","text":"3.3 蒸馏的边界"},{"level":2,"id":"4-zlzsfpxzdwz","text":"4 蒸馏在算法谱系中的位置"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/04-deep-seek-r1-zlygyld" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/04-deep-seek-r1-zlygyld" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-R1 蒸馏与工业落地</h1>
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
