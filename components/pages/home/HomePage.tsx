"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, UtensilsCrossed, Heart, Wand2 } from "lucide-react"
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
      {/* Hero Section - Modern UX Design */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Premium Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/30 to-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob" />
        <div className="absolute -bottom-8 left-10 w-72 h-72 bg-gradient-to-br from-pink-600/20 to-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
        
        {/* Content Container */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 max-w-6xl mx-auto">

          {/* Main Headline - Clean Single Color */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 sm:mb-8 text-foreground">
              AI-Powered Recipe Search
            </h1>
            
            {/* Subtitle - Clear Value Proposition */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover authentic recipes from around the world or generate your own with AI. 
              <br className="hidden sm:inline" />
              Search recipes or let AI create something delicious for you.
            </p>
          </div>

          {/* Main Search & CTA Section - Consistent Design System */}
          <div className="mb-12 sm:mb-16 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-4" role="search">
              {/* Search Bar - AI CTA pill inside on right, search button on right */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes, blog, food, ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 pr-36 py-4 rounded-md border border-border bg-background text-foreground placeholder-foreground/50 text-base shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />

                {/* Right side: AI pill and submit icon, both inside input area */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="p-2 rounded-md hover:bg-accent transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-primary" />
                  </button>

                  <Link
                    href="/ai-chef"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    aria-label="AI Mode (AI Chef)"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Chef</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Navigation Pills */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-center">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Popular Searches:</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Pasta Recipes', 'Vegan Meals', 'Desserts', 'Asian Food'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag)
                    setTimeout(() => {
                      router.push(`/search?q=${encodeURIComponent(tag)}`)
                    }, 0)
                  }}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:border-primary dark:hover:border-primary/50"
                >
                  {tag}
                </button>
              ))}
            </div>
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
                    View All Stories 
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
                    Browse All Recipes 
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
