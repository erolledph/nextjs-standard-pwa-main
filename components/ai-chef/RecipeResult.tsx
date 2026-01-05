"use client"

import Link from "next/link"
import { RecipeResponse } from "@/types/ai-chef"
import { Clock, Users, ChefHat, Flame, Download, AlertCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SocialShare } from "@/components/ui/social-share"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { getRecipeImage } from "@/lib/recipeImages"
import ReactMarkdown from "react-markdown"

interface RecipeResultProps {
  recipe: RecipeResponse
  recipeId?: string | null
}

export function RecipeResult({ recipe, recipeId }: RecipeResultProps) {
  const articleRef = useRef<HTMLElement>(null)
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [recipeImage, setRecipeImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Check if recipe is already favorited on mount
  useEffect(() => {
    if (recipeId) {
      const favorites = JSON.parse(localStorage.getItem('ai-chef-favorites') || '[]')
      setIsFavorite(favorites.includes(recipeId))
    }
  }, [recipeId])

  // Fetch recipe image on mount (use cached if available)
  useEffect(() => {
    const fetchImage = async () => {
      // Use cached image if available
      if (recipe.imageUrl) {
        setRecipeImage(recipe.imageUrl)
        return
      }
      
      // Only fetch if recipe doesn't have cached image
      const image = await getRecipeImage(recipe.title, recipe.cuisine || 'cuisine')
      setRecipeImage(image.url)
    }
    fetchImage()
  }, [recipe.title, recipe.cuisine, recipe.imageUrl])

  const handleToggleFavorite = () => {
    if (!recipeId) return
    
    const favorites = JSON.parse(localStorage.getItem('ai-chef-favorites') || '[]')
    
    if (isFavorite) {
      // Remove from favorites
      const updated = favorites.filter((id: string) => id !== recipeId)
      localStorage.setItem('ai-chef-favorites', JSON.stringify(updated))
      setIsFavorite(false)
    } else {
      // Add to favorites
      favorites.push(recipeId)
      localStorage.setItem('ai-chef-favorites', JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default
      
      if (!articleRef.current || !buttonContainerRef.current) return

      // Wait for images to fully load before capturing
      if (!imageLoaded) {
        alert("Please wait for the image to load before downloading.")
        return
      }

      // Temporarily hide buttons during capture
      setIsCapturing(true)
      const originalDisplay = buttonContainerRef.current.style.display
      buttonContainerRef.current.style.display = "none"

      // Store original styles
      const originalPadding = articleRef.current.style.padding
      const originalMargin = articleRef.current.style.margin
      
      // Set minimal padding for capture
      articleRef.current.style.padding = "8px"
      articleRef.current.style.margin = "0"

      // Small delay to ensure DOM update
      await new Promise(resolve => setTimeout(resolve, 300))

      const canvas = await html2canvas(articleRef.current, {
        backgroundColor: "#fefdfb",
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        windowWidth: 1200,
      })

      // Restore original styles
      articleRef.current.style.padding = originalPadding
      articleRef.current.style.margin = originalMargin
      buttonContainerRef.current.style.display = originalDisplay
      setIsCapturing(false)

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `${recipe.title.replace(/\s+/g, "-").toLowerCase()}-recipe.png`
      link.click()
    } catch (error) {
      console.error("Error downloading recipe:", error)
      // Restore buttons on error
      if (buttonContainerRef.current) {
        buttonContainerRef.current.style.display = ""
      }
      setIsCapturing(false)
      alert("Failed to download recipe. Please try again.")
    }
  }

  return (
    <article
      ref={articleRef}
      className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24"
      data-printable="true"
    >
      <header className="mx-auto max-w-screen-md">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white lg:leading-tight mb-8 font-serif">
          {recipe.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b border-shadow-gray">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold uppercase tracking-wider">
              AI Generated Recipe
            </div>
          </div>
          <div className="flex justify-start sm:justify-end gap-2">
            <SocialShare 
              url={`${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "https://worldfoodrecipes.com"}/ai-chef/${recipeId || recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              title={recipe.title}
              description={`AI-generated recipe - Prep: ${recipe.prepTime}, Cook: ${recipe.cookTime}`}
            />
            {typeof window !== "undefined" && (
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Add to favorites"
              >
                <Heart
                  className="w-5 h-5"
                  style={{
                    color: isFavorite ? '#FF7518' : 'currentColor',
                  }}
                  fill={isFavorite ? '#FF7518' : 'none'}
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Recipe Hero Image */}
      {recipeImage && (
        <figure className="relative z-0 mx-auto max-w-screen-lg overflow-hidden lg:rounded-lg mb-8">
          <div className="aspect-video relative">
            <Image
              src={recipeImage}
              alt={recipe.title}
              fill
              className="w-full h-full object-cover"
              priority
              onLoadingComplete={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
          <figcaption className="text-center text-xs text-muted-foreground mt-2">{recipe.title}</figcaption>
        </figure>
      )}

      <div className="mx-auto max-w-screen-md">
        <header className="mb-8">
          {/* Cuisine Tags */}
          {recipe.cuisine && (
            <div className="flex flex-wrap gap-2 mb-8" role="list" aria-label="Recipe cuisine">
              <span className="inline-block text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full bg-muted text-foreground">
                {recipe.cuisine}
              </span>
            </div>
          )}

          {/* Recipe Description/Summary */}
          {recipe.description && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </header>

        {/* About this Recipe (Content) */}
        {recipe.content && (
          <div className="mb-12 prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-foreground mb-4 font-serif">About this Recipe</h2>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-base leading-relaxed text-foreground/90 mb-4">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground">{children}</em>
                ),
              }}
            >
              {recipe.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Recipe Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 bg-muted/30 p-6 rounded-lg">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Prep Time</p>
            <p className="font-bold text-foreground">{recipe.prepTime}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Cook Time</p>
            <p className="font-bold text-foreground">{recipe.cookTime}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Servings</p>
            <p className="font-bold text-foreground">{recipe.servings}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Difficulty</p>
            <p className="font-bold text-foreground text-sm">{recipe.difficulty || "Moderate"}</p>
          </div>
        </div>

        {/* Download Button - Unique to AI Chef */}
        <div 
          ref={buttonContainerRef}
          className="flex gap-3 flex-wrap mb-8 pb-8 border-b border-shadow-gray print:hidden"
          style={{ opacity: isCapturing ? 0.5 : 1 }}
        >
          <Button
            onClick={handleDownload}
            disabled={isCapturing}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isCapturing ? "Capturing..." : "Download as Image"}
          </Button>
        </div>

        {/* Ingredients Section */}
        <div className="mb-12 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="inline-block w-5 h-5 bg-primary text-white rounded-full text-center text-xs leading-5 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <div className="font-medium text-foreground">{ing.item}</div>
                  <div className="text-sm text-muted-foreground">
                    {ing.amount} {ing.unit}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-12 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  {idx + 1}
                </div>
                <p className="text-foreground pt-0.5">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer Navigation */}
        <nav className="mb-12 mt-16 flex justify-center pt-8 border-t border-shadow-gray" aria-label="Recipe navigation">
          <Link href="/ai-chef">
            <Button variant="ghost" className="bg-muted/20 rounded-full px-6 py-2 text-sm text-primary hover:text-primary/80 font-medium">
              ← Back to AI Chef
            </Button>
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>This recipe was generated by AI Chef</p>
          <p className="mt-1">
            Results may vary. Always exercise caution when cooking with new ingredients.
          </p>
        </div>
      </div>
    </article>
  )
}
