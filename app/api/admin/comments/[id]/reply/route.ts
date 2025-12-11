import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}')

let adminApp = getApps().length > 0 ? getApps()[0] : null

if (!adminApp && serviceAccount.project_id) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    if (!adminApp) {
      return new Response(JSON.stringify({ error: 'Firebase not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const db = getAdminFirestore(adminApp)
    const commentId = params.id
    const replyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create reply
    await db.collection('comments').doc(replyId).set({
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
