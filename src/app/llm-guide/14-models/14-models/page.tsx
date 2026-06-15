"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>主流开源模型全景解析与技术报告精读</h1>
<p>本章节系统梳理全球主流大语言模型的技术演进脉络(含开源生态与闭源反向工程)。当前物理目录已扩展为 20 个主厂商家族 + 1 个交叉/并行目录，累计 163 个模型子目录。每个模型按 D1-D5 五类交付物组织：D1 原始 PDF、D2 纯中文精译、D3 MinerU 英文原文、D4 逐段精译 + 译者注、D5 核心技术专题。</p>
<blockquote>
<p>说明：当前目录正处于持续整理期，部分家族存在“编号重复、旧目录未收敛、Ernie/Erine 并存、MinerU 重跑中”等问题。本文档统计以当前文件系统实际扫描结果为准。</p>
</blockquote>
<hr>
<h2 id="mxjzksdh">模型家族快速导航</h2>
<table>
<thead>
<tr>
<th>家族</th>
<th>模型数</th>
<th>核心定位</th>
<th>快速入口</th>
</tr>
</thead>
<tbody><tr>
<td><a href="#deepseek">DeepSeek</a></td>
<td>10</td>
<td>中国开源模型工程天花板, MoE + MLA + 推理模型</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">14.1-DeepSeek</a></td>
</tr>
<tr>
<td><a href="#qwen">Qwen</a></td>
<td>12</td>
<td>阿里通义千问全尺寸矩阵, 从 0.5B 到 235B</td>
<td><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">14.2-Qwen</a></td>
</tr>
<tr>
<td><a href="#llama">LLaMA</a></td>
<td>5</td>
<td>Meta 开源模型标杆, 从 7B 到 400B+</td>
<td><a href="/llm-guide/14-models/14.3-llama/14.3-llama">14.3-LLaMA</a></td>
</tr>
<tr>
<td><a href="#olmo">OLMo</a></td>
<td>3</td>
<td>AI2 完全白盒开源, 数据+代码+权重+日志全开放</td>
<td><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">14.4-OLMo</a></td>
</tr>
<tr>
<td><a href="#kimi">Kimi</a></td>
<td>4</td>
<td>月之暗面长上下文与 Agent 能力</td>
<td><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">14.5-Kimi</a></td>
</tr>
<tr>
<td><a href="#glm">GLM</a></td>
<td>13</td>
<td>智谱 AI GLM 架构家族, 中文对齐与 Agent</td>
<td><a href="/llm-guide/14-models/14.6-glm/14.6-glm">14.6-GLM</a></td>
</tr>
<tr>
<td><a href="#stepfun">StepFun</a></td>
<td>4</td>
<td>阶跃星辰模型-系统协同设计</td>
<td><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">14.7-StepFun</a></td>
</tr>
<tr>
<td><a href="#minimax">MiniMax</a></td>
<td>6</td>
<td>稀宇科技 Agent-native 与自我进化</td>
<td><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">14.8-MiniMax</a></td>
</tr>
<tr>
<td><a href="#mimo">MiMo</a></td>
<td>3</td>
<td>小米 AI 推理密度最大化与多模态 Agent</td>
<td><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">14.9-MiMo</a></td>
</tr>
<tr>
<td><a href="#gemma">Gemma</a></td>
<td>4</td>
<td>Google 轻量开源系列, 端侧到云端</td>
<td><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">14.10-Gemma</a></td>
</tr>
<tr>
<td><a href="#ling">Ling</a></td>
<td>6</td>
<td>零一万物 Yi 系列演进, 全双工与多模态</td>
<td><a href="#broken-link">14.16-Ling</a></td>
</tr>
<tr>
<td><a href="#minicpm">MiniCPM</a></td>
<td>16</td>
<td>面壁智能端侧巅峰, 密度定律与极致压缩</td>
<td><a href="#broken-link">14.18-MiniCPM</a></td>
</tr>
<tr>
<td><a href="#gemini">Gemini</a></td>
<td>13</td>
<td>Google 原生多模态霸主与 Project Astra</td>
<td><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">14.11-Gemini</a></td>
</tr>
<tr>
<td><a href="#openai">OpenAI</a></td>
<td>25</td>
<td>AI 革命开创者, o1 慢思考与闭源工程极限</td>
<td><a href="/llm-guide/14-models/14.12-openai/14.12-openai">14.12-OpenAI</a></td>
</tr>
<tr>
<td><a href="#claude">Claude</a></td>
<td>18</td>
<td>Anthropic 宪法 AI, Artifacts 与 Computer Use</td>
<td><a href="/llm-guide/14-models/14.13-claude/14.13-claude">14.13-Claude</a></td>
</tr>
<tr>
<td><a href="#mistral">Mistral</a></td>
<td>3</td>
<td>欧洲开源之光, 极致参数与混合专家模型</td>
<td><a href="/llm-guide/14-models/14.14-mistral/14.14-mistral">14.14-Mistral</a></td>
</tr>
<tr>
<td><a href="#xai">xAI</a></td>
<td>10</td>
<td>Grok 狂野派开源, X 全网实时数据飞轮</td>
<td><a href="/llm-guide/14-models/14.15-xai/14.15-xai">14.15-xAI</a></td>
</tr>
<tr>
<td><a href="#doubao">Doubao</a></td>
<td>2</td>
<td>字节跳动全系产品中枢引擎</td>
<td><a href="/llm-guide/14-models/14.17-doubao/14.17-doubao">14.17-Doubao</a></td>
</tr>
<tr>
<td><a href="#ernie">Ernie</a></td>
<td>2</td>
<td>百度文心一言, 飞桨框架深度绑定</td>
<td><a href="/llm-guide/14-models/14.19-ernie/14.19-ernie">14.19-Ernie</a></td>
</tr>
<tr>
<td><a href="#hunyuan">Hunyuan</a></td>
<td>2</td>
<td>腾讯混元, 微信生态与极长原生文本</td>
<td><a href="/llm-guide/14-models/14.20-hunyuan/14.20-hunyuan">14.20-Hunyuan</a></td>
</tr>
</tbody></table>
<hr>
<h2 id="deep-seek">DeepSeek</h2>
<blockquote>
<p>核心标签: MoE, MLA, GRPO, 推理模型, 长上下文, 工程极致</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>DeepSeek-Coder</td>
<td>2023-11</td>
<td>仓库级语料, FIM, 三阶段学习率</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-index">01-Coder</a></td>
</tr>
<tr>
<td>DeepSeek-Math</td>
<td>2024-02</td>
<td>GRPO 起源, 数学预训练数据工程</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-index">02-Math</a></td>
</tr>
<tr>
<td>DeepSeek-V2</td>
<td>2024-05</td>
<td>MLA, DeepSeekMoE, 细粒度专家</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/03-deep-seek-v2/05-deep-seek-v2-index">03-V2</a></td>
</tr>
<tr>
<td>DeepSeek-Coder-V2</td>
<td>2024-06</td>
<td>V2 + 代码继续预训练, FIM, GRPO</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-index">04-Coder-V2</a></td>
</tr>
<tr>
<td>DeepSeek-V3</td>
<td>2024-12</td>
<td>671B MoE, DualPipe, FP8, MTP</td>
<td>6</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/05-deep-seek-v3/05-deep-seek-v3-index">05-V3</a></td>
</tr>
<tr>
<td>DeepSeek-R1</td>
<td>2025-01</td>
<td>纯 RL 推理, GRPO, 蒸馏</td>
<td>3</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-index">06-R1</a></td>
</tr>
<tr>
<td>DeepSeek-V3.1</td>
<td>2025-03</td>
<td>V3 迭代优化</td>
<td>0</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-index">07-V3.1</a></td>
</tr>
<tr>
<td>DeepSeek-V3.2</td>
<td>2025-05</td>
<td>DSA, 可扩展 RL, Agent 合成</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-index">08-V3.2</a></td>
</tr>
<tr>
<td>DeepSeek-V3.2-Terminus</td>
<td>2025-06</td>
<td>Terminus 版本</td>
<td>0</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/09-deep-seek-v3.2-terminus/05-deep-seek-v3.2-terminus-index">09-V3.2-Terminus</a></td>
</tr>
<tr>
<td>DeepSeek-V4</td>
<td>2026-04</td>
<td>CSA/HCA, mHC, Muon, 1M 上下文</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.1-deepseek/10-deep-seek-v4/05-deep-seek-v4-index">10-V4</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">→ DeepSeek 家族演进总览</a></p>
<hr>
<h2 id="qwen">Qwen</h2>
<blockquote>
<p>核心标签: 全尺寸覆盖, 多模态, 代码, 数学, 中文对齐</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen</td>
<td>2023-08</td>
<td>初代开源, 长上下文扩展</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/01-qwen/05-qwen-index">01-Qwen</a></td>
</tr>
<tr>
<td>Qwen2</td>
<td>2024-06</td>
<td>GQA, DCA+YARN, MoE, 全尺寸</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.2-qwen/02-qwen2/05-qwen2-index">02-Qwen2</a></td>
</tr>
<tr>
<td>Qwen2-VL</td>
<td>2024-09</td>
<td>多模态视觉语言, 动态分辨率</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/05-qwen2-vl-index">03-Qwen2-VL</a></td>
</tr>
<tr>
<td>Qwen2-Audio</td>
<td>2024-10</td>
<td>音频理解, 语音对话</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/05-qwen2-audio-index">04-Qwen2-Audio</a></td>
</tr>
<tr>
<td>Qwen2.5</td>
<td>2024-12</td>
<td>Scaling Law 超参预测, GRPO, Turbo</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-index">05-Qwen2.5</a></td>
</tr>
<tr>
<td>Qwen2.5-Coder</td>
<td>2024-12</td>
<td>代码专用, 128K 上下文</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/06-qwen2.5-coder/05-qwen2.5-coder-index">06-Qwen2.5-Coder</a></td>
</tr>
<tr>
<td>Qwen2.5-Math</td>
<td>2024-12</td>
<td>数学专用, 工具集成推理</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-index">07-Qwen2.5-Math</a></td>
</tr>
<tr>
<td>Qwen2.5-VL</td>
<td>2025-01</td>
<td>视觉语言 72B, 视频理解</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/08-qwen2.5-vl/05-qwen2.5-vl-index">08-Qwen2.5-VL</a></td>
</tr>
<tr>
<td>Qwen3</td>
<td>2025-04</td>
<td>235B MoE, 混合推理模式</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/09-qwen3/05-qwen3-index">09-Qwen3</a></td>
</tr>
<tr>
<td>Qwen3.5</td>
<td>2025-07</td>
<td>混合专家, 深度思考</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/10-qwen3.5/05-qwen3.5-index">10-Qwen3.5</a></td>
</tr>
<tr>
<td>Qwen3.6</td>
<td>2025-10</td>
<td>35B-A3B 单 GPU 可运行</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-index">11-Qwen3.6</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">→ Qwen 家族演进总览</a></p>
<hr>
<h2 id="l-la-ma">LLaMA</h2>
<blockquote>
<p>核心标签: 开源模型标杆, RLHF, 安全对齐, 长上下文</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Llama-1</td>
<td>2023-02</td>
<td>开源 LLM 先河, 65B/33B/7B</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.3-llama/01-llama-1/05-llama-1-index">01-Llama-1</a></td>
</tr>
<tr>
<td>Llama-2</td>
<td>2023-07</td>
<td>RLHF, GQA, 4K 上下文</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.3-llama/02-llama-2/05-llama-2-index">02-Llama-2</a></td>
</tr>
<tr>
<td>Llama-3</td>
<td>2024-07</td>
<td>405B Dense, 128K 上下文</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.3-llama/03-llama-3/05-llama-3-index">03-Llama-3</a></td>
</tr>
<tr>
<td>Llama-4</td>
<td>2025-04</td>
<td>Scout/Maverick, 10M 上下文</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.3-llama/04-llama-4/05-llama-4-index">04-Llama-4</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.3-llama/14.3-llama">→ LLaMA 家族演进总览</a></p>
<hr>
<h2 id="olmo">OLMo</h2>
<blockquote>
<p>核心标签: 完全白盒, 训练日志全开放, 科学可复现</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>OLMo</td>
<td>2024-02</td>
<td>完全开源, 训练日志, 数据配方</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.4-olmo/01-olmo/05-olmo-index">01-OLMo</a></td>
</tr>
<tr>
<td>OLMo-2</td>
<td>2025-01</td>
<td>训练稳定性, 数据科学</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.4-olmo/02-olmo-2/05-olmo-2-index">02-OLMo-2</a></td>
</tr>
<tr>
<td>OLMo-3</td>
<td>2025-10</td>
<td>OLMoE 细粒度 MoE, 路由专业化</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.4-olmo/03-olmo-3/05-olmo-3-index">03-OLMo-3</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">→ OLMo 家族演进总览</a></p>
<hr>
<h2 id="kimi">Kimi</h2>
<blockquote>
<p>核心标签: 长上下文, Agent, 多模态</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Kimi-Chat</td>
<td>2023-10</td>
<td>20万/200万 长上下文</td>
<td>0</td>
<td><a href="/llm-guide/14-models/14.5-kimi/01-kimi-chat/05-kimi-chat-index">01-Kimi-Chat</a></td>
</tr>
<tr>
<td>Kimi-K2</td>
<td>2025-01</td>
<td>Agentic 训练体系</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-index">02-Kimi-K2</a></td>
</tr>
<tr>
<td>Kimi-K2.5</td>
<td>2025-04</td>
<td>原生多模态 Agent, Agent-Swarm</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-index">03-Kimi-K2.5</a></td>
</tr>
<tr>
<td>Kimi-K2.6</td>
<td>2025-10</td>
<td>多模态与 Agent 能力</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.5-kimi/04-kimi-k2.6/05-kimi-k2.6-index">04-Kimi-K2.6</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">→ Kimi 家族演进总览</a></p>
<hr>
<h2 id="glm">GLM</h2>
<blockquote>
<p>核心标签: 中文对齐, Agent, 视觉, 长程任务</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>GLM-130B</td>
<td>2022-10</td>
<td>双向稠密注意力, 二维 RoPE</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/01-glm-130b/05-glm-130b-index">01-GLM-130B</a></td>
</tr>
<tr>
<td>ChatGLM</td>
<td>2023-03</td>
<td>三代迭代, 开源生态</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/02-chat-glm/05-chat-glm-index">02-ChatGLM</a></td>
</tr>
<tr>
<td>GLM-4</td>
<td>2024-06</td>
<td>中文对齐, 全工具调用</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/03-glm-4/05-glm-4-index">03-GLM-4</a></td>
</tr>
<tr>
<td>GLM-4-Voice</td>
<td>2024-10</td>
<td>端到端语音对话, 低延迟</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-index">04-GLM-4-Voice</a></td>
</tr>
<tr>
<td>GLM-Z1</td>
<td>2025-01</td>
<td>隐式思考链, PRM, 推理后训练</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/05-glm-z1/05-glm-z1-ysskly-prm-yl">05-GLM-Z1</a></td>
</tr>
<tr>
<td>GLM-5</td>
<td>2025-04</td>
<td>预训练到后训练全链路</td>
<td>1</td>
<td><a href="#broken-link">06-GLM-5</a></td>
</tr>
<tr>
<td>GLM-5-Turbo</td>
<td>2025-06</td>
<td>高效推理版本</td>
<td>0</td>
<td><a href="#broken-link">07-GLM-5-Turbo</a></td>
</tr>
<tr>
<td>GLM-5V-Turbo</td>
<td>2025-08</td>
<td>多模态 Agent 架构</td>
<td>1</td>
<td><a href="#broken-link">08-GLM-5V-Turbo</a></td>
</tr>
<tr>
<td>GLM-5.1</td>
<td>2025-10</td>
<td>8 小时长程 Agent</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.6-glm/11-glm-5.1/05-glm-5.1-index">11-GLM-5.1</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.6-glm/14.6-glm">→ GLM 家族演进总览</a></p>
<hr>
<h2 id="step-fun">StepFun</h2>
<blockquote>
<p>核心标签: 模型-系统协同, 解码成本优化</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Step-1</td>
<td>2023-10</td>
<td>早期 Dense 模型训练探索</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.7-stepfun/01-step-1/05-step-1-qy-dense-mxdgxxlyssyqjy">01-Step-1</a></td>
</tr>
<tr>
<td>Step-2</td>
<td>2024-03</td>
<td>万亿 MoE 从头训练与系统协同优化</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.7-stepfun/02-step-2/05-step-2-wy-moe-ctxlyxtxtyh">02-Step-2</a></td>
</tr>
<tr>
<td>Step-3</td>
<td>2024-06</td>
<td>模型-系统协同设计</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.7-stepfun/02-step-3/05-step-3-index">02-Step-3</a></td>
</tr>
<tr>
<td>Step-3.5-Flash</td>
<td>2025-02</td>
<td>Agentic 低延迟, 可扩展 RL</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-index">03-Step-3.5-Flash</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">→ StepFun 家族演进总览</a></p>
<hr>
<h2 id="mini-max">MiniMax</h2>
<blockquote>
<p>核心标签: Agent-native, 自我进化, 多智能体协作</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>ABAB</td>
<td>2023-04</td>
<td>早期技术博文</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.8-minimax/01-abab/05-abab-index">01-ABAB</a></td>
</tr>
<tr>
<td>MiniMax-M2</td>
<td>2024-10</td>
<td>Lightning Attention, MoE, 长上下文</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.8-minimax/02-mini-max-m2/05-mini-max-m2-lightning-attention-jx">02-M2</a></td>
</tr>
<tr>
<td>MiniMax-M2.1</td>
<td>2024-11</td>
<td>交错思考与动态专家路由</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.8-minimax/03-mini-max-m2.1/05-mini-max-m2.1-jcskydtzjly">03-M2.1</a></td>
</tr>
<tr>
<td>MiniMax-M2.5</td>
<td>2025-04</td>
<td>Agent-native RL, 真实世界生产力</td>
<td>3</td>
<td><a href="/llm-guide/14-models/14.8-minimax/04-mini-max-m2.5/05-mini-max-m2.5-index">04-M2.5</a></td>
</tr>
<tr>
<td>MiniMax-M2.7</td>
<td>2025-10</td>
<td>模型自我进化, Harness 优化</td>
<td>3</td>
<td><a href="/llm-guide/14-models/14.8-minimax/05-mini-max-m2.7/05-mini-max-m2.7-index">05-M2.7</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">→ MiniMax 家族演进总览</a></p>
<hr>
<h2 id="mimo">MiMo</h2>
<blockquote>
<p>核心标签: 推理密度, RL 基础设施, 多模态 Agent</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>MiMo-7B</td>
<td>2025-04</td>
<td>推理密度最大化, RL 基础设施</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.9-mimo/01-mimo-7b/05-mimo-7b-index">01-MiMo-7B</a></td>
</tr>
<tr>
<td>MiMo-V2-Flash</td>
<td>2025-08</td>
<td>混合注意力, MOPD 后训练</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.9-mimo/02-mimo-v2-flash/05-mimo-v2-flash-index">02-V2-Flash</a></td>
</tr>
<tr>
<td>MiMo-V2.5</td>
<td>2025-10</td>
<td>全模态 Agentic 能力</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.9-mimo/03-mimo-v2.5/05-mimo-v2.5-index">03-V2.5</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">→ MiMo 家族演进总览</a></p>
<hr>
<h2 id="gemma">Gemma</h2>
<blockquote>
<p>核心标签: Google 轻量开源, 端侧部署, 多模态</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma-1</td>
<td>2024-02</td>
<td>开源基座起点, Multi-Query Attention</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.10-gemma/01-gemma-1/05-gemma-1-multi-query-attention">01-Gemma-1</a></td>
</tr>
<tr>
<td>Gemma-2</td>
<td>2024-06</td>
<td>蒸馏强化与轻量高效迭代</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.10-gemma/02-gemma-2/05-gemma-2-index">02-Gemma-2</a></td>
</tr>
<tr>
<td>Gemma-3</td>
<td>2025-03</td>
<td>1B/4B/12B/27B 全尺寸, 多模态长上下文</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.10-gemma/03-gemma-3/05-gemma-3-index">03-Gemma-3</a></td>
</tr>
<tr>
<td>Gemma-4</td>
<td>2025-10</td>
<td>端侧到云端, 架构迭代</td>
<td>2</td>
<td><a href="/llm-guide/14-models/14.10-gemma/04-gemma-4/05-gemma-4-index">04-Gemma-4</a></td>
</tr>
</tbody></table>
<p><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">→ Gemma 家族演进总览</a></p>
<hr>
<h2 id="ling">Ling</h2>
<blockquote>
<p>核心标签: 多模态, API 优先, RAG 套件, Yi 家族延续</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>Ling-Lite</td>
<td>2024-05</td>
<td>零一万物大模型基础版</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.16-ling/01-ling-lite/05-ling-lite-edit-ybxlcl">01-Ling-Lite</a></td>
</tr>
<tr>
<td>Ling-Plus</td>
<td>2024-08</td>
<td>RAG 支持, 代码能力提升</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.16-ling/02-ling-plus/05-ling-plus-kptxldq">02-Ling-Plus</a></td>
</tr>
<tr>
<td>Ling-2.0</td>
<td>2024-10</td>
<td>Evo-CoT 与 LPO 进化式推理训练</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.16-ling/03-ling-2.0/05-ling-2.0-evo-cot-y-lpo-jhstlxl">03-Ling-2.0</a></td>
</tr>
<tr>
<td>Ling-2.5</td>
<td>2025-01</td>
<td>混合线性注意力架构</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.16-ling/04-ling-2.5/05-ling-2.5-hhxxzyljg">04-Ling-2.5</a></td>
</tr>
</tbody></table>
<p><a href="#broken-link">→ Ling 家族演进总览</a></p>
<hr>
<h2 id="mini-cpm">MiniCPM</h2>
<blockquote>
<p>核心标签: 端侧大模型, 密度定律, 极致压缩, Omni-Flow</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>核心创新</th>
<th>D5 专题数</th>
<th>入口</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-2B</td>
<td>2024-02</td>
<td>端侧基座首发, 密度定律起点</td>
<td>1</td>
<td><a href="#broken-link">01-2B</a></td>
</tr>
<tr>
<td>MiniCPM-1.2B</td>
<td>2024-04</td>
<td>参数减半, 速度提升 38%</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/02-mini-cpm-1.2b/05-mini-cpm-1.2b-sdssydcysjg">02-1.2B</a></td>
</tr>
<tr>
<td>MiniCPM-2B-128K</td>
<td>2024-04</td>
<td>最小 128K 长文本</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/03-mini-cpm-2b-128k/05-mini-cpm-2b-128k-csxwkzydcbs">03-2B-128K</a></td>
</tr>
<tr>
<td>MiniCPM-MoE-8x2B</td>
<td>2024-04</td>
<td>MoE 架构, 推理成本低</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/04-mini-cpm-moe-8x2b/05-mini-cpm-moe-8x2b-hhzjjgydcxsjh">04-MoE-8x2B</a></td>
</tr>
<tr>
<td>MiniCPM-V-2.0</td>
<td>2024-04</td>
<td>2.8B, OCRBench 开源最优</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/05-mini-cpm-v-2.0/05-mini-cpm-v-2.0-dcdmtjgyzsygfbssjbm">05-V-2.0</a></td>
</tr>
<tr>
<td>MiniCPM-Llama3-V-2.5</td>
<td>2024-05</td>
<td>超越 GPT-4V</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/06-mini-cpm-llama3-v-2.5/05-mini-cpm-llama3-v-2.5-rlaif-v-dmtdqykkz-ai-fk">06-Llama3-V-2.5</a></td>
</tr>
<tr>
<td>MiniCPM-S-1.2B</td>
<td>2024-07</td>
<td>ProSparse 稀疏激活</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/07-mini-cpm-s-1.2b/05-mini-cpm-s-1.2b-pro-sparse-xsjhydctljs">07-S-1.2B</a></td>
</tr>
<tr>
<td>MiniCPM-V-2.6</td>
<td>2024-08</td>
<td>视频理解 + 多图联合推理</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/08-mini-cpm-v-2.6/05-mini-cpm-v-2.6-spljydcdmtsstl">08-V-2.6</a></td>
</tr>
<tr>
<td>MiniCPM-o-2.6</td>
<td>2025-01</td>
<td>全模态系列起点</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/09-mini-cpm-o-2.6/05-mini-cpm-o-2.6-qmtdddjgysslsjh">09-o-2.6</a></td>
</tr>
<tr>
<td>MiniCPM3-4B</td>
<td>2024-09</td>
<td>LLMxMapReduce 无限长文本</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/10-mini-cpm3-4b/05-mini-cpm3-4b-dcgjtyywxcwbcl">10-MiniCPM3-4B</a></td>
</tr>
<tr>
<td>MiniCPM-4.0</td>
<td>2025-06</td>
<td>InfLLM v2 稀疏注意力</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/11-mini-cpm-4.0/05-mini-cpm-4.0-inf-llm-v2-xszylydctljs">11-4.0</a></td>
</tr>
<tr>
<td>MiniCPM-4.1</td>
<td>2025-09</td>
<td>混合推理模型</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/12-mini-cpm-4.1/05-mini-cpm-4.1-hhtlmsydcsklyh">12-4.1</a></td>
</tr>
<tr>
<td>MiniCPM-V-4.0</td>
<td>2025-08</td>
<td>端侧实时交互</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/13-mini-cpm-v-4.0/05-mini-cpm-v-4.0-dcdmtmxdncyjsyh">13-V-4.0</a></td>
</tr>
<tr>
<td>MiniCPM-V-4.5</td>
<td>2025-08</td>
<td>3D-Resampler + 10FPS 视频</td>
<td>1</td>
<td><a href="#broken-link">14-V-4.5</a></td>
</tr>
<tr>
<td>MiniCPM-o-4.5</td>
<td>2026-02</td>
<td>全双工全模态, Omni-Flow</td>
<td>1</td>
<td><a href="#broken-link">15-o-4.5</a></td>
</tr>
<tr>
<td>MiniCPM-V-4.6</td>
<td>2026-05</td>
<td>1.3B, 混合 4x/16x 视觉压缩</td>
<td>1</td>
<td><a href="/llm-guide/14-models/14.18-minicpm/16-mini-cpm-v-4.6/05-mini-cpm-v-4.6-hhsjysjgytlmd">16-V-4.6</a></td>
</tr>
</tbody></table>
<p><a href="#broken-link">→ MiniCPM 家族演进总览</a></p>
<hr>
<h2 id="hxdbjz">横向对比矩阵</h2>
<table>
<thead>
<tr>
<th>技术维度</th>
<th>DeepSeek</th>
<th>Qwen</th>
<th>LLaMA</th>
<th>OLMo</th>
<th>Kimi</th>
<th>GLM</th>
<th>MiniMax</th>
<th>MiMo</th>
<th>Ling</th>
<th>MiniCPM</th>
</tr>
</thead>
<tbody><tr>
<td>注意力创新</td>
<td>MLA, CSA/HCA</td>
<td>GQA, DCA+YARN</td>
<td>GQA</td>
<td>标准</td>
<td>标准</td>
<td>标准</td>
<td>Lightning Attention</td>
<td>混合注意力</td>
<td>标准</td>
<td>InfLLM v2 / 稀疏</td>
</tr>
<tr>
<td>MoE 架构</td>
<td>DeepSeekMoE</td>
<td>DeepSeekMoE</td>
<td>无</td>
<td>OLMoE</td>
<td>无</td>
<td>无</td>
<td>MoE</td>
<td>MoE</td>
<td>无</td>
<td>端侧微型 MoE</td>
</tr>
<tr>
<td>长上下文</td>
<td>1M (CSA/HCA)</td>
<td>128K (YARN)</td>
<td>10M ( Scout )</td>
<td>标准</td>
<td>200K+</td>
<td>标准</td>
<td>400K+</td>
<td>标准</td>
<td>128K+</td>
<td>128K (LLMxMapReduce)</td>
</tr>
<tr>
<td>推理优化</td>
<td>FP8/FP4, DualPipe</td>
<td>FP8</td>
<td>BF16</td>
<td>BF16</td>
<td>BF16</td>
<td>BF16</td>
<td>FP8</td>
<td>FP8</td>
<td>BF16</td>
<td>BitCPM / 混合量化</td>
</tr>
<tr>
<td>后训练</td>
<td>GRPO, 蒸馏</td>
<td>DPO, GRPO</td>
<td>RLHF, DPO</td>
<td>SFT</td>
<td>SFT, RL</td>
<td>RLCS</td>
<td>RL</td>
<td>MOPD, RL</td>
<td>RLHF-V</td>
<td>RLAIF-V, 蒸馏</td>
</tr>
<tr>
<td>开源协议</td>
<td>MIT</td>
<td>Apache 2.0 / Qwen</td>
<td>Llama 3.1</td>
<td>Apache 2.0</td>
<td>未开源</td>
<td>部分开源</td>
<td>未开源</td>
<td>Apache 2.0</td>
<td>Apache 2.0</td>
<td>Apache 2.0</td>
</tr>
</tbody></table>
<hr>
<h2 id="jfwztsc">交付物状态速查</h2>
<ul>
<li><strong>D1 原始 PDF</strong>: 79/163 子目录已获取 PDF</li>
<li><strong>D2 纯中文精译</strong>: 131/163 子目录已完成</li>
<li><strong>D3 MinerU-EN</strong>: 53/163 子目录已完成</li>
<li><strong>D4 逐译+译者注</strong>: 37/163 子目录已完成</li>
<li><strong>D5 核心技术专题</strong>: 149/163 子目录已完成</li>
<li><strong>02 核心架构剖析</strong>: 23/121 已完成 CONTENT (98/121 骨架待填充). 按家族: DeepSeek 7/10, Qwen 3/11, LLaMA 2/4, OLMo 2/3, Kimi 2/4, GLM 3/9, StepFun 1/3, MiniMax 1/4, MiMo 1/3, Gemma 1/2, Ling 0/4, MiniCPM 16/16, Gemini 10/10, OpenAI 15/15, Claude 11/11, Mistral 3/3, xAI 3/3, Doubao 2/2, Ernie 2/2, Hunyuan 2/2.</li>
</ul>
<blockquote>
<p>当前主要问题不是 D5，而是 D3/D4 覆盖率明显落后，同时存在多组目录编号重复，导致总览与进度文档长期失真。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"mxjzksdh","text":"模型家族快速导航"},{"level":2,"id":"deep-seek","text":"DeepSeek"},{"level":2,"id":"qwen","text":"Qwen"},{"level":2,"id":"l-la-ma","text":"LLaMA"},{"level":2,"id":"olmo","text":"OLMo"},{"level":2,"id":"kimi","text":"Kimi"},{"level":2,"id":"glm","text":"GLM"},{"level":2,"id":"step-fun","text":"StepFun"},{"level":2,"id":"mini-max","text":"MiniMax"},{"level":2,"id":"mimo","text":"MiMo"},{"level":2,"id":"gemma","text":"Gemma"},{"level":2,"id":"ling","text":"Ling"},{"level":2,"id":"mini-cpm","text":"MiniCPM"},{"level":2,"id":"hxdbjz","text":"横向对比矩阵"},{"level":2,"id":"jfwztsc","text":"交付物状态速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14-models" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14-models" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">主流开源模型全景解析与技术报告精读</h1>
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
