'use client'

import { useEffect, useState } from 'react'
import { Play, AlertTriangle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface YouTubeQuota {
  used: number
  limit: number
  remaining: number
  percentUsed: number
  status: 'ok' | 'warning' | 'critical'
  estimatedSearchesRemaining: number
  resetIn: string
}

export function YouTubeQuotaCard() {
  const [quota, setQuota] = useState<YouTubeQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchQuota = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/youtube-quota')

      if (!response.ok) {
        throw new Error(`Failed to fetch quota: ${response.statusText}`)
      }

      const result = await response.json()
      setQuota(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching YouTube quota:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
    // Refresh every 60 seconds
    const interval = setInterval(fetchQuota, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      case 'critical':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-950'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-red-500" />
            YouTube API v3 Quota
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daily quota usage and remaining searches
          </p>
        </div>
        <Button
          onClick={fetchQuota}
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

      {/* Status Card */}
      {quota && !loading && (
        <div className={`rounded-lg border p-5 ${getStatusBg(quota.status)}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getStatusIcon(quota.status)}
              <div>
                <p className={`font-semibold text-lg capitalize ${getStatusColor(quota.status)}`}>
                  Status: {quota.status === 'ok' ? 'Healthy' : quota.status === 'warning' ? 'Warning' : 'Critical'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {quota.status === 'ok'
                    ? 'Quota usage is within safe limits'
                    : quota.status === 'warning'
                      ? 'Quota usage approaching limit - monitor carefully'
                      : 'Quota usage critical - limit searches'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quota Grid */}
      {quota && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Units Used */}
          <Card className="p-5 border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units Used</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {quota.used.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {quota.limit.toLocaleString()} total
                </p>
              </div>
            </div>
          </Card>

          {/* Remaining Units */}
          <Card className="p-5 border-l-4 border-l-green-500 dark:border-l-green-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining Units</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {quota.remaining.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quota.percentUsed.toFixed(1)}% of quota used
                </p>
              </div>
            </div>
          </Card>

          {/* Searches Remaining */}
          <Card className="p-5 border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Searches Remaining</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {quota.estimatedSearchesRemaining.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  100 units per search
                </p>
              </div>
            </div>
          </Card>

          {/* Reset Time */}
          <Card className="p-5 border-l-4 border-l-orange-500 dark:border-l-orange-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quota Resets</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-2">
                  {quota.resetIn}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  UTC midnight reset
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {quota && !loading && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-foreground">Daily Usage Progress</p>
            <p className="text-sm font-semibold text-muted-foreground">{quota.percentUsed.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                quota.status === 'ok'
                  ? 'bg-green-500'
                  : quota.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(quota.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Info */}
      {quota && !loading && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-2 text-sm">
          <p className="font-medium text-foreground">YouTube API v3 Free Tier:</p>
          <ul className="space-y-1 text-muted-foreground text-xs ml-4">
            <li>• Daily Limit: 10,000 units</li>
            <li>• Search Cost: 100 units per search</li>
            <li>• Video Info Cost: 1 unit per request</li>
            <li>• Featured Videos: 6-hour cache</li>
            <li>• Search Results: 30-minute cache</li>
          </ul>
        </div>
      )}

      {/* Last Updated */}
      {lastRefresh && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Auto-refreshes every 60 seconds
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !quota && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-red-500 mx-auto animate-spin mb-3" />
            <p className="text-muted-foreground">Loading YouTube quota...</p>
          </div>
        </div>
      )}
    </div>
  )
}
