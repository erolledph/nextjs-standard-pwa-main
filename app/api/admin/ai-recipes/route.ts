/**
 * Get all AI-generated recipes from Firebase
 * Fetches unpublished AI recipes for the admin dashboard
 * 
 * GET /api/admin/ai-recipes
 */

import { NextResponse } from "next/server"
import { initializeFirebase } from "@/lib/firebase-admin"

// Use Edge runtime for Cloudflare Pages
export const runtime = "edge"

export async function GET() {
  console.log("🔴 [API-1] Fetching AI recipes for admin dashboard...")

  try {
    const db = initializeFirebase()
    
    const snapshot = await db
      .collection("ai_recipes")
      .where("isPublished", "==", false)
      .orderBy("createdAt", "desc")
      .get()

    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }))

    console.log(`✅ [API-2] Found ${recipes.length} unpublished AI recipes`)

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
