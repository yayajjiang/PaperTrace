import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const feeds = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", tag: "Release", domain: "AI & CS" },
  { name: "Anthropic", url: "https://www.anthropic.com/news", tag: "Release", domain: "AI & CS", format: "html" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", tag: "Research", domain: "AI & CS" },
];

const arxivUrl = (query) => `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(`(${query})`)}&start=0&max_results=6&sortBy=submittedDate&sortOrder=descending`;
const arxivFeeds = [
  { name: "arXiv · AI & CS", url: arxivUrl("cat:cs.AI OR cat:cs.LG OR cat:cs.CL"), tag: "Research", domain: "AI & CS" },
  { name: "arXiv · Bio", url: arxivUrl("cat:q-bio.BM OR cat:q-bio.GN OR cat:q-bio.QM"), tag: "Research", domain: "Bio & Medicine" },
  { name: "arXiv · Physics", url: arxivUrl("cat:physics.comp-ph OR cat:astro-ph.IM OR cat:quant-ph"), tag: "Research", domain: "Physics" },
  { name: "arXiv · Math & Stats", url: arxivUrl("cat:math.OC OR cat:math.ST OR cat:stat.ML"), tag: "Research", domain: "Math & Stats" },
  { name: "arXiv · Materials & Chemistry", url: arxivUrl("cat:cond-mat.mtrl-sci OR cat:physics.chem-ph"), tag: "Research", domain: "Materials & Chemistry" },
  { name: "arXiv · Social Science", url: arxivUrl("cat:econ.EM OR cat:econ.TH OR cat:cs.CY"), tag: "Research", domain: "Social Science" },
];

const decode = (value = "") =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const pick = (block, names) => {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decode(match[1]);
  }
  return "";
};

const pickLink = (block) => {
  const atom = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return atom || pick(block, ["link"]);
};

const editorialItems = [
  {
    id: "openai-gpt-6-astra-2026",
    date: "2026-09-03",
    title: "OpenAI releases GPT-6 Astra",
    titleZh: "OpenAI 发布 GPT-6 Astra",
    summary: "Astra is rolling out from limited organizational access to ChatGPT, Codex and API surfaces. OpenAI reports major gains in computer use, coding, science and cybersecurity; benchmark numbers remain vendor-reported until independently reproduced.",
    summaryZh: "Astra 正从少量组织逐步开放到 ChatGPT、Codex 与 API。OpenAI 报告其在计算机操作、代码、科学与网络安全上大幅提升；相关基准在独立复现前仍属于厂商自报。",
    source: "OpenAI",
    sourceUrl: "https://openai.com/index/gpt-6-astra/",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 98, buzz: 99, utility: 88 },
    provenance: {
      layer: "Primary",
      scoreNotes: {
        impact: "A new flagship generation spanning research and agentic computer use, verified as an official release; benchmark magnitudes remain vendor-reported.",
        buzz: "Official release corroborated by high-velocity public developer discussion; raw cross-platform totals are not merged.",
        utility: "Rolling out across ChatGPT, Codex, API, Azure and Bedrock, with an exact API model ID and pricing documented.",
      },
    },
  },
  {
    id: "world-labs-atlas-2026",
    date: "2026-09-01",
    title: "World Labs releases Atlas, an omni world model",
    titleZh: "World Labs 发布全模态世界模型 Atlas",
    summary: "Atlas handles text, images, video and 3D in one spatial context, spanning generation, reconstruction and real-to-sim robotics.",
    summaryZh: "Atlas 在统一空间上下文中处理文本、图像、视频与 3D，覆盖生成、重建与机器人 real-to-sim。",
    source: "World Labs",
    sourceUrl: "https://www.worldlabs.ai/blog/atlas",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 92, buzz: 92, utility: 78 },
    provenance: {
      layer: "Primary",
      scoreNotes: {
        impact: "Official release with a new multimodal world-model architecture and broad downstream scope.",
        buzz: "Recent frontier-model release; social velocity is not yet used without a verifiable public metric.",
        utility: "Early access and demos exist, but weights and a general public API are not yet available.",
      },
    },
  },
  {
    id: "claude-opus-4-1-retired",
    date: "2026-08-05",
    title: "Claude Opus 4.1 retires from the Anthropic API",
    titleZh: "Claude Opus 4.1 从 Anthropic API 下线",
    summary: "Anthropic recommends migrating to Opus 4.8. Model retirement is tracked separately from launch news because it creates immediate evaluation and migration work.",
    summaryZh: "Anthropic 建议迁移到 Opus 4.8。模型下线会直接产生评测与迁移工作，因此与新品发布分开追踪。",
    source: "Anthropic Docs",
    sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/model-deprecations",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 86, buzz: 80, utility: 94 },
    provenance: {
      layer: "Primary",
      scoreNotes: {
        impact: "Official API retirement affecting production workloads pinned to this model.",
        buzz: "Lifecycle event; no unverified social count is included.",
        utility: "Immediate migration action with a documented replacement model.",
      },
    },
  },
];

