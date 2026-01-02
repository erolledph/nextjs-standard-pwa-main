"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
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
}

interface RecipesListProps {
  recipes: Recipe[]
}

export function RecipesListClient({ recipes }: RecipesListProps) {
  const { isFavorited, toggleFavorite, mounted } = useFavorites()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading state for 300ms to show skeleton
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-8">No recipes published yet</p>
        <Link href="/admin/login">
          <Button size="lg" className="rounded-full px-8 h-12 font-medium">Start creating recipes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <SearchBar
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <RecipePostCardSkeleton key={i} />)
          : recipes.map((recipe) => {
              const isFav = mounted && isFavorited(recipe.slug)
              return (
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
                  isFavorited={isFav}
                  onToggleFavorite={() =>
                    toggleFavorite({
                      id: recipe.id,
                      title: recipe.title,
                      slug: recipe.slug,
                      excerpt: recipe.excerpt,
                      image: recipe.image,
                      difficulty: recipe.difficulty,
                      prepTime: recipe.prepTime,
                      cookTime: recipe.cookTime,
                      type: "recipe"
                    })
                  }
                />
              )
            })}
      </div>
    </div>
  )
}
