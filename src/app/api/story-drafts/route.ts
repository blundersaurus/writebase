import { NextResponse } from "next/server";
import { storyDraftsRepo } from "@/db/repo";
import { newId } from "@/lib/id";
import { cleanTags } from "@/lib/tags";
import { cleanLinks } from "@/lib/links";

const DEFAULT_LINKS = [
  { url: "", title: "Working Draft" },
  { url: "", title: "Working Notes" },
  { url: "", title: "Plan" },
];

export async function GET() {
  return NextResponse.json(await storyDraftsRepo.list());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const now = Date.now();
  const id = newId();
  await storyDraftsRepo.insert({
    id,
    title: typeof body.title === "string" ? body.title : "",
    notes: typeof body.notes === "string" ? body.notes : "",
    tags: cleanTags(body.tags),
    icon: typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null,
    links: Array.isArray(body.links) && body.links.length ? cleanLinks(body.links) : DEFAULT_LINKS,
    sourceIdea: null,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(await storyDraftsRepo.get(id), { status: 201 });
}
