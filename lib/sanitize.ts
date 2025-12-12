/**
 * Input sanitization utility
 * Prevents XSS, SQL injection, and other injection attacks
 * Zero external dependencies - uses native regex patterns
 */

export interface SanitizationOptions {
  allowHtml?: boolean
  allowUrls?: boolean
  maxLength?: number
  trimWhitespace?: boolean
}

const defaultOptions: Required<SanitizationOptions> = {
  allowHtml: false,
  allowUrls: true,
  maxLength: 5000,
  trimWhitespace: true
}

/**
 * HTML special characters that need escaping
 */
const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Remove script tags and dangerous content
 */
function removeScriptTags(text: string): string {
  // Remove script tags
  let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove iframe tags
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
  
  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '')
  
  return cleaned
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, 'http://localhost')
    
    // Only allow http, https, and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return ''
    }
    
    return url
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Main sanitization function
 */
export function sanitize(input: unknown, options?: Partial<SanitizationOptions>): string {
  const opts = { ...defaultOptions, ...options }

  // Handle non-string inputs
  if (typeof input !== 'string') {
    return ''
  }

  let text = input

  // Trim whitespace
  if (opts.trimWhitespace) {
    text = text.trim()
  }

  // Enforce max length
  if (text.length > opts.maxLength) {
    text = text.substring(0, opts.maxLength)
  }

  // Remove dangerous content
  text = removeScriptTags(text)

  // Escape HTML if not allowed
  if (!opts.allowHtml) {
    text = escapeHtml(text)
  }

  // Sanitize URLs if present
  if (opts.allowUrls) {
    // Replace suspicious URLs with empty string
    text = text.replace(/https?:\/\/[^\s\)\]]+/g, (url) => {
      return isValidUrl(url) ? url : ''
    })
  }

  return text
}

/**
 * Sanitize comment text
 */
export function sanitizeComment(text: string): string {
  return sanitize(text, {
    allowHtml: false,
    allowUrls: true,
    maxLength: 2000
  })
}

/**
 * Sanitize user names
 */
export function sanitizeUsername(name: string): string {
  return sanitize(name, {
    allowHtml: false,
    allowUrls: false,
    maxLength: 100
  })
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitize(email, {
    allowHtml: false,
    allowUrls: false,
    maxLength: 254
  })

  return isValidEmail(sanitized) ? sanitized.toLowerCase() : ''
}

/**
 * Sanitize JSON payload
 */
export function sanitizePayload(payload: unknown): Record<string, any> {
  if (typeof payload !== 'object' || payload === null) {
    return {}
  }

  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(payload)) {
    // Sanitize key
    const sanitizedKey = sanitize(key, {
      allowHtml: false,
      allowUrls: false,
      maxLength: 100
    }).replace(/[^a-zA-Z0-9_-]/g, '')

    if (!sanitizedKey) continue

    // Sanitize value based on type
    if (typeof value === 'string') {
      result[sanitizedKey] = sanitize(value)
    } else if (typeof value === 'number') {
      result[sanitizedKey] = value
    } else if (typeof value === 'boolean') {
      result[sanitizedKey] = value
    } else if (Array.isArray(value)) {
      result[sanitizedKey] = value.filter((v) => typeof v === 'string' || typeof v === 'number').slice(0, 100)
    }
    // Skip objects and other types
  }

  return result
}
