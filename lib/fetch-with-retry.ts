/**
 * Fetch with exponential backoff retry logic
 * Provides automatic retry on transient failures with exponential backoff
 * 
 * Usage:
 * const response = await fetchWithRetry('/api/recipes', { maxRetries: 3 })
 */

interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number
  baseDelay?: number // milliseconds
  timeout?: number // milliseconds
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  timeout: number
}

/**
 * Determines if an error is retryable
 * Retryable errors: network failures, timeouts, 429 (rate limit), 5xx server errors
 * Non-retryable errors: 4xx client errors (except 429), invalid input
 */
function isRetryableError(error: unknown, status?: number): boolean {
  // Network errors are retryable
  if (error instanceof TypeError) {
    const message = (error as Error).message.toLowerCase()
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed') ||
      message.includes('abort')
    )
  }

  // HTTP status-based retry logic
  if (status) {
    // 429 (Too Many Requests) and 5xx errors are retryable
    return status === 429 || (status >= 500 && status < 600)
  }

  return false
}

/**
 * Calculate exponential backoff delay with jitter
 * Formula: min(baseDelay * 2^attempt + random(0, baseDelay), maxDelay)
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number = 30000
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * baseDelay
  return Math.min(exponentialDelay + jitter, maxDelay)
}

/**
 * Fetch with automatic retry on transient failures
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options + retry configuration
 * @returns Promise<Response>
 * @throws TypeError if all retries are exhausted
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options

  const config: RetryConfig = {
    maxRetries,
    baseDelay,
    timeout,
  }

  let lastError: Error | null = null
  let lastStatus: number | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Check if response is retryable error
        if (!response.ok && isRetryableError(null, response.status)) {
          lastStatus = response.status

          // If this is the last attempt, throw the error
          if (attempt === config.maxRetries) {
            throw new Error(
              `HTTP ${response.status} after ${config.maxRetries} retries`
            )
          }

          // Wait before retrying
          const delay = calculateBackoffDelay(attempt, config.baseDelay)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // Success or non-retryable error
        return response
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (!isRetryableError(error, lastStatus ?? undefined)) {
        // Non-retryable error, throw immediately
        throw error
      }

      // If this is the last attempt, throw
      if (attempt === config.maxRetries) {
        throw error
      }

      // Wait before retrying with exponential backoff
      const delay = calculateBackoffDelay(attempt, config.baseDelay)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but just in case
  throw (
    lastError || new Error(`Failed to fetch ${url} after ${config.maxRetries} retries`)
  )
}

/**
 * Fetch JSON with retry
 * Combines fetchWithRetry with JSON parsing
 */
export async function fetchJsonWithRetry<T = unknown>(
  url: string,
  options?: FetchWithRetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, options)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
