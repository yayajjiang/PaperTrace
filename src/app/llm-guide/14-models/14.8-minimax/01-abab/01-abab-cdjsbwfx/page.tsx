"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ABAB 初代技术博文分析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<h2 id="ywxx">原文信息</h2>
<ul>
<li><strong>来源</strong>: MiniMax 官方博客、新闻稿与公开技术分享</li>
<li><strong>发布时间</strong>: abab 6 于 2024 年 1 月发布;abab 6.5 系列于 2024 年 4 月发布</li>
<li><strong>发布机构</strong>: MiniMax(稀宇科技),2021 年 12 月成立</li>
<li><strong>核心定位</strong>: MiniMax 早期大语言模型系列,国内首个基于 MoE 架构的通用大模型,为后续 MiniMax-01 / M1 / M2 系列奠定基础</li>
</ul>
<hr>
<h2 id="y-mxgsycpdw">一、模型概述与产品定位</h2>
<h3 id="1-1-mini-max-gsbj">1.1 MiniMax 公司背景</h3>
<p>MiniMax(稀宇科技)成立于 2021 年 12 月,是国内最早投身大模型研发的创业公司之一。公司创始人闫俊杰博士曾任商汤科技副总裁、研究院副院长,在计算机视觉与深度学习领域有深厚积累。MiniMax 的愿景是「Intelligence with Everyone」(与人共智),致力于通过技术进步实现 AGI。</p>
<p>截至 2024 年 8 月,MiniMax 大模型日均完成 30 亿次 AI 交互,日处理文本 tokens 超过 300 万亿,日生成图像 2,000 万张,日合成语音 70,000 小时。开放平台已服务超过 21.4 万企业客户和开发者,业务覆盖 100 多个国家和地区。</p>
<h3 id="1-2-abab-xlmm">1.2 abab 系列命名</h3>
<p>「abab」是 MiniMax 早期大模型产品的内部代号系列。该系列代表 MiniMax 在通用大语言模型领域的探索阶段,后续被 MiniMax-01 系列(2025 年 1 月开源)和 M 系列(M1、M2、M2.1、M2.5 等)所取代。</p>
<hr>
<h2 id="e-abab-6-gnsg-moe-jgdmx">二、abab 6:国内首个 MoE 架构大模型</h2>
<h3 id="2-1-fbsjxybj">2.1 发布时间线与背景</h3>
<p>2024 年 1 月,MiniMax 发布 abab 6,这是<strong>国内首个基于 MoE(Mixture of Experts)架构的通用大语言模型</strong>。当时 MoE 尚未成为行业共识,主流厂商(如 OpenAI 的 GPT-4 虽已采用 MoE 但架构未公开)大多仍聚焦于 Dense 架构的扩展。</p>
<p>MiniMax 在 MoE 上的早期押注体现了其技术前瞻性。据官方博客披露,MiniMax 将「80% 以上的精力」投入到 MoE 架构的研发中。</p>
<h3 id="2-2-jgtd">2.2 架构特点</h3>
<p>abab 6 的核心架构特点包括:</p>
<ul>
<li><strong>MoE 架构</strong>: 采用稀疏激活的专家混合架构,每 token 仅激活部分专家网络,在保持大模型容量的同时控制推理成本。</li>
<li><strong>万亿参数规模</strong>: abab 6 的总参数量达到万亿级别,激活参数为子集。</li>
<li><strong>长上下文支持</strong>: 支持扩展上下文长度(具体数值未在官方博客中精确披露,推测为 8K~32K 级别)。</li>
</ul>
<h3 id="2-3-xlffl">2.3 训练方法论</h3>
<p>MiniMax 在 abab 6 的训练过程中探索了多条加速 Scaling Laws 的途径:</p>
<ul>
<li><strong>模型架构改进</strong>: 在 MoE 路由机制、专家网络设计等方面进行创新。</li>
<li><strong>数据 pipeline 重构</strong>: 优化数据清洗、去重、质量筛选流程,提升训练数据的有效信息量。</li>
<li><strong>训练算法优化</strong>: 改进优化器、学习率调度、正则化策略等。</li>
<li><strong>并行训练策略</strong>: 在大规模集群上实现高效分布式训练。</li>
</ul>
<hr>
<h2 id="s-abab-6-5-xl-wy-moe-dnlys">三、abab 6.5 系列:万亿 MoE 的能力跃升</h2>
<h3 id="3-1-fbgk">3.1 发布概况</h3>
<p>2024 年 4 月 17 日,MiniMax 正式发布 abab 6.5 系列模型,包含两个变体:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数规模</th>
<th>上下文长度</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>abab 6.5</td>
<td>万亿参数</td>
<td>200K tokens</td>
<td>标准版,全面能力</td>
</tr>
<tr>
<td>abab 6.5s</td>
<td>万亿参数</td>
<td>200K tokens</td>
<td>高效版,1 秒处理近 3 万字</td>
</tr>
</tbody></table>
<h3 id="3-2-hxnlts">3.2 核心能力提升</h3>
<p>abab 6.5 在 abab 6 的基础上进行了深度优化,官方称其「开始接近 GPT-4、Claude-3、Gemini-1.5 等世界上最领先的大语言模型」。具体优化方向包括:</p>
<ul>
<li><strong>MoE 架构深度优化</strong>: 进一步挖掘 MoE 潜力,改进专家路由效率与负载均衡。</li>
<li><strong>长上下文稳定性</strong>: 在 200K tokens 范围内实现稳定的上下文理解能力。</li>
<li><strong>推理效率提升</strong>: abab 6.5s 在保持与 abab 6.5 相同训练数据和技术的基础上,实现了更高的推理效率。</li>
</ul>
<h3 id="3-3-csxwyz-dhlz-cs">3.3 长上下文验证:「大海捞针」测试</h3>
<p>MiniMax 在 200K tokens 范围内进行了业界标准的「大海捞针」(Needle-in-a-Haystack)测试:</p>
<ul>
<li><strong>测试方法</strong>: 在很长的文本中插入一个与主题无关的句子(「针」),然后提问模型要求找出该句子。</li>
<li><strong>测试结果</strong>: 在 891 次测试中,abab 6.5 <strong>全部正确回答</strong>。</li>
</ul>
<p>这一结果验证了 abab 6.5 在长上下文信息检索上的可靠性,200K 上下文能力并非「名义参数」而是实际可用。</p>
<h3 id="3-4-hxnlpc">3.4 核心能力评测</h3>
<p>MiniMax 使用业界标准开源测试集对 abab 6.5 进行了评测,评测维度涵盖:</p>
<ul>
<li>知识(Knowledge)</li>
<li>推理(Reasoning)</li>
<li>数学(Math)</li>
<li>编程(Coding)</li>
<li>指令遵从(Instruction Following)</li>
</ul>
<p>评测结果显示 abab 6.5 在上述维度上接近国际顶尖模型水平(具体分数未在公开博客中完整披露)。</p>
<hr>
<h2 id="s-abab-xlddmtkz">四、abab 系列的多模态扩展</h2>
<h3 id="4-1-dmtcpjz-2024-n-8-y">4.1 多模态产品矩阵(2024 年 8 月)</h3>
<p>在 abab 6.5 发布后的 4 个月内,MiniMax 迅速扩展了多模态产品线:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>模态</th>
<th>发布时间</th>
<th>核心能力</th>
</tr>
</thead>
<tbody><tr>
<td>abab-video-1</td>
<td>视频生成</td>
<td>2024 年 8 月</td>
<td>文生视频,最高 1280x720@25fps,最长 6 秒</td>
</tr>
<tr>
<td>abab-music-1</td>
<td>音乐生成</td>
<td>2024 年 8 月</td>
<td>文本/图像驱动的音乐创作</td>
</tr>
<tr>
<td>abab-speech-1</td>
<td>语音合成</td>
<td>2024 年 8 月(更新)</td>
<td>高质量语音合成</td>
</tr>
<tr>
<td>abab 7(预告)</td>
<td>文本</td>
<td>2024 年 Q3(预告)</td>
<td>MoE + Linear Attention</td>
</tr>
</tbody></table>
<h3 id="4-2-abab-video-1-jstd">4.2 abab-video-1 技术特点</h3>
<p>abab-video-1 是 MiniMax 的首个视频生成模型,支持:</p>
<ul>
<li><strong>分辨率</strong>: 最高 1280x720</li>
<li><strong>帧率</strong>: 25fps</li>
<li><strong>时长</strong>: 最长 6 秒(未来计划扩展至 10 秒)</li>
<li><strong>镜头语言</strong>: 支持电影级运镜(推、拉、摇、移)</li>
<li><strong>生成质量</strong>: 在物理正确性、动态范围、稳定性方面达到实用水平</li>
</ul>
<hr>
<h2 id="w-c-abab-d-mini-max-01-jslxdyj">五、从 abab 到 MiniMax-01:技术路线的演进</h2>
<h3 id="5-1-abab-xldlsyy">5.1 abab 系列的历史意义</h3>
<p>abab 系列在 MiniMax 的技术演进中扮演了「奠基者」角色:</p>
<ul>
<li><strong>MoE 架构验证</strong>: abab 6/6.5 验证了 MoE 架构在中文大模型上的可行性与优势,为后续更大规模的 MoE 模型(MiniMax-01 456B/45.9B、MiniMax-M1 4.56T/459B)积累了工程经验。</li>
<li><strong>长上下文工程</strong>: 200K 上下文的实现与验证,为后续 1M 上下文(MiniMax-M1)和 4M 上下文(MiniMax-01 推理)奠定了技术基础。</li>
<li><strong>多模态探索</strong>: abab-video-1、abab-music-1、abab-speech-1 的探索,使 MiniMax 成为最早实现「文本+图像+视频+语音+音乐」全模态覆盖的中国 AI 公司之一。</li>
</ul>
<h3 id="5-2-jslxdb">5.2 技术路线对比</h3>
<table>
<thead>
<tr>
<th>阶段</th>
<th>代表模型</th>
<th>核心架构</th>
<th>上下文长度</th>
<th>关键创新</th>
</tr>
</thead>
<tbody><tr>
<td>abab 时期</td>
<td>abab 6 / 6.5</td>
<td>MoE</td>
<td>200K</td>
<td>国内首个 MoE LLM</td>
</tr>
<tr>
<td>开源突破</td>
<td>MiniMax-01(2025.01)</td>
<td>MoE + Lightning Attention</td>
<td>1M 训练 / 4M 推理</td>
<td>Lightning Attention 首次大规模实现</td>
</tr>
<tr>
<td>推理模型</td>
<td>MiniMax-M1(2025.06)</td>
<td>MoE + Hybrid Attention</td>
<td>1M</td>
<td>全球首个开源混合注意力推理模型</td>
</tr>
<tr>
<td>编程 Agent</td>
<td>MiniMax-M2.1(2025.12)</td>
<td>MoE + Lightning Attention</td>
<td>1M</td>
<td>编程与 Agent 场景优化</td>
</tr>
</tbody></table>
<h3 id="5-3-linear-attention-dyg">5.3 Linear Attention 的预告</h3>
<p>2024 年 8 月的 MiniMax Link Partner Day 上,公司预告即将发布 <strong>abab 7</strong>,核心架构为 <strong>MoE + Linear Attention</strong>。这一预告最终演变为 2025 年 1 月发布的 MiniMax-01 系列,其中 Lightning Attention 作为 Linear Attention 的改进版本首次在大规模模型上成功实现。</p>
<hr>
<h2 id="l-skjd">六、思考节点</h2>
<ThinkingNode category="架构细节">
abab 6.5 的 MoE 架构虽未公开完整技术细节,但从其后续模型 MiniMax-01 的技术报告(arXiv:2501.08313)可以反推 abab 时期的工程积累。MiniMax-01 采用的「7:1 混合比例」(7 层 Lightning Attention + 1 层 softmax attention)和「全局路由器」(EP 组间 all-gather 同步)等设计,很可能在 abab 6.5 时期已进行初步实验。abab 6.5s 的「1 秒处理近 3 万字」能力,暗示其推理引擎已实现了显著的 kernel 优化与调度改进。值得注意的是,abab 6.5 的 891/891 大海捞针通过率,在 2024 年 4 月是相当出色的成绩——同期 Claude-3 和 GPT-4 的 200K 能力也刚刚发布不久。
</ThinkingNode><ThinkingNode category="设计动机">
MiniMax 在 2023~2024 年选择将「80% 以上精力」投入 MoE,是一个具有战略眼光的决策。当时行业主流仍是 Dense 架构(如 Llama、Qwen 早期版本),MoE 被视为「高门槛、高风险」路线。MiniMax 的早期押注使其在 2024 年获得了显著的技术先发优势:当其他厂商还在探索 MoE 可行性时,abab 6.5 已接近 GPT-4 水平。这一策略与 DeepSeek 在 FP8 训练上的早期投入类似——选择一条尚未成为共识的技术路线,通过深度投入建立护城河。然而,MoE 的复杂性也带来了挑战:abab 系列的专家负载均衡、通信开销、推理效率等问题,需要大量工程优化才能解决。
</ThinkingNode><ThinkingNode category="局限性与延伸思考">
abab 系列的最大局限是信息披露严重不足。与同期 DeepSeek(持续发布技术报告)、阿里 Qwen(开源+论文)、智谱 GLM(部分开源)相比,MiniMax 在 abab 时期几乎完全依赖官方博客和新闻稿,未发布任何 arXiv 论文。这导致学术界无法评估其技术贡献的真实价值,「接近 GPT-4」的自我宣称缺乏独立验证。此外,abab 系列未开源模型权重,开发者无法本地部署或二次开发,限制了生态建设。延伸思考:MiniMax 直到 2025 年(MiniMax-01 开源)才改变封闭策略,这一转变可能与行业竞争压力(DeepSeek 开源带来的冲击)和 IPO 需求(2025 年 12 月递交港股招股书)有关。封闭策略虽保护了商业利益,但也延缓了技术影响力的积累。
</ThinkingNode><ThinkingNode category="行业影响">
abab 6 作为国内首个 MoE 大模型,在 2024 年初具有标志性意义。它证明了中国创业公司在最前沿架构探索上的能力,打破了「只有 OpenAI/Google 才能做好 MoE」的刻板印象。abab 6.5 的 200K 上下文和万亿参数规模,也使 MiniMax 在 2024 年上半年跻身国内大模型第一梯队。从行业格局看,MiniMax 的 abab 系列与阶跃星辰 Step-2(万亿 MoE)、DeepSeek-V2(MoE+MLA)共同构成了 2024 年中国 MoE 模型的第一波浪潮,推动了 MoE 从「小众技术」向「行业共识」的转变。
</ThinkingNode><ThinkingNode category="技术谱系">
abab 系列的技术谱系可以追溯至 MiniMax 创始人闫俊杰在商汤科技时期的深度学习工程经验,以及公司在 2022~2023 年的预研积累。从 abab 6(MoE 初试)到 abab 6.5(MoE 规模化)再到预告的 abab 7(MoE+Linear Attention),技术路线一脉相承。最终,MiniMax-01(2025)将 Lightning Attention 与 MoE 结合,实现了 4M 推理上下文和 O(Nd^2) 复杂度注意力,可以视为 abab 时期长上下文与效率探索的集大成者。从更宏观视角看,MiniMax 的技术演进路径(Dense→MoE→MoE+Linear Attention→Hybrid Attention Reasoning)与行业整体趋势高度一致,但在每个节点的切入时机上保持了 3~6 个月的领先。
</ThinkingNode><hr>
<h2 id="q-gjggsc">七、关键规格速查</h2>
<table>
<thead>
<tr>
<th>属性</th>
<th>abab 6</th>
<th>abab 6.5</th>
<th>abab 6.5s</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2024 年 1 月</td>
<td>2024 年 4 月</td>
<td>2024 年 4 月</td>
</tr>
<tr>
<td>参数规模</td>
<td>万亿(MoE)</td>
<td>万亿(MoE)</td>
<td>万亿(MoE)</td>
</tr>
<tr>
<td>上下文长度</td>
<td>未精确披露</td>
<td>200K tokens</td>
<td>200K tokens</td>
</tr>
<tr>
<td>推理特点</td>
<td>标准</td>
<td>标准</td>
<td>高效(1 秒/3 万字)</td>
</tr>
<tr>
<td>开源状态</td>
<td>闭源</td>
<td>闭源</td>
<td>闭源</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>译者注</strong>: 本文基于 MiniMax 官方博客(2024 年 1 月、4 月发布)、CSDN 技术博客、极客公园等科技媒体报道、MiniMax Link Partner Day 公开演讲内容,以及 MiniMax-01 技术报告(arXiv:2501.08313)中的历史回顾信息综合整理。abab 系列未发布独立 arXiv 技术报告,文中关于模型架构与训练细节的描述基于官方博客与后续开源模型技术报告的反推推测。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ywxx","text":"原文信息"},{"level":2,"id":"y-mxgsycpdw","text":"一、模型概述与产品定位"},{"level":3,"id":"1-1-mini-max-gsbj","text":"1.1 MiniMax 公司背景"},{"level":3,"id":"1-2-abab-xlmm","text":"1.2 abab 系列命名"},{"level":2,"id":"e-abab-6-gnsg-moe-jgdmx","text":"二、abab 6:国内首个 MoE 架构大模型"},{"level":3,"id":"2-1-fbsjxybj","text":"2.1 发布时间线与背景"},{"level":3,"id":"2-2-jgtd","text":"2.2 架构特点"},{"level":3,"id":"2-3-xlffl","text":"2.3 训练方法论"},{"level":2,"id":"s-abab-6-5-xl-wy-moe-dnlys","text":"三、abab 6.5 系列:万亿 MoE 的能力跃升"},{"level":3,"id":"3-1-fbgk","text":"3.1 发布概况"},{"level":3,"id":"3-2-hxnlts","text":"3.2 核心能力提升"},{"level":3,"id":"3-3-csxwyz-dhlz-cs","text":"3.3 长上下文验证:「大海捞针」测试"},{"level":3,"id":"3-4-hxnlpc","text":"3.4 核心能力评测"},{"level":2,"id":"s-abab-xlddmtkz","text":"四、abab 系列的多模态扩展"},{"level":3,"id":"4-1-dmtcpjz-2024-n-8-y","text":"4.1 多模态产品矩阵(2024 年 8 月)"},{"level":3,"id":"4-2-abab-video-1-jstd","text":"4.2 abab-video-1 技术特点"},{"level":2,"id":"w-c-abab-d-mini-max-01-jslxdyj","text":"五、从 abab 到 MiniMax-01:技术路线的演进"},{"level":3,"id":"5-1-abab-xldlsyy","text":"5.1 abab 系列的历史意义"},{"level":3,"id":"5-2-jslxdb","text":"5.2 技术路线对比"},{"level":3,"id":"5-3-linear-attention-dyg","text":"5.3 Linear Attention 的预告"},{"level":2,"id":"l-skjd","text":"六、思考节点"},{"level":2,"id":"q-gjggsc","text":"七、关键规格速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/01-abab/01-abab-cdjsbwfx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/01-abab/01-abab-cdjsbwfx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ABAB 初代技术博文分析</h1>
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
