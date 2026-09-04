# PaperTrace

**A bilingual research commons (EN/ZH)** — live research signals, paper deep-dives, tools, executable skills, and community.

Live site: [PaperTrace on GitHub Pages](https://yayajjiang.github.io/PaperTrace)

---

## Pages

### Paper Deep-Dives (`/papers/*`)

Each paper gets a full breakdown with formula walkthroughs, interactive widgets, and connections to related work.

| Paper | Key Idea |
|-------|----------|
| Attention Is All You Need | The Transformer architecture |
| BERT | Masked LM + bidirectional pretraining |
| CLIP | Contrastive vision-language pretraining |
| LoRA | Low-rank adapter fine-tuning |
| FlashAttention | IO-aware exact attention |
| LLaVA | Visual instruction tuning |
| GPT-2 | Autoregressive language modeling at scale |
| PPO | Proximal policy optimization for RLHF |
| DPO | Direct preference optimization (no RL) |
| GRPO | Group relative policy optimization (DeepSeek-R1) |
| MDLM | Masked diffusion language models |
| LLaDA | Masked diffusion for LLMs |
| Block Diffusion | AR between blocks + diffusion within blocks |
| Fast DLLM | Adaptive denoising — 3-10x fewer steps |

### Other Pages

- `/` — Discover: research signals, tools, community, and the original paper collection
- `/radar` — Research Radar: model releases, topic pulse, attention budgets, and an interactive momentum map
- `/domains` — Cross-disciplinary rooms and founding-editor tracks
- `/tools` — Community research tools, agents, MCP infrastructure, and demos
- `/skills` — Executable PaperTrace research workflows
- `/community` — Research help, internships, collaborators, launches, WeChat, and GitHub co-building
- `/daily` — Paper feed + News & Events (行业动态)
- `/resources` — Curated learning resources: YouTube, Bilibili, newsletters, blogs, X/Twitter, tools
- `/interview` — Job hunt hub: LeetCode resources, company job openings, ML interview Q&A (20 questions, 5 sections)
  - `/interview/notes` — "Notes on the Job Hunt / 写在找工路上"
- `/guide` — Study guide
- `/timeline` — AI/ML timeline

---

## Tech Stack

- **Next.js 14** — App Router, static export for GitHub Pages
- **React** — Interactive widgets (custom, no heavy chart libs)
- **KaTeX** — Math rendering
- **Tailwind CSS** — Styling with dark mode
- **Custom i18n** — `t(en, zh)` hook, no external library
- **Automated research radar** — official RSS, multi-field arXiv, and selected model registries refreshed every 8 hours by GitHub Actions
- **No-login subscriptions** — a generated bilingual `/feed.xml` for any RSS reader

---

## Local Development

```bash
git clone https://github.com/yayajjiang/PaperTrace.git
cd PaperTrace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions.

Settings → Pages → Source → GitHub Actions.

---

## Adding a New Paper

1. Add metadata to `src/lib/papers.ts`
2. Create `src/app/papers/<slug>/page.tsx`
3. Key components:
   - `<Math tex="..." />` / `<Math display tex="..." />` — KaTeX math
   - `<Widget title="...">` — interactive visualizations
   - `<Collapsible title="...">` — expandable sections
   - `<KeyInsight>` — highlighted callout boxes
   - `<SectionHeader>` — colored section headers (used in interview page)

## Join the Community / 加入微信群

Scan the QR code to join our WeChat community for ML learners and job seekers.

扫码加入微信交流群，一起学习 ML、交流找工经验。

<img src="./src/images/wechat_group.pic.jpg" alt="WeChat Group QR Code" width="200" />

---

## License

MIT
