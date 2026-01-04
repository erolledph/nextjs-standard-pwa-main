import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "AI Chef - Smart Recipe Generator | World Food Recipes",
  description: "Generate personalized recipes instantly with AI. Describe your ingredients, dietary preferences, and cooking skill level to get delicious recipe suggestions powered by artificial intelligence.",
  url: getCanonicalUrl('/ai-chef'),
  image: `${siteUrl}/og-image.svg`,
  author: siteConfig.author,
  category: "Tools",
}) as Metadata

export default function AIChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
