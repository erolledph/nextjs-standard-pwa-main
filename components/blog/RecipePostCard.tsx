"use client"

import Link from "next/link"
import { Clock, Users, ChefHat, Heart } from "lucide-react"

export interface RecipePostCardProps {
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
  isFavorited?: boolean
  onToggleFavorite?: () => void
}

export function RecipePostCard({
  id,
  title,
  slug,
  excerpt,
  date,
  author,
  tags,
  image,
  prepTime,
  cookTime,
  servings,
  difficulty,
  isFavorited = false,
  onToggleFavorite,
}: RecipePostCardProps) {
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString)
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'Easy':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default:
        return 'bg-muted text-foreground'
    }
  }

  return (
    <article className="group rounded-lg overflow-hidden border border-shadow-gray hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background hover:bg-muted/50 relative">
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite()
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:bg-background/90 transition-colors"
          aria-label="Add to favorites"
        >
          <Heart
            className="w-5 h-5"
            style={{
              color: isFavorited ? '#FF7518' : 'currentColor',
            }}
            fill={isFavorited ? '#FF7518' : 'none'}
          />
        </button>
      )}

      <Link href={`/recipes/${slug}`} className="flex flex-col h-full">
        {/* Recipe Image */}
        <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={`${title} - Recipe | World Food Recipes`}
              title={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🍳</div>
              <p className="text-sm">Recipe</p>
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="flex-1 p-5 md:p-6 flex flex-col min-h-[280px]">
          <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h3>

          {excerpt && (
            <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
              {excerpt}
            </p>
          )}

          {/* Quick Info */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
            {prepTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                <span>{prepTime}</span>
              </div>
            )}
            {cookTime && (
              <div className="flex items-center gap-1">
                <ChefHat className="w-3 h-3 text-primary" />
                <span>{cookTime}</span>
              </div>
            )}
            {servings && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                <span>{servings}</span>
              </div>
            )}
          </div>

          {/* Difficulty & Metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-shadow-gray mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{author || "Anonymous"}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <time className="text-xs text-muted-foreground">{formatDate(date)}</time>
            </div>
            {difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
