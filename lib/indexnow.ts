'use client'

// Retry with exponential backoff for 429 rate limit errors
async function submitWithRetry(
  urls: string[],
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<{ success: boolean; message: string }> {
  const timestamp = new Date().toISOString()
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${timestamp}] [IndexNow] Attempt ${attempt + 1}/${maxRetries + 1}: Submitting ${urls.length} URL(s)`, urls)
      
      const response = await fetch('/api/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      
      const data = await response.json()
      
      // Success
      if (response.ok) {
        console.log(`[${timestamp}] [IndexNow] ✅ Submission successful:`, data)
        return { success: true, message: data.message }
      }
      
      // 429 Rate Limit - retry with exponential backoff
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delayMs = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000 // exponential backoff + jitter
          console.warn(`[${timestamp}] [IndexNow] ⚠️ Rate limited (429). Retrying in ${delayMs}ms...`, {
            attempt,
            maxRetries,
            delayMs
          })
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue // Try again
        } else {
          console.error(`[${timestamp}] [IndexNow] ❌ Rate limit exceeded after ${maxRetries + 1} attempts`)
          return { 
            success: false, 
            message: 'IndexNow rate limit exceeded. Please try again later. Your post was saved successfully.' 
          }
        }
      }
      
      // Other errors
      console.error(`[${timestamp}] [IndexNow] ❌ Submission failed:`, {
        status: response.status,
        error: data.error,
        details: data.details
      })
      return { success: false, message: data.error || 'Failed' }
    } catch (error) {
      console.error(`[${timestamp}] [IndexNow] 💥 Error on attempt ${attempt + 1}:`, error)
      if (attempt === maxRetries) {
        return { success: false, message: 'Error submitting to IndexNow' }
      }
    }
  }
  
  return { success: false, message: 'Failed to submit after all retry attempts' }
}

export async function submitToIndexNow(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  return submitWithRetry(urls, 2, 500) // Max 2 retries with 500ms base delay
}

/**
 * Helper to submit a single blog post by slug
 */
export async function submitBlogPostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  
  // Warn if NEXT_PUBLIC_SITE_URL is not set in production
  if (!siteUrl) {
    const msg = '[IndexNow] ⚠️ NEXT_PUBLIC_SITE_URL is not set in environment - cannot submit blog post'
    console.warn(msg, { slug })
    return { success: false, message: 'NEXT_PUBLIC_SITE_URL not configured in environment' }
  }
  
  const url = `${siteUrl}/blog/${slug}`
  console.log('[IndexNow] Submitting blog post to IndexNow', { slug, url })
  return submitToIndexNow([url])
}

/**
 * Helper to submit a single recipe post by slug
 */
export async function submitRecipePostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  
  // Warn if NEXT_PUBLIC_SITE_URL is not set in production
  if (!siteUrl) {
    const msg = '[IndexNow] ⚠️ NEXT_PUBLIC_SITE_URL is not set in environment - cannot submit recipe'
    console.warn(msg, { slug })
    return { success: false, message: 'NEXT_PUBLIC_SITE_URL not configured in environment' }
  }
  
  const url = `${siteUrl}/recipes/${slug}`
  console.log('[IndexNow] Submitting recipe to IndexNow', { slug, url })
  return submitToIndexNow([url])
}

/**
 * Helper to submit multiple posts by slug
 */
export async function submitMultiplePostsToIndexNow(
  slugs: string[],
  type: 'blog' | 'recipes' = 'blog'
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const urls = slugs.map((slug) => `${siteUrl}/${type}/${slug}`)
  return submitToIndexNow(urls)
}
