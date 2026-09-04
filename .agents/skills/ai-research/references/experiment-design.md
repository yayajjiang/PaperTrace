# Experiment design — reproduce, control, and don't fool yourself

The fastest researcher is the one who doesn't spend a month chasing a result that
was never real. This file is mostly about *not fooling yourself*.

## Reproduce before you innovate

You need a ruler before you can measure an improvement.

1. Pick the strongest baseline from your literature matrix.
2. Run it **end to end on your own setup** — your data loading, your split, your
   eval code.
3. Match a known number within a reasonable tolerance. If you can't, stop: the
   discrepancy is a bug in your pipeline, and every later result inherits it.

A discrepancy found here is cheap. The same discrepancy found *after* you've
built your method on top of it costs you the whole stack.

## The leakage audit (do this every time)

Most "too good to be true" results are leakage. Before trusting any strong
number, walk this list explicitly:

- **Label leakage:** does any input feature encode the target? (A column derived
  from the label; a timestamp that only exists for positives; an ID that maps to
  the class.) Symptom: near-perfect score, one feature dominating.
- **Train/test contamination:** does any test example (or a near-duplicate)
  appear in training? Check exact and fuzzy duplicates across the split. Common
  with web-scraped data and with pretraining that already saw your test set.
- **Split-after-transform:** was the split done *after* augmentation, oversampling,
  or feature-scaling fit on the whole dataset? Fit scalers/vectorizers on train
  only, then apply to test. Split first, transform second.
- **Grouped leakage:** if rows share a group (same patient, speaker, document,
  user), the same group must not straddle train and test. Use grouped splits.
- **Temporal leakage:** for anything time-ordered, train on the past and test on
  the future — never shuffle across time.
- **Tuning on test:** did you pick hyperparameters or early-stopping using the
  test set? That's a validation set's job. Keep test untouched until the end.

If a number is suspiciously good and *none* of these is the cause, that's when it
gets interesting — but prove the negatives first.

## Seeds and variance

- Set and **log** every seed (data shuffle, init, framework, cuda determinism
  where feasible). The seed lives in the config (`new_experiment.py` puts it there).
- Any comparison claim needs **≥3 seeds**, reported as mean ± std. If a "gain"
  fits inside the combined noise band, it isn't a gain yet.
- Report the variance, don't hide it. Wide variance is itself a finding (your
  method or baseline is unstable).

## Controls and ablations

- **Change one thing at a time.** If model + data + LR all changed, you can't
  attribute the effect.
- Build the ablation that answers "which part of my method causes the gain?"
  Remove each component in turn; the drop tells you what's load-bearing.
- Include the boring-but-honest controls: a random baseline, a majority-class
  baseline, "no-op" versions of your method. They tell you if the task is even
  hard and if your gains are real.

## Track it so it's recoverable

Use `scripts/new_experiment.py` to scaffold each run. The rule: from the saved
config alone, someone (including future-you) can reproduce the number. If the
answer to "what produced this?" is "I think it was that run last Tuesday," the
result is not yet trustworthy.
