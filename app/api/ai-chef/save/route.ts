import { NextRequest, NextResponse } from "next/server";
import { saveAIRecipeToFirebase } from "@/lib/firebase-admin";
import { AIChefInputSchema, type AIChefInputType } from "@/lib/ai-chef-schema";
import { getRecipeImage } from "@/lib/recipeImages";

/**
 * AI Chef API endpoint - Step 2: Generate and save AI recipe
 * 1. Generates fresh AI recipe via Groq (ONLY when user clicks "Fresh Generate")
 * 2. Fetches recipe image from Unsplash
 * 3. Saves recipe to Firebase
 */

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log("🟡 [SAVE-1] AI Chef save request received")
    const body = await request.json();
    const { userInput, queryHash, shouldGenerateAI } = body;

    if (!userInput) {
      return NextResponse.json(
        { error: "Invalid input", details: "Missing userInput" },
        { status: 400 }
      );
    }

    console.log("🟡 [SAVE-2] User input parsed")

    // Validate input
    const validationResult = AIChefInputSchema.safeParse(userInput)
    if (!validationResult.success) {
      console.error("🔴 [SAVE-3] Validation failed:", validationResult.error)
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const input = validationResult.data
    console.log("🟢 [SAVE-4] Input validated successfully")

    let recipe = null

    // Step 1: Generate AI recipe (ONLY happens in step 2 when user clicks Fresh Generate)
    if (shouldGenerateAI) {
      console.log("🟡 [SAVE-5] Generating fresh AI recipe...")
      const { generateRecipeWithAI } = await import("@/lib/groq")
      
      recipe = await generateRecipeWithAI(input as any)
      console.log("🟢 [SAVE-6] Recipe generated successfully from Groq API")
    } else {
      // Use provided recipe if not generating
      if (!body.recipe) {
        return NextResponse.json(
          { error: "Invalid input", details: "Missing recipe or shouldGenerateAI flag" },
          { status: 400 }
        );
      }
      recipe = body.recipe
      console.log("🟢 [SAVE-6] Using provided recipe")
    }

    // Extract quota remaining if available
    const quotaRemaining = recipe?.quotaRemaining
    if (quotaRemaining) {
      delete recipe.quotaRemaining // Don't save quota to database
    }

    // Step 2: Fetch and cache recipe image
    console.log("🟡 [SAVE-7] Fetching recipe image...")
    try {
      const recipeImage = await getRecipeImage(recipe.title, recipe.cuisine || input.country || 'food')
      if (recipeImage?.url) {
        recipe.imageUrl = recipeImage.url
        console.log("🟢 [SAVE-8] Recipe image cached:", recipeImage.url.substring(0, 50) + "...")
      }
    } catch (error) {
      console.warn("🟡 [SAVE-9] Failed to fetch recipe image (non-critical):", error)
      // Don't fail if image fetch fails
    }

    // Step 3: Save to Firebase
    console.log("🟡 [SAVE-10] Saving recipe to Firebase...")
    const recipeId = await saveAIRecipeToFirebase(recipe, userInput);

    if (recipeId) {
      console.log("🟢 [SAVE-11] Recipe saved successfully")
      const response: any = { success: true, recipeId, recipe }
      if (quotaRemaining) {
        response.quotaRemaining = quotaRemaining
      }
      return NextResponse.json(response);
    } else {
      console.error("🔴 [SAVE-12] Failed to save recipe to Firebase")
      return NextResponse.json(
        { error: "Failed to save recipe to Firebase" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🔴 [SAVE-ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

