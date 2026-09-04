# Literature review — fast, without missing what matters

Goal: in a few focused hours, know the 5–15 papers that actually govern your
problem, what they claim, and the gap they left. Not 100 papers skimmed to zero
depth.

## Find the real prior art

- Start from a strong recent survey or the best recent paper on the exact task,
  then walk **backwards** (what it cites) and **forwards** (what cites it —
  Semantic Scholar / Google Scholar "cited by", Papers with Code leaderboards).
- Search arXiv, ACL Anthology / OpenReview (for peer-reviewed venues), Papers
  with Code (for code + leaderboards), Semantic Scholar (for citation graph).
- Prefer the original source over a blog summary of it. Read the paper, not the
  press about the paper.
- Track everything you actually read. Every entry must be a paper you have seen —
  never a citation reconstructed from memory (Operating principle #7).

## Extract the contribution in one pass

For each paper that matters, capture six things — no more:

1. **Claim** — what do they say they achieved, in one sentence?
2. **Method** — the core idea in one line (not the whole architecture).
3. **Baseline(s)** — what did they beat, and by how much?
4. **Data + metric** — which datasets, measured how?
5. **Gap** — what did they *not* do / assume / leave open? (This is where your
   contribution usually lives.)
6. **Reproducible?** — is there code/data? did others reproduce it?

## Build the comparison matrix

A small table beats prose for seeing the landscape and finding your opening:

| paper | method (1 line) | datasets | metric | best result | gap / weakness |
|-------|-----------------|----------|--------|-------------|----------------|
|       |                 |          |        |             |                |

Reading it off: the **strongest** entry is the baseline you must beat. The column
of "gaps" is your menu of possible contributions. If every gap is already closed,
your contribution is either a new setting (new data/domain/language) or a
reproduction — both legitimate; just name which.

## Sanity checks before you move on

- Can you state your **delta** in one sentence? "Unlike [closest prior work],
  we ..." If not, keep reading — you're not ready to run experiments.
- Are the numbers you're citing from tables you'd have to beat *on the same
  split*? Quoted numbers across different splits/setups are not comparable — you
  will need to reproduce, not quote (see `experiment-design.md`).
- Did you find the paper that would embarrass you if a reviewer knew it and you
  didn't? Search once more with different terms specifically to find it.
