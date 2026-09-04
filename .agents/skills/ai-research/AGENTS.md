# AGENTS.md

This repository is an **AI research skill**. The source of truth is
[`SKILL.md`](SKILL.md).

If you are an agent that reads `AGENTS.md` (e.g. Codex, or OpenClaw's injected
prompt path):

1. **Before any AI/ML research task**, read [`SKILL.md`](SKILL.md) and follow it.
2. **First action of every research task:** read [`LESSONS.md`](LESSONS.md) — the
   accumulated record of past mistakes and the rules that came from them. Don't
   repeat them.
3. **Whenever you make and fix a mistake during the task**, append a lesson via
   `python scripts/log_lesson.py` (see the self-improvement section of
   `SKILL.md`). This is what makes the skill improve over time.

Keep `SKILL.md` as the single place you edit behavior. This file is only a
pointer so that AGENTS.md-based agents land in the same place Claude and OpenClaw
skill-loaders do.
