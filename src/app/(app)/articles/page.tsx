import Link from "next/link";
import Card from "@/components/Card";
import NewItemButtons from "@/components/NewItemButtons";
import TagFilter from "@/components/TagFilter";
import { articlesRepo } from "@/db/repo";
import { formatDate, htmlToPlainText } from "@/lib/format";

type Props = { searchParams: Promise<{ tag?: string; status?: string }> };

export default async function ArticlesPage({ searchParams }: Props) {
  const { tag, status } = await searchParams;
  const all = await articlesRepo.list();
  const allTags = Array.from(new Set(all.flatMap((a) => a.tags))).sort();

  let filtered = all;
  if (status === "draft" || status === "completed") {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (tag) filtered = filtered.filter((a) => a.tags.includes(tag));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <NewItemButtons />
      </header>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-1 text-sm">
          <StatusLink current={status} value={undefined} label="All" />
          <StatusLink current={status} value="draft" label="Drafts" />
          <StatusLink current={status} value="completed" label="Completed" />
        </div>
      </div>

      <TagFilter base="/articles" tags={allTags} active={tag} extraQuery={{ status }} />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-500">No articles match.</p>
        )}
        {filtered.map((a) => (
          <Card
            key={a.id}
            href={`/articles/${a.id}`}
            title={a.title}
            subtitle={a.status === "completed" ? "Completed" : "Draft"}
            preview={htmlToPlainText(a.contentHtml).slice(0, 200)}
            tags={a.tags}
            meta={formatDate(a.updatedAt)}
          />
        ))}
      </div>
    </div>
  );
}

function StatusLink({ current, value, label }: { current?: string; value?: string; label: string }) {
  const params = new URLSearchParams();
  if (value) params.set("status", value);
  const href = params.toString() ? `/articles?${params}` : "/articles";
  const active = (current ?? undefined) === value;
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded ${active ? "bg-neutral-900 text-white" : "bg-white border border-neutral-300 hover:border-neutral-400"}`}
    >
      {label}
    </Link>
  );
}
