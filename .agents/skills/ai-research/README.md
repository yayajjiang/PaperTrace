<div align="center">

# 🔬 AI Research Skill — a self-improving research agent for Claude, Codex & OpenClaw

**One `SKILL.md` that makes any coding agent move fast through the full ML/AI research loop — and get better every time it makes a mistake.**

Hypothesis → literature review → reproduce baseline → leak-free experiments → honest analysis → paper. Works with [Claude](https://claude.ai) / Claude Code, [OpenAI Codex](https://openai.com), and [OpenClaw](https://github.com/openclaw/openclaw). Recursive by design: it logs its own mistakes as rules so it never repeats them.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skill format](https://img.shields.io/badge/format-SKILL.md-8A2BE2.svg)](SKILL.md)
[![Works with Claude](https://img.shields.io/badge/Claude-compatible-D97757.svg)](#quickstart)
[![Works with Codex](https://img.shields.io/badge/Codex-AGENTS.md-black.svg)](#quickstart)
[![Works with OpenClaw](https://img.shields.io/badge/OpenClaw-🦞-orange.svg)](#quickstart)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

⭐ **If this saves you from one leaked-label result, please star the repo — it helps other researchers find it.**

</div>

---

## Why this exists

Most AI-agent "research" help is a chatbot that sounds confident and cites papers that don't exist. Real research fails in specific, boring, expensive ways: a baseline you quoted instead of ran, a metric that's secretly leaking the label, a "gain" that's really one lucky seed, a citation invented from memory.

This skill encodes the discipline that catches those failures **before** they cost you a month — as a portable `SKILL.md` your agent reads automatically. And it's **recursive**: when the agent makes a mistake and fixes it, it writes the lesson to `LESSONS.md`, reads that file at the start of every future task, and stops repeating itself. The skill you use in month three is sharper than the one you installed.

## What it does

| Stage | What the agent does | Guardrail it enforces |
|-------|--------------------|-----------------------|
| **Frame** | Turns a vague idea into a testable hypothesis + a stated delta vs prior work | No experiment until the claim is one sentence |
| **Review** | Finds the 5–15 papers that matter, builds a comparison matrix | Cite only papers actually read — never from memory |
| **Reproduce** | Runs the strongest baseline on *your* setup first | You need a ruler before you measure a gain |
| **Design** | Sets seeds, fixes splits, runs a full **leakage audit** | Suspiciously-good ≠ breakthrough — prove it's not leakage |
| **Run** | Scaffolds configs so every number is reproducible | The config is the single source of truth |
| **Analyze** | Compares vs baseline with mean ± std over ≥3 seeds | A single-seed win is a story, not a finding |
| **Write** | Backs every claim with a number; ships a reproducibility checklist | Never drop the seed/dataset that hurt the story |

## Quickstart

Clone it, then drop it where your agent looks for skills:

```bash
git clone https://github.com/Toadoum/ai-research-skill.git
```

<details open>
<summary><b>Claude / Claude Code / Claude Cowork</b></summary>

Install the folder (or a packaged `.skill` bundle) into your skills directory. Claude keeps the `name` + `description` in context always, and loads the full skill when your task looks like AI/ML research. Then just work normally — *"help me reproduce this paper's baseline"*, *"why is my F1 suspiciously high?"* — and it kicks in.
</details>

<details>
<summary><b>OpenClaw 🦞</b></summary>

```bash
cp -r ai-research-skill ~/.openclaw/workspace/skills/ai-research
```
OpenClaw reads the same `SKILL.md` frontmatter + body, and its injected `AGENTS.md` path lands in the same place. Inspect any skill before installing it — treat community skills like npm packages from strangers.
</details>

<details>
<summary><b>Codex & other AGENTS.md agents</b></summary>

Keep `AGENTS.md` at your repo root (it's a thin pointer to `SKILL.md`). Codex reads `AGENTS.md` and follows the skill from there.
</details>

## The self-improving loop (the interesting part)

```
   start task ─▶ read LESSONS.md ─▶ do research ─▶ made a mistake?
        ▲                                              │ yes
        │                                              ▼
        └────────── LESSONS.md now has a new rule ◀── log_lesson.py
```

When the agent catches an error, it runs:

```bash
python scripts/log_lesson.py \
  --trigger "reported a gain from one training run" \
  --mistake "claimed 'beats baseline' from a single seed" \
  --fix     "re-ran 3 seeds; gain was inside the noise band" \
  --rule    "no comparison claim without mean ± std over >=3 seeds" \
  --tags    "seeds,reproducibility"
```

The script **dedupes** similar rules, **counts** repeats, flags a rule for
**promotion** into `SKILL.md` once it's seen 3×, and tells you when the log needs
**pruning**. A built-in guardrail refuses any "lesson" that would weaken research
integrity (fabricating, hiding, or cherry-picking results). The loop makes the
skill smarter — it can't make it dishonest.

## Repo layout

```
ai-research-skill/
├── SKILL.md                       # the skill (source of truth, Claude + OpenClaw)
├── AGENTS.md                      # thin pointer for Codex / OpenClaw
├── LESSONS.md                     # recursive memory — mistakes → rules
├── scripts/
│   ├── log_lesson.py              # append a deduped, counted lesson
│   └── new_experiment.py          # scaffold a reproducible experiment dir
└── references/
    ├── literature-review.md       # find prior art fast; build the matrix
    ├── experiment-design.md       # reproduce, seeds, the leakage audit
    └── paper-writing.md           # claim→evidence + reproducibility checklist
```

## Contributing

PRs welcome — especially new `LESSONS.md` entries from real research mistakes
(that's the whole point), new reference playbooks, and adapters for more agents.
Open an issue with the failure mode you hit and the rule that fixes it.

## Keywords

AI research agent · machine learning research assistant · Claude skill · Claude
Code skill · SKILL.md · Codex AGENTS.md · OpenClaw skill · self-improving agent ·
recursive AI agent · reproducible ML · data leakage detection · experiment
tracking · ablation study · literature review automation · paper writing · LLM
research workflow · NLP research · research reproducibility.

## License

[MIT](LICENSE) — use it, fork it, ship it.

<div align="center">

*Built for researchers who'd rather find the leak on day one than in review.*
**⭐ Star it if it helps.**

</div>
