import { NextRequest, NextResponse } from 'next/server';

// DEMO MODE: Set to true to bypass authentication for demo purposes
// Set to false to re-enable full authentication
const DEMO_MODE = true;

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  // DEMO MODE: Skip all authentication checks
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  const token = request.cookies.get('adminToken')?.value;
  const { pathname } = request.nextUrl;

  // If the user is on a public path (e.g., /login)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    // If they have a token, redirect them away from login to /users
    if (token) {
      return NextResponse.redirect(new URL('/users', request.url));
    }
    // Otherwise, allow access to the public path
    return NextResponse.next();
  }

  // For all other paths (protected routes)
  // If no token is present, redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token exists, allow access to protected route
  return NextResponse.next();
}

// Configure which routes the middleware should run on
// This matcher excludes Next.js internal routes, API routes, and static files
export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
