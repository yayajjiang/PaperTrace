"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>隐式思维链(Latent CoT)综述: 超越语言的推理</h1>
<blockquote>
<p>本文综述隐式思维链(Latent Chain-of-Thought Reasoning)研究,介绍其核心动机、分类体系、代表性方法及挑战. </p>
</blockquote>
<hr>
<h2 id="1-dj-xs-cot-djx">1. 动机: 显式 CoT 的局限</h2>
<h3 id="1-1-bdryx">1.1 表达冗余性</h3>
<p>推理链中的许多标记在句法上是必需的,但在推理过程中功能上并非必要: </p>
<ul>
<li>填充词: &quot;所以&quot;、&quot;这个&quot;、&quot;那么&quot;</li>
<li>结果: 标记使用量增加,推理速度减慢</li>
<li>风险: 模型对风格化特征过拟合,而非真实推理信号</li>
</ul>
<h3 id="1-2-yypj">1.2 语义瓶颈</h3>
<p>人类认知常常超越离散的语言符号: </p>
<ul>
<li>涉及抽象、连续或多概念的表征</li>
<li>将连续推理动态强制嵌入固定词汇的线性链中,造成信息损失</li>
</ul>
<h3 id="1-3-bhtlsx">1.3 并行推理受限</h3>
<p>显式 CoT 的线性生成方式限制了多路径并行探索. </p>
<hr>
<h2 id="2-ys-cot-dhxsx">2. 隐式 CoT 的核心思想</h2>
<h3 id="2-1-dy">2.1 定义</h3>
<p>隐式思维链在非语言的高维潜在空间中表示推理轨迹: </p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">显式 CoT</th>
<th align="left">隐式 CoT</th>
</tr>
</thead>
<tbody><tr>
<td align="left">媒介</td>
<td align="left">自然语言标记</td>
<td align="left">稠密向量 / 隐藏状态变换</td>
</tr>
<tr>
<td align="left">可解释性</td>
<td align="left">人类可读</td>
<td align="left">内部表征</td>
</tr>
<tr>
<td align="left">效率</td>
<td align="left">标记级计算</td>
<td align="left">潜在空间计算</td>
</tr>
<tr>
<td align="left">表达能力</td>
<td align="left">受限于词汇表</td>
<td align="left">连续、高维、更丰富</td>
</tr>
</tbody></table>
<h3 id="2-2-ys">2.2 优势</h3>
<ol>
<li><strong>加速推理</strong>: 减少标记级计算</li>
<li><strong>紧凑表征</strong>: 支持更丰富的推理表示</li>
<li><strong>并行探索</strong>: 可同时探索多个推理路径</li>
</ol>
<hr>
<h2 id="3-fltx">3. 分类体系</h2>
<h3 id="3-1-ldffllb">3.1 两大方法论类别</h3>
<h4 id="lby-hxcl-token-level">类别一: 横向策略(Token-level)</h4>
<p>在标记级别进行隐式推理,每个推理步骤对应一个或多个潜在向量. </p>
<h4 id="lbe-zxcl-layer-level">类别二: 纵向策略(Layer-level)</h4>
<p>在模型层级别进行隐式推理,推理过程嵌入到网络的中间层变换中. </p>
<hr>
<h2 id="4-dbxff">4. 代表性方法</h2>
<h3 id="4-1-xxjgsj">4.1 新型架构设计</h3>
<ul>
<li><strong>目标</strong>: 设计专门支持隐式推理的架构</li>
<li><strong>思路</strong>: 在标准 Transformer 中引入隐式推理模块</li>
</ul>
<h3 id="4-2-ystljz">4.2 隐式推理机制</h3>
<ul>
<li><strong>目标</strong>: 实现高效且有效的潜在空间推理</li>
<li><strong>思路</strong>: 通过特殊训练目标引导模型学习隐式推理路径</li>
</ul>
<h3 id="4-3-gxtlzt">4.3 高效推理载体</h3>
<ul>
<li><strong>目标</strong>: 将隐式 CoT 用于推理加速和压缩</li>
<li><strong>思路</strong>: 用潜在向量替代长推理链,减少生成长度</li>
</ul>
<hr>
<h2 id="5-gjtz">5. 关键挑战</h2>
<h3 id="5-1-xlydqnt">5.1 训练与对齐难题</h3>
<ul>
<li>推理过程不可观测,直接监督难以应用</li>
<li>缺乏有效监督可能导致隐式轨迹漂移</li>
</ul>
<h3 id="5-2-pgcj">5.2 评估差距</h3>
<ul>
<li>难以判断模型是否真正进行推理</li>
<li>还是仅利用输入与输出之间的相关性进行模式匹配</li>
</ul>
<h3 id="5-3-kjsxyll">5.3 可解释性与伦理</h3>
<ul>
<li>隐式推理缺乏透明度</li>
<li>难以保障伦理可控性</li>
</ul>
<hr>
<h2 id="6-wlfx">6. 未来方向</h2>
<table>
<thead>
<tr>
<th align="left">方向</th>
<th align="left">描述</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>无监督训练</strong></td>
<td align="left">不依赖显式推理标注,让模型自发学习隐式推理</td>
</tr>
<tr>
<td align="left"><strong>评估忠实性</strong></td>
<td align="left">开发方法来验证隐式推理是否真实发生</td>
</tr>
<tr>
<td align="left"><strong>可解释性</strong></td>
<td align="left">将隐式推理过程部分解码为人类可理解的形式</td>
</tr>
<tr>
<td align="left"><strong>混合范式</strong></td>
<td align="left">结合显式和隐式 CoT 的优势</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-zj">7. 总结</h2>
<p>隐式 CoT 代表了大模型推理的重要发展方向: </p>
<ul>
<li><strong>从语言到潜在空间</strong>: 突破离散词汇的限制</li>
<li><strong>从线性到并行</strong>: 支持更灵活的推理探索</li>
<li><strong>从可读到高效</strong>: 以可解释性换取速度和表达能力</li>
</ul>
<p>这一范式仍处于快速发展阶段,训练方法、评估手段和架构设计都有待进一步探索. </p>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/1998807709114454856">大模型综述: 超越语言的推理——隐式思维链推理</a>
原文: arxiv.org/abs/2505.16782</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dj-xs-cot-djx","text":"1. 动机: 显式 CoT 的局限"},{"level":3,"id":"1-1-bdryx","text":"1.1 表达冗余性"},{"level":3,"id":"1-2-yypj","text":"1.2 语义瓶颈"},{"level":3,"id":"1-3-bhtlsx","text":"1.3 并行推理受限"},{"level":2,"id":"2-ys-cot-dhxsx","text":"2. 隐式 CoT 的核心思想"},{"level":3,"id":"2-1-dy","text":"2.1 定义"},{"level":3,"id":"2-2-ys","text":"2.2 优势"},{"level":2,"id":"3-fltx","text":"3. 分类体系"},{"level":3,"id":"3-1-ldffllb","text":"3.1 两大方法论类别"},{"level":4,"id":"lby-hxcl-token-level","text":"类别一: 横向策略(Token-level)"},{"level":4,"id":"lbe-zxcl-layer-level","text":"类别二: 纵向策略(Layer-level)"},{"level":2,"id":"4-dbxff","text":"4. 代表性方法"},{"level":3,"id":"4-1-xxjgsj","text":"4.1 新型架构设计"},{"level":3,"id":"4-2-ystljz","text":"4.2 隐式推理机制"},{"level":3,"id":"4-3-gxtlzt","text":"4.3 高效推理载体"},{"level":2,"id":"5-gjtz","text":"5. 关键挑战"},{"level":3,"id":"5-1-xlydqnt","text":"5.1 训练与对齐难题"},{"level":3,"id":"5-2-pgcj","text":"5.2 评估差距"},{"level":3,"id":"5-3-kjsxyll","text":"5.3 可解释性与伦理"},{"level":2,"id":"6-wlfx","text":"6. 未来方向"},{"level":2,"id":"7-zj","text":"7. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/latent-cot" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/latent-cot" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">隐式思维链(Latent CoT)综述: 超越语言的推理</h1>
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
