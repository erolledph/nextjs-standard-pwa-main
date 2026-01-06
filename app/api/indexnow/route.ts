import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const INDEXNOW_KEY = '37ced97b3f05467fa60919e05ed8b79c'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

// Helper for logging in edge runtime
function logIndexNow(level: 'info' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [IndexNow] [${level.toUpperCase()}] ${message}`
  
  if (data) {
    if (level === 'error') {
      console.error(logMessage, data)
    } else {
      console.log(logMessage, data)
    }
  } else {
    if (level === 'error') {
      console.error(logMessage)
    } else {
      console.log(logMessage)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    logIndexNow('info', 'API Route Called')
    logIndexNow('info', `SITE_URL from env: ${SITE_URL || 'NOT SET'}`)
    logIndexNow('info', `INDEXNOW_KEY: ${INDEXNOW_KEY.substring(0, 8)}...`)
    
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      logIndexNow('error', 'No URLs provided')
      return NextResponse.json(
        { error: 'URLs array required', success: false },
        { status: 400 }
      )
    }

    if (!SITE_URL) {
      logIndexNow('error', 'CRITICAL: SITE_URL not configured in environment')
      return NextResponse.json(
        { error: 'Server configuration error: NEXT_PUBLIC_SITE_URL not set in Cloudflare Pages environment variables', success: false },
        { status: 500 }
      )
    }

    const hostname = new URL(SITE_URL).hostname
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`

    logIndexNow('info', 'IndexNow API Request', {
      host: hostname,
      keyLocation: keyLocation,
      urlsCount: urls.length,
      urls: urls
    })

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

    logIndexNow('info', `IndexNow API Response - Status: ${statusCode}`, { body: responseText })

    if (statusCode === 200 || statusCode === 202) {
      logIndexNow('info', `✅ SUCCESS - Submitted ${urls.length} URL(s) to IndexNow`)
      return NextResponse.json(
        {
          success: true,
          message: `Submitted ${urls.length} URL(s) to IndexNow`,
        },
        { status: 200 }
      )
    }

    // Detailed error logging for non-success responses
    logIndexNow('error', `Failed with status ${statusCode}`, {
      responseText,
      host: hostname,
      urls: urls
    })
    
    if (statusCode === 403) {
      logIndexNow('error', '403 Forbidden - Verification file missing or key incorrect', {
        expectedKeyLocation: keyLocation,
        expectedKey: INDEXNOW_KEY.substring(0, 8) + '...'
      })
    }
    
    if (statusCode === 422) {
      logIndexNow('error', '422 Unprocessable - URL host mismatch', {
        expectedHost: hostname,
        providedUrls: urls
      })
    }

    return NextResponse.json(
      { 
        error: `Failed (HTTP ${statusCode})`, 
        details: responseText,
        success: false
      },
      { status: statusCode }
    )
  } catch (error) {
    logIndexNow('error', 'Exception in IndexNow API', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 500 }
    )
  }
}
