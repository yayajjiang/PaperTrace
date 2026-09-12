"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ABAB 国内首个 MoE 大模型的架构探索与工程验证</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 MiniMax 官方博客及 MoE 领域公开文献, 对 abab 系列最核心的技术贡献——国内首个基于 MoE 架构的通用大语言模型——进行系统性技术剖析. 重点分析其架构选择动机、训练工程实践、长上下文验证, 以及从 abab 到 MiniMax-01 的技术演进脉络.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsmyz-moe">1 设计动机: 为什么押注 MoE</h2>
<h3 id="1-1-2024-ncdhybj">1.1 2024 年初的行业背景</h3>
<p>abab 6 发布于 2024 年 1 月, 是国内首个基于 MoE 架构的通用大语言模型. 当时行业的主流认知是:</p>
<ul>
<li><strong>Dense 架构仍是主流</strong>: GPT-3.5、Llama-2、ChatGLM2 等均采用 Dense 架构.</li>
<li><strong>MoE 存在质疑</strong>: 业界对 MoE 的质疑主要集中在&quot;专家负载不均衡&quot;&quot;通信开销大&quot;&quot;训练不稳定&quot;等方面.</li>
<li><strong>GPT-4 的 MoE 未公开</strong>: 虽然业界推测 GPT-4 采用 MoE, 但 OpenAI 从未确认, 也没有公开技术细节可供参考.</li>
</ul>
<p>在这样的背景下, MiniMax 选择将&quot;80% 以上的精力&quot;投入 MoE 架构研发, 是一个具有显著前瞻性的技术决策.</p>
<h3 id="1-2-mini-max-djspd">1.2 MiniMax 的技术判断</h3>
<p>MiniMax 押注 MoE 的核心判断包括:</p>
<p><strong>判断一: 稀疏激活是 Scaling Laws 的下一站</strong></p>
<ul>
<li>Dense 架构的参数量增长受限于推理成本和训练稳定性.</li>
<li>MoE 通过稀疏激活, 可以在保持推理成本可控的同时, 大幅增加模型总容量.</li>
<li>这一判断在 2024-2025 年得到验证: Mixtral、DeepSeek-V2、Qwen2.5-MoE 等主流模型均采用 MoE.</li>
</ul>
<p><strong>判断二: 中文场景更适合 MoE</strong></p>
<ul>
<li>中文语言的语义复杂性和多义性, 需要更大容量的模型来充分学习.</li>
<li>MoE 的专家专业化分工, 可以更好地适应中文的多样化任务(古文理解、现代文生成、代码、数学等).</li>
</ul>
<p><strong>判断三: 工程能力可以克服 MoE 的已知问题</strong></p>
<ul>
<li>MiniMax 创始团队来自商汤科技, 在分布式训练和大规模系统方面有丰富经验.</li>
<li>团队相信通过精细的工程优化(路由算法改进、通信优化、负载均衡策略), 可以解决 MoE 的负载不均衡和训练不稳定问题.</li>
</ul>
<blockquote>
<p>这里值得停下来想一下. MiniMax 在 2024 年 1 月选择 MoE, 比 Mixtral 8x7B 的发布(2023 年 12 月)仅晚一个月, 几乎同期. 这意味着 MiniMax 的 MoE 决策是独立做出的, 而非跟随 Mixtral 的脚步. 这一点很重要: 它表明 MiniMax 的技术团队具备独立判断能力, 能够在行业共识形成之前就识别出关键趋势. 这种前瞻性在后续的 Lightning Attention(2025)布局中再次得到验证.</p>
</blockquote>
<hr>
<h2 id="2-yltd-abab-6-d-moe-jgsj">2 原理推导: abab 6 的 MoE 架构设计</h2>
<h3 id="2-1-moe-cdjbjz">2.1 MoE 层的基本机制</h3>
<p>abab 6 采用标准的 MoE 层设计, 其核心机制可以表示为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>y</mi><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><mi>G</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></munder><mi>G</mi><mo stretchy="false">(</mo><mi>x</mi><msub><mo stretchy="false">)</mo><mi>i</mi></msub><mo>⋅</mo><msub><mi>E</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">y = \\sum_{i \\in \\text{TopK}(G(x))} G(x)_i \\cdot E_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.566em;vertical-align:-1.516em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">TopK</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">G</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">))</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.516em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">G</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span><p>其中:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 为输入 token 的隐藏状态</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">G(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">G</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span> 为门控网络(router)的输出, 表示各专家的路由权重</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">E_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span> 为第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个专家网络(通常是前馈网络 FFN)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>TopK</mtext></mrow><annotation encoding="application/x-tex">\\text{TopK}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">TopK</span></span></span></span></span> 为选择 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个专家的函数</li>
</ul>
<p><strong>关键超参数</strong>(基于公开信息推测):</p>
<ul>
<li>专家总数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>: 未公开, 推测在 32~128 之间.</li>
<li>激活专家数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span>: 未公开, 推测为 2~8.</li>
<li>每个专家的参数量: 未公开.</li>
</ul>
<h3 id="2-2-fzjhcl">2.2 负载均衡策略</h3>
<p>MoE 训练中的核心挑战是<strong>负载均衡</strong>: 确保各专家被均匀调用, 避免部分专家过载或闲置.</p>
<p>abab 6 可能采用的负载均衡策略:</p>
<p><strong>辅助损失(Auxiliary Loss)</strong></p>
<ul>
<li>在训练损失中添加辅助项, 惩罚负载不均衡.</li>
<li>常用形式: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>aux</mtext></msub><mo>=</mo><mi>α</mi><mo>⋅</mo><mi>N</mi><mo>⋅</mo><msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></msubsup><msub><mi>f</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{aux}} = \\alpha \\cdot N \\cdot \\sum_{i=1}^{N} f_i \\cdot P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aux</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.2809em;vertical-align:-0.2997em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">f_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的" fraction of tokens routed to this expert"</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">P_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为路由器对专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的平均概率</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 为超参数, 控制辅助损失的权重</li>
</ul>
</li>
<li>目标: 最小化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>aux</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{aux}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aux</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 使得 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>i</mi></msub><mo>≈</mo><msub><mi>P</mi><mi>i</mi></msub><mo>≈</mo><mfrac><mn>1</mn><mi>N</mi></mfrac></mrow><annotation encoding="application/x-tex">f_i \\approx P_i \\approx \\frac{1}{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>.</li>
</ul>
<p><strong>容量因子(Capacity Factor)</strong></p>
<ul>
<li>为每个专家设置容量上限(每个 batch 中可处理的最大 token 数).</li>
<li>超出容量的 token 被&quot;溢出&quot;到备用路径或跳过 MoE 层.</li>
<li>容量因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 的定义: 每个专家的实际容量 = <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mrow><mtext>batch size</mtext><mo>×</mo><mtext>seq length</mtext><mo>×</mo><mi>k</mi></mrow><mi>N</mi></mfrac><mo>×</mo><mi>C</mi></mrow><annotation encoding="application/x-tex">\\frac{\\text{batch size} \\times \\text{seq length} \\times k}{N} \\times C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2772em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4461em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">batch size</span></span><span class="mbin mtight">×</span><span class="mord text mtight"><span class="mord mtight">seq length</span></span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span>.</li>
</ul>
<p><strong>动态路由调整</strong></p>
<ul>
<li>在训练过程中动态监测各专家的负载情况.</li>
<li>对负载过高的专家降低其路由概率, 对负载过低的专家提高概率.</li>
<li>需要谨慎设计调整幅度, 避免引入训练不稳定性.</li>
</ul>
<blockquote>
<p>负载均衡的 trade-off 值得深入思考. 严格的负载均衡(各专家处理相同数量的 token)可以最大化硬件利用率, 但可能牺牲模型质量——因为不同 token 的&quot;难度&quot;不同, 强制均匀分配可能导致简单 token 被分配给强大的专家(浪费能力), 或困难 token 被分配给弱专家(性能下降). 理想的负载均衡应该是&quot;加权均衡&quot;: 让强大的专家处理更多困难 token, 弱专家处理更多简单 token. abab 6 是否实现了这种精细的负载均衡, 由于信息未公开, 无法确认.</p>
</blockquote>
<h3 id="2-3-y-dense-jgdxsdb">2.3 与 Dense 架构的效率对比</h3>
<p>MoE 相比 Dense 架构的核心优势在于<strong>计算效率</strong>:</p>
<p>假设:</p>
<ul>
<li>Dense 模型参数量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>dense</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{dense}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 激活参数量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>dense</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{dense}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.</li>
<li>MoE 模型总参数量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>moe</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{moe}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">moe</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 激活参数量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>active</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{active}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">active</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.</li>
</ul>
<p><strong>推理效率</strong>:</p>
<ul>
<li>Dense: 每次前向传播计算量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>P</mi><mtext>dense</mtext></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(P_{\\text{dense}})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>.</li>
<li>MoE: 每次前向传播计算量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>P</mi><mtext>active</mtext></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(P_{\\text{active}})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">active</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>active</mtext></msub><mo>≪</mo><msub><mi>P</mi><mtext>moe</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{active}} \\ll P_{\\text{moe}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">active</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">moe</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.</li>
<li>如果 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>moe</mtext></msub><mo>=</mo><mn>10</mn><mo>×</mo><msub><mi>P</mi><mtext>dense</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{moe}} = 10 \\times P_{\\text{dense}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">moe</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">10</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 且 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mtext>active</mtext></msub><mo>=</mo><msub><mi>P</mi><mtext>dense</mtext></msub></mrow><annotation encoding="application/x-tex">P_{\\text{active}} = P_{\\text{dense}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">active</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, MoE 以相同的推理成本获得了 10 倍的模型容量.</li>
</ul>
<p><strong>训练效率</strong>:</p>
<ul>
<li>MoE 的训练需要额外的通信开销(All-to-All 通信)和负载均衡计算.</li>
<li>但在大规模集群上, 专家并行可以将通信与计算重叠, 实际训练效率损失可控制在 10-20% 以内.</li>
</ul>
<hr>
<h2 id="3-gcyz-200k-csxwydhlzcs">3 工程验证: 200K 长上下文与大海捞针测试</h2>
<h3 id="3-1-csxwdgctz">3.1 长上下文的工程挑战</h3>
<p>abab 6.5 支持 200K tokens 的上下文长度, 这对 MoE 架构提出了特殊挑战:</p>
<p><strong>KV Cache 膨胀</strong></p>
<ul>
<li>200K 上下文的 KV Cache 可能占据数百 GB 显存.</li>
<li>MoE 架构下, 每个 token 只激活部分专家, 但 KV Cache 仍需要为所有层存储.</li>
<li>需要采用 KV Cache 量化、分页管理、Offloading 等优化手段.</li>
</ul>
<p><strong>注意力计算</strong></p>
<ul>
<li>200K x 200K 的注意力矩阵计算量巨大.</li>
<li>需要采用 FlashAttention、局部注意力、滑动窗口注意力等优化.</li>
<li>MoE 层与注意力层的交互: 专家路由决策需要在注意力计算之前完成, 这增加了流水线的复杂度.</li>
</ul>
<p><strong>序列并行</strong></p>
<ul>
<li>200K 序列长度超出单 GPU 显存容量, 必须采用序列并行.</li>
<li>序列并行下的 All-Gather 和 Reduce-Scatter 通信开销显著.</li>
<li>需要与专家并行的 All-to-All 通信协同优化.</li>
</ul>
<h3 id="3-2-dhlzcsdyzyy">3.2 大海捞针测试的验证意义</h3>
<p>MiniMax 在 200K tokens 范围内进行了 891 次&quot;大海捞针&quot;测试, <strong>全部正确回答</strong>. 这一结果的技术意义:</p>
<p><strong>测试设计</strong>:</p>
<ul>
<li>在超长文本中随机位置插入一个与主题无关的句子(&quot;针&quot;).</li>
<li>提问模型要求找出该句子.</li>
<li>验证模型是否能在长序列中准确定位和检索关键信息.</li>
</ul>
<p><strong>891 次全部正确的解读</strong>:</p>
<ul>
<li>模型在长上下文中的<strong>信息检索能力</strong>是可靠的.</li>
<li>200K 上下文不是&quot;名义参数&quot;, 而是实际可用的能力.</li>
<li>但&quot;大海捞针&quot;只测试了<strong>检索能力</strong>, 未测试<strong>理解能力</strong>(如长文档摘要、跨段落推理).</li>
</ul>
<blockquote>
<p>大海捞针测试的局限性值得注意. 它是一个&quot;有或无&quot;的二元测试: 模型要么找到针, 要么没找到. 但真实场景中的长上下文需求往往更复杂: 需要在长文档中进行多步推理、综合多个段落的信息、识别隐含关联. 891 次全部正确是一个令人印象深刻的工程成就, 但不能等同于模型具备完整的&quot;长上下文理解&quot;能力.</p>
</blockquote>
<hr>
<h2 id="4-c-abab-d-mini-max-01-jslxdyj">4 从 abab 到 MiniMax-01: 技术路线的演进</h2>
<h3 id="4-1-abab-xldlsyc">4.1 abab 系列的历史遗产</h3>
<p>abab 6 / 6.5 为 MiniMax 的后续发展奠定了三个关键基础:</p>
<p><strong>基础一: MoE 工程经验</strong></p>
<ul>
<li>验证了 MoE 架构在中文大模型上的可行性.</li>
<li>积累了万亿参数 MoE 的训练、推理、部署经验.</li>
<li>为后续更大规模的 MoE 模型(MiniMax-01 456B、MiniMax-M1 4.56T)提供了工程基础.</li>
</ul>
<p><strong>基础二: 长上下文工程</strong></p>
<ul>
<li>200K 上下文的实现与验证, 证明了 MiniMax 具备长上下文能力.</li>
<li>为后续 1M 上下文(MiniMax-M1)和 4M 上下文(MiniMax-01 推理)奠定了技术基础.</li>
</ul>
<p><strong>基础三: 多模态探索</strong></p>
<ul>
<li>abab-video-1、abab-music-1、abab-speech-1 的探索, 使 MiniMax 成为最早实现全模态覆盖的中国 AI 公司之一.</li>
<li>多模态数据的处理和训练经验, 为后续统一多模态模型提供了数据基础.</li>
</ul>
<h3 id="4-2-jslxdgjzz">4.2 技术路线的关键转折</h3>
<p>从 abab 到 MiniMax-01, MiniMax 的技术路线经历了关键转折:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">时间</th>
<th align="left">核心架构</th>
<th align="left">上下文长度</th>
<th align="left">关键创新</th>
</tr>
</thead>
<tbody><tr>
<td align="left">abab 6</td>
<td align="left">2024.01</td>
<td align="left">MoE</td>
<td align="left">推测 8K~32K</td>
<td align="left">国内首个 MoE LLM</td>
</tr>
<tr>
<td align="left">abab 6.5</td>
<td align="left">2024.04</td>
<td align="left">MoE</td>
<td align="left">200K</td>
<td align="left">长上下文验证</td>
</tr>
<tr>
<td align="left">MiniMax-01</td>
<td align="left">2025.01</td>
<td align="left">MoE + Lightning Attention</td>
<td align="left">1M 训练 / 4M 推理</td>
<td align="left">Lightning Attention 首次大规模实现</td>
</tr>
<tr>
<td align="left">MiniMax-M1</td>
<td align="left">2025.06</td>
<td align="left">MoE + Hybrid Attention</td>
<td align="left">1M</td>
<td align="left">全球首个开源混合注意力推理模型</td>
</tr>
<tr>
<td align="left">MiniMax-M2.1</td>
<td align="left">2025.12</td>
<td align="left">MoE + Lightning Attention</td>
<td align="left">1M</td>
<td align="left">编程与 Agent 场景优化</td>
</tr>
</tbody></table>
<p><strong>关键转折: 从纯 MoE 到 MoE + 注意力创新</strong></p>
<ul>
<li>abab 时期: 核心叙事是&quot;MoE 架构&quot;, 注意力机制为标准设计.</li>
<li>MiniMax-01 时期: 核心叙事转向&quot;Lightning Attention&quot;, 一种接近线性复杂度的注意力机制.</li>
<li>这一转折反映了 MiniMax 的技术洞察: MoE 解决了&quot;模型容量&quot;问题, 但长上下文下的注意力计算复杂度(O(L^2))成为新的瓶颈. Lightning Attention 将复杂度降至接近 O(L), 使得 4M 上下文成为可能.</li>
</ul>
<blockquote>
<p>从更宏观的视角看, MiniMax 的技术演进路径(abab → MiniMax-01 → M 系列)代表了中国大模型创业的一种典型策略: <strong>先验证核心架构(MoE), 再解决关键瓶颈(注意力复杂度), 最后针对垂直场景优化(编程、Agent)</strong>. 这与 DeepSeek(MLA → MTP → 混合推理)和智谱 AI(GLM → DSA → Agent)的演进逻辑类似, 但每个公司的技术选择和节奏不同.</p>
</blockquote>
<hr>
<h2 id="5-jxxyfx">5 局限性与风险</h2>
<h3 id="5-1-xxplbz">5.1 信息披露不足</h3>
<p>与 Step-2 类似, abab 系列的最大局限也是信息披露不足:</p>
<ul>
<li>未发布独立技术报告或 arXiv 论文.</li>
<li>专家数量、路由机制、负载均衡策略等关键参数未公开.</li>
<li>&quot;接近 GPT-4、Claude-3、Gemini-1.5&quot;的自我评价缺乏第三方独立评测支撑.</li>
</ul>
<h3 id="5-2-moe-dgyfx">5.2 MoE 的固有风险</h3>
<p>即使工程优化再精细, MoE 架构仍存在一些固有风险:</p>
<p><strong>专家崩溃(Expert Collapse)</strong></p>
<ul>
<li>训练过程中, 部分专家可能&quot;崩溃&quot;——无论输入什么 token, 都输出相同的表示.</li>
<li>这通常由梯度消失、学习率过高或辅助损失设计不当引起.</li>
<li>一旦发生专家崩溃, 模型的有效容量大幅下降.</li>
</ul>
<p><strong>路由网络脆弱性</strong></p>
<ul>
<li>路由网络是 MoE 的&quot;大脑&quot;, 但其参数量通常很小(只是一个线性层+Softmax).</li>
<li>小容量的路由网络可能无法充分学习复杂的 token-to-expert 映射.</li>
<li>路由网络的失误会导致&quot;把 token 发给错误的专家&quot;, 影响模型质量.</li>
</ul>
<p><strong>推理时的负载不均衡</strong></p>
<ul>
<li>训练时的负载均衡不保证推理时的均衡.</li>
<li>真实用户请求的数据分布可能与训练数据不同, 导致某些专家被过度调用.</li>
<li>这需要在线监测和动态调度机制.</li>
</ul>
<h3 id="5-3-yhxjpddb">5.3 与后续竞品的对比</h3>
<p>abab 6.5 的 200K 上下文和万亿参数在当时具有领先地位, 但后续竞品迅速追赶:</p>
<ul>
<li><strong>Kimi-Chat(2023.10)</strong>: 200K 汉字上下文, 几乎同期, 但产品化程度更高.</li>
<li><strong>Claude-2.1(2023.11)</strong>: 200K tokens 上下文, 国际领先水平.</li>
<li><strong>MiniMax-01(2025.01)</strong>: MiniMax 自身就用 4M 上下文超越了 abab 6.5 的 200K.</li>
</ul>
<p>这表明: 在 2024 年的大模型竞争中, <strong>技术领先窗口极短</strong>, 今天的前沿能力可能在几个月后成为行业标准. abab 6.5 的真正价值不在于其绝对参数规模或上下文长度, 而在于它为 MiniMax 积累的工程经验和架构验证.</p>
<hr>
<h2 id="fl-gjsyb">附录: 关键术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MoE</td>
<td align="left">Mixture of Experts, 专家混合架构</td>
</tr>
<tr>
<td align="left">稀疏激活</td>
<td align="left">每个 token 只激活部分专家, 而非全部</td>
</tr>
<tr>
<td align="left">门控网络 / Router</td>
<td align="left">决定每个 token 分配给哪些专家的神经网络</td>
</tr>
<tr>
<td align="left">负载均衡</td>
<td align="left">确保各专家被均匀调用, 避免过载或闲置</td>
</tr>
<tr>
<td align="left">辅助损失</td>
<td align="left">训练损失中添加的惩罚项, 用于改善负载均衡</td>
</tr>
<tr>
<td align="left">容量因子</td>
<td align="left">每个专家在单个 batch 中可处理的最大 token 数比例</td>
</tr>
<tr>
<td align="left">All-to-All 通信</td>
<td align="left">每个 GPU 向所有其他 GPU 发送数据的通信模式</td>
</tr>
<tr>
<td align="left">专家崩溃</td>
<td align="left">训练过程中部分专家失效, 输出固定表示的现象</td>
</tr>
<tr>
<td align="left">大海捞针测试</td>
<td align="left">Needle-in-a-Haystack, 在长序列中检索特定信息的测试</td>
</tr>
<tr>
<td align="left">Lightning Attention</td>
<td align="left">MiniMax 提出的接近线性复杂度的注意力机制</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 ABAB 核心技术专题. 完整演进脉络见《01-ABAB初代技术博文分析.md》, 部署实践参考见《05-ABAB-Index.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsmyz-moe","text":"1 设计动机: 为什么押注 MoE"},{"level":3,"id":"1-1-2024-ncdhybj","text":"1.1 2024 年初的行业背景"},{"level":3,"id":"1-2-mini-max-djspd","text":"1.2 MiniMax 的技术判断"},{"level":2,"id":"2-yltd-abab-6-d-moe-jgsj","text":"2 原理推导: abab 6 的 MoE 架构设计"},{"level":3,"id":"2-1-moe-cdjbjz","text":"2.1 MoE 层的基本机制"},{"level":3,"id":"2-2-fzjhcl","text":"2.2 负载均衡策略"},{"level":3,"id":"2-3-y-dense-jgdxsdb","text":"2.3 与 Dense 架构的效率对比"},{"level":2,"id":"3-gcyz-200k-csxwydhlzcs","text":"3 工程验证: 200K 长上下文与大海捞针测试"},{"level":3,"id":"3-1-csxwdgctz","text":"3.1 长上下文的工程挑战"},{"level":3,"id":"3-2-dhlzcsdyzyy","text":"3.2 大海捞针测试的验证意义"},{"level":2,"id":"4-c-abab-d-mini-max-01-jslxdyj","text":"4 从 abab 到 MiniMax-01: 技术路线的演进"},{"level":3,"id":"4-1-abab-xldlsyc","text":"4.1 abab 系列的历史遗产"},{"level":3,"id":"4-2-jslxdgjzz","text":"4.2 技术路线的关键转折"},{"level":2,"id":"5-jxxyfx","text":"5 局限性与风险"},{"level":3,"id":"5-1-xxplbz","text":"5.1 信息披露不足"},{"level":3,"id":"5-2-moe-dgyfx","text":"5.2 MoE 的固有风险"},{"level":3,"id":"5-3-yhxjpddb","text":"5.3 与后续竞品的对比"},{"level":2,"id":"fl-gjsyb","text":"附录: 关键术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/01-abab/05-abab-gnsg-moe-dmxdjgtsygcyz" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/01-abab/05-abab-gnsg-moe-dmxdjgtsygcyz" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ABAB 国内首个 MoE 大模型的架构探索与工程验证</h1>
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
