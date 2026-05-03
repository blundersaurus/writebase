import { NextResponse } from "next/server";
import { storyIdeasRepo, storyDraftsRepo } from "@/db/repo";
import { newId } from "@/lib/id";

const DEFAULT_LINKS = [
  { url: "", title: "Working Draft" },
  { url: "", title: "Working Notes" },
  { url: "", title: "Plan" },
];

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const idea = await storyIdeasRepo.get(id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (idea.promotedTo) {
    const existing = await storyDraftsRepo.get(idea.promotedTo);
    if (existing) return NextResponse.json(existing);
  }

  const now = Date.now();
  const draftId = newId();
  await storyDraftsRepo.insert({
    id: draftId,
    title: idea.title,
    notes: idea.notes,
    tags: idea.tags,
    icon: idea.icon,
    links: DEFAULT_LINKS,
    sourceIdea: id,
    createdAt: now,
    updatedAt: now,
  });

  await storyIdeasRepo.update(id, { promotedTo: draftId, updatedAt: now });

  return NextResponse.json(await storyDraftsRepo.get(draftId), { status: 201 });
}
