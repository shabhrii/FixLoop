import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("fixloop_session");

  // Public paths that do not require authentication
  if (
    pathname.startsWith("/api/v1/auth") ||
    pathname.startsWith("/api/v1/healthz") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // If visiting login while authenticated, redirect to workspace
  if (pathname === "/login" && sessionCookie?.value) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // If visiting protected workspace while unauthenticated, redirect to login
  if (pathname.startsWith("/app") && !sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
