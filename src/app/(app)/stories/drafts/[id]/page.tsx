import { notFound } from "next/navigation";
import { storyDraftsRepo } from "@/db/repo";
import StoryDraftEditor from "./StoryDraftEditor";

type Props = { params: Promise<{ id: string }> };

export default async function StoryDraftPage({ params }: Props) {
  const { id } = await params;
  const draft = await storyDraftsRepo.get(id);
  if (!draft) notFound();
  return <StoryDraftEditor draft={draft} />;
}
