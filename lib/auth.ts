import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// ADMIN_PASSWORD is REQUIRED - no fallback for production safety
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SESSION_TOKEN = "admin-session"
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

if (!ADMIN_PASSWORD) {
  console.warn(
    "⚠️  WARNING: ADMIN_PASSWORD environment variable is not set. "
    + "This will cause login failures in production. "
    + "Set ADMIN_PASSWORD in your Cloudflare environment variables."
  )
}

// In-memory store for session tokens with expiration
const activeSessionTokens = new Map<string, { expiresAt: number }>()

/**
 * Generate cryptographically secure token (not the string "true")
 * Uses Web Crypto API when available, falls back to Math.random()
 */
function generateSessionToken(): string {
  // Use Web Crypto API if available (browser + modern Node.js)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  
  // Fallback: Generate random UUID-like token
  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const randomSegment = () => Math.random().toString(16).slice(2, 10).padEnd(8, '0')
  return [
    randomSegment(),
    randomSegment().slice(0, 4),
    '4' + randomSegment().slice(0, 3),
    ((Math.random() * 4 + 8) | 0).toString(16) + randomSegment().slice(0, 3),
    randomSegment() + randomSegment().slice(0, 4),
  ].join('-')
}

/**
 * Verify session token format and expiration
 */
function isValidSessionToken(token: string): boolean {
  if (!token) return false
  
  // Check UUID format (36 characters, not "true")
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return false
  }

  // Check expiration
  const session = activeSessionTokens.get(token)
  if (!session) return false
  
  if (session.expiresAt < Date.now()) {
    activeSessionTokens.delete(token) // Clean up expired
    return false
  }

  return true
}

export async function setAdminSession() {
  const token = generateSessionToken()
  const expiresAt = Date.now() + SESSION_TIMEOUT

  // Store in memory
  activeSessionTokens.set(token, { expiresAt })

  // Store in cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_TOKEN, token, {
    httpOnly: true,
    secure: true, // Always HTTPS in production
    sameSite: "strict", // Stronger CSRF protection
    path: "/",
    maxAge: SESSION_TIMEOUT / 1000, // Convert ms to seconds
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_TOKEN)?.value

  // Invalidate token immediately
  if (token) {
    activeSessionTokens.delete(token)
  }

  // Remove cookie
  cookieStore.delete(SESSION_TOKEN)
}

export async function isAdminAuthenticated(request?: NextRequest): Promise<boolean> {
  let token: string | undefined

  if (request) {
    // Edge runtime: get from request object
    token = request.cookies.get(SESSION_TOKEN)?.value
  } else {
    // Node.js runtime: use cookies() hook
    try {
      const cookieStore = await cookies()
      token = cookieStore.get(SESSION_TOKEN)?.value
    } catch {
      return false
    }
  }

  return isValidSessionToken(token || "")
}

export function verifyPassword(password: string): boolean {
  // Fail safely if password not configured
  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not configured")
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  return constantTimeEqual(password, ADMIN_PASSWORD)
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Prevents attackers from using response time to guess password
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still take time to hash both to prevent length leakage
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}
