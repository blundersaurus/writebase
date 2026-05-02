import "server-only";
import { sql } from "./client";
import type { Idea, Article, RefLink } from "./schema";

type IdeaRow = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: unknown;
  created_at: string | number | bigint;
  updated_at: string | number | bigint;
  promoted_to: string | null;
};

type ArticleRow = {
  id: string;
  title: string;
  content_html: string;
  status: "draft" | "completed";
  tags: string[];
  icon: string | null;
  links: unknown;
  source_idea: string | null;
  created_at: string | number | bigint;
  updated_at: string | number | bigint;
};

const toNum = (v: string | number | bigint): number =>
  typeof v === "number" ? v : Number(v);

function toLinks(raw: unknown): RefLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is { url?: unknown; title?: unknown } => typeof l === "object" && l !== null)
    .map((l) => ({
      url: typeof l.url === "string" ? l.url : "",
      title: typeof l.title === "string" ? l.title : "",
    }))
    .filter((l) => l.url);
}

function toIdea(r: IdeaRow): Idea {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    tags: r.tags,
    icon: r.icon,
    links: toLinks(r.links),
    createdAt: toNum(r.created_at),
    updatedAt: toNum(r.updated_at),
    promotedTo: r.promoted_to,
  };
}

function toArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    title: r.title,
    contentHtml: r.content_html,
    status: r.status,
    tags: r.tags,
    icon: r.icon,
    links: toLinks(r.links),
    sourceIdea: r.source_idea,
    createdAt: toNum(r.created_at),
    updatedAt: toNum(r.updated_at),
  };
}

export const ideasRepo = {
  async list(limit?: number): Promise<Idea[]> {
    const rows = limit
      ? await sql<IdeaRow[]>`
          SELECT * FROM ideas ORDER BY updated_at DESC LIMIT ${limit}
        `
      : await sql<IdeaRow[]>`
          SELECT * FROM ideas ORDER BY updated_at DESC
        `;
    return rows.map(toIdea);
  },

  async get(id: string): Promise<Idea | undefined> {
    const rows = await sql<IdeaRow[]>`SELECT * FROM ideas WHERE id = ${id}`;
    return rows[0] ? toIdea(rows[0]) : undefined;
  },

  async insert(idea: Idea): Promise<void> {
    await sql`
      INSERT INTO ideas (
        id, title, notes, tags, icon, links,
        created_at, updated_at, promoted_to
      )
      VALUES (
        ${idea.id}, ${idea.title}, ${idea.notes}, ${idea.tags},
        ${idea.icon}, ${sql.json(idea.links)},
        ${idea.createdAt}, ${idea.updatedAt}, ${idea.promotedTo}
      )
    `;
  },

  async update(
    id: string,
    patch: Partial<
      Pick<Idea, "title" | "notes" | "tags" | "icon" | "links" | "promotedTo">
    > & { updatedAt: number },
  ): Promise<void> {
    const title = patch.title ?? null;
    const notes = patch.notes ?? null;
    const tags = patch.tags ?? null;
    const icon = patch.icon ?? null;
    const iconProvided = patch.icon !== undefined;
    const links = patch.links ? sql.json(patch.links) : null;
    const promotedTo = patch.promotedTo ?? null;
    await sql`
      UPDATE ideas SET
        title       = COALESCE(${title}::text, title),
        notes       = COALESCE(${notes}::text, notes),
        tags        = COALESCE(${tags}::text[], tags),
        icon        = CASE WHEN ${iconProvided} THEN ${icon}::text ELSE icon END,
        links       = COALESCE(${links}::jsonb, links),
        promoted_to = COALESCE(${promotedTo}::text, promoted_to),
        updated_at  = ${patch.updatedAt}
      WHERE id = ${id}
    `;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM ideas WHERE id = ${id}`;
  },
};

export const articlesRepo = {
  async list(opts?: {
    status?: "draft" | "completed";
    limit?: number;
  }): Promise<Article[]> {
    const status = opts?.status;
    const limit = opts?.limit;

    let rows: ArticleRow[];
    if (status && limit) {
      rows = await sql<ArticleRow[]>`
        SELECT * FROM articles WHERE status = ${status}
        ORDER BY updated_at DESC LIMIT ${limit}
      `;
    } else if (status) {
      rows = await sql<ArticleRow[]>`
        SELECT * FROM articles WHERE status = ${status}
        ORDER BY updated_at DESC
      `;
    } else if (limit) {
      rows = await sql<ArticleRow[]>`
        SELECT * FROM articles ORDER BY updated_at DESC LIMIT ${limit}
      `;
    } else {
      rows = await sql<ArticleRow[]>`
        SELECT * FROM articles ORDER BY updated_at DESC
      `;
    }
    return rows.map(toArticle);
  },

  async get(id: string): Promise<Article | undefined> {
    const rows = await sql<ArticleRow[]>`SELECT * FROM articles WHERE id = ${id}`;
    return rows[0] ? toArticle(rows[0]) : undefined;
  },

  async insert(a: Article): Promise<void> {
    await sql`
      INSERT INTO articles (
        id, title, content_html, status, tags, icon, links,
        source_idea, created_at, updated_at
      )
      VALUES (
        ${a.id}, ${a.title}, ${a.contentHtml}, ${a.status}, ${a.tags},
        ${a.icon}, ${sql.json(a.links)},
        ${a.sourceIdea}, ${a.createdAt}, ${a.updatedAt}
      )
    `;
  },

  async update(
    id: string,
    patch: Partial<
      Pick<Article, "title" | "contentHtml" | "status" | "tags" | "icon" | "links">
    > & { updatedAt: number },
  ): Promise<void> {
    const title = patch.title ?? null;
    const contentHtml = patch.contentHtml ?? null;
    const status = patch.status ?? null;
    const tags = patch.tags ?? null;
    const icon = patch.icon ?? null;
    const iconProvided = patch.icon !== undefined;
    const links = patch.links ? sql.json(patch.links) : null;
    await sql`
      UPDATE articles SET
        title        = COALESCE(${title}::text, title),
        content_html = COALESCE(${contentHtml}::text, content_html),
        status       = COALESCE(${status}::text, status),
        tags         = COALESCE(${tags}::text[], tags),
        icon         = CASE WHEN ${iconProvided} THEN ${icon}::text ELSE icon END,
        links        = COALESCE(${links}::jsonb, links),
        updated_at   = ${patch.updatedAt}
      WHERE id = ${id}
    `;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM articles WHERE id = ${id}`;
  },
};

export const tagsRepo = {
  async rename(from: string, to: string): Promise<void> {
    const now = Date.now();
    await sql`
      UPDATE ideas SET
        tags = (
          SELECT COALESCE(array_agg(DISTINCT t ORDER BY t), '{}')
          FROM unnest(array_replace(tags, ${from}, ${to})) t
        ),
        updated_at = ${now}
      WHERE ${from} = ANY(tags)
    `;
    await sql`
      UPDATE articles SET
        tags = (
          SELECT COALESCE(array_agg(DISTINCT t ORDER BY t), '{}')
          FROM unnest(array_replace(tags, ${from}, ${to})) t
        ),
        updated_at = ${now}
      WHERE ${from} = ANY(tags)
    `;
  },

  async delete(tag: string): Promise<void> {
    const now = Date.now();
    await sql`
      UPDATE ideas SET
        tags = array_remove(tags, ${tag}),
        updated_at = ${now}
      WHERE ${tag} = ANY(tags)
    `;
    await sql`
      UPDATE articles SET
        tags = array_remove(tags, ${tag}),
        updated_at = ${now}
      WHERE ${tag} = ANY(tags)
    `;
  },
};
