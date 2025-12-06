import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, getCanonicalUrl, siteConfig } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Search World Food Recipes - Find Recipes & Food Stories",
  description: "Search for world food recipes, cooking tips, and food stories. Discover authentic international recipes and food blogging content from World Food Recipes.",
  url: getCanonicalUrl('/search'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
