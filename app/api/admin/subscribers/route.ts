import { NextRequest, NextResponse } from 'next/server'
import { firestoreQuery } from '@/lib/firebase-admin'
import type { Subscriber } from '@/types/subscribers'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    // Verify admin session via cookie
    const sessionCookie = req.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all subscribers
    const allSubscribers: any[] = await firestoreQuery('subscribers')

    // Sort by subscribedAt descending
    const sorted = (allSubscribers as Subscriber[]).sort((a, b) => {
      const dateA = a.subscribedAt instanceof Date ? a.subscribedAt : new Date(a.subscribedAt)
      const dateB = b.subscribedAt instanceof Date ? b.subscribedAt : new Date(b.subscribedAt)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(sorted)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

