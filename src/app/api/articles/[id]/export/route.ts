import { NextResponse } from "next/server";
import { articlesRepo } from "@/db/repo";
import TurndownService from "turndown";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "html" ? "html" : "md";

  const article = await articlesRepo.get(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const safeName = (article.title || "article").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 80) || "article";

  if (format === "html") {
    const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(article.title || "Untitled")}</title>
</head>
<body>
<h1>${escapeHtml(article.title || "Untitled")}</h1>
${article.contentHtml}
</body>
</html>
`;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}.html"`,
      },
    });
  }

  const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  const md = `# ${article.title || "Untitled"}\n\n${turndown.turndown(article.contentHtml || "")}\n`;
  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.md"`,
    },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
