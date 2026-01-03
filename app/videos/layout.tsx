import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, getCanonicalUrl, siteConfig } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Cooking Video Tutorials & Recipes | World Food Recipes",
  description: "Watch cooking video tutorials featuring international recipes, cooking techniques, and culinary lessons. Learn world food cooking from experts through our comprehensive video collection.",
  url: getCanonicalUrl('/videos'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
