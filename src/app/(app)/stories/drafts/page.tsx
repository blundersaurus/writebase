import Card from "@/components/Card";
import NewStoryButtons from "@/components/NewStoryButtons";
import TagFilter from "@/components/TagFilter";
import { storyDraftsRepo } from "@/db/repo";
import { formatDate } from "@/lib/format";

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function StoryDraftsPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const all = await storyDraftsRepo.list();
  const allTags = Array.from(new Set(all.flatMap((d) => d.tags))).sort();
  const drafts = tag ? all.filter((d) => d.tags.includes(tag)) : all;

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            Stories
          </span>
        </div>
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-indigo-900">Story Drafts</h1>
          <NewStoryButtons />
        </header>
      </div>

      <TagFilter base="/stories/drafts" tags={allTags} active={tag} />

      <div className="space-y-3">
        {drafts.length === 0 && (
          <p className="text-sm text-neutral-500">
            {tag
              ? "No story drafts with this tag."
              : 'No story drafts yet — promote a story idea or click "+ New story draft".'}
          </p>
        )}
        {drafts.map((d) => (
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
  );
}
