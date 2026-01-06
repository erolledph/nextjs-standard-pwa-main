'use client'

// Client-side request deduplication to prevent duplicate submissions
const pendingRequests = new Map<string, Promise<{ success: boolean; message: string }>>()

async function submitWithoutRetry(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  const timestamp = new Date().toISOString()
  
  try {
    console.log(`[${timestamp}] [IndexNow] Submitting ${urls.length} URL(s) to IndexNow`, urls)
    
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
    
    // 429 Rate Limit - don't retry on client, let server handle it
    if (response.status === 429) {
      console.error(`[${timestamp}] [IndexNow] ❌ Rate limit exceeded (429)`)
      return { 
        success: false, 
        message: 'IndexNow rate limit exceeded. Please try again later. Your post was saved successfully.' 
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
    console.error(`[${timestamp}] [IndexNow] 💥 Error:`, error)
    return { success: false, message: 'Error submitting to IndexNow' }
  }
}

export async function submitToIndexNow(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  // Create a deduplication key based on sorted URLs
  const dedupeKey = JSON.stringify(urls.sort())
  
  // Return existing pending request if one is in flight
  if (pendingRequests.has(dedupeKey)) {
    console.log('[IndexNow] Returning existing pending request for:', dedupeKey)
    return pendingRequests.get(dedupeKey)!
  }
  
  // Create new request and store it
  const request = submitWithoutRetry(urls).finally(() => {
    // Clean up pending request after completion
    pendingRequests.delete(dedupeKey)
  })
  
  pendingRequests.set(dedupeKey, request)
  return request
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
