'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, BarChart3, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CacheStats {
  totalEntries: number
  validEntries: number
  expiredEntries: number
  maxSize: number
  memoryUsage: string
  expiredCleaned?: number
  timestamp?: string
}

export function CacheStatsCard() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cache-stats')

      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.statusText}`)
      }

      const result = await response.json()
      setStats(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching cache stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const validPercentage = stats
    ? ((stats.validEntries / stats.maxSize) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-500" />
            Cache Performance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of your application cache
          </p>
        </div>
        <Button
          onClick={fetchStats}
          disabled={loading}
          className="gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Entries */}
          <Card className="p-5 border-l-4 border-l-orange-500 dark:border-l-orange-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {stats.totalEntries}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {stats.maxSize} max
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </Card>

          {/* Valid Entries */}
          <Card className="p-5 border-l-4 border-l-green-500 dark:border-l-green-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Entries</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {stats.validEntries}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {validPercentage}% of max
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </Card>

          {/* Expired Entries */}
          <Card className="p-5 border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {stats.expiredEntries}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.expiredCleaned !== undefined
                    ? `${stats.expiredCleaned} cleaned`
                    : 'queued for cleanup'}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </Card>

          {/* Memory Usage */}
          <Card className="p-5 border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {stats.memoryUsage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated usage
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Last Updated */}
      {lastRefresh && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Auto-refreshes every 30 seconds
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-orange-500 mx-auto animate-spin mb-3" />
            <p className="text-muted-foreground">Loading cache statistics...</p>
          </div>
        </div>
      )}
    </div>
  )
}
