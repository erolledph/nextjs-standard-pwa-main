import { HomePage } from "@/components/pages/home/HomePage"
import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl, homePageSchema } from "@/lib/seo"
import { fetchContentFromGitHub } from "@/lib/github"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "World Food Recipes - Authentic Global Recipes & Food Blogging",
  description: "Explore authentic world food recipes from international cuisines. Discover easy cooking tips, food stories, and culinary traditions. Your ultimate food blogging destination for global recipes.",
  url: getCanonicalUrl('/'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

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

export default async function Page() {
  let recentPosts: Post[] = []
  let recentRecipes: Recipe[] = []

  try {
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    // Fetch blog posts
    const allPosts = (await fetchContentFromGitHub(owner, repo, token, "blog")) as Post[]
    recentPosts = allPosts.slice(0, 3)

    // Fetch recipes
    const allRecipes = (await fetchContentFromGitHub(owner, repo, token, "recipes")) as Recipe[]
    recentRecipes = allRecipes.slice(0, 3)
  } catch (error) {
    console.error("Error fetching content for homepage:", error)
    // Continue without recent posts if fetch fails
  }

  const schema = homePageSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        suppressHydrationWarning
      />
      <HomePage recentPosts={recentPosts} recentRecipes={recentRecipes} />
    </>
  )
}
