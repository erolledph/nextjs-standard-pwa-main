export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { firestoreDelete } from '@/lib/firebase-admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete comment
    const success = await firestoreDelete('comments', id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
