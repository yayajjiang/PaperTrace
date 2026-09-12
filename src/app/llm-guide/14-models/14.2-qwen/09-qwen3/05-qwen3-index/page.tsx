"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">14.2-Qwen</a></p>
</blockquote>
<p>Qwen3 的核心价值不是单一 benchmark 提升，而是把“深度思考”和“快速响应”两种行为统一进同一模型族里，再配合 thinking budget、长上下文扩展、通用 RL 和强到弱蒸馏，形成一条兼顾旗舰性能与小模型落地的完整训练路线。它代表的是 Qwen 系列从“强基础模型”向“可控推理系统”转型的一步。</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.2-qwen/09-qwen3/01-qwen3-jsbgjy">01-Qwen3技术报告精译</a></td>
<td>技术报告精译与主线整理</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.2-qwen/09-qwen3/02-qwen3-hxjgpx">02-Qwen3核心架构剖析</a></td>
<td>双模式统一框架、MoE 与训练设计拆解</td>
</tr>
<tr>
<td><a href="#broken-link">03-Qwen3-mineru-en</a></td>
<td>英文抽取底稿</td>
</tr>
<tr>
<td><a href="#broken-link">04-Qwen3-mineru-zh</a></td>
<td>中文交付稿</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.2-qwen/09-qwen3/05-qwen3-architecture-overview">05-Qwen3-Architecture-Overview</a></td>
<td>架构总览与工程视角补充</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen3 解决的问题可以概括为三个层面。第一，如何让同一个模型同时支持复杂推理任务和日常对话任务，避免用户在“推理模型”和“聊天模型”之间切换。第二，如何把大模型的推理能力稳定蒸馏到更小尺寸，使 0.6B 到 30B 级模型也能具备可用的 reasoning 行为。第三，如何在长上下文、多语言、Agent、代码和数学这些高需求场景里保持统一能力，而不是靠多套专用模型拼接。</p>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen3 的方法主线分为预训练和后训练两部分。预训练阶段使用 36T tokens，并采用“通用数据 -&gt; 推理增强数据 -&gt; 长上下文数据”的三阶段流程，把基础语言能力、STEM/代码能力和长序列能力逐段抬高。后训练阶段则围绕双模式统一展开：先用 Long-CoT cold start 建立显式推理格式，再用 reasoning RL 强化数学与代码推理，然后通过 thinking mode fusion 把思考模式与非思考模式合并到同一模板体系中，最后用 general RL 扩展通用任务能力。对于小模型，Qwen3 没有照搬旗舰模型的完整 RL 路线，而是采用 strong-to-weak distillation，以更低训练成本继承大模型的推理能力。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程实现上看，Qwen3 最关键的设计是“行为统一”而不是单纯“参数做大”。聊天模板中的 <code>/think</code> 与 <code>/no_think</code> 让模式切换前移到接口层，thinking budget 则把推理深度变成可调参数，这对线上时延控制非常重要。架构上，Qwen3 同时覆盖 dense 与 MoE 路线，并在 MoE 设计里取消共享专家，说明团队更看重细粒度专家路由的效率和可扩展性。长上下文能力依赖 ABF、YaRN、DCA 等扩展策略，意味着它不是靠粗暴堆长文本训练出来，而是通过训练和推理阶段联合优化拿到可用窗口。整体看，Qwen3 是一套从数据、训练、接口到部署策略都比较完整的产品级 LLM 工程方案。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen3 适合的场景非常明确：需要在同一模型体系内兼顾推理、对话、代码、数学、多语言和 Agent 能力的团队，可以直接把它当成统一基座。旗舰模型适合高质量 reasoning 与复杂任务编排，小模型则更适合成本敏感或边缘侧部署。但它也有清晰边界：thinking mode 与 non-thinking mode 的统一会带来能力折中，通用 RL 还可能轻微稀释极限推理表现; thinking budget 虽然可控，但不是所有任务都适合强行拉长思考; 长上下文和 Agent 能力仍然依赖外围工具、环境反馈与系统级约束。Qwen3 的强项是“统一和可控”，不是在每个单点任务上都绝对最优。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/09-qwen3/05-qwen3-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/09-qwen3/05-qwen3-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3 Index</h1>
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
