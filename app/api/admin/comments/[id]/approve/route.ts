export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { firestoreUpdate } from '@/lib/firebase-admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('session')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Update comment to approved
    const success = await firestoreUpdate('comments', id, {
      approved: true,
    })

    if (!success) {
      return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Comment approved' })
  } catch (error) {
    console.error('Error approving comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
