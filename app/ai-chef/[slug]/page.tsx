export const runtime = 'edge'
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { RecipeResult } from "@/components/ai-chef/RecipeResult"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { RecipeResponse } from "@/types/ai-chef"

async function fetchRecipe(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/ai-chef/get-recipe?id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.recipe
  } catch (err) {
    console.error("Error fetching recipe:", err)
    return null
  }
}

export default function SharedRecipePage() {
  const params = useParams()
  const slug = params.slug as string
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch recipe from Firebase by ID/slug
        const response = await fetch(`/api/ai-chef/get-recipe?id=${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Recipe not found. The shared link may be broken or expired.")
          } else {
            setError("Failed to load recipe. Please try again later.")
          }
          setRecipe(null)
          return
        }

        const data = await response.json()
        setRecipe(data.recipe)
      } catch (err) {
        console.error("Error fetching recipe:", err)
        setError("Failed to load recipe. Please try again later.")
        setRecipe(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchRecipe()
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-8 md:py-12">
          <Link
            href="/ai-chef"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI Chef
          </Link>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Recipe
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error || "This recipe could not be loaded."}
            </p>
            <Link
              href="/ai-chef"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-8 md:py-12">
        <Link
          href="/ai-chef"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Chef
        </Link>

        {/* Recipe Content */}
        <RecipeResult recipe={recipe} recipeId={slug} />

        {/* JSON-LD Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Recipe',
              name: recipe.title,
              description: recipe.description || `AI-generated ${recipe.cuisine} recipe`,
              author: {
                '@type': 'Organization',
                name: 'World Food Recipes - AI Chef',
              },
              prepTime: `PT${recipe.prepTime}`,
              cookTime: `PT${recipe.cookTime}`,
              totalTime: `PT${recipe.totalTime || recipe.prepTime}`,
              recipeYield: `${recipe.servings} servings`,
              recipeCategory: recipe.cuisine || 'World',
              recipeCuisine: recipe.cuisine || 'International',
              recipeIngredient: recipe.ingredients?.map((ing) => 
                `${ing.amount} ${ing.unit} ${ing.item}`.trim()
              ) || [],
              recipeInstructions: recipe.instructions?.map((instruction, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: instruction,
              })) || [],
              keywords: [recipe.title, recipe.cuisine].filter(Boolean).join(', '),
              isAccessibleForFree: true,
            }),
          }}
        />
      </div>
    </div>
  )
}

