import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })

  console.log('Token:', token)

  const { pathname } = request.nextUrl

  // If user is not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check for admin-only route
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Check for user-only route
  if (pathname.startsWith('/user') && token.role !== 'user') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
}
