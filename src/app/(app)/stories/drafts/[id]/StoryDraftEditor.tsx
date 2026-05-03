"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagInput from "@/components/TagInput";
import IconInput from "@/components/IconInput";
import LinksEditor from "@/components/LinksEditor";
import type { RefLink } from "@/db/schema";

type StoryDraft = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: RefLink[];
  sourceIdea: string | null;
  updatedAt: number;
};

export default function StoryDraftEditor({ draft }: { draft: StoryDraft }) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [notes, setNotes] = useState(draft.notes);
  const [tags, setTags] = useState<string[]>(draft.tags);
  const [icon, setIcon] = useState<string | null>(draft.icon);
  const [links, setLinks] = useState<RefLink[]>(draft.links);
  const [savedAt, setSavedAt] = useState<number>(draft.updatedAt);
  const [saving, setSaving] = useState(false);
  const initial = useRef(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      const res = await fetch(`/api/story-drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes, tags, icon, links }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSavedAt(updated.updatedAt);
      }
      setSaving(false);
    }, 800);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [title, notes, tags, icon, links, draft.id]);

  async function remove() {
    if (!window.confirm("Delete this story draft? This cannot be undone.")) return;
    const res = await fetch(`/api/story-drafts/${draft.id}`, { method: "DELETE" });
    if (res.ok) router.push("/stories/drafts");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/stories/drafts" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to story drafts
        </Link>
        <span className="text-xs text-neutral-500">
          {saving ? "Saving..." : `Saved ${new Date(savedAt).toLocaleTimeString()}`}
        </span>
      </div>

      <div className="pb-2 border-b border-indigo-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Story Draft
        </span>
      </div>

      {draft.sourceIdea && (
        <div className="text-xs text-neutral-500">
          Promoted from{" "}
          <Link href={`/stories/ideas/${draft.sourceIdea}`} className="underline hover:text-neutral-900">
            a story idea
          </Link>
          .
        </div>
      )}

      <div className="flex items-center gap-3">
        <IconInput value={icon} onChange={setIcon} />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
          className="flex-1 text-3xl font-semibold bg-transparent outline-none border-b border-transparent focus:border-indigo-300 py-2"
        />
      </div>

      <TagInput value={tags} onChange={setTags} />

      {/* Two-column layout: notes left, links right */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes, synopsis, research, character details..."
            className="w-full min-h-[32rem] bg-white border border-neutral-200 rounded-md p-4 text-sm font-mono outline-none focus:border-indigo-300 resize-y"
          />
        </div>

        <div className="w-72 shrink-0 space-y-1">
          <div className="border-2 border-indigo-200 rounded-md overflow-hidden">
            <LinksEditor
              value={links}
              onChange={setLinks}
              heading="Reference Links"
            />
          </div>
          <p className="text-xs text-indigo-400 px-1">
            Click <em>edit</em> on any link below to add its URL.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <div className="ml-auto">
          <button
            onClick={remove}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
