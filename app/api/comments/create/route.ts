import { NextRequest, NextResponse } from 'next/server'
import { firestoreAdd } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimiter'

export const runtime = 'edge'

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 254
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown'

    const rateLimit = checkRateLimit(ip, {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      )
    }

    const { postSlug, author, email, content, parentId } = await request.json()

    // Validation
    if (!postSlug || typeof postSlug !== 'string') {
      return NextResponse.json(
        { error: 'postSlug is required' },
        { status: 400 }
      )
    }

    if (!author || typeof author !== 'string' || author.length < 1 || author.length > 100) {
      return NextResponse.json(
        { error: 'author must be a string (1-100 chars)' },
        { status: 400 }
      )
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'valid email is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: 'content must be a string (1-2000 chars)' },
        { status: 400 }
      )
    }

    // Create comment
    const commentId = await firestoreAdd('comments', {
      postSlug,
      author,
      email,
      content,
      createdAt: new Date(),
      approved: false, // Comments need approval
      ...(parentId && { parentId }),
    })

    if (!commentId) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Comment submitted for approval',
        commentId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
