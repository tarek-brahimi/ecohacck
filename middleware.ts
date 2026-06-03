import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME, verifySession } from '@/lib/session';

const PUBLIC_PATHS = ['/', '/login', '/signup'];
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/activities'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifySession(token);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};