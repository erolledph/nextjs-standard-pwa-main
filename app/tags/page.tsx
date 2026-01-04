import { fetchPostsFromGitHub, fetchContentFromGitHub } from "@/lib/github"
import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/layout/Container"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

export const runtime = 'edge'

export const metadata: Metadata = {
  title: "All Tags - Browse by Category",
  description: "Explore all recipe and blog post tags. Find content by topic, ingredient, and culinary technique.",
  keywords: ["tags", "categories", "recipes", "blog", "food"],
  openGraph: {
    title: "All Tags - Browse by Category",
    description: "Explore all recipe and blog post tags. Find content by topic.",
    url: `${siteUrl}/tags`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Browse Tags",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Tags - Browse by Category",
    description: "Explore all recipe and blog post tags.",
  },
  alternates: {
    canonical: `${siteUrl}/tags`,
  },
}

export default async function TagsPage() {
  try {
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    const [blogs, recipes] = await Promise.all([
      fetchPostsFromGitHub(owner, repo, token),
      fetchContentFromGitHub(owner, repo, token, "recipes"),
    ])

    // Extract and count tags
    const tagFrequency = new Map<string, number>()
    ;[...blogs, ...recipes].forEach((post) => {
      post.tags?.forEach((tag) => {
        const lower = tag.toLowerCase()
        tagFrequency.set(lower, (tagFrequency.get(lower) || 0) + 1)
      })
    })

    // Sort by frequency
    const sortedTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))

    // Calculate max frequency for visual scaling
    const maxFrequency = sortedTags[0]?.count || 1

    return (
      <main className="min-h-screen bg-background">
        <Container>
          <div className="py-12">
            <h1 className="text-4xl font-bold mb-2">Browse by Tag</h1>
            <p className="text-muted-foreground mb-8">
              Explore {sortedTags.length} tags across {blogs.length + recipes.length} recipes and articles
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
                  ],
                }),
              }}
            />

            {/* Tags cloud with visual frequency representation */}
            <div className="flex flex-wrap gap-3">
              {sortedTags.map(({ tag, count }) => {
                // Calculate size based on frequency (3 levels)
                const frequency = count / maxFrequency
                let sizeClass = "text-base"
                let paddingClass = "px-3 py-1"

                if (frequency > 0.6) {
                  sizeClass = "text-xl font-semibold"
                  paddingClass = "px-4 py-2"
                } else if (frequency > 0.3) {
                  sizeClass = "text-lg font-medium"
                  paddingClass = "px-3.5 py-1.5"
                }

                return (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className={`${paddingClass} ${sizeClass} rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 cursor-pointer inline-flex items-center gap-2`}
                  >
                    {tag}
                    <span className="text-xs bg-primary/30 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                )
              })}
            </div>

            {sortedTags.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tags found yet. Start adding tags to your posts!</p>
              </div>
            )}
          </div>
        </Container>
      </main>
    )
  } catch (error) {
    console.error("Error loading tags:", error)
    return (
      <Container>
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Error loading tags</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </Container>
    )
  }
}
