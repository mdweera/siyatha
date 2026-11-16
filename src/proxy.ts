import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = host.replace(/^www\./, "").split(":")[0];
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isAuthPage && token) {
    if (token.role === 'ADMIN' || token.role === 'STAFF') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token.role !== 'ADMIN' && token.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(request.nextUrl.pathname), request.url));
  }

  const response = NextResponse.next();
  const lang = request.nextUrl.searchParams.get("lang");
  if (lang === "si" || lang === "en") {
    response.cookies.set("siyatha-lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};