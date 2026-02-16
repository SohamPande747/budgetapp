import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')

  // 1️⃣ Not logged in → block dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2️⃣ Logged in → prevent access to login/signup
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 3️⃣ Logged in → redirect from landing page
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}