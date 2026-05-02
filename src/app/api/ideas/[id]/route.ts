import { NextResponse } from "next/server";
import { ideasRepo } from "@/db/repo";
import { cleanTags } from "@/lib/tags";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idea = await ideasRepo.get(id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    notes?: string;
    tags?: string[];
  };
  const patch: Parameters<typeof ideasRepo.update>[1] = { updatedAt: Date.now() };
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (Array.isArray(body.tags)) patch.tags = cleanTags(body.tags);
  await ideasRepo.update(id, patch);
  const updated = await ideasRepo.get(id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await ideasRepo.delete(id);
  return NextResponse.json({ ok: true });
}
