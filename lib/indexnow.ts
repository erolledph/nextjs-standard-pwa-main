/**
 * Submit URLs to IndexNow to notify search engines of new/updated content.
 */
export async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean
  message: string
  error?: string
}> {
  try {
    // Get configuration from environment
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
    const INDEXNOW_KEY = process.env.NEXT_PUBLIC_INDEXNOW_KEY || process.env.INDEXNOW_KEY

    // Validate configuration
    if (!SITE_URL) {
      console.error("[IndexNow] Missing NEXT_PUBLIC_SITE_URL")
      return {
        success: false,
        message: "Configuration error: SITE_URL not set",
        error: "Missing SITE_URL"
      }
    }

    if (!INDEXNOW_KEY) {
      console.error("[IndexNow] Missing INDEXNOW_KEY")
      return {
        success: false,
        message: "Configuration error: INDEXNOW_KEY not set",
        error: "Missing INDEXNOW_KEY"
      }
    }

    // Validate URLs
    if (!urls || urls.length === 0) {
      console.warn("[IndexNow] No URLs provided")
      return {
        success: false,
        message: "No URLs provided",
        error: "Empty URL list"
      }
    }

    // Extract hostname correctly
    const hostname = new URL(SITE_URL).hostname
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`

    console.log("[IndexNow] Preparing submission:", {
      hostname,
      keyLength: INDEXNOW_KEY.length,
      keyPreview: INDEXNOW_KEY.substring(0, 8) + "...",
      keyLocationUrl: keyLocation,
      urlCount: urls.length,
      urls: urls,
    })

    // Prepare request payload
    const payload = {
      host: hostname,
      key: INDEXNOW_KEY,
      keyLocation: keyLocation,
      urlList: urls,
    }

    console.log("[IndexNow] Sending request to API...")

    // Send request to IndexNow API
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    })

    const statusCode = response.status
    const responseText = await response.text()

    console.log("[IndexNow] Response received:", {
      status: statusCode,
      statusText: response.statusText,
      body: responseText,
    })

    // Handle success responses (200 or 202)
    if (statusCode === 200 || statusCode === 202) {
      console.log("[IndexNow] ✅ Submission successful!")
      return {
        success: true,
        message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
      }
    }

    // Handle specific error codes
    if (statusCode === 400) {
      console.error("[IndexNow] 400 Bad Request - Invalid format")
      return {
        success: false,
        message: "Invalid request format",
        error: "Bad Request"
      }
    }

    if (statusCode === 403) {
      console.error("[IndexNow] 403 Forbidden - Invalid key or key file not found")
      return {
        success: false,
        message: "Invalid API key or verification file not accessible at " + keyLocation,
        error: "Forbidden"
      }
    }

    if (statusCode === 422) {
      console.error("[IndexNow] 422 Unprocessable Entity - URLs don't match host")
      return {
        success: false,
        message: "URLs don't match the configured host",
        error: "Unprocessable Entity"
      }
    }

    // Handle other errors
    console.error("[IndexNow] ❌ Submission failed:", statusCode)
    return {
      success: false,
      message: `Failed to submit to IndexNow (HTTP ${statusCode})`,
      error: responseText
    }
  } catch (error) {
    console.error("[IndexNow] Exception:", error)
    return {
      success: false,
      message: "Network error submitting to IndexNow",
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Helper to submit a single blog post by slug
 */
export async function submitBlogPostToIndexNow(slug: string) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    
    if (!siteUrl) {
      console.error("[IndexNow] Missing SITE_URL for blog post submission")
      return {
        success: false,
        message: "Configuration error: SITE_URL not set",
      }
    }

    const url = `${siteUrl}/blog/${slug}`
    
    console.log(`[IndexNow] Submitting blog post: ${slug}`)
    console.log(`[IndexNow] Full URL: ${url}`)
    
    const result = await submitToIndexNow([url])
    
    console.log(`[IndexNow] Blog post submission result:`, result)
    return result
  } catch (error) {
    console.error(`[IndexNow] Error submitting blog post ${slug}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Helper to submit a single recipe post by slug
 */
export async function submitRecipePostToIndexNow(slug: string) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    
    if (!siteUrl) {
      console.error("[IndexNow] Missing SITE_URL for recipe submission")
      return {
        success: false,
        message: "Configuration error: SITE_URL not set",
      }
    }

    const url = `${siteUrl}/recipes/${slug}`
    
    console.log(`[IndexNow] Submitting recipe: ${slug}`)
    console.log(`[IndexNow] Full URL: ${url}`)
    
    const result = await submitToIndexNow([url])
    
    console.log(`[IndexNow] Recipe submission result:`, result)
    return result
  } catch (error) {
    console.error(`[IndexNow] Error submitting recipe ${slug}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
