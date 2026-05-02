import Card from "@/components/Card";
import NewItemButtons from "@/components/NewItemButtons";
import TagFilter from "@/components/TagFilter";
import { ideasRepo } from "@/db/repo";
import { formatDate } from "@/lib/format";

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function IdeasPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const all = await ideasRepo.list();
  const allTags = Array.from(new Set(all.flatMap((i) => i.tags))).sort();
  const ideas = tag ? all.filter((i) => i.tags.includes(tag)) : all;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Ideas</h1>
        <NewItemButtons />
      </header>

      <TagFilter base="/ideas" tags={allTags} active={tag} />

      <div className="space-y-3">
        {ideas.length === 0 && (
          <p className="text-sm text-neutral-500">
            {tag ? "No ideas with this tag." : "No ideas yet — click “New idea” above to start."}
          </p>
        )}
        {ideas.map((i) => (
          <Card
            key={i.id}
            href={`/ideas/${i.id}`}
            title={i.title}
            preview={i.notes}
            tags={i.tags}
            meta={formatDate(i.updatedAt)}
            subtitle={i.promotedTo ? "Promoted" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
