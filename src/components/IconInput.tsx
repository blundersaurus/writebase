"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (icon: string | null) => void;
};

const EMOJI_PALETTE = [
  "💡", "✨", "📝", "📌", "📎", "📚", "📖", "📰",
  "✏️", "🖋️", "📋", "🗂️", "🗒️", "📄", "📑", "🔖",
  "🎯", "🚀", "⭐", "🔥", "⚡", "🌟", "🏆", "🎉",
  "🤔", "💭", "🧠", "👀", "👋", "🙏", "💬", "🗣️",
  "📊", "📈", "📉", "🔢", "🧮", "🔍", "🔎", "🧭",
  "💼", "🏗️", "🛠️", "⚙️", "🔧", "🧰", "🧪", "🧬",
  "🌍", "🌱", "🌳", "☕", "🍵", "🎨", "🎵", "🎬",
];

export default function IconInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(emoji: string) {
    onChange(emoji);
    setOpen(false);
  }

  return (
    <div ref={wrap} className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Pick an icon"
        className="w-9 h-9 flex items-center justify-center text-lg border border-neutral-300 rounded bg-white hover:border-neutral-400"
      >
        {value || <span className="text-neutral-400 text-base">＋</span>}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-neutral-500 hover:text-neutral-900 px-1"
          aria-label="Clear icon"
          title="Remove icon"
        >
          ×
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-label="Pick an emoji"
          className="absolute z-30 top-full left-0 mt-1 w-72 bg-white border border-neutral-200 rounded-md shadow-lg p-2"
        >
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PALETTE.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => pick(e)}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-neutral-100 ${
                  value === e ? "bg-neutral-200" : ""
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
