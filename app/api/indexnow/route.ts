import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const INDEXNOW_KEY = '37ced97b3f05467fa60919e05ed8b79c'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array required' },
        { status: 400 }
      )
    }

    const hostname = new URL(SITE_URL).hostname
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: hostname,
        key: INDEXNOW_KEY,
        keyLocation: keyLocation,
        urlList: urls,
      }),
    })

    const statusCode = response.status
    const responseText = await response.text()

    console.log('[IndexNow] API response:', { statusCode, body: responseText })

    if (statusCode === 200 || statusCode === 202) {
      return NextResponse.json(
        {
          success: true,
          message: `Submitted ${urls.length} URL(s)`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: `Failed (HTTP ${statusCode})`, details: responseText },
      { status: statusCode }
    )
  } catch (error) {
    console.error('[IndexNow] Error:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
