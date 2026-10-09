import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeReader } from "@/components/KnowledgeReader";
import {
  getKnowledgeDocument,
  getKnowledgeGardenSummaries,
  renderKnowledgeDocument,
} from "@/lib/knowledge";

export function generateStaticParams() {
  return getKnowledgeGardenSummaries().flatMap((garden) =>
    garden.documents
      .filter((document) => document.slug.length > 0)
      .map((document) => ({ garden: garden.id, slug: document.slug }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { garden: string; slug: string[] };
}): Metadata {
  const document = getKnowledgeDocument(params.garden, params.slug);
  if (!document) return {};
  return {
    title: `${document.title} — PaperTrace`,
    description: document.excerpt,
  };
}

export default function KnowledgeArticlePage({
  params,
}: {
  params: { garden: string; slug: string[] };
}) {
  const page = renderKnowledgeDocument(params.garden, params.slug);
  if (!page) notFound();
  return <KnowledgeReader gardens={getKnowledgeGardenSummaries()} page={page} />;
}
