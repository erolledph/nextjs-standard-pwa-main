/**
 * Helper functions to submit URLs to search engines
 * Used for automatic indexing of new content
 */

import { logger } from "@/lib/logger"

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
      logger.error("[IndexNow Submission Failed]", {
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

    logger.info("[IndexNow Submission Success]", {
      urls,
      message: data.message,
    })

    return {
      success: true,
      service: "IndexNow",
      message: data.message,
    }
  } catch (error) {
    logger.error("[IndexNow Submission Error]", {
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
      logger.error("[Bing Submission Failed]", {
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

    logger.info("[Bing Submission Success]", {
      urls,
      message: data.message,
    })

    return {
      success: true,
      service: "Bing",
      message: data.message,
    }
  } catch (error) {
    logger.error("[Bing Submission Error]", {
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
    logger.warn("[Search Engine Submission] No URLs provided")
    return {
      success: false,
      message: "No URLs provided for submission",
    }
  }

  logger.info("[Search Engine Submission] Starting", {
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
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  const summary = {
    type,
    urls,
    totalServices: results.length,
    successful: successful.length,
    failed: failed.length,
    results: results,
    message:
      successful.length > 0
        ? `Successfully submitted to ${successful.map(r => r.service).join(", ")}`
        : "Failed to submit to search engines",
  }

  logger.info("[Search Engine Submission] Complete", summary)

  return summary
}
