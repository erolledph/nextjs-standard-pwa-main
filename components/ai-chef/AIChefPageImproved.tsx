"use client"

/**
 * AI Chef - Improved Page
 * Smart recipe search with caching, fuzzy matching, and smart suggestions
 * Shows: Recipe posts → Cached AI results → Generate with AI option
 */

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AIChefInputSchema, type AIChefInputType } from "@/lib/ai-chef-schema"
import {
  CUISINES,
  TASTE_PROFILES,
  PROTEINS,
  INGREDIENTS_OPTIONS,
} from "@/types/ai-chef"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Zap,
  Database,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  ChefHat,
} from "lucide-react"
import { RecipeResult } from "./RecipeResult"
import { RecipePostCard } from "@/components/blog/RecipePostCard"

interface SearchResult {
  recipePosts: any[]
  cachedResults: any[]
  shouldGenerateNew: boolean
  queryHash: string
  // Enhanced results after generation
  stage?: "enhanced_results"
  suggestionRecipes?: any[]
  cachedResponse?: any
  freshResponse?: any
}

export function AIChefPageImproved() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [stage, setStage] = useState<"form" | "results" | "recipe">("form")
  const [formData, setFormData] = useState<AIChefInputType | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<AIChefInputType>({
    resolver: zodResolver(AIChefInputSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
      country: "",
      protein: "",
      taste: [],
      ingredients: [],
    },
  })

  const onSearch = async (data: AIChefInputType) => {
    console.log("🔴 [SEARCH-1] Search initiated")
    setFormData(data) // Store form data for use in generate
    setIsLoading(true)
    setError(null)
    setSelectedRecipe(null)

    try {
      console.log("🟡 [SEARCH-2] Calling search API...")
      const response = await fetch("/api/ai-chef/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      console.log("🟡 [SEARCH-3] Response received:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Search failed")
      }

      const results = await response.json()
      console.log("🟢 [SEARCH-4] Search results received", {
        posts: results.recipePosts.length,
        cached: results.cachedResults.length,
        shouldGenerate: results.shouldGenerateNew,
      })

      setSearchResults(results)
      setStage("results")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed"
      console.error("🔴 [SEARCH-ERROR]", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const onGenerateAI = async () => {
    if (!searchResults || !formData) return

    console.log("🟡 [GEN-1] Starting recipe generation flow...")
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Search for suggestion recipes
      console.log("🟡 [GEN-2] Searching for suggestion recipes (related posts)...")
      
      // Call the search API to get suggestions based on protein and cuisine
      const suggestionResponse = await fetch("/api/ai-chef/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      let suggestionRecipes: any[] = []
      if (suggestionResponse.ok) {
        const suggestionData = await suggestionResponse.json()
        // Use existing recipe posts from search results as suggestions
        suggestionRecipes = suggestionData.recipePosts || []
      }

      console.log(`🟢 [GEN-3] Found ${suggestionRecipes.length} suggestion recipes`)

      // Step 2: Check if cached response exists
      console.log("🟡 [GEN-4] Checking for cached AI response...")
      const cachedResponse = searchResults.cachedResults?.[0] // Top cached result
      
      if (cachedResponse) {
        console.log("🟢 [GEN-5] Cached response found!")
      } else {
        console.log("🟡 [GEN-6] No cached response, will generate fresh")
      }

      // Step 3: Generate fresh AI response
      console.log("🟡 [GEN-7] Generating fresh AI response...")
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!apiKey) throw new Error("Gemini API key not configured")

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

      // Build prompt from current search results context
      const systemPrompt = `You are a professional chef and recipe generator specializing in ${formData.country} cuisine.

CRITICAL: You MUST return ONLY valid JSON in this EXACT format with ALL required fields:
{
  "title": "Recipe Name (must be a descriptive title for the ${formData.country} ${formData.protein} recipe)",
  "description": "A short 1-2 sentence description of the dish",
  "servings": 4,
  "prepTime": "15 minutes",
  "cookTime": "45 minutes",
  "totalTime": "1 hour",
  "difficulty": "Medium",
  "ingredients": [
    {"item": "ingredient name", "amount": "2", "unit": "cups"},
    {"item": "ingredient name", "amount": "1", "unit": "tablespoon"}
  ],
  "instructions": [
    "First instruction step",
    "Second instruction step"
  ],
  "nutritionPer100g": {"calories": 250, "protein": 20, "carbs": 30, "fat": 10},
  "cuisine": "${formData.country}"
}

DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON.
EVERY FIELD IS REQUIRED - DO NOT OMIT ANY FIELDS.
ALWAYS include title, prepTime, cookTime, and servings.`

      const userPrompt = `Generate a delicious authentic ${formData.country} recipe featuring ${formData.protein} with these characteristics:
- Description: ${formData.description}
- Taste profile: ${formData.taste.join(", ")}
- Key ingredients: ${formData.ingredients.slice(0, 5).join(", ")}

IMPORTANT: Include ALL fields in the response. Provide a proper title, prep time, cook time, and servings for this recipe.
Return ONLY the JSON object with no additional text.`

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      })

      const text = response.response.text()
      const cleanText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()
      console.log("🔍 [GEN-RAW] Raw Gemini response (first 500 chars):", text.substring(0, 500))
      console.log("🔍 [GEN-CLEAN] Cleaned response (first 500 chars):", cleanText.substring(0, 500))
      
      const freshResponse = JSON.parse(cleanText)
      
      console.log("🔍 [GEN-PARSED] Parsed Gemini response (All keys):", Object.keys(freshResponse))
      console.log("🔍 [GEN-PARSED-VALUES] Actual values:", {
        title: freshResponse.title,
        description: freshResponse.description,
        prepTime: freshResponse.prepTime,
        prep_time: freshResponse.prep_time,
        cookTime: freshResponse.cookTime,
        cook_time: freshResponse.cook_time,
        servings: freshResponse.servings,
        difficulty: freshResponse.difficulty,
        ingredients_count: freshResponse.ingredients?.length,
        first_ingredient: freshResponse.ingredients?.[0],
      })
      console.log("🔍 [GEN-FULL] Complete Gemini response:", freshResponse)

      console.log("🟢 [GEN-8] Fresh AI response generated successfully")

      // Step 4: Compile all results
      const enhancedResults: SearchResult = {
        ...searchResults,
        suggestionRecipes: suggestionRecipes,
        cachedResponse: cachedResponse || undefined,
        freshResponse: freshResponse,
        stage: "enhanced_results",
      }

      setSearchResults(enhancedResults)
      console.log("🟢 [GEN-9] Generation complete, showing all results")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Generation failed"
      console.error("🔴 [GEN-ERROR]", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Save recipe to Firebase when user clicks "See Full Recipe"
   */
  const handleViewRecipe = async (recipe: any, isFreshAI: boolean = false) => {
    // Normalize field names from Gemini (prep_time -> prepTime, cook_time -> cookTime)
    const normalizedRecipe = {
      ...recipe,
      prepTime: recipe.prepTime || recipe.prep_time || "",
      cookTime: recipe.cookTime || recipe.cook_time || "",
      totalTime: recipe.totalTime || recipe.total_time || "",
      // Normalize ingredients to ensure amount and unit are preserved
      ingredients: (recipe.ingredients || []).map((ing: any) => ({
        item: ing.item || ing.name || "",
        amount: ing.amount || ing.qty || "",
        unit: ing.unit || ing.unit_of_measurement || "",
      })),
      nutritionPer100g: recipe.nutritionPer100g || recipe.nutrition_per_100g || recipe.nutritionInfo || null,
    }
    
    console.log("🔴 [VIEW-1] User viewing recipe:", normalizedRecipe.title)
    console.log("🔍 [DIAG-FE-1] Recipe object structure:", {
      title: normalizedRecipe.title,
      prepTime: normalizedRecipe.prepTime,
      cookTime: normalizedRecipe.cookTime,
      totalTime: normalizedRecipe.totalTime,
      servings: normalizedRecipe.servings,
      difficulty: normalizedRecipe.difficulty,
      ingredients_count: normalizedRecipe.ingredients?.length,
      ingredients_first_item: normalizedRecipe.ingredients?.[0],
      instructions_count: normalizedRecipe.instructions?.length,
      nutritionInfo: normalizedRecipe.nutritionPer100g,
    })
    
    // Set recipe to display
    setSelectedRecipe(normalizedRecipe)
    setStage("recipe")

    // Only save AI-generated fresh recipes to Firebase (not cached or database recipes)
    if (isFreshAI && formData) {
      console.log("🟡 [VIEW-2] This is a fresh AI recipe, saving to Firebase...")
      try {
        const savePayload = {
          recipe: normalizedRecipe,
          input: {
            description: formData.description,
            country: formData.country,
            protein: formData.protein,
            taste: formData.taste,
            ingredients: formData.ingredients,
          },
        }
        console.log("🔍 [DIAG-FE-2] Sending to save-recipe endpoint:", {
          recipe_title: savePayload.recipe.title,
          recipe_prepTime: savePayload.recipe.prepTime,
          recipe_cookTime: savePayload.recipe.cookTime,
          recipe_ingredients_count: savePayload.recipe.ingredients?.length,
          recipe_ingredients_first: savePayload.recipe.ingredients?.[0],
        })

        const saveResponse = await fetch("/api/ai-chef/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savePayload),
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          console.log("✅ [VIEW-3] Recipe saved to Firebase:", saveData.recipeId)
        } else {
          const errorData = await saveResponse.json()
          console.warn("⚠️  [VIEW-4] Firebase save returned error:", errorData.message)
        }
      } catch (err) {
        console.error("❌ [VIEW-5] Error saving to Firebase:", err)
        // Don't block recipe viewing if save fails
      }
    } else {
      console.log("ℹ️  [VIEW-2] Recipe is from database, not saving")
    }
  }

  // STAGE 1: Search Form
  if (stage === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 mx-auto max-w-2xl">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              AI Chef
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover recipes from our database or generate new ones with AI. We learn from your
              preferences to offer better suggestions over time.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <Database className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1000+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recipes Cached</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <Zap className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">API Cost*</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Smart</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning System</p>
            </div>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit(onSearch)} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  What are you in the mood for?
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Quick weeknight dinner with fresh herbs, something light and healthy..."
                  className="min-h-[100px] resize-none rounded-lg border-2 border-orange-200 dark:border-orange-800 focus:border-orange-500"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Cuisine & Protein Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base font-semibold">
                    Cuisine Type
                  </Label>
                  <select
                    id="country"
                    {...register("country")}
                    className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500"
                  >
                    <option value="">Select cuisine...</option>
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-base font-semibold">
                    Protein
                  </Label>
                  <select
                    id="protein"
                    {...register("protein")}
                    className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500"
                  >
                    <option value="">Select protein...</option>
                    {PROTEINS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.protein && (
                    <p className="text-sm text-red-500">{errors.protein.message}</p>
                  )}
                </div>
              </div>

              {/* Taste Profiles */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Taste Profiles (1-3)</Label>
                <Controller
                  name="taste"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {TASTE_PROFILES.map((taste) => (
                        <button
                          key={taste}
                          type="button"
                          onClick={() => {
                            const current = field.value || []
                            const updated = current.includes(taste)
                              ? current.filter((t: string) => t !== taste)
                              : [...current, taste].slice(-3)
                            field.onChange(updated)
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            (field.value || []).includes(taste)
                              ? "bg-orange-500 text-white border-2 border-orange-600"
                              : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {taste}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.taste && (
                  <p className="text-sm text-red-500">{errors.taste.message}</p>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Ingredients (3-20)</Label>
                <Controller
                  name="ingredients"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {INGREDIENTS_OPTIONS.map((ingredient) => (
                          <button
                            key={ingredient}
                            type="button"
                            onClick={() => {
                              const current = field.value || []
                              const updated = current.includes(ingredient)
                                ? current.filter((i: string) => i !== ingredient)
                                : [...current, ingredient]
                              field.onChange(updated)
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              (field.value || []).includes(ingredient)
                                ? "bg-orange-500 text-white border border-orange-600"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-orange-400"
                            }`}
                          >
                            {ingredient}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Selected: {(field.value || []).length} / 20
                      </p>
                    </>
                  )}
                />
                {errors.ingredients && (
                  <p className="text-sm text-red-500">{errors.ingredients.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Search Recipes
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                * Zero cost when using cached results. AI generation uses Gemini 2.5 Flash-Lite
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // STAGE 2: Search Results
  if (stage === "results" && searchResults) {
    const hasEnhanced = searchResults.stage === "enhanced_results"

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="outline"
              onClick={() => {
                setStage("form")
                setSearchResults(null)
                reset()
              }}
              className="mb-6"
            >
              ← Back to Search
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {hasEnhanced ? "Generated Recipe Results" : "Recipe Search Results"}
            </h1>
          </div>

          {/* ENHANCED VIEW: After Generate Click */}
          {hasEnhanced && (
            <>
              {/* 1. Suggestion Recipes */}
              {searchResults.suggestionRecipes && searchResults.suggestionRecipes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Database className="h-6 w-6 text-orange-500" />
                    Suggestion Recipes ({searchResults.suggestionRecipes.length})
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Similar recipes found in our database that match your preferences
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.suggestionRecipes.map((recipe: any) => (
                      <div key={recipe.id || recipe.slug} onClick={() => handleViewRecipe(recipe, false)}>
                        <RecipePostCard
                          id={recipe.id || recipe.slug}
                          title={recipe.title}
                          slug={recipe.slug}
                          excerpt={recipe.excerpt}
                          date={recipe.date}
                          author={recipe.author}
                          tags={recipe.tags}
                          image={recipe.image}
                          prepTime={recipe.prepTime}
                          cookTime={recipe.cookTime}
                          servings={recipe.servings}
                          difficulty={recipe.difficulty}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Cached AI Response */}
              {searchResults.cachedResponse && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-orange-500" />
                    Cached AI Response ($0)
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Previously generated recipe similar to your request (no cost!)
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-orange-300 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold flex-1">{searchResults.cachedResponse.title}</h3>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                        Cached
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {searchResults.cachedResponse.description}
                    </p>
                    <Button
                      variant="default"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleViewRecipe(searchResults.cachedResponse, false)}
                    >
                      View Cached Recipe
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. Fresh AI Response */}
              {searchResults.freshResponse && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-orange-500" />
                    Freshly Generated Recipe
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Brand new recipe created just for you by AI Chef
                  </p>
                  <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-orange-900 dark:via-orange-950 dark:to-black p-8 rounded-lg border-3 border-orange-300 dark:border-orange-700 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{searchResults.freshResponse.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
                          {searchResults.freshResponse.description}
                        </p>
                      </div>
                      <span className="text-xs bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded-full font-bold whitespace-nowrap ml-4">
                        ✨ Fresh AI
                      </span>
                    </div>

                    {/* Recipe metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-orange-200 dark:border-orange-800">
                      {searchResults.freshResponse.prepTime && (
                        <div className="text-center">
                          <Clock className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Prep</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{searchResults.freshResponse.prepTime}</p>
                        </div>
                      )}
                      {searchResults.freshResponse.cookTime && (
                        <div className="text-center">
                          <Clock className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cook</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{searchResults.freshResponse.cookTime}</p>
                        </div>
                      )}
                      {searchResults.freshResponse.servings && (
                        <div className="text-center">
                          <Users className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Servings</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{searchResults.freshResponse.servings}</p>
                        </div>
                      )}
                      {searchResults.freshResponse.difficulty && (
                        <div className="text-center">
                          <ChefHat className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Level</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{searchResults.freshResponse.difficulty}</p>
                        </div>
                      )}
                    </div>

                    {/* Ingredients preview */}
                    {searchResults.freshResponse.ingredients && searchResults.freshResponse.ingredients.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Key Ingredients:</h4>
                        <ul className="grid grid-cols-2 gap-2">
                          {searchResults.freshResponse.ingredients.slice(0, 4).map((ing: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                              ✓ {typeof ing === "string" ? ing : ing.item}
                            </li>
                          ))}
                        </ul>
                        {searchResults.freshResponse.ingredients.length > 4 && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            + {searchResults.freshResponse.ingredients.length - 4} more ingredients
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold flex-1 py-3 text-lg"
                        onClick={() => handleViewRecipe(searchResults.freshResponse, true)}
                      >
                        View Full Recipe
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 font-bold"
                        onClick={onGenerateAI}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* If nothing generated yet */}
              {!searchResults.freshResponse && (
                <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 text-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No fresh response yet</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Click "Generate" below to create a new recipe
                  </p>
                  <Button
                    onClick={onGenerateAI}
                    disabled={isLoading}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Recipe
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ORIGINAL VIEW: Search Results */}
          {!hasEnhanced && (
            <>
              {/* Recipe Posts */}
              {searchResults.recipePosts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Database className="h-6 w-6 text-orange-500" />
                    From Our Recipe Posts ({searchResults.recipePosts.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.recipePosts.map((post: any) => (
                      <div key={post.id || post.slug} onClick={() => handleViewRecipe(post, false)}>
                        <RecipePostCard
                          id={post.id || post.slug}
                          title={post.title}
                          slug={post.slug}
                          excerpt={post.excerpt}
                          date={post.date}
                          author={post.author}
                          tags={post.tags}
                          image={post.image}
                          prepTime={post.prepTime}
                          cookTime={post.cookTime}
                          servings={post.servings}
                          difficulty={post.difficulty}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cached AI Results */}
              {searchResults.cachedResults.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-orange-500" />
                    AI-Generated Recipes (Cached - $0)
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    These recipes were generated by AI for similar queries. Click to view!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.cachedResults.map((recipe, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-orange-300 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedRecipe(recipe)
                          setStage("recipe")
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold flex-1">{recipe.title}</h3>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                            {Math.round(recipe.similarity * 100)}% match
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {recipe.description}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {recipe.totalTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {recipe.servings} servings
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate with AI Option */}
              {searchResults.shouldGenerateNew || true && (
                <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-950 p-8 rounded-lg border-2 border-orange-300 dark:border-orange-700 text-center">
                  <Sparkles className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Want Something Different?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                    Generate a brand new recipe tailored to your preferences using AI. We'll show you
                    suggestions, cached results, and your fresh AI recipe all together!
                  </p>
                  <Button
                    onClick={onGenerateAI}
                    disabled={isLoading}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // STAGE 3: Recipe Display
  if (stage === "recipe" && selectedRecipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-black">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => {
              setStage("results")
              setSelectedRecipe(null)
            }}
            className="mb-6"
          >
            ← Back to Results
          </Button>
          <RecipeResult recipe={selectedRecipe} />
        </div>
      </div>
    )
  }

  return null
}
