"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

type Incident = { id: string; name: string; status: string; impact: string; createdAt: string; updatedAt: string; resolvedAt?: string | null; latestUpdate: string };
type Provider = { name: string; pageUrl: string; indicator: string; description: string; updatedAt: string; affectedComponents: Array<{ name: string; status: string }>; recentIncidents: Incident[]; stale?: boolean };

export function ProviderStatus() {
  const { lang, t } = useLang();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    fetch(basePath + "/data/provider-status.json")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { generatedAt?: string; providers?: Provider[] }) => {
        setProviders(data.providers || []);
        setGeneratedAt(data.generatedAt || "");
      })
      .catch(() => undefined);
  }, [basePath]);

  if (providers.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="section-heading-row">
        <div><div className="eyebrow mb-2">{t("Service status", "服务状态")}</div><h2 className="text-2xl font-bold dark:text-white">{t("Is it retired, or is it just down?", "是模型下线，还是服务暂时故障？")}</h2></div>
        {generatedAt && <span className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{new Date(generatedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}</span>}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const operational = provider.indicator === "none";
          const recent = provider.recentIncidents.slice(0, 3);
          return (
            <article key={provider.name} className="provider-status-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><span className={operational ? "health-ok" : "health-warn"} /><h3 className="font-bold dark:text-white">{provider.name}</h3></div>
                <span className={"provider-state " + (operational ? "provider-state-ok" : "provider-state-warn")}>{provider.description}</span>
              </div>
              {provider.affectedComponents.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{provider.affectedComponents.map((component) => <span key={component.name} className="subtle-chip">{component.name} · {component.status}</span>)}</div>}
              <div className="mt-5 space-y-3">
                {recent.map((incident) => (
                  <div key={incident.id} className="provider-incident">
                    <div className="flex items-start justify-between gap-3"><b>{incident.name}</b><span>{incident.status}</span></div>
                    <p>{incident.latestUpdate}</p>
                    <small>{new Date(incident.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")} · {incident.impact}</small>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 mt-4">
                <a href={provider.pageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400">{t("Official status", "官方状态页")} ↗</a>
                {provider.stale && <span className="text-[10px] text-amber-600">{t("stale snapshot", "快照待刷新")}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
