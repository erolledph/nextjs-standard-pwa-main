import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
// Support both standard and NEXT_PUBLIC_ keys for flexibility
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error("[IndexNow API] No URLs provided")
      return NextResponse.json(
        { error: "URLs array is required and must not be empty" },
        { status: 400 }
      )
    }

    if (!INDEXNOW_KEY || !SITE_URL) {
      console.error("[IndexNow API] Missing configuration:", {
        hasKey: !!INDEXNOW_KEY,
        hasUrl: !!SITE_URL,
      })
      return NextResponse.json(
        { error: "Server misconfiguration: Missing INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      )
    }

    // The key location must be accessible at the root
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`
    const hostname = new URL(SITE_URL).hostname

    console.log("[IndexNow API] Submitting:", {
      host: hostname,
      keyLength: INDEXNOW_KEY.length,
      keyPreview: INDEXNOW_KEY.substring(0, 8) + "...",
      keyLocation: keyLocation,
      urlCount: urls.length,
      firstUrl: urls[0],
    })

    // Send request to IndexNow API
    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: hostname,
        key: INDEXNOW_KEY,
        keyLocation: keyLocation,
        urlList: urls,
      }),
    })

    const statusCode = response.status
    const responseText = await response.text()

    console.log("[IndexNow API] Response:", {
      status: statusCode,
      statusText: response.statusText,
      body: responseText,
    })

    if (statusCode === 200 || statusCode === 202) {
      return NextResponse.json(
        {
          success: true,
          message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
        },
        { status: 200 }
      )
    } else if (statusCode === 403) {
      return NextResponse.json(
        {
          error: "Forbidden - Invalid API key or key file not found",
          keyLocation: keyLocation,
          details: responseText,
        },
        { status: 403 }
      )
    } else if (statusCode === 422) {
      return NextResponse.json(
        {
          error: "Unprocessable Entity - URLs may not belong to host",
          details: responseText,
        },
        { status: 422 }
      )
    } else {
      return NextResponse.json(
        {
          error: `Failed to submit to IndexNow (HTTP ${statusCode})`,
          details: responseText,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error("[IndexNow API] Exception:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    )
  }
}
