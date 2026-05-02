import { NextResponse } from "next/server";
import { ideasRepo } from "@/db/repo";
import { newId } from "@/lib/id";
import { cleanTags } from "@/lib/tags";

export async function GET() {
  return NextResponse.json(await ideasRepo.list());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    notes?: string;
    tags?: string[];
  };
  const now = Date.now();
  const id = newId();
  await ideasRepo.insert({
    id,
    title: body.title ?? "",
    notes: body.notes ?? "",
    tags: cleanTags(body.tags),
    createdAt: now,
    updatedAt: now,
    promotedTo: null,
  });
  return NextResponse.json(await ideasRepo.get(id), { status: 201 });
}
