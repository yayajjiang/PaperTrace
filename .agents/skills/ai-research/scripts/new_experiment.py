#!/usr/bin/env python3
"""
new_experiment.py — scaffold a reproducible experiment directory.

Creates experiments/<date>-<slug>/ with a single config file as the source of
truth, the current git commit captured, a seed set, and a RESULTS.md stub. This
enforces Operating principle #4 ("the config is the source of truth") so that
"what settings produced this number?" always has an answer.

Usage:
    python scripts/new_experiment.py "d-lora rank sweep" [--seed 42] [--root experiments]

Dependency-free (stdlib only). YAML is written as plain text so PyYAML isn't
required to read or diff it.
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
from pathlib import Path


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:48]


def git_commit() -> str:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True,
        )
        commit = out.stdout.strip()
        dirty = subprocess.run(
            ["git", "status", "--porcelain"], capture_output=True, text=True
        ).stdout.strip()
        return commit + (" (dirty: uncommitted changes present)" if dirty else "")
    except Exception:
        return "UNKNOWN (not a git repo, or git unavailable) — commit your code before running!"


CONFIG_TEMPLATE = """# Experiment config — THE SINGLE SOURCE OF TRUTH FOR THIS RUN.
# Every number in RESULTS.md must be reproducible from exactly this file.
name: {name}
created: {ts}
git_commit: "{commit}"
seed: {seed}

# --- what are we testing? (fill this in before running) ---
hypothesis: >-
  We claim ??? improves ??? on ???, measured by ???, vs baseline ???.
delta_vs_prior_work: >-
  ???   # what is new here? if nothing, this is a reproduction — say so.

# --- data ---
dataset: ???
split: ???            # exact split; fix this BEFORE looking at test
leakage_check: false  # set true only after you've audited for label/train-test leakage

# --- baseline you will actually run (not quoted from a table) ---
baseline: ???

# --- model / method ---
model: ???
hyperparameters:
  learning_rate: ???
  batch_size: ???
  epochs: ???
  # ... one place, one truth. change here, not in your head.

# --- protocol ---
seeds: [{seed}]       # add >=3 for any comparison claim
metric: ???
"""

RESULTS_TEMPLATE = """# Results — {name}

Config: [`config.yaml`](config.yaml) · commit `{commit_short}` · seed {seed}

## Checklist before trusting these numbers
- [ ] Baseline reproduced (a number I actually ran, not quoted)
- [ ] Leakage audit passed (no feature encodes the label; no train/test overlap)
- [ ] >= 3 seeds for any comparison claim
- [ ] One thing changed at a time vs the baseline

## Numbers
| run | method | metric | mean | std | seeds | notes |
|-----|--------|--------|------|-----|-------|-------|
|     | baseline |      |      |     |       |       |
|     | ours     |      |      |     |       |       |

## Observations
- (Is anything suspiciously good? If so, prove it isn't leakage BEFORE writing it up.)

## Decision
- (keep / iterate / drop — and why)
"""


def main() -> int:
    ap = argparse.ArgumentParser(description="Scaffold a reproducible experiment.")
    ap.add_argument("name", help="short description, e.g. 'lora rank sweep'")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--root", default="experiments")
    args = ap.parse_args()

    ts = dt.datetime.now().isoformat(timespec="seconds")
    slug = slugify(args.name)
    day = dt.date.today().isoformat()
    exp_dir = Path(args.root) / f"{day}-{slug}"
    exp_dir.mkdir(parents=True, exist_ok=True)

    commit = git_commit()
    commit_short = commit.split()[0][:12] if commit[0].isalnum() else "UNKNOWN"

    (exp_dir / "config.yaml").write_text(
        CONFIG_TEMPLATE.format(name=args.name, ts=ts, commit=commit, seed=args.seed),
        encoding="utf-8",
    )
    (exp_dir / "RESULTS.md").write_text(
        RESULTS_TEMPLATE.format(name=args.name, commit_short=commit_short, seed=args.seed),
        encoding="utf-8",
    )

    print(f"Scaffolded {exp_dir}/")
    print("  config.yaml   <- fill in BEFORE running; it is the source of truth")
    print("  RESULTS.md    <- record numbers here, next to the config that made them")
    print(f"\nCaptured commit: {commit}")
    if "UNKNOWN" in commit or "dirty" in commit:
        print("WARNING: commit your code before running so this run is reproducible.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
