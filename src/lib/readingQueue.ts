import { Headline } from "@/lib/headlines";

export interface ReadingQueueItem {
  headline: Headline;
  savedAt: string;
  minutes: 5 | 20 | 45;
}

export const readingQueueKey = "papertrace-reading-queue-v1";
export const readingQueueEvent = "papertrace-reading-queue-change";

export function estimateReadingMinutes(headline: Headline): 5 | 20 | 45 {
  const { impact = 0, utility = 0 } = headline.scores || {};
  if (impact >= 85 && utility >= 75) return 45;
  if (impact >= 72 || utility >= 78) return 20;
  return 5;
}

export function readReadingQueue(): ReadingQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(readingQueueKey) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.headline?.id) : [];
  } catch {
    return [];
  }
}

export function writeReadingQueue(items: ReadingQueueItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(readingQueueKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(readingQueueEvent));
}

export function toggleReadingQueue(headline: Headline) {
  const items = readReadingQueue();
  const exists = items.some((item) => item.headline.id === headline.id);
  const next = exists
    ? items.filter((item) => item.headline.id !== headline.id)
    : [{ headline, savedAt: new Date().toISOString(), minutes: estimateReadingMinutes(headline) }, ...items];
  writeReadingQueue(next);
  return !exists;
}

