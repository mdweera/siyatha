import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};