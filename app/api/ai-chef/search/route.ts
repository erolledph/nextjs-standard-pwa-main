"use server"

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
import { promises as fs } from "fs"
import path from "path"

// Mock cached recipes (in production, this would come from Firebase)
const CACHED_RECIPES_DB: Record<string, any> = {}

/**
 * Load recipe posts from the posts/recipes directory
 */
async function loadRecipePosts(): Promise<Recipe[]> {
  try {
    // Try local filesystem first (development mode)
    const recipesDir = path.join(process.cwd(), "posts/recipes")
    
    try {
      const files = await fs.readdir(recipesDir)
      const mdFiles = files.filter((f) => f.endsWith(".md"))

      const recipes: Recipe[] = []

      for (const file of mdFiles) {
        const filePath = path.join(recipesDir, file)
        const content = await fs.readFile(filePath, "utf-8")
        
        // Parse frontmatter
        const match = content.match(/^---\n([\s\S]*?)\n---/m)
        const data: Record<string, any> = {}
        
        if (match) {
          match[1].split("\n").forEach((line) => {
            const [key, ...valueParts] = line.split(":")
            if (key && valueParts.length > 0) {
              const value = valueParts.join(":").trim().replace(/^["']|["']$/g, "")
              data[key.trim()] = value
            }
          })
        }

        recipes.push({
          id: file.replace(".md", ""),
          slug: file.replace(".md", ""),
          title: data.title || "Untitled",
          content: content,
          excerpt: data.excerpt || data.description || "Delicious recipe",
          date: data.date || new Date().toISOString().split("T")[0],
          author: data.author || "Chef",
          tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
          image: data.image,
          prepTime: data.prepTime || "Unknown",
          cookTime: data.cookTime || "Unknown",
          difficulty: data.difficulty || "Medium",
          servings: data.servings ? String(data.servings) : "4",
          ingredients: data.ingredients ? data.ingredients.split(",").map((i: string) => i.trim()) : [],
        })
      }

      return recipes
    } catch (fsError) {
      console.log("Local recipe files not found, skipping")
      return []
    }
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

    // TODO: Call Gemini API here
    const recipe = {
      title: `AI Generated ${input.country} ${input.protein}`,
      description: input.description,
      servings: 4,
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      totalTime: "45 minutes",
      difficulty: "Medium",
      ingredients: input.ingredients.map((i) => ({
        item: i,
        amount: "1",
        unit: "item",
      })),
      instructions: [
        "Prepare ingredients",
        "Cook the dish",
        "Serve and enjoy!",
      ],
      nutritionPer100g: {
        calories: 250,
        protein: 20,
        carbs: 30,
        fat: 10,
      },
      cuisine: input.country,
    }

    console.log("🟢 [GEN-2] Recipe generated successfully")

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
