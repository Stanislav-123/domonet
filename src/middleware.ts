import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "dm_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;
  let role: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      role = String(payload.role ?? "");
    } catch {
      role = null;
    }
  }

  const isAdmin = pathname.startsWith("/admin");
  const isCabinet = pathname.startsWith("/cabinet");
  if (!isAdmin && !isCabinet) return NextResponse.next();

  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cabinet/:path*"],
};
