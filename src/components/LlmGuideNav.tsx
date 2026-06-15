"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import manifest from "@/lib/llm-guide-manifest.json";

interface NavItem {
  slug: string;
  title: string;
}

interface Chapter {
  slug: string;
  title: string;
  children: NavItem[];
}

interface TreeNode {
  slug: string;
  title: string;
  link?: string;
  children: TreeNode[];
}

function shortTitle(title: string) {
  return title
    .replace(/^第?\s*[0-9.]+\s*章\s*[·\-]?\s*/, "")
    .replace(/^[0-9.]+[-\s]/, "");
}

function naturalSort(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g;
  const aParts = a.match(re) || [];
  const bParts = b.match(re) || [];
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aNum = parseInt(aParts[i], 10);
    const bNum = parseInt(bParts[i], 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = aParts[i].localeCompare(bParts[i]);
      if (cmp !== 0) return cmp;
    }
  }
  return aParts.length - bParts.length;
}

function sortNodes(nodes: TreeNode[]) {
  nodes.sort((a, b) => naturalSort(a.slug.split("/").pop() || a.slug, b.slug.split("/").pop() || b.slug));
  for (const node of nodes) {
    if (node.children.length) sortNodes(node.children);
  }
}

function buildTree(children: NavItem[]): TreeNode[] {
  const roots: TreeNode[] = [];
  for (const item of children) {
    const parts = item.slug.split("/");
    const isFolderNote = parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2];
    const pathParts = isFolderNote ? parts.slice(0, -1) : parts;

    let siblings = roots;
    let parentSlug = "";
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const slug = parentSlug ? `${parentSlug}/${part}` : part;
      let node = siblings.find((n) => n.slug === slug);
      if (!node) {
        node = { slug, title: part, children: [] };
        siblings.push(node);
      }
      if (i === pathParts.length - 1) {
        node.title = item.title;
        node.link = item.slug;
      }
      parentSlug = slug;
      siblings = node.children;
    }
  }
  sortNodes(roots);
  return roots;
}

function getAncestorSlugs(route: string): Set<string> {
  const set = new Set<string>();
  const parts = route.split("/");
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc = acc ? `${acc}/${parts[i]}` : parts[i];
    set.add(acc);
  }
  return set;
}

function NavTree({
  nodes,
  currentRoute,
  expanded,
  toggle,
}: {
  nodes: TreeNode[];
  currentRoute: string;
  expanded: Set<string>;
  toggle: (slug: string) => void;
}) {
  const router = useRouter();

  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const isActive = currentRoute === node.slug;
        const isOnPath = currentRoute.startsWith(node.slug + "/");
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded.has(node.slug);

        const navigate = () => {
          if (node.link) {
            router.push(`/llm-guide/${node.link}`);
          } else if (hasChildren) {
            toggle(node.slug);
          }
        };

        return (
          <li key={node.slug}>
            <div
              role={node.link ? "link" : undefined}
              tabIndex={node.link ? 0 : undefined}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                navigate();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate();
                }
              }}
              className={`
                group flex items-center gap-1 rounded-md transition-colors cursor-pointer
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "hover:bg-paper-100 dark:hover:bg-slate-800 text-paper-800 dark:text-slate-300"
                }
              `}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(node.slug);
                  }}
                  className={`
                    shrink-0 w-6 h-6 flex items-center justify-center text-xs rounded
                    text-paper-800/40 dark:text-slate-500
                    hover:bg-paper-200 dark:hover:bg-slate-700 hover:text-paper-800 dark:hover:text-slate-200
                    transition-colors
                  `}
                  aria-label={isExpanded ? "收起" : "展开"}
                >
                  {isExpanded ? "−" : "+"}
                </button>
              ) : (
                <span className="shrink-0 w-6" />
              )}
              <span
                className={`
                  flex-1 truncate py-1.5 pr-2 text-xs
                  ${isActive ? "font-medium" : ""}
                  ${node.link ? "" : "text-paper-800/60 dark:text-slate-400"}
                `}
                title={node.title}
              >
                {shortTitle(node.title)}
              </span>
              {isActive && (
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
              )}
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-3 mt-0.5 pl-2 border-l border-paper-200 dark:border-slate-700">
                <NavTree
                  nodes={node.children}
                  currentRoute={currentRoute}
                  expanded={expanded}
                  toggle={toggle}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function LlmGuideNav({ currentRoute }: { currentRoute: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const activeChapter = manifest.chapters.find(
    (ch: Chapter) => currentRoute === ch.slug || currentRoute.startsWith(ch.slug + "/")
  );

  const initialExpanded = useMemo(() => {
    const set = new Set<string>();
    if (activeChapter) {
      set.add(activeChapter.slug);
      const ancestors = getAncestorSlugs(currentRoute);
      ancestors.forEach((s) => set.add(s));
    }
    return set;
  }, [activeChapter, currentRoute]);

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  if (pathname) {
    const expected = new Set<string>();
    if (activeChapter) {
      expected.add(activeChapter.slug);
      getAncestorSlugs(currentRoute).forEach((s) => expected.add(s));
    }
    const missing = Array.from(expected).filter((s) => !expanded.has(s));
    if (missing.length) {
      setExpanded((prev) => {
        const next = new Set(prev);
        missing.forEach((s) => next.add(s));
        return next;
      });
    }
  }

  const toggle = useCallback((slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const sidebar = (
    <div className="p-4">
      <Link
        href="/llm-guide"
        className="block text-lg font-bold tracking-tight mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        LLM Guide
      </Link>
      <nav className="space-y-4">
        {(manifest.chapters as Chapter[]).map((ch) => {
          const isActive = activeChapter?.slug === ch.slug;
          const tree = useMemo(() => buildTree(ch.children), [ch.children]);
          return (
            <div key={ch.slug}>
              <Link
                href={`/llm-guide/${ch.slug}`}
                className={`
                  block px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-paper-800 dark:text-slate-200 hover:bg-paper-100 dark:hover:bg-slate-800"
                  }
                `}
              >
                {shortTitle(ch.title)}
              </Link>
              {isActive && tree.length > 0 && (
                <div className="mt-1.5">
                  <NavTree
                    nodes={tree}
                    currentRoute={currentRoute}
                    expanded={expanded}
                    toggle={toggle}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 shadow-sm"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? "关闭" : "目录"}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-40 h-screen w-72 overflow-y-auto
          border-r border-paper-200 dark:border-slate-700
          bg-paper-50 dark:bg-slate-900
          transform transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="
          hidden lg:block w-72 shrink-0 sticky top-0 h-screen overflow-y-auto
          border-r border-paper-200 dark:border-slate-700
          bg-paper-50 dark:bg-slate-900
        "
      >
        {sidebar}
        <div className="h-12" />
      </aside>
    </>
  );
}
