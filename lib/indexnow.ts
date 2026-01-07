'use client'

// Client-side request deduplication to prevent duplicate submissions
const pendingRequests = new Map<string, Promise<{ success: boolean; message: string }>>()

// Track failed submissions to implement exponential backoff
const failedSubmissions = new Map<string, { count: number; nextRetryTime: number }>()

// Key for tracking rate limit state
const RATE_LIMIT_KEY = '__indexnow_rate_limited'
const RATE_LIMIT_RESET_TIME_KEY = '__indexnow_rate_limit_reset'

/**
 * Check if we're currently rate limited
 */
function isClientRateLimited(): boolean {
  if (typeof window === 'undefined') return false
  
  const rateLimited = sessionStorage.getItem(RATE_LIMIT_KEY)
  if (!rateLimited) return false
  
  const resetTime = parseInt(sessionStorage.getItem(RATE_LIMIT_RESET_TIME_KEY) || '0', 10)
  const now = Date.now()
  
  if (now >= resetTime) {
    // Reset has expired
    sessionStorage.removeItem(RATE_LIMIT_KEY)
    sessionStorage.removeItem(RATE_LIMIT_RESET_TIME_KEY)
    return false
  }
  
  return true
}

/**
 * Mark us as rate limited
 */
function setClientRateLimited(retryAfterSeconds: number): void {
  if (typeof window === 'undefined') return
  
  sessionStorage.setItem(RATE_LIMIT_KEY, 'true')
  sessionStorage.setItem(RATE_LIMIT_RESET_TIME_KEY, String(Date.now() + retryAfterSeconds * 1000))
}

async function submitWithoutRetry(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  const timestamp = new Date().toISOString()
  
  // Check client-side rate limit
  if (isClientRateLimited()) {
    console.warn(`[${timestamp}] [IndexNow] ⏸ Client rate limited - skipping submission`)
    return { 
      success: false, 
      message: 'IndexNow rate limit exceeded. Please try again later. Your post was saved successfully.' 
    }
  }
  
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
    
    // 429 Rate Limit - set client-side rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 300
      setClientRateLimited(retryAfterSeconds)
      
      console.error(`[${timestamp}] [IndexNow] ❌ Rate limit exceeded (429) - rate limited for ${retryAfterSeconds}s`)
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