function parse(xml, feed) {
  const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return blocks.map((block) => {
    const title = pick(block, ["title"]);
    const summary = pick(block, ["description", "summary", "content"]);
    const rawDate = pick(block, ["pubDate", "published", "updated"]);
    const sourceUrl = pickLink(block);
    const date = Number.isNaN(Date.parse(rawDate)) ? new Date().toISOString().slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10);
    const lower = `${title} ${summary}`.toLowerCase();
    const categoryTerms = Array.from(block.matchAll(/<category[^>]+term=["']([^"']+)["']/gi), (match) => match[1]).join(" ");
    const domain = /q-bio/.test(categoryTerms) ? "Bio & Medicine"
      : /cond-mat\.mtrl-sci|physics\.chem-ph/.test(categoryTerms) ? "Materials & Chemistry"
      : /physics\./.test(categoryTerms) ? "Physics"
      : /math\.|stat\./.test(categoryTerms) ? "Math & Stats"
      : /econ\./.test(categoryTerms) ? "Social Science"
      : /cs\./.test(categoryTerms) ? "AI & CS"
      : /protein|genom|clinical|biomed/.test(lower) ? "Bio & Medicine"
      : /material|molecul|chem/.test(lower) ? "Materials & Chemistry"
      : /quantum|astroph/.test(lower) ? "Physics"
      : /theorem|proof/.test(lower) ? "Math & Stats"
      : /econom|social science/.test(lower) ? "Social Science"
      : feed.domain;
    const isCaseStudy = /case study|customer stor|how .{0,70} (uses|use|built|builds|governs|scales|adopts|deploys|turns|transforms)|with chatgpt|enterprise adoption|brand|organizations can now connect|companies turn workflows/i.test(title);
    const inferredTag = isCaseStudy ? "Industry" : /introduc|releas|launch|announc|new model|open.source/.test(title.toLowerCase()) ? "Release" : feed.tag;
    const ageDays = Math.max(0, (Date.now() - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
    const recency = Math.max(35, Math.round(100 - ageDays * 2.5));
    const isOfficialRelease = inferredTag === "Release";
    const isPractical = /open.source|github|code|api|dataset|tool|release|available|demo/.test(lower);
    const isTechnical = /model|research|paper|benchmark|robot|world model|algorithm|architecture|dataset|safety|science/.test(lower);
    const scores = {
      impact: Math.min(98, (isCaseStudy ? 44 : isOfficialRelease ? 78 : 60) + (isTechnical ? 6 : 0) + (/benchmark|evaluation|frontier|state.of.the.art/.test(lower) ? 7 : 0)),
      buzz: Math.min(98, Math.round(recency * .72 + (isCaseStudy ? 3 : isOfficialRelease ? 22 : 8))),
      utility: Math.min(98, (isCaseStudy ? 48 : isPractical ? 82 : 58) + (/open.source|github|code/.test(lower) ? 8 : 0)),
    };
    return {
      id: createHash("sha1").update(sourceUrl || title).digest("hex").slice(0, 12),
      date,
      title,
      titleZh: title,
      summary: summary.slice(0, 280),
      summaryZh: summary.slice(0, 280),
      source: feed.name,
      sourceUrl,
      tag: inferredTag,
      domain,
      scores,
      provenance: {
        layer: feed.name.startsWith("arXiv") ? "Structured discovery" : "Primary",
        scoreNotes: {
          impact: isCaseStudy ? "Vendor customer story; useful as an adoption signal, not technical evidence." : isTechnical ? "Technical scope and likely downstream relevance inferred from the primary item." : "Primary-source relevance heuristic; independent validation may still be needed.",
          buzz: "Recency-based estimate; no social metric is included unless separately displayed.",
          utility: isPractical ? "Code, API, data, demo or availability cues were found in the item." : "No strong runnable-artifact cue was found in the feed text.",
        },
      },
    };
  }).filter((item) => item.title && item.sourceUrl).slice(0, 12);
}

function parseAnthropicNews(html, feed) {
  const links = Array.from(html.matchAll(/<a href="(\/news\/[^"]+)" class="[^"]*PublicationList[^\"]*__listItem">([\s\S]*?)<\/a>/g));
  return links.map((match) => {
    const block = match[2];
    const title = decode(block.match(/<span class="[^"]*__title[^\"]*">([\s\S]*?)<\/span>/)?.[1] || "");
    const rawDate = decode(block.match(/<time[^>]*>([\s\S]*?)<\/time>/)?.[1] || "");
    const category = decode(block.match(/<span class="[^"]*__subject[^\"]*">([\s\S]*?)<\/span>/)?.[1] || "Research");
    const sourceUrl = `https://www.anthropic.com${match[1]}`;
    const lower = title.toLowerCase();
    const release = /introduc|preview|releas|claude|model|standard/.test(lower);
    const practical = /model|hardware|api|code|scientist|research|tool/.test(lower);
    return {
      id: createHash("sha1").update(sourceUrl).digest("hex").slice(0, 12),
      date: Number.isNaN(Date.parse(rawDate)) ? new Date().toISOString().slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10),
      title,
      titleZh: title,
      summary: `${category || "News"} from Anthropic's official newsroom. Open the primary source for the full claim and evidence.`,
      summaryZh: `来自 Anthropic 官方 Newsroom 的${category || "动态"}；请打开原始来源查看完整主张与证据。`,
      source: feed.name,
      sourceUrl,
      tag: release ? "Release" : "Research",
      domain: feed.domain,
      scores: { impact: release ? 84 : 68, buzz: 82, utility: practical ? 78 : 58 },
      provenance: {
        layer: "Primary",
        scoreNotes: {
          impact: release ? "Official Anthropic model or infrastructure announcement." : "Official Anthropic research or company announcement.",
          buzz: "Recency-based estimate; no unverified social count is included.",
          utility: practical ? "The title indicates a model, tool, standard or research workflow." : "No strong runnable-artifact cue was found in the listing.",
        },
      },
    };
  }).filter((item) => item.title).slice(0, 10);
}

