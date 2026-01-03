import { fetchPostsFromGitHub, fetchContentFromGitHub } from "@/lib/github"
import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/layout/Container"
import { BlogPostCard } from "@/components/blog/BlogPostCard"
import { RecipePostCard } from "@/components/blog/RecipePostCard"
import { siteConfig } from "@/lib/seo"

export const runtime = 'edge'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const tagTitle = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1)

  return {
    title: `${tagTitle} - Recipes & Articles | ${siteConfig.name}`,
    description: `Explore all recipes and articles tagged with "${tagTitle}". Discover culinary inspiration and food stories.`,
    keywords: [decodedTag, "recipes", "blog", "food", "cooking"],
    openGraph: {
      title: `${tagTitle} - Recipes & Articles`,
      description: `Explore all recipes and articles tagged with "${tagTitle}". Discover culinary inspiration and food stories.`,
      url: `${siteUrl}/tags/${tag}`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${tagTitle} - Recipes & Articles`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tagTitle} - Recipes & Articles`,
      description: `Explore all recipes and articles tagged with "${tagTitle}".`,
    },
    alternates: {
      canonical: `${siteUrl}/tags/${tag}`,
    },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag).toLowerCase()

  try {
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    const [blogs, recipes] = await Promise.all([
      fetchPostsFromGitHub(owner, repo, token),
      fetchContentFromGitHub(owner, repo, token, "recipes"),
    ])

    // Filter content by tag
    const filteredBlogs = blogs.filter((post) =>
      post.tags?.map((t) => t.toLowerCase()).includes(decodedTag)
    )

    const filteredRecipes = recipes.filter((post) =>
      post.tags?.map((t) => t.toLowerCase()).includes(decodedTag)
    )

    const allContent = [...filteredBlogs, ...filteredRecipes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (allContent.length === 0) {
      return (
        <Container>
          <div className="py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">
              No content for tag: {decodeURIComponent(tag)}
            </h1>
            <p className="text-muted-foreground mb-8">
              Try searching for another tag or visit our blog and recipes.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/blog" className="text-primary hover:underline font-semibold">
                ← Back to Blog
              </Link>
              <Link href="/recipes" className="text-primary hover:underline font-semibold">
                View Recipes →
              </Link>
            </div>
          </div>
        </Container>
      )
    }

    const tagTitle = decodeURIComponent(tag).charAt(0).toUpperCase() + decodeURIComponent(tag).slice(1)

    return (
      <main className="min-h-screen bg-background">
        <Container>
          <div className="py-12">
            <h1 className="text-4xl font-bold mb-2">Tag: {tagTitle}</h1>
            <p className="text-muted-foreground mb-8">
              Found {allContent.length} item{allContent.length !== 1 ? "s" : ""} tagged with "{tagTitle}"
            </p>

            {/* Breadcrumb Schema */}
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
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
                      name: "Tags",
                      item: `${siteUrl}/tags`,
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: tagTitle,
                      item: `${siteUrl}/tags/${tag}`,
                    },
                  ],
                }),
              }}
            />

            {/* Collection Schema */}
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "CollectionPage",
                  name: `${tagTitle} - Recipes & Articles`,
                  description: `All recipes and articles tagged with "${tagTitle}"`,
                  url: `${siteUrl}/tags/${tag}`,
                  isPartOf: {
                    "@type": "WebSite",
                    url: siteUrl,
                  },
                }),
              }}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allContent.map((item) => {
                // Determine if it's a blog post or recipe based on presence in filteredBlogs/Recipes
                const isBlog = filteredBlogs.some((b) => b.slug === item.slug)
                return isBlog ? (
                  <BlogPostCard
                    key={item.slug}
                    id={item.slug}
                    title={item.title}
                    slug={item.slug}
                    excerpt={item.excerpt}
                    date={item.date}
                    author={item.author}
                    tags={item.tags}
                    image={item.image}
                  />
                ) : (
                  <RecipePostCard
                    key={item.slug}
                    id={item.slug}
                    title={item.title}
                    slug={item.slug}
                    excerpt={item.excerpt}
                    date={item.date}
                    author={item.author}
                    tags={item.tags}
                    image={item.image}
                  />
                )
              })}
            </div>
          </div>
        </Container>
      </main>
    )
  } catch (error) {
    console.error("Error loading tag page:", error)
    return (
      <Container>
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Error loading content</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </Container>
    )
  }
}
