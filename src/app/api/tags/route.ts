import { NextResponse } from "next/server";
import { tagsRepo } from "@/db/repo";

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { from?: string; to?: string };
  const from = typeof body.from === "string" ? body.from.trim() : "";
  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }
  if (from === to) return NextResponse.json({ ok: true });
  await tagsRepo.rename(from, to);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const tag = (url.searchParams.get("tag") ?? "").trim();
  if (!tag) {
    return NextResponse.json({ error: "tag query param is required" }, { status: 400 });
  }
  await tagsRepo.delete(tag);
  return NextResponse.json({ ok: true });
}
