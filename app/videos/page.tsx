"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Search, Loader } from "lucide-react"
import { VideoCard } from "@/components/pages/videos/VideoCard"
import { VideosSkeleton } from "@/components/pages/videos/VideosSkeleton"
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext"
import { CookingVideo } from "@/lib/youtube"
import { breadcrumbSchema, collectionPageSchema, siteConfig, getCanonicalUrl } from "@/lib/seo"

interface SearchResult {
  status: 'success' | 'error'
  videos?: CookingVideo[]
  message?: string
  nextPageToken?: string | null
  source?: 'api' | 'cache' | 'fallback'
}

function VideosContent() {
  const [displayedVideos, setDisplayedVideos] = useState<CookingVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('cooking recipes')
  const [currentSearchQuery, setCurrentSearchQuery] = useState('cooking recipes')
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Add schema to page on mount
  useEffect(() => {
    // Add breadcrumb schema
    const breadcrumbScript = document.createElement('script')
    breadcrumbScript.type = 'application/ld+json'
    breadcrumbScript.textContent = JSON.stringify(
      breadcrumbSchema([
        { name: 'Home', url: siteConfig.url },
        { name: 'Videos', url: getCanonicalUrl('/videos') },
      ])
    )
    document.head.appendChild(breadcrumbScript)

    // Add collection page schema
    const collectionScript = document.createElement('script')
    collectionScript.type = 'application/ld+json'
    collectionScript.textContent = JSON.stringify(
      collectionPageSchema({
        title: 'Cooking Videos & Recipes - World Food Recipes',
        description: 'Discover cooking tutorials and recipes from YouTube to inspire your next meal.',
        url: getCanonicalUrl('/videos'),
        itemCount: displayedVideos.length,
      })
    )
    document.head.appendChild(collectionScript)

    return () => {
      document.head.removeChild(breadcrumbScript)
      document.head.removeChild(collectionScript)
    }
  }, [displayedVideos.length])

  const quickSearches = [
    'cooking tutorials',
    'easy pasta recipes',
    'chicken recipes',
    'how to cook adobo',
    'asian food',
    'dessert recipes',
  ]

  const searchVideos = useCallback(
    async (query: string, pageToken: string | null = null) => {
      try {
        if (!pageToken) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError(null)

        const params = new URLSearchParams({ q: query })
        if (pageToken) {
          params.append('pageToken', pageToken)
        }

        const response = await fetch(`/api/videos?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch videos')
        }

        const data: SearchResult = await response.json()

        if (data.status === 'success' && data.videos && data.videos.length > 0) {
          if (!pageToken) {
            setDisplayedVideos(data.videos)
          } else {
            setDisplayedVideos((prev) => [...prev, ...data.videos!])
          }
          setNextPageToken(data.nextPageToken || null)
        } else {
          setError(data.message || 'No videos found. Try a different search.')
        }
      } catch (err: any) {
        console.error('Error fetching videos:', err)
        setError('Unable to load videos. Please try again.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    []
  )

  // Initial search on mount
  useEffect(() => {
    searchVideos('cooking recipes')
  }, [searchVideos])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && nextPageToken) {
          searchVideos(currentSearchQuery, nextPageToken)
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loading, loadingMore, nextPageToken, currentSearchQuery, searchVideos])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && searchQuery.trim() !== currentSearchQuery) {
      setCurrentSearchQuery(searchQuery.trim())
      setDisplayedVideos([])
      setNextPageToken(null)
      searchVideos(searchQuery.trim())
    }
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentSearchQuery(query)
    setDisplayedVideos([])
    setNextPageToken(null)
    searchVideos(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('cooking recipes')
    setCurrentSearchQuery('cooking recipes')
    setDisplayedVideos([])
    setNextPageToken(null)
    searchVideos('cooking recipes')
  }

  const handleRefresh = () => {
    setDisplayedVideos([])
    setNextPageToken(null)
    searchVideos(currentSearchQuery)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Videos
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Discover cooking tutorials and recipes from YouTube to inspire your next meal.
          </p>
        </header>

        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cooking videos, recipes, tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Search className="w-5 h-5 text-primary" />
              </button>
            </div>
          </form>

          {/* Clear button and Quick Searches */}
          <div className="flex flex-col gap-4">
            {searchQuery !== 'cooking recipes' && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-lg bg-muted text-foreground/60 hover:bg-muted/80 transition-colors text-sm font-medium w-fit"
              >
                Clear Search
              </button>
            )}

            {/* Quick Searches */}
            <div>
              <p className="text-sm font-semibold text-foreground/60 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleQuickSearch(suggestion)}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-foreground/70 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && displayedVideos.length === 0 && <VideosSkeleton count={6} />}

        {/* Error State */}
        {error && !loading && displayedVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg text-foreground/70 font-medium mb-2">Unable to Load Videos</p>
            <p className="text-foreground/50 max-w-md mx-auto mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && displayedVideos.length > 0 && (
          <>
            <div className="mb-6 text-sm text-foreground/60">
              Showing results for: <span className="font-semibold text-foreground">&quot;{currentSearchQuery}&quot;</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {displayedVideos.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="flex justify-center items-center py-12">
              {loadingMore ? (
                <div className="flex items-center gap-3">
                  <Loader size={24} className="animate-spin text-primary" />
                  <span className="text-foreground/60 font-medium">Loading more videos...</span>
                </div>
              ) : nextPageToken ? (
                <p className="text-foreground/50 text-sm">Scroll down to load more</p>
              ) : (
                <p className="text-foreground/50 text-sm">✓ All results loaded</p>
              )}
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && displayedVideos.length === 0 && !error && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-foreground/60 font-medium mb-2">No videos found</p>
            <p className="text-foreground/50 mb-6">Try adjusting your search keywords</p>
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Search cooking recipes
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function VideosPage() {
  return (
    <VideoPlayerProvider>
      <VideosContent />
    </VideoPlayerProvider>
  )
}
