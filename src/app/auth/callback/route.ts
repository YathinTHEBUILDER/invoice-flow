import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalNode = process.env.NODE_ENV === 'development'
      
      // In production, use the environment variable if available
      if (isLocalNode) {
        if (forwardedHost) {
          return NextResponse.redirect(`http://${forwardedHost}${next}`)
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      return NextResponse.redirect(`${appUrl}${next}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${appUrl}/auth/auth-code-error`)
}

