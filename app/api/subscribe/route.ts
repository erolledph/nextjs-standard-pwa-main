import { NextRequest, NextResponse } from 'next/server'
import { firestoreQuery, firestoreAdd } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimiter'
import { handleApiError, ApiError, validateRequiredFields } from '@/lib/api-error-handler'

export const runtime = 'edge'

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Rate limiting: 5 subscriptions per hour per IP
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown'

    const rateLimit = checkRateLimit(ip, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
    })

    if (!rateLimit.allowed) {
      throw new ApiError(
        429,
        'Too many subscription attempts. Please try again later.',
        'RATE_LIMIT_EXCEEDED'
      )
    }

    const { email, source, postSlug } = await request.json()

    // Validation
    const required = validateRequiredFields({ email }, ['email'])
    if (!required.valid) {
      throw new ApiError(400, required.errors.join('; '), 'MISSING_FIELDS')
    }

    if (typeof email !== 'string') {
      throw new ApiError(400, 'email must be a string', 'INVALID_TYPE')
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, 'Invalid email format', 'INVALID_EMAIL')
    }

    if (email.length > 254) {
      throw new ApiError(400, 'email is too long', 'INVALID_EMAIL')
    }

    // Check for duplicates
    const subscribers = await firestoreQuery('subscribers')
    const emailExists = subscribers.some(
      (sub: any) => sub.email?.toLowerCase() === email.toLowerCase()
    )

    if (emailExists) {
      throw new ApiError(
        409,
        'You are already subscribed',
        'DUPLICATE_EMAIL'
      )
    }

    // Create subscriber
    const subscriberId = await firestoreAdd('subscribers', {
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      source: source || 'website',
      verified: false,
      unsubscribed: false,
      ...(postSlug && { postSlug }),
    })

    if (!subscriberId) {
      throw new ApiError(500, 'Failed to subscribe', 'DATABASE_ERROR')
    }

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriberId,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

