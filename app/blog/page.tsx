import { BlogListServer } from "@/components/pages/blog/BlogListServer"
import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge'

export const metadata: Metadata = generateSEOMetadata({
  title: "Food Blog - International Recipes & Cooking Stories | World Food Recipes",
  description: "Read authentic food blog posts about international cuisines, cooking techniques, food stories, and culinary tips. Discover world food blogging at its finest with detailed recipe guides.",
  url: getCanonicalUrl('/blog'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function BlogPage() {
  return <BlogListServer />
}
