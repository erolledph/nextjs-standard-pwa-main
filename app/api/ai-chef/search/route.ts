/**
 * AI Chef API endpoint - improved version
 * 1. Searches for similar cached recipes first (zero cost)
 * 2. Searches recipe posts database for matches
 * 3. Offers to generate with AI if no good matches found
 */

import { NextRequest, NextResponse } from "next/server"
import { AIChefInputSchema, type AIChefInputType } from "@/lib/ai-chef-schema"
import { generateQueryHash, calculateQuerySimilarity, findBestMatches } from "@/lib/fuzzy-match"
import { fetchContentFromGitHub, type Recipe } from "@/lib/github"
import { getRecipeImage } from "@/lib/recipeImages"

export const runtime = 'edge'

// Mock cached recipes (in production, this would come from Firebase)
const CACHED_RECIPES_DB: Record<string, any> = {}

/**
 * Load recipe posts from GitHub (edge runtime compatible)
 */
async function loadRecipePosts(): Promise<Recipe[]> {
  try {
    // Fetch recipes from GitHub (edge runtime compatible)
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""
    const recipes = await fetchContentFromGitHub(owner, repo, token, "recipes")
    return recipes as Recipe[]
  } catch (error) {
    console.error("🔴 Error loading recipe posts:", error)
    return []
  }
}

/**
 * POST /api/ai-chef/search
 * Search for existing recipes before generating new ones
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🟡 [API-1] AI Chef search request received")

    // Parse request body
    const body = await request.json()
    console.log("🟡 [API-2] Request body parsed:", { description: body.description?.substring(0, 50) })

    // Validate input
    const validationResult = AIChefInputSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("🔴 [API-3] Validation failed:", validationResult.error)
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const input = validationResult.data
    console.log("🟢 [API-4] Input validated successfully")

    // Step 0: Check quota manager before proceeding
    console.log("🟡 [API-5-QUOTA] Checking API quota...")
    try {
      const quotaResponse = await fetch("https://your-domain.com/api/ai-chef/quota-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, tokensEstimate: 100 }),
      })
      const quotaData = await quotaResponse.json()
      console.log(`🟡 [API-5-QUOTA] Quota check: ${quotaData.reason}`)
    } catch (quotaError) {
      console.warn("⚠️ [API-5-QUOTA] Quota manager unavailable, proceeding with search")
    }

    // Generate query hash for caching
    const queryHash = generateQueryHash(input)
    console.log("🟡 [API-5] Query hash generated:", queryHash)

    // Step 1: Check exact cache match
    console.log("🟡 [API-6] Checking exact cache match...")
    if (CACHED_RECIPES_DB[queryHash]) {
      console.log("🟢 [API-7] ⭐ Exact cache hit! Returning cached recipe (ZERO API COST)")
      return NextResponse.json({
        source: "cache_exact",
        recipe: CACHED_RECIPES_DB[queryHash].recipe,
        message: "Found exact match in cache!",
        usageCount: CACHED_RECIPES_DB[queryHash].usageCount || 1,
      })
    }

    // Step 2: Find similar cached recipes
    console.log("🟡 [API-8] Searching for similar cached recipes...")
    const cachedRecipes = Object.entries(CACHED_RECIPES_DB).map(([hash, data]) => ({
      queryHash: hash,
      input: data.input,
      recipe: data.recipe,
      usageCount: data.usageCount || 1,
    }))

    const similarRecipes = findBestMatches(input, cachedRecipes, 0.65)
    console.log(`🟢 [API-9] Found ${similarRecipes.length} similar cached recipes`)

    // Step 3: Search recipe posts
    console.log("🟡 [API-10] Searching recipe posts database...")
    const allRecipes = await loadRecipePosts()
    console.log(`🟡 [API-10b] Loaded ${allRecipes.length} total recipe posts`)

    // Filter and rank by similarity to user input
    const recipePosts = allRecipes
      .map((recipe: any) => {
        const ingredientsArray = Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : typeof recipe.ingredients === "string"
            ? recipe.ingredients.split(",").map((i: string) => i.trim())
            : []
        
        return {
          ...recipe,
          ingredients: ingredientsArray,
          similarity: calculateQuerySimilarity(input, {
            description: recipe.description || "",
            country: input.country,
            protein: input.protein,
            taste: input.taste,
            ingredients: ingredientsArray,
          }),
        }
      })
      .filter((r: any) => r.similarity > 0.3) // Only show reasonably similar recipes
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 5) // Top 5 matches

    console.log(`🟢 [API-11] Found ${recipePosts.length} recipe posts matching criteria`)

    // Generate fresh AI recipe when:
    // 1. No cached recipes found (similarRecipes = 0), OR
    // 2. Found recipe posts but no cached recipes (new unique query)
    // Skip only if we have BOTH cached recipes AND recipe posts (high confidence results)
    let freshAIRecipe = null
    if (similarRecipes.length === 0 || (recipePosts.length > 0 && similarRecipes.length === 0)) {
      console.log("🟡 [API-13] Generating fresh AI recipe for unique query...")
      freshAIRecipe = await generateNewRecipe(input, queryHash)
    } else if (similarRecipes.length > 0 && recipePosts.length > 0) {
      console.log(`🟢 [API-13] Have both cached (${similarRecipes.length}) and recipe posts (${recipePosts.length}), skipping generation (ZERO COST!)`)
    } else {
      console.log(`🟢 [API-13] Using ${similarRecipes.length} cached recipes, skipping generation (ZERO COST!)`)
    }

    // Return search results in order
    const response = {
      queryHash,
      recipePosts: recipePosts, // Existing blog posts
      cachedResults: similarRecipes.slice(0, 3).map((r: any) => ({
        ...r.recipe,
        similarity: r.similarity,
        usageCount: r.usageCount,
      })), // Top 3 cached AI results
      shouldGenerateNew: similarRecipes.length === 0 && recipePosts.length === 0,
      freshResponse: freshAIRecipe, // Include generated recipe only if created
      source: "search",
      message: `Found ${recipePosts.length} posts and ${similarRecipes.length} cached recipes`,
    }

    console.log("🟢 [API-12] Search complete, returning results")
    return NextResponse.json(response)
  } catch (error) {
    console.error("🔴 [API-ERROR]", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Search failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai-chef/search
 * Generate new recipe with AI (only if no good matches found)
 */
