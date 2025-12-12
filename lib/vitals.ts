/**
 * Web Vitals tracking and monitoring
 * Tracks Core Web Vitals and sends to GitHub for analysis
 */

export interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface WebVitalsReport {
  timestamp: string
  url: string
  vitals: {
    lcp?: WebVital // Largest Contentful Paint
    fid?: WebVital // First Input Delay
    cls?: WebVital // Cumulative Layout Shift
    inp?: WebVital // Interaction to Next Paint
    ttfb?: WebVital // Time to First Byte
  }
  metrics: {
    sessionId: string
    userAgent?: string
    deviceType?: string
  }
}

/**
 * Rate LCP (Largest Contentful Paint)
 */
function rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 2500) return 'good'
  if (value <= 4000) return 'needs-improvement'
  return 'poor'
}

/**
 * Rate FID (First Input Delay)
 */
function rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 100) return 'good'
  if (value <= 300) return 'needs-improvement'
  return 'poor'
}

/**
 * Rate CLS (Cumulative Layout Shift)
 */
function rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 0.1) return 'good'
  if (value <= 0.25) return 'needs-improvement'
  return 'poor'
}

/**
 * Rate INP (Interaction to Next Paint)
 */
function rateINP(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 200) return 'good'
  if (value <= 500) return 'needs-improvement'
  return 'poor'
}

/**
 * Rate TTFB (Time to First Byte)
 */
function rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 800) return 'good'
  if (value <= 1800) return 'needs-improvement'
  return 'poor'
}

/**
 * Collect Web Vitals
 */
export async function collectWebVitals(): Promise<Partial<WebVitalsReport>> {
  if (typeof window === 'undefined') {
    return {}
  }

  const vitals: WebVitalsReport['vitals'] = {}
  const metrics: WebVitalsReport['metrics'] = {
    sessionId: generateSessionId(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  }

  // Try to get Navigation Timing API
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      // LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint') as any[]
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1]
        vitals.lcp = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: rateLCP(lastEntry.renderTime || lastEntry.loadTime),
          timestamp: Date.now()
        }
      }

      // TTFB
      const navEntry = performance.getEntriesByType('navigation')[0] as any
      if (navEntry) {
        vitals.ttfb = {
          name: 'TTFB',
          value: navEntry.responseStart,
          rating: rateTTFB(navEntry.responseStart),
          timestamp: Date.now()
        }
      }

      // CLS via PerformanceObserver
      let clsValue = 0
      const observer = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
      })

      observer.observe({ type: 'layout-shift', buffered: true })

      setTimeout(() => {
        observer.disconnect()
        if (clsValue > 0) {
          vitals.cls = {
            name: 'CLS',
            value: clsValue,
            rating: rateCLS(clsValue),
            timestamp: Date.now()
          }
        }
      }, 5000)
    } catch (err) {
      // Silently fail
    }
  }

  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    vitals,
    metrics
  }
}

/**
 * Generate session ID for tracking
 */
function generateSessionId(): string {
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    let sessionId = sessionStorage.getItem('web_vitals_session_id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('web_vitals_session_id', sessionId)
    }
    return sessionId
  }
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Send vitals report to GitHub
 */
export async function reportWebVitalsToGitHub(
  report: WebVitalsReport,
  githubToken: string,
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    const vitalsList = Object.values(report.vitals)
      .filter(Boolean)
      .map((v: any) => `- **${v.name}:** ${v.value.toFixed(2)}ms (${v.rating})`)
      .join('\n')

    const content = `
## Web Vitals Report

**URL:** ${report.url}  
**Timestamp:** ${report.timestamp}  
**Session ID:** ${report.metrics.sessionId}

### Core Web Vitals

${vitalsList}

### Metrics
- User Agent: ${report.metrics.userAgent || 'Unknown'}
- Device Type: ${report.metrics.deviceType || 'Unknown'}
    `.trim()

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `[Web Vitals] ${report.metrics.sessionId}`,
        body: content,
        labels: ['web-vitals', 'monitoring']
      })
    })

    return response.ok
  } catch (error) {
    console.error('Failed to report web vitals:', error)
    return false
  }
}

/**
 * Check if vitals meet performance budget
 */
export function checkPerformanceBudget(
  report: WebVitalsReport,
  budget?: { lcp?: number; fid?: number; cls?: number; inp?: number }
): { passed: boolean; failures: string[] } {
  const failures: string[] = []
  const defaultBudget = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    inp: 200
  }

  const actualBudget = { ...defaultBudget, ...budget }

  if (report.vitals.lcp && report.vitals.lcp.value > actualBudget.lcp) {
    failures.push(`LCP (${report.vitals.lcp.value}ms) exceeds budget (${actualBudget.lcp}ms)`)
  }

  if (report.vitals.fid && report.vitals.fid.value > actualBudget.fid) {
    failures.push(`FID (${report.vitals.fid.value}ms) exceeds budget (${actualBudget.fid}ms)`)
  }

  if (report.vitals.cls && report.vitals.cls.value > actualBudget.cls) {
    failures.push(`CLS (${report.vitals.cls.value}) exceeds budget (${actualBudget.cls})`)
  }

  if (report.vitals.inp && report.vitals.inp.value > actualBudget.inp) {
    failures.push(`INP (${report.vitals.inp.value}ms) exceeds budget (${actualBudget.inp}ms)`)
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

export default {
  collectWebVitals,
  reportWebVitalsToGitHub,
  checkPerformanceBudget,
  rateLCP,
  rateFID,
  rateCLS,
  rateINP,
  rateTTFB
}
