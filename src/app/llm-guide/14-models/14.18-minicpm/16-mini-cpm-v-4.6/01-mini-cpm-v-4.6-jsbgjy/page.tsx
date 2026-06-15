"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V-4.6 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型基础信息</strong></p>
<ul>
<li><strong>发布时间</strong>：2026年5月</li>
<li><strong>核心参数量</strong>：1.3B (极致微缩版本)</li>
<li><strong>核心定位</strong>：极低内存环境(如智能手表、边缘物联网设备)的多模态旗舰</li>
<li><strong>论文链接</strong>：无独立 PDF, 发布于面壁官方技术专栏</li>
<li><strong>核心特点</strong>：混合 4x/16x 视觉压缩, 同尺寸下无敌的推理密度</li>
</ul>
</blockquote>
<h2 id="1-hxjsskjd-thinking-nodes">1. 核心技术思考节点 (Thinking Nodes)</h2>
<h3 id="skjd-1-wsmynxtc-1-3b-bb">💡 思考节点 1：为什么要逆向推出 1.3B 版本？</h3>
<blockquote>
<p>在 8B 甚至 235B 横行的时代, 推出 1.3B 似乎是技术倒退。但 1.3B 的战略意义在于, 它是当今能够在 2GB 内存环境(甚至树莓派 4B)下以 20 Token/s 流畅运行的极限尺寸。面壁智能意在占领真正的“超边缘端侧”。</p>
</blockquote>
<h3 id="skjd-2-sjysdjxyz">💡 思考节点 2：视觉压缩的极限压榨</h3>
<blockquote>
<p>参数变小, 意味着大基座那套海纳百川的粗放策略失效。V-4.6 针对不同的图像区域采取了“混合比例压缩”。对于包含文字的区域, 仅做 4x 轻微压缩以保证 OCR 不退化; 对于背景蓝天白云, 直接执行 16x 乃至 64x 的毁灭性压缩。这种自适应策略是 1.3B 模型能保持多模态智商的关键。</p>
</blockquote>
<h3 id="skjd-3-sjzldzjpf">💡 思考节点 3：数据蒸馏的终极配方</h3>
<blockquote>
<p>1.3B 模型的上限完全取决于其训练数据。报告中指出, V-4.6 并非从头预训练, 而是深度吸收了 V-4.5 和 o-4.5 生成的极高质量的“思维链 (CoT)”和“多模态逻辑树”。通过海量的高维知识蒸馏, 这个小模型表现出了与其体型完全不符的推理深度。</p>
</blockquote>
<h2 id="2-hxpcydb">2. 核心评测与对比</h2>
<p>尽管只有 1.3B 参数, 但在 OpenCompass 核心多模态榜单中, 它不仅秒杀了以往 7B 级别的旧模型(如 LLaVA-1.5), 甚至逼近了许多当代的 4B 级别模型。
最可怕的是它的首字延迟(TTFT)——在骁龙普通芯片上, 读图响应时间缩短至惊人的 150ms。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxjsskjd-thinking-nodes","text":"1. 核心技术思考节点 (Thinking Nodes)"},{"level":3,"id":"skjd-1-wsmynxtc-1-3b-bb","text":"💡 思考节点 1：为什么要逆向推出 1.3B 版本？"},{"level":3,"id":"skjd-2-sjysdjxyz","text":"💡 思考节点 2：视觉压缩的极限压榨"},{"level":3,"id":"skjd-3-sjzldzjpf","text":"💡 思考节点 3：数据蒸馏的终极配方"},{"level":2,"id":"2-hxpcydb","text":"2. 核心评测与对比"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/16-mini-cpm-v-4.6/01-mini-cpm-v-4.6-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/16-mini-cpm-v-4.6/01-mini-cpm-v-4.6-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V-4.6 技术报告精译</h1>
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
