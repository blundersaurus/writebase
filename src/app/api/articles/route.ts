import { NextResponse } from "next/server";
import { articlesRepo } from "@/db/repo";
import { newId } from "@/lib/id";
import { cleanTags } from "@/lib/tags";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const filter = status === "draft" || status === "completed" ? status : undefined;
  return NextResponse.json(await articlesRepo.list({ status: filter }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    contentHtml?: string;
    status?: "draft" | "completed";
    tags?: string[];
  };
  const now = Date.now();
  const id = newId();
  await articlesRepo.insert({
    id,
    title: body.title ?? "",
    contentHtml: body.contentHtml ?? "",
    status: body.status === "completed" ? "completed" : "draft",
    tags: cleanTags(body.tags),
    sourceIdea: null,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(await articlesRepo.get(id), { status: 201 });
}
