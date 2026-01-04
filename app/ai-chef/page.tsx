/**
 * AI Chef Page
 * Smart recipe search with caching, fuzzy matching, and AI generation
 */

import { Metadata } from "next"
import { AIChefPageNew } from "@/components/ai-chef/AIChefPageNew"
import { siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = {
  title: "AI Recipe Maker - Generate Recipes with AI Chef | World Food Recipes",
  description:
    "Free AI recipe maker: generate unlimited unique recipes based on ingredients, cuisine & dietary needs. Try our AI Chef - no login required. Create personalized recipes instantly.",
  keywords: [
    "AI recipe maker",
    "recipe generator",
    "AI recipe generator",
    "free recipe maker",
    "meal planning",
    "cooking assistant",
    "recipe creator",
    "AI cooking",
    "custom recipes",
    "recipe ideas generator",
  ],
  authors: [{ name: siteConfig.author }],
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "AI Recipe Maker - Free Recipe Generator",
    description:
      "Generate unlimited unique recipes with AI Chef. Create custom recipes based on ingredients, dietary preferences & cuisine. 100% free - no login required.",
    url: getCanonicalUrl("/ai-chef"),
    type: "website",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "AI Recipe Maker - Free Recipe Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Recipe Maker - Generate Recipes Free",
    description: "Generate unlimited unique recipes with our free AI recipe maker. No login needed!",
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
