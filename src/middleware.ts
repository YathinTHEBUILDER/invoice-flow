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

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  const role = user?.user_metadata?.role

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') || 
                     request.nextUrl.pathname.startsWith('/get-started') ||
                     request.nextUrl.pathname.startsWith('/auth/forgot-password')

  // These pages require a session or are part of a verification flow
  const isFlowPage = request.nextUrl.pathname.startsWith('/auth/reset-password') ||
                     request.nextUrl.pathname.startsWith('/auth/verify')

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/msme') ||
                           request.nextUrl.pathname.startsWith('/investor')

  const isProtectedRoute = isDashboardRoute || 
                           request.nextUrl.pathname.startsWith('/settings') ||
                           request.nextUrl.pathname.startsWith('/profile')

  const isRoot = request.nextUrl.pathname === '/'

  // 1. If trying to access protected route without user, redirect to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If logged in and visiting auth pages or root, redirect to specific dashboard
  if (user && (isAuthPage || isRoot)) {
    const dashboardPath = `/${role || 'investor'}`
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // 3. Role-based access control for dashboards
  if (user && isDashboardRoute) {
    const currentPath = request.nextUrl.pathname
    
    // Check if the user is trying to access a route that doesn't match their role
    if (role) {
      if (currentPath.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
      }
      if (currentPath.startsWith('/msme') && role !== 'msme') {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
      }
      if (currentPath.startsWith('/investor') && role !== 'investor') {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
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
