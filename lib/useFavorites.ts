import { useState, useEffect } from "react"

export interface FavoriteRecipe {
  id: string
  title: string
  slug: string
  excerpt?: string
  image?: string
  difficulty?: string
  prepTime?: string
  cookTime?: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("favoriteRecipes")
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading favorites:", error)
      }
    }
    setMounted(true)
  }, [])

  const isFavorited = (slug: string) => {
    return favorites.some(fav => fav.slug === slug)
  }

  const addFavorite = (recipe: FavoriteRecipe) => {
    const updated = [...favorites, recipe]
    setFavorites(updated)
    localStorage.setItem("favoriteRecipes", JSON.stringify(updated))
  }

  const removeFavorite = (slug: string) => {
    const updated = favorites.filter(fav => fav.slug !== slug)
    setFavorites(updated)
    localStorage.setItem("favoriteRecipes", JSON.stringify(updated))
  }

  const toggleFavorite = (recipe: FavoriteRecipe) => {
    if (isFavorited(recipe.slug)) {
      removeFavorite(recipe.slug)
    } else {
      addFavorite(recipe)
    }
  }

  return {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    mounted
  }
}
