export const dynamic = "force-dynamic";

import Link from "next/link";
import Card from "@/components/Card";
import SearchBox from "@/components/SearchBox";
import NewItemButtons from "@/components/NewItemButtons";
import NewStoryButtons from "@/components/NewStoryButtons";
import { ideasRepo, articlesRepo, storyIdeasRepo, storyDraftsRepo } from "@/db/repo";
import { formatDate, htmlToPlainText } from "@/lib/format";

export default async function DashboardPage() {
  const [recentIdeas, recentArticles, recentStoryIdeas, recentStoryDrafts] = await Promise.all([
    ideasRepo.list(5),
    articlesRepo.list({ limit: 5 }),
    storyIdeasRepo.list(5),
    storyDraftsRepo.list(5),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      <SearchBox />

      {/* Articles section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-700">Articles</h2>
          <NewItemButtons />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-600">Recent ideas</h3>
              <Link href="/ideas" className="text-xs text-neutral-500 hover:text-neutral-900">
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
                  icon={i.icon}
                  deletable={{ kind: "idea", id: i.id }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-600">Recent articles</h3>
              <Link href="/articles" className="text-xs text-neutral-500 hover:text-neutral-900">
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
                  icon={a.icon}
                  deletable={{ kind: "article", id: a.id }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual separator */}
      <div className="border-t-2 border-indigo-100" />

      {/* Stories section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-indigo-900">Stories</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
              separate workflow
            </span>
          </div>
          <NewStoryButtons />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium text-indigo-600">Recent story ideas</h3>
              <Link href="/stories/ideas" className="text-xs text-indigo-400 hover:text-indigo-700">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentStoryIdeas.length === 0 && (
                <p className="text-sm text-neutral-500">No story ideas yet.</p>
              )}
              {recentStoryIdeas.map((i) => (
                <Card
                  key={i.id}
                  href={`/stories/ideas/${i.id}`}
                  title={i.title}
                  preview={i.notes}
                  tags={i.tags}
                  meta={formatDate(i.updatedAt)}
                  icon={i.icon}
                  deletable={{ kind: "story-idea", id: i.id }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium text-indigo-600">Recent story drafts</h3>
              <Link href="/stories/drafts" className="text-xs text-indigo-400 hover:text-indigo-700">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentStoryDrafts.length === 0 && (
                <p className="text-sm text-neutral-500">No story drafts yet.</p>
              )}
              {recentStoryDrafts.map((d) => (
                <Card
                  key={d.id}
                  href={`/stories/drafts/${d.id}`}
                  title={d.title}
                  preview={d.notes}
                  tags={d.tags}
                  meta={formatDate(d.updatedAt)}
                  icon={d.icon}
                  deletable={{ kind: "story-draft", id: d.id }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
