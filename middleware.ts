import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all API routes to pass through without auth redirects
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow _next and static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check if user has a session cookie
  const userId = request.cookies.get('user_id')?.value
  const pathname = request.nextUrl.pathname

  console.log('[v0] Middleware:', { pathname, userId: userId ? 'present' : 'missing' })

  // Protect admin routes - redirect to auth if not logged in
  if (pathname.startsWith('/admin') && !userId) {
    console.log('[v0] Middleware: Redirecting /admin to /auth/admin (no user)')
    return NextResponse.redirect(new URL('/auth/admin', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/admin') && userId) {
    console.log('[v0] Middleware: Redirecting /auth/admin to /admin (user logged in)')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
