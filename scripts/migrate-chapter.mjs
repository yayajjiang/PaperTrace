import fs from "fs";
import path from "path";
import { slugifySegment, slugifyRoute } from "./lib/slug.mjs";
import { convertMdToTsx } from "./lib/convert.mjs";

const CHAPTER_DIR = process.argv[2]; // e.g. "/d/ALL IN AI/MetaBlog/docs/sections/llm-guide/2-核心原理与架构"
const CHAPTER_ROUTE = process.argv[3]; // e.g. "2-核心原理与架构"
const FORCE = process.argv.includes("--force");
const ROUTE_MAP_PATH = path.join("scripts", ".route-map.json");

if (!CHAPTER_DIR || !CHAPTER_ROUTE) {
  console.error("Usage: node migrate-chapter.mjs <source-chapter-dir> <route-prefix> [--force]");
  process.exit(1);
}

function findMarkdownFiles(dir) {
  const results = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        const lower = entry.name.toLowerCase();
        if (["pdfs", "mineru-out", "mineru-pdfs", "hybrid_auto", "output", "downloads", "roadmap"].includes(lower)) continue;
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.toLowerCase().includes("mineru")) {
        // Skip root-level index.md duplicates (VitePress convention: dir.md is the real chapter intro)
        if (current === CHAPTER_DIR && entry.name.toLowerCase() === "index.md") continue;
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results;
}

const files = findMarkdownFiles(CHAPTER_DIR);

// Load / init global route map
const routeMap = fs.existsSync(ROUTE_MAP_PATH) ? JSON.parse(fs.readFileSync(ROUTE_MAP_PATH, "utf-8")) : {};

// Build slug routes for every file in this chapter and update routeMap
const chapterSlug = slugifySegment(CHAPTER_ROUTE);
const fileInfos = [];
const usedSlugs = new Set();
for (const file of files) {
  const rel = path.relative(CHAPTER_DIR, file).replace(/\\/g, "/");
  const relWithoutExt = rel.replace(/\.md$/, "");
  const segments = relWithoutExt.split("/");
  // Slugify every segment so URLs are ASCII-only, prefixed by the chapter slug
  let slugRoute = `${chapterSlug}/${slugifyRoute(segments)}`;
  // Deduplicate slug routes within this migration run
  if (usedSlugs.has(slugRoute)) {
    let suffix = 2;
    let candidate;
    do {
      candidate = `${slugRoute}-${suffix}`;
      suffix++;
    } while (usedSlugs.has(candidate));
    slugRoute = candidate;
  }
  usedSlugs.add(slugRoute);
  routeMap[relWithoutExt] = slugRoute;
  // Also map the shorthand X.md -> X route (VitePress-style "dir/dir.md" acts as "dir.md")
  const parts = relWithoutExt.split("/");
  if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
    routeMap[parts.slice(0, -1).join("/")] = slugRoute;
  }
  fileInfos.push({ file, rel, relWithoutExt, slugRoute });
}

// Persist route map
fs.writeFileSync(ROUTE_MAP_PATH, JSON.stringify(routeMap, null, 2), "utf-8");

// Manifest handling
const MANIFEST_PATH = path.join("src", "lib", "llm-guide-manifest.json");
let manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) : { chapters: [] };

function upsertChapter(chapterSlug, title) {
  const existing = manifest.chapters.find((c) => c.slug === chapterSlug);
  if (existing) {
    existing.title = title;
    existing.children = [];
    return existing;
  }
  const chapter = { slug: chapterSlug, title, children: [] };
  manifest.chapters.push(chapter);
  return chapter;
}

const chapterEntry = upsertChapter(chapterSlug, CHAPTER_ROUTE);

for (const info of fileInfos) {
  const outDir = path.join("src/app/llm-guide", info.slugRoute);

  if (!FORCE && fs.existsSync(path.join(outDir, "page.tsx"))) {
    console.log(`Skip (exists): ${info.slugRoute}`);
    continue;
  }

  // Copy images
  const imgSrcDir = path.join(path.dirname(info.file), "images");
  const imgDstDir = path.join("public/llm-guide", info.slugRoute, "images");
  if (fs.existsSync(imgSrcDir)) {
    fs.mkdirSync(imgDstDir, { recursive: true });
    for (const img of fs.readdirSync(imgSrcDir)) {
      const src = path.join(imgSrcDir, img);
      const dst = path.join(imgDstDir, img);
      if (fs.statSync(src).isFile() && !fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
      }
    }
  }

  const { tsx, title } = convertMdToTsx(info.file, info.slugRoute, info.relWithoutExt, routeMap);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "page.tsx"), tsx, "utf-8");
  console.log(`Generated: ${info.slugRoute}`);

  chapterEntry.children.push({ slug: info.slugRoute, title });
}

// Sort chapters by numeric prefix, then children by slug
manifest.chapters.sort((a, b) => {
  const an = parseFloat(a.slug.match(/^[0-9.]+/)?.[0] || 0);
  const bn = parseFloat(b.slug.match(/^[0-9.]+/)?.[0] || 0);
  return an - bn;
});
for (const ch of manifest.chapters) {
  ch.children.sort((a, b) => a.slug.localeCompare(b.slug));
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

console.log("\nMigration complete.");
