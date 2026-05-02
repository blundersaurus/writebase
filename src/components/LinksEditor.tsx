"use client";

import type { RefLink } from "@/db/schema";

type Props = {
  value: RefLink[];
  onChange: (links: RefLink[]) => void;
};

export default function LinksEditor({ value, onChange }: Props) {
  function update(idx: number, patch: Partial<RefLink>) {
    const next = value.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    onChange(next);
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...value, { url: "", title: "" }]);
  }

  return (
    <section className="border border-neutral-200 rounded-md bg-white">
      <header className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Reference links</h3>
        <button
          type="button"
          onClick={add}
          className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded px-2 py-1"
        >
          + Add link
        </button>
      </header>
      <div className="p-3 space-y-2">
        {value.length === 0 && (
          <p className="text-xs text-neutral-500 px-1">
            Add Drive, Notion, or any URL for reference.
          </p>
        )}
        {value.map((link, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-center">
            <input
              type="url"
              value={link.url}
              onChange={(e) => update(idx, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 min-w-[14rem] text-sm border border-neutral-300 rounded px-2 py-1 outline-none focus:border-neutral-500"
            />
            <input
              type="text"
              value={link.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="label (optional)"
              className="w-48 text-sm border border-neutral-300 rounded px-2 py-1 outline-none focus:border-neutral-500"
            />
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline px-1"
              >
                open
              </a>
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-xs text-neutral-500 hover:text-red-600 px-1"
              aria-label="Remove link"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
