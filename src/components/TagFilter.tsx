import Link from "next/link";

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
      <span className="text-xs uppercase tracking-wide text-neutral-500 mr-1">Tags:</span>
      <Link
        href={href(undefined)}
        className={`text-xs px-2 py-1 rounded-full border ${!active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-300 hover:border-neutral-400"}`}
      >
        All
      </Link>
      {tags.map((t) => (
        <Link
          key={t}
          href={href(t)}
          className={`text-xs px-2 py-1 rounded-full border ${active === t ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-300 hover:border-neutral-400"}`}
        >
          {t}
        </Link>
      ))}
    </div>
  );
}
