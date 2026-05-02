import { NextResponse } from "next/server";
import { articlesRepo } from "@/db/repo";
import { cleanTags } from "@/lib/tags";
import { cleanLinks } from "@/lib/links";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const article = await articlesRepo.get(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Parameters<typeof articlesRepo.update>[1] = { updatedAt: Date.now() };
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.contentHtml === "string") patch.contentHtml = body.contentHtml;
  if (body.status === "draft" || body.status === "completed") patch.status = body.status;
  if (Array.isArray(body.tags)) patch.tags = cleanTags(body.tags);
  if (Object.prototype.hasOwnProperty.call(body, "icon")) {
    const v = body.icon;
    patch.icon = typeof v === "string" && v.trim() ? v.trim() : null;
  }
  if (Array.isArray(body.links)) patch.links = cleanLinks(body.links);
  await articlesRepo.update(id, patch);
  const updated = await articlesRepo.get(id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await articlesRepo.delete(id);
  return NextResponse.json({ ok: true });
}
