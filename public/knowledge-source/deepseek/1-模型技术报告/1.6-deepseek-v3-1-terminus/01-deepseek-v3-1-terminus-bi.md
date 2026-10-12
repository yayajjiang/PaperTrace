---
title: "01 · DeepSeek-V3.1-Terminus · 对照译稿"
category: "模型技术报告"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-V3.1-Terminus 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 2 -->

# DeepSeek-V3.1-Terminus


## DeepSeek-V3.1 → DeepSeek-V3.1-Terminus


The latest update builds on V3.1’s strengths while addressing key user feedback.



本次更新在 V3.1 既有优势上继续推进, 并回应了用户反馈里较关键的几项.

## ✨ What’s improved? 有哪些改进?


🌐 Language consistency: fewer CN/EN mix-ups & no more random chars.



🌐 语言一致性: 中英文混杂更少, 也不再冒出随机乱码字符.

(「CN/EN mix-ups」指同一段回复里中英文无规则切换;「random chars」是源文对异常乱码/噪声字符的说法, 本稿只复述现象, 不推断训练侧具体修法.)

🤖 Agent upgrades: stronger Code Agent & Search Agent performance.



🤖 Agent 升级: Code Agent 与 Search Agent 表现更强.

(Code Agent / Search Agent: 发布说明里的两类智能体能力标签, 分别对应偏代码修复与偏浏览检索的工具使用场景; 源文未写内部实现名.)

📊 DeepSeek-V3.1-Terminus delivers more stable & reliable outputs across benchmarks compared to the previous version.



📊 相对上一版, DeepSeek-V3.1-Terminus 在各项基准上给出更稳定, 更可靠的输出.

(「previous version」在本稿对照表里就是 DeepSeek-V3.1;「stable & reliable」是官方定性表述, 具体数字以下一页表格为准.)

<!-- page 2 of 2 -->

| Benchmark | DeepSeek-V3.1 | DeepSeek-V3.1-Terminus |
| --- | --- | --- |
| reasoning mode w/o tool use | | |
| MMLU-Pro | 84.8 | 85.0 |
| GPQA-Diamond | 80.1 | 80.7 |
| Humanity's Last Exam | 15.9 | 21.7 |
| LiveCodeBench | 74.8 | 74.9 |
| Codeforces | 2091 | 2046 |
| Aider-Polyglot | 76.3 | 76.1 |
| agentic tool use | | |
| BrowseComp | 30.0 | 38.5 |
| BrowseComp-zh | 49.2 | 45.0 |
| SimpleQA | 93.4 | 96.8 |
| SWE Verified | 66.0 | 68.4 |
| SWE-bench Multilingual | 54.5 | 57.8 |
| Terminal-bench | 31.3 | 36.7 |

(表结构与源文一致: 两组分组行 `reasoning mode w/o tool use`(不用工具的推理模式), `agentic tool use`(带工具的智能体用法)跨列占位. 数字一字不改. 同组内有升有降, 见 analysis.)

👉 Available now on: App / Web / API



👉 现已可在 App / Web / API 使用

Open-source weights here: [https://huggingface. co/deepseek-ai/DeepSeek-V3.1-Terminus](https://huggingface. co/deepseek-ai/DeepSeek-V3.1-Terminus)



开源权重见此: [https://huggingface. co/deepseek-ai/DeepSeek-V3.1-Terminus](https://huggingface. co/deepseek-ai/DeepSeek-V3.1-Terminus)

Thanks to everyone for your feedback. It drives us to keep improving and refining the experience!



感谢大家的反馈. 反馈推动我们持续改进与打磨体验!
