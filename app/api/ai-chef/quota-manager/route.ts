/**
 * Quota Manager - Track and manage Groq API free tier usage
 * Handles daily request limits, deduplication, and graceful degradation
 * 
 * Strategy:
 * - 14,400 requests/day free tier limit (Groq Llama 3.1 8B Instant)
 * - Request deduplication via query hashing
 * - Query normalization for better cache hits
 * - Graceful fallback to cached recipes when quota exceeded
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = 'edge'

// In-memory quota tracker (resets daily at UTC midnight)
interface QuotaData {
  requestCount: number
  lastResetDate: string
  queryHashes: Set<string>
  queryLog: Array<{
    hash: string
    query: string
    timestamp: number
    tokensUsed: number
  }>
}

let quotaData: QuotaData = {
  requestCount: 0,
  lastResetDate: new Date().toISOString().split("T")[0],
  queryHashes: new Set(),
  queryLog: [],
}

/**
 * Normalize query for better deduplication
 * Removes case sensitivity, extra spaces, and punctuation
 */
function normalizeQuery(input: {
  description: string
  country: string
  protein: string
  taste: string[]
  ingredients: string[]
}): string {
  const normalized = {
    description: input.description.toLowerCase().trim().replace(/\s+/g, " "),
    country: input.country.toLowerCase().trim(),
    protein: input.protein.toLowerCase().trim(),
    taste: input.taste.map(t => t.toLowerCase().trim()).sort().join(","),
    ingredients: input.ingredients.map(i => i.toLowerCase().trim()).sort().join(","),
  }
  return JSON.stringify(normalized)
}

/**
 * Generate hash for normalized query
 */
function hashQuery(normalizedQuery: string): string {
  let hash = 0
  for (let i = 0; i < normalizedQuery.length; i++) {
    const char = normalizedQuery.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Reset quota if new day
 */
function resetIfNewDay() {
  const today = new Date().toISOString().split("T")[0]
  if (quotaData.lastResetDate !== today) {
    quotaData = {
      requestCount: 0,
      lastResetDate: today,
      queryHashes: new Set(),
      queryLog: [],
    }
    console.log(`🟢 [QUOTA] New day! Quota reset to 0/14,400`)
  }
}

/**
 * GET /api/ai-chef/quota-manager
 * Get current quota status
 */
export async function GET(request: NextRequest) {
  resetIfNewDay()

  const requestsRemaining = 14400 - quotaData.requestCount
  const isExceeded = quotaData.requestCount >= 14400

  return NextResponse.json({
    requestsUsed: quotaData.requestCount,
    requestsRemaining: Math.max(0, requestsRemaining),
    isExceeded,
    resetDate: quotaData.lastResetDate,
    totalQueriesInCache: quotaData.queryHashes.size,
    queryLog: quotaData.queryLog.slice(-10), // Last 10 queries
  })
}

/**
 * POST /api/ai-chef/quota-manager
 * Check if query should trigger Groq API call or use cache
 * 
 * Request body:
 * {
 *   input: { description, country, protein, taste[], ingredients[] },
 *   tokensEstimate: number
 * }
 * 
 * Response:
 * {
 *   shouldCallGroq: boolean,
 *   queryHash: string,
 *   isCached: boolean,
 *   requestsRemaining: number,
 *   reason: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    resetIfNewDay()

    const body = await request.json()
    const { input, tokensEstimate = 100 } = body

    if (!input) {
      return NextResponse.json(
        { error: "Missing input in request body" },
        { status: 400 }
      )
    }

    // Normalize and hash the query
    const normalized = normalizeQuery(input)
    const queryHash = hashQuery(normalized)

    // Check if this exact query was already processed today
    const isCached = quotaData.queryHashes.has(queryHash)

    let shouldCallGroq = false
    let reason = ""

    if (isCached) {
      // Use cached result
      shouldCallGroq = false
      reason = "Query found in cache (ZERO COST!)"
      console.log(`🟢 [QUOTA] Cache HIT: ${reason}`)
    } else if (quotaData.requestCount >= 14400) {
      // Quota exceeded (extremely unlikely on free tier)
      shouldCallGroq = false
      reason = "Quota exceeded (14,400/14,400). Using suggestions instead."
      console.log(
        `🔴 [QUOTA] Quota EXCEEDED: ${quotaData.requestCount}/14,400 requests used`
      )
    } else {
      // New query and quota available
      shouldCallGroq = true
      quotaData.requestCount++
      quotaData.queryHashes.add(queryHash)
      quotaData.queryLog.push({
        hash: queryHash,
        query: input.description.substring(0, 50),
        timestamp: Date.now(),
        tokensUsed: tokensEstimate,
      })
      reason = `New query. Generating fresh recipe. (${quotaData.requestCount}/14,400 requests used)`
      console.log(`🟡 [QUOTA] New query: ${reason}`)
    }

    return NextResponse.json({
      shouldCallGroq,
      queryHash,
      isCached,
      requestsUsed: quotaData.requestCount,
      requestsRemaining: Math.max(0, 14400 - quotaData.requestCount),
      isExceeded: quotaData.requestCount >= 14400,
      reason,
    })
  } catch (error) {
    console.error("🔴 [QUOTA-ERROR]", error)
    return NextResponse.json(
      { error: "Quota manager error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
