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
} from "lucide-react"
import { RecipeResult } from "./RecipeResult"
import { RecipePostCard } from "@/components/blog/RecipePostCard"

interface SearchResult {
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
        searchData = await response.json()
      }

      // Generate fresh AI response immediately
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!apiKey) throw new Error("Gemini API key not configured")

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

      const systemPrompt = `You are a professional chef and recipe generator specializing in ${data.country} cuisine.

CRITICAL: You MUST return ONLY valid JSON in this EXACT format with ALL required fields:
{
  "title": "Recipe Name",
  "description": "A short 1-2 sentence description",
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
EVERY FIELD IS REQUIRED.`

      const userPrompt = `Generate a delicious authentic ${data.country} recipe featuring ${data.protein} with these characteristics:
- Description: ${data.description}
- Taste profile: ${data.taste.join(", ")}
- Key ingredients: ${data.ingredients.slice(0, 5).join(", ")}

Return ONLY the JSON object with no additional text.`

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

      // Show results with both tabs immediately
      const results: SearchResult = {
        ...searchData,
        freshResponse: freshResponse,
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
      prepTime: recipe.prepTime || recipe.prep_time || "",
      cookTime: recipe.cookTime || recipe.cook_time || "",
      totalTime: recipe.totalTime || recipe.total_time || "",
      ingredients: (recipe.ingredients || []).map((ing: any) => ({
        item: ing.item || ing.name || "",
        amount: ing.amount || ing.qty || "",
        unit: ing.unit || ing.unit_of_measurement || "",
      })),
      nutritionPer100g: recipe.nutritionPer100g || recipe.nutrition_per_100g || null,
    }

    setSelectedRecipe(normalizedRecipe)
    setStage("recipe")

    if (isFreshAI && formData) {
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

        await fetch("/api/ai-chef/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savePayload),
        })
      } catch (err) {
        console.error("Error saving recipe:", err)
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
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground flex-1" style={{ fontFamily: 'Georgia, serif' }}>
                    {searchResults.freshResponse.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary whitespace-nowrap">
                    AI Generated
                  </span>
                </div>

                {searchResults.freshResponse.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {searchResults.freshResponse.description}
                  </p>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-shadow-gray">
                  {searchResults.freshResponse.prepTime && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Prep Time</p>
                      <p className="font-bold text-foreground">{searchResults.freshResponse.prepTime}</p>
                    </div>
                  )}
                  {searchResults.freshResponse.cookTime && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Cook Time</p>
                      <p className="font-bold text-foreground">{searchResults.freshResponse.cookTime}</p>
                    </div>
                  )}
                  {searchResults.freshResponse.servings && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Servings</p>
                      <p className="font-bold text-foreground">{searchResults.freshResponse.servings}</p>
                    </div>
                  )}
                  {searchResults.freshResponse.difficulty && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Difficulty</p>
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                        {searchResults.freshResponse.difficulty}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <p className="text-sm text-muted-foreground mt-6 font-medium">
                  Click to view full recipe →
                </p>
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
