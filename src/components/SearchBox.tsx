"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Idea = { id: string; title: string; notes: string };
type Article = { id: string; title: string; status: string };
type SearchResult = { ideas: Idea[]; articles: Article[] };

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
      if (res.ok) setResults(await res.json());
    }, 150);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const total = (results?.ideas.length ?? 0) + (results?.articles.length ?? 0);

  return (
    <div ref={wrap} className="relative">
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search ideas and articles..."
        className="w-full border border-neutral-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />
      {open && q.trim() && results && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-96 overflow-auto">
          {total === 0 ? (
            <div className="p-3 text-sm text-neutral-500">No matches.</div>
          ) : (
            <>
              {results.ideas.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-neutral-500">Ideas</div>
                  {results.ideas.map((i) => (
                    <Link
                      key={i.id}
                      href={`/ideas/${i.id}`}
                      className="block px-3 py-2 hover:bg-neutral-50 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <div className="font-medium">{i.title || "Untitled"}</div>
                      {i.notes && <div className="text-neutral-500 line-clamp-1">{i.notes}</div>}
                    </Link>
                  ))}
                </div>
              )}
              {results.articles.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-neutral-500">Articles</div>
                  {results.articles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/articles/${a.id}`}
                      className="block px-3 py-2 hover:bg-neutral-50 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <div className="font-medium">{a.title || "Untitled"}</div>
                      <div className="text-xs text-neutral-500">{a.status}</div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
