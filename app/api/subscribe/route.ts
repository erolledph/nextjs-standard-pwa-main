import { NextRequest, NextResponse } from 'next/server'
import { firestoreQuery, firestoreAdd } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimiter'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, source, postSlug } = await request.json()

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'invalid email format' },
        { status: 400 }
      )
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: 'email is too long' },
        { status: 400 }
      )
    }

    // Check for duplicates
    const subscribers = await firestoreQuery('subscribers')
    const emailExists = subscribers.some(
      (sub: any) => sub.email?.toLowerCase() === email.toLowerCase()
    )

    if (emailExists) {
      return NextResponse.json(
        { error: 'You are already subscribed' },
        { status: 409 }
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
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriberId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
