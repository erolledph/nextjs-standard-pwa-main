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
    // Verify admin session
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      logger.warn('Unauthorized comment rejection attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft reject - set approved to false
    const success = await firestoreUpdate('comments', id, {
      approved: false,
      rejectedAt: new Date().toISOString(),
    })

    if (!success) {
      logger.error('Failed to reject comment', new Error('Firestore update failed'), { requestId, commentId: id })
      return NextResponse.json({ error: 'Failed to reject comment' }, { status: 500 })
    }

    logger.info('Comment rejected successfully', { requestId, commentId: id })
    return NextResponse.json({ success: true, message: 'Comment rejected' })
  } catch (error) {
    logger.error('Error rejecting comment', error, { requestId })
    return NextResponse.json({ error: 'Failed to reject comment' }, { status: 500 })
  }
}
