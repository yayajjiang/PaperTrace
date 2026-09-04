import { readFile, writeFile, mkdir } from "node:fs/promises";

const outputPath = "public/data/provider-status.json";
const previous = await readFile(outputPath, "utf8").then((body) => JSON.parse(body)).catch(() => ({ providers: [] }));
const previousByName = new Map((previous.providers || []).map((provider) => [provider.name, provider]));
const providers = [
  { name: "OpenAI", baseUrl: "https://status.openai.com", pageUrl: "https://status.openai.com/" },
  { name: "Claude", baseUrl: "https://status.claude.com", pageUrl: "https://status.claude.com/" },
];

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "PaperTrace/1.0 status-reader" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(url + ": " + response.status);
  return response.json();
}

const capturedAt = new Date().toISOString();
const results = await Promise.allSettled(providers.map(async (provider) => {
  const [summary, incidentData] = await Promise.all([
    getJson(provider.baseUrl + "/api/v2/summary.json"),
    getJson(provider.baseUrl + "/api/v2/incidents.json"),
  ]);
  return {
    name: provider.name,
    pageUrl: provider.pageUrl,
    indicator: summary.status?.indicator || "unknown",
    description: summary.status?.description || "Unknown",
    updatedAt: summary.page?.updated_at || capturedAt,
    affectedComponents: (summary.components || []).filter((component) => component.status !== "operational").map((component) => ({ name: component.name, status: component.status })),
    recentIncidents: (incidentData.incidents || []).slice(0, 6).map((incident) => ({
      id: incident.id,
      name: incident.name,
      status: incident.status,
      impact: incident.impact,
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
      resolvedAt: incident.resolved_at,
      latestUpdate: incident.incident_updates?.[0]?.body?.replace(/\s+/g, " ").trim().slice(0, 280) || "",
    })),
    capturedAt,
  };
}));

const sources = [];
const statusProviders = providers.flatMap((provider, index) => {
  const result = results[index];
  if (result.status === "fulfilled") {
    sources.push({ name: provider.name, status: "ok" });
    return [result.value];
  }
  const note = result.reason instanceof Error ? result.reason.message : String(result.reason);
  const fallback = previousByName.get(provider.name);
  sources.push({ name: provider.name, status: "error", note, staleFallback: Boolean(fallback) });
  return fallback ? [{ ...fallback, stale: true }] : [];
});

await mkdir("public/data", { recursive: true });
await writeFile(outputPath, JSON.stringify({
  generatedAt: capturedAt,
  methodology: "Official provider status APIs. Operational status is distinct from model availability and lifecycle.",
  sources,
  providers: statusProviders,
}, null, 2) + "\n");
console.table(sources);
console.log("Wrote status for " + statusProviders.length + " providers.");
