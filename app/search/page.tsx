"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogPostCard } from "@/components/blog/BlogPostCard"
import { BlogPostCardSkeleton } from "@/components/blog/BlogPostCardSkeleton"
import { Search, BookOpen, UtensilsCrossed } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
}

interface SearchResponse {
  blog: BlogPost[]
  recipes: BlogPost[]
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResponse>({ blog: [], recipes: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function searchContent() {
      if (!query.trim()) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Failed to search content")
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search content")
      } finally {
        setLoading(false)
      }
    }

    searchContent()
  }, [query])

  if (!query.trim()) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
          <div className="text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Search Recipes & Stories</h1>
            <p className="text-lg text-muted-foreground mb-8">Enter a search term to find recipes and blog posts</p>
            <div className="flex gap-4 justify-center">
              <Link href="/recipes">
                <Button>Browse Recipes</Button>
              </Link>
              <Link href="/blog">
                <Button>Browse Stories</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Search Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Searching for "{query}"...
            </p>
          </div>

          <div className="space-y-16">
            {[1, 2].map((section) => (
              <div key={section}>
                <h2 className="text-2xl font-bold mb-8">
                  {section === 1 ? "Recipes" : "Blog Posts"}
                </h2>
                <div className="space-y-12">
                  {[1, 2].map((i) => (
                    <BlogPostCardSkeleton key={i} titleSize="medium" showImage={i % 2 === 0} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{error}</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const totalResults = results.blog.length + results.recipes.length
  const hasRecipes = results.recipes.length > 0
  const hasBlog = results.blog.length > 0

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Search Results
          </h1>
          <p className="text-lg text-muted-foreground">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="text-center py-16 border-t border-shadow-gray">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">Try adjusting your search terms</p>
            <div className="flex gap-4 justify-center">
              <Link href="/recipes">
                <Button>Browse Recipes</Button>
              </Link>
              <Link href="/blog">
                <Button>Browse Stories</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Recipes Section */}
            {hasRecipes && (
              <div className="border-t border-shadow-gray pt-8">
                <div className="flex items-center gap-3 mb-8">
                  <UtensilsCrossed className="w-6 h-6" style={{ color: '#FF7518' }} />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recipes ({results.recipes.length})</h2>
                </div>
                <div className="space-y-12">
                  {results.recipes.map((recipe) => (
                    <BlogPostCard
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.title}
                      slug={recipe.slug}
                      excerpt={recipe.excerpt}
                      date={recipe.date}
                      author={recipe.author}
                      tags={recipe.tags}
                      image={recipe.image}
                      titleSize="medium"
                      showFullDate={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blog Posts Section */}
            {hasBlog && (
              <div className={`${hasRecipes ? 'border-t border-shadow-gray pt-8' : ''}`}>
                <div className="flex items-center gap-3 mb-8">
                  <BookOpen className="w-6 h-6" style={{ color: '#FF7518' }} />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Blog Posts ({results.blog.length})</h2>
                </div>
                <div className="space-y-12">
                  {results.blog.map((post) => (
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
                      titleSize="medium"
                      showFullDate={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Search Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Loading...
            </p>
          </div>

          <div className="space-y-12 border-t border-shadow-gray pt-8">
            {[1, 2, 3].map((i) => (
              <BlogPostCardSkeleton key={i} titleSize="medium" showImage={i % 2 === 0} />
            ))}
          </div>
        </div>
      </main>
    }>
      <SearchResults />
    </Suspense>
  )
}
