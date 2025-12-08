/**
 * Get all AI-generated recipes from Firebase
 * Used by admin dashboard to display and convert recipes
 * 
 * GET /api/admin/ai-recipes
 */

import { NextResponse } from "next/server"
import { getAIRecipes } from "@/lib/firebase-admin"

export const runtime = "edge"

export async function GET() {
  console.log("🔴 [API-1] Fetching AI recipes for admin dashboard...")

  try {
    // Get unpublished AI recipes (ones that haven't been converted yet)
    console.log("🟡 [API-2] Querying Firestore for unpublished AI recipes...")
    const recipes = await getAIRecipes(false, 100)

    console.log(`🟢 [API-3] Found ${recipes.length} AI recipes`)
    return NextResponse.json(recipes, {
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
