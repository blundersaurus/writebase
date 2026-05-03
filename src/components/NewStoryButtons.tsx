"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewStoryButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "idea" | "draft">(null);
  const [error, setError] = useState<string | null>(null);

  async function create(kind: "idea" | "draft") {
    setBusy(kind);
    setError(null);
    try {
      const url = kind === "idea" ? "/api/story-ideas" : "/api/story-drafts";
      const body = kind === "idea"
        ? { title: "", notes: "", tags: [] }
        : { title: "", notes: "", tags: [] };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text.slice(0, 200)}`);
      }
      const item = (await res.json()) as { id: string };
      router.push(kind === "idea" ? `/stories/ideas/${item.id}` : `/stories/drafts/${item.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => create("idea")}
          disabled={busy !== null}
          className="bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 text-sm rounded px-3 py-1.5 disabled:opacity-50"
        >
          {busy === "idea" ? "Creating..." : "+ New story idea"}
        </button>
        <button
          onClick={() => create("draft")}
          disabled={busy !== null}
          className="bg-indigo-700 text-white text-sm rounded px-3 py-1.5 disabled:opacity-50 hover:bg-indigo-800"
        >
          {busy === "draft" ? "Creating..." : "+ New story draft"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 max-w-sm text-right">{error}</p>}
    </div>
  );
}
