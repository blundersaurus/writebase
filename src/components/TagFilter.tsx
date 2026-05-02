"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  base: string;
  tags: string[];
  active?: string;
  extraQuery?: Record<string, string | undefined>;
};

export default function TagFilter({ base, tags, active, extraQuery }: Props) {
  if (tags.length === 0) return null;

  function href(tag?: string) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (extraQuery) {
      for (const [k, v] of Object.entries(extraQuery)) {
        if (v) params.set(k, v);
      }
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-neutral-500 mr-1">
        Tags:
      </span>
      <Link
        href={href(undefined)}
        className={`text-xs px-2 py-1 rounded-full border ${
          !active
            ? "bg-neutral-900 text-white border-neutral-900"
            : "bg-white border-neutral-300 hover:border-neutral-400"
        }`}
      >
        All
      </Link>
      {tags.map((t) => (
        <TagChip key={t} tag={t} href={href(t)} active={active === t} />
      ))}
    </div>
  );
}

function TagChip({ tag, href, active }: { tag: string; href: string; active: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function rename() {
    setOpen(false);
    const next = window.prompt(`Rename tag "${tag}" to:`, tag);
    if (next === null) return;
    const to = next.trim();
    if (!to || to === tag) return;
    setBusy(true);
    try {
      const res = await fetch("/api/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: tag, to }),
      });
      if (!res.ok) {
        alert(`Rename failed: ${res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setOpen(false);
    if (!window.confirm(`Remove tag "${tag}" from all ideas and articles?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert(`Delete failed: ${res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span ref={wrap} className="relative inline-flex items-center">
      <Link
        href={href}
        className={`text-xs pl-2 pr-1 py-1 rounded-l-full border-y border-l ${
          active
            ? "bg-neutral-900 text-white border-neutral-900"
            : "bg-white border-neutral-300 hover:border-neutral-400"
        }`}
      >
        {tag}
      </Link>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-label={`Manage tag ${tag}`}
        className={`text-xs pr-2 pl-1 py-1 rounded-r-full border-y border-r ${
          active
            ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-700"
            : "bg-white border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:text-neutral-900"
        } disabled:opacity-50`}
      >
        ⋯
      </button>
      {open && (
        <span
          role="menu"
          className="absolute z-20 top-full left-0 mt-1 w-32 bg-white border border-neutral-200 rounded shadow-md text-sm overflow-hidden"
        >
          <button
            type="button"
            onClick={rename}
            className="block w-full text-left px-3 py-1.5 hover:bg-neutral-50"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={remove}
            className="block w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600"
          >
            Delete
          </button>
        </span>
      )}
    </span>
  );
}
