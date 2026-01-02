import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes (require authentication)
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Define admin routes (require admin role) - exclude /admin-login
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  ) && pathname !== '/admin-login'

  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured - middleware disabled")
    return NextResponse.next()
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Middleware can't set cookies directly
        },
        remove(name: string, options: any) {
          // Middleware can't remove cookies directly
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // If user is NOT logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user IS logged in and trying to access auth routes (login/signup)
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // If trying to access admin routes (except /admin-login), verify admin role
  if (isAdminRoute) {
    if (!user) {
      const adminLoginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(adminLoginUrl)
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role
    if (!userRole || userRole !== "admin") {
      console.log("Middleware: Access denied to admin route - user is not admin", {
        userId: user.id,
        userRole: userRole
      })
      const unauthorizedUrl = new URL('/?unauthorized=1', request.url)
      return NextResponse.redirect(unauthorizedUrl)
    }

    console.log("Middleware: Admin access granted for user:", user.email, { role: userRole })
  }

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
