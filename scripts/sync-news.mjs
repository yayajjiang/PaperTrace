import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const feeds = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", tag: "Release", domain: "AI & CS" },
  { name: "Anthropic", url: "https://www.anthropic.com/rss.xml", tag: "Release", domain: "AI & CS" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", tag: "Research", domain: "AI & CS" },
  {
    name: "arXiv multi-field",
    url: "https://export.arxiv.org/api/query?search_query=%28cat%3Acs.AI+OR+cat%3Acs.LG+OR+cat%3Acs.CL+OR+cat%3Aq-bio.BM+OR+cat%3Aq-bio.GN+OR+cat%3Aphysics.comp-ph+OR+cat%3Amath.OC+OR+cat%3Astat.ML+OR+cat%3Acond-mat.mtrl-sci+OR+cat%3Aphysics.chem-ph+OR+cat%3Aecon.EM%29&start=0&max_results=18&sortBy=submittedDate&sortOrder=descending",
    tag: "Research",
    domain: "Multidisciplinary",
  },
];

const decode = (value = "") =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
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
    const inferredTag = /introduc|releas|launch|announc|new model|open.source/.test(title.toLowerCase()) ? "Release" : feed.tag;
    const ageDays = Math.max(0, (Date.now() - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
    const recency = Math.max(35, Math.round(100 - ageDays * 2.5));
    const isOfficialRelease = inferredTag === "Release";
    const isPractical = /open.source|github|code|api|dataset|tool|release|available|demo/.test(lower);
    const scores = {
      impact: Math.min(98, (isOfficialRelease ? 78 : 60) + (/benchmark|evaluation|frontier|state.of.the.art/.test(lower) ? 9 : 0)),
      buzz: Math.min(98, Math.round(recency * .72 + (isOfficialRelease ? 22 : 8))),
      utility: Math.min(98, (isPractical ? 82 : 58) + (/open.source|github|code/.test(lower) ? 8 : 0)),
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
    };
  }).filter((item) => item.title && item.sourceUrl).slice(0, feed.tag === "Release" ? 5 : 10);
}

const results = await Promise.allSettled(
  feeds.map(async (feed) => {
    const response = await fetch(feed.url, {
      headers: { "user-agent": "PaperTrace/1.0 (+https://github.com/yayajjiang/PaperTrace)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`${feed.name}: ${response.status}`);
    return parse(await response.text(), feed);
  })
);

const items = results
  .flatMap((result) => result.status === "fulfilled" ? result.value : [])
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 18);

if (items.length === 0) {
  throw new Error("No headlines fetched; keeping the checked-in editorial fallback.");
}

await mkdir("public/data", { recursive: true });
await writeFile(
  "public/data/headlines.json",
  `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`,
  "utf8"
);
console.log(`Wrote ${items.length} headlines from ${results.filter((item) => item.status === "fulfilled").length} feeds.`);
