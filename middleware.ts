import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, hasAuthCookieValue } from "@/lib/auth";

// Protect dashboard pages with the JWT cookie. API auth itself is enforced by the
// .NET backend; `/papi/*` is excluded so mobile clients can call it without Next redirects.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (hasAuthCookieValue(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // `sw.js` MUST be excluded: a Service Worker script served behind a 3xx redirect is rejected.
  // `/api/upload` and `/api/stream` do manual cookie checks because they handle large/proxied bodies.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|papi|api/upload|api/stream).*)",
  ],
};
