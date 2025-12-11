import { cookies } from 'next/headers'
import { firestoreAdd } from '@/lib/firebase-admin'

export const runtime = 'edge'

export async function POST(
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

    const { content, postSlug } = await request.json()

    if (!content?.trim()) {
      return new Response(JSON.stringify({ error: 'Reply content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const commentId = resolvedParams.id
    const replyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create reply using REST API wrapper
    await firestoreAdd('comments', {
      id: replyId,
      author: 'Admin',
      email: 'admin@example.com',
      content: content.trim(),
      postSlug: postSlug || 'unknown',
      parentId: commentId,
      approved: true,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        replyId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error posting reply:', error)
    return new Response(JSON.stringify({ error: 'Failed to post reply' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
