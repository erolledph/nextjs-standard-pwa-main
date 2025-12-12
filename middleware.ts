import { type NextRequest, NextResponse } from "next/server"

const ADMIN_SESSION_TOKEN = "admin-session"
const protectedRoutes = ["/admin/dashboard", "/admin/create", "/admin/comments", "/admin/subscribers"]
const publicAdminRoutes = ["/admin/login"]

/**
 * Validate session token format (UUID, not "true")
 */
function isValidSessionToken(token: string): boolean {
  if (!token) return false
  // Must be UUID format (36 chars: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(token)
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public admin routes don't require authentication
  const isPublicAdminRoute = publicAdminRoutes.some((route) => pathname.startsWith(route))
  if (isPublicAdminRoute) {
    return NextResponse.next()
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for valid session cookie
    const sessionCookie = request.cookies.get(ADMIN_SESSION_TOKEN)
    const sessionToken = sessionCookie?.value

    if (!sessionToken || !isValidSessionToken(sessionToken)) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
