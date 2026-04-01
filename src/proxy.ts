import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/pricing' ||
    pathname === '/waitlist' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/cookie' ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/ref/') ||
    pathname.startsWith('/unsubscribe');
  const isAuthRoute = pathname.startsWith('/api/auth');
  const isApiRoute = pathname.startsWith('/api');

  // Auth API routes always pass through (handled by NextAuth)
  if (isAuthRoute) return NextResponse.next();

  // API routes: auth checked at route handler level
  if (isApiRoute) return NextResponse.next();

  // Logged-in users visiting public pages -> redirect to dashboard
  if (isPublicPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Public pages: allow access
  if (isPublicPage) return NextResponse.next();

  // Protected pages: require auth
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Onboarding redirect: incomplete onboarding -> /onboarding
  const isOnboarding = pathname === '/onboarding';
  const isAdmin = pathname.startsWith('/admin');
  if (
    !isOnboarding &&
    !isAdmin &&
    req.auth?.user?.onboardingCompleted === false
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