async function generateNewRecipe(input: AIChefInputType, queryHash: string) {
  try {
    console.log("🟡 [GEN-1] Generating new recipe with AI...")

    // Import Groq client
    const { generateRecipeWithAI } = await import("@/lib/groq")
    
    // Call Groq API to generate recipe
    const recipe = await generateRecipeWithAI(input as any)

    console.log("🟢 [GEN-2] Recipe generated successfully from Groq API")

    // Fetch and cache recipe image
    console.log("🟡 [GEN-2b] Fetching recipe image...")
    try {
      const recipeImage = await getRecipeImage(recipe.title, recipe.cuisine || input.country || 'food')
      if (recipeImage?.url) {
        recipe.imageUrl = recipeImage.url
        console.log("🟢 [GEN-2c] Recipe image cached:", recipeImage.url.substring(0, 50) + "...")
      }
    } catch (error) {
      console.warn("🟡 [GEN-2d] Failed to fetch recipe image (non-critical):", error)
      // Don't fail the recipe generation if image fetch fails
    }

    // Cache the result
    CACHED_RECIPES_DB[queryHash] = {
      input,
      recipe,
      createdAt: new Date(),
      usageCount: 1,
    }

    console.log("🟢 [GEN-3] Recipe cached")

    return recipe
  } catch (error) {
    console.error("🔴 [GEN-ERROR]", error)
    throw error
  }
}
