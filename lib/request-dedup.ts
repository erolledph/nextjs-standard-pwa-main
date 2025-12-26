/**
 * Request deduplication utility
 * Prevents duplicate API requests within a time window
 * Critical for rate-limited APIs (Gemini: 20/day, YouTube: 10k units/day)
 */

export interface RequestCache {
  key: string
  data: any
  timestamp: number
  ttl: number
}

export interface DeduplicationConfig {
  defaultTTL: number // milliseconds
  maxSize: number // max cached requests
}

const defaultConfig: DeduplicationConfig = {
  defaultTTL: 1000 * 60 * 5, // 5 minutes
  maxSize: 1000
}

class RequestDeduplicator {
  private cache: Map<string, RequestCache> = new Map()
  private config: DeduplicationConfig

  constructor(config?: Partial<DeduplicationConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Generate cache key from request params
   */
  private generateKey(namespace: string, params: any): string {
    const paramsStr = JSON.stringify(params).split('').sort().join('')
    return `${namespace}:${paramsStr}`
  }

  /**
   * Check if request is cached and valid
   */
  get<T>(namespace: string, params: any): T | null {
    const key = this.generateKey(namespace, params)
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Store request result in cache
   */
  set<T>(namespace: string, params: any, data: T, ttl?: number): void {
    // Cleanup if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const key = this.generateKey(namespace, params)
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    })
  }

  /**
   * Execute request with automatic deduplication
   */
  async execute<T>(
    namespace: string,
    params: any,
    executor: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(namespace, params)
    if (cached !== null) {
      return cached
    }

    // Execute request
    const result = await executor()

    // Store in cache
    this.set(namespace, params, result, ttl)

    return result
  }

  /**
   * Manually invalidate cache entry
   */
  invalidate(namespace: string, params?: any): void {
    if (params) {
      const key = this.generateKey(namespace, params)
      this.cache.delete(key)
    } else {
      // Invalidate all keys in namespace
      for (const [key] of this.cache.entries()) {
        if (key.startsWith(`${namespace}:`)) {
          this.cache.delete(key)
        }
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number
    entries: Array<{ key: string; age: number; ttl: number }>
  } {
    const entries = Array.from(this.cache.values()).map((entry) => ({
      key: entry.key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl
    }))

    return {
      size: this.cache.size,
      entries
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldest: [string, RequestCache] | null = null
    let oldestAge = 0

    for (const entry of this.cache.entries()) {
      const age = Date.now() - entry[1].timestamp
      if (age > oldestAge) {
        oldestAge = age
        oldest = entry
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0])
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}

// Singleton instance
const deduplicator = new RequestDeduplicator()

/**
 * Deduplicate Gemini API calls (20/day quota)
 */
export async function deduplicateGeminiRequest<T>(
  prompt: string,
  executor: () => Promise<T>
): Promise<T> {
  // Cache Gemini results for 24 hours (quota resets daily)
  return deduplicator.execute('gemini', { prompt }, executor, 1000 * 60 * 60 * 24)
}

/**
 * Deduplicate YouTube API calls (10k units/day quota)
 */
export async function deduplicateYouTubeRequest<T>(
  query: string,
  executor: () => Promise<T>,
  ttlMinutes: number = 30
): Promise<T> {
  return deduplicator.execute('youtube', { query }, executor, 1000 * 60 * ttlMinutes)
}

/**
 * Deduplicate GitHub API calls
 */
export async function deduplicateGitHubRequest<T>(
  endpoint: string,
  params: any,
  executor: () => Promise<T>,
  ttlMinutes: number = 5
): Promise<T> {
  return deduplicator.execute('github', { endpoint, params }, executor, 1000 * 60 * ttlMinutes)
}

/**
 * Deduplicate Firebase queries
 */
export async function deduplicateFirebaseQuery<T>(
  collection: string,
  params: any,
  executor: () => Promise<T>,
  ttlMinutes: number = 10
): Promise<T> {
  return deduplicator.execute('firebase', { collection, params }, executor, 1000 * 60 * ttlMinutes)
}

/**
 * Get deduplicator instance for advanced usage
 */
export function getDeduplicator(): RequestDeduplicator {
  return deduplicator
}

export default {
  deduplicateGeminiRequest,
  deduplicateYouTubeRequest,
  deduplicateGitHubRequest,
  deduplicateFirebaseQuery,
  getDeduplicator
}
