'use client'

import { useEffect } from 'react'

/**
 * Custom hook to report Core Web Vitals metrics to analytics
 * Metrics: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
 * Also tracks INP (Interaction to Next Paint) which replaces FID
 */
export function useReportWebVitals() {
  useEffect(() => {
    // Use Web Vitals API if available
    if ('web-vital' in window === false && 'PerformanceObserver' in window) {
      try {
        // Report LCP (Largest Contentful Paint) - target < 2.5s
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          const metric = {
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            rating: (lastEntry.renderTime || lastEntry.loadTime) <= 2500 ? 'good' : 'poor',
          }
          
          // Send to analytics
          sendToAnalytics('web-vital', metric)
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // Report FID/INP (First Input Delay / Interaction to Next Paint) - target < 100ms
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          
          entries.forEach((entry) => {
            const entryAny = entry as any
            const metric = {
              name: entry.name === 'first-input' ? 'FID' : 'INP',
              value: entryAny.processingDuration,
              rating: entryAny.processingDuration <= 100 ? 'good' : 'poor',
            }
            
            sendToAnalytics('web-vital', metric)
          })
        })
        
        // Observe both first-input (FID) and input events (INP)
        fidObserver.observe({
          type: 'first-input',
          buffered: true,
        })
        
        if (PerformanceObserver.supportedEntryTypes?.includes('event')) {
          fidObserver.observe({
            type: 'event',
            buffered: true,
          })
        }

        // Report CLS (Cumulative Layout Shift) - target < 0.1
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const entryAny = entry as any
            if (!entryAny.hadRecentInput) {
              clsValue += entryAny.value
              
              const metric = {
                name: 'CLS',
                value: clsValue,
                rating: clsValue <= 0.1 ? 'good' : 'poor',
              }
              
              sendToAnalytics('web-vital', metric)
            }
          }
        })
        
        clsObserver.observe({ type: 'layout-shift', buffered: true })

        // Report TTFB (Time to First Byte) - target < 600ms
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationTiming) {
          const ttfb = navigationTiming.responseStart - navigationTiming.fetchStart
          
          const metric = {
            name: 'TTFB',
            value: ttfb,
            rating: ttfb <= 600 ? 'good' : 'poor',
          }
          
          sendToAnalytics('web-vital', metric)
        }

        return () => {
          lcpObserver?.disconnect()
          fidObserver?.disconnect()
          clsObserver?.disconnect()
        }
      } catch (error) {
        console.warn('Error tracking web vitals:', error)
      }
    }
  }, [])
}

/**
 * Send metrics to analytics service
 * Can be extended to send to Google Analytics, Vercel Analytics, or custom endpoint
 */
function sendToAnalytics(type: string, metric: any) {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${type}]`, metric)
    }

    // Send to Vercel Analytics if available
    if ('amplitude' in window) {
      (window as any).amplitude?.logEvent('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      })
    }

    // Send to Google Analytics if available
    if ('gtag' in window) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'web_vitals',
        event_label: metric.rating,
        non_interaction: true,
      })
    }

    // Optionally send to custom endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
      navigator.sendBeacon?.(process.env.NEXT_PUBLIC_ANALYTICS_URL, JSON.stringify({
        type,
        metric,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }))
    }
  } catch (error) {
    console.warn('Error sending web vital:', error)
  }
}
