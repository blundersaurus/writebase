"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagInput from "@/components/TagInput";
import IconInput from "@/components/IconInput";
import LinksEditor from "@/components/LinksEditor";
import type { RefLink } from "@/db/schema";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

type Article = {
  id: string;
  title: string;
  contentHtml: string;
  status: "draft" | "completed";
  tags: string[];
  icon: string | null;
  links: RefLink[];
  updatedAt: number;
  sourceIdea: string | null;
};

export default function ArticleEditor({ article }: { article: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title);
  const [contentHtml, setContentHtml] = useState(article.contentHtml);
  const [status, setStatus] = useState<"draft" | "completed">(article.status);
  const [tags, setTags] = useState<string[]>(article.tags);
  const [icon, setIcon] = useState<string | null>(article.icon);
  const [links, setLinks] = useState<RefLink[]>(article.links);
  const [savedAt, setSavedAt] = useState<number>(article.updatedAt);
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
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentHtml, status, tags, icon, links }),
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
  }, [title, contentHtml, status, tags, icon, links, article.id]);

  async function remove() {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    if (res.ok) router.push("/articles");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/articles" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to articles
        </Link>
        <span className="text-xs text-neutral-500">
          {saving ? "Saving..." : `Saved ${new Date(savedAt).toLocaleTimeString()}`}
        </span>
      </div>

      {article.sourceIdea && (
        <div className="text-xs text-neutral-500">
          Promoted from{" "}
          <Link href={`/ideas/${article.sourceIdea}`} className="underline hover:text-neutral-900">
            an idea
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
          placeholder="Article title"
          className="flex-1 text-3xl font-semibold bg-transparent outline-none border-b border-transparent focus:border-neutral-300 py-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "completed")}
          className="border border-neutral-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <Editor value={contentHtml} onChange={setContentHtml} />

      <LinksEditor value={links} onChange={setLinks} />

      <div className="flex items-center gap-2 pt-2">
        <a
          href={`/api/articles/${article.id}/export?format=md`}
          className="bg-white border border-neutral-300 hover:border-neutral-400 text-sm rounded px-3 py-1.5"
        >
          Export Markdown
        </a>
        <a
          href={`/api/articles/${article.id}/export?format=html`}
          className="bg-white border border-neutral-300 hover:border-neutral-400 text-sm rounded px-3 py-1.5"
        >
          Export HTML
        </a>
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
