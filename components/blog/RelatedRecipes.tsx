"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RecipePostCard } from "@/components/blog/RecipePostCard"
import { RecipePostCardSkeleton } from "@/components/blog/RecipePostCardSkeleton"
import { useFavorites } from "@/lib/useFavorites"

interface Recipe {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  prepTime?: string
  cookTime?: string
  servings?: string
  difficulty?: string
  content?: string
}

interface RelatedRecipesProps {
  currentSlug: string
  currentTags?: string[]
  heading?: string
  subheading?: string
  showCTA?: boolean
  limit?: number
}

export function RelatedRecipes({
  currentSlug,
  currentTags = [],
  heading = "Related",
  subheading = "Recipes",
  showCTA = true,
  limit = 3
}: RelatedRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const { isFavorited, toggleFavorite } = useFavorites()

  useEffect(() => {
    async function fetchRelatedRecipes() {
      try {
        const response = await fetch("/api/recipes")
        if (!response.ok) throw new Error("Failed to fetch recipes")
        const data: Recipe[] = await response.json()

        // Filter out current recipe
        let filteredRecipes = data.filter((recipe) => recipe.slug !== currentSlug)

        // If current recipe has tags, prioritize recipes with matching tags
        if (currentTags.length > 0) {
          // Score recipes based on tag matches
          const scoredRecipes = filteredRecipes.map((recipe) => {
            const matchedTags = recipe.tags?.filter((tag) =>
              currentTags.includes(tag)
            ) || []
            return {
              ...recipe,
              tagMatchCount: matchedTags.length,
            }
          })

          // Sort by tag match count (descending), then by date (descending)
          scoredRecipes.sort((a, b) => {
            if (b.tagMatchCount !== a.tagMatchCount) {
              return b.tagMatchCount - a.tagMatchCount
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })

          filteredRecipes = scoredRecipes.map(({ tagMatchCount, ...recipe }) => recipe)
        } else {
          // Fallback: sort by date if no tags
          filteredRecipes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        setRecipes(filteredRecipes.slice(0, limit))
      } catch (err) {
        console.error("Failed to load related recipes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedRecipes()
  }, [currentSlug, currentTags, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <RecipePostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No related recipes found</p>
        <Link href="/recipes">
          <Button>View all recipes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipePostCard
            key={recipe.id}
            id={recipe.id}
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
            isFavorited={isFavorited(recipe.slug)}
            onToggleFavorite={() => {
              toggleFavorite({
                id: recipe.id,
                title: recipe.title,
                slug: recipe.slug,
                excerpt: recipe.excerpt,
                image: recipe.image,
                difficulty: recipe.difficulty,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
              })
            }}
          />
        ))}
      </div>

      {showCTA && recipes.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/recipes">
            <Button variant="outline">View all recipes →</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
