"use client";

import katex from "katex";
import { useMemo } from "react";

interface MathProps {
  /** LaTeX string */
  tex: string;
  /** Display mode (block) vs inline */
  display?: boolean;
  /** Optional label shown above the block */
  label?: string;
}

function sanitizeTex(tex: string) {
  // Strip control characters that sometimes leak into markdown/source formulas
  return tex.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export function Math({ tex, display = false, label }: MathProps) {
  const html = useMemo(() => {
    const cleanTex = sanitizeTex(tex);
    try {
      return katex.renderToString(cleanTex, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span style="color:red">Error rendering: ${tex}</span>`;
    }
  }, [tex, display]);

  if (!display) {
    return (
      <span
        className="math-inline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="math-block">
      {label && (
        <div className="text-xs font-mono text-paper-800/40 mb-3">{label}</div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
