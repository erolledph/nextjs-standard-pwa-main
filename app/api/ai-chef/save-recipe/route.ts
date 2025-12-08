/**
 * Save AI-generated recipe to Firebase
 * This endpoint runs on Node.js runtime (not edge)
 * Called after recipe generation to persist data
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"
import { saveAIRecipeToFirebase } from "@/lib/firebase-admin"

// This endpoint requires Node.js runtime (not edge) for firebase-admin
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("🔴 [SAVE-1] POST /api/ai-chef/save-recipe received")

  try {
    const body = await request.json()
    const { recipe, input } = body

    console.log("🔍 [DIAG-SAVE-1] Received request body:", {
      recipe_title: recipe?.title,
      recipe_prepTime: recipe?.prepTime,
      recipe_cookTime: recipe?.cookTime,
      recipe_totalTime: recipe?.totalTime,
      recipe_servings: recipe?.servings,
      recipe_difficulty: recipe?.difficulty,
      recipe_ingredients_count: recipe?.ingredients?.length,
      recipe_ingredients_first: recipe?.ingredients?.[0],
      recipe_instructions_count: recipe?.instructions?.length,
      input_keys: Object.keys(input || {}),
    })

    if (!recipe || !input) {
      console.error("🔴 [SAVE-2] Missing recipe or input in request body")
      return NextResponse.json(
        { error: "Missing recipe or input data" },
        { status: 400 }
      )
    }

    console.log("🟡 [SAVE-3] Saving recipe to Firebase...")
    const firestoreId = await saveAIRecipeToFirebase(recipe, input)

    console.log("🔍 [DIAG-SAVE-2] Firebase save completed with ID:", firestoreId)

    if (firestoreId) {
      console.log(`🟢 [SAVE-4] Recipe saved successfully with ID: ${firestoreId}`)
      return NextResponse.json(
        {
          success: true,
          message: "Recipe saved to Firebase",
          recipeId: firestoreId,
        },
        { status: 200 }
      )
    } else {
      console.warn("⚠️  [SAVE-5] Firebase save returned null (may be due to missing config)")
      return NextResponse.json(
        {
          success: false,
          message: "Firebase not configured, recipe generation successful but not persisted",
          recipeId: null,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("🔴 [SAVE-ERROR] Error saving recipe:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error: "Failed to save recipe to Firebase",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unknown error occurred",
        error: "Failed to save recipe to Firebase",
      },
      { status: 500 }
    )
  }
}
