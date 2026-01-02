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
  type?: "recipe" | "ai-recipe" // Add type to distinguish recipe sources
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load both regular and AI chef favorites
    const regularFavorites = localStorage.getItem("favoriteRecipes")
    const aiChefFavorites = localStorage.getItem("ai-chef-favorites")
    
    let allFavorites: FavoriteRecipe[] = []
    
    if (regularFavorites) {
      try {
        allFavorites = JSON.parse(regularFavorites).map((fav: any) => ({
          ...fav,
          type: "recipe"
        }))
      } catch (error) {
        console.error("Error loading regular favorites:", error)
      }
    }
    
    if (aiChefFavorites) {
      try {
        const aiIds = JSON.parse(aiChefFavorites) || []
        // For AI recipes, we only have IDs, need to fetch full recipe data
        // For now, we'll store them with type indicator
        aiIds.forEach((id: string) => {
          allFavorites.push({
            id,
            title: `AI Recipe ${id.substring(0, 8)}...`, // Placeholder
            slug: id,
            type: "ai-recipe"
          })
        })
      } catch (error) {
        console.error("Error loading AI chef favorites:", error)
      }
    }
    
    setFavorites(allFavorites)
    setMounted(true)
  }, [])

  const isFavorited = (slugOrId: string) => {
    return favorites.some(fav => fav.slug === slugOrId || fav.id === slugOrId)
  }

  const addFavorite = (recipe: FavoriteRecipe) => {
    const type = recipe.type || "recipe"
    
    if (!isFavorited(recipe.slug)) {
      const updated = [...favorites, { ...recipe, type }]
      setFavorites(updated)
      
      // Save to appropriate localStorage based on type
      if (type === "ai-recipe") {
        const aiIds = JSON.parse(localStorage.getItem("ai-chef-favorites") || "[]")
        if (!aiIds.includes(recipe.id)) {
          aiIds.push(recipe.id)
          localStorage.setItem("ai-chef-favorites", JSON.stringify(aiIds))
        }
      } else {
        const regularFavs = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]")
        regularFavs.push(recipe)
        localStorage.setItem("favoriteRecipes", JSON.stringify(regularFavs))
      }
    }
  }

  const removeFavorite = (slugOrId: string, type?: "recipe" | "ai-recipe") => {
    const updated = favorites.filter(fav => fav.slug !== slugOrId && fav.id !== slugOrId)
    setFavorites(updated)
    
    // Remove from appropriate localStorage based on type
    const foundFav = favorites.find(fav => fav.slug === slugOrId || fav.id === slugOrId)
    const favType = type || foundFav?.type || "recipe"
    
    if (favType === "ai-recipe") {
      const aiIds = JSON.parse(localStorage.getItem("ai-chef-favorites") || "[]")
      const filteredAi = aiIds.filter((id: string) => id !== slugOrId)
      localStorage.setItem("ai-chef-favorites", JSON.stringify(filteredAi))
    } else {
      const regularFavs = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]")
      const filtered = regularFavs.filter((fav: any) => fav.slug !== slugOrId)
      localStorage.setItem("favoriteRecipes", JSON.stringify(filtered))
    }
  }

  const toggleFavorite = (recipe: FavoriteRecipe) => {
    if (isFavorited(recipe.slug)) {
      removeFavorite(recipe.slug, recipe.type)
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
