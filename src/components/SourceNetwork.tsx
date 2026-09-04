"use client";

import { useMemo, useState } from "react";
import { signalSources, SourceLayer } from "@/lib/sources";
import { useLang } from "@/lib/i18n";

const layers: Array<SourceLayer | "All"> = ["All", "Primary", "Index", "Community", "Social"];
const layerDescription: Record<SourceLayer, [string, string]> = {
  Primary: ["Proves dates and official claims", "核验日期与官方主张"],
  Index: ["Structures discovery and metadata", "结构化发现与元数据"],
  Community: ["Finds adoption and real pain", "发现采用与真实痛点"],
  Social: ["Detects weak, early signals", "捕捉微弱早期信号"],
};

export function SourceNetwork() {
  const { lang, t } = useLang();
  const [layer, setLayer] = useState<SourceLayer | "All">("All");
  const [region, setRegion] = useState("All");
  const [query, setQuery] = useState("");
  const sources = useMemo(() => signalSources.filter((source) =>
    (layer === "All" || source.layer === layer) &&
    (region === "All" || source.region === region) &&
    (!query.trim() || (source.name + " " + source.domains.join(" ") + " " + source.useFor + " " + source.useForZh).toLowerCase().includes(query.toLowerCase()))
  ), [layer, query, region]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {(Object.keys(layerDescription) as SourceLayer[]).map((item, index) => (
          <button key={item} onClick={() => setLayer(item)} className={"source-layer-card " + (layer === item ? "source-layer-active" : "")}>
            <span>0{index + 1}</span><b>{item}</b><small>{t(layerDescription[item][0], layerDescription[item][1])}</small>
          </button>
        ))}
      </div>
      <div className="directory-controls">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search sources, fields or jobs…", "搜索信息源、领域或用途…")} /></label>
        <div className="flex flex-wrap gap-2">
          {layers.map((item) => <button key={item} onClick={() => setLayer(item)} className={"filter-pill " + (layer === item ? "filter-pill-active" : "")}>{item === "All" ? t("All layers", "全部层级") : item}</button>)}
          {["All", "China", "Global"].map((item) => <button key={item} onClick={() => setRegion(item)} className={"domain-pill " + (region === item ? "domain-pill-active" : "")}>{item === "All" ? t("All regions", "全部地区") : item}</button>)}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {sources.map((source) => (
          <article key={source.id} className="source-card">
            <div className="flex items-center justify-between gap-3">
              <span className={"source-layer-badge source-layer-" + source.layer.toLowerCase()}>{source.layer}</span>
              <span className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{source.region} · {source.cadence}</span>
            </div>
            <h2 className="text-lg font-bold mt-4 dark:text-white">{source.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">{source.domains.map((domain) => <span key={domain} className="domain-label">{domain}</span>)}</div>
            <p className="mt-4 text-sm leading-relaxed text-paper-800/60 dark:text-slate-400">{lang === "en" ? source.useFor : source.useForZh}</p>
            <div className="source-boundary mt-4"><b>{t("Boundary", "使用边界")}</b><p>{lang === "en" ? source.boundary : source.boundaryZh}</p></div>
            <div className="flex items-center justify-between gap-3 mt-4 text-[10px]">
              <span className="text-paper-800/35 dark:text-slate-500">{source.access}</span>
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 dark:text-blue-400">{t("Open", "打开")} ↗</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
