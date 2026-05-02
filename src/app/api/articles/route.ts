import { NextResponse } from "next/server";
import { articlesRepo } from "@/db/repo";
import { newId } from "@/lib/id";
import { cleanTags } from "@/lib/tags";
import { cleanLinks } from "@/lib/links";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const filter = status === "draft" || status === "completed" ? status : undefined;
  return NextResponse.json(await articlesRepo.list({ status: filter }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const now = Date.now();
  const id = newId();
  await articlesRepo.insert({
    id,
    title: typeof body.title === "string" ? body.title : "",
    contentHtml: typeof body.contentHtml === "string" ? body.contentHtml : "",
    status: body.status === "completed" ? "completed" : "draft",
    tags: cleanTags(body.tags),
    icon: typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null,
    links: cleanLinks(body.links),
    sourceIdea: null,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(await articlesRepo.get(id), { status: 201 });
}
