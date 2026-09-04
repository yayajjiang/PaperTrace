import { readFile, writeFile, mkdir } from "node:fs/promises";

const items = JSON.parse(await readFile("src/data/model-lifecycle.json", "utf8"));
if (!Array.isArray(items) || items.length === 0) throw new Error("Model lifecycle catalog is empty");

const validStatuses = new Set(["Available", "Preview", "Limited", "Watch", "Deprecated", "Retired"]);
const required = ["id", "provider", "model", "surface", "status", "announcedAt", "dateLabel", "summary", "summaryZh", "nextAction", "nextActionZh", "officialUrl", "verifiedAt"];
const ids = new Set();
const errors = [];
for (const item of items) {
  for (const field of required) if (!item[field]) errors.push((item.id || "unknown") + ": missing " + field);
  if (ids.has(item.id)) errors.push(item.id + ": duplicate id");
  ids.add(item.id);
  if (!validStatuses.has(item.status)) errors.push(item.id + ": invalid status " + item.status);
  if (!/^https:\/\//.test(item.officialUrl || "")) errors.push(item.id + ": official URL must use HTTPS");
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(item.announcedAt || "")) errors.push(item.id + ": announcedAt must be YYYY-MM or YYYY-MM-DD");
  if (item.actionAt && !/^\d{4}-\d{2}-\d{2}$/.test(item.actionAt)) errors.push(item.id + ": actionAt must be YYYY-MM-DD");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt || "")) errors.push(item.id + ": verifiedAt must be YYYY-MM-DD");
}
if (errors.length) throw new Error("Model lifecycle validation failed:\n" + errors.join("\n"));

const today = new Date().toISOString().slice(0, 10);
const dayDelta = (date) => Math.ceil((Date.parse(date + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86_400_000);
const stale = items.filter((item) => dayDelta(item.verifiedAt) < -14).map((item) => ({ id: item.id, verifiedAt: item.verifiedAt }));
const upcomingActions = items
  .filter((item) => item.actionAt && dayDelta(item.actionAt) >= 0 && dayDelta(item.actionAt) <= 60)
  .map((item) => ({ id: item.id, provider: item.provider, actionAt: item.actionAt, days: dayDelta(item.actionAt), status: item.status }));
const providers = Object.fromEntries([...new Set(items.map((item) => item.provider))].sort().map((provider) => [provider, items.filter((item) => item.provider === provider).length]));

await mkdir("public/data", { recursive: true });
await writeFile("public/data/model-health.json", JSON.stringify({ checkedAt: new Date().toISOString(), total: items.length, providers, stale, upcomingActions }, null, 2) + "\n");
console.log("Validated " + items.length + " lifecycle records: " + upcomingActions.length + " actions within 60 days, " + stale.length + " stale records.");
if (stale.length) console.warn("Re-verify model records: " + stale.map((item) => item.id).join(", "));
