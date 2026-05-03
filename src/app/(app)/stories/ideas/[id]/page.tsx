import { notFound } from "next/navigation";
import { storyIdeasRepo } from "@/db/repo";
import StoryIdeaEditor from "./StoryIdeaEditor";

type Props = { params: Promise<{ id: string }> };

export default async function StoryIdeaPage({ params }: Props) {
  const { id } = await params;
  const idea = await storyIdeasRepo.get(id);
  if (!idea) notFound();
  return <StoryIdeaEditor idea={idea} />;
}
