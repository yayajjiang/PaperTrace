"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-VL 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">14.2-Qwen</a></p>
</blockquote>
<p>Qwen2.5-VL 是 Qwen 视觉语言路线里一次明显的工程升级。它不只是把图像接进语言模型，而是同时重做了视觉编码、时序位置建模、视频采样策略、长文档与 GUI 数据构造，以及后训练阶段的多模态对齐流程，目标是把文档理解、视频定位和 Agent 操作放进同一套模型能力栈里。</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.2-qwen/08-qwen2.5-vl/01-qwen2.5-vl-jsbgjy">01-Qwen2.5-VL技术报告精译</a></td>
<td>报告精译与技术背景整理</td>
</tr>
<tr>
<td><a href="#broken-link">03-Qwen2.5-VL-mineru-en</a></td>
<td>英文抽取底稿</td>
</tr>
<tr>
<td><a href="#broken-link">04-Qwen2.5-VL-mineru-zh</a></td>
<td>中文交付稿</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-architecture-overview">05-Qwen2.5-VL-Architecture-Overview</a></td>
<td>视觉编码与多模态架构拆解</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen2.5-VL 解决的不是单点 OCR 或单张图片问答，而是更接近真实生产环境的多模态理解问题：高分辨率文档要保留布局与绝对坐标，长视频要同时理解事件内容和发生时间，界面操作要在复杂 GUI 中完成元素定位与动作决策。传统固定分辨率视觉编码和简单帧采样在这些任务上都会丢失关键信息，因此报告的核心问题是，如何在可控计算成本下，把空间尺度、时间尺度和操作语义一起建模进统一的 VLM。</p>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen2.5-VL 的方法主线可以拆成四层。第一层是视觉侧，采用原生动态分辨率输入和窗口注意力 ViT，让模型在不强行拉伸到固定尺寸的前提下保留图像尺度与宽高比。第二层是跨模态桥接，通过 MLP-based Vision-Language Merger 把视觉 token 压缩并接入 Qwen2.5 LLM。第三层是时序建模，MRoPE 不再只编码帧序号，而是引入与绝对时间对齐的时间 ID，使模型可以回答“第几秒发生了什么”这一类问题。第四层是数据与训练，报告把预训练数据扩展到 4.1T tokens，并对文档、定位、OCR、视频和 Agent 数据做了专项构造，使模型能力不是靠单一 benchmark 微调堆出来，而是靠全栈数据分布支撑。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程视角看，Qwen2.5-VL 的价值在于几组可落地设计。窗口注意力只在少数层保留全局注意力，说明团队在视觉成本和全局建模之间做了明确折中; 视频采用动态 FPS 和帧合并策略，本质上是在 token 预算固定时优先保留事件覆盖率; 文档与 GUI 数据支持绝对坐标监督，这直接服务于截图理解、屏幕定位和 Agent 执行。后训练阶段冻结 ViT、重点优化跨模态对齐和指令跟随，也说明视觉表征在预训练阶段已基本定型，后续增益更多来自任务格式、偏好对齐和推理链构造。整体上，这是一套明显偏工业系统设计的多模态方案，而不是只追求学术演示分数的论文原型。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen2.5-VL 的强项非常明确：文档解析、OCR、多图理解、视频时序定位、屏幕元素定位和通用多模态问答都具备较强竞争力，尤其适合需要统一处理截图、文档、视频和操作界面的应用栈。它的边界也同样清楚：开放式长程 Agent 任务依然受制于规划、记忆和错误恢复，不是光靠视觉定位精度就能解决; 超长视频仍然受帧数和 token 上限约束; 复杂桌面自动化场景里，模型输出仍需要外部执行器、状态管理和安全约束配合。换句话说，Qwen2.5-VL 已经是强基座，但不是完整自治 Agent 系统本身。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-VL Index</h1>
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
