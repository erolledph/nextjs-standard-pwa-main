"use client"

/**
 * AI Chef Form Component
 * Collects user input for recipe generation with validation
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
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { RecipeResult } from "./RecipeResult"

export function AIChefForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<any | null>(null)

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

  const onSubmit = async (data: AIChefInputType) => {
    console.log("🔴 [1] Form submitted with data:", data)
    setIsLoading(true)
    setError(null)
    setRecipe(null)

    try {
      // Import Gemini SDK
      console.log("🟡 [2] Importing Google Generative AI SDK...")
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      console.log("🟢 [3] SDK imported successfully")

      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment")
      }
      console.log("🟢 [4] API key found in environment")

      // Initialize client
      console.log("🟡 [5] Initializing Google Generative AI client...")
      const genAI = new GoogleGenerativeAI(apiKey)
      console.log("🟢 [6] Client initialized")

      // Get model
      console.log("🟡 [7] Getting Gemini model (gemini-2.5-flash-lite)...")
      const systemPrompt = `You are a professional chef and recipe generator. Generate a delicious recipe based on user preferences.
Return ONLY valid JSON with this exact structure, no markdown code blocks:
{
  "title": "string - recipe name",
  "description": "string - short description",
  "servings": "number",
  "prepTime": "string - e.g., 15 minutes",
  "cookTime": "string - e.g., 30 minutes",
  "totalTime": "string - e.g., 45 minutes",
  "difficulty": "string - Easy, Medium, or Hard",
  "ingredients": [{"item": "string", "amount": "string", "unit": "string"}],
  "instructions": ["string - numbered steps"],
  "nutritionPer100g": {"calories": "number", "protein": "number", "carbs": "number", "fat": "number"},
  "cuisine": "string"
}`

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: systemPrompt,
      })
      console.log("🟢 [8] Model initialized")

      // Build prompt
      const userPrompt = `Generate a delicious ${data.country} recipe with ${data.protein} as the main protein.

User description: ${data.description}
Taste preferences: ${(data.taste || []).join(", ")}
Include these ingredients: ${(data.ingredients || []).join(", ")}

Create a detailed recipe that matches these preferences. Return ONLY valid JSON, no markdown.`

      console.log("🟡 [9] Sending request to Gemini API...")
      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      })

      console.log("🟢 [10] Response received from Gemini API")
      const text = response.response.text()
      console.log("🟡 [11] Response text length:", text.length)
      console.log("🟡 [12] Response text (first 300 chars):", text.substring(0, 300))

      // Parse JSON
      console.log("🟡 [13] Parsing JSON response...")
      const cleanText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()
      const result = JSON.parse(cleanText)
      console.log("🟢 [14] JSON parsed successfully")
      console.log("🟢 [15] Recipe keys:", Object.keys(result))

      console.log("🟢 [16] Setting recipe state...")
      setRecipe(result)
      reset()
      console.log("🟢 [17] Form submission complete!")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate recipe"
      console.error("🔴 [ERROR] Form submission error:", errorMessage, err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      console.log("🟡 [18] Loading state set to false")
    }
  }

  // If recipe is generated, show result
  if (recipe) {
    return (
      <div className="space-y-6">
        <RecipeResult recipe={recipe} />
        <Button
          variant="outline"
          onClick={() => {
            setRecipe(null)
          }}
          className="w-full"
        >
          Generate Another Recipe
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Recipe Context
          </Label>
          <Textarea
            id="description"
            placeholder="e.g., Quick weeknight dinner with fresh herbs, something light and healthy..."
            className="min-h-[100px] resize-none"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Describe what you're looking for (10-500 characters)
          </p>
        </div>

        {/* Country/Cuisine */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-base font-semibold">
            Cuisine Type
          </Label>
          <select
            id="country"
            {...register("country")}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">Select a cuisine...</option>
            {CUISINES.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>

        {/* Protein Type */}
        <div className="space-y-2">
          <Label htmlFor="protein" className="text-base font-semibold">
            Protein
          </Label>
          <select
            id="protein"
            {...register("protein")}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">Select a protein...</option>
            {PROTEINS.map((protein) => (
              <option key={protein} value={protein}>
                {protein}
              </option>
            ))}
          </select>
          {errors.protein && (
            <p className="text-sm text-red-500">{errors.protein.message}</p>
          )}
        </div>

        {/* Taste Profiles */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Taste Profiles (select 1-3)
          </Label>
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
                      const currentValues = field.value || []
                      const newTastes = currentValues.includes(taste)
                        ? currentValues.filter((t: string) => t !== taste)
                        : [...currentValues, taste].slice(-3) // Max 3
                      field.onChange(newTastes)
                    }}
                    className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                      (field.value || []).includes(taste)
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                        : "border-border hover:border-orange-300"
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
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Available Ingredients (select 3-20)
          </Label>
          <Controller
            name="ingredients"
            control={control}
            render={({ field }) => (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-muted/50">
                  {INGREDIENTS_OPTIONS.map((ingredient) => (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => {
                        const currentValues = field.value || []
                        const newIngredients = currentValues.includes(
                          ingredient
                        )
                          ? currentValues.filter((i: string) => i !== ingredient)
                          : [...currentValues, ingredient]
                        field.onChange(newIngredients)
                      }}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
                        (field.value || []).includes(ingredient)
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                          : "border-border hover:border-orange-300"
                      }`}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selected: {(field.value || []).length}/20
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
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Generate Recipe
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Powered by AI Chef • Gemini 2.5 Flash-Lite
        </p>
      </form>
    </div>
  )
}
