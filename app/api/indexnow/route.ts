import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = process.env.NEXT_PUBLIC_INDEXNOW_KEY || ""
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ""
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`

// Extract host from SITE_URL (e.g., "https://worldfoodrecipes.sbs" → "worldfoodrecipes.sbs")
const HOST = SITE_URL.replace(/^https?:\/\//, "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    // Validate IndexNow key is configured
    if (!INDEXNOW_KEY) {
      console.warn("[IndexNow] API key not configured. Skipping IndexNow submission.")
      return NextResponse.json(
        { success: true, message: "IndexNow is not configured. Skipping submission." },
        { status: 200 }
      )
    }

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required and must not be empty" },
        { status: 400 }
      )
    }

    console.log("[IndexNow] Submitting to IndexNow:", {
      host: HOST,
      key: INDEXNOW_KEY.substring(0, 8) + "...",
      keyLocation: KEY_LOCATION,
      urlCount: urls.length,
      urls: urls,
    })

    // Send to IndexNow with correct format
    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "WorldFoodRecipes/1.0",
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    })

    const statusCode = response.status
    const responseText = await response.text()

    console.log("[IndexNow] Response:", {
      status: statusCode,
      body: responseText,
    })

    // Handle response
    if (statusCode === 200) {
      return NextResponse.json(
        {
          success: true,
          message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
          urls: urls,
        },
        { status: 200 }
      )
    } else if (statusCode === 400) {
      return NextResponse.json(
        {
          error: "Bad request - Invalid format",
          details: responseText,
        },
        { status: 400 }
      )
    } else if (statusCode === 403) {
      return NextResponse.json(
        {
          error: "Forbidden - Invalid API key or key file not found at " + KEY_LOCATION,
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
    } else if (statusCode === 429) {
      return NextResponse.json(
        {
          success: true, // Rate limiting is not a failure - request was received
          message: "Submission queued but rate limited - will be indexed soon",
          retryAfter: response.headers.get("Retry-After") || "60 seconds",
        },
        { status: 200 } // Return 200 since this is expected behavior
      )
    } else {
      return NextResponse.json(
        {
          error: `Unexpected response status: ${statusCode}`,
          details: responseText,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[IndexNow] Submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit to IndexNow", details: String(error) },
      { status: 500 }
    )
  }
}
