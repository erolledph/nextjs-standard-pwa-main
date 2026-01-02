"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchBar } from "@/components/ui/search-bar"
import { RecipePostCard } from "@/components/blog/RecipePostCard"

interface FavoriteRecipe {
  id: string
  title: string
  slug: string
  excerpt?: string
  image?: string
  difficulty?: string
  prepTime?: string
  cookTime?: string
  servings?: number
  author?: string
  tags?: string[]
  isAiChefRecipe?: boolean
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true)
      
      // Load regular recipes from favoriteRecipes
      const regularStored = localStorage.getItem("favoriteRecipes")
      let allFavorites: FavoriteRecipe[] = []
      
      if (regularStored) {
        try {
          const regularRecipes = JSON.parse(regularStored)
          // Mark all regular recipes as NOT AI recipes
          allFavorites = regularRecipes.map((r: any) => ({
            ...r,
            isAiChefRecipe: false
          }))
        } catch (error) {
          console.error("Error loading regular favorites:", error)
        }
      }
      
      // Load AI Chef recipe IDs from ai-chef-favorites
      const aiStored = localStorage.getItem("ai-chef-favorites")
      if (aiStored) {
        try {
          const aiIds = JSON.parse(aiStored) || []
          
          // Create AI favorites with isAiChefRecipe: true flag
          if (aiIds.length > 0) {
            // Fetch full details for AI recipes to get images and other data
            try {
              const response = await fetch("/api/admin/ai-recipes", {
                credentials: "include"
              })
              if (response.ok) {
                const data = await response.json()
                const allAiRecipes = data.recipes || []
                
                // Match favorited IDs with full recipe data
                const aiFavorites = aiIds.map((id: string) => {
                  const fullRecipe = allAiRecipes.find((r: any) => r.id === id)
                  return {
                    ...(fullRecipe || {}),
                    image: fullRecipe?.imageUrl || fullRecipe?.image,
                    id,
                    slug: id,
                    title: fullRecipe?.title || `AI Recipe ${id.substring(0, 8)}...`,
                    isAiChefRecipe: true
                  }
                })
                allFavorites = [...allFavorites, ...aiFavorites]
              } else {
                // If API fails, still create AI recipe entries with flag
                const aiFavorites = aiIds.map((id: string) => ({
                  id,
                  title: `AI Recipe ${id.substring(0, 8)}...`,
                  slug: id,
                  isAiChefRecipe: true
                }))
                allFavorites = [...allFavorites, ...aiFavorites]
              }
            } catch (error) {
              console.error("Error fetching AI recipe details:", error)
              // Fallback: use placeholder data with proper flag
              const aiFavorites = aiIds.map((id: string) => ({
                id,
                title: `AI Recipe ${id.substring(0, 8)}...`,
                slug: id,
                isAiChefRecipe: true
              }))
              allFavorites = [...allFavorites, ...aiFavorites]
            }
          }
        } catch (error) {
          console.error("Error loading AI favorites:", error)
        }
      }
      
      setFavorites(allFavorites)
      setFilteredFavorites(allFavorites)
      setLoading(false)
    }
    
    loadFavorites()
  }, [])

  // Local search for favorites
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFavorites(favorites)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = favorites.filter((recipe) => {
        return (
          recipe.title.toLowerCase().includes(term) ||
          recipe.excerpt?.toLowerCase().includes(term) ||
          recipe.difficulty?.toLowerCase().includes(term) ||
          recipe.prepTime?.toLowerCase().includes(term)
        )
      })
      setFilteredFavorites(filtered)
    }
  }, [searchTerm, favorites])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Local search handles it automatically via useEffect
  }

  const removeFavorite = (slug: string, isAiChef: boolean = false) => {
    const updated = favorites.filter(fav => fav.slug !== slug)
    setFavorites(updated)
    
    if (isAiChef) {
      // Remove from ai-chef-favorites
      const aiIds = JSON.parse(localStorage.getItem("ai-chef-favorites") || "[]")
      const filtered = aiIds.filter((id: string) => id !== slug)
      localStorage.setItem("ai-chef-favorites", JSON.stringify(filtered))
    } else {
      // Remove from regular favorites
      const regularFavs = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]")
      const filtered = regularFavs.filter((fav: any) => fav.slug !== slug)
      localStorage.setItem("favoriteRecipes", JSON.stringify(filtered))
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="container mx-auto xl:px-5 max-w-screen-lg">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>My Favorites</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">Recipes you've saved to your collection</p>
        </header>

        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding recipes to your favorites by clicking the heart icon on any recipe
            </p>
            <a href="/recipes">
              <Button style={{ backgroundColor: '#FF7518', color: 'white' }}>
                Explore Recipes
              </Button>
            </a>
          </Card>
        ) : (
          <div>
            <SearchBar
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
            />

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-lg font-semibold text-foreground mb-2">No matching recipes</h2>
                <p className="text-muted-foreground">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((recipe) => {
                  const isAiChef = recipe.isAiChefRecipe
                  const href = isAiChef ? `/ai-chef/${recipe.slug}` : `/recipes/${recipe.slug}`
                  return (
                    <div key={recipe.slug}>
                      <RecipePostCard
                        id={recipe.id}
                        title={recipe.title}
                        slug={recipe.slug}
                        excerpt={recipe.excerpt}
                        date={recipe.image ? "" : new Date().toLocaleDateString()}
                        author={isAiChef ? "AI Chef" : recipe.author || "Author"}
                        tags={recipe.tags || []}
                        image={recipe.image}
                        prepTime={recipe.prepTime}
                        cookTime={recipe.cookTime}
                        servings={String(recipe.servings || 4)}
                        difficulty={recipe.difficulty}
                        href={href}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
