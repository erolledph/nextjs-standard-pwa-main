import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = process.env.NEXT_PUBLIC_INDEXNOW_KEY || process.env.INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required and must not be empty" },
        { status: 400 }
      )
    }

    if (!INDEXNOW_KEY || !SITE_URL) {
      console.error("Missing configuration: INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL")
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      )
    }

    // The key location must be accessible at the root
    // Ensure no double slashes if SITE_URL has a trailing slash
    const safeSiteUrl = SITE_URL.replace(/\/$/, "")
    const keyLocation = `${safeSiteUrl}/${INDEXNOW_KEY}.txt`
    const host = new URL(SITE_URL).hostname

    console.log("[IndexNow] Submitting:", {
      host: host,
      urlCount: urls.length,
      urls: urls,
    })

    // Send request to IndexNow API
    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: host,
        key: INDEXNOW_KEY,
        keyLocation: keyLocation,
        urlList: urls,
      }),
    })

    const statusCode = response.status
    const responseText = await response.text()

    if (statusCode === 200 || statusCode === 202) {
      return NextResponse.json(
        {
          success: true,
          message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
        },
        { status: 200 }
      )
    } else {
      console.error("[IndexNow] Error:", statusCode, responseText)
      return NextResponse.json(
        {
          error: "Failed to submit to IndexNow",
          details: responseText,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error("[IndexNow] Exception:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
