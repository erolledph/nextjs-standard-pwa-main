"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Clock, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchBar } from "@/components/ui/search-bar"

interface FavoriteRecipe {
  id: string
  title: string
  slug: string
  excerpt?: string
  image?: string
  difficulty?: string
  prepTime?: string
  cookTime?: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("favoriteRecipes")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFavorites(parsed)
        setFilteredFavorites(parsed)
      } catch (error) {
        console.error("Error loading favorites:", error)
      }
    }
    setLoading(false)
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

  const removeFavorite = (slug: string) => {
    const updated = favorites.filter(fav => fav.slug !== slug)
    setFavorites(updated)
    localStorage.setItem("favoriteRecipes", JSON.stringify(updated))
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
            <Link href="/recipes">
              <Button style={{ backgroundColor: '#FF7518', color: 'white' }}>
                Explore Recipes
              </Button>
            </Link>
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
              <div className="space-y-8">
                {filteredFavorites.map((recipe) => (
                  <article key={recipe.slug} className="border-b border-shadow-gray pb-8 last:border-b-0">
                    <Link href={`/recipes/${recipe.slug}`} className="group">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Recipe Image */}
                        {recipe.image && (
                          <div className="md:flex-shrink-0 md:w-64 h-48 md:h-auto overflow-hidden rounded-lg">
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Recipe Info */}
                        <div className="flex-1">
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                            {recipe.title}
                          </h2>

                          {recipe.excerpt && (
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {recipe.excerpt}
                            </p>
                          )}

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                            {recipe.difficulty && (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  recipe.difficulty === 'Easy' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
                                  recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                }`}>
                                  {recipe.difficulty}
                                </span>
                              </div>
                            )}
                            {recipe.prepTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>Prep: {recipe.prepTime}</span>
                              </div>
                            )}
                            {recipe.cookTime && (
                              <div className="flex items-center gap-2">
                                <ChefHat className="w-4 h-4 text-primary" />
                                <span>Cook: {recipe.cookTime}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-4 border-t border-shadow-gray">
                            <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
                              View Recipe →
                            </Button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                removeFavorite(recipe.slug)
                              }}
                              className="ml-auto text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Heart className="w-4 h-4" fill="currentColor" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
