import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("fixloop_session");

  // Force HTTPS redirection in production when behind reverse proxy / SSL terminator
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-forwarded-proto") === "http"
  ) {
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Public paths that do not require authentication
  if (
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/api/v1/auth") ||
    pathname.startsWith("/api/v1/healthz") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/manifest.json"
  ) {
    const res = NextResponse.next();
    if (process.env.NODE_ENV === "production") {
      res.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }
    return res;
  }

  // If visiting login while authenticated, redirect to workspace
  if (pathname === "/login" && sessionCookie?.value) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // If visiting protected workspace while unauthenticated, redirect to login
  if (pathname.startsWith("/app") && !sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.next();
  // Defense-in-depth: Ensure crawlers never index private workspace or API responses
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
