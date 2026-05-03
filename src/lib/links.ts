import type { RefLink } from "@/db/schema";

export function cleanLinks(input: unknown): RefLink[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((l): RefLink | null => {
      if (typeof l !== "object" || l === null) return null;
      const obj = l as { url?: unknown; title?: unknown };
      const url = typeof obj.url === "string" ? obj.url.trim() : "";
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      if (!url && !title) return null;
      return { url, title };
    })
    .filter((l): l is RefLink => l !== null);
}
