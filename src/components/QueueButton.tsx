"use client";

import { useEffect, useState } from "react";
import { Headline } from "@/lib/headlines";
import { estimateReadingMinutes, readReadingQueue, readingQueueEvent, toggleReadingQueue } from "@/lib/readingQueue";
import { useLang } from "@/lib/i18n";

export function QueueButton({ headline }: { headline: Headline }) {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  const minutes = estimateReadingMinutes(headline);

  useEffect(() => {
    const sync = () => setSaved(readReadingQueue().some((item) => item.headline.id === headline.id));
    sync();
    window.addEventListener(readingQueueEvent, sync);
    return () => window.removeEventListener(readingQueueEvent, sync);
  }, [headline.id]);

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleReadingQueue(headline))}
      className={`queue-button ${saved ? "queue-button-saved" : ""}`}
      aria-pressed={saved}
    >
      <span aria-hidden="true">{saved ? "✓" : "+"}</span>
      {saved ? t("Saved", "已收藏") : t(`Save · ${minutes} min`, `收藏 · ${minutes} 分钟`)}
    </button>
  );
}

