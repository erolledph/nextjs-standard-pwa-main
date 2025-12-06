'use client'

import { useReportWebVitals } from '@/lib/useWebVitals'

/**
 * Client component for reporting web vitals
 * This initializes web vitals tracking when the page loads
 */
export function WebVitalsReporter() {
  useReportWebVitals()
  return null
}
