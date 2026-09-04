# PaperTrace agent guide

Use the project-local skill that matches the task; do not load every skill by default.

- AI/ML research design, reproduction, experiments, or paper writing: `.agents/skills/ai-research/SKILL.md`
- Build or revise an interactive PaperTrace paper explanation: `.agents/skills/papertrace-deep-dive/SKILL.md`
- Curate current papers, releases, tools, model lifecycle events, or public discussion signals: `.agents/skills/research-signal-curator/SKILL.md`
- Produce a weekly research synthesis around one connecting idea: `.agents/skills/weekly-research-narrative/SKILL.md`

Keep claims traceable to sources, keep vendor results labeled, and never turn a community metric into scientific impact. Preserve bilingual behavior and static-export compatibility. Before handing off a code or content change, run `npm run build`; do not overwrite unrelated work already present in the worktree.
