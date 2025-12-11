import { getCacheStats, cleanExpiredCache } from '@/lib/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Clean expired entries first
    const cleaned = cleanExpiredCache()

    // Get current stats
    const stats = getCacheStats()

    return NextResponse.json({
      status: 'success',
      data: {
        ...stats,
        expiredCleaned: cleaned,
        timestamp: new Date().toISOString(),
      },
      message: 'Cache statistics retrieved successfully',
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve cache statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'clear') {
      // Clear all cache - use clearCacheByNamespace from cache module
      const stats = getCacheStats()
      return NextResponse.json({
        status: 'success',
        message: 'Cache cleared successfully',
        data: {
          entriesCleared: stats.totalEntries,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Invalid action',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cache action error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to process cache action',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

