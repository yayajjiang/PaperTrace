# PaperTrace Product Roadmap

Last updated: 2026-09-04

## North star

**Information is all you need — but attention is scarce.**

PaperTrace turns a huge research information stream into three useful outcomes:

1. know what changed and why it matters;
2. find a tool, skill, person, or community that helps with the next step;
3. turn difficult research knowledge into durable bilingual public artifacts.

## Product architecture

| Surface | Job |
| --- | --- |
| Discover | Editorial homepage connecting live signals, tools, community, and the original paper library |
| Research Radar | Model releases, papers, topic momentum, impact/buzz/utility ranking, and attention budgets |
| Event Radar | Deadline-first conferences, hackathons, calls, exhibitions, scholarships, and recurring-event watch |
| Domains | Cross-disciplinary taxonomy and distributed domain-editor model |
| Tools & MCP | Searchable, filterable directory for agents, skills, MCP, data, compute, and demos |
| Skills | Executable research and publishing workflows |
| Community | Research help, internships and jobs, collaborators, launches, and durable co-building |
| AI & CS collection | Existing interactive deep-dives, feed, knowledge graph, guide, resources, and job-hunt content |

## Current milestone

Status: in progress

- [x] Reorganize global navigation around Discover / Radar / Domains / Tools / Community
- [x] Create Research Radar with multi-axis filtering and model-watch mode
- [x] Add interactive Momentum Map: impact × utility, bubble size = buzz
- [x] Add Topic Pulse with World Models, Embodied AI, Research Agents/Skills/MCP, and model lifecycle
- [x] Create a cross-domain Tools directory with search, category/domain filters, evidence, and local upvotes
- [x] Seed community-submitted tools: AREX-Skill/DisCo, DeepXiv, DINQ, DINQ Analysis, Find 1st Author, Scholar Copilot
- [x] Seed cross-field infrastructure: OpenAlex, Europe PMC, Materials Project, PLUMED, INSPIRE HEP, Open Knowledge Maps
- [x] Create Community rooms for research help, internships/roles, people/collaboration, and launches
- [x] Add WeChat and GitHub contribution paths without introducing fake authentication
- [x] Create Domains page; move the existing product conceptually under AI & CS and open five founding-editor tracks
- [x] Add daily scheduled deployment and official-source news sync
- [x] Add valid `attention-curator` and `frontier-watch` Skills
- [ ] Finish visual QA at desktop and mobile sizes
- [x] Connect Hugging Face paper popularity as a separately labeled signal
- [ ] Add a verified social-signal ingestion path for public X and Xiaohongshu posts
- [x] Add Frontier Watch UI for new labs, research teams, researcher moves, and infrastructure
- [x] Add source provenance and score-explanation drawer to every Radar item
- [x] Balance automated arXiv discovery across six research domains
- [x] Add structured community templates for help, collaboration, roles, tools, and frontier signals
- [x] Publish a bilingual contribution and domain-editor compact
- [x] Add a no-login Attention Queue with local saves and 30/60/120-minute reading plans
- [x] Launch Event Radar with 33 organizer-verified entries across eight directions
- [x] Add deadline-first sorting, China/global/type/domain filters, and recently-ended cycle watch
- [x] Validate event dates and 14-day verification freshness during every daily deployment
- [x] Add twice-weekly curation audit that updates one GitHub inbox for urgent deadlines, stale records, source failures, and field imbalance
- [ ] Unify the older `/daily` news data with the new Radar feed

## Editorial scoring

Scores are intentionally separate and are not presented as objective truth.

- **Impact**: evidence quality, technical consequence, downstream use, citations or credible adoption.
- **Buzz**: recent, verifiable discussion velocity. Social metrics are never fabricated.
- **Utility**: runnable code/data/demo/API, setup cost, and relevance to a real research task.
- **Attention budget**: skim (3–5 min), read (10–25 min), or deep dive (45+ min), with a learning outcome.

Vendor benchmarks stay labeled as reported claims until reproduced independently.

## Source layers

1. Primary: papers, official lab/model announcements, repositories, documentation, datasets, benchmarks.
2. Structured discovery: arXiv, Hugging Face Papers, OpenAlex, Europe PMC, field-specific indexes.
3. Discussion signals: X, Xiaohongshu, newsletters, public accounts, blogs, podcasts.
4. Community submissions: GitHub issue form and WeChat discussion, promoted only after source verification.

Layer 3 can affect `buzz` and help identify a story. It cannot replace Layer 1 evidence for `impact`.

## Domain expansion model

AI & CS remains the first mature collection. Biology & Medicine, Physics, Mathematics & Statistics, Materials & Chemistry, and Social Science begin as source/tool/watch pages. Each grows under a founding editor who owns the field's standards, canonical sources, and reviewer network. PaperTrace supplies shared publishing, automation, ranking, bilingual presentation, and community infrastructure.

## Watch and clarification queue

- “卡兹克最近的 N1 Lab”: entity not confidently resolved from public search. Do not publish until the canonical lab/person URL is known.
- World Labs Atlas: verified official release on 2026-09-01; anchor item for World Models / Spatial Intelligence.
- Model retirement tracking: keep product availability and API availability distinct.

## Next priorities

1. Complete responsive visual QA for the new homepage, Radar, Domains, Tools, Community, Skills, and Frontier Watch.
2. Consolidate `/daily` and `/radar` into one content model while preserving existing URLs.
3. Add a public, auditable social-signal adapter with timestamped X/Xiaohongshu evidence.
4. Add source-health reporting so failed feeds are visible instead of silently disappearing.
5. Design the first domain-editor desk around one non-CS field and recruit a reviewer for its rubric.
