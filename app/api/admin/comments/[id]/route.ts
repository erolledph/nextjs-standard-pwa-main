import { NextRequest, NextResponse } from 'next/server'
import { firestoreDelete } from '@/lib/firebase-admin'
import logger from '@/lib/logger-pino'

export const runtime = 'edge'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      logger.warn('Unauthorized comment deletion attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete comment
    const success = await firestoreDelete('comments', id)

    if (!success) {
      logger.error('Failed to delete comment', new Error('Firestore delete failed'), { requestId, commentId: id })
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    logger.info('Comment deleted successfully', { requestId, commentId: id })
    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error) {
    logger.error('Error deleting comment', error, { requestId })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
