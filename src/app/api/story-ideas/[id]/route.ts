import { NextResponse } from "next/server";
import { storyIdeasRepo } from "@/db/repo";
import { cleanTags } from "@/lib/tags";
import { cleanLinks } from "@/lib/links";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const item = await storyIdeasRepo.get(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await storyIdeasRepo.update(id, {
    title: typeof body.title === "string" ? body.title : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    tags: Array.isArray(body.tags) ? cleanTags(body.tags) : undefined,
    icon: body.icon !== undefined
      ? typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null
      : undefined,
    links: body.links !== undefined ? cleanLinks(body.links) : undefined,
    updatedAt: Date.now(),
  });
  return NextResponse.json(await storyIdeasRepo.get(id));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await storyIdeasRepo.delete(id);
  return new NextResponse(null, { status: 204 });
}
