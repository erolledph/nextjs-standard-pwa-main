/**
 * Groq API Quota Tracking - Complete Monitoring
 * Tracks RPM, RPD, TPM, TPD from Groq API headers
 */

export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"

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

// In-memory store (replace with database in production)
let quotaStore: QuotaData = {
  date: new Date().toISOString().split("T")[0],
  callsUsed: 0,
  tokensUsedToday: 0,
  tokensUsedThisMinute: 0,
  requestsThisMinute: 0,
  rpmLimit: 30,
  rpdLimit: 14400,
  tpmLimit: 6000,
  tpdLimit: 500000,
  remainingRequests: 14400,
  remainingTokens: 500000,
  resetRequestsIn: "24h",
  resetTokensIn: "24h",
  lastUpdated: new Date().toISOString(),
}

let lastMinuteReset = Date.now()

/**
 * GET /api/admin/groq-quota
 * Get current quota usage with all metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Check if date changed (reset daily counters)
    const today = new Date().toISOString().split("T")[0]
    if (quotaStore.date !== today) {
      quotaStore.date = today
      quotaStore.callsUsed = 0
      quotaStore.tokensUsedToday = 0
      quotaStore.remainingRequests = quotaStore.rpdLimit
      quotaStore.remainingTokens = quotaStore.tpdLimit
    }

    // Reset minute counters if a minute has passed
    if (Date.now() - lastMinuteReset > 60000) {
      quotaStore.tokensUsedThisMinute = 0
      quotaStore.requestsThisMinute = 0
      lastMinuteReset = Date.now()
    }

    return NextResponse.json({
      success: true,
      quota: quotaStore,
    })
  } catch (error) {
    console.error("🔴 Quota fetch failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch quota", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/groq-quota
 * Track a Groq API call with rate limit headers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, rateHeaders } = body

    if (action === "increment") {
      // Extract rate limit headers from Groq API response
      if (rateHeaders) {
        // RPD/RPM headers
        if (rateHeaders["x-ratelimit-limit-requests"]) {
          quotaStore.rpdLimit = parseInt(rateHeaders["x-ratelimit-limit-requests"]) || 14400
        }
        if (rateHeaders["x-ratelimit-remaining-requests"]) {
          quotaStore.remainingRequests = parseInt(rateHeaders["x-ratelimit-remaining-requests"]) || 0
        }
        if (rateHeaders["x-ratelimit-reset-requests"]) {
          quotaStore.resetRequestsIn = rateHeaders["x-ratelimit-reset-requests"] || "24h"
        }

        // TPD/TPM headers
        if (rateHeaders["x-ratelimit-limit-tokens"]) {
          quotaStore.tpmLimit = parseInt(rateHeaders["x-ratelimit-limit-tokens"]) || 6000
        }
        if (rateHeaders["x-ratelimit-remaining-tokens"]) {
          quotaStore.remainingTokens = parseInt(rateHeaders["x-ratelimit-remaining-tokens"]) || 0
        }
        if (rateHeaders["x-ratelimit-reset-tokens"]) {
          quotaStore.resetTokensIn = rateHeaders["x-ratelimit-reset-tokens"] || "24h"
        }

        // Token usage tracking
        if (rateHeaders.tokensUsed) {
          quotaStore.tokensUsedToday += parseInt(rateHeaders.tokensUsed) || 0
          quotaStore.tokensUsedThisMinute += parseInt(rateHeaders.tokensUsed) || 0
        }
      }

      // Increment counters
      quotaStore.callsUsed++
      quotaStore.requestsThisMinute++
      quotaStore.lastUpdated = new Date().toISOString()

      // Reset minute counters if needed
      if (Date.now() - lastMinuteReset > 60000) {
        quotaStore.tokensUsedThisMinute = 0
        quotaStore.requestsThisMinute = 1
        lastMinuteReset = Date.now()
      }

      console.log("✅ [QUOTA] Updated:", {
        calls: quotaStore.callsUsed,
        remaining: quotaStore.remainingRequests,
        tokensUsed: quotaStore.tokensUsedToday,
      })

      return NextResponse.json({
        success: true,
        quota: quotaStore,
      })
    }

    if (action === "reset") {
      const today = new Date().toISOString().split("T")[0]
      quotaStore.date = today
      quotaStore.callsUsed = 0
      quotaStore.tokensUsedToday = 0
      quotaStore.tokensUsedThisMinute = 0
      quotaStore.requestsThisMinute = 0
      quotaStore.remainingRequests = quotaStore.rpdLimit
      quotaStore.remainingTokens = quotaStore.tpdLimit
      quotaStore.lastUpdated = new Date().toISOString()

      console.log("🔄 [QUOTA] Reset for today")

      return NextResponse.json({
        success: true,
        message: "Quota reset for today",
        quota: quotaStore,
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("🔴 Quota action failed:", error)
    return NextResponse.json(
      { error: "Quota action failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
