import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogListClient } from "./BlogListClient"
import { fetchContentFromGitHub } from "@/lib/github"
import { breadcrumbSchema, collectionPageSchema, siteConfig, getCanonicalUrl } from "@/lib/seo"
import { responsive, typography, spacing } from "@/lib/design-system"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  content: string
}

export async function BlogListServer() {
  let posts: BlogPost[] = []
  let error: string | null = null

  try {
    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    posts = (await fetchContentFromGitHub(owner, repo, token, "blog")) as BlogPost[]
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load posts"
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className={responsive.pageContainer}>
          <div className="text-center mb-8">
            <h1 className={`${typography.heading.h1} text-foreground`}>{error}</h1>
          </div>
          <div className="text-center">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', url: siteConfig.url },
              { name: 'Blog', url: getCanonicalUrl('/blog') },
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
              title: 'Food Blog - International Recipes & Cooking Stories',
              description: 'Read authentic food blog posts about international cuisines, cooking techniques, food stories, and culinary tips.',
              url: getCanonicalUrl('/blog'),
              itemCount: posts.length,
            })
          ),
        }}
        suppressHydrationWarning
      />
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Stories</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">Thoughts, insights, and perspectives from writers on topics that matter</p>
        </header>

        <BlogListClient posts={posts} />
      </div>
    </main>
  )
}
