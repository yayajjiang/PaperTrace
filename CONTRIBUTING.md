# Contributing to PaperTrace / 参与共建

PaperTrace is a bilingual research commons for turning a large information stream into evidence, useful tools, and durable collaboration. You do not need an account or a formal title to contribute.

PaperTrace 是一个双语科研公共空间，目标是把巨大信息流提炼为证据、工具和可持续协作。参与共建不需要注册账号，也不需要正式头衔。

## Four contribution paths / 四种参与方式

1. **Frontier signal / 前沿线索** — model releases and retirements, new labs, papers, benchmarks, emerging directions, public X/Xiaohongshu discussion, MCP servers, Skills, tools, and demos.
2. **Research help / 科研互助** — questions, reproduction, methods, datasets, and code review.
3. **Roles and collaboration / 岗位与合作** — public opportunities with an expiry boundary, or scoped collaboration requests with a concrete acceptance check.
4. **Domain editor / 领域维护者** — own one small desk such as World Models, Genomics, Quantum, Causal Inference, Batteries, or Organizational Science.
5. **Product and code / 产品与代码** — improve ingestion, scoring, bilingual content, accessibility, design, tests, or documentation.

Use the matching GitHub issue template. WeChat can help with fast conversation; important conclusions, public resources, and resolved answers should be summarized back into an issue or pull request so they remain searchable.

请使用匹配的 GitHub Issue 模板。微信群适合快速交流，但重要结论、公开资源和已经解决的问题应回写到 Issue 或 Pull Request，避免知识随聊天记录消失。

## Evidence contract / 证据约定

- Link the primary source whenever one exists: paper, repository, official documentation, dataset, benchmark, or announcement.
- Label vendor-reported results as claims until independently reproduced.
- Treat X, Xiaohongshu, newsletters, blogs, and public accounts as discovery or discussion signals—not substitutes for technical evidence.
- Never fabricate engagement counts. Record the platform, timestamp, public URL, and visible metric when available.
- Separate **impact**, **buzz**, and **utility**. A viral item is not automatically important or runnable.
- Do not publish confidential work, personal contact details, patient data, credentials, or private group messages.

## Domain editor compact / 领域维护者职责

A domain editor starts small: choose one subtopic, define 3–8 canonical sources, write a short inclusion rubric, and review contributions in that area. The shared platform supplies bilingual templates, automation, scoring, navigation, and community surfaces. Editorial decisions should be explainable and reversible.

领域维护者从一个小方向开始：选择一个子主题，确定 3–8 个权威来源，写出简短收录标准，并审核该方向的贡献。平台统一提供双语模板、自动化、评分、导航和社区入口。编辑判断必须可解释、可回滚。

## Pull requests / 代码贡献

Before opening a pull request:

```bash
npm install
npm run build
```

Keep unrelated changes separate. For editorial data, include the canonical URL and the date checked. For a new interactive paper page, preserve the existing bilingual `t(en, zh)` pattern and static-export compatibility.
