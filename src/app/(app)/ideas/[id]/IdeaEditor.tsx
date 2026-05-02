"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagInput from "@/components/TagInput";
import IconInput from "@/components/IconInput";
import LinksEditor from "@/components/LinksEditor";
import type { RefLink } from "@/db/schema";

type Idea = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: RefLink[];
  promotedTo: string | null;
  updatedAt: number;
};

export default function IdeaEditor({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [title, setTitle] = useState(idea.title);
  const [notes, setNotes] = useState(idea.notes);
  const [tags, setTags] = useState<string[]>(idea.tags);
  const [icon, setIcon] = useState<string | null>(idea.icon);
  const [links, setLinks] = useState<RefLink[]>(idea.links);
  const [savedAt, setSavedAt] = useState<number>(idea.updatedAt);
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
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes, tags, icon, links }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSavedAt(updated.updatedAt);
      }
      setSaving(false);
    }, 600);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [title, notes, tags, icon, links, idea.id]);

  async function promote() {
    const res = await fetch(`/api/ideas/${idea.id}/promote`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/articles/${data.id}`);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this idea? This cannot be undone.")) return;
    const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    if (res.ok) router.push("/ideas");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/ideas" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to ideas
        </Link>
        <span className="text-xs text-neutral-500">
          {saving ? "Saving..." : `Saved ${new Date(savedAt).toLocaleTimeString()}`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <IconInput value={icon} onChange={setIcon} />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title"
          className="flex-1 text-2xl font-semibold bg-transparent outline-none border-b border-transparent focus:border-neutral-300 py-2"
        />
      </div>

      <TagInput value={tags} onChange={setTags} />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes, angles, sources..."
        className="w-full min-h-[16rem] bg-white border border-neutral-200 rounded-md p-4 text-sm font-mono outline-none focus:border-neutral-400"
      />

      <LinksEditor value={links} onChange={setLinks} />

      <div className="flex items-center gap-2 pt-2">
        {idea.promotedTo ? (
          <Link
            href={`/articles/${idea.promotedTo}`}
            className="bg-neutral-900 text-white text-sm rounded px-3 py-1.5"
          >
            Open draft →
          </Link>
        ) : (
          <button
            onClick={promote}
            className="bg-neutral-900 text-white text-sm rounded px-3 py-1.5"
          >
            Promote to draft
          </button>
        )}
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
