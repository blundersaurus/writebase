import "server-only";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __writebaseSql: ReturnType<typeof postgres> | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Use the Supabase Connection Pooling > Transaction URL (port 6543).",
    );
  }
  return postgres(url, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
  });
}

export const sql = globalThis.__writebaseSql ?? (globalThis.__writebaseSql = connect());
