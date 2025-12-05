import { getQuotaStatus } from '@/lib/youtube'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const quotaStatus = getQuotaStatus()

    return NextResponse.json({
      status: 'success',
      data: quotaStatus,
      timestamp: new Date().toISOString(),
      message: 'YouTube API quota status retrieved successfully',
    })
  } catch (error) {
    console.error('YouTube quota error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve YouTube quota status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
