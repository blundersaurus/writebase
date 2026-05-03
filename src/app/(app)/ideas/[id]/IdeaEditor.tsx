"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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

type AiMessage = {
  role: "you" | "ai";
  content: string;
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
  const [drafting, setDrafting] = useState(false);
  const [debating, setDebating] = useState(false);
  const [debatePrompt, setDebatePrompt] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const initial = useRef(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveCurrent() {
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
    return res;
  }

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      await saveCurrent();
    }, 600);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [title, notes, tags, icon, links, idea.id]);

  async function promote() {
    if (debounce.current) {
      clearTimeout(debounce.current);
      debounce.current = null;
      await saveCurrent();
    }
    const res = await fetch(`/api/ideas/${idea.id}/promote`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/articles/${data.id}`);
    }
  }

  async function createAiDraft() {
    setAiError(null);
    setDrafting(true);
    if (debounce.current) {
      clearTimeout(debounce.current);
      debounce.current = null;
    }
    await saveCurrent();

    try {
      const res = await fetch(`/api/ideas/${idea.id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "draft" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 && typeof data.articleId === "string") {
          router.push(`/articles/${data.articleId}`);
          return;
        }
        throw new Error(typeof data.error === "string" ? data.error : "AI draft failed.");
      }
      if (typeof data.articleId === "string") {
        router.push(`/articles/${data.articleId}`);
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI draft failed.");
    } finally {
      setDrafting(false);
    }
  }

  async function debateIdea(e: FormEvent) {
    e.preventDefault();
    setAiError(null);
    setDebating(true);
    if (debounce.current) {
      clearTimeout(debounce.current);
      debounce.current = null;
    }
    await saveCurrent();

    const prompt = debatePrompt.trim();
    if (prompt) setMessages((current) => [...current, { role: "you", content: prompt }]);
    setDebatePrompt("");

    try {
      const res = await fetch(`/api/ideas/${idea.id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "debate", message: prompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "AI debate failed.");
      }
      if (typeof data.reply === "string") {
        setMessages((current) => [...current, { role: "ai", content: data.reply }]);
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI debate failed.");
    } finally {
      setDebating(false);
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

      <section className="bg-white border border-neutral-200 rounded-md p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">AI writing partner</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Create a first draft, or pressure-test the idea before you write.
            </p>
          </div>
          <button
            type="button"
            onClick={createAiDraft}
            disabled={drafting || Boolean(idea.promotedTo)}
            className="bg-neutral-900 text-white text-sm rounded px-3 py-1.5 disabled:opacity-50"
          >
            {drafting ? "Drafting..." : idea.promotedTo ? "Draft already exists" : "AI first draft"}
          </button>
        </div>

        {aiError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {aiError}
          </p>
        )}

        <div className="space-y-3">
          {messages.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-auto border border-neutral-100 rounded p-3 bg-neutral-50">
              {messages.map((message, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {message.role === "you" ? "You" : "AI"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-neutral-800">{message.content}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={debateIdea} className="flex flex-col gap-2">
            <textarea
              value={debatePrompt}
              onChange={(e) => setDebatePrompt(e.target.value)}
              placeholder="Ask it to challenge the angle, find counterarguments, or suggest a stronger frame..."
              className="w-full min-h-20 bg-white border border-neutral-200 rounded-md p-3 text-sm outline-none focus:border-neutral-400"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={debating}
                className="bg-white border border-neutral-300 hover:border-neutral-400 text-sm rounded px-3 py-1.5 disabled:opacity-50"
              >
                {debating ? "Thinking..." : "Debate idea"}
              </button>
            </div>
          </form>
        </div>
      </section>

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
