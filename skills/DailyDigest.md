# PaperTrace · 每日日报 Skill

> 选题与注意力评分优先使用 [`attention-curator`](./attention-curator/SKILL.md)；新实验室、模型生命周期、MCP 与 Agent 基础设施使用 [`frontier-watch`](./frontier-watch/SKILL.md) 核验后再进入日报。

为 PaperTrace 生成当天的日报内容——papers + news，更新到 `src/lib/daily.ts`。

---

## 0. 快速检查：今天有什么值得发？

每天筛选的优先级：

1. **arXiv 新论文**：cs.LG / cs.CL / cs.AI 今日 submissions
2. **模型发布 / 重大更新**：OpenAI、Anthropic、Google、国内大厂
3. **热点讨论**：Twitter/X、Hacker News、Reddit r/MachineLearning 上的高热帖
4. **求职相关**：HC 变化、裁员/扩招、新岗位开放

目标：**每日 2–5 篇 paper + 0–2 条 news**，宁缺毋滥。

---

## 1. 找内容

**Paper 来源：**
```
https://arxiv.org/list/cs.LG/recent
https://arxiv.org/list/cs.CL/recent
https://huggingface.co/papers        ← 社区人气榜，强烈推荐
https://paperswithcode.com/latest
```

**News 来源：**
```
https://techcrunch.com/tag/artificial-intelligence/
https://twitter.com/search?q=LLM%20release
Hacker News：https://news.ycombinator.com/
```

**筛选标准（Paper）：**
- 解决了一个清晰问题，不是 survey
- 有明确数字结果（在哪个 benchmark 上提升多少）
- 与 PaperTrace 受众相关（LLM / Diffusion / RL / Efficient Training）
- 有 GitHub repo 更好

**筛选标准（News）：**
- 影响 ML 从业者或求职者
- 不是纯商业/融资新闻（除非和 HC 直接相关）

---

## 2. 写 Paper 条目

每篇论文填写以下字段，加到 `src/lib/daily.ts` 的 `dailyPapers` 数组顶部：

```ts
{
  date: "YYYY-MM-DD",           // 今天日期
  title: "英文原标题",
  titleZh: "中文标题（可选，重要论文必填）",
  authors: "第一作者 et al.",
  arxivId: "XXXX.XXXXX",        // 只填 ID，不填完整 URL
  tags: ["Tag1", "Tag2"],       // 复用已有 tags，见下方列表
  why: "一句话，为什么这篇重要（英文）",
  whyZh: "一句话，为什么这篇重要（中文）",
  pick: true,                   // 只给今日最推荐的 1 篇加
  slug: "slug",                 // 如果有完整精读页面才填
}
```

**常用 Tags（复用，不要随便新建）：**
```
"Diffusion LM" | "Pre-training" | "Fine-tuning" | "LoRA" | "Efficient Inference"
"Reasoning" | "Alignment" | "RLHF" | "Multimodal" | "Theory" | "Benchmark"
"Code" | "Agent" | "RAG" | "Quantization" | "MoE" | "Vision"
```

**why / whyZh 写法：**
```
格式：[这篇做了什么] — [为什么对读者重要/有趣]
例：First diffusion LM at 8B scale that matches LLaMA3 — proves AR is not the only path.
例：首个 8B 规模扩散语言模型，可与 LLaMA3 媲美 — 证明 AR 不是强大 LLM 的唯一路径。
```
- 不超过 25 词（英）/ 30 字（中）
- 不用 jargon 缩写（第一次出现要展开）
- 结尾不加句号

---

## 3. Claude Prompt 模板

拿到 abstract 后，用这个 prompt 快速生成字段：

```
论文标题：[title]
作者：[authors]
arXiv ID：[XXXX.XXXXX]
Abstract：
[粘贴 abstract]

请输出以下 JSON（直接可以粘贴进代码）：
{
  "titleZh": "中文标题",
  "tags": ["最多3个，从这个列表选: Diffusion LM, Pre-training, Fine-tuning, LoRA, Efficient Inference, Reasoning, Alignment, RLHF, Multimodal, Theory, Benchmark, Code, Agent, RAG, Quantization, MoE, Vision"],
  "why": "英文，≤25词，格式：[做了什么] — [为什么重要]",
  "whyZh": "中文，≤30字，同格式"
}
```

---

## 4. 更新文件

```
Read src/lib/daily.ts          ← 先看当前结构
Edit src/lib/daily.ts          ← 在数组顶部加新条目
```

加完后检查：
- `date` 是今天？
- `arxivId` 只有数字和点，没有完整 URL？
- `pick: true` 最多给 1 篇？
- 所有字段都有值（`titleZh` 可选，其余必填）？

---

## 5. 验证

```bash
npm run build
```

访问 `/daily` 确认新条目在顶部显示，中英文切换正常。

---

## 6. 每日日报快速清单

```
[ ] 浏览 HuggingFace Papers 今日榜单
[ ] 选 2–5 篇，写 why/whyZh
[ ] 选最强 1 篇加 pick: true
[ ] 如有重大 news，加 news 条目（格式见 update-daily skill）
[ ] 加到 daily.ts 顶部
[ ] npm run build 验证
[ ] git commit: "feat(daily): add YYYY-MM-DD digest"
```
