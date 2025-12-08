"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, ChefHat, Calendar } from "lucide-react"
import { toast } from "sonner"

interface AIRecipe {
  id: string
  title: string
  servings?: string
  prepTime?: string
  cookTime?: string
  difficulty?: string
  ingredients?: any[]
  instructions?: string[]
  nutritionInfo?: any
  userInput?: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  }
  createdAt?: any
  isPublished?: boolean
  source?: string
}

export function AIRecipesTab() {
  const [aiRecipes, setAIRecipes] = useState<AIRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [converting, setConverting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAIRecipes()
  }, [])

  async function fetchAIRecipes() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/ai-recipes")
      if (!response.ok) throw new Error("Failed to fetch AI recipes")
      const data = await response.json()
      setAIRecipes(data)
    } catch (error) {
      console.error("Error fetching AI recipes:", error)
      toast.error("Failed to load AI recipes")
    } finally {
      setLoading(false)
    }
  }

  function handleConvertToRecipePost(recipe: AIRecipe) {
    // Navigate to recipe creation page with pre-filled data
    // Format ingredients properly - handle both object and string formats
    const formatIngredients = (ingredients: any[]): string => {
      if (!Array.isArray(ingredients)) return ""
      return ingredients
        .map((ing: any) => {
          if (typeof ing === "string") return ing
          const item = ing.item || ""
          const amount = ing.amount || ""
          const unit = ing.unit || ""
          // Only add amount/unit if they exist
          if (amount && unit) {
            return `${item} - ${amount} ${unit}`
          } else if (amount) {
            return `${item} - ${amount}`
          } else if (unit) {
            return `${item} - ${unit}`
          }
          return item
        })
        .filter(Boolean)
        .join("\n")
    }

    const recipeData = {
      title: recipe.title,
      content: Array.isArray(recipe.instructions) ? recipe.instructions.join("\n\n") : recipe.instructions || "",
      excerpt: recipe.userInput?.description || "",
      prepTime: recipe.prepTime || "",
      cookTime: recipe.cookTime || "",
      servings: recipe.servings || "",
      difficulty: recipe.difficulty || "Easy",
      ingredients: formatIngredients(recipe.ingredients || []),
      tags: [recipe.userInput?.country || "", recipe.userInput?.protein || "", ...recipe.userInput?.taste || []].filter(Boolean),
      nutrition: recipe.nutritionInfo ? JSON.stringify(recipe.nutritionInfo) : "",
      aiRecipeId: recipe.id,
    }

    // Encode and pass via URL state
    const encodedData = encodeURIComponent(JSON.stringify(recipeData))
    router.push(`/admin/create?ai=${encodedData}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (aiRecipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No AI-generated recipes yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Generate recipes on the AI Chef page and they'll appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-500" />
            AI Generated Recipes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {aiRecipes.length} recipe{aiRecipes.length !== 1 ? "s" : ""} ready to be converted to recipe posts
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Recipe Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Source</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Prep Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cook Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Servings</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {aiRecipes.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{recipe.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {recipe.userInput?.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                    {recipe.userInput?.country || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{recipe.prepTime || "—"}</td>
                <td className="px-6 py-4 text-sm text-foreground">{recipe.cookTime || "—"}</td>
                <td className="px-6 py-4 text-sm text-foreground">{recipe.servings || "—"}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {recipe.createdAt
                    ? typeof recipe.createdAt === "string"
                      ? new Date(recipe.createdAt).toLocaleDateString()
                      : recipe.createdAt.seconds
                        ? new Date(recipe.createdAt.seconds * 1000).toLocaleDateString()
                        : "—"
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <Button
                    onClick={() => handleConvertToRecipePost(recipe)}
                    disabled={converting === recipe.id}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-sm py-1 px-3"
                  >
                    {converting === recipe.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        Converting...
                      </>
                    ) : (
                      "Convert to Post"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {aiRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {recipe.userInput?.description}
                  </CardDescription>
                </div>
                <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                  {recipe.userInput?.country || "—"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Prep Time</p>
                  <p className="font-medium">{recipe.prepTime || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cook Time</p>
                  <p className="font-medium">{recipe.cookTime || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Servings</p>
                  <p className="font-medium">{recipe.servings || "—"}</p>
                </div>
              </div>
              <Button
                onClick={() => handleConvertToRecipePost(recipe)}
                disabled={converting === recipe.id}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
              >
                {converting === recipe.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  "Convert to Recipe Post"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
