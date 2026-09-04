# Writing it up — claims backed by evidence

A paper is a chain of claims, each one paid for by a number. If a claim in the
abstract has no table behind it, cut the claim or run the experiment.

## Structure (adapt to your venue)

- **Abstract** — problem, what you did, the single headline result, why it
  matters. Every sentence here must be defensible by the body.
- **Introduction** — the gap (from your literature matrix), your contribution as
  a bulleted list, and the one-sentence delta vs the closest prior work.
- **Related work** — position against the strongest baselines, not a laundry
  list. Every citation is a paper you actually read (Operating principle #7).
- **Method** — enough that a competent reader could reimplement it.
- **Experiments** — setup (data, splits, metrics, seeds, compute), baselines you
  *ran*, results with mean ± std, and the ablations that isolate the cause.
- **Limitations** — say what doesn't work and where it breaks. This builds trust
  and is required at many venues.
- **Conclusion** — what's now known that wasn't before.

## Claim-to-evidence discipline

- For each claim, ask: *which number, in which table, on which split, supports
  this?* If you can't answer, it's a hypothesis, not a result.
- Don't over-claim generality from one dataset. "On dataset X" is honest; "in
  general" needs several datasets.
- Report the comparison **you ran**, both method and baseline the same way.
  Quoting a baseline's paper number against your own re-run is not a fair
  comparison.
- Negative/null results belong in the paper, stated plainly. Dropping the seed,
  dataset, or baseline that hurt the story is the one thing that makes a paper
  fraudulent rather than merely wrong. Don't.

## Reproducibility checklist (include a version in the paper/appendix)

- [ ] Data: source, license, exact splits (and how they were made)
- [ ] Leakage: the audit you ran (from `experiment-design.md`) and its result
- [ ] Code: released or described enough to reimplement; commit hash
- [ ] Seeds: which seeds, how many, mean ± std reported
- [ ] Compute: hardware, wall-clock, and cost (so others can budget)
- [ ] Hyperparameters: the full config, not just the ones that changed
- [ ] Baselines: which were re-run vs quoted, and why

## Before you submit

- Re-read the abstract with the tables open. Does every claim have a number?
- Search once more for the prior work that would embarrass you if you missed it.
- Check every citation resolves to a real paper. Remove any `[VERIFY]` you never
  verified — an unverified citation is worse than no citation.
