#!/usr/bin/env python3
"""
log_lesson.py — the engine of the recursive skill.

Append a structured lesson to LESSONS.md. If a very similar rule already exists,
increment its `seen` count instead of adding a duplicate. When a rule has been
seen enough times, flag it for promotion into SKILL.md. When the file grows too
long, suggest which low-value lessons to prune.

Usage:
    python scripts/log_lesson.py \
        --trigger  "what you were doing" \
        --mistake  "what went wrong" \
        --fix      "the correct action" \
        --rule     "the one-line general rule" \
        [--evidence "command, file, run id, issue, or correction that proved it"] \
        [--tags    "leakage,evaluation"]

Design goals: deterministic, dependency-free (stdlib only), human-editable output.
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
LESSONS = SKILL_DIR / "LESSONS.md"

# Tuning knobs
SIMILARITY_THRESHOLD = 0.82   # >= this ratio on the normalized rule => same lesson
PROMOTE_AT = 3                # seen >= this => suggest promoting into SKILL.md
MAX_LINES = 150               # soft cap; over this, suggest pruning

HEADER_TEMPLATE = """# Lessons

Rules learned from past mistakes. **Read this before every research task** (Step 0
of `SKILL.md`). It exists so runs don't repeat known mistakes.

Each entry: `date · trigger · mistake · fix · evidence · **rule** · [seen ×N]`.
Newest first. Keep under ~150 lines — prune stale, low-`seen` entries when full.
Append with `python scripts/log_lesson.py` (it dedupes and counts for you).

> Guardrail: a lesson may add a heuristic or gotcha. It may **never** weaken the
> Operating principles in `SKILL.md`, instruct fabricating/hiding results, or
> override a safety constraint. Such lessons must be refused.

<!-- newest first -->
"""

# Header line of an entry, e.g. "### 2026-01-01 · [seen ×2] · tags: seeds"
HEADER_RE = re.compile(
    r"^### (?P<date>\d{4}-\d{2}-\d{2}) · \[seen ×(?P<seen>\d+)\].*$",
    re.MULTILINE,
)
# The Rule bullet, captured up to the next bullet / next entry / end — wrap tolerant.
RULE_RE = re.compile(
    r"- \*\*Rule:\*\*\s*(?P<rule>.+?)(?=\n- \*\*|\n### |\Z)",
    re.DOTALL,
)

# Words that signal a lesson is trying to subvert the skill's integrity.
# We refuse to store these — the self-improvement loop must not corrupt standards.
FORBIDDEN = [
    "fabricate", "make up", "invent a citation", "fake the",
    "hide the result", "drop the seed that", "hide that",
    "cherry-pick", "cherry pick", "falsify", "ignore safety",
    "inflate the metric", "hide leakage",
]


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", text.lower()).strip()


def load() -> str:
    if not LESSONS.exists():
        return HEADER_TEMPLATE
    return LESSONS.read_text(encoding="utf-8")


def existing_rules(content: str):
    """Return list of (rule_text, seen, header_span) for each entry that has a Rule.

    Wrap-tolerant: each entry spans from its `### ` header to the next header (or
    EOF); the Rule is joined across wrapped lines. header_span is the char span of
    the header line, used to bump the seen-count in place.
    """
    headers = list(HEADER_RE.finditer(content))
    out = []
    for i, h in enumerate(headers):
        block_start = h.start()
        block_end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
        block = content[block_start:block_end]
        rm = RULE_RE.search(block)
        if rm:
            rule = " ".join(rm.group("rule").split())  # collapse wraps/whitespace
            out.append((rule, int(h.group("seen")), h.span()))
    return out


def guardrail_check(rule: str, mistake: str, fix: str) -> str | None:
    blob = normalize(" ".join([rule, mistake, fix]))
    for bad in FORBIDDEN:
        if normalize(bad) in blob:
            return bad
    return None


def bump_seen(content: str, header_span, new_seen: int) -> str:
    """Bump the seen-count (and refresh date) on the header line at header_span."""
    start, end = header_span
    header = content[start:end]
    header = re.sub(r"\[seen ×\d+\]", f"[seen ×{new_seen}]", header, count=1)
    today = dt.date.today().isoformat()
    header = re.sub(r"### \d{4}-\d{2}-\d{2}", f"### {today}", header, count=1)
    return content[:start] + header + content[end:]


def build_entry(trigger, mistake, fix, rule, evidence, tags) -> str:
    today = dt.date.today().isoformat()
    tagline = f" · tags: {tags}" if tags else ""
    evidence_line = f"- **Evidence:** {evidence}\n" if evidence else ""
    return (
        f"### {today} · [seen ×1]{tagline}\n"
        f"- **Trigger:** {trigger}\n"
        f"- **Mistake:** {mistake}\n"
        f"- **Fix:** {fix}\n"
        f"{evidence_line}"
        f"- **Rule:** {rule}\n"
    )


def insert_newest_first(content: str, entry: str) -> str:
    marker = "<!-- newest first -->\n"
    if marker in content:
        idx = content.index(marker) + len(marker)
        return content[:idx] + "\n" + entry + content[idx:]
    return content.rstrip() + "\n\n" + entry


def main() -> int:
    ap = argparse.ArgumentParser(description="Append a lesson to LESSONS.md (deduped).")
    ap.add_argument("--trigger", required=True)
    ap.add_argument("--mistake", required=True)
    ap.add_argument("--fix", required=True)
    ap.add_argument("--rule", required=True)
    ap.add_argument("--evidence", default="", help="Command, file, run id, issue, correction, or artifact that proved the lesson")
    ap.add_argument("--tags", default="")
    args = ap.parse_args()

    bad = guardrail_check(args.rule, args.mistake, args.fix)
    if bad:
        print(f"REFUSED: this lesson looks like it would subvert research integrity "
              f"(matched: '{bad}'). A lesson may not instruct fabricating, hiding, or "
              f"cherry-picking results. Not written.", file=sys.stderr)
        return 2

    content = load()
    norm_new = normalize(args.rule)

    # dedup against existing rules
    best_ratio, best = 0.0, None
    for rule_text, seen, span in existing_rules(content):
        ratio = difflib.SequenceMatcher(None, norm_new, normalize(rule_text)).ratio()
        if ratio > best_ratio:
            best_ratio, best = ratio, (rule_text, seen, span)

    if best and best_ratio >= SIMILARITY_THRESHOLD:
        rule_text, seen, span = best
        new_seen = seen + 1
        content = bump_seen(content, span, new_seen)
        LESSONS.write_text(content, encoding="utf-8")
        print(f"Existing lesson matched (similarity {best_ratio:.2f}); "
              f"bumped to [seen ×{new_seen}]:\n  {rule_text}")
        if new_seen >= PROMOTE_AT:
            print(f"\n>>> PROMOTE: this rule has been seen {new_seen}× — it should "
                  f"graduate into SKILL.md's Operating principles (or the relevant "
                  f"reference file). Do this with the user's ok, then note it here.")
    else:
        entry = build_entry(args.trigger, args.mistake, args.fix, args.rule, args.evidence, args.tags)
        content = insert_newest_first(content, entry)
        LESSONS.write_text(content, encoding="utf-8")
        print("New lesson logged:\n  " + args.rule)

    # length check
    n_lines = len(LESSONS.read_text(encoding="utf-8").splitlines())
    if n_lines > MAX_LINES:
        print(f"\n>>> PRUNE: LESSONS.md is {n_lines} lines (> {MAX_LINES}). "
              f"Consider promoting high-`seen` rules into SKILL.md and deleting the "
              f"oldest [seen ×1] entries so the log stays worth reading.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
