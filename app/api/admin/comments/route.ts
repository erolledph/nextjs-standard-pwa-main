import { NextRequest, NextResponse } from 'next/server'
import { firestoreQuery } from '@/lib/firebase-admin'
import logger from '@/lib/logger-pino'
import type { Comment } from '@/types/comments'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      logger.warn('Unauthorized admin comments access attempt', { requestId, ip: req.headers.get('x-forwarded-for') })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all comments (approved and pending)
    const allComments: any[] = await firestoreQuery('comments')

    // Sort by createdAt descending
    const sorted = (allComments as Comment[]).sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    logger.info('Comments fetched successfully', { requestId, count: sorted.length })
    return NextResponse.json(sorted)
  } catch (error) {
    logger.error('Error fetching comments', error, { requestId })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

