import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === 'development'
        ? 'next-auth.session-token'
        : '__Secure-next-auth.session-token',
  })

  console.log('Token:', token)

  const { pathname } = request.nextUrl

  if (!token) {
    console.log("🔒 No token in middleware. Redirecting to /login")
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    console.log("⛔ Non-admin trying to access /admin. Redirecting to /unauthorized")
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (pathname.startsWith('/user') && token.role !== 'user') {
    console.log("⛔ Non-user trying to access /user. Redirecting to /login")
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
}
