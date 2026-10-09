import type { Metadata } from "next";
import { KnowledgeIndex } from "@/components/KnowledgeIndex";
import { getKnowledgeGardenSummaries } from "@/lib/knowledge";

export const metadata: Metadata = {
  title: "Knowledge Gardens — PaperTrace",
  description: "Focused Chinese-language knowledge libraries for AI agents, RAG, long-horizon tasks, recursive self-improvement, and continual learning.",
};

export default function KnowledgePage() {
  return <KnowledgeIndex gardens={getKnowledgeGardenSummaries()} />;
}
