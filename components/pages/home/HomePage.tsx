"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, UtensilsCrossed, Heart, Wand2, WandSparkles } from "lucide-react"
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
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading state for 300ms to show skeleton
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setIsSearching(true)
      // Simulate search transition
      setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      }, 200)
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

          {/* Main Headline - Premium Typography with Animations */}
          <div className="text-center mb-10 sm:mb-14 hero-fade-in">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-4 sm:mb-6 text-foreground inline-flex items-center gap-3">
              <WandSparkles className="w-10 sm:w-14 lg:w-20 text-orange-500 flex-shrink-0" />
              AI Recipe <span className="text-orange-500">Maker</span>
            </h1>
            
            {/* Subtitle - Clear Value Proposition */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Generate unlimited unique recipes instantly. Tell AI your ingredients and get personalized recipes in seconds.
            </p>
          </div>

          {/* Main Search & CTA Section - Premium UX Design */}
          <div className="mb-12 sm:mb-16 max-w-4xl mx-auto px-0">
            <form onSubmit={handleSearch} className="space-y-4" role="search">
              {/* Dual Input System - Search or AI Chef */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {/* AI Chef CTA - Primary Action */}
                <Link
                  href="/ai-chef"
                  className="inline-flex items-center justify-center sm:justify-start gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap group flex-1 sm:flex-none"
                  aria-label="Generate recipe with AI Chef"
                >
                  <Wand2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="text-base sm:text-base font-bold">Generate Recipe Free</span>
                </Link>

                {/* Secondary Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Or search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isSearching}
                    className="w-full px-4 py-3.5 sm:py-4 rounded-lg border-2 border-border bg-background text-foreground placeholder-foreground/40 text-sm sm:text-base font-medium shadow-sm hover:border-primary/50 transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:opacity-60"
                  />
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-md bg-transparent hover:bg-primary/10 text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-sm active:scale-95"
                    aria-label="Search recipes"
                  >
                    <Search className="w-5 h-5 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Helpful Hint - UX Guidance */}
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                ✨ <span className="hidden sm:inline">No login required • Works offline • 100% free</span>
                <span className="sm:hidden">Free • No login • Offline ready</span>
              </p>
            </form>
          </div>

          {/* Quick Navigation Pills - Trending Tags */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-center">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">🔥 Trending:</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Pasta Recipes', 'Vegan Meals', 'Desserts', 'Asian Fusion'].map((tag, idx) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag)
                    setTimeout(() => {
                      router.push(`/search?q=${encodeURIComponent(tag)}`)
                    }, 0)
                  }}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-gray-700 border border-border hover:border-primary dark:border-gray-700 dark:hover:border-primary/50 text-xs font-semibold text-foreground/80 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer group"
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
