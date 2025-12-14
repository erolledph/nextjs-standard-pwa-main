"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react"

interface QuotaData {
  date: string
  callsUsed: number
  tokensUsedToday: number
  tokensUsedThisMinute: number
  requestsThisMinute: number
  rpmLimit: number
  rpdLimit: number
  tpmLimit: number
  tpdLimit: number
  remainingRequests: number
  remainingTokens: number
  resetRequestsIn: string
  resetTokensIn: string
  lastUpdated: string
}

export function GroqQuotaTab() {
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await fetch("/api/admin/groq-quota")
        if (response.ok) {
          const data = await response.json()
          setQuota(data.quota)
          setError(null)
        } else {
          setError("Failed to fetch quota")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching quota")
      } finally {
        setLoading(false)
      }
    }

    fetchQuota()
    const interval = setInterval(fetchQuota, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading || !quota) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground mt-3">Loading quota data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Groq API Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const rpdPercent = (quota.callsUsed / quota.rpdLimit) * 100
  const tpdPercent = (quota.tokensUsedToday / quota.tpdLimit) * 100
  const rpmPercent = (quota.requestsThisMinute / quota.rpmLimit) * 100
  const tpmPercent = (quota.tokensUsedThisMinute / quota.tpmLimit) * 100

  const getStatus = (percent: number) => {
    if (percent >= 100) return { color: "text-red-600", bg: "bg-red-100", label: "EXHAUSTED" }
    if (percent >= 80) return { color: "text-amber-600", bg: "bg-amber-100", label: "HIGH" }
    return { color: "text-green-600", bg: "bg-green-100", label: "ACTIVE" }
  }

  const rpdStatus = getStatus(rpdPercent)
  const tpdStatus = getStatus(tpdPercent)
  const rpmStatus = getStatus(rpmPercent)
  const tpmStatus = getStatus(tpmPercent)

  return (
    <div className="space-y-6">
      {/* Daily Quota - RPD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Requests Per Day (RPD)
          </CardTitle>
          <CardDescription>Daily request limit tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${rpdStatus.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-semibold ${rpdStatus.color}`}>{rpdStatus.label}</span>
              <span className="text-sm font-bold">{quota.callsUsed} / {quota.rpdLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${rpdStatus.color.replace("text", "bg")}`}
                style={{ width: `${Math.min(rpdPercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {quota.remainingRequests} remaining • Resets in {quota.resetRequestsIn}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quota - TPD */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens Per Day (TPD)</CardTitle>
          <CardDescription>Daily token limit tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${tpdStatus.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-semibold ${tpdStatus.color}`}>{tpdStatus.label}</span>
              <span className="text-sm font-bold">{quota.tokensUsedToday.toLocaleString()} / {quota.tpdLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${tpdStatus.color.replace("text", "bg")}`}
                style={{ width: `${Math.min(tpdPercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {quota.remainingTokens.toLocaleString()} remaining • Resets in {quota.resetTokensIn}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Minute Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Minute Limits</CardTitle>
          <CardDescription>Current minute usage (RPM / TPM)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* RPM */}
            <div className={`p-4 rounded-lg ${rpmStatus.bg}`}>
              <div className="text-xs font-medium text-gray-600 mb-2">Requests/Min</div>
              <div className={`text-2xl font-bold ${rpmStatus.color}`}>{quota.requestsThisMinute}/{quota.rpmLimit}</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div
                  className={`h-1 rounded-full ${rpmStatus.color.replace("text", "bg")}`}
                  style={{ width: `${Math.min(rpmPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* TPM */}
            <div className={`p-4 rounded-lg ${tpmStatus.bg}`}>
              <div className="text-xs font-medium text-gray-600 mb-2">Tokens/Min</div>
              <div className={`text-2xl font-bold ${tpmStatus.color}`}>{quota.tokensUsedThisMinute.toLocaleString()}/{quota.tpmLimit.toLocaleString()}</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div
                  className={`h-1 rounded-full ${tpmStatus.color.replace("text", "bg")}`}
                  style={{ width: `${Math.min(tpmPercent, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {rpdPercent >= 80 && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">⚠️ Daily request quota is high</p>
            <p className="text-sm text-amber-800">{rpdPercent.toFixed(1)}% used • {quota.remainingRequests} requests remaining</p>
          </div>
        </div>
      )}

      {tpdPercent >= 80 && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">⚠️ Daily token quota is high</p>
            <p className="text-sm text-amber-800">{tpdPercent.toFixed(1)}% used • {quota.remainingTokens.toLocaleString()} tokens remaining</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center p-3">
        Updated: {new Date(quota.lastUpdated).toLocaleTimeString()} • Groq Free Tier: 30 RPM / 14,400 RPD / 6,000 TPM / 500K TPD
      </div>
    </div>
  )
}
