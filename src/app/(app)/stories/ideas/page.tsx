import Card from "@/components/Card";
import NewStoryButtons from "@/components/NewStoryButtons";
import TagFilter from "@/components/TagFilter";
import { storyIdeasRepo } from "@/db/repo";
import { formatDate } from "@/lib/format";

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function StoryIdeasPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const all = await storyIdeasRepo.list();
  const allTags = Array.from(new Set(all.flatMap((i) => i.tags))).sort();
  const ideas = tag ? all.filter((i) => i.tags.includes(tag)) : all;

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            Stories
          </span>
        </div>
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-indigo-900">Story Ideas</h1>
          <NewStoryButtons />
        </header>
      </div>

      <TagFilter base="/stories/ideas" tags={allTags} active={tag} />

      <div className="space-y-3">
        {ideas.length === 0 && (
          <p className="text-sm text-neutral-500">
            {tag
              ? "No story ideas with this tag."
              : 'No story ideas yet — click "+ New story idea" above to start.'}
          </p>
        )}
        {ideas.map((i) => (
          <Card
            key={i.id}
            href={`/stories/ideas/${i.id}`}
            title={i.title}
            preview={i.notes}
            tags={i.tags}
            meta={formatDate(i.updatedAt)}
            subtitle={i.promotedTo ? "Promoted" : undefined}
            icon={i.icon}
            deletable={{ kind: "story-idea", id: i.id }}
          />
        ))}
      </div>
    </div>
  );
}
