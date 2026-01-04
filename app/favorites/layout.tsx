import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, getCanonicalUrl, siteConfig } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "My Favorite Recipes | World Food Recipes",
  description: "Access your saved favorite recipes from World Food Recipes. Save, organize, and manage your favorite international recipes for quick access and easy meal planning.",
  url: getCanonicalUrl('/favorites'),
  image: `${siteUrl}/og-image.svg`,
  author: siteConfig.author,
}) as Metadata

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
