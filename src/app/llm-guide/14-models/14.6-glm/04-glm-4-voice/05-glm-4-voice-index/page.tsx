"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4-Voice 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.6-glm/14.6-glm">14.6-GLM</a></p>
</blockquote>
<p>GLM-4-Voice(arXiv:2412.02612)是智谱首个<strong>端到端语音对话</strong>模型: 12.5Hz / <strong>175bps</strong> 单码本监督语义 token + Flow Matching 解码器 + GLM-4-9B 基座, 1T token 语音-文本联合预训练, 支持中英实时对话与情感/语调/方言控制.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.6-glm/04-glm-4-voice/01-glm-4-voice-jsbgjy">01-GLM-4-Voice 技术报告精译</a></td>
<td>中文精译主稿(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-GLM-4-Voice-mineru-en</a></td>
<td>MinerU 英文原文(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-GLM-4-Voice-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-architecture-overview">05-GLM-4-Voice-Architecture-Overview</a></td>
<td>低延迟与 Streaming Thoughts 专题</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>语音对话模型面临三重矛盾:</p>
<ol>
<li><strong>数据稀缺</strong>: 真实语音语料远少于文本, 如何迁移 GLM-4 的文本知识?</li>
<li><strong>延迟</strong>: 级联 ASR+LLM+TTS 串行延迟高, 如何实现低首包延迟?</li>
<li><strong>表达力</strong>: 语义 token 码率低但丢声学细节, 如何兼顾 intelligibility 与 naturalness?</li>
</ol>
<p>GLM-4-Voice 选择「监督语义 token + 专用解码器 + 文本-语音交错预训练」路线, 对标 Moshi / Llama-Omni 等端到端方案.</p>
<h2 id="ffcj">方法拆解</h2>
<p><strong>Speech Tokenizer (175bps, 12.5Hz)</strong></p>
<ul>
<li>从 Whisper ASR Encoder <strong>中间层</strong>插入 VQ 瓶颈, 单码本 EMA 码本.</li>
<li>池化 50Hz→12.5Hz, 比 RVQ 声学 codec 更适合自回归 LLM.</li>
</ul>
<p><strong>Speech Decoder</strong></p>
<ul>
<li>Flow Matching 两阶段: 预训练(脏数据) + 微调(干净数据).</li>
<li>从离散 token 重建波形, 补全声学细节.</li>
</ul>
<p><strong>GLM-4-Voice 主体</strong></p>
<ul>
<li>基座 GLM-4-9B-Base; 1T token 预训练(455B Speech-Text 交错 + 31B 纯语音 + 10T 文本 0.03 epoch).</li>
<li><strong>Streaming Thoughts</strong>: 13 文本 token : 26 语音 token 交替, 降低首包延迟(~3s).</li>
<li>SFT: 损失掩码分离 S→T 与 S→S 目标; 20 epoch 语音 / 4 epoch 文本.</li>
</ul>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>模块</th>
<th>工程要点</th>
</tr>
</thead>
<tbody><tr>
<td>码率</td>
<td>175bps vs Mimi 1.1Kbps, MOS 仍达 3.39</td>
</tr>
<tr>
<td>推理</td>
<td>解耦 S→T 再 S→S + Streaming 模板</td>
</tr>
<tr>
<td>评测</td>
<td>Llama Questions S→S 50.7% vs Moshi 21.0%</td>
</tr>
<tr>
<td>开源</td>
<td>GitHub THUDM/GLM-4-Voice</td>
</tr>
</tbody></table>
<p><strong>与 Moshi 对比</strong>: Moshi 堆 700 万小时真实语音; GLM-4-Voice 用<strong>合成交错数据</strong>做知识迁移, 数据效率更高.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>: 端到端语音 Agent、低码率语音 token 研究、中英双语口语交互.</p>
<p><strong>边界</strong>:</p>
<ul>
<li>S→T 仍优于 S→S, 纯语音推理未完全替代文本中间表示.</li>
<li>评测部分限制英文输出, 掩盖双语真实表现.</li>
<li>GPT-4o judge + ASR 转写评测存在方法论偏差.</li>
<li>hybrid_auto 仅 2 张主文图, 部分表格依赖 MinerU details 块.</li>
</ul>
<p><strong>谱系</strong>: GLM-4 文本平台 → <strong>GLM-4-Voice</strong> 语音模态扩展.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4-Voice Index</h1>
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
