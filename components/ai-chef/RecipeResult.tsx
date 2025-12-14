"use client"

import { RecipeResponse } from "@/types/ai-chef"
import { Clock, Users, ChefHat, Flame, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RecipeResultProps {
  recipe: RecipeResponse
}

export function RecipeResult({ recipe }: RecipeResultProps) {
  const handleShare = async () => {
    const text = `Check out this AI-generated recipe: ${recipe.title}

Prep Time: ${recipe.prepTime}
Cook Time: ${recipe.cookTime}
Servings: ${recipe.servings}

From AI Chef on World Food Recipes`

    if (navigator.share) {
      await navigator.share({
        title: recipe.title,
        text: text,
      })
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text)
      alert("Recipe copied to clipboard!")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <article className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
      <header className="mx-auto max-w-screen-md mb-8">
        {/* AI Badge */}
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold uppercase tracking-wider">
          AI Generated Recipe
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white lg:leading-tight mb-8 font-serif">
          {recipe.title}
        </h1>

        {/* Recipe Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 bg-muted/30 p-6 rounded-lg">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Prep Time</p>
            <p className="font-bold text-foreground">{recipe.prepTime}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Cook Time</p>
            <p className="font-bold text-foreground">{recipe.cookTime}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Servings</p>
            <p className="font-bold text-foreground">{recipe.servings}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Difficulty</p>
            <p className="font-bold text-foreground text-sm">{recipe.difficulty || "Moderate"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap mb-8 pb-8 border-b border-shadow-gray">
          <Button
            onClick={handleShare}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Print
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-md">
        {/* Ingredients Section */}
        <div className="mb-12 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="inline-block w-5 h-5 bg-primary text-white rounded-full text-center text-xs leading-5 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <div className="font-medium text-foreground">{ing.item}</div>
                  <div className="text-sm text-muted-foreground">
                    {ing.amount} {ing.unit}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-12 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  {idx + 1}
                </div>
                <p className="text-foreground pt-0.5">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>


      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground border-t pt-4 max-w-screen-md mx-auto">
        <p>This recipe was generated by AI Chef using Gemini 2.5 Flash-Lite</p>
        <p className="mt-1">
          Results may vary. Always exercise caution when cooking with new ingredients.
        </p>
      </div>
    </article>
  )
}
