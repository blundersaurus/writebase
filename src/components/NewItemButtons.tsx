"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewItemButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "idea" | "article">(null);
  const [error, setError] = useState<string | null>(null);

  async function create(kind: "idea" | "article") {
    setBusy(kind);
    setError(null);
    try {
      const url = kind === "idea" ? "/api/ideas" : "/api/articles";
      const body =
        kind === "idea"
          ? { title: "", notes: "", tags: [] }
          : { title: "", contentHtml: "", status: "draft", tags: [] };
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
      router.push(kind === "idea" ? `/ideas/${item.id}` : `/articles/${item.id}`);
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
          className="bg-white border border-neutral-300 hover:border-neutral-400 text-sm rounded px-3 py-1.5 disabled:opacity-50"
        >
          {busy === "idea" ? "Creating..." : "+ New idea"}
        </button>
        <button
          onClick={() => create("article")}
          disabled={busy !== null}
          className="bg-neutral-900 text-white text-sm rounded px-3 py-1.5 disabled:opacity-50"
        >
          {busy === "article" ? "Creating..." : "+ New draft"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 max-w-sm text-right">{error}</p>}
    </div>
  );
}
