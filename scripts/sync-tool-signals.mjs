import { readFile, writeFile, mkdir } from "node:fs/promises";

const outputPath = "public/data/tool-signals.json";
const repositories = [
  { id: "arex-skill", repo: "VectorSpaceLab/AREX-Skill" },
  { id: "deepxiv", repo: "DeepXiv/deepxiv_sdk" },
  { id: "plumed", repo: "plumed/plumed2" },
];

const previous = await readFile(outputPath, "utf8")
  .then((body) => JSON.parse(body))
  .catch(() => ({ signals: [] }));
const previousById = new Map((previous.signals || []).map((item) => [item.id, item]));
const token = process.env.GITHUB_TOKEN;

const results = await Promise.allSettled(repositories.map(async ({ id, repo }) => {
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "PaperTrace/1.0",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${repo}: GitHub API ${response.status}`);
  const data = await response.json();
  return {
    id,
    repository: repo,
    sourceUrl: data.html_url,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    pushedAt: data.pushed_at,
    archived: data.archived,
    license: data.license?.spdx_id || null,
    capturedAt: new Date().toISOString(),
  };
}));

const sources = [];
const signals = repositories.flatMap((repository, index) => {
  const result = results[index];
  if (result.status === "fulfilled") {
    sources.push({ name: repository.repo, status: "ok" });
    return [result.value];
  }
  const note = result.reason instanceof Error ? result.reason.message : String(result.reason);
  sources.push({ name: repository.repo, status: "error", note });
  const fallback = previousById.get(repository.id);
  return fallback ? [{ ...fallback, stale: true }] : [];
});

await mkdir("public/data", { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  methodology: "Public GitHub repository API snapshot. Stars measure repository attention, not scientific quality.",
  sources,
  signals,
}, null, 2)}\n`);

console.table(sources);
console.log(`Wrote ${signals.length} verifiable repository signals.`);