async function fetchHuggingFacePapers() {
  const response = await fetch("https://huggingface.co/api/daily_papers?limit=20", {
    headers: { "user-agent": "PaperTrace/1.0 (+https://github.com/yayajjiang/PaperTrace)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Hugging Face Papers: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) return [];
  return payload.map((entry) => {
    const paper = entry.paper || entry;
    const id = paper.id || paper.paperId || entry.id;
    const rawDate = entry.publishedAt || paper.publishedAt || paper.submittedOnDailyAt || paper.createdAt;
    const date = Number.isNaN(Date.parse(rawDate)) ? new Date().toISOString().slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10);
    const title = decode(paper.title || entry.title || "");
    const summary = decode(paper.summary || entry.summary || "").slice(0, 280);
    const upvotes = Number(paper.upvotes ?? entry.upvotes ?? 0);
    const practical = /github|code|dataset|benchmark|agent|tool|open.source/i.test(`${title} ${summary}`);
    return {
      id: `hf-${id}`,
      date,
      title,
      titleZh: title,
      summary,
      summaryZh: summary,
      source: "Hugging Face Papers",
      sourceUrl: `https://huggingface.co/papers/${id}`,
      tag: "Research",
      domain: "AI & CS",
      scores: {
        impact: Math.min(94, 58 + Math.round(Math.sqrt(Math.max(0, upvotes)) * 1.8)),
        buzz: Math.min(98, 45 + Math.round(Math.sqrt(Math.max(0, upvotes)) * 4.2)),
        utility: practical ? 86 : 62,
      },
      signals: { huggingFaceUpvotes: upvotes },
      provenance: {
        layer: "Structured discovery",
        scoreNotes: {
          impact: "Discovery score combines paper metadata with the separately displayed Hugging Face signal.",
          buzz: `Hugging Face Papers shows ${upvotes} upvotes at sync time; this is one platform signal, not total popularity.`,
          utility: practical ? "Title or abstract mentions code, data, benchmark, agent or tooling cues." : "No strong runnable-artifact cue was found in the metadata.",
        },
      },
    };
  }).filter((item) => item.id !== "hf-undefined" && item.title).slice(0, 10);
}

const fetchFeed = async (feed) => {
    const response = await fetch(feed.url, {
      headers: { "user-agent": "PaperTrace/1.0 (+https://github.com/yayajjiang/PaperTrace)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`${feed.name}: ${response.status}`);
    const body = await response.text();
    return feed.format === "html" ? parseAnthropicNews(body, feed) : parse(body, feed);
};

const results = await Promise.allSettled(feeds.map(fetchFeed));
for (const feed of arxivFeeds) {
  if (results.length > feeds.length) await new Promise((resolve) => setTimeout(resolve, 3_000));
  try {
    results.push({ status: "fulfilled", value: await fetchFeed(feed) });
  } catch (reason) {
    console.warn(reason instanceof Error ? reason.message : `${feed.name} unavailable`);
    results.push({ status: "rejected", reason });
  }
}

let huggingFaceItems = [];
let huggingFaceError = "";
try {
  huggingFaceItems = await fetchHuggingFacePapers();
} catch (error) {
  huggingFaceError = error instanceof Error ? error.message : "Hugging Face Papers unavailable";
  console.warn(huggingFaceError);
}

const rankedItems = results
  .flatMap((result) => result.status === "fulfilled" ? result.value : [])
  .concat(huggingFaceItems)
  .concat(editorialItems)
  .filter((item, index, all) => all.findIndex((candidate) => candidate.sourceUrl === item.sourceUrl) === index)
  .sort((a, b) => {
    const age = (item) => Math.max(0, (Date.now() - Date.parse(`${item.date}T00:00:00Z`)) / 86_400_000);
    const rank = (item) => item.scores.impact * .4 + item.scores.buzz * .3 + item.scores.utility * .3 - Math.min(30, age(item) * .65);
    return rank(b) - rank(a);
  });

// Preserve editorial ranking while guaranteeing that a fast-moving AI feed
// cannot crowd every other field out of the public research commons.
const domainFloor = ["AI & CS", "Bio & Medicine", "Physics", "Math & Stats", "Materials & Chemistry", "Social Science"];
const selectedUrls = new Set();
const selected = [];
for (const domain of domainFloor) {
  for (const item of rankedItems.filter((candidate) => candidate.domain === domain).slice(0, 4)) {
    selected.push(item);
    selectedUrls.add(item.sourceUrl);
  }
}
for (const item of rankedItems) {
  if (selected.length >= 48) break;
  if (!selectedUrls.has(item.sourceUrl)) {
    selected.push(item);
    selectedUrls.add(item.sourceUrl);
  }
}
const itemRank = (item) => {
  const age = Math.max(0, (Date.now() - Date.parse(`${item.date}T00:00:00Z`)) / 86_400_000);
  return item.scores.impact * .4 + item.scores.buzz * .3 + item.scores.utility * .3 - Math.min(30, age * .65);
};
const items = selected.sort((a, b) => itemRank(b) - itemRank(a));
const sourceHealth = [...feeds, ...arxivFeeds].map((feed, index) => {
  const result = results[index];
  return result?.status === "fulfilled"
    ? { name: feed.name, status: "ok", itemCount: result.value.length }
    : { name: feed.name, status: "error", itemCount: 0, note: result?.reason instanceof Error ? result.reason.message.slice(0, 120) : "Feed unavailable" };
});
sourceHealth.push(huggingFaceError
  ? { name: "Hugging Face Papers", status: "error", itemCount: 0, note: huggingFaceError.slice(0, 120) }
  : { name: "Hugging Face Papers", status: "ok", itemCount: huggingFaceItems.length });
sourceHealth.push({ name: "Editorial watchlist", status: "ok", itemCount: editorialItems.length });

if (items.length === 0) {
  throw new Error("No headlines fetched; keeping the checked-in editorial fallback.");
}

await mkdir("public/data", { recursive: true });
await writeFile(
  "public/data/headlines.json",
  `${JSON.stringify({ generatedAt: new Date().toISOString(), sources: sourceHealth, items }, null, 2)}\n`,
  "utf8"
);
console.log(`Wrote ${items.length} headlines from ${results.filter((item) => item.status === "fulfilled").length} feeds${huggingFaceItems.length ? " + Hugging Face Papers" : ""}.`);
