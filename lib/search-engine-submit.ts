/**
 * Helper functions to submit URLs to search engines
 * Used for automatic indexing of new content
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ""

/**
 * Submit blog post slug to IndexNow and Bing
 */
export async function submitBlogPostToSearchEngines(slug: string) {
  const url = `${SITE_URL}/blog/${slug}`
  return submitToSearchEngines([url], "blog")
}

/**
 * Submit recipe post slug to IndexNow and Bing
 */
export async function submitRecipePostToSearchEngines(slug: string) {
  const url = `${SITE_URL}/recipes/${slug}`
  return submitToSearchEngines([url], "recipe")
}

/**
 * Submit multiple URLs to IndexNow
 */
async function submitToIndexNow(urls: string[]) {
  try {
    const response = await fetch("/api/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[IndexNow Submission Failed]", {
        status: response.status,
        error: data.error,
        details: data.details,
      })
      return {
        success: false,
        service: "IndexNow",
        error: data.error,
      }
    }

    console.info("[IndexNow Submission Success]", {
      urls,
      message: data.message,
    })

    return {
      success: true,
      service: "IndexNow",
      message: data.message,
    }
  } catch (error) {
    console.error("[IndexNow Submission Error]", {
      urls,
      error: String(error),
    })
    return {
      success: false,
      service: "IndexNow",
      error: `IndexNow submission failed: ${String(error)}`,
    }
  }
}

/**
 * Submit multiple URLs to Bing Webmaster Tools
 */
async function submitToBingWebmaster(urls: string[]) {
  try {
    const response = await fetch("/api/bing-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Bing Submission Failed]", {
        status: response.status,
        error: data.error,
        details: data.details,
      })
      return {
        success: false,
        service: "Bing",
        error: data.error,
      }
    }

    console.info("[Bing Submission Success]", {
      urls,
      message: data.message,
    })

    return {
      success: true,
      service: "Bing",
      message: data.message,
    }
  } catch (error) {
    console.error("[Bing Submission Error]", {
      urls,
      error: String(error),
    })
    return {
      success: false,
      service: "Bing",
      error: `Bing submission failed: ${String(error)}`,
    }
  }
}

/**
 * Submit URLs to all configured search engines
 */
export async function submitToSearchEngines(
  urls: string[],
  type: "blog" | "recipe" | "ai-recipe"
) {
  if (!urls || urls.length === 0) {
    console.warn("[Search Engine Submission] No URLs provided")
    return {
      success: false,
      message: "No URLs provided for submission",
      successful: 0,
      failed: 0,
    }
  }

  console.info("[Search Engine Submission] Starting", {
    type,
    urlCount: urls.length,
    urls,
  })

  // Submit to both IndexNow and Bing in parallel
  const [indexNowResult, bingResult] = await Promise.all([
    submitToIndexNow(urls),
    submitToBingWebmaster(urls),
  ])

  const results = [indexNowResult, bingResult].filter(r => r !== null)
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  const summary = {
    type,
    urls,
    totalServices: results.length,
    successful,
    failed,
    results: results,
    message:
      successful > 0
        ? `Successfully submitted to ${results.filter(r => r.success).map(r => r.service).join(", ")}`
        : "Failed to submit to search engines",
  }

  console.info("[Search Engine Submission] Complete", summary)

  return summary
}
