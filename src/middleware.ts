import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.nextUrl.href)
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isLoginPage = url.pathname === '/login'
  const isRegisterPage = url.pathname.startsWith('/register')
  const isVerifyPage = url.pathname === '/verify'
  const isAuthCallback = url.pathname === '/auth/callback'

  // 1. If no user and trying to access dashboard, redirect to login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If user exists, handle verification and role-based redirection
  if (user) {
    const isEmailVerified = !!user.email_confirmed_at
    const role = user.app_metadata?.role || user.user_metadata?.role
    
    // Redirect unverified users to verification page if trying to access dashboard
    if (isDashboard && !isEmailVerified && !isVerifyPage) {
      return NextResponse.redirect(new URL('/verify', request.url))
    }

    // Redirect logged-in and verified users away from auth/verify pages
    if (isLoginPage || isRegisterPage || (isVerifyPage && isEmailVerified)) {
      if (role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      if (role === 'investor') return NextResponse.redirect(new URL('/dashboard/investor', request.url))
      if (role === 'msme') return NextResponse.redirect(new URL('/dashboard/msme', request.url))
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based route protection
    if (isDashboard) {
      if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      if (url.pathname.startsWith('/dashboard/investor') && role !== 'investor') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      if (url.pathname.startsWith('/dashboard/msme') && role !== 'msme') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
