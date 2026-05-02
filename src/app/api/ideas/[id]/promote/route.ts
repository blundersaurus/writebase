import { NextResponse } from "next/server";
import { ideasRepo, articlesRepo } from "@/db/repo";
import { newId } from "@/lib/id";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idea = await ideasRepo.get(id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (idea.promotedTo) {
    return NextResponse.json({ id: idea.promotedTo, alreadyPromoted: true });
  }

  const now = Date.now();
  const articleId = newId();
  const seedNotes = idea.notes?.trim()
    ? `<p>${escapeHtml(idea.notes).replace(/\n/g, "<br/>")}</p>`
    : "";

  await articlesRepo.insert({
    id: articleId,
    title: idea.title,
    contentHtml: seedNotes,
    status: "draft",
    tags: idea.tags,
    sourceIdea: idea.id,
    createdAt: now,
    updatedAt: now,
  });

  await ideasRepo.update(id, { promotedTo: articleId, updatedAt: now });

  return NextResponse.json({ id: articleId });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
