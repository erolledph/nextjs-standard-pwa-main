/**
 * Simple cache layer for GitHub API responses
 * Prevents hitting GitHub API rate limits (5000 requests/hour)
 * 
 * Cache strategy:
 * - Posts list: 5 minutes
 * - Individual posts: 1 hour
 * - Max cache size: 100 entries (prevents memory leaks)
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry<any>>()

export interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  maxSize?: number
}

/**
 * Content-type specific TTL configurations
 * Different content has different volatility and generation costs
 */
export const CACHE_TTL = {
  // User-generated content - volatile, frequently updated
  USER_CONTENT: 3 * 60 * 1000, // 3 minutes
  // Regular blog posts - relatively stable
  BLOG_POSTS: 30 * 60 * 1000, // 30 minutes
  // Recipes - stable, manually curated
  RECIPES: 60 * 60 * 1000, // 1 hour
  // AI-generated content - expensive to generate, cache longer
  AI_GENERATED: 2 * 60 * 60 * 1000, // 2 hours
  // Search results - dynamic, shorter TTL
  SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
  // Static data (tags, categories) - very stable
  STATIC_DATA: 24 * 60 * 60 * 1000, // 24 hours
  // YouTube API data - relatively stable
  YOUTUBE_DATA: 2 * 60 * 60 * 1000, // 2 hours
  // GitHub content - stable unless updated
  GITHUB_CONTENT: 30 * 60 * 1000, // 30 minutes
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: CACHE_TTL.BLOG_POSTS, // 30 minutes default
  maxSize: 100
}

/**
 * Get appropriate TTL for content type
 */
export function getCacheTtl(contentType: keyof typeof CACHE_TTL): number {
  return CACHE_TTL[contentType] || DEFAULT_CONFIG.ttl
}

/**
 * Generate cache key from function args
 */
function generateKey(namespace: string, ...args: any[]): string {
  return `${namespace}:${JSON.stringify(args)}`
}

/**
 * Get cached value if not expired
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  const now = Date.now()
  const age = now - entry.timestamp

  // Check if expired
  if (age > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set cache value
 */
export function setCached<T>(key: string, data: T, config: CacheConfig = {}): void {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Simple LRU: if cache is full, delete oldest entries
  if (cache.size >= mergedConfig.maxSize) {
    const firstKey = cache.keys().next().value
    if (firstKey) {
      cache.delete(firstKey)
    }
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: mergedConfig.ttl
  })
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  cache.delete(key)
}

/**
 * Clear all cache entries for a namespace
 */
export function clearCacheByNamespace(namespace: string): void {
  const keys = Array.from(cache.keys()).filter(k => k.startsWith(`${namespace}:`))
  keys.forEach(k => cache.delete(k))
}

/**
 * Get cache stats (for monitoring)
 */
export function getCacheStats() {
  const now = Date.now()
  let validEntries = 0
  let expiredEntries = 0

  for (const [, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > entry.ttl) {
      expiredEntries++
    } else {
      validEntries++
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    maxSize: DEFAULT_CONFIG.maxSize,
    memoryUsage: `~${Math.round((cache.size * 1024) / 1024)}KB (estimate)`
  }
}

/**
 * Clear all expired entries (run periodically)
 */
export function cleanExpiredCache(): number {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > entry.ttl) {
      cache.delete(key)
      cleaned++
    }
  }

  return cleaned
}

/**
 * Cached fetch helper with content-type aware TTL
 * 
 * @example
 * // Cache blog post with 30-minute TTL
 * const post = await cachedFetch<BlogPost>(url, {
 *   cacheKey: `blog:${slug}`,
 *   cacheTtl: getCacheTtl('BLOG_POSTS')
 * })
 * 
 * // Cache recipe with 1-hour TTL
 * const recipe = await cachedFetch<Recipe>(url, {
 *   cacheKey: `recipe:${id}`,
 *   cacheTtl: getCacheTtl('RECIPES')
 * })
 * 
 * // Cache AI-generated content with 2-hour TTL
 * const aiContent = await cachedFetch<AIContent>(url, {
 *   cacheKey: `ai:${prompt}`,
 *   cacheTtl: getCacheTtl('AI_GENERATED')
 * })
 */
export async function cachedFetch<T>(
  url: string,
  options?: {
    cacheKey?: string
    cacheTtl?: number
    fetchOptions?: RequestInit
  }
): Promise<T> {
  const cacheKey = options?.cacheKey || `fetch:${url}`

  // Try to get from cache
  const cached = getCached<T>(cacheKey)
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`)
    return cached
  }

  console.log(`[Cache MISS] ${cacheKey}`)

  // Fetch from source
  const response = await fetch(url, options?.fetchOptions)

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as T

  // Cache the result
  setCached(cacheKey, data, {
    ttl: options?.cacheTtl || DEFAULT_CONFIG.ttl
  })

  return data
}
