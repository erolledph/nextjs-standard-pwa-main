export const runtime = 'edge'

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}')

let adminApp = getApps().length > 0 ? getApps()[0] : null

if (!adminApp && serviceAccount.project_id) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  })
}

export async function PATCH(
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

    if (!adminApp) {
      return new Response(JSON.stringify({ error: 'Firebase not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const db = getFirestore(adminApp)
    const commentId = params.id

    // Soft reject - set approved to false
    await db.collection('comments').doc(commentId).update({
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
