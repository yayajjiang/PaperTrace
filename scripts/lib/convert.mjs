import fs from "fs";
import path from "path";
import { marked } from "marked";
import katex from "katex";
import { slugifySegment } from "./slug.mjs";

const TEMPLATE = `"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = \`__HTML__\`;
  const toc: { level: number; id: string; text: string }[] = __TOC__;
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="__ROUTE__" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="__ROUTE__" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">__TITLE__</h1>
          <p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>
        </header>
        <article
          className="paper-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900">
        <LlmGuideToc items={toc} />
      </aside>
    </div>
  );
}
`;

function renderMath(tex, displayMode) {
  const cleaned = tex.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return katex.renderToString(cleaned, {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

function extractTitle(md) {
  const fm = md.match(/^title:\s*"([^"]+)"/m);
  if (fm) return fm[1];
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return "";
}

function slugifyHeading(text) {
  const tokens = text
    .split(/[^A-Za-z0-9\u4e00-\u9fa5]+/)
    .filter(Boolean)
    .map(slugifySegment);
  let slug = tokens.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = "heading";
  return slug;
}

function addHeadingIds(html) {
  const counts = new Map();
  return html.replace(/<h([2-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, content) => {
    if (/\bid\s*=/.test(attrs)) return match;
    const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return match;
    let base = slugifyHeading(text);
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    const id = count > 1 ? `${base}-${count}` : base;
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

function extractToc(html) {
  const toc = [];
  const regex = /<h([2-6])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text && id) toc.push({ level, id, text });
  }
  return toc;
}

export function convertMdToTsx(srcMd, slugRoute, originalRel, routeMap = {}) {
  const md = fs.readFileSync(srcMd, "utf-8");
  let cleanMd = md.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");

  const mathStore = [];
  let counter = 0;
  function stashMath(math, displayMode) {
    const key = `<!--MATH_${counter++}-->`;
    mathStore.push({ key, math: math.trim(), displayMode });
    return key;
  }

  let protectedMd = cleanMd.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => stashMath(tex, true));
  protectedMd = protectedMd.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_, tex) => stashMath(tex, false));

  let html = marked.parse(protectedMd);

  for (const { key, math, displayMode } of mathStore) {
    try {
      html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), renderMath(math, displayMode));
    } catch (e) {
      console.warn("KaTeX render failed:", math, e.message);
      html = html.replace(key, displayMode ? `<div class="math-error">${math}</div>` : `<span class="math-error">${math}</span>`);
    }
  }

  // Inject stable heading IDs before path rewrites (headings are unaffected)
  html = addHeadingIds(html);

  // Rewrite image paths
  html = html.replace(/src="images\/([^"]+)"/g, `src="/llm-guide/${slugRoute}/images/$1"`);
  html = html.replace(/src="\.\/images\/([^"]+)"/g, `src="/llm-guide/${slugRoute}/images/$1"`);

  // Rewrite .md links via routeMap
  const originalDir = path.dirname(originalRel);
  html = html.replace(/href="([^"]*\.md)"/g, (match, link) => {
    const decoded = decodeURIComponent(link);
    const resolvedOriginal = path.normalize(path.join(originalDir, decoded)).replace(/\\/g, "/").replace(/\.md$/, "");
    let targetSlug = routeMap[resolvedOriginal];
    // Fallback for VitePress shorthand: a link to dir/Title.md may actually point to dir/dir.md
    if (!targetSlug) {
      const parts = resolvedOriginal.split("/");
      if (parts.length >= 2) {
        const parent = parts[parts.length - 2];
        const fallback = [...parts.slice(0, -1), parent].join("/");
        targetSlug = routeMap[fallback];
      }
    }
    if (!targetSlug) {
      // Silently drop known placeholder links to excluded asset directories
      if (/(?:^|\/)images\/images$|(?:^|\/)pdfs\/pdfs$|(?:^|\/)downloads\/downloads$/.test(resolvedOriginal)) {
        return `href="#"`;
      }
      console.warn(`Link target not found: ${link} (resolved: ${resolvedOriginal}) in ${slugRoute}`);
      return `href="#broken-link"`;
    }
    return `href="/llm-guide/${targetSlug}"`;
  });

  const title = extractTitle(md) || path.basename(srcMd, ".md");
  const toc = extractToc(html);

  const escapedHtml = html
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  const tocJson = JSON.stringify(toc)
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  let tsx = TEMPLATE
    .replace(/__ROUTE__/g, slugRoute)
    .replace("__TITLE__", title.replace(/"/g, "&quot;"))
    .replace("__HTML__", escapedHtml)
    .replace("__TOC__", tocJson);

  return { tsx, title };
}
