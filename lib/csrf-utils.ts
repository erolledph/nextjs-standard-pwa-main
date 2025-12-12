/**
 * CSRF protection utilities
 * Complements existing csrf.ts with token generation and validation
 */

import crypto from 'crypto'

const CSRF_TOKEN_LENGTH = 32 // 256 bits
const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 // 24 hours

export interface CSRFTokenData {
  token: string
  createdAt: number
  expiresAt: number
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Create CSRF token with metadata
 */
export function createCSRFToken(): CSRFTokenData {
  const now = Date.now()
  return {
    token: generateCSRFToken(),
    createdAt: now,
    expiresAt: now + CSRF_TOKEN_EXPIRY
  }
}

/**
 * Verify token hasn't expired
 */
export function isCSRFTokenValid(tokenData: CSRFTokenData): boolean {
  return Date.now() < tokenData.expiresAt
}

/**
 * Validate CSRF token against expected value
 */
export function validateCSRFToken(provided: string, expected: string): boolean {
  if (!provided || !expected) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(provided, expected)
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks where duration reveals information
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Extract CSRF token from request headers
 * Supports multiple header formats
 */
export function extractCSRFToken(headers: Record<string, string | string[] | undefined>): string | null {
  // Check common header names (case-insensitive)
  const headerVariants = ['x-csrf-token', 'x-xsrf-token', 'csrf-token']

  for (const headerName of headerVariants) {
    const value = headers[headerName.toLowerCase()]
    if (value) {
      return Array.isArray(value) ? value[0] : value
    }
  }

  // Check body via header
  const contentType = headers['content-type']
  if (contentType === 'application/json' || (Array.isArray(contentType) && contentType[0] === 'application/json')) {
    // Note: actual body parsing should be done by caller
    // This just indicates where it should come from
    return null
  }

  return null
}

/**
 * Extract CSRF token from FormData
 */
export function extractCSRFTokenFromForm(formData: FormData | Record<string, any>): string | null {
  if (formData instanceof FormData) {
    return formData.get('_csrf') as string | null
  }

  return formData?._csrf || null
}

/**
 * Hash CSRF token for storage (optional - extra security layer)
 */
export function hashCSRFToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Verify a hashed CSRF token
 */
export function verifyHashedCSRFToken(token: string, hash: string): boolean {
  const tokenHash = hashCSRFToken(token)
  return timingSafeEqual(tokenHash, hash)
}

/**
 * Create CSRF middleware response
 */
export function setCSRFTokenCookie(token: string): { name: string; value: string; options: Record<string, any> } {
  return {
    name: '__Host-csrf_token',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY / 1000,
      path: '/'
    }
  }
}

/**
 * Clean up expired tokens from storage
 */
export function cleanupExpiredTokens(tokens: Map<string, CSRFTokenData>): void {
  const now = Date.now()
  for (const [key, data] of tokens.entries()) {
    if (now > data.expiresAt) {
      tokens.delete(key)
    }
  }
}

export default {
  generateCSRFToken,
  createCSRFToken,
  isCSRFTokenValid,
  validateCSRFToken,
  extractCSRFToken,
  extractCSRFTokenFromForm,
  hashCSRFToken,
  verifyHashedCSRFToken,
  setCSRFTokenCookie,
  cleanupExpiredTokens,
  timingSafeEqual
}
