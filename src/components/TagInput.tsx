"use client";

import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ value, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border border-neutral-300 rounded px-2 py-1 bg-white">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 text-xs px-2 py-0.5 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-neutral-500 hover:text-neutral-900"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
            setDraft("");
          } else if (e.key === "Backspace" && !draft && value.length) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={() => {
          if (draft) {
            addTag(draft);
            setDraft("");
          }
        }}
        placeholder={value.length === 0 ? placeholder ?? "Add tag..." : ""}
        className="flex-1 min-w-[6rem] outline-none text-sm py-1"
      />
    </div>
  );
}
