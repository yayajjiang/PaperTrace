"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>下一代 Transformer 架构预测</h1>
<blockquote>
<p>本文展望未来五年 Transformer 架构的演进方向，分析当前痛点并预测三大趋势: 线性注意力普及、细粒度稀疏化、动态计算路由. </p>
</blockquote>
<hr>
<h2 id="1-hxgd">1. 核心观点</h2>
<blockquote>
<p>**未来五年的 Transformer 不会死，但它会变得面目全非. **</p>
</blockquote>
<p>它将从纯粹的注意力机制堆叠，演变成巨大的、稀疏的、混合了循环状态空间模型(SSM)特性的&quot;缝合怪&quot;. </p>
<hr>
<h2 id="2-dqtd">2. 当前痛点</h2>
<h3 id="2-1-kv-cache-xcbz">2.1 KV Cache 显存爆炸</h3>
<ul>
<li>1M 长度上下文的全注意力，KV Cache 可将 H100 集群吃干抹净</li>
<li><strong>必然趋势</strong>: 去线性化注意力的全面普及与混合架构的常态化</li>
</ul>
<h3 id="2-2-cmjsdbkcxx">2.2 稠密计算的不可持续性</h3>
<ul>
<li>当前 MoE 基于 token 级别路由，仍显粗糙</li>
<li><strong>未来方向</strong>: 神经元级别的动态激活</li>
</ul>
<hr>
<h2 id="3-sdyc">3. 三大预测</h2>
<h3 id="ycy-80-20-hhjg">预测一: 80/20 混合架构</h3>
<table>
<thead>
<tr>
<th align="left">层级</th>
<th align="left">占比</th>
<th align="left">类型</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>底层 80%</strong></td>
<td align="left">大部分</td>
<td align="left">线性复杂度模型(改进版 Mamba/RWKV)</td>
<td align="left">处理海量背景信息和上下文维持</td>
</tr>
<tr>
<td align="left"><strong>顶层 20%</strong></td>
<td align="left">关键节点</td>
<td align="left">全注意力层</td>
<td align="left">精准召回和强逻辑推演</td>
</tr>
</tbody></table>
<p><strong>类比</strong>: 大脑大部分时候是潜意识在跑(SSM)，只有遇到难题才调动前额叶深度思考(Attention). </p>
<h3 id="yce-xldxsh">预测二: 细粒度稀疏化</h3>
<p>当前 MoE: </p>
<ul>
<li><strong>大块头专家</strong>: token 级别路由，选 1-2 个专家</li>
</ul>
<p>下一代: </p>
<ul>
<li><strong>神经元级别动态激活</strong>: 不再有明确的 FFN 层和 Attention 层界限</li>
<li><strong>整个网络 = 巨大的动态路由图</strong></li>
<li>计算量不再和参数量强绑定</li>
</ul>
<h3 id="ycs-zsyjssd">预测三: 自适应计算深度</h3>
<p>模型学会&quot;偷懒&quot;: </p>
<ul>
<li><strong>简单 token</strong>(如&quot;的&quot;、&quot;了&quot;): 一层都不跑，直接透传</li>
<li><strong>复杂逻辑推理</strong>: 内部循环思考好几轮再输出</li>
</ul>
<hr>
<h2 id="4-wsm-transformer-rszl">4. 为什么 Transformer 仍是主力？</h2>
<p><strong>生态优势</strong>: </p>
<ul>
<li>硬件优化(Tensor Core、FlashAttention)</li>
<li>软件生态(PyTorch、JAX、vLLM)</li>
<li>人才积累(研究、工程、产品)</li>
</ul>
<blockquote>
<p>新的架构再好，没有生态支持也难以在生产环境立足. </p>
</blockquote>
<hr>
<h2 id="5-gjlwtj">5. 关键论文推荐</h2>
<table>
<thead>
<tr>
<th align="left">论文</th>
<th align="left">方向</th>
<th align="left">必读理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>FlashAttention 系列</strong></td>
<td align="left">IO 优化</td>
<td align="left">理解推理成本瓶颈</td>
</tr>
<tr>
<td align="left"><strong>Mamba 原始论文</strong></td>
<td align="left">SSM</td>
<td align="left">理解线性注意力原理</td>
</tr>
<tr>
<td align="left"><strong>Jamba</strong></td>
<td align="left">混合架构</td>
<td align="left">已验证的 SSM+Attention 混合方案</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-dcyzdjy">6. 对从业者的建议</h2>
<ol>
<li><strong>不要押注单一架构</strong>: 混合架构是未来主流</li>
<li><strong>关注底层 IO</strong>: FlashAttention 等优化是降本关键</li>
<li><strong>保持开放心态</strong>: Transformer 会变，但核心思想(注意力机制)会持续演化</li>
</ol>
<hr>
<h2 id="7-zj">7. 总结</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">当前</th>
<th align="left">未来五年</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>注意力机制</strong></td>
<td align="left">100% 全注意力</td>
<td align="left">80% 线性 + 20% 全注意力</td>
</tr>
<tr>
<td align="left"><strong>计算密度</strong></td>
<td align="left">稠密为主</td>
<td align="left">细粒度稀疏</td>
</tr>
<tr>
<td align="left"><strong>计算深度</strong></td>
<td align="left">固定层数</td>
<td align="left">自适应动态路由</td>
</tr>
<tr>
<td align="left"><strong>生态</strong></td>
<td align="left">Transformer 主导</td>
<td align="left">混合架构共存</td>
</tr>
</tbody></table>
<blockquote>
<p>参考来源: <a href="https://www.zhihu.com/question/1904728228213548260/answer/1975169767355736614">你对下一代Transformer架构的预测是什么？</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxgd","text":"1. 核心观点"},{"level":2,"id":"2-dqtd","text":"2. 当前痛点"},{"level":3,"id":"2-1-kv-cache-xcbz","text":"2.1 KV Cache 显存爆炸"},{"level":3,"id":"2-2-cmjsdbkcxx","text":"2.2 稠密计算的不可持续性"},{"level":2,"id":"3-sdyc","text":"3. 三大预测"},{"level":3,"id":"ycy-80-20-hhjg","text":"预测一: 80/20 混合架构"},{"level":3,"id":"yce-xldxsh","text":"预测二: 细粒度稀疏化"},{"level":3,"id":"ycs-zsyjssd","text":"预测三: 自适应计算深度"},{"level":2,"id":"4-wsm-transformer-rszl","text":"4. 为什么 Transformer 仍是主力？"},{"level":2,"id":"5-gjlwtj","text":"5. 关键论文推荐"},{"level":2,"id":"6-dcyzdjy","text":"6. 对从业者的建议"},{"level":2,"id":"7-zj","text":"7. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/xyd-transformer-jgyc" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/xyd-transformer-jgyc" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">下一代 Transformer 架构预测: 从纯注意力到混合架构</h1>
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
