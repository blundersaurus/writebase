import Link from "next/link";
import CardDeleteButton from "./CardDeleteButton";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  preview?: string;
  tags?: string[];
  meta?: string;
  icon?: string | null;
  deletable?: { kind: "idea" | "article"; id: string };
};

export default function Card({
  href,
  title,
  subtitle,
  preview,
  tags,
  meta,
  icon,
  deletable,
}: Props) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className="block bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-neutral-900 line-clamp-1 flex items-center gap-2">
            {icon && <span aria-hidden>{icon}</span>}
            <span>{title || "Untitled"}</span>
          </h3>
          {subtitle && (
            <span className="text-xs text-neutral-500 shrink-0 pr-7">{subtitle}</span>
          )}
        </div>
        {preview && (
          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{preview}</p>
        )}
        {(tags && tags.length > 0) || meta ? (
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
            {tags?.map((t) => (
              <span key={t} className="bg-neutral-100 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
            {meta && <span className="ml-auto">{meta}</span>}
          </div>
        ) : null}
      </Link>
      {deletable && (
        <CardDeleteButton kind={deletable.kind} id={deletable.id} title={title} />
      )}
    </div>
  );
}
