import { RecipePost } from "@/components/pages/recipes/RecipePost"
import { fetchContentFromGitHub } from "@/lib/github"
import type { Metadata } from "next"
import { notFound as nextNotFound } from "next/navigation"
import { responsive, typography } from "@/lib/design-system"
import { siteConfig } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    const recipes = await fetchContentFromGitHub(owner, repo, token, "recipes")
    const recipe = recipes.find((r) => r.slug === slug)

    if (!recipe) {
      return {
        title: "Recipe Not Found",
      }
    }

    return {
      title: recipe.title,
      description: recipe.excerpt || recipe.content.substring(0, 160),
      authors: recipe.author ? [{ name: recipe.author }] : undefined,
      keywords: [...(recipe.tags || []), "recipe", "cooking", "food", "culinary"],
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: recipe.title,
        description: recipe.excerpt || recipe.content.substring(0, 160),
        url: `${siteUrl}/recipes/${slug}`,
        type: "article",
        publishedTime: recipe.date,
        modifiedTime: recipe.date,
        authors: recipe.author ? [recipe.author] : undefined,
        tags: recipe.tags,
        images: recipe.image ? [{
          url: recipe.image,
          width: 1200,
          height: 630,
          alt: recipe.title,
        }] : [{
          url: `${siteUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: "Recipe - Delicious Food",
        }],
      },
      twitter: {
        card: "summary_large_image",
        title: recipe.title,
        description: recipe.excerpt || recipe.content.substring(0, 160),
        creator: siteConfig.socialMedia.twitter,
        images: recipe.image ? [recipe.image] : [`${siteUrl}/og-image.svg`],
      },
      alternates: {
        canonical: `${siteUrl}/recipes/${slug}`,
      },
    }
  } catch (error) {
    return {
      title: "Recipe",
    }
  }
}

export default async function RecipePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const owner = process.env.GITHUB_OWNER || ""
  const repo = process.env.GITHUB_REPO || ""
  const token = process.env.GITHUB_TOKEN || ""

  const recipes = await fetchContentFromGitHub(owner, repo, token, "recipes")
  const recipe = recipes.find((r) => r.slug === slug)

  if (!recipe) {
    nextNotFound()
  }

  // Breadcrumb structured data for SEO
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recipes",
        item: `${siteUrl}/recipes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: recipe.title,
        item: `${siteUrl}/recipes/${slug}`,
      },
    ],
  }

  // Recipe schema for Google rich snippets
  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt || recipe.content.substring(0, 160),
    image: recipe.image || `${siteUrl}/og-image.svg`,
    author: {
      "@type": "Organization",
      name: recipe.author || siteConfig.name,
    },
    datePublished: recipe.date,
    dateModified: recipe.date,
    cuisine: recipe.tags?.[0] || "International",
    prepTime: "PT15M",
    cookTime: "PT30M",
    totalTime: "PT45M",
    recipeYield: "4 servings",
    keywords: recipe.tags?.join(", ") || "recipe, cooking",
  }

  return (
    <>
      <RecipePost recipe={recipe} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeSchema),
        }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
        suppressHydrationWarning
      />
    </>
  )
}