import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get user_id from cookies (set during login/register)
  const userId = request.cookies.get('user_id')?.value

  // Paths that don't need authentication
  const publicPaths = [
    '/auth/login', 
    '/auth/register', 
    '/auth/admin', 
    '/auth/verify', 
    '/', 
    '/games', 
    '/services', 
    '/explore',
    '/about',
    '/api/auth',
    '/grid.svg'
  ]
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  )

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If no user_id and requesting protected path, redirect to login
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Add user_id to request headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', userId)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
