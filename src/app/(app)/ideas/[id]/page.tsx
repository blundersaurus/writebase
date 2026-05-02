import { notFound } from "next/navigation";
import IdeaEditor from "./IdeaEditor";
import { ideasRepo } from "@/db/repo";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await ideasRepo.get(id);
  if (!idea) notFound();

  return (
    <IdeaEditor
      idea={{
        id: idea.id,
        title: idea.title,
        notes: idea.notes,
        tags: idea.tags,
        promotedTo: idea.promotedTo,
        updatedAt: idea.updatedAt,
      }}
    />
  );
}
