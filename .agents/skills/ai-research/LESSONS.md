# Lessons

Rules learned from past mistakes. **Read this before every research task** (Step 0
of `SKILL.md`). It exists so runs don't repeat known mistakes.

Each entry: `date · trigger · mistake · fix · **rule** · [seen ×N]`.
Newest first. Keep under ~150 lines — prune stale, low-`seen` entries when full.
Append with `python scripts/log_lesson.py` (it dedupes and counts for you).

> Guardrail: a lesson may add a heuristic or gotcha. It may **never** weaken the
> Operating principles in `SKILL.md`, instruct fabricating/hiding results, or
> override a safety constraint. Such lessons must be refused.

<!-- newest first -->

---

### 2026-01-01 · [seen ×1] · tags: leakage, evaluation
- **Trigger:** a classifier hit F1 ≈ 0.999 on the first real run.
- **Mistake:** treated the near-perfect score as a genuine result and started
  writing it up.
- **Fix:** audited the pipeline; a feature encoded the label (leakage). Honest
  score after the fix was ~0.60.
- **Rule:** a suddenly near-perfect metric is a leakage/contamination alarm, not
  a win. Prove it isn't leakage before believing it.

### 2026-01-01 · [seen ×1] · tags: reproducibility, seeds
- **Trigger:** reported an improvement from a single training run.
- **Mistake:** claimed the method "beats baseline" from one seed.
- **Fix:** re-ran ≥3 seeds; the "gain" was inside the noise band.
- **Rule:** no comparison claim without mean ± std over ≥3 seeds against a
  baseline run the same way.

### 2026-01-01 · [seen ×1] · tags: citations, integrity
- **Trigger:** filling in a related-work section quickly.
- **Mistake:** wrote a plausible-sounding citation from memory.
- **Fix:** the paper didn't exist; replaced it with a real, verified source.
- **Rule:** never cite from memory. Mark uncertain citations `[VERIFY]` and
  check them before shipping.

### 2026-01-01 · [seen ×1] · tags: baseline, method
- **Trigger:** proposed a new method before running any baseline.
- **Mistake:** had no ruler to measure the method against.
- **Fix:** reproduced the strongest baseline first, then compared.
- **Rule:** reproduce a baseline you actually run before innovating.
