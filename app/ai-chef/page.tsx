/**
 * AI Chef Page
 * Smart recipe search with caching, fuzzy matching, and AI generation
 */

import { Metadata } from "next"
import { AIChefPageNew } from "@/components/ai-chef/AIChefPageNew"
import { siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = {
  title: "AI Chef - Smart Recipe Generator & Search | World Food Recipes",
  description:
    "Create unique recipes with AI Chef. Search our global recipe database or generate custom recipes based on ingredients, cuisine, and taste preferences. Free AI-powered meal planning and cooking suggestions.",
  keywords: [
    "AI recipe generator",
    "recipe search",
    "meal planning",
    "cooking assistant",
    "smart recipe database",
    "AI cooking",
    "recipe ideas",
    "food generator",
    "custom recipes",
  ],
  authors: [{ name: siteConfig.author }],
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "AI Chef - Smart Recipe Generator & Search",
    description:
      "Generate unlimited recipes with AI or search our curated database. Smart meal planning made easy.",
    url: getCanonicalUrl("/ai-chef"),
    type: "website",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "AI Chef - Recipe Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chef - Smart Recipe Generator",
    description: "Generate unlimited recipes with AI or search our curated database.",
    creator: siteConfig.socialMedia.twitter,
    images: [`${siteUrl}/og-image.svg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/ai-chef"),
  },
}

// AI Chef Schema
const aiChefSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Chef",
  description: "Smart recipe generator powered by AI",
  applicationCategory: "Productivity",
  url: `${siteUrl}/ai-chef`,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

export default function AIChefPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiChefSchema) }}
        suppressHydrationWarning
      />
      <AIChefPageNew />
    </>
  )
}
