/**
 * Get all AI-generated recipes from Firebase
 * On Cloudflare Pages (edge runtime), Firebase Admin is not available
 * This endpoint returns an empty array
 * 
 * GET /api/admin/ai-recipes
 */

import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  console.log("🔴 [API-1] Fetching AI recipes for admin dashboard...")

  try {
    // On Cloudflare Pages, Firebase Admin is not available
    console.log("⚠️  [API-2] Firebase not configured on this deployment, returning empty list")
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("🔴 [API-ERROR] Error fetching AI recipes:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch AI recipes",
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}
