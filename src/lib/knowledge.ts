import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { marked } from "marked";

export interface KnowledgeGarden {
  id: string;
  sourceName: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
}

export interface KnowledgeDocumentSummary {
  title: string;
  excerpt: string;
  route: string;
  slug: string[];
  depth: number;
}

export interface KnowledgeGardenSummary extends KnowledgeGarden {
  documentCount: number;
  documents: KnowledgeDocumentSummary[];
}

export interface KnowledgeTocItem {
  level: number;
  id: string;
  text: string;
}

export interface RenderedKnowledgeDocument {
  garden: KnowledgeGardenSummary;
  document: KnowledgeDocumentSummary;
  html: string;
  toc: KnowledgeTocItem[];
  sourceUrl: string;
}

interface KnowledgeDocument extends KnowledgeDocumentSummary {
  gardenId: string;
  sourcePath: string;
  body: string;
}

const SOURCE_REPOSITORY = "https://github.com/SingularGuyLeBorn/OasisMind";
const CONTENT_ROOT = path.join(process.cwd(), "public", "knowledge-source");
const BASE_PATH = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
const collator = new Intl.Collator("zh-Hans-CN", { numeric: true });

export const KNOWLEDGE_GARDENS: readonly KnowledgeGarden[] = [
  {
    id: "agent",
    sourceName: "Agent",
    titleEn: "AI Agents",
    titleZh: "AI Agent",
    descriptionEn: "From action loops and tools to runtime safety, training, and evaluation.",
    descriptionZh: "从行动循环、工具与记忆，到运行时安全、训练与评测。",
  },
  {
    id: "deepseek",
    sourceName: "DeepSeek",
    titleEn: "DeepSeek Systems and Models",
    titleZh: "DeepSeek 模型与系统",
    descriptionEn: "A connected reading path across model reports, architecture, training, inference, and open-source infrastructure.",
    descriptionZh: "贯通模型报告、架构、训练、推理与开源基础设施的 DeepSeek 技术谱系。",
  },
  {
    id: "rag",
    sourceName: "RetrievalAugmentedGeneration",
    titleEn: "Retrieval-Augmented Generation",
    titleZh: "检索增强生成",
    descriptionEn: "A traceable path from corpus construction and retrieval to grounded generation and evaluation.",
    descriptionZh: "从语料、检索与排序，到证据化生成和生产评测。",
  },
  {
    id: "sparse-attention",
    sourceName: "SparseAttention",
    titleEn: "Sparse Attention",
    titleZh: "稀疏注意力机制",
    descriptionEn: "Long-context attention from complexity and sparse topology to dynamic routing and kernels.",
    descriptionZh: "从复杂度与稀疏拓扑，到动态路由、缓存选择与内核实现。",
  },
  {
    id: "long-horizon-agents",
    sourceName: "LongHorizonTask",
    titleEn: "Long-Horizon Agents",
    titleZh: "长任务智能体",
    descriptionEn: "State consistency, memory, recovery, and evaluation across long-running tasks.",
    descriptionZh: "长程任务中的状态一致、跨轮记忆、恢复与评测。",
  },
  {
    id: "recursive-self-improvement",
    sourceName: "RecursiveSelfImprovement",
    titleEn: "Recursive Self-Improvement",
    titleZh: "递归自我改进",
    descriptionEn: "Definitions, evidence standards, self-evolving agents, and automated research loops.",
    descriptionZh: "自我改进的定义、证据规则、自演化 Agent 与自动研究闭环。",
  },
  {
    id: "continual-learning",
    sourceName: "ContinualLearning",
    titleEn: "Continual Learning and TTT",
    titleZh: "持续学习与 TTT",
    descriptionEn: "How models keep learning after training while controlling forgetting and drift.",
    descriptionZh: "模型训练后如何继续学习，并控制遗忘与分布漂移。",
  },
];

const gardenById = new Map(KNOWLEDGE_GARDENS.map((garden) => [garden.id, garden]));
const gardenBySourceName = new Map(
  KNOWLEDGE_GARDENS.map((garden) => [garden.sourceName, garden])
);
const documentCache = new Map<string, KnowledgeDocument[]>();

function walkMarkdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function cleanFrontmatterValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseMarkdown(source: string): {
  attributes: Record<string, string>;
  body: string;
} {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { attributes: {}, body: normalized };

  const attributes: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!key) continue;
    attributes[key] = cleanFrontmatterValue(line.slice(separator + 1));
  }
  return { attributes, body: normalized.slice(match[0].length) };
}

