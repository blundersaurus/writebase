import { NextResponse } from "next/server";
import { storyIdeasRepo } from "@/db/repo";
import { newId } from "@/lib/id";
import { cleanTags } from "@/lib/tags";
import { cleanLinks } from "@/lib/links";

export async function GET() {
  return NextResponse.json(await storyIdeasRepo.list());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const now = Date.now();
  const id = newId();
  await storyIdeasRepo.insert({
    id,
    title: typeof body.title === "string" ? body.title : "",
    notes: typeof body.notes === "string" ? body.notes : "",
    tags: cleanTags(body.tags),
    icon: typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null,
    links: cleanLinks(body.links),
    createdAt: now,
    updatedAt: now,
    promotedTo: null,
  });
  return NextResponse.json(await storyIdeasRepo.get(id), { status: 201 });
}
