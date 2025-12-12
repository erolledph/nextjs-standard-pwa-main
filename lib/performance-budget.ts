/**
 * Performance budget monitoring
 * Tracks page load metrics against defined budgets
 * Helps prevent performance regression
 */

export interface PerformanceBudget {
  // Size budgets (KB)
  js?: number
  css?: number
  images?: number
  fonts?: number
  total?: number

  // Timing budgets (milliseconds)
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
  timeToInteractive?: number

  // API call budgets
  maxApiCalls?: number
  maxGeminiCallsPerDay?: number
  maxYoutubeUnitsPerDay?: number
}

export interface BudgetViolation {
  metric: string
  actual: number
  budget: number
  unit: string
  severity: 'warning' | 'error'
}

const defaultBudgets: PerformanceBudget = {
  // Production-realistic budgets for food recipe blog
  js: 300, // KB
  css: 50, // KB
  images: 500, // KB
  fonts: 100, // KB
  total: 1000, // KB

  firstContentfulPaint: 1800, // ms
  largestContentfulPaint: 2500, // ms
  cumulativeLayoutShift: 0.1,
  timeToInteractive: 3800, // ms

  maxApiCalls: 50, // per page load
  maxGeminiCallsPerDay: 20,
  maxYoutubeUnitsPerDay: 10000
}

class PerformanceBudgetMonitor {
  private budgets: PerformanceBudget
  private violations: BudgetViolation[] = []
  private metrics: { [key: string]: number } = {}

  constructor(customBudgets?: PerformanceBudget) {
    this.budgets = { ...defaultBudgets, ...customBudgets }
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    this.metrics[name] = value
  }

  /**
   * Check size budget (bytes)
   */
  checkSizeBudget(resource: string, bytes: number): boolean {
    const kb = bytes / 1024
    const budget = this.budgets[resource as keyof PerformanceBudget] as number

    if (!budget || kb <= budget) {
      return true
    }

    this.violations.push({
      metric: resource,
      actual: kb,
      budget,
      unit: 'KB',
      severity: kb > budget * 1.5 ? 'error' : 'warning'
    })

    return false
  }

  /**
   * Check timing budget (milliseconds)
   */
  checkTimingBudget(metric: string, ms: number): boolean {
    const budget = this.budgets[metric as keyof PerformanceBudget] as number

    if (!budget || ms <= budget) {
      return true
    }

    this.violations.push({
      metric,
      actual: ms,
      budget,
      unit: 'ms',
      severity: ms > budget * 1.5 ? 'error' : 'warning'
    })

    return false
  }

  /**
   * Check API call count budget
   */
  checkApiCallBudget(calls: number): boolean {
    const budget = this.budgets.maxApiCalls || 50

    if (calls <= budget) {
      return true
    }

    this.violations.push({
      metric: 'API Calls',
      actual: calls,
      budget,
      unit: 'calls',
      severity: 'warning'
    })

    return false
  }

  /**
   * Check Gemini API quota
   */
  checkGeminiQuota(callsToday: number): boolean {
    const budget = this.budgets.maxGeminiCallsPerDay || 20

    if (callsToday <= budget) {
      return true
    }

    this.violations.push({
      metric: 'Gemini API Calls',
      actual: callsToday,
      budget,
      unit: 'calls/day',
      severity: 'error'
    })

    return false
  }

  /**
   * Check YouTube API quota (units)
   */
  checkYoutubeQuota(unitsUsedToday: number): boolean {
    const budget = this.budgets.maxYoutubeUnitsPerDay || 10000

    if (unitsUsedToday <= budget) {
      return true
    }

    this.violations.push({
      metric: 'YouTube API Units',
      actual: unitsUsedToday,
      budget,
      unit: 'units/day',
      severity: 'warning'
    })

    return false
  }

  /**
   * Analyze Navigation Timing API
   */
  analyzeNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return
    }

    const timing = window.performance.timing
    const navigation = window.performance.navigation

    // Calculate metrics
    const fcp = (timing as any).firstContentfulPaint - timing.navigationStart
    const lcp = (timing as any).largestContentfulPaint - timing.navigationStart
    const lsDuration = (timing as any).loadEventEnd - timing.navigationStart

    this.recordMetric('FCP', fcp)
    this.recordMetric('LCP', lcp)
    this.recordMetric('loadEventEnd', lsDuration)

    // Check budgets
    if (fcp > 0) {
      this.checkTimingBudget('firstContentfulPaint', fcp)
    }
    if (lcp > 0) {
      this.checkTimingBudget('largestContentfulPaint', lcp)
    }
  }

  /**
   * Analyze resource sizes
   */
  analyzeResourceSizes(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return
    }

    let jsSize = 0,
      cssSize = 0,
      imageSize = 0

    window.performance.getEntriesByType('resource').forEach((entry: any) => {
      const size = entry.transferSize || 0

      if (entry.name.endsWith('.js')) {
        jsSize += size
      } else if (entry.name.endsWith('.css')) {
        cssSize += size
      } else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        imageSize += size
      }
    })

    this.checkSizeBudget('js', jsSize)
    this.checkSizeBudget('css', cssSize)
    this.checkSizeBudget('images', imageSize)
  }

  /**
   * Get all violations
   */
  getViolations(): BudgetViolation[] {
    return [...this.violations]
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(severity: 'warning' | 'error'): BudgetViolation[] {
    return this.violations.filter((v) => v.severity === severity)
  }

  /**
   * Clear violations
   */
  clearViolations(): void {
    this.violations = []
  }

  /**
   * Generate budget report
   */
  generateReport(): {
    passed: boolean
    violations: BudgetViolation[]
    timestamp: string
    summary: string
  } {
    const errors = this.getViolationsBySeverity('error')
    const warnings = this.getViolationsBySeverity('warning')
    const passed = errors.length === 0

    const summary =
      errors.length === 0 && warnings.length === 0
        ? '✅ All budgets met'
        : `${errors.length} critical, ${warnings.length} warnings`

    return {
      passed,
      violations: this.violations,
      timestamp: new Date().toISOString(),
      summary
    }
  }

  /**
   * Export report to GitHub
   */
  async exportToGitHub(
    githubToken: string,
    owner: string,
    repo: string
  ): Promise<boolean> {
    const report = this.generateReport()

    const violationsContent = report.violations
      .map(
        (v) => `
- **${v.metric}:** ${v.actual.toFixed(2)}${v.unit} (budget: ${v.budget}${v.unit}) - ${v.severity}
      `
      )
      .join('\n')

    const content = `
## Performance Budget Report

**Status:** ${report.passed ? '✅ Passed' : '❌ Failed'}  
**Timestamp:** ${report.timestamp}

### Summary
${report.summary}

### Violations
${report.violations.length === 0 ? 'None' : violationsContent}
    `.trim()

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `[Performance Budget] ${report.summary}`,
          body: content,
          labels: ['performance-budget', report.passed ? 'pass' : 'fail']
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to export budget report:', error)
      return false
    }
  }
}

// Singleton instance
const budgetMonitor = new PerformanceBudgetMonitor()

/**
 * Get budget monitor instance
 */
export function getBudgetMonitor(customBudgets?: PerformanceBudget): PerformanceBudgetMonitor {
  if (customBudgets) {
    return new PerformanceBudgetMonitor(customBudgets)
  }
  return budgetMonitor
}

export default {
  getBudgetMonitor,
  defaultBudgets
}
