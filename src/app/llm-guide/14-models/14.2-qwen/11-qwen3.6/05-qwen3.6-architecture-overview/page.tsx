"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.6 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>基于 Qwen3.6-35B-A3B 与 Qwen3.6-27B 官方博客信息整理.
注意: Qwen3.6 未发布独立技术报告, 以下分析基于公开博客与 GitHub 仓库信息推断.</p>
</blockquote>
<hr>
<h2 id="1-mxggjz">1 模型规格矩阵</h2>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">架构</th>
<th align="center">总参数</th>
<th align="center">激活参数</th>
<th align="center">上下文窗口</th>
<th align="center">发布日期</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen3.6-35B-A3B</td>
<td align="left">MoE</td>
<td align="center">35B</td>
<td align="center">3B</td>
<td align="center">128K</td>
<td align="center">2026-04-15</td>
</tr>
<tr>
<td align="left">Qwen3.6-27B</td>
<td align="left">Dense</td>
<td align="center">27B</td>
<td align="center">27B</td>
<td align="center">128K</td>
<td align="center">2026-04-22</td>
</tr>
<tr>
<td align="left">Qwen3.6-Plus</td>
<td align="left">API</td>
<td align="center">未公开</td>
<td align="center">未公开</td>
<td align="center">128K+</td>
<td align="center">2026-04</td>
</tr>
<tr>
<td align="left">Qwen3.6-Max-Preview</td>
<td align="left">API</td>
<td align="center">未公开</td>
<td align="center">未公开</td>
<td align="center">128K+</td>
<td align="center">2026-04</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Qwen3.6 开源家族规格对比.</p>
</blockquote>
<hr>
<h2 id="2-jgtd">2 架构推断</h2>
<h3 id="2-1-jcz-qwen3-5-dhhzyljg">2.1 继承自 Qwen3.5 的混合注意力架构</h3>
<p>Qwen3.6 沿用了 Qwen3.5 的「Gated DeltaNet + Gated Attention 混合注意力」架构, 这一设计在 Qwen3.5 的博客中有明确说明. 具体而言:</p>
<ul>
<li><strong>Gated DeltaNet</strong>: 线性注意力变体, 通过门控机制控制状态更新, 将注意力复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span>. 适用于长上下文和高吞吐场景.</li>
<li><strong>Gated Attention</strong>: 标准 Softmax 注意力的门控变体, 保留了对细粒度 token 对齐的精确建模能力. 适用于短上下文和需要高精度对齐的场景.</li>
<li><strong>混合路由</strong>: 模型动态地在两种注意力机制之间切换, 根据输入序列长度和任务类型选择最优计算路径.</li>
</ul>
<h3 id="2-2-moe-sj-qwen3-6-35b-a3b">2.2 MoE 设计: Qwen3.6-35B-A3B</h3>
<p>Qwen3.6-35B-A3B 采用稀疏混合专家架构, 激活比约为 8.6%(3B/35B). 这一比例与 Qwen3.5-397B-A17B 的 4.3%(17B/397B)相比更为「温和」——更高的激活比意味着:</p>
<ul>
<li><strong>优势</strong>: 单步推理的内存访问模式更规律, 路由开销相对降低, 小 batch 场景下的实际吞吐更接近理论值.</li>
<li><strong>劣势</strong>: 单次前向传播的 FLOPs 增加, 在极致并发场景下的成本效率不如超低激活比的方案.</li>
</ul>
<p>从工程角度看, 8.6% 的激活比可能是 Qwen Team 在「推理效率」与「单步质量」之间找到的更优平衡点. Qwen3.5-397B-A17B 的 4.3% 激活比虽然极致高效, 但在某些需要强一致性的 Agent 任务上可能受限于专家路由的稳定性.</p>
<h3 id="2-3-cmsj-qwen3-6-27b">2.3 稠密设计: Qwen3.6-27B</h3>
<p>Qwen3.6-27B 采用纯稠密架构, 这是 Qwen 旗舰系列中久违的全 Dense 模型(Qwen3 及之后的主力均为 MoE). 稠密架构的回归反映了几个技术判断:</p>
<ol>
<li><strong>部署便捷性</strong>: 无需 MoE 路由的 all-to-all 通信, 单卡即可完整加载, 适合边缘设备和中小团队.</li>
<li><strong>推理一致性</strong>: 不存在专家负载不均衡导致的延迟抖动, 对实时性要求高的应用更友好.</li>
<li><strong>能力密度</strong>: 在 27B 这一「甜点规模」上, 稠密模型的参数利用率可能优于小激活参数的 MoE——所有参数在每个 token 上都参与计算, 不存在「沉睡专家」的容量浪费.</li>
</ol>
<hr>
<h2 id="3-gjnldjsgy">3 关键能力的技术根源</h2>
<h3 id="3-1-zntbcnldys">3.1 智能体编程能力的跃升</h3>
<p>Qwen3.6-27B 在 SkillsBench(48.2 vs 30.0)和 Terminal-Bench 2.0(59.3 vs 52.5)上相对 Qwen3.5-397B-A17B 的大幅提升, 其技术根源可能包括:</p>
<ul>
<li><strong>数据层面</strong>: 训练语料中加入了更多真实用户分布的编程任务数据, 尤其是涉及多文件编辑、终端命令执行、版本控制操作等端到端场景.</li>
<li><strong>后训练层面</strong>: RL 环境可能针对编程 Agent 做了专门设计, 包括 bash 执行环境、文件系统状态机、代码编译/测试反馈循环等.</li>
<li><strong>架构层面</strong>: 稠密架构在每个 token 上激活全部参数, 可能对需要强状态跟踪的编程任务(如变量作用域分析、类型推断)更为有利.</li>
</ul>
<h3 id="3-2-kjzndqh">3.2 空间智能的强化</h3>
<p>Qwen3.6-35B-A3B 在 RefCOCO(92.0)和 ODInW13(50.8)上的显著提升, 表明视觉Encoder 可能经过了针对空间定位任务的专门优化. 可能的技术手段包括:</p>
<ul>
<li>预训练阶段加入更多带有精确边界框标注的图像-文本对.</li>
<li>后训练阶段引入视觉 grounding 的 RL 任务, 奖励模型评估预测边界框与目标区域的 IoU.</li>
<li>视觉Encoder 的特征图分辨率可能有所提升, 或采用了像素级位置编码.</li>
</ul>
<h3 id="3-3-dmttldlbx">3.3 多模态推理的鲁棒性</h3>
<p>VlmsAreBlind(97.0)和 V*(94.7)的高分说明 Qwen3.6 在「视觉-语言对齐」上达到了极高的一致性. 这通常需要:</p>
<ul>
<li>训练数据中包含大量「对抗性」视觉-语言样本——即文本描述与图像内容存在微妙差异的样例, 强迫模型学会「以视觉为准」而非「以文本为准」.</li>
<li>损失函数中加入了视觉 grounding 的辅助监督, 确保语言输出能够追溯到具体的图像区域.</li>
</ul>
<hr>
<h2 id="4-yqhdmxddbjz">4 与前后代模型的对比矩阵</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Qwen3.5-397B-A17B</th>
<th align="left">Qwen3.6-35B-A3B</th>
<th align="left">Qwen3.6-27B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">MoE (4.3% 激活)</td>
<td align="left">MoE (8.6% 激活)</td>
<td align="left">Dense (100% 激活)</td>
</tr>
<tr>
<td align="left">总参数</td>
<td align="left">397B</td>
<td align="left">35B</td>
<td align="left">27B</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">17B</td>
<td align="left">3B</td>
<td align="left">27B</td>
</tr>
<tr>
<td align="left">知识任务</td>
<td align="left">强(MMLU-Pro 87.8)</td>
<td align="left">中(MMLU-Pro 85.2)</td>
<td align="left">中(MMLU-Pro 86.2)</td>
</tr>
<tr>
<td align="left">Agent 编程</td>
<td align="left">中(SkillsBench 30.0)</td>
<td align="left">良(SkillsBench 28.7)</td>
<td align="left">强(SkillsBench 48.2)</td>
</tr>
<tr>
<td align="left">空间智能</td>
<td align="left">良(RefCOCO 92.3)</td>
<td align="left">强(RefCOCO 92.0)</td>
<td align="left">强(RefCOCO 92.5)</td>
</tr>
<tr>
<td align="left">部署成本</td>
<td align="left">高(需 MoE 基础设施)</td>
<td align="left">低(3B 激活)</td>
<td align="left">中(27B 全加载)</td>
</tr>
<tr>
<td align="left">单卡可行性</td>
<td align="left">困难</td>
<td align="left">容易(3B 激活)</td>
<td align="left">中等(需 60GB+ FP16)</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Qwen3.6 家族与 Qwen3.5 旗舰的关键维度对比.</p>
</blockquote>
<hr>
<h2 id="5-bsscsj">5 部署实测视角</h2>
<h3 id="5-1-yjxqgs">5.1 硬件需求估算</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">FP16 显存</th>
<th align="center">BF16 显存</th>
<th align="center">INT8 显存</th>
<th align="left">推荐 GPU</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen3.6-35B-A3B</td>
<td align="center">~70GB(全量)</td>
<td align="center">~70GB</td>
<td align="center">~35GB</td>
<td align="left">A100 80GB / H100 80GB</td>
</tr>
<tr>
<td align="left">Qwen3.6-27B</td>
<td align="center">~54GB</td>
<td align="center">~54GB</td>
<td align="center">~27GB</td>
<td align="left">A100 40GB(INT8) / A100 80GB</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Qwen3.6 模型部署的显存需求估算.</p>
</blockquote>
<p><strong>说明:</strong></p>
<ul>
<li>Qwen3.6-35B-A3B 的「全量」显存包含所有专家参数(35B), 推理时仅激活 3B. 若使用 vLLM 等框架的 MoE 优化(如专家缓存、动态加载), 实际运行时显存可进一步降低.</li>
<li>Qwen3.6-27B 作为稠密模型, 显存需求与参数量线性相关, 预测更为直接.</li>
</ul>
<h3 id="5-2-tlttgs">5.2 推理吞吐估算</h3>
<p>基于 Qwen3.5 博客中披露的「Gated DeltaNet + Gated Attention」架构效率数据, 可以推断 Qwen3.6 的吞吐特征:</p>
<ul>
<li>Qwen3.6-35B-A3B(3B 激活)在 128K 上下文下的解码吞吐应接近同规模 Dense 模型(3B 级别), 远高于 17B 激活的 Qwen3.5-397B-A17B.</li>
<li>Qwen3.6-27B 的稠密架构在短上下文(4K-32K)下可能具有最优的延迟表现, 但在 128K+ 长上下文下, 线性注意力的优势将逐渐显现.</li>
</ul>
<hr>
<h2 id="6-zj">6 总结</h2>
<p>Qwen3.6 家族代表了 Qwen 系列在「智能体原生」方向上的一次重要迭代. 其核心架构延续了 Qwen3.5 的混合注意力 + 稀疏 MoE 路线, 但通过更激进的训练数据优化和后训练方法, 实现了在更小规模上的能力跃升. Qwen3.6-27B 的稠密架构回归, 以及 Qwen3.6-35B-A3B 的适度激活比(8.6%), 均反映了工程团队对「实际部署体验」的深刻关注——能力密度不再是唯一的优化目标, 部署便捷性、推理一致性、单卡可行性同等重要.</p>
<p>由于 Qwen3.6 尚未发布独立技术报告, 以上分析基于公开博客信息的合理推断. 确切的架构细节(如层数、注意力头数、专家数量、训练数据规模等)有待后续官方披露.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxggjz","text":"1 模型规格矩阵"},{"level":2,"id":"2-jgtd","text":"2 架构推断"},{"level":3,"id":"2-1-jcz-qwen3-5-dhhzyljg","text":"2.1 继承自 Qwen3.5 的混合注意力架构"},{"level":3,"id":"2-2-moe-sj-qwen3-6-35b-a3b","text":"2.2 MoE 设计: Qwen3.6-35B-A3B"},{"level":3,"id":"2-3-cmsj-qwen3-6-27b","text":"2.3 稠密设计: Qwen3.6-27B"},{"level":2,"id":"3-gjnldjsgy","text":"3 关键能力的技术根源"},{"level":3,"id":"3-1-zntbcnldys","text":"3.1 智能体编程能力的跃升"},{"level":3,"id":"3-2-kjzndqh","text":"3.2 空间智能的强化"},{"level":3,"id":"3-3-dmttldlbx","text":"3.3 多模态推理的鲁棒性"},{"level":2,"id":"4-yqhdmxddbjz","text":"4 与前后代模型的对比矩阵"},{"level":2,"id":"5-bsscsj","text":"5 部署实测视角"},{"level":3,"id":"5-1-yjxqgs","text":"5.1 硬件需求估算"},{"level":3,"id":"5-2-tlttgs","text":"5.2 推理吞吐估算"},{"level":2,"id":"6-zj","text":"6 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.6 核心架构剖析</h1>
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
