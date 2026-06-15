"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-Z1 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.6-glm/14.6-glm">14.6-GLM</a></p>
</blockquote>
<p>GLM-Z1(2025-04-15)是智谱开源推理系列: 基于 GLM-4-32B-0414, 通过<strong>冷启动 SFT + 扩展 RL + 对战排序通用 RL</strong> 在 32B/9B 规模实现接近 DeepSeek-R1(671B) 的推理密度, 并衍生 Rumination 工具研究变体.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.6-glm/05-glm-z1/01-glm-z1-jsbgjy">01-GLM-Z1 技术报告精译</a></td>
<td>中文精译主稿(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-GLM-Z1-mineru-en</a></td>
<td>英文源资料整理(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-GLM-Z1-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/05-glm-z1/05-glm-z1-ysskly-prm-yl">05-GLM-Z1-隐式思考链与PRM原理</a></td>
<td>冷启动 RL 与沉思模型专题</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>2025 年推理模型竞赛的核心矛盾:</p>
<ol>
<li><strong>规模 vs 效率</strong>: DeepSeek-R1 用 671B MoE 换推理上限, 中小团队如何复现?</li>
<li><strong>纯 RL vs 格式稳定</strong>: R1-Zero 证明纯 RL 可行, 但思维链格式混乱难解析</li>
<li><strong>可验证 vs 通用</strong>: 数学/代码有 rule reward, 开放式任务如何 RL?</li>
</ol>
<p>GLM-Z1 的定位: 在 <strong>32B Dense</strong> 上用「冷启动 + 扩展 RL + 排序 RL」三角策略, 同时开源权重与 200 tok/s 商业 API, 证明中小规模也可交付顶级推理.</p>
<h2 id="ffcj">方法拆解</h2>
<p><strong>基座 GLM-4-32B-0414</strong></p>
<ul>
<li>15T 预训练(含推理合成数据) + 拒绝采样/RL 后训练</li>
<li>先对齐指令/代码/函数调用, 再专精推理</li>
</ul>
<p><strong>冷启动 + 扩展 RL</strong></p>
<ul>
<li>少量高质量 CoT SFT → 稳定输出模板</li>
<li>数学/代码/逻辑域大规模 verifiable RL</li>
</ul>
<p><strong>对战排序通用 RL</strong></p>
<ul>
<li>多候选生成 + pairwise ranking, 扩展至非可验证任务</li>
<li>与 GRPO(R1) / rule-only(R1-Zero) 形成方法谱系对照</li>
</ul>
<p><strong>GLM-Z1-Rumination</strong></p>
<ul>
<li>在 Z1 上叠加搜索/工具 RL, 输出结构化研究报告</li>
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
<td>部署尺寸</td>
<td>9B 可 RTX 4090; 32B 需多卡或量化</td>
</tr>
<tr>
<td>API 分层</td>
<td>AirX(200 tok/s) / Air(1/30 成本) / Flash(免费)</td>
</tr>
<tr>
<td>加速</td>
<td>GQA + 量化 + 投机解码</td>
</tr>
<tr>
<td>开源</td>
<td>MIT, Hugging Face + 魔搭同步</td>
</tr>
<tr>
<td>谱系</td>
<td>Z1 推理 → GLM-4.5 MoE 混合思考模式整合</td>
</tr>
</tbody></table>
<p><strong>与 R1 工程差异</strong>: R1 强调纯 RL 方法论开源; Z1 强调 <strong>权重 + 推理服务 + 沉思 Agent</strong> 一体化交付.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>:</p>
<ul>
<li>本地/私有化部署高性价比推理模型(9B/32B)</li>
<li>研究冷启动 vs 纯 RL 训练策略</li>
<li>Rumination 工具增强研究 Agent 原型</li>
</ul>
<p><strong>边界</strong>:</p>
<ul>
<li>无独立 arXiv 报告, RL 细节(超参/奖励/infra)不透明</li>
<li>性能对比多来自官方评测, 需第三方复现验证</li>
<li>Rumination 依赖外部搜索, 生产需自建检索栈</li>
<li>32B Dense 长上下文与 Agent 能力弱于后续 GLM-4.5 MoE</li>
</ul>
<p><strong>谱系</strong>: GLM-4 基座 → <strong>GLM-Z1</strong> 推理专精 → GLM-Z1-Rumination → GLM-4.5 统一混合推理.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/05-glm-z1/05-glm-z1-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/05-glm-z1/05-glm-z1-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-Z1 Index</h1>
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
