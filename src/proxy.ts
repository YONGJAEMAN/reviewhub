import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  // Skip auth enforcement in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicPage = pathname === '/login' || pathname === '/signup';
  const isAuthRoute = pathname.startsWith('/api/auth');
  const isApiRoute = pathname.startsWith('/api');

  if (isAuthRoute || isApiRoute) return NextResponse.next();

  if (isPublicPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isPublicPage) return NextResponse.next();

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
