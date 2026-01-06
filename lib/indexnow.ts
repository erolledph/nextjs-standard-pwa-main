'use client'

export async function submitToIndexNow(
  urls: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('IndexNow submission failed:', data)
      return { success: false, message: data.error || 'Failed' }
    }
    console.log('IndexNow submission successful:', data)
    return { success: true, message: data.message }
  } catch (error) {
    console.error('Error submitting to IndexNow:', error)
    return { success: false, message: 'Error submitting to IndexNow' }
  }
}

/**
 * Helper to submit a single blog post by slug
 */
export async function submitBlogPostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${siteUrl}/blog/${slug}`
  return submitToIndexNow([url])
}

/**
 * Helper to submit a single recipe post by slug
 */
export async function submitRecipePostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${siteUrl}/recipes/${slug}`
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
