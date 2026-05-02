import { NextResponse } from "next/server";
import { ideasRepo, articlesRepo } from "@/db/repo";
import { htmlToPlainText } from "@/lib/format";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ ideas: [], articles: [] });

  const [ideas, articles] = await Promise.all([ideasRepo.list(), articlesRepo.list()]);

  const ideaMatches = ideas
    .filter((i) => {
      const hay = `${i.title}\n${i.notes}\n${i.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 25);

  const articleMatches = articles
    .filter((a) => {
      const hay = `${a.title}\n${htmlToPlainText(a.contentHtml)}\n${a.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 25);

  return NextResponse.json({ ideas: ideaMatches, articles: articleMatches });
}
