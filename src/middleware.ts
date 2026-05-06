import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  
  // Get session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;
  const userStatus = session?.user?.status;

  // Debug logging (remove in production)
  console.log('[Middleware]', {
    path: nextUrl.pathname,
    isLoggedIn,
    userRole,
    userStatus,
    hasSessionCookie: request.cookies.has('authjs.session-token'),
  });

  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
                      nextUrl.pathname.startsWith('/register');
  const isProtectedRoute = nextUrl.pathname.startsWith('/bookmarks') ||
                          nextUrl.pathname.startsWith('/profile');

  // Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect admins to /admin, regular users to /
      const redirectTo = (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') 
        ? '/admin' 
        : '/';
      console.log('[Middleware] Redirecting logged-in user from', nextUrl.pathname, 'to', redirectTo);
      return NextResponse.redirect(new URL(redirectTo, nextUrl));
    }
    console.log('[Middleware] Allowing access to auth route:', nextUrl.pathname);
    return NextResponse.next();
  }

  // Protect user routes
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    if (userStatus !== 'VERIFIED') {
      return NextResponse.redirect(new URL('/pending-verification', nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};