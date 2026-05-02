import "server-only";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __writebaseSql: ReturnType<typeof postgres> | undefined;
}

function init(): ReturnType<typeof postgres> {
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

function getClient(): ReturnType<typeof postgres> {
  return globalThis.__writebaseSql ?? (globalThis.__writebaseSql = init());
}

// Lazy proxy: behaves like the postgres() client, but the first
// connection / URL parse only happens when a query is actually run.
// This keeps `next build` from failing if DATABASE_URL is missing or
// malformed at build time.
const handler: ProxyHandler<object> = {
  apply(_target, thisArg, args) {
    const c = getClient() as unknown as (...a: unknown[]) => unknown;
    return Reflect.apply(c, thisArg, args);
  },
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop];
    return typeof v === "function" ? v.bind(c) : v;
  },
};

export const sql = new Proxy(function () {}, handler) as unknown as ReturnType<
  typeof postgres
>;
