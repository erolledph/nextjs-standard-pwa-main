/**
 * Submit URLs to IndexNow to notify search engines of new/updated content.
 */
export async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await fetch("/api/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("IndexNow submission failed:", data)
      return {
        success: false,
        message: data.error || "Failed to submit to IndexNow",
      }
    }

    return {
      success: true,
      message: data.message,
    }
  } catch (error) {
    console.error("Error submitting to IndexNow:", error)
    return {
      success: false,
      message: "Network error submitting to IndexNow",
    }
  }
}

/**
 * Helper to submit a single blog post by slug
 */
export async function submitBlogPostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const url = `${siteUrl}/blog/${slug}`
  return submitToIndexNow([url])
}

/**
 * Helper to submit a single recipe post by slug
 */
export async function submitRecipePostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const url = `${siteUrl}/recipes/${slug}`
  return submitToIndexNow([url])
}
