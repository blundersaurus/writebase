"use client";

import { useEffect, useRef, useState } from "react";
import type { RefLink } from "@/db/schema";

type Props = {
  value: RefLink[];
  onChange: (links: RefLink[]) => void;
};

export default function LinksEditor({ value, onChange }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (dialogOpen) {
      if (!dlg.open) dlg.showModal();
      setTimeout(() => urlInputRef.current?.focus(), 0);
    } else if (dlg.open) {
      dlg.close();
    }
  }, [dialogOpen]);

  function openAdd() {
    setEditingIndex(null);
    setDraftUrl("");
    setDraftTitle("");
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(idx: number) {
    const link = value[idx];
    setEditingIndex(idx);
    setDraftUrl(link.url);
    setDraftTitle(link.title);
    setError(null);
    setDialogOpen(true);
  }

  function close() {
    setDialogOpen(false);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const raw = draftUrl.trim();
    const title = draftTitle.trim();
    if (!raw) {
      setError("URL is required.");
      return;
    }
    const finalUrl = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    try {
      new URL(finalUrl);
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    const link: RefLink = { url: finalUrl, title };
    const next = [...value];
    if (editingIndex === null) next.push(link);
    else next[editingIndex] = link;
    onChange(next);
    close();
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <section className="border border-neutral-200 rounded-md bg-white">
      <header className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Reference links</h3>
        <button
          type="button"
          onClick={openAdd}
          className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded px-2 py-1"
        >
          + Add link
        </button>
      </header>

      <ul className="px-4 py-3 space-y-1.5">
        {value.length === 0 && (
          <li className="text-xs text-neutral-500">
            No links yet — click <em>Add link</em> to attach a Drive doc, Notion
            page, or any URL.
          </li>
        )}
        {value.map((link, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm group">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
              title={link.url}
            >
              {link.title || link.url}
            </a>
            <button
              type="button"
              onClick={() => openEdit(idx)}
              className="text-xs text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100"
              aria-label="Edit link"
              title="Edit"
            >
              edit
            </button>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-xs text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 ml-auto"
              aria-label="Remove link"
              title="Remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setDialogOpen(false)}
        className="rounded-lg p-0 backdrop:bg-black/30"
      >
        <form onSubmit={save} className="w-[28rem] max-w-[90vw] p-5 space-y-4">
          <h2 className="text-base font-semibold">
            {editingIndex === null ? "Add reference link" : "Edit reference link"}
          </h2>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              URL
            </label>
            <input
              ref={urlInputRef}
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="What is this?"
              className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              className="text-sm text-neutral-700 hover:text-neutral-900 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm bg-neutral-900 text-white rounded px-3 py-1.5"
            >
              Save
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
