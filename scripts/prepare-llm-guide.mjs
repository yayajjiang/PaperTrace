#!/usr/bin/env node
/**
 * Small, dependency-free adapter for importing the generated LLM Guide pages.
 * It is deliberately source based: CI can run it before `next build` without
 * checking out the guide's very large public asset tree.
 */
import fs from "node:fs";
import path from "node:path";

export const GUIDE_COMMIT = "58f1cf869f36e9954b17dd0c79dba73cd86b63d7";
export const GUIDE_RAW_ROOT = `https://raw.githubusercontent.com/yayajjiang/PaperTrace/${GUIDE_COMMIT}/public/llm-guide/`;
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".html", ".md"]);
const ASSET_RE = /(^|["'(=:\s])((?:\/)?llm-guide\/[^"'<>\s)]+\.(?:png|jpe?g|webp|svg|gif|pdf))(\?[^"'<>\s)]*)?(#[^"'<>\s)]*)?/gi;
// Also consumes the previous adapter's runtime expression so predev can
// switch a working tree back to root-relative development URLs.
const INTERNAL_HREF_RE = /(<a\b[^>]*?\bhref\s*=\s*["'])(?:\$\{process\.env\.NODE_ENV === "production" \? "\/PaperTrace" : ""\}|\/PaperTrace)?\/llm-guide\//gis;

function assetUrl(assetPath, query = "", hash = "") {
  return `${GUIDE_RAW_ROOT}${assetPath.replace(/^\/?llm-guide\//i, "")}${query}${hash}`;
}

/** Replace local guide asset URLs, retaining query strings and fragments. */
export function rewriteAssetReferences(source) {
  return source.replace(ASSET_RE, (_match, prefix, assetPath, query = "", hash = "") =>
    `${prefix}${assetUrl(assetPath, query, hash)}`
  );
}

/**
 * Native anchors inside dangerouslySetInnerHTML bypass Next's basePath.
 * Keep dev URLs root relative while making production HTML point at Pages.
 * Only HTML anchor attributes are rewritten; Next <Link> href props do not
 * match this pattern and are consequently untouched.
 */
export function rewriteNativeGuideHrefs(source, { production = false } = {}) {
  return source.replace(INTERNAL_HREF_RE, (_match, prefix) =>
    `${prefix}${production ? "/PaperTrace" : ""}/llm-guide/`
  );
}

const NOTICE = `本文内容为中文原文；Article content is the original Chinese source, and this page does not provide a translation.`;
const NOTICE_MARKER = "data-papertrace-guide-language-notice";

/** Add a stable, bilingual source-language notice to generated page headers. */
export function addLanguageNotice(source) {
  if (source.includes(NOTICE_MARKER)) return source;
  const marker = '<p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>';
  if (!source.includes(marker)) return source;
  const notice = `        <p ${NOTICE_MARKER} className="text-xs text-paper-800/50 dark:text-slate-400">${NOTICE}</p>`;
  return source.replace(marker, `${marker}\n${notice}`);
}

/** Make chapter-bar links land on the first real child page. */
export function fixChapterBar(source) {
  if (!source.includes("manifest.chapters") || !source.includes("href={`/llm-guide/${ch.slug}`}")) return source;
  return source.replaceAll(
    "href={`/llm-guide/${ch.slug}`}",
    "href={`/llm-guide/${ch.children?.[0]?.slug ?? ch.slug}`}"
  );
}

export function transformSource(source, { chapterBar = false, production = false } = {}) {
  let result = rewriteAssetReferences(source);
  result = rewriteNativeGuideHrefs(result, { production });
  result = addLanguageNotice(result);
  result = fixChapterBar(result);
  return result;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function filesToAdapt(root) {
  // Avoid traversing dependencies, build output, and unrelated PaperTrace
  // pages. A direct fixture directory remains convenient for local tests.
  const guideDir = path.join(root, "src", "app", "llm-guide");
  if (fs.existsSync(guideDir)) {
    const components = ["LlmGuideChapterBar.tsx", "LlmGuideNav.tsx", "LlmGuideToc.tsx"]
      .map((name) => path.join(root, "src", "components", name))
      .filter((file) => fs.existsSync(file));
    return [...walk(guideDir), ...components];
  }
  return [];
}

export function adaptTree(root) {
  const production = process.env.PAPERTRACE_GUIDE_PRODUCTION === "1" ||
    process.env.NODE_ENV === "production" || process.env.npm_lifecycle_event === "prebuild";
  let changed = 0;
  for (const file of filesToAdapt(root)) {
    if (!TEXT_EXTENSIONS.has(path.extname(file))) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = transformSource(before, { chapterBar: path.basename(file) === "LlmGuideChapterBar.tsx", production });
    if (after !== before) { fs.writeFileSync(file, after); changed++; }
  }
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const root = process.argv[2] || process.cwd();
  const count = adaptTree(root);
  console.log(`PaperTrace guide adapter: updated ${count} file(s)`);
}
