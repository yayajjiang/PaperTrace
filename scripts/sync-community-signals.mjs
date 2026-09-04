import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const outputPath = "public/data/community-signals.json";
const previous = await readFile(outputPath, "utf8").then((body) => JSON.parse(body)).catch(() => ({ items: [] }));
const relevant = /(?:\bai\b|agent|gpt|claude|gemini|llm|model|paper|research|skill|mcp|robot|arxiv|科研|论文|模型|智能体|机器人|世界模型|具身|开源)/i;
const now = new Date().toISOString();
const curatedLinuxDoFallback = [
  {
    id: "linuxdo-1714405", platform: "LINUX DO",
    title: "开源：科研 Skills 仓库、评分与生成工作流",
    url: "https://linux.do/t/topic/1714405", publishedAt: "2026-03-09T11:03:00Z", lastActivityAt: null,
    capturedAt: "2026-09-04T00:00:00Z", tags: ["科研 Skills", "开源"], metrics: {}, platformScore: 4,
    evidence: "Manually checked public discussion; automated refresh is blocked by the source.", stale: true,
  },
  {
    id: "linuxdo-2327036", platform: "LINUX DO",
    title: "AI 科研党推荐的 Skills 与 Zotero MCP 实测讨论",
    url: "https://linux.do/t/topic/2327036", publishedAt: "2026-06-08T03:48:00Z", lastActivityAt: null,
    capturedAt: "2026-09-04T00:00:00Z", tags: ["科研", "MCP", "Skills"], metrics: { likes: 173 }, platformScore: 519,
    evidence: "Manually checked public discussion; automated refresh is blocked by the source.", stale: true,
  },
  {
    id: "linuxdo-2542518", platform: "LINUX DO",
    title: "如何批量搜集并总结某一方向的文献：工具与 Skills 讨论",
    url: "https://linux.do/t/topic/2542518", publishedAt: "2026-07-08T01:13:00Z", lastActivityAt: null,
    capturedAt: "2026-09-04T00:00:00Z", tags: ["文献检索", "Agent"], metrics: {}, platformScore: 3,
    evidence: "Manually checked public discussion; automated refresh is blocked by the source.", stale: true,
  },
  {
    id: "linuxdo-2583766", platform: "LINUX DO",
    title: "比较 AI4S、K-Dense 等科研 Skills 库的社区讨论",
    url: "https://linux.do/t/topic/2583766", publishedAt: "2026-07-14T12:03:00Z", lastActivityAt: null,
    capturedAt: "2026-09-04T00:00:00Z", tags: ["AI4S", "科研 Skills"], metrics: {}, platformScore: 2,
    evidence: "Manually checked public discussion; automated refresh is blocked by the source.", stale: true,
  },
];
const decode = (value = "") => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();
const pick = (block, name) => decode(block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i"))?.[1] || "");

async function fetchLinuxDo() {
  const response = await fetch("https://linux.do/top.json?period=daily", {
    headers: { "user-agent": "PaperTrace/1.0 public-research-signal-reader", accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (response.ok) {
    const data = await response.json();
    return (data.topic_list?.topics || [])
      .filter((topic) => relevant.test(topic.title || ""))
      .sort((a, b) => (b.like_count + b.posts_count + Math.log10(Math.max(1, b.views)) * 10) - (a.like_count + a.posts_count + Math.log10(Math.max(1, a.views)) * 10))
      .slice(0, 12)
      .map((topic) => ({
        id: "linuxdo-" + topic.id,
        platform: "LINUX DO",
        title: topic.title,
        url: "https://linux.do/t/topic/" + topic.id,
        publishedAt: topic.created_at,
        lastActivityAt: topic.last_posted_at,
        capturedAt: now,
        tags: topic.tags || [],
        metrics: { views: topic.views, replies: Math.max(0, topic.posts_count - 1), likes: topic.like_count },
        platformScore: Math.round(topic.like_count * 3 + topic.posts_count * 2 + Math.log10(Math.max(1, topic.views)) * 10),
        evidence: "Public topic metadata; community attention only.",
      }));
  }

  const rssResponse = await fetch("https://linux.do/latest.rss", {
    headers: { "user-agent": "PaperTrace/1.0 public-research-signal-reader", accept: "application/rss+xml" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!rssResponse.ok) throw new Error("LINUX DO JSON " + response.status + ", RSS " + rssResponse.status);
  const blocks = (await rssResponse.text()).match(/<item>[\s\S]*?<\/item>/gi) || [];
  return blocks
    .map((block) => ({ title: pick(block, "title"), url: pick(block, "link"), publishedAt: pick(block, "pubDate"), category: pick(block, "category") }))
    .filter((topic) => topic.title && topic.url && relevant.test(topic.title + " " + topic.category))
    .slice(0, 12)
    .map((topic, index) => ({
      id: "linuxdo-rss-" + createHash("sha1").update(topic.url).digest("hex").slice(0, 10),
      platform: "LINUX DO",
      title: topic.title,
      url: topic.url,
      publishedAt: Number.isNaN(Date.parse(topic.publishedAt)) ? now : new Date(topic.publishedAt).toISOString(),
      lastActivityAt: null,
      capturedAt: now,
      tags: topic.category ? [topic.category] : [],
      metrics: {},
      platformScore: 12 - index,
      evidence: "Public RSS discovery signal; engagement metrics unavailable.",
    }));
}

async function fetchHackerNews() {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Hacker News: " + response.status);
  const ids = (await response.json()).slice(0, 60);
  const stories = await Promise.all(ids.map(async (id) => {
    const itemResponse = await fetch("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", { signal: AbortSignal.timeout(10_000) });
    return itemResponse.ok ? itemResponse.json() : null;
  }));
  return stories
    .filter((story) => story?.type === "story" && relevant.test(story.title || ""))
    .sort((a, b) => (b.score + (b.descendants || 0) * 1.5) - (a.score + (a.descendants || 0) * 1.5))
    .slice(0, 12)
    .map((story) => ({
      id: "hn-" + story.id,
      platform: "Hacker News",
      title: story.title,
      url: "https://news.ycombinator.com/item?id=" + story.id,
      primaryUrl: story.url || null,
      publishedAt: new Date(story.time * 1000).toISOString(),
      lastActivityAt: null,
      capturedAt: now,
      tags: [],
      metrics: { points: story.score, comments: story.descendants || 0 },
      platformScore: Math.round(story.score + (story.descendants || 0) * 1.5),
      evidence: "Public story metadata; community attention only.",
    }));
}

const adapters = [
  { platform: "LINUX DO", run: fetchLinuxDo },
  { platform: "Hacker News", run: fetchHackerNews },
];
const results = await Promise.allSettled(adapters.map((adapter) => adapter.run()));
const sources = [];
const items = [];
for (let index = 0; index < adapters.length; index += 1) {
  const adapter = adapters[index];
  const result = results[index];
  if (result.status === "fulfilled") {
    sources.push({ name: adapter.platform, status: "ok", itemCount: result.value.length });
    items.push(...result.value);
  } else {
    const note = result.reason instanceof Error ? result.reason.message : String(result.reason);
    const saved = (previous.items || []).filter((item) => item.platform === adapter.platform);
    const fallback = (saved.length ? saved : adapter.platform === "LINUX DO" ? curatedLinuxDoFallback : []).map((item) => ({ ...item, stale: true }));
    sources.push({ name: adapter.platform, status: "error", itemCount: fallback.length, note });
    items.push(...fallback);
  }
}

await mkdir("public/data", { recursive: true });
await writeFile(outputPath, JSON.stringify({
  generatedAt: now,
  methodology: "Platform-local engagement snapshots. Scores are not comparable across platforms and never count as scientific impact.",
  policy: "Read public metadata only. PaperTrace never auto-posts to community platforms.",
  sources,
  items: items.map((item) => ({ ...item, digest: createHash("sha1").update(item.platform + item.url + item.capturedAt).digest("hex").slice(0, 10) })),
}, null, 2) + "\n");
console.table(sources);
console.log("Wrote " + items.length + " public community signals.");
