/**
 * AI Chef API endpoint - Step 1: Search for suggestions
 * 1. Searches for similar cached recipes first (zero cost)
 * 2. Searches recipe posts database for matches
 * 3. Returns suggestions only (AI generation happens in Step 2)
 */

import { NextRequest, NextResponse } from "next/server"
import { AIChefInputSchema, type AIChefInputType } from "@/lib/ai-chef-schema"
import { generateQueryHash, calculateQuerySimilarity, findBestMatches } from "@/lib/fuzzy-match"
import { fetchContentFromGitHub, type Recipe } from "@/lib/github"

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

    // AI generation is deferred to Step 2 (save endpoint)
    // Users click "Fresh Generate" button which calls /api/ai-chef/save
    console.log("🟢 [API-13] Suggestions complete. AI generation available in Step 2")

    // Return search results (suggestions only)
    const response = {
      queryHash,
      recipePosts: recipePosts, // Existing blog posts
      cachedResults: similarRecipes.slice(0, 3).map((r: any) => ({
        ...r.recipe,
        similarity: r.similarity,
        usageCount: r.usageCount,
      })), // Top 3 cached AI results
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


