"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE Top-K 运算可导性分析</h1>
<blockquote>
<p>本文解析 MoE 模型中 Top-K 专家选择运算的数学可导性问题, 分析 PyTorch 的实现方案, 并手撕 Top-K 算子的梯度推导. </p>
</blockquote>
<hr>
<h2 id="1-wtbj">1. 问题背景</h2>
<p>在 Sparse MoE 中, 专家选择通过 Top-K 算子实现：</p>
<p>给定 gate 分数 g ∈ R^n, 选择 top-k 个专家：</p>
<p>indices = TopK(g, k)</p>
<p><strong>核心问题</strong>：Top-K 的排序和选择操作是<strong>不连续的</strong>, 数学上不可导. </p>
<h2 id="2-py-torch-djjfa">2. PyTorch 的解决方案</h2>
<p>PyTorch 的 <code>torch.topk()</code> 算子实现了<strong>可导的 Top-K</strong>：</p>
<ul>
<li><strong>前向传播</strong>：选择 top-k 元素及其索引</li>
<li><strong>反向传播</strong>：仅对 top-k 所选元素反传梯度</li>
<li><strong>非 top-k 元素</strong>：梯度设置为 0</li>
</ul>
<h3 id="2-1-sxxs">2.1 数学形式</h3>
<p>设输入 x ∈ R^n, Top-K(x, k) 选择第 i, j, ... 号元素. </p>
<p>反向传播时, 梯度回传规则：</p>
<p>∂L/∂x_m = { ∂L/∂y_m,  if m ∈ top-k indices
           { 0,        otherwise</p>
<h3 id="2-2-zglj">2.2 直观理解</h3>
<ul>
<li>只有被选中的专家(top-k)会收到梯度信号</li>
<li>未被选中的专家不会收到梯度, 因此不会更新</li>
<li>这确保了门控网络的梯度只影响实际参与计算的专家</li>
</ul>
<h2 id="3-sdyz">3. 手动验证</h2>
<h3 id="3-1-jdsl">3.1 简单示例</h3>
<pre><code class="language-python">import torch

x = torch.tensor([1.0, 3.0, 2.0, 4.0], requires_grad=True)
values, indices = torch.topk(x, 2)  # 选择 [4.0, 3.0], 索引 [3, 1]
loss = values.sum()
loss.backward()

print(x.grad)  # 输出: [0, 1, 0, 1]
# 只有索引 1 和 3 的位置有梯度, 其余为 0
</code></pre>
<h3 id="3-2-y-ste-straight-through-estimator-dgx">3.2 与 STE(Straight-Through Estimator)的关系</h3>
<p>Top-K 的可导实现本质上是一种 STE：</p>
<ul>
<li>前向传播：使用不可导的 Top-K 选择</li>
<li>反向传播：使用近似梯度(identity 或 masked gradient)</li>
</ul>
<h2 id="4-d-moe-xldyx">4. 对 MoE 训练的影响</h2>
<h3 id="4-1-zjfzjh">4.1 专家负载均衡</h3>
<p>由于只有 top-k 专家接收梯度, 可能导致：</p>
<ul>
<li>某些专家被频繁选中, 过度训练</li>
<li>某些专家很少被选中, 训练不足</li>
</ul>
<p><strong>解决方案</strong>：</p>
<ul>
<li>辅助损失(Auxiliary Loss)：鼓励负载均衡</li>
<li>噪声门控(Noisy Top-K Gating)：添加随机噪声打破平局</li>
</ul>
<h3 id="4-2-tdxsx">4.2 梯度稀疏性</h3>
<p>Top-K 的梯度稀疏性(只有 k/n 的元素有梯度)既是优势也是挑战：</p>
<ul>
<li><strong>优势</strong>：计算效率高, 只需反传 k 个专家的梯度</li>
<li><strong>挑战</strong>：门控网络的梯度信号弱, 学习缓慢</li>
</ul>
<h2 id="5-zj">5. 总结</h2>
<table>
<thead>
<tr>
<th align="left">方面</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数学可导性</td>
<td align="left">Top-K 本身不可导</td>
</tr>
<tr>
<td align="left">PyTorch 实现</td>
<td align="left">通过 masked gradient 实现可导近似</td>
</tr>
<tr>
<td align="left">梯度特征</td>
<td align="left">仅 top-k 元素接收梯度, 其余为 0</td>
</tr>
<tr>
<td align="left">训练影响</td>
<td align="left">需要辅助损失保证负载均衡</td>
</tr>
</tbody></table>
<blockquote>
<p>参考来源：<a href="https://www.zhihu.com/question/11071292653/answer/1913934460161852591">MoE 训练中的 Top-K 运算不会导致不可导(不连续)吗？</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj","text":"1. 问题背景"},{"level":2,"id":"2-py-torch-djjfa","text":"2. PyTorch 的解决方案"},{"level":3,"id":"2-1-sxxs","text":"2.1 数学形式"},{"level":3,"id":"2-2-zglj","text":"2.2 直观理解"},{"level":2,"id":"3-sdyz","text":"3. 手动验证"},{"level":3,"id":"3-1-jdsl","text":"3.1 简单示例"},{"level":3,"id":"3-2-y-ste-straight-through-estimator-dgx","text":"3.2 与 STE(Straight-Through Estimator)的关系"},{"level":2,"id":"4-d-moe-xldyx","text":"4. 对 MoE 训练的影响"},{"level":3,"id":"4-1-zjfzjh","text":"4.1 专家负载均衡"},{"level":3,"id":"4-2-tdxsx","text":"4.2 梯度稀疏性"},{"level":2,"id":"5-zj","text":"5. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/03-moe-top-k-yskdxfx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/03-moe-top-k-yskdxfx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE Top-K 运算可导性分析</h1>
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
