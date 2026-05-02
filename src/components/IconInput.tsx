"use client";

import { useRef } from "react";

type Props = {
  value: string | null;
  onChange: (icon: string | null) => void;
};

export default function IconInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const next = Array.from(raw)[0] ?? "";
    onChange(next || null);
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        title="Click and press Win+. (Windows) or Ctrl+Cmd+Space (Mac) to open emoji picker"
        className="w-9 h-9 flex items-center justify-center text-lg border border-neutral-300 rounded bg-white hover:border-neutral-400"
      >
        {value || <span className="text-neutral-400 text-base">＋</span>}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value ?? ""}
        onChange={(e) => commit(e.target.value)}
        placeholder="emoji"
        maxLength={4}
        className="w-16 h-9 px-2 text-sm border border-neutral-300 rounded bg-white outline-none focus:border-neutral-500"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-neutral-500 hover:text-neutral-900 px-1"
          aria-label="Clear icon"
        >
          ×
        </button>
      )}
    </div>
  );
}
