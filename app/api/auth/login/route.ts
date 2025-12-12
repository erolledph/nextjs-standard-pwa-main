import { NextResponse, type NextRequest } from "next/server"
import { setAdminSession, verifyPassword } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rateLimiter"
import { generateCsrfToken } from "@/lib/csrf"
import { handleApiError, ApiError } from "@/lib/api-error-handler"

export const runtime = 'edge'

export async function GET() {
  try {
    const csrfToken = await generateCsrfToken()
    return NextResponse.json({ csrfToken })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for') ||
               'unknown'
    
    // Check rate limit: 5 attempts per 15 minutes
    const rateLimit = checkRateLimit(ip, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 60 * 60 * 1000 // 1 hour block
    })

    if (!rateLimit.allowed) {
      throw new ApiError(
        429,
        "Too many login attempts. Please try again later.",
        "RATE_LIMIT_EXCEEDED"
      )
    }

    const { password, csrfToken } = await request.json()

    if (!password || typeof password !== 'string') {
      throw new ApiError(400, "Password is required", "MISSING_PASSWORD")
    }

    if (!csrfToken || typeof csrfToken !== 'string') {
      throw new ApiError(400, "CSRF token is required", "MISSING_CSRF")
    }

    if (!verifyPassword(password)) {
      throw new ApiError(401, "Invalid password", "INVALID_PASSWORD")
    }

    await setAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

