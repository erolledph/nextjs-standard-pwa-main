import { NextRequest, NextResponse } from 'next/server'
import { firestoreUpdate } from '@/lib/firebase-admin'
import logger from '@/lib/logger-pino'

export const runtime = 'edge'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      logger.warn('Unauthorized comment approval attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Update comment to approved
    const success = await firestoreUpdate('comments', id, {
      approved: true,
      approvedAt: new Date().toISOString(),
    })

    if (!success) {
      logger.error('Failed to approve comment', new Error('Firestore update failed'), { requestId, commentId: id })
      return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 })
    }

    logger.info('Comment approved successfully', { requestId, commentId: id })
    return NextResponse.json({ message: 'Comment approved' })
  } catch (error) {
    logger.error('Error approving comment', error, { requestId })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
