"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMoE: Open Mixture-of-Experts Language Models 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文: Muennighoff, N., Soldaini, L., Groeneveld, D., et al. &quot;OLMoE: Open Mixture-of-Experts Language Models.&quot; ICLR 2025 / arXiv:2409.02060.
原文链接: <a href="https://arxiv.org/abs/2409.02060">https://arxiv.org/abs/2409.02060</a>
发布时间: 2024年9月 (arXiv), 2025年1月 (ICLR)</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-%E9%A2%84%E8%AE%AD%E7%BB%83%E4%B8%8E%E9%80%82%E9%85%8D">2 预训练与适配</a><ul>
<li><a href="#21-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%9E%B6%E6%9E%84">2.1 预训练架构</a></li>
<li><a href="#22-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE">2.2 预训练数据</a></li>
<li><a href="#23-%E9%80%82%E9%85%8D">2.3 适配</a></li>
</ul>
</li>
<li><a href="#3-%E5%AE%9E%E9%AA%8C%E7%BB%93%E6%9E%9C">3 实验结果</a><ul>
<li><a href="#31-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%9C%9F%E9%97%B4%E8%AF%84%E4%BC%B0">3.1 预训练期间评估</a></li>
<li><a href="#32-%E9%A2%84%E8%AE%AD%E7%BB%83%E5%90%8E%E8%AF%84%E4%BC%B0">3.2 预训练后评估</a></li>
<li><a href="#33-%E9%80%82%E9%85%8D%E5%90%8E%E8%AF%84%E4%BC%B0">3.3 适配后评估</a></li>
</ul>
</li>
<li><a href="#4-%E6%9B%BF%E4%BB%A3%E8%AE%BE%E8%AE%A1%E9%80%89%E6%8B%A9%E7%9A%84%E5%AE%9E%E9%AA%8C">4 替代设计选择的实验</a><ul>
<li><a href="#41-moe%E4%B8%93%E5%B1%9E%E9%A2%84%E8%AE%AD%E7%BB%83%E8%AE%BE%E7%BD%AE">4.1 MoE专属预训练设置</a><ul>
<li><a href="#411-moe-vs-dense">4.1.1 MoE vs. Dense</a></li>
<li><a href="#412-%E4%B8%93%E5%AE%B6%E7%B2%92%E5%BA%A6">4.1.2 专家粒度</a></li>
<li><a href="#413-%E5%85%B1%E4%BA%AB%E4%B8%93%E5%AE%B6">4.1.3 共享专家</a></li>
<li><a href="#414-expert-choice-vs-token-choice">4.1.4 Expert Choice vs. Token Choice</a></li>
<li><a href="#415-%E7%A8%80%E7%96%8F%E4%B8%8A%E5%BE%AA%E7%8E%AF-sparse-upcycling">4.1.5 稀疏上循环 (Sparse Upcycling)</a></li>
<li><a href="#416-%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1%E6%8D%9F%E5%A4%B1">4.1.6 负载均衡损失</a></li>
<li><a href="#417-router-z-loss">4.1.7 Router Z-loss</a></li>
</ul>
</li>
<li><a href="#42-%E9%80%9A%E7%94%A8%E9%A2%84%E8%AE%AD%E7%BB%83%E8%AE%BE%E7%BD%AE">4.2 通用预训练设置</a><ul>
<li><a href="#421-%E6%95%B0%E6%8D%AE%E9%9B%86%E5%AE%9E%E9%AA%8C">4.2.1 数据集实验</a></li>
<li><a href="#422-%E5%88%9D%E5%A7%8B%E5%8C%96">4.2.2 初始化</a></li>
<li><a href="#423-rmsnorm">4.2.3 RMSNorm</a></li>
<li><a href="#424-%E8%A1%B0%E5%87%8F%E5%B5%8C%E5%85%A5%E5%8F%82%E6%95%B0">4.2.4 衰减嵌入参数</a></li>
<li><a href="#425-qk-norm">4.2.5 QK-Norm</a></li>
<li><a href="#426-adamw-epsilon">4.2.6 AdamW Epsilon</a></li>
</ul>
</li>
<li><a href="#43-%E9%80%82%E9%85%8D%E8%AE%BE%E7%BD%AE">4.3 适配设置</a></li>
</ul>
</li>
<li><a href="#5-moe-%E6%B7%B1%E5%BA%A6%E5%88%86%E6%9E%90">5 MoE 深度分析</a><ul>
<li><a href="#51-%E8%B7%AF%E7%94%B1%E9%A5%B1%E5%92%8C-router-saturation">5.1 路由饱和 (Router Saturation)</a></li>
<li><a href="#52-%E4%B8%93%E5%AE%B6%E5%85%B1%E6%BF%80%E6%B4%BB-expert-co-activation">5.2 专家共激活 (Expert Co-activation)</a></li>
<li><a href="#53-%E9%A2%86%E5%9F%9F%E4%B8%93%E4%B8%9A%E5%8C%96-domain-specialization">5.3 领域专业化 (Domain Specialization)</a></li>
<li><a href="#54-%E8%AF%8D%E6%B1%87%E4%B8%93%E4%B8%9A%E5%8C%96-vocabulary-specialization">5.4 词汇专业化 (Vocabulary Specialization)</a></li>
</ul>
</li>
<li><a href="#6-%E7%9B%B8%E5%85%B3%E5%B7%A5%E4%BD%9C">6 相关工作</a></li>
<li><a href="#7-%E7%BB%93%E8%AE%BA">7 结论</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E8%AE%AD%E7%BB%83%E9%85%8D%E7%BD%AE">A 训练配置</a></li>
<li><a href="#b-%E8%AF%84%E4%BC%B0%E8%AE%BE%E7%BD%AE">B 评估设置</a></li>
</ul>
</li>
<li><a href="#%E5%8F%82%E8%80%83%E6%96%87%E7%8C%AE">参考文献</a></li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们推出 OLMoE-1B-7B,一个完全开源、利用稀疏混合专家(Mixture-of-Experts, MoE)架构的最先进语言模型。OLMoE-1B-7B 拥有 70 亿(7B)总参数量,但每个输入 token 仅激活 10 亿(1B)参数。我们在 5 万亿 token 上对其进行预训练,并通过指令微调(Instruction Tuning)与偏好优化(Preference Tuning)进一步适配,得到 OLMoE-1B-7B-Instruct。该模型在所有具有相似激活参数量(Active Parameters)的可用模型中表现最优,甚至超越了参数量更大的模型,如 Llama2-13B-Chat 和 DeepSeekMoE-16B。</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么做这件事?
大型语言模型(Large Language Models, LMs)在各类任务上取得了显著进展,但性能与成本之间的权衡在训练和推理两个阶段都极为明显。高性能 LMs 对许多学术界和开源开发者而言遥不可及,因为它们的构建与部署成本极高。稀疏激活的 MoE 架构通过在每一层设置多个「专家」(Experts),每次仅激活其中一小部分,从而显著提升了计算效率。然而,绝大多数 MoE 模型是闭源的:虽然部分模型公开了权重,但关于训练数据、代码或训练配方的信息极其有限。MoE 相比 Dense 模型引入了更多复杂的设计问题——总参数量 vs. 激活参数量、专家大小与数量、是否共享专家、路由算法选择等——这些问题的答案缺乏公开资源,阻碍了社区构建接近闭源前沿模型性能的成本高效开源 MoE。</p>
</blockquote>
<p>本文呈现了关于 MoE 训练的大量受控实验,分析了模型中的路由行为,发现了高度的专业化现象,并开源了我们工作的所有方面:模型权重、训练数据、代码和日志。</p>
<p><strong>开放资源</strong></p>
<table>
<thead>
<tr>
<th>类型</th>
<th>链接</th>
</tr>
</thead>
<tbody><tr>
<td>模型</td>
<td><a href="https://hf.co/allenai/OLMoE-1B-7B-0924">https://hf.co/allenai/OLMoE-1B-7B-0924</a></td>
</tr>
<tr>
<td>数据</td>
<td><a href="https://hf.co/datasets/allenai/OLMoE-mix-0924">https://hf.co/datasets/allenai/OLMoE-mix-0924</a></td>
</tr>
<tr>
<td>代码</td>
<td><a href="https://github.com/allenai/OLMoE">https://github.com/allenai/OLMoE</a></td>
</tr>
<tr>
<td>日志</td>
<td><a href="https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924">https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924</a></td>
</tr>
</tbody></table>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>尽管大型语言模型在各类任务上取得了显著进展,但性能与成本之间的权衡在训练和推理两个阶段都极为明显。高性能 LMs 对许多学术界和开源开发者而言遥不可及,因为它们的构建与部署成本极高。例如,即使使用 16 块 H100 GPU 并进行多项优化,Llama 3 405B 的解码吞吐量也仅约每秒 100 个 token。</p>
<p>改善这一成本-性能权衡的一种方法是使用稀疏激活的混合专家(Mixture-of-Experts, MoE)。MoE 在每一层设置多个专家,每次仅激活其中一小部分(见第 2 节图)。这使得 MoE 相比具有相似总参数量的 Dense 模型显著更高效——后者对每次输入都激活全部参数。因此,业界前沿模型如 Gemini-1.5 和 reportedly GPT-4 均采用了 MoE 架构。</p>
<p>然而,大多数 MoE 模型是闭源的:虽然部分模型公开了权重,但关于训练数据、代码或训练配方的信息极其有限。尽管已有努力使语言模型研究完全可获取,但这些工作大多局限于 Dense LMs。MoE 实际上需要「更多」开放性,因为它们引入了复杂的新设计问题:总参数量 vs. 激活参数量、使用许多小专家还是少量大专家、是否共享专家、路由算法选择等。缺乏关于这些细节的公开资源和发现,阻碍了社区构建接近闭源前沿模型能力的成本高效开源 MoE。</p>
<p>为解决这些问题,我们推出了 OLMoE,一个完全开源的混合专家语言模型,在相似规模的模型中实现了最先进的性能。具体而言,我们预训练了 OLMoE-1B-7B:总参数量 69 亿,每个输入 token 仅激活 13 亿参数。这带来了与约 10 亿参数 Dense 模型(如 OLMo 1B 或 TinyLlama 1B)相似的推理成本,但需要更多 GPU 内存来存储其 70 亿总参数。我们的实验表明,MoE 的训练速度约为同等激活参数量 Dense LM 的约 2 倍。OLMoE-1B-7B 显著优于所有开源 10 亿参数模型,并在推理成本和内存存储显著更高的 Dense 模型上展现了具有竞争力的性能(例如 MMLU 分数与 Llama2-13B 相当,后者成本约为其 10 倍)。通过指令微调和偏好优化,我们创建了 OLMoE-1B-7B-Instruct,发现它在常见基准测试(MMLU、GSM8k、HumanEval 等)上超越了多种更大的指令模型,包括 Llama2-13B-Chat、OLMo-7B-Instruct (0724) 和 DeepSeekMoE-16B。</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么选择这些具体参数?
OLMoE-1B-7B 的命名直观地反映了其架构设计:1B 激活参数 / 7B 总参数。这一设计在推理效率(1B 级别)和模型容量(7B 级别)之间取得了平衡。论文后续实验表明,这一配置经过系统性的消融实验验证,在 5T token 的训练规模下是最优选择。</p>
</blockquote>
<p>我们全面的受控实验突出了 MoE 的关键设计选择:</p>
<table>
<thead>
<tr>
<th>设计选择</th>
<th>描述</th>
<th>实验章节</th>
<th>OLMoE-1B-7B 配置</th>
</tr>
</thead>
<tbody><tr>
<td>激活参数量</td>
<td>每个输入 token 激活的参数数量</td>
<td>4.1.1</td>
<td>1.3B 激活</td>
</tr>
<tr>
<td>总参数量</td>
<td>模型中的总参数数量</td>
<td>4.1.1</td>
<td>6.9B 总计</td>
</tr>
<tr>
<td>专家粒度</td>
<td>使用细粒度小专家 vs. 少量大专家</td>
<td>4.1.2</td>
<td>64 个小专家,激活 8 个</td>
</tr>
<tr>
<td>专家共享</td>
<td>是否包含共享专家</td>
<td>4.1.3</td>
<td>无共享专家</td>
</tr>
<tr>
<td>路由算法</td>
<td>输入如何分配给专家</td>
<td>4.1.4</td>
<td>无丢弃(dropless)的 Token Choice MoE</td>
</tr>
<tr>
<td>稀疏上循环</td>
<td>是否从 Dense 模型开始</td>
<td>4.1.5</td>
<td>未使用</td>
</tr>
<tr>
<td>负载均衡损失</td>
<td>惩罚专家分配不均的辅助损失</td>
<td>4.1.6</td>
<td>使用,权重 0.01</td>
</tr>
<tr>
<td>Router Z-loss</td>
<td>惩罚路由大 logit 的辅助损失</td>
<td>4.1.7</td>
<td>使用,权重 0.001</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[技术细节]</strong> 路由的核心公式
MoE 模块的核心计算公式如下:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MoE module</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mtext>Top-</mtext><mi>k</mi><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></munder><mrow><mi mathvariant="normal">s</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">m</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">x</mi></mrow><msub><mrow><mo fence="true">(</mo><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mi>i</mi></msub><msub><mi>E</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{MoE module}(x) = \\sum_{i \\in \\text{Top-}k(r(x))} \\mathrm{softmax} \\left( r(x) \\right)_i E_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">MoE module</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.566em;vertical-align:-1.516em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">Top-</span></span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">))</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.516em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathrm">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>r</mi></mrow><annotation encoding="application/x-tex">r</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span></span></span> 为学习得到的路由器(Router),将输入映射到选定的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个专家;对每个选中的专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,其输出与对应的路由概率相乘,最后对所有选中的 Top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 专家结果求和,得到该层的输出。训练总损失为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="script">L</mi><mo>=</mo><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">CE</mtext></msub><mo>+</mo><mi>α</mi><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub><mo>+</mo><mi>β</mi><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">RZ</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L} = \\mathcal{L}_{\\textit{CE}} + \\alpha \\mathcal{L}_{\\textit{LB}} + \\beta \\mathcal{L}_{\\textit{RZ}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">CE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">RZ</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">CE</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{CE}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">CE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为交叉熵损失,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{LB}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为负载均衡损失,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">RZ</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{RZ}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">RZ</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为 Router Z-loss,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi><mo>=</mo><mn>0.001</mn></mrow><annotation encoding="application/x-tex">\\beta=0.001</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.001</span></span></span></span>。</p>
</blockquote>
<p>关键发现包括:</p>
<ul>
<li><strong>细粒度路由</strong>:使用 64 个小专家,每层激活 8 个,是实现高性能的关键决策。</li>
<li><strong>Token Choice 路由</strong>:无丢弃(dropless)的 Token Choice 路由优于 Expert Choice 路由。</li>
<li><strong>挑战既有工作</strong>:共享专家无效;稀疏上循环仅在较小计算预算下有限受益。</li>
<li><strong>路由行为分析</strong>:路由在预训练早期即饱和;专家很少共激活;专家表现出领域和词汇专业化。</li>
</ul>
<p>我们希望完全开源的 MoE 能促进更多研究和分析,以改进我们对这些模型的理解。我们发布的训练代码、中间Checkpoint(每 5000 步)、训练日志和训练数据均采用开源许可证(Apache 2.0 或 ODC-By 1.0)。</p>
<hr>
<h2 id="2-yxlysp">2 预训练与适配</h2>
<h3 id="2-1-yxljg">2.1 预训练架构</h3>
<p>OLMoE 是一个Encoder-Only(Decoder-only)的 Transformer 模型,由 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>L</mi></msub></mrow><annotation encoding="application/x-tex">N_L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 层组成。Dense 模型(如 OLMo)中的前馈网络(Feed-Forward Network, FFN)被替换为 MoE 模块,该模块由 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>E</mi></msub></mrow><annotation encoding="application/x-tex">N_E</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 个较小的 FFN 模块(称为「专家」)组成,对每个输入 token 仅激活 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个专家子集。</p>
<p>关键架构参数总结:</p>
<ul>
<li><strong>激活参数</strong>:1.3B (每个输入 token)</li>
<li><strong>总参数</strong>:6.9B</li>
<li><strong>层数</strong>:16</li>
<li><strong>模型维度</strong>:2,048</li>
<li><strong>FFN 维度</strong>:1,024 (每个专家)</li>
<li><strong>注意力头数</strong>:16</li>
<li><strong>专家总数</strong>:64 (每层)</li>
<li><strong>激活专家数</strong>:8 (每层)</li>
<li><strong>序列长度</strong>:4,096</li>
<li><strong>词表大小</strong>:50,304</li>
<li><strong>位置编码</strong>:RoPE (旋转位置编码),<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi><mo>=</mo><mn>10,000</mn></mrow><annotation encoding="application/x-tex">\\theta=10{,}000</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">10</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">000</span></span></span></span></li>
<li><strong>激活函数</strong>:SwiGLU</li>
<li><strong>归一化</strong>:RMSNorm (带参数)</li>
<li><strong>QK-Norm</strong>:是</li>
<li><strong>初始化</strong>:截断正态分布,std=0.02,截断至 3 倍 std</li>
<li><strong>权重绑定</strong>:否</li>
</ul>
<blockquote>
<p><strong>[技术细节]</strong> 为什么使用 64 个专家?
论文在 4.1.2 节通过系统性实验验证了专家粒度的影响。使用 8 个专家(激活 1 个)时,每层仅有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>8</mn><mn>1</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">\\binom{8}{1}=8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span> 种组合;将专家数量增至 32(激活 4 个),组合数暴增至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>32</mn><mn>4</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>35,960</mn></mrow><annotation encoding="application/x-tex">\\binom{32}{4}=35{,}960</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">32</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">35</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">960</span></span></span></span>,HellaSwag 和 MMLU 提升约 10%;进一步增至 64(激活 8 个),组合数达到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>64</mn><mn>8</mn></mfrac><mo fence="true">)</mo></mrow><mo>≈</mo><mn>44</mn></mrow><annotation encoding="application/x-tex">\\binom{64}{8}\\approx 44</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">64</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">44</span></span></span></span> 亿,但下游指标仅再提升 1-2%。考虑到计算预算的边际收益递减,最终选择 64 个专家。</p>
</blockquote>
<h3 id="2-2-yxlsj">2.2 预训练数据</h3>
<p>我们从 DCLM 和 Dolma 1.7 混合数据,包括:</p>
<ol>
<li><strong>DCLM-Baseline</strong>:经过质量过滤的 Common Crawl 子集</li>
<li><strong>StarCoder</strong>:代码数据</li>
<li><strong>Algebraic Stack</strong>:数学证明代码</li>
<li><strong>arXiv</strong>:学术论文</li>
<li><strong>peS2o</strong>:STEM 论文</li>
<li><strong>OpenWebMath</strong>:数学网页</li>
<li><strong>English Wikipedia &amp; Wikibooks</strong>:百科全书式文本</li>
</ol>
<p>我们称此预训练数据集为 <strong>OLMoE-Mix</strong>,总计约 4.06 万亿 token (GPT-NeoX tokenizer)。</p>
<blockquote>
<p><strong>[实验分析]</strong> 数据清洗策略
我们对所有数据源应用了一个过滤器,移除包含 32 个或更多重复 n-gram 的文档(n-gram 长度为 1-13 个 token)。对于 StarCoder 子集,还额外移除以下文档:GitHub 仓库星数少于 2 的文档;最频繁单词占文档超过 30% 的文档;前两个最频繁单词合计占文档超过 50% 的文档。</p>
</blockquote>
<p>数据组成统计:</p>
<table>
<thead>
<tr>
<th>来源</th>
<th>文档类型</th>
<th>GPT-NeoX Token (B)</th>
<th>词数 (B)</th>
<th>UTF-8 字节 (GB)</th>
<th>文档数 (M)</th>
</tr>
</thead>
<tbody><tr>
<td>DCLM-Baseline</td>
<td>网页</td>
<td>3,860</td>
<td>3,380</td>
<td>16,700</td>
<td>2,950</td>
</tr>
<tr>
<td>StarCoder</td>
<td>代码</td>
<td>101</td>
<td>63.9</td>
<td>325</td>
<td>78.7</td>
</tr>
<tr>
<td>peS2o</td>
<td>STEM 论文</td>
<td>57.2</td>
<td>51.3</td>
<td>268</td>
<td>38.8</td>
</tr>
<tr>
<td>arXiv</td>
<td>STEM 论文</td>
<td>21.1</td>
<td>23.5</td>
<td>88.8</td>
<td>1.55</td>
</tr>
<tr>
<td>OpenWebMath</td>
<td>数学网页</td>
<td>12.7</td>
<td>10.2</td>
<td>42.4</td>
<td>2.91</td>
</tr>
<tr>
<td>Algebraic Stack</td>
<td>数学证明代码</td>
<td>12.6</td>
<td>9.6</td>
<td>39.3</td>
<td>2.83</td>
</tr>
<tr>
<td>Wikipedia &amp; Wikibooks</td>
<td>百科全书</td>
<td>3.69</td>
<td>3.16</td>
<td>16.2</td>
<td>6.17</td>
</tr>
<tr>
<td><strong>合计</strong></td>
<td></td>
<td><strong>4,060</strong></td>
<td><strong>3,530</strong></td>
<td><strong>17,400</strong></td>
<td><strong>3,080</strong></td>
</tr>
</tbody></table>
<p>训练流程:</p>
<ul>
<li><strong>总训练 token</strong>:5.133T (约 1.3 个 epoch)</li>
<li><strong>每轮开始时随机打乱</strong></li>
<li><strong>退火阶段</strong>:最后 100B token,重新打乱数据集后线性衰减学习率至 0</li>
</ul>
<h3 id="2-3-sp">2.3 适配</h3>
<p>我们通过标准的<strong>指令微调</strong>(Supervised Fine-Tuning, SFT)和<strong>偏好优化</strong>(Direct Preference Optimization, DPO)对预训练模型进行适配。</p>
<p>适配数据集:</p>
<table>
<thead>
<tr>
<th>来源</th>
<th>领域</th>
<th>样本数</th>
</tr>
</thead>
<tbody><tr>
<td><strong>指令微调</strong></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Tulu 2 SFT Mix</td>
<td>综合</td>
<td>326,154</td>
</tr>
<tr>
<td>No Robots</td>
<td>综合</td>
<td>9,500</td>
</tr>
<tr>
<td>CodeFeedback-Filtered-Instruction</td>
<td>代码</td>
<td>156,526</td>
</tr>
<tr>
<td>MetaMathQA</td>
<td>数学</td>
<td>98,750</td>
</tr>
<tr>
<td>Daring Anteater (高级非对话子集)</td>
<td>综合</td>
<td>17,082</td>
</tr>
<tr>
<td><strong>偏好优化 (DPO)</strong></td>
<td></td>
<td></td>
</tr>
<tr>
<td>UltraFeedback (二值化并过滤 TruthfulQA 污染)</td>
<td>综合</td>
<td>60,800</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[对齐与影响]</strong> 适配策略的设计逻辑
在指令微调数据集中,我们增加了更多代码和数学数据,以提升下游代码和数学应用性能。其他模型(如 GPT-4 和 Llama 3)也在预训练阶段包含了 GSM8k 或 MATH 等数学数据集。我们同时纳入 No Robots 和 Daring Anteater 子集,因为它们质量高且增加了多样性——这是成功适配的两个关键因素。</p>
</blockquote>
<hr>
<h2 id="3-syjg">3 实验结果</h2>
<p>我们的评估流程包含三个部分:<strong>预训练期间</strong>、<strong>预训练后</strong>和<strong>适配后</strong>。</p>
<h3 id="3-1-yxlqjpg">3.1 预训练期间评估</h3>
<p>在预训练期间,我们在常用下游任务上对 OLMoE-1B-7B 与当前最优 OLMo 模型进行基准测试。结果显示,在所有任务上,OLMoE-1B-7B 以更少的计算量(FLOPs)达到了更好的性能。尽管使用的训练 FLOPs 不到 OLMo-7B 的一半且仅使用 1B 激活参数,OLMoE-1B-7B 在训练结束时匹配或超越了 OLMo-7B。这得益于我们对 OLMo 设置所做的数据集和建模改进,包括 MoE 相关变更、稳定性和性能改进。</p>
<p>训练和验证损失曲线在 5T token 的预训练过程中非常平滑,没有出现重大损失尖峰。</p>
<h3 id="3-2-yxlhpg">3.2 预训练后评估</h3>
<p>我们将 OLMoE-1B-7B 与常见下游任务上的其他模型进行比较:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>激活参数量</th>
<th>开放数据</th>
<th>MMLU</th>
<th>HellaSwag</th>
<th>ARC-Challenge</th>
<th>ARC-Easy</th>
<th>PIQA</th>
<th>WinoGrande</th>
</tr>
</thead>
<tbody><tr>
<td><strong>~7-9B 激活参数的 LMs</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Llama2-7B</td>
<td>6.7B</td>
<td>否</td>
<td>46.2</td>
<td>78.9</td>
<td>54.2</td>
<td>84.0</td>
<td>77.5</td>
<td>71.7</td>
</tr>
<tr>
<td>OLMo-7B (0724)</td>
<td>6.9B</td>
<td>是</td>
<td>54.9</td>
<td>80.5</td>
<td>68.0</td>
<td>85.7</td>
<td>79.3</td>
<td>73.2</td>
</tr>
<tr>
<td>Mistral-7B</td>
<td>7.3B</td>
<td>否</td>
<td>64.0</td>
<td>83.0</td>
<td>78.6</td>
<td>90.8</td>
<td>82.8</td>
<td>77.9</td>
</tr>
<tr>
<td>DCLM-7B</td>
<td>6.9B</td>
<td>是</td>
<td>64.4</td>
<td>82.3</td>
<td>79.8</td>
<td>92.3</td>
<td>80.1</td>
<td>77.3</td>
</tr>
<tr>
<td>Llama3.1-8B</td>
<td>8.0B</td>
<td>否</td>
<td>66.9</td>
<td>81.6</td>
<td>79.5</td>
<td>91.7</td>
<td>81.1</td>
<td>76.6</td>
</tr>
<tr>
<td>Gemma2-9B</td>
<td>9.2B</td>
<td>否</td>
<td><strong>70.6</strong></td>
<td><strong>87.3</strong></td>
<td><strong>89.5</strong></td>
<td><strong>95.5</strong></td>
<td><strong>86.1</strong></td>
<td><strong>78.8</strong></td>
</tr>
<tr>
<td><strong>~2-3B 激活参数的 LMs</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>OpenMoE-3B-9B</td>
<td>2.6B</td>
<td>是</td>
<td>27.4</td>
<td>44.4</td>
<td>29.3</td>
<td>50.6</td>
<td>63.3</td>
<td>51.9</td>
</tr>
<tr>
<td>StableLM-2B</td>
<td>1.6B</td>
<td>否</td>
<td>40.4</td>
<td>70.3</td>
<td>50.6</td>
<td>75.3</td>
<td>75.6</td>
<td>65.8</td>
</tr>
<tr>
<td>DeepSeek-3B-16B</td>
<td>2.9B</td>
<td>否</td>
<td>45.5</td>
<td>80.4</td>
<td>53.4</td>
<td>82.7</td>
<td>80.1</td>
<td><strong>73.2</strong></td>
</tr>
<tr>
<td>JetMoE-2B-9B</td>
<td>2.2B</td>
<td>否</td>
<td>49.1</td>
<td><strong>81.7</strong></td>
<td>61.4</td>
<td>81.9</td>
<td>80.3</td>
<td>70.7</td>
</tr>
<tr>
<td>Gemma2-3B</td>
<td>2.6B</td>
<td>否</td>
<td>53.3</td>
<td>74.6</td>
<td>67.5</td>
<td>84.3</td>
<td>78.5</td>
<td>71.8</td>
</tr>
<tr>
<td>Qwen1.5-3B-14B</td>
<td>2.7B</td>
<td>否</td>
<td><strong>62.4</strong></td>
<td>80.0</td>
<td><strong>77.4</strong></td>
<td><strong>91.6</strong></td>
<td><strong>81.0</strong></td>
<td>72.3</td>
</tr>
<tr>
<td><strong>~1B 激活参数的 LMs</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Pythia-1B</td>
<td>1.1B</td>
<td>是</td>
<td>31.1</td>
<td>48.0</td>
<td>31.4</td>
<td>63.4</td>
<td>68.9</td>
<td>52.7</td>
</tr>
<tr>
<td>OLMo-1B (0724)</td>
<td>1.3B</td>
<td>是</td>
<td>32.1</td>
<td>67.5</td>
<td>36.4</td>
<td>53.5</td>
<td>74.0</td>
<td>62.9</td>
</tr>
<tr>
<td>TinyLlama-1B</td>
<td>1.1B</td>
<td>是</td>
<td>33.6</td>
<td>60.8</td>
<td>38.1</td>
<td>69.5</td>
<td>71.7</td>
<td>60.1</td>
</tr>
<tr>
<td>Llama3.2-1B</td>
<td>1.2B</td>
<td>否</td>
<td>38.2</td>
<td>67.3</td>
<td>43.5</td>
<td>71.6</td>
<td>73.7</td>
<td>62.5</td>
</tr>
<tr>
<td>DCLM-1B</td>
<td>1.4B</td>
<td>是</td>
<td>48.5</td>
<td>75.1</td>
<td>57.6</td>
<td>79.5</td>
<td>76.6</td>
<td>68.1</td>
</tr>
<tr>
<td><strong>OLMoE-1B-7B</strong></td>
<td><strong>1.3B</strong></td>
<td><strong>是</strong></td>
<td><strong>54.1</strong></td>
<td><strong>80.0</strong></td>
<td><strong>62.1</strong></td>
<td><strong>84.2</strong></td>
<td><strong>79.8</strong></td>
<td><strong>70.2</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[实验分析]</strong> 成本-性能权衡
OLMoE-1B-7B 在使用少于 2B 激活参数的模型中表现最优,使其成为许多 LM 应用场景中最经济的选择。尽管每次前向传播的计算量约为某些 7B Dense 模型的 6-7 倍少,OLMoE-1B-7B 仍超越了部分 7B Dense 模型(如 Llama2-7B),但略逊于其他模型(如 Llama3.1-8B)。这验证了 MoE 架构在「以小博大」方面的核心价值。</p>
</blockquote>
<h3 id="3-3-sphpg">3.3 适配后评估</h3>
<p>我们对 OLMoE-1B-7B 进行指令微调(SFT)和偏好优化(DPO),结果如下:</p>
<table>
<thead>
<tr>
<th>任务</th>
<th>MMLU</th>
<th>GSM8k</th>
<th>BBH</th>
<th>HumanEval</th>
<th>AlpacaEval 1.0</th>
<th>XSTest</th>
<th>IFEval</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>设置</td>
<td>0-shot EM</td>
<td>8-shot CoT EM</td>
<td>3-shot EM</td>
<td>0-shot Pass@10</td>
<td>0-shot %win</td>
<td>0-shot F1</td>
<td>0-shot Loose Acc</td>
<td></td>
</tr>
<tr>
<td><strong>OLMo-1B (0724)</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>基线</td>
<td>25.0</td>
<td>7.0</td>
<td>22.5</td>
<td>16.0</td>
<td>-</td>
<td>67.6</td>
<td>20.5</td>
<td>-</td>
</tr>
<tr>
<td>+SFT</td>
<td>36.0</td>
<td>12.5</td>
<td>27.2</td>
<td>21.2</td>
<td>41.5</td>
<td>81.9</td>
<td>26.1</td>
<td>35.9</td>
</tr>
<tr>
<td>+DPO</td>
<td>36.7</td>
<td>12.5</td>
<td>30.6</td>
<td>22.0</td>
<td>50.9</td>
<td>79.8</td>
<td>24.2</td>
<td>37.4</td>
</tr>
<tr>
<td><strong>OLMo-7B (0724)</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>基线</td>
<td>50.8</td>
<td>32.5</td>
<td>36.9</td>
<td>32.3</td>
<td>-</td>
<td>80.8</td>
<td>19.6</td>
<td>-</td>
</tr>
<tr>
<td>+SFT</td>
<td>54.2</td>
<td>25.0</td>
<td>35.7</td>
<td>38.5</td>
<td>70.9</td>
<td>86.1</td>
<td>39.7</td>
<td>49.3</td>
</tr>
<tr>
<td>+DPO</td>
<td>52.8</td>
<td>9.0</td>
<td>16.6</td>
<td>35.0</td>
<td>83.5</td>
<td><strong>87.5</strong></td>
<td>37.9</td>
<td>49.1</td>
</tr>
<tr>
<td><strong>JetMoE-2B-9B</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>+SFT</td>
<td>46.1</td>
<td>53.5</td>
<td>35.6</td>
<td>64.8</td>
<td>69.3</td>
<td>55.6</td>
<td>30.5</td>
<td>50.4</td>
</tr>
<tr>
<td><strong>DeepSeek-3B-16B</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>+Chat</td>
<td>48.5</td>
<td>46.5</td>
<td><strong>40.8</strong></td>
<td><strong>70.1</strong></td>
<td>74.8</td>
<td>85.6</td>
<td>32.3</td>
<td>57.0</td>
</tr>
<tr>
<td><strong>Qwen1.5-3B-14B</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>+Chat</td>
<td>58.9</td>
<td><strong>55.5</strong></td>
<td>21.3</td>
<td>59.7</td>
<td>83.9</td>
<td>85.6</td>
<td>36.2</td>
<td>57.3</td>
</tr>
<tr>
<td><strong>OLMoE-1B-7B</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>基线</td>
<td>49.8</td>
<td>3.0</td>
<td>33.6</td>
<td>22.4</td>
<td>-</td>
<td>59.7</td>
<td>16.6</td>
<td>-</td>
</tr>
<tr>
<td>+SFT</td>
<td>51.4</td>
<td>40.5</td>
<td>38.0</td>
<td>51.6</td>
<td>69.2</td>
<td>84.1</td>
<td>43.3</td>
<td>54.0</td>
</tr>
<tr>
<td><strong>+DPO</strong></td>
<td><strong>51.9</strong></td>
<td><strong>45.5</strong></td>
<td>37.0</td>
<td>54.8</td>
<td><strong>84.0</strong></td>
<td>82.6</td>
<td><strong>48.1</strong></td>
<td><strong>57.7</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[对齐与影响]</strong> SFT 带来 &gt;10 倍的 GSM8k 提升
SFT 在所有测评任务上都改善了模型表现。特别值得注意的是 GSM8k 上超过 10 倍的提升(从 3.0 到 40.5),这主要得益于我们在适配阶段纳入了额外的数学数据,以补偿预训练阶段相对较少的数学数据量。DPO 在大多数任务上进一步帮助提升,尤其是 AlpacaEval——这与先前工作的发现一致。OLMoE-1B-7B-Instruct (DPO) 的平均分在所有基准模型中最高,尽管 Qwen1.5-3B-14B 的预训练模型在表 3.2 中表现优于 OLMoE-1B-7B。AlpacaEval 84% 的分数也超越了排行榜上的许多更大 Dense 模型,如 Llama2-13B-Chat。</p>
</blockquote>
<hr>
<h2 id="4-tdsjxzdsy">4 替代设计选择的实验</h2>
<p>本节呈现通向 OLMoE-1B-7B 的预训练和适配实验。我们将其分为 MoE 专属设置实验、适用于 Dense 和 MoE 的通用设置实验,以及适配实验。在预训练实验中,我们常使用 MMLU Var——一个 MMLU 的变体,使用变化的 few-shot 和不同格式,在训练早期提供更多信号。</p>
<h3 id="4-1-moe-zsyxlsz">4.1 MoE 专属预训练设置</h3>
<h4 id="4-1-1-moe-vs-dense">4.1.1 MoE vs. Dense</h4>
<blockquote>
<p><strong>[设计动机]</strong> MoE 到底能省多少?
先前工作报告了 MoE 相对于 Dense 模型的各种加速比:2-4 倍 FLOP 节省(Arteaxe et al.)、2.6 倍(MoMa)、4 倍(Arctic)、2-7 倍(Switch Transformers)。但这些结果来自不同的模型配置和架构(Encoder-Decoder vs. Encoder-Only)。我们需要在受控设置下直接比较。</p>
</blockquote>
<p>我们在受控设置下比较 MoE 和 Dense 模型:训练一个 1.3B 参数 Dense 模型和一个 1.3B 激活 / 6.9B 总参数的 MoE 模型,各在 128 块 H100 GPU 上训练 130B token。MoE 每层包含 64 个专家,激活 8 个,FFN 维度为 1,024;Dense 模型的 FFN 维度为 8,192。两者激活参数量相同。</p>
<p>实验结果:</p>
<ul>
<li><strong>Token/FLOP 效率</strong>:MoE 以约 3 倍少的 token 达到 Dense 的最终性能。</li>
<li><strong>训练时间效率</strong>:由于 MoE 7B 总参数的额外内存开销,MoE 处理 token 的速度较慢(MoE 每 GPU 23,600 token/s vs. Dense 37,500 token/s)。因此按训练时间计算,MoE 约 2 倍快于 Dense。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 为何时间加速只有 2 倍而非 3 倍?
内存开销导致 MoE 的吞吐量为 Dense 的约 63%。未来优化可能将时间加速提升到接近 token 加速的 3 倍。基于这些结果,我们选择了 6.9B 总参数 / 1.3B 激活参数的 MoE 配置——总参数量匹配 OLMo-7B,激活参数量匹配 OLMo-1B。</p>
</blockquote>
<h4 id="4-1-2-zjld">4.1.2 专家粒度</h4>
<blockquote>
<p><strong>[设计动机]</strong> 专家应该多大?
DeepSeekMoE 提出使用小而细粒度的专家,以允许更多专家组合,从而使模型更灵活。例如 Mixtral 使用 8 个专家(激活 2 个),每层仅有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>8</mn><mn>2</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>28</mn></mrow><annotation encoding="application/x-tex">\\binom{8}{2}=28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">28</span></span></span></span> 种组合。如果将专家大小减半、数量翻倍,组合数可增至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>16</mn><mn>4</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>1,820</mn></mrow><annotation encoding="application/x-tex">\\binom{16}{4}=1{,}820</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">16</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">820</span></span></span></span>。</p>
</blockquote>
<p>我们在保持激活和总参数量及计算成本不变的前提下,改变专家数量与 FFN 维度。例如,64 个专家时 FFN 维度为 1,024、激活 8 个;32 个专家时 FFN 维度为 2,048、激活 4 个。</p>
<p>实验发现:</p>
<ul>
<li><strong>更细粒度的专家改善性能</strong>:8 专家配置(激活 1 个,8 种组合)增至 32 专家(激活 4 个,35,960 种组合)时,130B token 处 HellaSwag 和 MMLU 提升约 10%。</li>
<li><strong>收益递减</strong>:进一步增至 64 专家(激活 8 个,约 44 亿种组合),下游指标仅再提升 1-2%。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 为什么没有选更多专家?
对于我们的计算预算(约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mn>22</mn></msup></mrow><annotation encoding="application/x-tex">3\\times 10^{22}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">22</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs),Krajewski et al. 预测最优专家数为 256。但他们的预测针对计算最优模型,而我们训练了 5T token——远超传统意义上对模型尺寸的最优值。因此他们的预测可能不适用于我们的设置。鉴于收益递减,我们最终选择 64 个专家。</p>
</blockquote>
<h4 id="4-1-3-gxzj">4.1.3 共享专家</h4>
<blockquote>
<p><strong>[设计动机]</strong> DeepSeekMoE 的共享专家思路
DeepSeekMoE 提出训练一个共享/固定专家,始终在使用中,同时配合其他路由专家。直觉是鼓励共享专家学习通用信息,让其他路由专家学习更专业化的知识,从而减少专家间的冗余。</p>
</blockquote>
<p>我们比较了「1 个共享专家 + 31 个路由专家(激活 3 个)」vs.「32 个路由专家(激活 4 个)」的设置。两者激活和总参数量相同。</p>
<p>实验发现:</p>
<ul>
<li>两者性能相近,但共享专家略差。</li>
<li>共享专家减少了模型的灵活性:32 路由专家有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>32</mn><mn>4</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>35,960</mn></mrow><annotation encoding="application/x-tex">\\binom{32}{4}=35{,}960</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">4</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">32</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">35</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">960</span></span></span></span> 种组合,而 31 路由 + 1 共享仅有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mn>31</mn><mn>3</mn></mfrac><mo fence="true">)</mo></mrow><mo>=</mo><mn>4,495</mn></mrow><annotation encoding="application/x-tex">\\binom{31}{3}=4{,}495</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2451em;vertical-align:-0.35em;"></span><span class="mord"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8951em;"><span style="top:-2.355em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.144em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">31</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">4</span><span class="mord"><span class="mpunct">,</span></span><span class="mord">495</span></span></span></span> 种组合——减少了近 90% 的可能组合。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 共享专家为什么不好?
共享专家的潜在好处(隔离通用知识)被其引入的灵活性损失所抵消。这反而支持了 4.1.2 节的发现:允许更多专家组合能改善性能。我们不使用共享专家,但我们认为让某些专家更频繁激活(甚至始终激活)的想法有价值——只是不应该强制共享,而应该让模型自己学习这种行为。当前的负载均衡损失(4.1.6)限制了这种灵活性,因为强制所有专家均匀使用。未来工作可以探索移除负载均衡损失以允许更灵活的专家使用。</p>
</blockquote>
<h4 id="4-1-4-expert-choice-vs-token-choice">4.1.4 Expert Choice vs. Token Choice</h4>
<blockquote>
<p><strong>[技术细节]</strong> 两种路由范式的核心差异</p>
<ul>
<li><strong>Expert Choice (EC)</strong>:每个专家从输入序列中选择固定数量的 token。设计上保证每个专家处理相同数量的 token,实现完美负载均衡。主要缺点:不适用于自回归生成(每次只处理单个 token)。另一个潜在缺点:可能导致 token 被丢弃(未被任何专家选中)。</li>
<li><strong>Token Choice (TC)</strong>:每个输入 token 选择固定数量的专家。可能导致许多 token 选择同一个专家,损害训练效率。因此常与负载均衡损失联合使用。</li>
</ul>
</blockquote>
<p>实验发现:</p>
<ul>
<li>TC 在相同 token 预算下对所有展示的任务均优于 EC。</li>
<li>EC 运行速度约快 20%(每设备 29,400 token/s vs. TC 24,400 token/s)。</li>
<li>EC 在多模态设置中可能更有益,因为丢弃噪声图像 token 的损害小于丢弃文本 token。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 为什么我们选 TC?
我们的 TC 配置使用无丢弃(dropless)MoE 配合负载均衡损失,因此预期性能优于 Zhou et al. 的 TC 变体。虽然 EC 速度更快,但我们为本次发布的 OLMoE 坚持使用 TC,未来多模态模型可能重新考虑 EC。</p>
</blockquote>
<h4 id="4-1-5-xssxh-sparse-upcycling">4.1.5 稀疏上循环 (Sparse Upcycling)</h4>
<blockquote>
<p><strong>[设计动机]</strong> 能否从 Dense 模型「改造」出 MoE?
Komatsuzaki et al. 提出通过稀疏上循环将 Dense 模型转换为 MoE:(1)将 Dense MLP 克隆为每个目标专家;(2)在每个 MoE 层前添加新初始化的路由器;(3)继续预训练,使克隆的 MLP 逐渐专业化,路由器得以学习。他们发现上循环方法在原始 Dense Checkpoint计算预算的 120% 以内保持性能优势。</p>
</blockquote>
<p>我们将 OLMo-1B (0724) 在 2T token 处上循环为 MoE(8 个专家,激活 2 个),再训练 610B token;与从头训练同等配置 610B token 的 MoE 比较。</p>
<p>实验发现:</p>
<ul>
<li>500B token 后,从头训练的 MoE 已追上上循环模型。</li>
<li>约 600B token 处,从头训练的 MoE 开始超越上循环模型。</li>
<li>因此仅需原始 Dense 模型计算预算的 25%(而非先前报告的 120%)即可追上。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 上循环的局限
上循环的 MoE 受限于 Dense 模型的一些超参数。具体而言,OLMo-1B (0724) 训练时未使用 QK-Norm 和截断正态初始化,而这两者在我们的实验中都对稳定性至关重要。虽然可以像新路由器层一样从头训练新的 QK-Norm,但不可能改变原始 Dense 模型的初始化。因此,当我们希望改变这些超参数并计划训练 OLMoE-1B-7B 约 250% 原始计算预算时,从头训练更为合适。上循环的主要优势在于节省初期计算:如果计算预算较小,上循环可能仍有价值。</p>
</blockquote>
<h4 id="4-1-6-fzjhss">4.1.6 负载均衡损失</h4>
<blockquote>
<p><strong>[技术细节]</strong> 负载均衡损失的公式
负载均衡损失 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{LB}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 惩罚模型如果不均衡,即如果将所有 token 路由到仅少数几个专家:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">LB</mtext></msub><mo>=</mo><msub><mi>N</mi><mi>E</mi></msub><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>N</mi><mi>E</mi></msub></munderover><msub><mi>f</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{LB}} = N_E \\cdot \\sum_{i=1}^{N_E} f_i \\cdot P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">LB</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.1173em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8396em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3113em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">f_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为路由到专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的 token 比例,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为分配给 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的总路由概率。损失进一步乘以专家数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>E</mi></msub></mrow><annotation encoding="application/x-tex">N_E</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和损失权重 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> (通常设为 0.01)。</p>
</blockquote>
<p>实验发现:</p>
<ul>
<li>使用负载均衡损失在所有指标上均带来更好性能,即使仅在几 B token 后。</li>
<li>不使用 LBL 时,最初第一层所有 token 都被分配到第 6 个专家。最终模型虽开始将部分 token 分配给第 1 个专家,但其他专家基本未被使用——成为「死权重」。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 为什么必须保留 LBL?
不使用负载均衡损失会导致大多数专家成为死权重,占用 GPU 内存却不被使用。因此我们对最终模型使用权重 0.01 的辅助负载均衡损失。然而,摆脱负载均衡损失是未来研究的重要方向,因为它通过强制所有专家大致均等地使用,限制了模型的灵活性,可能阻止专家在特定数据领域专业化——这或许也是先前工作未能发现强有力专家专业化证据的原因。</p>
</blockquote>
<h4 id="4-1-7-router-z-loss">4.1.7 Router Z-loss</h4>
<blockquote>
<p><strong>[技术细节]</strong> Router Z-loss 的公式
Router Z-loss 惩罚进入门控网络的大 logit,这类大 logit 可能导致 MoE 层大矩阵乘法中的数值溢出:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext mathvariant="italic">RZ</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>B</mi></mfrac><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>B</mi></munderover><msup><mrow><mo fence="true">(</mo><mi>log</mi><mo>⁡</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>N</mi><mi>E</mi></msub></munderover><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msubsup><mi>x</mi><mi>j</mi><mrow><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo></mrow></msubsup><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\textit{RZ}}(x) = \\frac{1}{B} \\cdot \\sum_{i=1}^B \\left( \\log \\sum_{j=1}^{N_E} \\exp({x_j^{(i)}}) \\right)^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord textit mtight">RZ</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.4574em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8396em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3113em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.413em;"><span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:2.0436em;"><span style="top:-4.2925em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span>
<p>损失进一步乘以可选权重 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> (通常设为 0.001)。</p>
</blockquote>
<p>实验发现:</p>
<ul>
<li>添加 Router Z-loss 在训练损失、验证损失和下游性能上均改善了稳定性和质量(更少尖峰、更低损失、更高下游性能)。</li>
<li>吞吐量降低约 2%。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> Z-loss 是「稳」的基础
尽管 Router Z-loss 降低约 2% 的吞吐量,我们仍对 OLMoE-1B-7B 使用权重 0.001 的 Router Z-loss。这一损失对 MoE 训练的稳定性至关重要,尤其在低精度训练环境下。</p>
</blockquote>
<h3 id="4-2-tyyxlsz">4.2 通用预训练设置</h3>
<h4 id="4-2-1-sjjsy">4.2.1 数据集实验</h4>
<p>Li et al. 发布的 DCLM-Baseline 数据集被证明在 MMLU 等常见基准上优于 Dolma 1.7 和其他数据集。这促使我们将 DCLM 与 Dolma 1.7 中我们认为高质量的部分组件混合(见 2.2)。</p>
<p>实验发现:OLMoE-Mix 在所有三个下游指标上均带来明确提升,尤其是 MMLU。DCLM-Baseline 通过一系列针对 MMLU 和其他下游指标的数据集消融创建,解释了这些结果。</p>
<blockquote>
<p><strong>[实验分析]</strong> 为什么没有加 Reddit 和 FLAN?
我们还尝试在混合中添加 Reddit 和 FLAN,但未发现一致的性能提升。我们没有强烈的直觉解释为何添加这些数据集没有帮助,未来迭代可能需要更自动化的数据集混合方法。</p>
</blockquote>
<h4 id="4-2-2-csh">4.2.2 初始化</h4>
<p>先前关于 MoE 的工作很少分享初始化策略。DeepSeekMoE 和 DeepSeekV2 使用 std=0.006 的正态初始化;Dense LMs 通常使用 std=0.02 的正态初始化(Megatron-LM 推广)。</p>
<p>实验发现:</p>
<ul>
<li>截断正态初始化(截断至 3 倍 std)带来更稳定的训练和更好的性能。</li>
<li>差异仅在约 450B token 后才变得明显,此时普通正态初始化开始发散。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 预训练消融的核心挑战
训练数百 B token 后实验才给出明确信号,这是预训练消融的关键挑战之一。我们对最终模型使用截断正态初始化。</p>
</blockquote>
<h4 id="4-2-3-rms-norm">4.2.3 RMSNorm</h4>
<p>OLMo 使用非参数 LayerNorm,主要因为它比常用的 RMSNorm 显著更快。但大多数 LMs(Llama、Gemma、Qwen 家族)使用 RMSNorm。</p>
<p>实验发现:</p>
<ul>
<li>用参数化 RMSNorm 替换 OLMo 的非参数 LayerNorm 带来更好性能。</li>
<li>非参数 LayerNorm 导致梯度出现大量尖峰(见图)。梯度裁剪在 1.0 可防止这些尖峰导致极大参数更新,但被裁剪的梯度可能仍损害模型性能。</li>
<li>RMSNorm 使训练吞吐量降低 15%。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 稳定性优先于速度
尽管 RMSNorm 降低 15% 的吞吐量,我们仍对最终模型使用 RMSNorm。我们还将 RMSNorm 参数纳入权重衰减,发现这略微提升了性能,尽管通常的做法是排除它们。</p>
</blockquote>
<h4 id="4-2-4-sjqrcs">4.2.4 衰减嵌入参数</h4>
<p>与 RMSNorm 参数类似,嵌入参数通常被排除在权重衰减之外。实验发现,是否衰减对性能影响较小,衰减略好。因此为简化,我们对 OLMoE-1B-7B 的所有参数(包括嵌入和 RMSNorm)应用权重衰减。</p>
<h4 id="4-2-5-qk-norm">4.2.5 QK-Norm</h4>
<blockquote>
<p><strong>[技术细节]</strong> QK-Norm 的作用
QK-Norm 在 Query 和 Key 投影后添加层归一化,防止后续注意力操作产生极大 logit,可能导致数值溢出并破坏网络稳定性,尤其在低精度训练时。</p>
</blockquote>
<p>实验发现:</p>
<ul>
<li>QK-Norm 带来一定的稳定性和性能改善。</li>
<li>使用 RMSNorm 时,QK-Norm 仍能略微改善训练损失并防止大梯度范数尖峰。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> QK-Norm 是 OLMoE 稳定性的「双保险」
尽管 QK-Norm 降低近 10% 的吞吐量,我们仍对 OLMoE-1B-7B 使用 QK-Norm。结合 RMSNorm 和截断初始化,QK-Norm 构成了 OLMoE 训练稳定性的三重保障。</p>
</blockquote>
<h4 id="4-2-6-adam-w-epsilon">4.2.6 AdamW Epsilon</h4>
<p>OLMo 使用 AdamW 优化器的 epsilon 值为 1E-05。较大的 eps 导致优化器步长更小但更稳定。</p>
<p>实验发现:将 eps 降至推荐默认值 1E-08 显著改善了性能,同时运行保持稳定。</p>
<blockquote>
<p><strong>[实验分析]</strong> 小 epsilon,大收益
这是一个令人惊讶的发现:简单地将 AdamW epsilon 从 1E-05 降至 1E-08,在没有稳定性损失的情况下带来了显著性能提升。这提醒我们,即使是看似次要的优化器超参数,也可能对大规模预训练产生重大影响。</p>
</blockquote>
<h3 id="4-3-spsz">4.3 适配设置</h3>
<p>我们对适配阶段的小型设计选择进行了实验:</p>
<p><strong>辅助损失</strong>:Zoph et al. 发现在常规微调中使用辅助负载均衡损失带来小幅度性能提升。Shen et al. 在指令微调中未发现使用负载均衡或 Router Z-loss 的确定性证据。我们的实验(见下表)发现,<strong>不使用负载均衡损失</strong>在适配阶段表现更好(SFT 后 54.0 vs. 52.8,DPO 后 57.7 vs. 57.1)。测量 SFT 数据上的负载均衡损失发现,它实际上在 SFT 期间略微下降(12.16 vs. 12.22)——因为某些 token 路由到哪些专家在预训练早期就已确定(见 5.1 节)。</p>
<p><strong>退火Checkpoint</strong>:使用退火后Checkpoint比退火前Checkpoint表现更好(SFT 后 54.0 vs. 53.8,DPO 后 57.7 vs. 56.3)。</p>
<p><strong>偏好算法</strong>:我们实验了 KTO,发现它与 DPO 在我们的设置中表现相当(均为 57.7)。虽然两者都发布,但我们为最终 OLMoE-1B-7B-Instruct 模型使用 DPO,因为它在 AlpacaEval 上得分更高(该基准数据污染风险更小)。</p>
<table>
<thead>
<tr>
<th>配置</th>
<th>MMLU</th>
<th>GSM8k</th>
<th>BBH</th>
<th>HumanEval</th>
<th>AlpacaEval</th>
<th>XSTest</th>
<th>IFEval</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>w/o annealing +SFT</td>
<td>50.2</td>
<td>43.0</td>
<td>35.6</td>
<td>55.5</td>
<td>68.9</td>
<td>83.8</td>
<td>39.7</td>
<td>53.8</td>
</tr>
<tr>
<td>w/o annealing +DPO</td>
<td>50.9</td>
<td>36.0</td>
<td>35.8</td>
<td><strong>58.8</strong></td>
<td>81.7</td>
<td>83.2</td>
<td>47.9</td>
<td>56.3</td>
</tr>
<tr>
<td><strong>基线 +SFT</strong></td>
<td>51.4</td>
<td>40.5</td>
<td>38.0</td>
<td>51.6</td>
<td>69.2</td>
<td>84.1</td>
<td>43.3</td>
<td>54.0</td>
</tr>
<tr>
<td><strong>基线 +DPO</strong></td>
<td><strong>51.9</strong></td>
<td><strong>45.5</strong></td>
<td>37.0</td>
<td>54.8</td>
<td><strong>84.0</strong></td>
<td>82.6</td>
<td><strong>48.1</strong></td>
<td><strong>57.7</strong></td>
</tr>
<tr>
<td>基线 +KTO</td>
<td>51.2</td>
<td><strong>45.5</strong></td>
<td>34.1</td>
<td>57.1</td>
<td>81.6</td>
<td><strong>86.6</strong></td>
<td>47.5</td>
<td><strong>57.7</strong></td>
</tr>
<tr>
<td>+SFT (LBL)</td>
<td>50.9</td>
<td>36.5</td>
<td>35.7</td>
<td>52.4</td>
<td>66.9</td>
<td>84.8</td>
<td>42.3</td>
<td>52.8</td>
</tr>
<tr>
<td>+DPO (LBL)</td>
<td>51.1</td>
<td>42.5</td>
<td><strong>39.3</strong></td>
<td>55.6</td>
<td>82.9</td>
<td>82.1</td>
<td>46.0</td>
<td>57.1</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-moe-sdfx">5 MoE 深度分析</h2>
<p>通过推进开放且成本高效的模型,OLMoE-1B-7B 使 LM 和 MoE 的新研究成为可能。利用我们发布的中间Checkpoint、数据和代码,我们定义并分析了 MoE 的四种特性:路由饱和、专家共激活、领域专业化和词汇专业化。</p>
<h3 id="5-1-lybh-router-saturation">5.1 路由饱和 (Router Saturation)</h3>
<blockquote>
<p><strong>[设计动机]</strong> 路由器何时「定型」?
我们希望了解路由器权重在预训练过程中何时停止学习——即中间Checkpoint的路由行为与最终Checkpoint有多接近。</p>
</blockquote>
<p>我们定义路由饱和为:在某个中间时间 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的Checkpoint上,与最终Checkpoint <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi></mrow><annotation encoding="application/x-tex">T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span> 相比,激活的专家 ID 匹配的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Router Saturation</mtext><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>N</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></munderover><mfrac><mrow><mi mathvariant="normal">∣</mi><msubsup><mi mathvariant="script">E</mi><mi>i</mi><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>∩</mo><msubsup><mi mathvariant="script">E</mi><mi>i</mi><mrow><mo stretchy="false">(</mo><mi>T</mi><mo stretchy="false">)</mo></mrow></msubsup><mi mathvariant="normal">∣</mi></mrow><mi>k</mi></mfrac></mrow><annotation encoding="application/x-tex">\\text{Router Saturation}(t) = \\frac{1}{N} \\sum_{i=1}^{N} \\frac{|\\mathcal{E}_{i}^{(t)} \\cap \\mathcal{E}_{i}^{(T)}|}{k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Router Saturation</span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.7218em;"><span style="top:-2.3588em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.2748em;"><span class="pstrut" style="height:3.0448em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7218em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord">∣</span><span class="mord"><span class="mord mathcal" style="margin-right:0.0894em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0894em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∩</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0894em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0894em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mord">∣</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 为数据集中 token 总数,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 为每个输入 token 激活的专家数,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi mathvariant="script">E</mi><mi>i</mi><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup></mrow><annotation encoding="application/x-tex">\\mathcal{E}_{i}^{(t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.3217em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0894em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0894em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 为第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 个Checkpoint第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个 token 激活的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个专家集合。</p>
<p>对于 OLMoE-1B-7B 的 64 个专家,随机路由的饱和值为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mn>64</mn><mo>=</mo><mn>1.6</mn><mi mathvariant="normal">%</mi></mrow><annotation encoding="application/x-tex">1/64=1.6\\%</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/64</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8056em;vertical-align:-0.0556em;"></span><span class="mord">1.6%</span></span></span></span> (k=1) 或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi mathvariant="normal">/</mi><mn>64</mn><mo>=</mo><mn>12.5</mn><mi mathvariant="normal">%</mi></mrow><annotation encoding="application/x-tex">8/64=12.5\\%</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">8/64</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8056em;vertical-align:-0.0556em;"></span><span class="mord">12.5%</span></span></span></span> (k=8)。</p>
<p>实验发现:</p>
<ul>
<li><strong>预训练 1% 后</strong>(5,000 步或 20B token),Top-8 专家的路由已有约 60% 饱和。</li>
<li><strong>预训练 40% 后</strong>,饱和达到约 80%。</li>
<li><strong>Top-1 专家(概率最高的专家)饱和更慢</strong>。</li>
<li><strong>靠后的层饱和更早</strong>。第 0 层是异常值,饱和显著慢于其他层。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 第一层为什么特殊?
DeepSeekMoE 在第一层不使用 MoE,因为他们发现第一层的负载均衡收敛更慢。这与我们的饱和发现相关:因为第一层的路由饱和更慢,某些输入数据路由到的专家频繁变化。这些变化可能导致某个专家突然获得显著更多的数据,从而损害负载均衡。这为未来研究第一层的行为提供了开放问题。</p>
</blockquote>
<h3 id="5-2-zjgjh-expert-co-activation">5.2 专家共激活 (Expert Co-activation)</h3>
<blockquote>
<p><strong>[设计动机]</strong> 专家之间是否存在冗余?
如果多个专家对被频繁同时激活,可能表明这些专家可以合并,从而受益于更少的分离专家。在分布式设置中,也可以将高度共激活的专家放在同一设备上以减少推理通信成本。</p>
</blockquote>
<p>我们定义专家共激活为:两个特定专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">E_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 同时被激活的次数占其中一个专家总激活次数的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Expert co-activation</mtext><mo stretchy="false">(</mo><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>E</mi><mi>j</mi></msub><mo stretchy="false">)</mo><mo>=</mo><mfrac><msub><mi>N</mi><mrow><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>E</mi><mi>j</mi></msub></mrow></msub><msub><mi>N</mi><msub><mi>E</mi><mi>i</mi></msub></msub></mfrac></mrow><annotation encoding="application/x-tex">\\text{Expert co-activation}(E_i, E_j) = \\frac{N_{E_i, E_j}}{N_{E_i}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Expert co-activation</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3568em;vertical-align:-0.9361em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4207em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7373em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3473em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9361em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>100% 表示如果 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 被激活,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">E_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 也始终被激活;0% 表示两者从不共现。</p>
<p>实验发现:</p>
<ul>
<li><strong>同一层内专家共激活较弱</strong>,只有少数例外。</li>
<li>这可能表明不同专家之间冗余较少。</li>
<li>第 7 层和第 15 层显示了相似的共激活模式,有几组 3 个或 2 个专家倾向于一起被激活。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 共激活弱 = 冗余少?
同一层内缺乏强共激活表明专家功能互补而非冗余,支持了每个专家学习不同知识的假设。少数共激活组(如第 7 层的专家 48 和 23 共激活 60%)在 5.4 节的词汇分析中得到了进一步解释——它们都处理连接词(如 Then、Therefore)。</p>
</blockquote>
<h3 id="5-3-lyzyh-domain-specialization">5.3 领域专业化 (Domain Specialization)</h3>
<blockquote>
<p><strong>[设计动机]</strong> 不同领域的 token 是否被路由到不同的专家?
我们定义领域专业化为:来自特定领域 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span> 的 token 被路由到特定专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Domain specialization</mtext><mo stretchy="false">(</mo><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><mi>D</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><msubsup><mi>N</mi><mrow><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><mi>D</mi></mrow><mrow><mo stretchy="false">(</mo><mi>k</mi><mo stretchy="false">)</mo></mrow></msubsup><msub><mi>N</mi><mi>D</mi></msub></mfrac></mrow><annotation encoding="application/x-tex">\\text{Domain specialization}(E_i, D) = \\frac{N_{E_i, D}^{(k)}}{N_D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Domain specialization</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7004em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-2.3588em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.2748em;"><span class="pstrut" style="height:3.0448em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.8644em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4065em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4296em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span>
<p>100% 表示该领域所有数据都路由到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>;0% 表示该领域从不使用该专家。</p>
</blockquote>
<p>实验发现(OLMoE-1B-7B vs. Mixtral-8x7B):</p>
<p><strong>OLMoE-1B-7B</strong>:</p>
<ul>
<li>许多专家在<strong>特定领域</strong>的激活显著高于或低于随机概率。</li>
<li>例如,arXiv(大量科学文本)在第 0 层的第一个专家几乎 100% 专业化。</li>
<li>GitHub 和 arXiv 在第 7 层经常一起激活。</li>
<li>对于<strong>通用领域</strong>(如 C4,包含各种数据的网页爬取),专家激活更均衡,说明负载均衡有效。</li>
</ul>
<p><strong>Mixtral-8x7B</strong>:</p>
<ul>
<li>在独特和通用领域均显示<strong>很少的领域专业化</strong>。</li>
<li>专家激活接近均匀路由基线。</li>
<li>专家之间可能存在更多冗余。</li>
</ul>
<blockquote>
<p><strong>[实验分析]</strong> 为什么 Mixtral 没有领域专业化?
我们假设这是因为 Mixtral 从 Mistral 上循环而来。从 Dense 模型初始化可能限制了专家可能的专门化程度,因为它们都从相同的局部最优开始。这解释了为什么从头训练最终在上循环实验中表现更好(4.1.5 节)。OLMoE-1B-7B 的领域专业化证明了我们的训练方法成功地让不同专家学习不同类型的知识。</p>
</blockquote>
<h3 id="5-4-chzyh-vocabulary-specialization">5.4 词汇专业化 (Vocabulary Specialization)</h3>
<blockquote>
<p><strong>[设计动机]</strong> 专家是否专门处理特定词汇?
我们定义词汇专业化为:具有特定 token ID <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 的 token 被路由到特定专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Vocabulary specialization</mtext><mo stretchy="false">(</mo><msub><mi>E</mi><mi>i</mi></msub><mo separator="true">,</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><msubsup><mi>N</mi><mrow><mi>x</mi><mo separator="true">,</mo><msub><mi>E</mi><mi>i</mi></msub></mrow><mrow><mo stretchy="false">(</mo><mi>k</mi><mo stretchy="false">)</mo></mrow></msubsup><msub><mi>N</mi><mi>x</mi></msub></mfrac></mrow><annotation encoding="application/x-tex">\\text{Vocabulary specialization}(E_i, x) = \\frac{N_{x, E_i}^{(k)}}{N_x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Vocabulary specialization</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7004em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-2.3588em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.2748em;"><span class="pstrut" style="height:3.0448em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.8644em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4065em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4296em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span>
<p>我们区分输入和输出变体:<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 可以是输入 token ID 或下一个输出 token ID(真实下一个 token 或模型预测的 token)。</p>
</blockquote>
<p>实验发现:</p>
<ul>
<li><strong>靠后的层词汇专业化更高</strong>,与靠后的层饱和更早的发现一致(5.1 节)。</li>
<li><strong>靠后的层更专注于预测的输出 token ID 而非输入 token ID</strong>——路由更多由模型即将预测的 token 决定,而非原始输入 token。这符合直觉:在较早层,模型对预测哪个 token 的不确定性更大。</li>
</ul>
<p>一些典型专家的词汇专业化示例(第 7 层):</p>
<table>
<thead>
<tr>
<th>专家 ID</th>
<th>输入 token 专业化</th>
<th>输出 token 专业化</th>
</tr>
</thead>
<tbody><tr>
<td>27</td>
<td>非字母 token(版权符号、拉丁字母、梵文字母、西里尔字母)100%</td>
<td>斯洛伐克字母、版权符号、波斯语、日语等 100%</td>
</tr>
<tr>
<td>58</td>
<td>标点符号和括号类 token(如 \`\`(&quot;、&#39;&quot;、&#39;(&#39;) 87-100%</td>
<td>连接词(such、see、which、driving)88-100%</td>
</tr>
<tr>
<td>7</td>
<td>宗教相关 token(Him、Jesus、God、pray、Quran)65-100%</td>
<td>宗教相关词汇(sin、prince、glory、Jesus、Lord)50-94%</td>
</tr>
<tr>
<td>43</td>
<td>地理/国家相关(Armenian、Iraq、Iranian、Saudi、Turkey)86-100%</td>
<td>地理相关(invasion、Arabia、regions、border、Korea)52-90%</td>
</tr>
<tr>
<td>4</td>
<td>测量单位(sq、YR、GHz、cm、pixels)41-90%</td>
<td>测量/科学术语(Character、fluence、pixels、arc)50-90%</td>
</tr>
<tr>
<td>0</td>
<td>医药/广告相关(ESM、pills、mg、pharmacy、generic)68-100%</td>
<td>医药相关(pills、pharmacy、gener、mg)66-100%</td>
</tr>
<tr>
<td>3</td>
<td>家庭关系(grandmother、brother、daughter、wife、husband)62-92%</td>
<td>家庭相关(hood、mother、boy、girl、married)14-36%</td>
</tr>
<tr>
<td>23</td>
<td>连接词/标点(Therefore、So、And、But、!!、.&quot;) 38-55%</td>
<td>政治/专有名词(Republican、Democratic、Jack、So)33-53%</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[实验分析]</strong> 词汇专业化的深层含义
这些发现揭示了 OLMoE-1B-7B 专家的高度专业化:</p>
<ul>
<li>专家 27 专门处理非拉丁字母系统,反映了对多语言 token 的专门处理。</li>
<li>专家 58 处理标点符号的输入,但预测连接词输出——可能是「语法结构专家」。</li>
<li>专家 7 和 43 分别专门化于宗教和地理领域,与 5.3 节的领域专业化一致。</li>
<li>专家 4 专注于测量单位,与 arXiv 和 GitHub 数据的领域专业化对应(科学论文和代码中常见测量)。</li>
<li>专家 3 专注于家庭关系词汇,这与它在书籍数据上的高激活一致(5.3 节)。</li>
<li>专家 48 和 23 都处理连接词,解释了它们之间 60% 的高共激活(5.2 节)。</li>
</ul>
</blockquote>
<hr>
<h2 id="6-xggz">6 相关工作</h2>
<h3 id="moe-jz">MoE 进展</h3>
<p>当前 LMs 仍主要遵循 Transformer 架构,只有少数架构变更被广泛采用,如Encoder-Only训练、SwiGLU 激活、RoPE、MQA/GQA 和 RMSNorm。通过 MoE 实现模型稀疏性仍是积极探索中的方向,虽然已有一定早期采用,但大多数 LMs(包括 Llama 3)仍依赖 Dense 架构。</p>
<p>自稀疏门控 MoE 层引入以来,在以下方面取得了大量进展:</p>
<ul>
<li><strong>新路由技术</strong>:BASE Layers、Hash Layers、Taming Sparsity、Soft Merging 等</li>
<li><strong>细粒度专家切分</strong>:DeepSeekMoE、Mixture of a Million Experts 等</li>
<li><strong>稳定性改进</strong>:ST-MoE 的 Router Z-loss 等</li>
<li><strong>效率改进</strong>:GShard、DeepSpeed-MoE、GLaM 等</li>
</ul>
<h3 id="kf-lms">开放 LMs</h3>
<p>模型家族的开放程度通常按是否提供模型权重分类:</p>
<ul>
<li><strong>闭源权重</strong>:GPT、Gemini、PaLM、Reka 等</li>
<li><strong>开源权重</strong>:Llama、Mistral、Gemma、Falcon、MPT、Qwen、GLM、Yi、DeepSeek、Nemotron、Phi、StableLM、OPT 等</li>
</ul>
<p>然而,除了模型权重外,训练数据和代码对于科学研究和大范围分发利益至关重要。仅有少数发布同时包含数据和代码,我们称之为「完全开源」:</p>
<ul>
<li><strong>BLOOM</strong>:发布权重、数据、代码</li>
<li><strong>OLMo 系列</strong>:本工作的前身,发布权重、数据、代码、日志</li>
<li><strong>DCLM</strong>:发布数据和代码</li>
<li><strong>LLM360</strong>:发布权重、数据、代码、日志</li>
<li><strong>Pythia、TinyLlama</strong>:发布权重和部分训练细节</li>
</ul>
<blockquote>
<p><strong>[对齐与影响]</strong> OLMoE 的开放程度
在 MoE 领域,OLMoE 之前的「最开放」模型 JetMoE 和 OpenMoE 也未提及初始化方案。OLMoE 不仅开源了权重和数据,还开源了每 5000 步的中间Checkpoint、完整的 Weights &amp; Biases 训练日志、以及所有消融实验的详细配置。这使得 OLMoE 成为当时最开放的 MoE 模型,为社区研究 MoE 的路由行为、专家专业化等内部机制提供了前所未有的透明度。</p>
</blockquote>
<hr>
<h2 id="7-jl">7 结论</h2>
<p>我们开源了 OLMoE-1B-7B 和 OLMoE-1B-7B-Instruct,包括模型、数据、代码和日志。在 1B 激活 / 7B 总参数下,我们的模型在具有相似激活参数量的模型中实现了最先进的性能,甚至超越了更大的模型,包括 DeepSeekMoE-16B 和 Llama2-13B-Chat。</p>
<p>我们分享了各种训练实验,并定义和分析了模型的路由饱和、专家共激活、领域和词汇专业化。通过完全开源发布,我们寻求帮助领域构建更好的 MoE。我们期待 OLMoE 的更多迭代,以缩小前沿模型与完全开源模型之间的差距。</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-xlpz">A 训练配置</h3>
<h4 id="yxlccs">预训练超参数</h4>
<table>
<thead>
<tr>
<th>参数</th>
<th>OLMoE-1B-7B</th>
<th>JetMoE</th>
<th>OpenMoE</th>
<th>OLMo-1B (0724)</th>
</tr>
</thead>
<tbody><tr>
<td>维度</td>
<td>2,048</td>
<td>2,048</td>
<td>2,048</td>
<td>2,048</td>
</tr>
<tr>
<td>激活函数</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
</tr>
<tr>
<td>FFN 维度</td>
<td>1,024</td>
<td>5,632</td>
<td>8,192</td>
<td>8,192</td>
</tr>
<tr>
<td>词表大小</td>
<td>50,304</td>
<td>32,000</td>
<td>256,384</td>
<td>50,304</td>
</tr>
<tr>
<td>注意力头数</td>
<td>16</td>
<td>16</td>
<td>24</td>
<td>16</td>
</tr>
<tr>
<td>层数</td>
<td>16</td>
<td>24</td>
<td>32</td>
<td>16</td>
</tr>
<tr>
<td>归一化类型</td>
<td>RMSNorm</td>
<td>RMSNorm</td>
<td>RMSNorm</td>
<td>非参数</td>
</tr>
<tr>
<td>QK-Norm</td>
<td>是</td>
<td>否</td>
<td>否</td>
<td>否</td>
</tr>
<tr>
<td>位置编码</td>
<td>RoPE</td>
<td>RoPE</td>
<td>RoPE</td>
<td>RoPE</td>
</tr>
<tr>
<td>RoPE <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span></td>
<td>10,000</td>
<td>10,000</td>
<td>10,000</td>
<td>10,000</td>
</tr>
<tr>
<td>权重绑定</td>
<td>否</td>
<td>是</td>
<td>否</td>
<td>否</td>
</tr>
<tr>
<td>初始化分布</td>
<td>截断正态</td>
<td>?</td>
<td>?</td>
<td>正态</td>
</tr>
<tr>
<td>初始化 std</td>
<td>0.02</td>
<td>0.02</td>
<td>变化</td>
<td>变化</td>
</tr>
<tr>
<td>MoE 层</td>
<td>每层</td>
<td>每层</td>
<td>每 6 层</td>
<td>-</td>
</tr>
<tr>
<td>专家数</td>
<td>64</td>
<td>8</td>
<td>32</td>
<td>1</td>
</tr>
<tr>
<td>激活专家数</td>
<td>8</td>
<td>2</td>
<td>2</td>
<td>1</td>
</tr>
<tr>
<td>词表参数量</td>
<td>103M</td>
<td>66M</td>
<td>525M</td>
<td>103M</td>
</tr>
<tr>
<td>激活参数量</td>
<td>1.3B</td>
<td>2.2B</td>
<td>2.6B</td>
<td>1.3B</td>
</tr>
<tr>
<td>总参数量</td>
<td>6.9B</td>
<td>8.5B</td>
<td>8.7B</td>
<td>1.3B</td>
</tr>
<tr>
<td>序列长度</td>
<td>4,096</td>
<td>4,096</td>
<td>2,048</td>
<td>4,096</td>
</tr>
<tr>
<td>Batch size (样本)</td>
<td>1,024</td>
<td>1,024</td>
<td>2,048</td>
<td>512</td>
</tr>
<tr>
<td>Batch size (token)</td>
<td>~4M</td>
<td>~4M</td>
<td>~4M</td>
<td>~2M</td>
</tr>
<tr>
<td>Warmup 步数</td>
<td>2,500</td>
<td>2,500</td>
<td>10,000</td>
<td>2,000</td>
</tr>
<tr>
<td>峰值学习率</td>
<td>4.0E-04</td>
<td>5.0E-04</td>
<td>0.01</td>
<td>4.0E-04</td>
</tr>
<tr>
<td>最小学习率</td>
<td>4.0E-05</td>
<td>5.0E-05</td>
<td>-</td>
<td>4.0E-05</td>
</tr>
<tr>
<td>优化器</td>
<td>AdamW</td>
<td>AdamW</td>
<td>Adafactor</td>
<td>AdamW</td>
</tr>
<tr>
<td>权重衰减</td>
<td>0.1</td>
<td>0.1</td>
<td>0.0</td>
<td>0.1</td>
</tr>
<tr>
<td>Beta1</td>
<td>0.9</td>
<td>?</td>
<td>0.9</td>
<td>0.9</td>
</tr>
<tr>
<td>Beta2</td>
<td>0.95</td>
<td>?</td>
<td>-</td>
<td>0.95</td>
</tr>
<tr>
<td>AdamW epsilon</td>
<td>1.0E-08</td>
<td>?</td>
<td>-</td>
<td>1.0E-05</td>
</tr>
<tr>
<td>学习率调度</td>
<td>Cosine</td>
<td>WSD</td>
<td>逆平方根</td>
<td>Cosine</td>
</tr>
<tr>
<td>梯度裁剪</td>
<td>Global 1.0</td>
<td>Global 1.0</td>
<td>Global 1.0</td>
<td>Global 1.0</td>
</tr>
<tr>
<td>LBL 权重</td>
<td>0.01</td>
<td>0.01</td>
<td>0.01</td>
<td>-</td>
</tr>
<tr>
<td>Router Z-loss 权重</td>
<td>0.001</td>
<td>0.001</td>
<td>0.0001</td>
<td>-</td>
</tr>
<tr>
<td>预训练 token</td>
<td>5,033B</td>
<td>1,000B</td>
<td>1,100B</td>
<td>2,000B</td>
</tr>
<tr>
<td>退火 token</td>
<td>100B</td>
<td>250B</td>
<td>-</td>
<td>50B</td>
</tr>
</tbody></table>
<h4 id="sppz">适配配置</h4>
<ul>
<li><strong>SFT</strong>:使用 Open Instruct,序列长度 &lt; 4096,BF16,全局 batch size 128(4 节点 x 8 GPU,每设备 batch size 2,2 步梯度累积),2 个 epoch,恒定学习率 2.0E-5,token 级别损失聚合。</li>
<li><strong>DPO</strong>:全局 batch size 32(4 节点 x 8 GPU,每设备 batch size 1),3 个 epoch,学习率 5.0E-7,DPO beta 0.1。</li>
<li><strong>KTO</strong>:与 DPO 相同超参数,但使用 RMSProp 优化器(替代 Adam),1.3 个 epoch(5,000 步)。</li>
</ul>
<h4 id="yj">硬件</h4>
<ul>
<li><strong>预训练</strong>:256 块 H100 GPU,约 10 天,NV-link 跨 GPU 互联,InfiniBand 跨节点互联。</li>
<li><strong>适配</strong>:32 块 H100 GPU,指令微调 33 小时,DPO 偏好优化 14 小时。KTO 适配使用 8 块 H100 GPU,30 小时。</li>
</ul>
<h3 id="b-pgsz">B 评估设置</h3>
<p><strong>预训练期间评估</strong>:在常用下游任务(MMLU、HellaSwag、ARC、PIQA、WinoGrande 等)上评估,使用 OLMES 工具包进行可复现评估。</p>
<p><strong>预训练后评估</strong>:</p>
<ul>
<li>使用 5 few-shot 设置自行运行所有评估。</li>
<li>DCLM 评估:精确遵循作者发布的评估代码,区分「Core」(低方差任务)和「Extended」(heavy 任务)。</li>
</ul>
<p><strong>适配后评估</strong>:</p>
<ul>
<li>MMLU:0-shot,精确匹配(EM)</li>
<li>GSM8k:8-shot CoT,EM</li>
<li>BBH:3-shot,EM</li>
<li>HumanEval:0-shot,Pass@10</li>
<li>AlpacaEval 1.0:0-shot,胜率(%win)</li>
<li>XSTest:0-shot,F1</li>
<li>IFEval:0-shot,宽松准确率(Loose Acc)</li>
</ul>
<hr>
<h2 id="ckwx">参考文献</h2>
<p>主要引用文献(按出现顺序):</p>
<ol>
<li>Shazeer, N., et al. &quot;Outrageously large neural networks: the sparsely-gated mixture-of-experts layer.&quot; arXiv:1701.06538.</li>
<li>Dubey, A., et al. &quot;The Llama 3 herd of models.&quot; arXiv:2407.21783.</li>
<li>DeepSeek-AI. &quot;DeepSeek-V2: A strong, economical, and efficient mixture-of-experts language model.&quot; arXiv:2406.01952.</li>
<li>Jiang, A.Q., et al. &quot;Mixtral of experts.&quot; arXiv:2401.04088.</li>
<li>Groeneveld, D., et al. &quot;OLMo: Accelerating the science of language models.&quot; ACL 2024 / arXiv:2402.00838.</li>
<li>Li, Y., et al. &quot;DataComp-LM: In search of the next generation of training sets for language models.&quot; arXiv:2406.11794.</li>
<li>Soldaini, L., et al. &quot;Dolma: an open corpus of three trillion tokens for language model pretraining research.&quot; arXiv:2402.00159.</li>
<li>Dai, D., et al. &quot;DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models.&quot; arXiv:2401.06066.</li>
<li>Gale, T., et al. &quot;Megablocks: Efficient sparse training with mixture-of-experts.&quot; MLSys 2023.</li>
<li>Zhou, Y., et al. &quot;Mixture-of-experts with expert choice routing.&quot; NeurIPS 2022.</li>
<li>Zoph, B., et al. &quot;ST-MoE: Designing stable and transferable sparse expert models.&quot; arXiv:2202.08906.</li>
<li>Zhang, S., et al. &quot;OPT: Open pre-trained transformer language models.&quot; arXiv:2205.01068.</li>
<li>Rafailov, R., et al. &quot;Direct preference optimization: Your language model is secretly a reward model.&quot; NeurIPS 2023.</li>
<li>Ivison, H., et al. &quot;Camels in a changing climate: Advancing model adaptation with Tulu 2.&quot; arXiv:2311.09601.</li>
<li>Wang, Y., et al. &quot;Far: A generalization bound for multi-task learning based on algorithmic stability.&quot; 2023.</li>
<li>Hendrycks, D., et al. &quot;Measuring massive multitask language understanding.&quot; ICLR 2021.</li>
<li>Kaplan, J., et al. &quot;Scaling laws for neural language models.&quot; arXiv:2001.08361.</li>
<li>Hoffmann, J., et al. &quot;Training compute-optimal large language models.&quot; NeurIPS 2022.</li>
<li>Komatsuzaki, A., et al. &quot;Sparse upcycling: Training mixture-of-experts from dense checkpoints.&quot; ICLR 2023.</li>
<li>Krajewski, J., et al. &quot;Scaling laws for fine-grained mixture of experts.&quot; arXiv:2402.07871.</li>
<li>Kingma, D.P., &amp; Ba, J. &quot;Adam: A method for stochastic optimization.&quot; ICLR 2015.</li>
<li>Loshchilov, I., &amp; Hutter, F. &quot;Decoupled weight decay regularization.&quot; ICLR 2019.</li>
<li>Rajbhandari, S., et al. &quot;ZeRO: Memory optimizations toward training trillion parameter models.&quot; SC 2020.</li>
<li>Su, J., et al. &quot;RoFormer: Enhanced transformer with rotary position embedding.&quot; Neurocomputing 2024.</li>
</ol>
<hr>
<h2 id="tbsy">图表索引</h2>
<table>
<thead>
<tr>
<th>图号</th>
<th>文件名</th>
<th>描述</th>
</tr>
</thead>
<tbody><tr>
<td>图 1</td>
<td>fig-overview.pdf</td>
<td>开放 MoE 和 Dense LM 的性能、成本和开放程度对比</td>
</tr>
<tr>
<td>图 2</td>
<td>fig-architecture.pdf</td>
<td>Dense LM 与 MoE 模型架构对比</td>
</tr>
<tr>
<td>图 3</td>
<td>fig-moe-vs-dense.pdf</td>
<td>MoE vs. Dense: token/FLOP 效率和训练时间效率</td>
</tr>
<tr>
<td>图 4</td>
<td>fig-granularity.pdf</td>
<td>专家粒度消融实验</td>
</tr>
<tr>
<td>图 5</td>
<td>fig-domain-spec.pdf</td>
<td>OLMoE 与 Mixtral 的领域专业化对比</td>
</tr>
<tr>
<td>图 6</td>
<td>fig-saturation.pdf</td>
<td>路由饱和在预训练过程中的变化</td>
</tr>
</tbody></table>
<hr>
<p><em>本文档由 Kimi 基于 OLMoE 原始论文(arXiv:2409.02060 / ICLR 2025)逐句翻译并整理。翻译遵循「忠实原文、术语精确、中文可读」原则。所有技术公式、表格数据均来自原始论文。</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-yxlysp","text":"2 预训练与适配"},{"level":3,"id":"2-1-yxljg","text":"2.1 预训练架构"},{"level":3,"id":"2-2-yxlsj","text":"2.2 预训练数据"},{"level":3,"id":"2-3-sp","text":"2.3 适配"},{"level":2,"id":"3-syjg","text":"3 实验结果"},{"level":3,"id":"3-1-yxlqjpg","text":"3.1 预训练期间评估"},{"level":3,"id":"3-2-yxlhpg","text":"3.2 预训练后评估"},{"level":3,"id":"3-3-sphpg","text":"3.3 适配后评估"},{"level":2,"id":"4-tdsjxzdsy","text":"4 替代设计选择的实验"},{"level":3,"id":"4-1-moe-zsyxlsz","text":"4.1 MoE 专属预训练设置"},{"level":4,"id":"4-1-1-moe-vs-dense","text":"4.1.1 MoE vs. Dense"},{"level":4,"id":"4-1-2-zjld","text":"4.1.2 专家粒度"},{"level":4,"id":"4-1-3-gxzj","text":"4.1.3 共享专家"},{"level":4,"id":"4-1-4-expert-choice-vs-token-choice","text":"4.1.4 Expert Choice vs. Token Choice"},{"level":4,"id":"4-1-5-xssxh-sparse-upcycling","text":"4.1.5 稀疏上循环 (Sparse Upcycling)"},{"level":4,"id":"4-1-6-fzjhss","text":"4.1.6 负载均衡损失"},{"level":4,"id":"4-1-7-router-z-loss","text":"4.1.7 Router Z-loss"},{"level":3,"id":"4-2-tyyxlsz","text":"4.2 通用预训练设置"},{"level":4,"id":"4-2-1-sjjsy","text":"4.2.1 数据集实验"},{"level":4,"id":"4-2-2-csh","text":"4.2.2 初始化"},{"level":4,"id":"4-2-3-rms-norm","text":"4.2.3 RMSNorm"},{"level":4,"id":"4-2-4-sjqrcs","text":"4.2.4 衰减嵌入参数"},{"level":4,"id":"4-2-5-qk-norm","text":"4.2.5 QK-Norm"},{"level":4,"id":"4-2-6-adam-w-epsilon","text":"4.2.6 AdamW Epsilon"},{"level":3,"id":"4-3-spsz","text":"4.3 适配设置"},{"level":2,"id":"5-moe-sdfx","text":"5 MoE 深度分析"},{"level":3,"id":"5-1-lybh-router-saturation","text":"5.1 路由饱和 (Router Saturation)"},{"level":3,"id":"5-2-zjgjh-expert-co-activation","text":"5.2 专家共激活 (Expert Co-activation)"},{"level":3,"id":"5-3-lyzyh-domain-specialization","text":"5.3 领域专业化 (Domain Specialization)"},{"level":3,"id":"5-4-chzyh-vocabulary-specialization","text":"5.4 词汇专业化 (Vocabulary Specialization)"},{"level":2,"id":"6-xggz","text":"6 相关工作"},{"level":3,"id":"moe-jz","text":"MoE 进展"},{"level":3,"id":"kf-lms","text":"开放 LMs"},{"level":2,"id":"7-jl","text":"7 结论"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-xlpz","text":"A 训练配置"},{"level":4,"id":"yxlccs","text":"预训练超参数"},{"level":4,"id":"sppz","text":"适配配置"},{"level":4,"id":"yj","text":"硬件"},{"level":3,"id":"b-pgsz","text":"B 评估设置"},{"level":2,"id":"ckwx","text":"参考文献"},{"level":2,"id":"tbsy","text":"图表索引"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/03-olmo-3/01-ol-mo-e-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/03-olmo-3/01-ol-mo-e-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMoE: Open Mixture-of-Experts Language Models 技术报告精译</h1>
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
