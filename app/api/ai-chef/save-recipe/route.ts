/**
 * Save AI-generated recipe to Firebase
 * Saves the recipe and input data for later conversion to recipe posts
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"
import { initializeFirebase } from "@/lib/firebase-admin"

// Use Edge runtime for Cloudflare Pages
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

    try {
      const db = initializeFirebase()
      const recipeId = `ai-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const aiRecipeData = {
        id: recipeId,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutritionInfo: recipe.nutritionInfo || recipe.nutritionPer100g || null,
        cuisine: recipe.cuisine,
        userInput: {
          description: input.description,
          country: input.country,
          protein: input.protein,
          taste: input.taste,
          ingredients: input.ingredients,
        },
        createdAt: new Date(),
        isPublished: false,
        source: "ai-generated",
      }

      await db.collection("ai_recipes").doc(recipeId).set(aiRecipeData)
      console.log("✅ [SAVE-4] Recipe saved to Firebase:", recipeId)

      return NextResponse.json(
        {
          success: true,
          message: "Recipe saved successfully",
          recipeId,
        },
        { status: 200 }
      )
    } catch (firebaseError) {
      console.error("⚠️  [SAVE-5] Firebase error, but recipe generation succeeded:", firebaseError)
      return NextResponse.json(
        {
          success: true,
          message: "Recipe generated successfully (Firebase save failed but recipe is in memory)",
          recipeId: null,
        },
        { status: 200 }
      )
    }
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
