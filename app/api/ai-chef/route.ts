/**
 * AI Chef API endpoint
 * Generates recipes based on user constraints using Groq's Llama 3.1 8B Instant
 *
 * POST /api/ai-chef
 * Body: { description, country, taste, protein, ingredients, csrfToken }
 */

import { NextResponse, type NextRequest } from "next/server"
import { generateRecipeWithAI } from "@/lib/groq"
import { AIChefInputSchema, RecipeResponseSchema } from "@/lib/ai-chef-schema"
import { verifyCSRFToken } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rateLimiter"
import { setCached, getCached } from "@/lib/cache"

export const runtime = 'edge'

/**
 * Simple hash function for cache key (compatible with edge runtime)
 */
function hashInput(input: any): string {
  const str = JSON.stringify(input)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 16)
}

export async function POST(request: NextRequest) {
  console.log("🔴 [API-1] POST /api/ai-chef request received")
  
  try {
    // 1. Extract IP address for rate limiting
    const ipAddress =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"
    console.log("🟡 [API-2] IP Address:", ipAddress)

    // 2. Check rate limit (prevent API abuse)
    console.log("🟡 [API-3] Checking rate limit...")
    const { allowed, remaining } = checkRateLimit(ipAddress, {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
    })
    console.log("🟡 [API-4] Rate limit check - Allowed:", allowed, "Remaining:", remaining)

    if (!allowed) {
      console.log("🔴 [API-5] Rate limit exceeded!")
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          remaining: 0,
        },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      )
    }

    // 3. Parse request body
    console.log("🟡 [API-6] Parsing request body...")
    let body: any
    try {
      body = await request.json()
      console.log("🟢 [API-7] Body parsed successfully:", body)
    } catch (e) {
      console.error("🔴 [API-8] Failed to parse JSON body:", e)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    // 4. Validate CSRF token
    console.log("🟡 [API-9] Validating CSRF token...")
    const csrfToken = body.csrfToken
    if (!csrfToken) {
      console.error("🔴 [API-10] No CSRF token provided")
      return NextResponse.json(
        { error: "Missing CSRF token" },
        { status: 403 }
      )
    }

    console.log("🟡 [API-11] Verifying CSRF token:", csrfToken.substring(0, 10) + "...")
    const csrfValid = await verifyCSRFToken(request, csrfToken)
    if (!csrfValid) {
      console.error("🔴 [API-12] CSRF token verification failed")
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      )
    }
    console.log("🟢 [API-13] CSRF token verified!")

    // 5. Validate input using Zod
    console.log("🟡 [API-14] Validating input with Zod schema...")
    const validationResult = AIChefInputSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("🔴 [API-15] Validation failed:", validationResult.error.flatten())
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }
    console.log("🟢 [API-16] Input validation passed!")

    const validatedInput = validationResult.data
    console.log("🟡 [API-17] Validated input:", validatedInput)

    // 6. Check cache (avoid redundant AI calls)
    console.log("🟡 [API-18] Checking cache...")
    const cacheKey = `ai-chef:${hashInput(validatedInput)}`
    console.log("🟡 [API-19] Cache key:", cacheKey)
    const cached = getCached<any>(cacheKey)

    if (cached) {
      console.log("🟢 [API-20] Cache HIT! Returning cached recipe")
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": remaining.toString(),
        },
      })
    }
    console.log("🟡 [API-21] Cache MISS, calling Gemini API...")

    // 7. Call Gemini API to generate recipe
    console.log("🟡 [API-22] Calling generateRecipeWithAI...")
    const recipe = await generateRecipeWithAI(validatedInput)
    console.log("🟢 [API-23] AI response received:", JSON.stringify(recipe).substring(0, 100) + "...")

    // 8. Validate AI response format
    console.log("🟡 [API-24] Validating AI response format with Zod...")
    const responseValidation = RecipeResponseSchema.safeParse(recipe)
    if (!responseValidation.success) {
      console.error("🔴 [API-25] AI response validation failed:", responseValidation.error)
      return NextResponse.json(
        {
          error: "AI response was not in correct format",
          details: responseValidation.error.flatten().fieldErrors,
        },
        { status: 500 }
      )
    }
    console.log("🟢 [API-26] AI response validation passed!")

    const validatedRecipe = responseValidation.data

    // 9. Cache successful response (24 hours)
    console.log("🟡 [API-27] Caching recipe for 24 hours...")
    setCached(cacheKey, validatedRecipe, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    })
    console.log("🟢 [API-28] Recipe cached successfully!")

    // 10. Return success response with Firebase save info
    console.log("🟢 [API-29] Returning successful response")
    console.log("ℹ️  [API-29b] Firebase save happens via background task (see /api/ai-chef/save-recipe)")
    return NextResponse.json(validatedRecipe, {
      headers: {
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": remaining.toString(),
      },
    })
  } catch (error) {
    console.error("🔴 [API-ERROR] Unexpected error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        console.error("🔴 [API-ERROR-1] API key error")
        return NextResponse.json(
          { error: "AI service not properly configured" },
          { status: 500 }
        )
      }

      if (error.message.includes("quota")) {
        console.error("🔴 [API-ERROR-2] Quota exceeded")
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        )
      }

      if (error.message.includes("JSON")) {
        console.error("🔴 [API-ERROR-3] JSON parsing error")
        return NextResponse.json(
          { error: "AI response was not valid. Please try again." },
          { status: 500 }
        )
      }

      console.error("🔴 [API-ERROR-4] Generic error:", error.message)
      return NextResponse.json(
        {
          error: error.message || "Failed to generate recipe",
        },
        { status: 500 }
      )
    }

    console.error("🔴 [API-ERROR-5] Unknown error type")
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
