import type { Metadata } from "next"
import { RecipesList } from "@/components/pages/recipes/RecipesList"
import { fetchContentFromGitHub } from "@/lib/github"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl, breadcrumbSchema, collectionPageSchema } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const runtime = 'edge'

export const metadata: Metadata = generateSEOMetadata({
  title: "World Food Recipes | Authentic International Recipe Collection",
  description: "Browse thousands of authentic world food recipes from international cuisines. Find easy-to-follow cooking instructions, ingredient lists, culinary tips, and food recipes for every skill level.",
  url: getCanonicalUrl('/recipes'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default async function RecipesPage() {
  const owner = process.env.GITHUB_OWNER || ""
  const repo = process.env.GITHUB_REPO || ""
  const token = process.env.GITHUB_TOKEN || ""

  const recipes = await fetchContentFromGitHub(owner, repo, token, "recipes")

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', url: siteConfig.url },
              { name: 'Recipes', url: getCanonicalUrl('/recipes') },
            ])
          ),
        }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionPageSchema({
              title: 'World Food Recipes - Authentic International Recipe Collection',
              description: 'Browse thousands of authentic world food recipes from international cuisines.',
              url: getCanonicalUrl('/recipes'),
              itemCount: Array.isArray(recipes) ? recipes.length : 0,
            })
          ),
        }}
        suppressHydrationWarning
      />
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Recipes
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Explore our collection of delicious and easy-to-follow recipes. From quick meals to special dishes, find inspiration for your next meal.
          </p>
        </header>

        <RecipesList recipes={recipes} />
      </div>
    </main>
  )
}