function routeSegmentsFromSource(sourcePath: string): string[] {
  const normalized = sourcePath.replace(/\\/g, "/");
  if (normalized === "_garden.md") return [];

  const segments = normalized.replace(/\.md$/i, "").split("/");
  if (segments.length > 1 && segments.at(-1) === segments.at(-2)) {
    segments.pop();
  }
  return segments.map((segment) => {
    const match = segment.match(/^(\d+(?:\.\d+)*)(?:[-_\s]+)?(.*)$/);
    if (!match) {
      return segment
        .toLocaleLowerCase("en-US")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    const number = match[1].replace(/\./g, "-");
    const words = match[2]
      .toLocaleLowerCase("en-US")
      .match(/[a-z0-9]+/g)
      ?.join("-");
    return words ? `${number}-${words}` : number;
  });
}

function publicRoute(gardenId: string, slug: string[]): string {
  return `/knowledge/${gardenId}${slug.length ? `/${slug.join("/")}` : ""}`;
}

function getDocuments(gardenId: string): KnowledgeDocument[] {
  const cached = documentCache.get(gardenId);
  if (cached) return cached;

  const garden = gardenById.get(gardenId);
  if (!garden) return [];
  const gardenRoot = path.join(CONTENT_ROOT, garden.id);
  if (!fs.existsSync(gardenRoot)) {
    throw new Error(`Knowledge garden source is missing: ${gardenRoot}`);
  }

  const documents = walkMarkdownFiles(gardenRoot)
    .map((file): KnowledgeDocument | null => {
      const sourcePath = path.relative(gardenRoot, file).replace(/\\/g, "/");
      const source = fs.readFileSync(file, "utf8");
      const { attributes, body } = parseMarkdown(source);
      if (attributes.published === "false") return null;

      const slug = routeSegmentsFromSource(sourcePath);
      const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
      const title = attributes.title || heading || path.basename(sourcePath, ".md");
      const excerpt = attributes.excerpt || attributes.description || "";
      return {
        gardenId,
        sourcePath,
        title,
        excerpt,
        route: publicRoute(gardenId, slug),
        slug,
        depth: slug.length,
        body,
      };
    })
    .filter((document): document is KnowledgeDocument => document !== null)
    .sort((left, right) => {
      if (left.slug.length === 0) return -1;
      if (right.slug.length === 0) return 1;
      return collator.compare(left.sourcePath, right.sourcePath);
    });

  const routes = new Set<string>();
  for (const document of documents) {
    if (routes.has(document.route)) {
      throw new Error(`Duplicate knowledge route: ${document.route}`);
    }
    routes.add(document.route);
  }

  documentCache.set(gardenId, documents);
  return documents;
}

function toSummary(document: KnowledgeDocument): KnowledgeDocumentSummary {
  return {
    title: document.title,
    excerpt: document.excerpt,
    route: document.route,
    slug: document.slug,
    depth: document.depth,
  };
}

export function getKnowledgeGardenSummaries(): KnowledgeGardenSummary[] {
  return KNOWLEDGE_GARDENS.map((garden) => {
    const documents = getDocuments(garden.id);
    return {
      ...garden,
      documentCount: documents.length,
      documents: documents.map(toSummary),
    };
  });
}

export function getKnowledgeGarden(gardenId: string): KnowledgeGardenSummary | null {
  return getKnowledgeGardenSummaries().find((garden) => garden.id === gardenId) ?? null;
}

export function getKnowledgeDocument(
  gardenId: string,
  slug: string[]
): KnowledgeDocument | null {
  const route = publicRoute(gardenId, slug.map(safelyDecode));
  return getDocuments(gardenId).find((document) => document.route === route) ?? null;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function headingId(value: string): string {
  const id = stripHtml(value)
    .toLocaleLowerCase("zh-Hans-CN")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || "section";
}

function addHeadingIds(html: string): { html: string; toc: KnowledgeTocItem[] } {
  const used = new Map<string, number>();
  const toc: KnowledgeTocItem[] = [];
  const withIds = html.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (_match, rawLevel: string, inner: string) => {
      const level = Number(rawLevel);
      const base = headingId(inner);
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      if (level === 2 || level === 3) {
        toc.push({ level, id, text: stripHtml(inner) });
      }
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );
  return { html: withIds, toc };
}

function renderMath(markdown: string): string {
  const codeBlocks: string[] = [];
  const inlineCode: string[] = [];
  let prepared = markdown.replace(/```[\s\S]*?```/g, (code) => {
    const token = `OMCODEBLOCK${codeBlocks.length}TOKEN`;
    codeBlocks.push(code);
    return token;
  });
  prepared = prepared.replace(/`[^`\n]+`/g, (code) => {
    const token = `OMINLINECODE${inlineCode.length}TOKEN`;
    inlineCode.push(code);
    return token;
  });

  prepared = prepared.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression: string) => {
    try {
      return `\n<div class="math-block">${katex.renderToString(expression.trim(), {
        displayMode: true,
        strict: "ignore",
        throwOnError: false,
      })}</div>\n`;
    } catch {
      return `$$${expression}$$`;
    }
  });
  prepared = prepared.replace(/(^|[^\\])\$([^$\n]+?)\$/g, (_match, prefix: string, expression: string) => {
    try {
      return `${prefix}<span class="math-inline">${katex.renderToString(expression.trim(), {
        displayMode: false,
        strict: "ignore",
        throwOnError: false,
      })}</span>`;
    } catch {
      return `${prefix}$${expression}$`;
    }
  });

  codeBlocks.forEach((code, index) => {
    prepared = prepared.replace(`OMCODEBLOCK${index}TOKEN`, code);
  });
  inlineCode.forEach((code, index) => {
    prepared = prepared.replace(`OMINLINECODE${index}TOKEN`, code);
  });
  return prepared;
}

function splitReference(reference: string): { pathname: string; suffix: string } {
  const match = reference.match(/^([^?#]*)([?#].*)?$/);
  return { pathname: match?.[1] ?? reference, suffix: match?.[2] ?? "" };
}

function safelyDecode(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function resolveMarkdownDocument(
  garden: KnowledgeGarden,
  document: KnowledgeDocument,
  reference: string
): KnowledgeDocument | null {
  const { pathname } = splitReference(reference);
  const decoded = safelyDecode(pathname);
  let targetGarden = garden;
  let targetPath = path.posix.normalize(path.posix.join(path.posix.dirname(document.sourcePath), decoded));

  if (targetPath.startsWith("../")) {
    const crossGarden = targetPath.match(/^(?:\.\.\/)+([^/]+)\/(.+)$/);
    const matchedGarden = crossGarden ? gardenBySourceName.get(crossGarden[1]) : undefined;
    if (!crossGarden || !matchedGarden) return null;
    targetGarden = matchedGarden;
    targetPath = crossGarden[2];
  }

  const candidates = [targetPath];
  if (!targetPath.endsWith(".md")) {
    candidates.push(`${targetPath}.md`);
    const name = path.posix.basename(targetPath);
    candidates.push(path.posix.join(targetPath, `${name}.md`));
    candidates.push(path.posix.join(targetPath, "_garden.md"));
  }

  const targetDocuments = getDocuments(targetGarden.id);
  return (
    candidates
      .map((candidate) => path.posix.normalize(candidate).replace(/^\.\//, ""))
      .map((candidate) => targetDocuments.find((item) => item.sourcePath === candidate))
      .find((item): item is KnowledgeDocument => Boolean(item)) ?? null
  );
}

function rewriteLinksAndImages(
  html: string,
  garden: KnowledgeGarden,
  document: KnowledgeDocument
): string {
  const linked = html.replace(/href="([^"]+)"/g, (match, reference: string) => {
    if (/^(?:https?:|mailto:|tel:|#)/i.test(reference)) {
      if (/^https?:/i.test(reference)) {
        return `href="${reference}" target="_blank" rel="noopener noreferrer"`;
      }
      return match;
    }

    const target = resolveMarkdownDocument(garden, document, reference);
    const { suffix } = splitReference(reference);
    if (target) {
      return `href="${BASE_PATH}${encodeURI(target.route)}${suffix}"`;
    }

    const { pathname } = splitReference(reference);
    if (pathname.toLocaleLowerCase().endsWith(".md")) {
      const repositoryPath = path.posix.normalize(
        path.posix.join(
          "content",
          garden.sourceName,
          path.posix.dirname(document.sourcePath),
          safelyDecode(pathname)
        )
      );
      return `href="${SOURCE_REPOSITORY}/blob/main/${encodeURI(
        repositoryPath
      )}${suffix}" target="_blank" rel="noopener noreferrer"`;
    }
    return match;
  });

  return linked.replace(/src="([^"]+)"/g, (match, reference: string) => {
    if (/^(?:https?:|data:|\/)/i.test(reference)) return match;
    const { pathname, suffix } = splitReference(reference);
    const assetPath = path.posix
      .normalize(path.posix.join(path.posix.dirname(document.sourcePath), safelyDecode(pathname)))
      .replace(/^(?:\.\.\/)+/, "");
    return `src="${BASE_PATH}/knowledge-source/${garden.id}/${encodeURI(assetPath)}${suffix}"`;
  });
}

export function renderKnowledgeDocument(
  gardenId: string,
  slug: string[]
): RenderedKnowledgeDocument | null {
  const garden = gardenById.get(gardenId);
  const gardenSummary = getKnowledgeGarden(gardenId);
  const document = getKnowledgeDocument(gardenId, slug);
  if (!garden || !gardenSummary || !document) return null;

  const withoutDuplicateTitle = document.body.replace(/^\s*#\s+.+\r?\n+/, "");
  const parsed = String(marked.parse(renderMath(withoutDuplicateTitle), { gfm: true }));
  const rewritten = rewriteLinksAndImages(parsed, garden, document);
  const withHeadings = addHeadingIds(rewritten);
  const sourceUrl = `${SOURCE_REPOSITORY}/blob/main/content/${encodeURI(
    `${garden.sourceName}/${document.sourcePath}`
  )}`;

  return {
    garden: gardenSummary,
    document: toSummary(document),
    html: withHeadings.html,
    toc: withHeadings.toc,
    sourceUrl,
  };
}
