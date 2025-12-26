/**
 * Web Vitals tracking and reporting
 * Tracks Core Web Vitals: LCP, FID, CLS, FCP, TTFB
 * 
 * Integrates with web-vitals library to measure real user metrics
 * Reports metrics to analytics endpoint for monitoring
 */

export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType?: string
}

/**
 * Web Vitals thresholds (in milliseconds for time, dimensionless for others)
 * Based on Google's Core Web Vitals recommendations
 * https://web.dev/articles/vitals/
 */
const VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: { good: 2500, needsImprovement: 4000 },
  // First Input Delay (FID) - replaced by INP but kept for compatibility
  FID: { good: 100, needsImprovement: 300 },
  // Interaction to Next Paint (INP)
  INP: { good: 200, needsImprovement: 500 },
  // Cumulative Layout Shift (CLS)
  CLS: { good: 0.1, needsImprovement: 0.25 },
  // First Contentful Paint (FCP)
  FCP: { good: 1800, needsImprovement: 3000 },
  // Time to First Byte (TTFB)
  TTFB: { good: 800, needsImprovement: 1800 },
}

/**
 * Rate a metric as good, needs improvement, or poor
 */
function rateMetric(name: string, value: number): WebVitalsMetric['rating'] {
  const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
  if (!threshold) return 'needs-improvement'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

/**
 * Report Web Vitals to analytics endpoint
 * Sends metrics to /api/analytics/web-vitals for server-side tracking
 */
async function reportMetric(metric: WebVitalsMetric): Promise<void> {
  try {
    // Use sendBeacon if available (doesn't block page unload)
    if (navigator.sendBeacon) {
      const data = JSON.stringify(metric)
      navigator.sendBeacon('/api/analytics/web-vitals', data)
    } else {
      // Fallback to fetch with keepalive
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently fail if endpoint doesn't exist
      })
    }
  } catch (error) {
    // Silently fail - don't break app if analytics fails
    if (process.env.NODE_ENV === 'development') {
      console.debug('Web Vitals report failed:', error)
    }
  }
}

/**
 * Initialize Web Vitals tracking
 * Should be called once in app layout or root component
 * 
 * Note: Requires 'web-vitals' package to be installed
 * Install with: pnpm add web-vitals
 * 
 * @param options - Configuration options
 */
export async function initWebVitals(options?: {
  reportEndpoint?: string
  sample?: number // Sample rate 0-1, default 1 (100%)
}): Promise<void> {
  // Skip on server-side
  if (typeof window === 'undefined') return

  // Apply sampling
  const sampleRate = options?.sample ?? 1
  if (Math.random() > sampleRate) return

  try {
    // Dynamically import web-vitals library
    // This is optional - if not installed, tracking simply won't run
    let webVitals: any
    try {
      // @ts-expect-error - web-vitals is an optional dependency
      webVitals = await import('web-vitals')
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.info(
          'web-vitals tracking disabled. Install with: pnpm add web-vitals'
        )
      }
      return
    }

    const { getCLS, getFCP, getFID, getLCP, getTTFB } = webVitals

    // Track LCP (Largest Contentful Paint)
    getLCP((metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        name: 'LCP',
        value: metric.value,
        rating: rateMetric('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
      reportMetric(enhancedMetric)
    })

    // Track FID (First Input Delay)
    getFID((metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        name: 'FID',
        value: metric.value,
        rating: rateMetric('FID', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
      reportMetric(enhancedMetric)
    })

    // Track CLS (Cumulative Layout Shift)
    getCLS((metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        name: 'CLS',
        value: metric.value,
        rating: rateMetric('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
      reportMetric(enhancedMetric)
    })

    // Track FCP (First Contentful Paint)
    getFCP((metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        name: 'FCP',
        value: metric.value,
        rating: rateMetric('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
      reportMetric(enhancedMetric)
    })

    // Track TTFB (Time to First Byte)
    getTTFB((metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: rateMetric('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
      reportMetric(enhancedMetric)
    })
  } catch (error) {
    // Silently fail if web-vitals library isn't available
    if (process.env.NODE_ENV === 'development') {
      console.debug('Web Vitals init failed:', error)
    }
  }
}

/**
 * Get current Web Vitals data from Performance API
 * Can be used for real-time monitoring in development
 */
export function getWebVitalsSnapshot(): Record<string, number> {
  if (typeof window === 'undefined' || !window.performance) {
    return {}
  }

  const snapshot: Record<string, number> = {}
  const paintEntries = performance.getEntriesByType('paint')

  // Paint entries (FCP)
  for (const entry of paintEntries) {
    if (entry.name === 'first-contentful-paint') {
      snapshot.FCP = entry.startTime
    }
  }

  // Navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    snapshot.TTFB = navigation.responseStart - navigation.fetchStart
    snapshot.DOMContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
    snapshot.LoadComplete = navigation.loadEventEnd - navigation.fetchStart
  }

  return snapshot
}
