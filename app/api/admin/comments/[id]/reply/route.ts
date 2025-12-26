import { NextRequest, NextResponse } from 'next/server'
import { firestoreAdd } from '@/lib/firebase-admin'
import { sanitizeComment } from '@/lib/sanitize'
import logger from '@/lib/logger-pino'

export const runtime = 'edge'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Verify admin session
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      logger.warn('Unauthorized comment reply attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, postSlug, adminEmail } = await req.json()

    if (!content?.trim()) {
      logger.warn('Empty reply content submitted', { requestId })
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 })
    }

    // Sanitize reply content
    const sanitizedContent = sanitizeComment(content)
    if (!sanitizedContent) {
      logger.warn('Reply content failed sanitization', { requestId, original: content.length })
      return NextResponse.json({ error: 'Reply contains invalid content' }, { status: 400 })
    }

    const commentId = (await params).id
    const replyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create reply
    await firestoreAdd('comments', {
      id: replyId,
      author: 'Admin',
      email: adminEmail || 'admin@worldfoodrecipes.sbs',
      content: sanitizedContent,
      postSlug: postSlug || 'unknown',
      parentId: commentId,
      approved: true,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    })

    logger.info('Admin reply posted successfully', { requestId, replyId, commentId })
    return NextResponse.json({
      success: true,
      replyId,
    })
  } catch (error) {
    logger.error('Error posting reply', error, { requestId })
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 })
  }
}
