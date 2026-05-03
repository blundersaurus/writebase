import postgres from "postgres";

const DDL = `
  CREATE TABLE IF NOT EXISTS ideas (
    id           text PRIMARY KEY,
    title        text NOT NULL DEFAULT '',
    notes        text NOT NULL DEFAULT '',
    tags         text[] NOT NULL DEFAULT '{}',
    created_at   bigint NOT NULL,
    updated_at   bigint NOT NULL,
    promoted_to  text
  );

  CREATE TABLE IF NOT EXISTS articles (
    id           text PRIMARY KEY,
    title        text NOT NULL DEFAULT '',
    content_html text NOT NULL DEFAULT '',
    status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed')),
    tags         text[] NOT NULL DEFAULT '{}',
    source_idea  text,
    created_at   bigint NOT NULL,
    updated_at   bigint NOT NULL
  );

  CREATE INDEX IF NOT EXISTS ideas_updated_at_idx    ON ideas(updated_at DESC);
  CREATE INDEX IF NOT EXISTS articles_updated_at_idx ON articles(updated_at DESC);
  CREATE INDEX IF NOT EXISTS articles_status_idx     ON articles(status);

  ALTER TABLE ideas    ADD COLUMN IF NOT EXISTS icon  text;
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS icon  text;
  ALTER TABLE ideas    ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;

  CREATE TABLE IF NOT EXISTS story_ideas (
    id           text PRIMARY KEY,
    title        text NOT NULL DEFAULT '',
    notes        text NOT NULL DEFAULT '',
    tags         text[] NOT NULL DEFAULT '{}',
    icon         text,
    links        jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at   bigint NOT NULL,
    updated_at   bigint NOT NULL,
    promoted_to  text
  );

  CREATE TABLE IF NOT EXISTS story_drafts (
    id           text PRIMARY KEY,
    title        text NOT NULL DEFAULT '',
    notes        text NOT NULL DEFAULT '',
    tags         text[] NOT NULL DEFAULT '{}',
    icon         text,
    links        jsonb NOT NULL DEFAULT '[]'::jsonb,
    source_idea  text,
    created_at   bigint NOT NULL,
    updated_at   bigint NOT NULL
  );

  CREATE INDEX IF NOT EXISTS story_ideas_updated_at_idx  ON story_ideas(updated_at DESC);
  CREATE INDEX IF NOT EXISTS story_drafts_updated_at_idx ON story_drafts(updated_at DESC);
`;

export async function runMigrations(client: ReturnType<typeof postgres>) {
  await client.unsafe(DDL);
}

async function main() {
  // Lazy-load dotenv only when running this script directly.
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: ".env.local" });
    dotenv.config({ path: ".env" });
  } catch {
    // dotenv is optional; env vars may already be present.
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Add it to .env.local or pass it inline:\n" +
        "  DATABASE_URL='postgresql://...' npm run migrate",
    );
    process.exit(1);
  }

  const client = postgres(url, { prepare: false, max: 1 });
  try {
    await runMigrations(client);
    console.log("Migrations applied.");
  } finally {
    await client.end();
  }
}

const invokedDirectly =
  typeof process !== "undefined" &&
  process.argv[1] &&
  /[\\/]src[\\/]db[\\/]migrate\.(ts|js)$/.test(process.argv[1]);

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
