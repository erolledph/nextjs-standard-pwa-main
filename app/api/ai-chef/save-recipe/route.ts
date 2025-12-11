/**
 * Save AI-generated recipe to Firebase
 * Saves the recipe and input data for later conversion to recipe posts
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"
import { saveAIRecipeToFirebase } from "@/lib/firebase-admin"

export const runtime = 'edge'

// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe, input } = body

    if (!recipe || !input) {
      return NextResponse.json(
        { error: "Missing recipe or input data" },
        { status: 400 }
      )
    }

    // Save to Firebase using the REST API
    const docId = await saveAIRecipeToFirebase(recipe, input)

    if (!docId) {
      return NextResponse.json(
        { error: "Failed to save recipe to Firebase" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe saved successfully",
        data: {
          id: docId,
          title: recipe.title,
          description: recipe.description,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving recipe:", error)
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 }
    )
  }
}
