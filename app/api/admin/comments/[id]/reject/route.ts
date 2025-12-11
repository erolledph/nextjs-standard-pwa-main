import { cookies } from 'next/headers'
import { firestoreUpdate } from '@/lib/firebase-admin'

export const runtime = 'edge'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-session')

    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const commentId = resolvedParams.id

    // Soft reject - set approved to false using REST API wrapper
    await firestoreUpdate('comments', commentId, {
      approved: false,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comment rejected',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error rejecting comment:', error)
    return new Response(JSON.stringify({ error: 'Failed to reject comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
