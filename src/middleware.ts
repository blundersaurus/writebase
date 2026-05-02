import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";

const COOKIE_NAME = "writebase_session";

const PUBLIC_PATHS = ["/login", "/api/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.SESSION_SECRET ?? "";
  if (password.length < 32) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await getIronSession<{ authenticated?: boolean }>(req, res, {
    password,
    cookieName: COOKIE_NAME,
  });

  if (session.authenticated) return res;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
