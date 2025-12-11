import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos, getQuotaStatus } from '@/lib/youtube';

// Configure for Cloudflare Pages Edge Runtime
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const pageToken = searchParams.get('pageToken');

    if (!query) {
      return NextResponse.json(
        { status: 'error', message: 'Search query is required' },
        { status: 400 }
      );
    }

    const result = await searchYouTubeVideos(query, pageToken || undefined);
    const quotaStatus = getQuotaStatus();

    return NextResponse.json({
      status: 'success',
      videos: result.videos,
      nextPageToken: result.nextPageToken,
      source: result.source,
      quota: {
        used: quotaStatus.used,
        limit: quotaStatus.limit,
        remaining: quotaStatus.remaining,
        percentUsed: quotaStatus.percentUsed,
        status: quotaStatus.status,
        estimatedSearchesRemaining: quotaStatus.estimatedSearchesRemaining,
      },
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch videos',
      },
      { status: 500 }
    );
  }
}

