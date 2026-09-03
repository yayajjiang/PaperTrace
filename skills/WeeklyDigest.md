# PaperTrace · 每周周报 Skill

> 使用 [`attention-curator`](./attention-curator/SKILL.md) 将影响力、火爆度与实用性分开评估；不要用一周的社交热度替代技术影响判断。

每周（通常周五或周日）整理一周 ML/AI 精华，发到 PaperTrace 日报页面作为"本周精选"专题。

---

## 0. 周报 vs 日报

| | 日报 | 周报 |
|--|------|------|
| 频率 | 每天 | 每周一次 |
| 数量 | 2–5 篇 | 5–10 篇精选 + 1 本周主题 |
| 深度 | 一句话 why | 可以有 2–3 句背景 |
| 标记 | pick 给最强 1 篇 | 所有入选都是 pick 级别 |
| 重点 | 新鲜感 | 回顾 + 影响评估 |

---

## 1. 本周内容收集（周一到周四持续记录）

**建议维护一个临时 scratchpad**（本地 `weekly-draft.md`）：

```markdown
# 本周草稿 YYYY-WW

## Papers 候选
- [ ] arXiv XXXX.XXXXX — [一句话]
- [ ] ...

## News 候选
- [ ] ...

## 本周主题（待定）
```

每天花 5 分钟把觉得有意思的条目扔进来，不用写完整字段，先记标题和 arxiv ID 就够。

---

## 2. 周五：筛选 + 定主题

### 2.1 定本周主题

从候选里找一个"本周 narrative"：

```
这周的主线是什么？
  - 技术方向：某个方法突然大量论文？（如 reasoning、diffusion LM）
  - 行业事件：某个模型发布引发讨论？
  - 社区话题：某个争议/共识正在形成？
```

主题不超过一句话：
```
例："本周 diffusion LM 爆发：三篇论文从效率、理论、scale 三个角度推进"
例："本周 reasoning 系列：CoT → RL → 推理时计算，一条技术脉络"
```

### 2.2 从候选里选 5–10 篇

筛选标准（按优先级）：
1. 和本周主题直接相关
2. 本周 HuggingFace Papers 人气最高
3. 来自顶会/顶实验室
4. 对求职者有实际价值（新技术栈、面试考点）

---

## 3. 写周报条目

### Paper 条目（格式同日报，但 why 可以更详细）

```ts
{
  date: "YYYY-MM-DD",           // 本周周日日期
  title: "英文原标题",
  titleZh: "中文标题",
  authors: "第一作者 et al.",
  arxivId: "XXXX.XXXXX",
  tags: ["Tag1", "Tag2"],
  why: "2–3句，这周为什么值得关注（英文）",
  whyZh: "2–3句，中文（可以比日报稍长）",
  pick: true,                   // 周报所有条目都可以加 pick
}
```

### Claude Prompt 模板（批量处理）

```
以下是本周我想纳入周报的论文列表：

1. [title 1] — arXiv [ID] — [abstract 简述]
2. [title 2] — arXiv [ID] — [abstract 简述]
...

本周主题：[主题一句话]

请为每篇生成：
- titleZh
- tags（从以下选：Diffusion LM, Pre-training, Fine-tuning, LoRA, Efficient Inference, Reasoning, Alignment, RLHF, Multimodal, Theory, Benchmark, Code, Agent, RAG, Quantization, MoE, Vision）
- why（英文，≤40词，可以稍长于日报，说清楚为什么这周特别重要）
- whyZh（中文，≤50字）

输出 JSON 数组。
```

---

## 4. 更新文件

1. 在 `src/lib/daily.ts` 顶部批量加入本周条目
2. 条目按发布时间排序（最新在最前）

```
Read src/lib/daily.ts
Edit src/lib/daily.ts   ← 在数组最顶部加本周所有条目
```

---

## 5. 验证 + 发布

```bash
npm run build
# 访问 /daily 确认显示正确
git add src/lib/daily.ts
git commit -m "feat(daily): weekly digest YYYY-WW"
git push
```

---

## 6. 周报快速清单

```
[ ] 周一-四：候选条目持续记录到草稿
[ ] 周五：定本周主题（一句话）
[ ] 周五：从候选选 5–10 篇，用 Claude 批量生成字段
[ ] 周六/日：更新 src/lib/daily.ts
[ ] npm run build 验证
[ ] git commit + push
[ ] （可选）发小红书/公众号周报摘要
```

---

## 7. 可选：外部分发

如果未来要发到微信/小红书/邮件列表，从这些字段提取：

```
本周 PaperTrace 精选 · YYYY 第 W 周

🎯 本周主题：[主题]

📄 精选论文：
[对每篇：标题 + whyZh]

🔗 完整版：papertrace.app/daily
```
