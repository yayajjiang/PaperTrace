"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Hunyuan Pro 核心技术专题：细粒度 MoE 与混合 Mamba 架构的效率突破</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.20-hunyuan/14.20-hunyuan">返回 14.20-Hunyuan 家族总览</a></strong></p>
</blockquote>
<hr>
<h2 id="1-mxdwyjztp">1. 模型定位与家族图谱</h2>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>总参数</th>
<th>激活参数</th>
<th>架构</th>
<th>上下文</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Hunyuan-Large</strong></td>
<td>2025.11</td>
<td>389B</td>
<td>52B</td>
<td>Transformer MoE</td>
<td>256K</td>
</tr>
<tr>
<td><strong>Hunyuan-A13B</strong></td>
<td>2025.12</td>
<td>800B</td>
<td>13B</td>
<td>细粒度 MoE (1+64)</td>
<td>256K</td>
</tr>
<tr>
<td><strong>Hunyuan-TurboS</strong></td>
<td>2025.02</td>
<td>560B</td>
<td>56B</td>
<td><strong>混合 Mamba-MoE</strong></td>
<td>未公开</td>
</tr>
<tr>
<td><strong>Hunyuan-T1</strong></td>
<td>2025.03</td>
<td>未公开</td>
<td>未公开</td>
<td>快速推理优化</td>
<td>长文本</td>
</tr>
</tbody></table>
<p>Hunyuan Pro 是腾讯混元大模型家族的<strong>技术旗舰线</strong>，代表腾讯在 MoE 架构效率、混合架构创新和长文本处理上的前沿探索。与字节 Doubao 的「闭源全栈服务」路线不同，Hunyuan 选择「<strong>开源核心 + 企业服务</strong>」的双轨策略——通过开源 Hunyuan-Large / A13B 建立技术影响力，通过 TurboS / T1 服务腾讯生态内的企业客户。</p>
<hr>
<h2 id="2-xld-moe-c-8-zj-d-1-64-dlzyq">2. 细粒度 MoE：从「8 专家」到「1+64」的量子跃迁</h2>
<h3 id="2-1-hunyuan-a13b-d-quot-1-64-quot-sj">2.1 Hunyuan-A13B 的 &quot;1+64&quot; 设计</h3>
<p>传统 MoE(如 Mixtral 8x7B)采用「粗粒度」专家：每层 8 个专家，每个专家 ~7B。Hunyuan-A13B 反其道而行：</p>
<blockquote>
<p><strong>1 个共享专家 + 64 个路由专家，总参数 800B，激活仅 13B。</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th>维度</th>
<th>粗粒度 MoE (Mixtral)</th>
<th>细粒度 MoE (Hunyuan-A13B)</th>
</tr>
</thead>
<tbody><tr>
<td><strong>专家数量</strong></td>
<td>8</td>
<td><strong>64</strong></td>
</tr>
<tr>
<td><strong>专家大小</strong></td>
<td>~7B</td>
<td>~1B</td>
</tr>
<tr>
<td><strong>每 token 激活专家</strong></td>
<td>2</td>
<td>少量(推测 4-8 个)</td>
</tr>
<tr>
<td><strong>组合空间</strong></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>C</mi><mn>8</mn><mn>2</mn></msubsup><mo>=</mo><mn>28</mn></mrow><annotation encoding="application/x-tex">C_8^2 = 28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0622em;vertical-align:-0.2481em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-2.4519em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">8</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2481em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">28</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>C</mi><mn>64</mn><mi>k</mi></msubsup><mo>≫</mo><mn>28</mn></mrow><annotation encoding="application/x-tex">C_{64}^k \\gg 28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0972em;vertical-align:-0.2481em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4519em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">64</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2481em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">28</span></span></span></span></td>
</tr>
<tr>
<td><strong>专业化程度</strong></td>
<td>粗(语法/主题级)</td>
<td>细(功能/模式级)</td>
</tr>
</tbody></table>
<p><strong>细粒度的核心优势</strong>：64 个小型专家的组合空间远大于 8 个大型专家，使得模型可以用更少的激活参数表达更丰富的函数空间。实验验证：A13B 在 MMLU 上取得 88.17 分，超越同量级 Dense 模型 12%。</p>
<h3 id="2-2-gxzj-lyzjdxt">2.2 共享专家 + 路由专家的协同</h3>
<ul>
<li><strong>共享专家(1 个)</strong>：保留通用语言能力(语法、常识、基础推理)，确保所有 token 都能获得稳定的基线表示。</li>
<li><strong>路由专家(64 个)</strong>：处理特定任务模式(代码、数学、多语言、创意写作等)，按需激活。</li>
</ul>
<p>这种设计的启示来自腾讯在<strong>推荐系统</strong>(微信、QQ 的信息流)上的多年经验——超大规模稀疏系统的负载均衡和路由优化是腾讯的核心工程能力。</p>
<hr>
<h2 id="3-hh-mamba-moe-turbo-s-djggm">3. 混合 Mamba-MoE：TurboS 的架构革命</h2>
<h3 id="3-1-wsmhh-mamba-h-transformer">3.1 为什么混合 Mamba 和 Transformer？</h3>
<p>2025 年初发布的 Hunyuan-TurboS 是<strong>业界首款大规模混合 Mamba-MoE 模型</strong>：</p>
<table>
<thead>
<tr>
<th>架构</th>
<th>优势</th>
<th>劣势</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Transformer</strong></td>
<td>全局注意力，上下文理解强</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度，长序列慢</td>
</tr>
<tr>
<td><strong>Mamba</strong></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 复杂度，长序列高效</td>
<td>全局依赖弱，精度略低</td>
</tr>
<tr>
<td><strong>TurboS 混合</strong></td>
<td><strong>兼顾效率与精度</strong></td>
<td>实现复杂，训练不稳定</td>
</tr>
</tbody></table>
<h3 id="3-2-amf-mf-jcmk">3.2 AMF / MF 交错模块</h3>
<p>TurboS 共 128 层，采用两种模块交错：</p>
<ul>
<li><strong>AMF 模块(Attention → Mamba2 → FFN)</strong>：需要全局理解的层(如语义解析、跨句推理)。</li>
<li><strong>MF 模块(Mamba2 → FFN)</strong>：局部模式为主的层(如语法生成、token 级预测)。</li>
</ul>
<blockquote>
<p><strong>设计直觉</strong>：不是所有层都需要全局注意力。浅层以局部模式为主(Mamba 足够)，深层需要全局整合(Attention 必要)。</p>
</blockquote>
<h3 id="3-3-zsycdswl-adaptive-long-short-cot">3.3 自适应长短思维链(Adaptive Long-short CoT)</h3>
<p>TurboS 的另一创新：<strong>根据问题复杂度自动切换推理模式</strong>。</p>
<table>
<thead>
<tr>
<th>问题复杂度</th>
<th>激活模式</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>简单问题</td>
<td><strong>无思考(No Thinking)</strong></td>
<td>直接输出，最小延迟</td>
</tr>
<tr>
<td>中等问题</td>
<td><strong>短思维链</strong></td>
<td>简要分析后回答</td>
</tr>
<tr>
<td>复杂问题</td>
<td><strong>长思维链(Thinking)</strong></td>
<td>逐步分析、自我反思、回溯</td>
</tr>
</tbody></table>
<p>这种自适应机制避免了「所有问题都用长思考」的算力浪费，也避免了「复杂问题用短思考」的精度损失。首字时延相比前代降低 <strong>44%</strong>。</p>
<hr>
<h2 id="4-xlsjy-scaling-law">4. 训练数据与 Scaling Law</h2>
<h3 id="4-1-20-wy-token-dyxl">4.1 20 万亿 Token 的预训练</h3>
<p>Hunyuan 系列预训练处理了 <strong>20 万亿 tokens</strong> 高质量语料：</p>
<ul>
<li><strong>来源</strong>：腾讯生态(微信、QQ、腾讯文档、腾讯视频、腾讯新闻)+ 公开语料 + 合成数据。</li>
<li><strong>合成数据</strong>：利用大模型生成高质量训练样本，覆盖数学推理、代码、逻辑谜题等稀缺领域。</li>
<li><strong>质量控制</strong>：多维度评分(信息密度、事实准确性、语言质量)+ 严格去重。</li>
</ul>
<h3 id="4-2-moe-d-scaling-law">4.2 MoE 的 Scaling Law</h3>
<p>腾讯团队推导出了<strong>适用于 MoE 模型的 Scaling Law 联合公式</strong>，为架构设计提供量化指导：</p>
<blockquote>
<p>在固定计算预算下，最优的「专家数 × 专家大小 × 路由策略」组合可以通过公式预测，而非盲目实验。</p>
</blockquote>
<p>这一理论工作使得 Hunyuan 的 MoE 设计从「经验调参」升级为「科学优化」。</p>
<hr>
<h2 id="5-kyclystyx">5. 开源策略与生态影响</h2>
<h3 id="5-1-kymxjz">5.1 开源模型矩阵</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>开源时间</th>
<th>定位</th>
</tr>
</thead>
<tbody><tr>
<td>Hunyuan-Large</td>
<td>2025.11</td>
<td>最大开源 Transformer MoE(389B/52B)</td>
</tr>
<tr>
<td>Hunyuan-A13B</td>
<td>2025.12</td>
<td>高效端侧 MoE(800B/13B)</td>
</tr>
<tr>
<td>Hunyuan-MT-7B</td>
<td>2025.09</td>
<td>翻译专用(33 语种，WMT2025 冠军)</td>
</tr>
<tr>
<td>Hunyuan-0.5B</td>
<td>2025.12</td>
<td>极简端侧(0.5B，FP8，256K 上下文)</td>
</tr>
</tbody></table>
<h3 id="5-2-nbyygm">5.2 内部应用规模</h3>
<p>Hunyuan 已服务腾讯 <strong>400+ 业务场景</strong>，日均调用量突破 <strong>1.3 亿次</strong>：</p>
<ul>
<li><strong>微信</strong>：智能回复、内容审核、搜索增强</li>
<li><strong>QQ</strong>：聊天助手、表情包生成、群聊摘要</li>
<li><strong>腾讯文档</strong>：文档摘要、智能写作、格式转换</li>
<li><strong>腾讯会议</strong>：实时字幕、会议纪要、翻译</li>
<li><strong>王者荣耀/和平精英</strong>：NPC 对话、剧情生成、客服</li>
</ul>
<hr>
<h2 id="6-jxxyfx">6. 局限性与风险</h2>
<h3 id="6-1-hhjgdxlbwdx">6.1 混合架构的训练不稳定性</h3>
<p>Mamba + Transformer 的混合训练面临独特的稳定性挑战：</p>
<ul>
<li><strong>梯度冲突</strong>：Mamba 的线性递归和 Transformer 的注意力机制对优化器的敏感性不同。</li>
<li><strong>层间耦合</strong>：AMF 和 MF 模块的交错使得梯度传播路径复杂，深层可能出现梯度衰减。</li>
<li><strong>超参数敏感</strong>：TurboS 需要精细调整的学习率调度、 warmup 策略和正则化强度。</li>
</ul>
<h3 id="6-2-xld-moe-dtxkx">6.2 细粒度 MoE 的通信开销</h3>
<p>64 个专家意味着 all-to-all 通信的复杂度远高于 8 专家。虽然 A13B 的总激活参数只有 13B，但路由决策和专家切换的通信开销在小 batch 场景下可能吞噬计算优势。</p>
<h3 id="6-3-kyysyhdph">6.3 开源与商业化的平衡</h3>
<p>Hunyuan 开源了模型权重，但核心训练代码、数据 pipeline 和基础设施细节未完全公开。这使得社区可以基于开源模型进行微调，但难以复现训练过程或进行同等级别的预训练。</p>
<hr>
<h2 id="7-mxpxdw">7. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: 腾讯早期 NLP 研究(2020-2023)和推荐系统技术积累</li>
<li><strong>核心创新</strong>:<ul>
<li>细粒度 MoE(1+64 专家，800B/13B)</li>
<li>混合 Mamba-MoE 架构(AMF/MF 交错，128 层)</li>
<li>自适应长短 CoT(根据问题复杂度动态切换)</li>
<li>MoE Scaling Law 联合公式</li>
<li>20 万亿 tokens 预训练 + 高质量合成数据</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>Doubao Pro(字节，7× 杠杆 MoE，多模态统一)</li>
<li>DeepSeek-V3(DeepSeek，开源，极致性价比)</li>
<li>Kimi K2.6(Moonshot，Agent Swarm)</li>
</ul>
</li>
<li><strong>技术定位</strong>: Hunyuan Pro 是腾讯「AI 基础设施」战略的技术核心，其细粒度 MoE 和混合 Mamba 架构代表了国内大厂在模型效率上的前沿探索。与 DeepSeek 的「开源极致性价比」和字节的「闭源全栈服务」不同，Hunyuan 走「开源核心建立影响力 + 企业服务获取收入」的中间路线</li>
</ul>
<hr>
<blockquote>
<p>📚 <strong>关联阅读</strong></p>
<ul>
<li><a href="/llm-guide/14-models/14.20-hunyuan/14.20-hunyuan">返回 Hunyuan 家族总览</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.2-国内大模型/腾讯混元-Hunyuan/05-Hunyuan-Pro-细粒度MoE与混合Mamba架构的效率突破.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxdwyjztp","text":"1. 模型定位与家族图谱"},{"level":2,"id":"2-xld-moe-c-8-zj-d-1-64-dlzyq","text":"2. 细粒度 MoE：从「8 专家」到「1+64」的量子跃迁"},{"level":3,"id":"2-1-hunyuan-a13b-d-quot-1-64-quot-sj","text":"2.1 Hunyuan-A13B 的 &quot;1+64&quot; 设计"},{"level":3,"id":"2-2-gxzj-lyzjdxt","text":"2.2 共享专家 + 路由专家的协同"},{"level":2,"id":"3-hh-mamba-moe-turbo-s-djggm","text":"3. 混合 Mamba-MoE：TurboS 的架构革命"},{"level":3,"id":"3-1-wsmhh-mamba-h-transformer","text":"3.1 为什么混合 Mamba 和 Transformer？"},{"level":3,"id":"3-2-amf-mf-jcmk","text":"3.2 AMF / MF 交错模块"},{"level":3,"id":"3-3-zsycdswl-adaptive-long-short-cot","text":"3.3 自适应长短思维链(Adaptive Long-short CoT)"},{"level":2,"id":"4-xlsjy-scaling-law","text":"4. 训练数据与 Scaling Law"},{"level":3,"id":"4-1-20-wy-token-dyxl","text":"4.1 20 万亿 Token 的预训练"},{"level":3,"id":"4-2-moe-d-scaling-law","text":"4.2 MoE 的 Scaling Law"},{"level":2,"id":"5-kyclystyx","text":"5. 开源策略与生态影响"},{"level":3,"id":"5-1-kymxjz","text":"5.1 开源模型矩阵"},{"level":3,"id":"5-2-nbyygm","text":"5.2 内部应用规模"},{"level":2,"id":"6-jxxyfx","text":"6. 局限性与风险"},{"level":3,"id":"6-1-hhjgdxlbwdx","text":"6.1 混合架构的训练不稳定性"},{"level":3,"id":"6-2-xld-moe-dtxkx","text":"6.2 细粒度 MoE 的通信开销"},{"level":3,"id":"6-3-kyysyhdph","text":"6.3 开源与商业化的平衡"},{"level":2,"id":"7-mxpxdw","text":"7. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.20-hunyuan/01-hunyuan-pro/05-hunyuan-pro-xld-moe-yhh-mamba-jgdxstp" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.20-hunyuan/01-hunyuan-pro/05-hunyuan-pro-xld-moe-yhh-mamba-jgdxstp" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Hunyuan Pro 核心技术专题：细粒度 MoE 与混合 Mamba 架构的效率突破</h1>
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
