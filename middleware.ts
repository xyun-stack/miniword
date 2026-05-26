import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "miniworld.admin";

/**
 * Edge middleware: presence-check the admin session cookie on every
 * /admin/* and /api/admin/* request. Cryptographic verification happens
 * inside the route handler (Node runtime) once the request makes it past
 * this gate.
 *
 * Public endpoints (login page + auth POST) are explicitly allowed.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public endpoints needed to sign in / out.
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/api/admin/auth")) return NextResponse.next();

  const hasCookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!hasCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirect = new URL("/admin/login", req.url);
    return NextResponse.redirect(redirect);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
