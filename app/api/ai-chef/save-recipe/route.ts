/**
 * Save AI-generated recipe to Firebase
 * On Cloudflare Pages (edge runtime), Firebase Admin is not available
 * This endpoint returns success but doesn't persist to Firebase
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"

// Cloudflare Pages requires edge runtime
export const runtime = "edge"

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

    // On Cloudflare Pages, Firebase Admin is not available
    // Recipe generation succeeded, but persistence to Firebase is not available
    console.warn("⚠️  [SAVE-3] Firebase not configured on this deployment")
    return NextResponse.json(
      {
        success: true,
        message: "Recipe generated successfully (Firebase persistence not available on this deployment)",
        recipeId: null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("🔴 [SAVE-ERROR] Error processing recipe:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error: "Failed to process recipe",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unknown error occurred",
        error: "Failed to process recipe",
      },
      { status: 500 }
    )
  }
}
