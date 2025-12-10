"use client"

/**
 * AI Chef - Recipe Posts Style
 * Matches recipe posts page design with orange accents and gradients
 * Form → Generate (Shows both tabs immediately) → Recipe View
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
  Sparkles,
  ArrowLeft,
  Eye,
  ChefHat,
} from "lucide-react"
import { RecipeResult } from "./RecipeResult"
import { RecipePostCard } from "@/components/blog/RecipePostCard"
import { shouldGenerateFreshRecipe, getBestRecipeFromSearch, type SearchResult as LogicSearchResult } from "@/lib/ai-chef-utils"

interface SearchResult extends Partial<LogicSearchResult> {
  recipePosts: any[]
  cachedResults: any[]
  shouldGenerateNew: boolean
  queryHash: string
  freshResponse?: any
}

export function AIChefPageNew() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [stage, setStage] = useState<"form" | "results" | "recipe">("form")
  const [formData, setFormData] = useState<AIChefInputType | null>(null)
  const [activeTab, setActiveTab] = useState<"suggestions" | "generated">("suggestions")

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
    setFormData(data)
    setIsLoading(true)
    setError(null)
    setSelectedRecipe(null)

    try {
      // Search for matching recipes
      const response = await fetch("/api/ai-chef/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      let searchData: SearchResult = {
        recipePosts: [],
        cachedResults: [],
        shouldGenerateNew: true,
        queryHash: "",
      }

      if (response.ok) {
        const jsonData = await response.json()

        // Handle exact cache match structure which differs
        if (jsonData.source === "cache_exact") {
          searchData = {
             recipePosts: [],
             cachedResults: [],
             shouldGenerateNew: false,
             queryHash: "", // Not available in exact match
             ...jsonData // Merges recipe and source
          }
        } else {
          searchData = jsonData
        }
      }

      let enrichedResponse = null

      // Determine if we should generate fresh recipe or use cached
      if (shouldGenerateFreshRecipe(searchData)) {
        // Generate fresh AI response immediately
        const { GoogleGenerativeAI } = await import("@google/generative-ai")
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

        if (!apiKey) throw new Error("Gemini API key not configured")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

        const systemPrompt = `You are a professional chef and recipe generator specializing in ${data.country} cuisine.

CRITICAL: You MUST return ONLY valid JSON in this EXACT format with ALL required fields:
{
  "title": "A creative and appetizing recipe name (e.g., 'Spiced Saffron Chicken Biryani' or 'Creamy Garlic Butter Prawns')",
  "description": "A short 1-2 sentence description of the dish",
  "servings": 4,
  "prepTime": "15 minutes",
  "cookTime": "45 minutes",
  "totalTime": "1 hour",
  "difficulty": "Medium",
  "ingredients": [
    {"item": "ingredient name", "amount": "2", "unit": "cups"}
  ],
  "instructions": [
    "First instruction step"
  ],
  "nutritionPer100g": {"calories": 250, "protein": 20, "carbs": 30, "fat": 10},
  "cuisine": "${data.country}"
}

DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON.
EVERY FIELD IS REQUIRED.
THE TITLE MUST BE CREATIVE, DESCRIPTIVE, AND APPETIZING.`

        const userPrompt = `Generate a delicious authentic ${data.country} recipe featuring ${data.protein} with these characteristics:
- Description: ${data.description}
- Taste profile: ${data.taste.join(", ")}
- Key ingredients: ${data.ingredients.slice(0, 5).join(", ")}

Create a creative and appetizing recipe title that describes the dish. Return ONLY the JSON object with no additional text.`

        const generativeResponse = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        })

        const text = generativeResponse.response.text()
        const cleanText = text
          .replace(/^```json\n?/, "")
          .replace(/\n?```$/, "")
          .trim()
        const freshResponse = JSON.parse(cleanText)

        // Use the raw response
        enrichedResponse = freshResponse;
      } else {
        // Use cached or exact match result if available
        enrichedResponse = getBestRecipeFromSearch(searchData);
      }

      // Helper function to generate creative title if missing
      const generateTitle = (protein: string, country: string, tasteProfiles: string[]) => {
        const adjectives = {
          spicy: ["Spiced", "Fiery", "Zesty"],
          savory: ["Savory", "Rich", "Umami-Packed"],
          sweet: ["Sweet", "Honey-Glazed", "Caramelized"],
          tangy: ["Tangy", "Citrus-Kissed", "Tangy"],
          creamy: ["Creamy", "Silky", "Luxurious"],
          light: ["Light", "Fresh", "Refreshing"],
        }

        const tasteAdj = tasteProfiles[0]?.toLowerCase() || "delicious"
        const adjList = adjectives[tasteAdj as keyof typeof adjectives] || [
          "Delicious",
          "Authentic",
          "Aromatic",
        ]
        const adj = adjList[Math.floor(Math.random() * adjList.length)]

        // Capitalize protein
        const proteinCapitalized =
          protein.charAt(0).toUpperCase() + protein.slice(1).toLowerCase()

        // Add country reference if it's a specific cuisine
        const countryRef = country && country !== "International" ? ` ${country}` : ""

        return `${adj}${countryRef} ${proteinCapitalized} Recipe`
      }

      // Ensure all required fields have proper defaults (apply to both fresh and cached)
      if (enrichedResponse) {
        enrichedResponse = {
          title:
            enrichedResponse.title?.trim() &&
            enrichedResponse.title.trim() !== "Recipe Name" &&
            enrichedResponse.title.trim() !== ""
              ? enrichedResponse.title.trim()
              : generateTitle(data.protein, data.country, data.taste),
          description: enrichedResponse.description?.trim() || "",
          servings: enrichedResponse.servings || 4,
          prepTime: (enrichedResponse.prepTime?.toString() || "15 minutes").trim(),
          cookTime: (enrichedResponse.cookTime?.toString() || "30 minutes").trim(),
          totalTime: (enrichedResponse.totalTime?.toString() || "45 minutes").trim(),
          difficulty: (enrichedResponse.difficulty?.trim() || "Medium"),
          ingredients: (enrichedResponse.ingredients || []).map((ing: any) => ({
            item: ing.item?.trim() || "",
            amount: ing.amount?.toString().trim() || "",
            unit: ing.unit?.trim() || "",
          })),
          instructions: (enrichedResponse.instructions || []).map((inst: any) =>
            typeof inst === "string" ? inst.trim() : inst
          ),
          nutritionPer100g: enrichedResponse.nutritionPer100g || null,
          cuisine: enrichedResponse.cuisine || data.country,
        }
      }

      // Show results with both tabs immediately
      const results: SearchResult = {
        ...searchData,
        freshResponse: enrichedResponse,
      }

      setSearchResults(results)
      setStage("results")
      setActiveTab("suggestions")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecipe = async (recipe: any, isFreshAI: boolean = false) => {
    const normalizedRecipe = {
      ...recipe,
      title: recipe.title?.toString().trim() || "AI Generated Recipe",
      description: recipe.description?.toString().trim() || "",
      difficulty: recipe.difficulty?.toString().trim() || "Moderate",
      servings: recipe.servings || 4,
      prepTime: (recipe.prepTime?.toString().trim() || "15 minutes"),
      cookTime: (recipe.cookTime?.toString().trim() || "30 minutes"),
      totalTime: recipe.totalTime?.toString().trim() || "",
      ingredients: (recipe.ingredients || []).map((ing: any) => ({
        item: ing.item?.toString().trim() || ing.name?.toString().trim() || "",
        amount: ing.amount?.toString().trim() || ing.qty?.toString().trim() || "",
        unit: ing.unit?.toString().trim() || ing.unit_of_measurement?.toString().trim() || "",
      })),
      instructions: (recipe.instructions || []).map((inst: any) => 
        typeof inst === "string" ? inst.trim() : inst
      ),
      nutritionInfo: recipe.nutritionInfo || recipe.nutritionPer100g || recipe.nutrition_per_100g || null,
    }

    setSelectedRecipe(normalizedRecipe)
    setStage("recipe")

    if (isFreshAI && formData) {
      try {
        const response = await fetch('/api/ai-chef/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe: normalizedRecipe,
            userInput: {
              description: formData.description,
              country: formData.country,
              protein: formData.protein,
              taste: formData.taste,
              ingredients: formData.ingredients,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Recipe saved to Firebase:", result.recipeId);
        } else {
          console.error("Error saving recipe to Firebase:", await response.text());
        }
      } catch (err) {
        console.error("Error saving recipe to Firebase:", err);
        // Don't block UI if save fails
      }
    }
  }

  // STAGE 1: Form
  if (stage === "form") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
          {/* Header - Centered */}
          <div className="mb-16 max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              AI Chef
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Describe what you'd like to cook and we'll find matching recipes or generate something new with AI.
            </p>
          </div>

          {/* Form - Centered */}
          <form onSubmit={handleSubmit(onSearch)} className="space-y-8 max-w-2xl mx-auto">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold text-foreground">
                What would you like to cook?
              </Label>
              <Textarea
                id="description"
                placeholder="e.g., A quick weeknight dinner, something spicy and filling, a dessert for guests..."
                {...register("description")}
                className="min-h-32 border-shadow-gray focus:border-primary bg-background dark:bg-background resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Cuisine & Protein */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold text-foreground">
                  Cuisine
                </Label>
                <select
                  id="country"
                  {...register("country")}
                  className="w-full px-4 py-2.5 rounded-lg border border-shadow-gray bg-background dark:bg-background text-foreground focus:border-primary focus:ring-0 transition-colors"
                >
                  <option value="">Choose cuisine...</option>
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm font-semibold text-foreground">
                  Protein
                </Label>
                <select
                  id="protein"
                  {...register("protein")}
                  className="w-full px-4 py-2.5 rounded-lg border border-shadow-gray bg-background dark:bg-background text-foreground focus:border-primary focus:ring-0 transition-colors"
                >
                  <option value="">Choose protein...</option>
                  {PROTEINS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.protein && (
                  <p className="text-sm text-destructive">{errors.protein.message}</p>
                )}
              </div>
            </div>

            {/* Taste Profiles */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Taste profiles (optional)
              </Label>
              <Controller
                name="taste"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          (field.value || []).includes(taste)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-primary/10"
                        }`}
                      >
                        {taste}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.taste && (
                <p className="text-sm text-destructive">{errors.taste.message}</p>
              )}
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Ingredients (optional)
              </Label>
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
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            (field.value || []).includes(ingredient)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-primary/10"
                          }`}
                        >
                          {ingredient}
                        </button>
                      ))}
                    </div>
                    {(field.value || []).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(field.value || []).length} selected
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // STAGE 2: Results with Two Tabs
  if (stage === "results" && searchResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
          {/* Back Button */}
          <button
            onClick={() => {
              setStage("form")
              setSearchResults(null)
              setSelectedRecipe(null)
              reset()
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </button>

          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Search Results
            </h2>
            <p className="text-muted-foreground">
              Choose from suggestions below or check the AI-generated recipe
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-shadow-gray mb-12">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("suggestions")}
                className={`pb-3 font-semibold text-sm transition-colors ${
                  activeTab === "suggestions"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Suggestions ({searchResults.recipePosts?.length || 0})
              </button>
              {searchResults.freshResponse && (
                <button
                  onClick={() => setActiveTab("generated")}
                  className={`pb-3 font-semibold text-sm transition-colors ${
                    activeTab === "generated"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Generated Recipe
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "suggestions" && (
            <div>
              {searchResults.recipePosts && searchResults.recipePosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.recipePosts.map((post: any) => (
                    <div
                      key={post.id || post.slug}
                      className="cursor-pointer"
                      onClick={() => handleViewRecipe(post, false)}
                    >
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
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No matching recipes found in our database</p>
                  <p className="text-sm text-muted-foreground">Check the AI Generated Recipe tab for a fresh suggestion</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "generated" && searchResults.freshResponse && (
            <div
              className="cursor-pointer rounded-lg border border-shadow-gray hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 overflow-hidden"
              onClick={() => handleViewRecipe(searchResults.freshResponse, true)}
            >
              {/* Header Section */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-2 mb-4">
                  <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    AI Generated Recipe
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
                    {searchResults.freshResponse.title}
                  </h3>
                </div>

                {searchResults.freshResponse.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {searchResults.freshResponse.description}
                  </p>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Prep Time</p>
                    <p className="font-bold text-foreground">{searchResults.freshResponse.prepTime || "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Cook Time</p>
                    <p className="font-bold text-foreground">{searchResults.freshResponse.cookTime || "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Servings</p>
                    <p className="font-bold text-foreground">{searchResults.freshResponse.servings || "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Difficulty</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                      {searchResults.freshResponse.difficulty || "Moderate"}
                    </span>
                  </div>
                </div>

                {/* CTA with enhanced styling */}
                <div className="flex items-center justify-start pt-4 border-t border-shadow-gray">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Click to view full recipe</span>
                    <ChefHat className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // STAGE 3: Recipe Display
  if (stage === "recipe" && selectedRecipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-8 md:py-12">
          {/* Back Button */}
          <button
            onClick={() => {
              setStage("results")
              setSelectedRecipe(null)
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </button>

          {/* Recipe Content */}
          <RecipeResult recipe={selectedRecipe} />
        </div>
      </div>
    )
  }

  return null
}
