import createMiddleware from 'next-intl/middleware'
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Admin routes require ADMIN role
        if (pathname.includes('/admin')) {
          return token?.role === 'ADMIN'
        }
        // Protected user routes require any auth
        if (
          pathname.includes('/checkout') ||
          pathname.includes('/orders')
        ) {
          return !!token
        }
        return true
      },
    },
    pages: {
      signIn: '/en/auth/login',
    },
  }
)

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isProtected =
    pathname.includes('/admin') ||
    pathname.includes('/checkout') ||
    pathname.includes('/orders')

  if (isProtected) {
    return (authMiddleware as (req: NextRequest) => NextResponse)(req)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
