import Link from "next/link";
import Card from "@/components/Card";
import SearchBox from "@/components/SearchBox";
import NewItemButtons from "@/components/NewItemButtons";
import { ideasRepo, articlesRepo } from "@/db/repo";
import { formatDate, htmlToPlainText } from "@/lib/format";

export default async function DashboardPage() {
  const [recentIdeas, recentArticles] = await Promise.all([
    ideasRepo.list(5),
    articlesRepo.list({ limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <NewItemButtons />
      </header>

      <SearchBox />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-medium">Recent ideas</h2>
            <Link href="/ideas" className="text-sm text-neutral-600 hover:text-neutral-900">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentIdeas.length === 0 && (
              <p className="text-sm text-neutral-500">No ideas yet.</p>
            )}
            {recentIdeas.map((i) => (
              <Card
                key={i.id}
                href={`/ideas/${i.id}`}
                title={i.title}
                preview={i.notes}
                tags={i.tags}
                meta={formatDate(i.updatedAt)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-medium">Recent articles</h2>
            <Link href="/articles" className="text-sm text-neutral-600 hover:text-neutral-900">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentArticles.length === 0 && (
              <p className="text-sm text-neutral-500">No articles yet.</p>
            )}
            {recentArticles.map((a) => (
              <Card
                key={a.id}
                href={`/articles/${a.id}`}
                title={a.title}
                subtitle={a.status === "completed" ? "Completed" : "Draft"}
                preview={htmlToPlainText(a.contentHtml).slice(0, 160)}
                tags={a.tags}
                meta={formatDate(a.updatedAt)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
