/**
 * Save AI-generated recipe to Firebase
 * Saves the recipe and input data for later conversion to recipe posts
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"

// Use Edge runtime for Cloudflare Pages compatibility
// This route requires Node.js runtime, so it will only work on Vercel or similar platforms
export const runtime = "edge"

export async function POST(request: NextRequest) {
  // Return error for Cloudflare Pages edge runtime
  // This endpoint is not compatible with edge runtime due to Firebase Admin SDK requirements
  return NextResponse.json(
    {
      error: "This endpoint is not available on Cloudflare Pages",
      message: "Firebase Admin SDK requires Node.js runtime. Deploy to Vercel for this functionality.",
    },
    { status: 503 }
  )
}
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
