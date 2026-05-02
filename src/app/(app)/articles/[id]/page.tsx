import { notFound } from "next/navigation";
import ArticleEditor from "./ArticleEditor";
import { articlesRepo } from "@/db/repo";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await articlesRepo.get(id);
  if (!article) notFound();

  return (
    <ArticleEditor
      article={{
        id: article.id,
        title: article.title,
        contentHtml: article.contentHtml,
        status: article.status,
        tags: article.tags,
        icon: article.icon,
        links: article.links,
        updatedAt: article.updatedAt,
        sourceIdea: article.sourceIdea,
      }}
    />
  );
}
