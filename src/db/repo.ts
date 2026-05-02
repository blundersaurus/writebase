import "server-only";
import { sql } from "./client";
import type { Idea, Article } from "./schema";

type IdeaRow = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
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
  source_idea: string | null;
  created_at: string | number | bigint;
  updated_at: string | number | bigint;
};

const toNum = (v: string | number | bigint): number =>
  typeof v === "number" ? v : Number(v);

function toIdea(r: IdeaRow): Idea {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    tags: r.tags,
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
      INSERT INTO ideas (id, title, notes, tags, created_at, updated_at, promoted_to)
      VALUES (
        ${idea.id}, ${idea.title}, ${idea.notes}, ${idea.tags},
        ${idea.createdAt}, ${idea.updatedAt}, ${idea.promotedTo}
      )
    `;
  },

  async update(
    id: string,
    patch: Partial<Pick<Idea, "title" | "notes" | "tags" | "promotedTo">> & {
      updatedAt: number;
    },
  ): Promise<void> {
    const title = patch.title ?? null;
    const notes = patch.notes ?? null;
    const tags = patch.tags ?? null;
    const promotedTo = patch.promotedTo ?? null;
    await sql`
      UPDATE ideas SET
        title       = COALESCE(${title}::text, title),
        notes       = COALESCE(${notes}::text, notes),
        tags        = COALESCE(${tags}::text[], tags),
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
      INSERT INTO articles
        (id, title, content_html, status, tags, source_idea, created_at, updated_at)
      VALUES (
        ${a.id}, ${a.title}, ${a.contentHtml}, ${a.status}, ${a.tags},
        ${a.sourceIdea}, ${a.createdAt}, ${a.updatedAt}
      )
    `;
  },

  async update(
    id: string,
    patch: Partial<
      Pick<Article, "title" | "contentHtml" | "status" | "tags">
    > & { updatedAt: number },
  ): Promise<void> {
    const title = patch.title ?? null;
    const contentHtml = patch.contentHtml ?? null;
    const status = patch.status ?? null;
    const tags = patch.tags ?? null;
    await sql`
      UPDATE articles SET
        title        = COALESCE(${title}::text, title),
        content_html = COALESCE(${contentHtml}::text, content_html),
        status       = COALESCE(${status}::text, status),
        tags         = COALESCE(${tags}::text[], tags),
        updated_at   = ${patch.updatedAt}
      WHERE id = ${id}
    `;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM articles WHERE id = ${id}`;
  },
};
