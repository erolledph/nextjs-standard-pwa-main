'use client'

export async function submitToIndexNow(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  const timestamp = new Date().toISOString()
  
  try {
    console.log(`[${timestamp}] [IndexNow] Submitting ${urls.length} URL(s)`, urls)
    
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error(`[${timestamp}] [IndexNow] ❌ Submission failed:`, {
        status: response.status,
        error: data.error,
        details: data.details
      })
      return { success: false, message: data.error || 'Failed' }
    }
    
    console.log(`[${timestamp}] [IndexNow] ✅ Submission successful:`, data)
    return { success: true, message: data.message }
  } catch (error) {
    console.error(`[${timestamp}] [IndexNow] 💥 Error:`, error)
    return { success: false, message: 'Error submitting to IndexNow' }
  }
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
