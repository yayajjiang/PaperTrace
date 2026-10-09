import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeReader } from "@/components/KnowledgeReader";
import {
  getKnowledgeDocument,
  getKnowledgeGardenSummaries,
  KNOWLEDGE_GARDENS,
  renderKnowledgeDocument,
} from "@/lib/knowledge";

export function generateStaticParams() {
  return KNOWLEDGE_GARDENS.map((garden) => ({ garden: garden.id }));
}

export function generateMetadata({ params }: { params: { garden: string } }): Metadata {
  const document = getKnowledgeDocument(params.garden, []);
  if (!document) return {};
  return {
    title: `${document.title} — PaperTrace`,
    description: document.excerpt,
  };
}

export default function KnowledgeGardenPage({ params }: { params: { garden: string } }) {
  const page = renderKnowledgeDocument(params.garden, []);
  if (!page) notFound();
  return <KnowledgeReader gardens={getKnowledgeGardenSummaries()} page={page} />;
}
