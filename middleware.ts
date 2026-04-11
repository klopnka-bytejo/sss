import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all API routes to pass through without auth redirects
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('[v0] Middleware: API route allowed:', request.nextUrl.pathname.substring(0, 50))
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

  console.log('[v0] Middleware: Route:', pathname, 'User:', userId ? 'authenticated' : 'not authenticated')

  // Protect admin routes - redirect to auth if not logged in
  if (pathname.startsWith('/admin') && !userId) {
    console.log('[v0] Middleware: Admin route - no user, redirecting to /auth/admin')
    return NextResponse.redirect(new URL('/auth/admin', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/admin') && userId) {
    console.log('[v0] Middleware: User at auth page - redirecting to /admin')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Allow protected routes if user is authenticated
  if (pathname.startsWith('/client') || pathname.startsWith('/wallet') || pathname.startsWith('/dashboard') || pathname.startsWith('/pro') || pathname.startsWith('/admin') || pathname.startsWith('/orders') || pathname.startsWith('/settings') || pathname.startsWith('/profile')) {
    if (!userId) {
      console.log('[v0] Middleware: Protected route', pathname, '- no session, redirecting to /auth/login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    console.log('[v0] Middleware: Protected route', pathname, '- user authenticated, allowing')
    return NextResponse.next()
  }

  console.log('[v0] Middleware: Public route, allowing')
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
