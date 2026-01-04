"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Author } from "@/components/ui/author"
import { AuthorCard } from "@/components/ui/author-card"
import { SocialShare } from "@/components/ui/social-share"
import { RelatedRecipes } from "@/components/blog/RelatedRecipes"
import { AnchorLink } from "@/components/blog/AnchorLink"
import { calculateReadingTime } from "@/lib/utils"
import { useFavorites } from "@/lib/useFavorites"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Clock, Users, ChefHat, Flame, Heart } from "lucide-react"

interface RecipeData {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  prepTime?: string
  cookTime?: string
  servings?: string
  ingredients?: string[]
  instructions?: string[]
  difficulty?: string
}

interface RecipePostProps {
  recipe: RecipeData
}

// Helper: Convert time string like "15 minutes" to ISO 8601 format "PT15M"
function convertToISO8601Time(timeStr: string | undefined): string | undefined {
  if (!timeStr) return undefined
  
  const match = timeStr.match(/(\d+)/)
  if (!match) return undefined
  
  const minutes = match[1]
  return `PT${minutes}M`
}

export function RecipePost({ recipe }: RecipePostProps) {
  const { isFavorited, toggleFavorite, mounted } = useFavorites()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const recipeUrl = `${siteUrl}/recipes/${recipe.slug}`
  const readingTime = calculateReadingTime(recipe.content)
  const isFav = mounted && isFavorited(recipe.slug)

  // Parse total cook time (prep + cook)
  const getTotalTime = () => {
    let total = 0
    if (recipe.prepTime) {
      const prepMatch = recipe.prepTime.match(/(\d+)/)
      if (prepMatch) total += parseInt(prepMatch[1])
    }
    if (recipe.cookTime) {
      const cookMatch = recipe.cookTime.match(/(\d+)/)
      if (cookMatch) total += parseInt(cookMatch[1])
    }
    return total > 0 ? `${total} minutes` : "N/A"
  }

  // Recipe schema for rich snippets
  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title,
    "description": recipe.excerpt || recipe.content.substring(0, 160),
    "image": recipe.image || `${siteUrl}/og-image.svg`,
    "author": {
      "@type": "Person",
      "name": recipe.author || "World Food Recipes"
    },
    ...(recipe.prepTime && { "prepTime": convertToISO8601Time(recipe.prepTime) }),
    ...(recipe.cookTime && { "cookTime": convertToISO8601Time(recipe.cookTime) }),
    ...(recipe.servings && { "recipeYield": recipe.servings }),
    "recipeIngredient": recipe.ingredients || [],
    "recipeInstructions": recipe.instructions && recipe.instructions.length > 0 
      ? recipe.instructions.map((instruction, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "text": instruction
        }))
      : [{
          "@type": "HowToStep",
          "text": recipe.content
        }],
    "datePublished": recipe.date,
    "keywords": (recipe.tags || []).join(", "),
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
      <article className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mx-auto max-w-screen-md">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white lg:leading-tight mb-8 font-serif">
            {recipe.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b border-shadow-gray">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Author name={recipe.author || 'Anonymous'} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={recipe.date}>
                  {new Date(recipe.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              </div>
            </div>
            <div className="flex justify-start sm:justify-end gap-4">
              <SocialShare url={recipeUrl} title={recipe.title} description={recipe.excerpt} />
              {mounted && (
                <button
                  onClick={() => {
                    toggleFavorite({
                      id: recipe.id,
                      title: recipe.title,
                      slug: recipe.slug,
                      excerpt: recipe.excerpt,
                      image: recipe.image,
                      difficulty: recipe.difficulty,
                      prepTime: recipe.prepTime,
                      cookTime: recipe.cookTime,
                      type: "recipe"
                    })
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className="w-5 h-5"
                    style={{
                      color: isFav ? '#FF7518' : 'currentColor',
                    }}
                    fill={isFav ? '#FF7518' : 'none'}
                  />
                </button>
              )}
            </div>
          </div>

          {recipe.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {recipe.excerpt}
            </p>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12" role="list" aria-label="Recipe tags">
              {recipe.tags.map((tag) => (
                <span key={tag} role="listitem" className="inline-block text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full bg-muted text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {recipe.image && (
          <figure className="relative z-0 mx-auto max-w-screen-lg overflow-hidden lg:rounded-lg mb-8">
            <img
              alt={`Featured image for ${recipe.title}`}
              src={recipe.image}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption className="text-center text-xs text-muted-foreground mt-2">{recipe.title}</figcaption>
          </figure>
        )}

        <div className="mx-auto max-w-screen-md">
          {/* Recipe Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 bg-muted/30 p-6 rounded-lg">
            {recipe.prepTime && (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Prep Time</p>
                <p className="font-semibold text-foreground">{recipe.prepTime}</p>
              </div>
            )}
            {recipe.cookTime && (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Cook Time</p>
                <p className="font-semibold text-foreground">{recipe.cookTime}</p>
              </div>
            )}
            {recipe.servings && (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Servings</p>
                <p className="font-semibold text-foreground">{recipe.servings}</p>
              </div>
            )}
            {recipe.difficulty && (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                <p className="font-semibold text-foreground">{recipe.difficulty}</p>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-12 bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="inline-block w-5 h-5 bg-primary text-white rounded-full text-center text-xs leading-5 flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-foreground">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions Section */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="mb-12 bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="inline-block w-8 h-8 bg-primary text-white rounded-full text-center text-sm leading-8 flex-shrink-0 font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-foreground pt-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Recipe Content (Instructions, etc.) */}
          <div className="prose mx-auto dark:prose-invert prose-a:text-primary max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const id = typeof children === 'string'
                    ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    : undefined
                  return (
                    <h1 id={id} className="text-3xl font-bold text-foreground dark:text-white mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  )
                },
                h2: ({ children }) => {
                  const id = typeof children === 'string'
                    ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    : undefined
                  return (
                    <h2 id={id} className="text-2xl font-bold text-foreground dark:text-white mt-8 mb-4 first:mt-0">
                      {children}
                    </h2>
                  )
                },
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-foreground dark:text-white mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/85 dark:text-gray-300 mb-6 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-6 space-y-2 text-foreground/85 dark:text-gray-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-6 space-y-2 text-foreground/85 dark:text-gray-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/85 dark:text-gray-300">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-foreground/70">
                    {children}
                  </blockquote>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <pre className="bg-muted p-4 rounded-lg overflow-auto mb-6 dark:bg-gray-800">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary dark:bg-gray-800">
                      {children}
                    </code>
                  )
                },
                a: ({ node, children, ...props }: any) => (
                  <a {...props} className="text-primary hover:text-primary/80 font-medium underline transition-colors">
                    {children}
                  </a>
                ),
                img: ({ node, ...props }: any) => (
                  <img {...props} className="w-full h-auto rounded-lg my-6" alt={props.alt || 'Recipe step'} loading="lazy" />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-shadow-gray">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted dark:bg-gray-800 border-b border-shadow-gray">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children, align }) => (
                  <th 
                    className={`px-4 py-3 text-left font-semibold text-foreground dark:text-gray-200 ${
                      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, align }) => (
                  <td 
                    className={`px-4 py-3 text-foreground/85 dark:text-gray-300 ${
                      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {children}
                  </td>
                ),
              }}
            >
              {recipe.content}
            </ReactMarkdown>
          </div>

          <nav className="mb-12 mt-16 flex justify-center pt-8 border-t border-shadow-gray" aria-label="Recipe navigation">
            <Link href="/recipes">
              <Button variant="ghost" className="bg-muted/20 rounded-full px-6 py-2 text-sm text-primary hover:text-primary/80 font-medium">
                ← View all recipes
              </Button>
            </Link>
          </nav>

          <aside aria-label="Author information">
            <AuthorCard name={recipe.author || 'Anonymous'} image="/avatar.svg" />
          </aside>
        </div>

        <section aria-label="More Recipes" className="mt-16 pt-12 pb-16 md:pb-24 border-t border-shadow-gray">
          <div className="px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg">
            <div className="mb-12">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-2">Recommended</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>More Recipes</h3>
            </div>
            <RelatedRecipes currentSlug={recipe.slug} currentTags={recipe.tags} showCTA={true} />
          </div>
        </section>
      </article>
    </main>
  )
}
