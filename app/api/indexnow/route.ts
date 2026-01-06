import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const INDEXNOW_KEY = '37ced97b3f05467fa60919e05ed8b79c'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

export async function POST(request: NextRequest) {
  try {
    console.log('[IndexNow] API Route Called')
    console.log('[IndexNow] SITE_URL from env:', SITE_URL)
    console.log('[IndexNow] INDEXNOW_KEY:', INDEXNOW_KEY.substring(0, 8) + '...')
    
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error('[IndexNow] No URLs provided')
      return NextResponse.json(
        { error: 'URLs array required' },
        { status: 400 }
      )
    }

    if (!SITE_URL) {
      console.error('[IndexNow] CRITICAL: SITE_URL not configured in environment')
      return NextResponse.json(
        { error: 'Server configuration error: SITE_URL not set' },
        { status: 500 }
      )
    }

    const hostname = new URL(SITE_URL).hostname
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`

    console.log('========== INDEXNOW API REQUEST ==========')
    console.log('Host:', hostname)
    console.log('Key Location:', keyLocation)
    console.log('URLs to submit:', urls)
    console.log('=========================================')

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

    console.log('========== INDEXNOW API RESPONSE ==========')
    console.log('Status Code:', statusCode)
    console.log('Response Body:', responseText)
    console.log('=========================================')

    if (statusCode === 200 || statusCode === 202) {
      console.log('[IndexNow] ✅ SUCCESS - URLs submitted to IndexNow')
      return NextResponse.json(
        {
          success: true,
          message: `Submitted ${urls.length} URL(s)`,
        },
        { status: 200 }
      )
    }

    // Detailed error logging for non-success responses
    console.error('[IndexNow] ❌ FAILED - Status:', statusCode, 'Response:', responseText)
    
    if (statusCode === 403) {
      console.error('[IndexNow] 403 Forbidden - Check if:')
      console.error('  - Key file exists: ' + keyLocation)
      console.error('  - Key matches: ' + INDEXNOW_KEY)
      console.error('  - File is accessible publicly')
    }
    
    if (statusCode === 422) {
      console.error('[IndexNow] 422 Unprocessable - URLs may not match host:')
      console.error('  - Host expected: ' + hostname)
      console.error('  - URLs provided:', urls)
    }

    return NextResponse.json(
      { error: `Failed (HTTP ${statusCode})`, details: responseText },
      { status: statusCode }
    )
  } catch (error) {
    console.error('[IndexNow] Exception:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
