import { NextRequest, NextResponse } from 'next/server'
import { firestoreQuery } from '@/lib/firebase-admin'
import type { Comment } from '@/types/comments'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
      return NextResponse.json(
        { error: 'postSlug parameter is required' },
        { status: 400 }
      )
    }

    // Fetch all comments
    const allComments = await firestoreQuery('comments')
    
    // Filter for this post slug and approved comments
    const comments = allComments.filter(
      (c: any) => c.postSlug === postSlug && c.approved === true
    ) as Comment[]

    // Sort by createdAt descending
    comments.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    // Fallback: return empty array on error
    return NextResponse.json([])
  }
}

