"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, UtensilsCrossed, Heart } from "lucide-react"
import { BlogPostCard } from "@/components/blog/BlogPostCard"
import { RecipePostCard } from "@/components/blog/RecipePostCard"
import { BlogPostCardSkeleton } from "@/components/blog/BlogPostCardSkeleton"
import { RecipePostCardSkeleton } from "@/components/blog/RecipePostCardSkeleton"
import { typography, responsive, gradients, spacing, interactive } from "@/lib/design-system"

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  content?: string
}

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

interface HomePageProps {
  recentPosts?: Post[]
  recentRecipes?: Recipe[]
}

export function HomePage({ recentPosts = [], recentRecipes = [] }: HomePageProps) {
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

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className={`relative w-full min-h-screen flex flex-col items-center justify-center ${spacing.pageX} ${spacing.pageY} overflow-hidden`}>
        {/* Background Gradient and Decorative Elements */}
        <div className={`absolute inset-0 ${gradients.heroVertical} -z-10`} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
        
        <div className={`w-full ${spacing.container.lg}`}>
 
          {/* Main Headline */}
          <div className="text-center mb-8">
            <h1 className={`${typography.display.lg} mb-6`}>
              <span className="bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent">
                Cook Something
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                Amazing Today
              </span>
            </h1>
            <p className={`${typography.body.lg} text-muted-foreground max-w-2xl mx-auto`}>
              Discover thousands of delicious recipes from cuisines around the world. Easy, fresh, and inspiring.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="mb-12 mt-12">
            <div className="relative">
              <div className="flex gap-3 flex-col sm:flex-row items-center">
                {/* Search Input */}
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    placeholder="pasta, chicken, dessert, articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-6 py-4 rounded-lg border border-input bg-background text-foreground placeholder-foreground/50 ${interactive.transition} focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Search className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:shadow-lg active:scale-95 whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/recipes"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <UtensilsCrossed className="w-5 h-5" />
              Browse Recipes
            </Link>
            <Link
              href="/favorites"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-md border-2 border-primary text-primary bg-background hover:bg-primary/5 font-semibold transition-all hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <Heart className="w-5 h-5" />
              My Favorites
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      {(recentPosts.length > 0 || recentRecipes.length > 0 || isLoading) && (
        <div className="w-full bg-muted/30">
          <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
            {/* Recent Blog Posts */}
            {(recentPosts.length > 0 || isLoading) && (
              <div className="mb-16">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2" style={{ fontFamily: 'Georgia, serif' }}>Recent Stories</h2>
                  <p className="text-muted-foreground">Discover the latest culinary insights and cooking tips</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => <BlogPostCardSkeleton key={i} />)
                    : recentPosts.slice(0, 3).map((post) => (
                        <BlogPostCard
                          key={post.id}
                          id={post.id}
                          title={post.title}
                          slug={post.slug}
                          excerpt={post.excerpt}
                          date={post.date}
                          author={post.author}
                          tags={post.tags}
                          image={post.image}
                          content={post.content}
                          titleSize="medium"
                          showFullDate={false}
                        />
                      ))}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-primary text-primary hover:bg-primary/5 font-semibold transition-all">
                    View All Stories →
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Recipes */}
            {(recentRecipes.length > 0 || isLoading) && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2" style={{ fontFamily: 'Georgia, serif' }}>Recent Recipes</h2>
                  <p className="text-muted-foreground">Try these newly added recipes in your kitchen today</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => <RecipePostCardSkeleton key={i} />)
                    : recentRecipes.slice(0, 3).map((recipe) => (
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
                        />
                      ))}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/recipes" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-primary text-primary hover:bg-primary/5 font-semibold transition-all">
                    Browse All Recipes →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

