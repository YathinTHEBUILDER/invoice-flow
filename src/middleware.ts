import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register') ||
                      request.nextUrl.pathname === '/verify';

  if (isDashboardRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
    
    // Mandatory Email Verification
    if (!user.email_confirmed_at) {
      const verifyUrl = request.nextUrl.clone();
      verifyUrl.pathname = '/verify';
      verifyUrl.searchParams.set('email', user.email || '');
      return NextResponse.redirect(verifyUrl);
    }

    // RBAC logic for Vercel Edge Runtime using Supabase JWT user_metadata
    const role = user.user_metadata?.role;

    // Handle base dashboard redirect
    if (request.nextUrl.pathname === '/dashboard') {
      if (role) {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Admin routes
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Investor routes
    if (request.nextUrl.pathname.startsWith('/dashboard/investor') && role !== 'investor') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // MSME routes
    if (request.nextUrl.pathname.startsWith('/dashboard/msme') && role !== 'msme') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && user) {
    if (request.nextUrl.pathname === '/verify' && !user.email_confirmed_at) {
      // Allow /verify if not confirmed
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
