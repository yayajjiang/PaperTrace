"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fallbackHeadlines, Headline } from "@/lib/headlines";
import { useLang } from "@/lib/i18n";

const domainColors: Record<string, string> = {
  "AI & CS": "#2563eb",
  "Bio & Medicine": "#059669",
  Physics: "#7c3aed",
  "Math & Stats": "#0891b2",
  "Materials & Chemistry": "#d97706",
  "Social Science": "#e11d48",
  Multidisciplinary: "#64748b",
};

export function MomentumMap() {
  const { lang, t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [items, setItems] = useState<Headline[]>(fallbackHeadlines);
  const [days, setDays] = useState(7);
  const [domain, setDomain] = useState("All");
  const [selected, setSelected] = useState<Headline | null>(null);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    const observer = new ResizeObserver((entries) => setWidth(Math.max(320, Math.floor(entries[0].contentRect.width))));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(`${basePath}/data/headlines.json`).then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items?: Headline[] }) => { if (data.items?.length) setItems(data.items); })
      .catch(() => undefined);
  }, [basePath]);

  const domains = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.domain || "Multidisciplinary")))], [items]);
  const plotted = useMemo(() => {
    const latest = Math.max(...items.map((item) => Date.parse(`${item.date}T00:00:00Z`)));
    return items.filter((item) => {
      const age = (latest - Date.parse(`${item.date}T00:00:00Z`)) / 86_400_000;
      return age <= days && (domain === "All" || item.domain === domain) && item.scores;
    });
  }, [days, domain, items]);

  const height = width < 520 ? 390 : 420;
  const margin = { left: width < 520 ? 50 : 64, right: 22, top: 24, bottom: 54 };
  const x = (value: number) => margin.left + ((value - 45) / 55) * (width - margin.left - margin.right);
  const y = (value: number) => height - margin.bottom - ((value - 45) / 55) * (height - margin.top - margin.bottom);
  const ticks = width < 520 ? [50, 70, 90] : [50, 60, 70, 80, 90, 100];

  return (
    <div className="momentum-map">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {[1, 7, 30].map((value) => <button key={value} onClick={() => setDays(value)} className={`domain-pill ${days === value ? "domain-pill-active" : ""}`}>{value === 1 ? "24h" : `${value}d`}</button>)}
        </div>
        <select value={domain} onChange={(event) => setDomain(event.target.value)} className="radar-select" aria-label={t("Filter chart by field", "按领域筛选图表")}>
          {domains.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div ref={containerRef} className="w-full">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("Research topics plotted by practical utility, impact, and buzz", "按实用性、影响力与火爆度展示的科研热点图")}>
          <rect x={margin.left} y={margin.top} width={width - margin.left - margin.right} height={height - margin.top - margin.bottom} rx="10" className="chart-frame" />
          {ticks.map((tick) => (
            <g key={`x-${tick}`}>
              <line x1={x(tick)} x2={x(tick)} y1={margin.top} y2={height - margin.bottom} className="chart-gridline" />
              <text x={x(tick)} y={height - margin.bottom + 20} textAnchor="middle" className="chart-label">{tick}</text>
            </g>
          ))}
          {ticks.map((tick) => (
            <g key={`y-${tick}`}>
              <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} className="chart-gridline" />
              <text x={margin.left - 10} y={y(tick) + 4} textAnchor="end" className="chart-label">{tick}</text>
            </g>
          ))}
          <text x={(margin.left + width - margin.right) / 2} y={height - 14} textAnchor="middle" className="chart-axis-title">{t("Practical utility →", "实用性 →")}</text>
          <text transform={`translate(15 ${(margin.top + height - margin.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="chart-axis-title">{t("Impact →", "影响力 →")}</text>
          {plotted.map((item, index) => {
            const scores = item.scores!;
            const cx = Math.max(margin.left + 12, Math.min(width - margin.right - 12, x(scores.utility) + ((index % 3) - 1) * 3));
            const cy = Math.max(margin.top + 12, Math.min(height - margin.bottom - 12, y(scores.impact) + ((index % 4) - 1.5) * 3));
            const radius = 6 + scores.buzz / 11;
            const color = domainColors[item.domain || "Multidisciplinary"] || domainColors.Multidisciplinary;
            return (
              <g key={item.id} onClick={() => setSelected(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected(item); }} role="button" tabIndex={0} aria-label={`${item.title}, ${t("impact", "影响力")} ${scores.impact}, ${t("buzz", "火爆度")} ${scores.buzz}, ${t("utility", "实用性")} ${scores.utility}`} className="chart-bubble" style={{ color }}>
                <circle cx={cx} cy={cy} r={radius + 7} fill="transparent" />
                <circle cx={cx} cy={cy} r={radius} fill="currentColor" fillOpacity={selected?.id === item.id ? .95 : .68} />
                {(selected?.id === item.id || (width > 620 && index < 5)) && <text x={cx} y={cy - radius - 6} textAnchor="middle" className="chart-point-label">{item.title.slice(0, 24)}{item.title.length > 24 ? "…" : ""}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1" aria-label={t("Field colors", "领域颜色")}>
        {domains.filter((item) => item !== "All").map((item) => <span key={item} className="chart-legend"><i style={{ backgroundColor: domainColors[item] || domainColors.Multidisciplinary }} />{item}</span>)}
        <span className="chart-legend ml-auto">{t("Bubble size = buzz", "气泡大小 = 火爆度")}</span>
      </div>

      <div className="chart-selection" aria-live="polite">
        {selected ? (
          <><div><b>{lang === "en" ? selected.title : selected.titleZh}</b><span>{selected.source} · {selected.date}</span></div><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Open source", "查看来源")} ↗</a></>
        ) : <span>{t("Select a bubble to inspect the underlying signal.", "点击气泡查看对应信息与原始来源。")}</span>}
      </div>
    </div>
  );
}
