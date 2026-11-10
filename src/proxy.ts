import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_PANEL_PREFIX = "/admin-secure-panel";
const ADMIN_API_PREFIX = "/api/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin-secure-panel/login") {
    return NextResponse.next();
  }

  const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const adminSession = adminToken ? await verifySessionToken(adminToken) : null;
  const isAdmin =
    adminSession?.role === "ADMIN" || adminSession?.role === "SUPER_ADMIN";
  const isSuperAdmin = adminSession?.role === "SUPER_ADMIN";

  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  if (pathname.startsWith(ADMIN_PANEL_PREFIX)) {
    if (!isAdmin) {
      return NextResponse.redirect(
        new URL("/admin-secure-panel/login", request.url),
      );
    }

    if (pathname.startsWith("/admin-secure-panel/finance") && !isSuperAdmin) {
      return NextResponse.redirect(
        new URL("/admin-secure-panel", request.url),
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-secure-panel/:path*",
    "/api/admin/:path*",
  ],
};
