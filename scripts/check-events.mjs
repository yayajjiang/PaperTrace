import { readFile, writeFile, mkdir } from "node:fs/promises";

const sourcePath = "src/data/events.json";
const payload = JSON.parse(await readFile(sourcePath, "utf8"));
if (!Array.isArray(payload) || payload.length === 0) throw new Error("Event catalog is empty");

const required = ["id", "title", "titleZh", "type", "domains", "startsAt", "endsAt", "location", "locationZh", "href", "verifiedAt"];
const ids = new Set();
const errors = [];
for (const event of payload) {
  for (const field of required) if (!event[field] || (Array.isArray(event[field]) && event[field].length === 0)) errors.push(`${event.id || "unknown"}: missing ${field}`);
  if (ids.has(event.id)) errors.push(`${event.id}: duplicate id`);
  ids.add(event.id);
  if (!/^https:\/\//.test(event.href || "")) errors.push(`${event.id}: canonical URL must use HTTPS`);
  if (event.startsAt > event.endsAt) errors.push(`${event.id}: startsAt is after endsAt`);
  if (event.deadlineAt && event.deadlineAt > event.endsAt) errors.push(`${event.id}: deadline is after event end`);
}
if (errors.length) throw new Error(`Event catalog validation failed:\n${errors.join("\n")}`);

const today = new Date().toISOString().slice(0, 10);
const ageDays = (date) => Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
const upcoming = payload.filter((event) => event.endsAt >= today);
const stale = upcoming.filter((event) => ageDays(event.verifiedAt) > 14).map((event) => ({ id: event.id, verifiedAt: event.verifiedAt }));
const urgent = upcoming
  .filter((event) => event.deadlineAt && event.deadlineAt >= today && ageDays(event.deadlineAt) >= -14)
  .map((event) => ({ id: event.id, deadlineAt: event.deadlineAt }));
const domains = Object.fromEntries([...new Set(payload.flatMap((event) => event.domains))].sort().map((domain) => [domain, upcoming.filter((event) => event.domains.includes(domain)).length]));
const coverageTargets = ["AI & CS", "Robotics", "Bio & Medicine", "Physics", "Math & Stats", "Materials & Chemistry", "Social Science"];
const coverageGaps = coverageTargets.filter((domain) => (domains[domain] || 0) < 3).map((domain) => ({ domain, upcoming: domains[domain] || 0, target: 3 }));

await mkdir("public/data", { recursive: true });
await writeFile("public/data/event-health.json", `${JSON.stringify({ checkedAt: new Date().toISOString(), total: payload.length, upcoming: upcoming.length, stale, urgent, domains, coverageGaps }, null, 2)}\n`);
console.log(`Validated ${payload.length} events: ${upcoming.length} upcoming, ${urgent.length} urgent deadlines, ${stale.length} stale records, ${coverageGaps.length} coverage gaps.`);
if (stale.length) console.warn(`Re-verify stale event records: ${stale.map((item) => item.id).join(", ")}`);
if (coverageGaps.length) console.warn(`Expand under-covered fields: ${coverageGaps.map((item) => item.domain).join(", ")}`);

